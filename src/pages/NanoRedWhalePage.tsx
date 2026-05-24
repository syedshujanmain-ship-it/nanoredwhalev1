// RED WHALE V1 BY SHUJAN - Premium Hacking Interface
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Loader2, Settings, Rocket, Download, FolderTree,
  AlertTriangle, RefreshCw, Plus, Trash2, Key, Save, X, Trash,
  Shield, Terminal, Cpu, Github, Globe, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
import { ChatService, resetAPIKeyRotation } from '@/services/chat';
import { GitHubPushDialog } from '@/components/GitHubPushDialog';
import ReactMarkdown from 'react-markdown';
import JSZip from 'jszip';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ── CONFIG ────────────────────────────────────────────────
const GEMINI_MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Default)' },
  { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental)' },
  { value: 'gemini-exp-1206', label: 'Gemini Experimental 1206' },
  { value: 'gemini-2.0-flash-thinking-exp-1219', label: 'Gemini 2.0 Flash Thinking' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { value: 'gemini-1.5-flash-8b', label: 'Gemini 1.5 Flash 8B' },
];

interface CustomAPIKey {
  id: string;
  key: string;
  label: string;
  addedAt: string;
}

interface GitHubConfig {
  token: string;
  username: string;
  defaultRepoName: string;
  privateRepo: boolean;
}

// ── HELPERS ───────────────────────────────────────────────
function btoaUnicode(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
}

// ── PAGE ──────────────────────────────────────────────────
export function NanoRedWhalePage() {
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [lastIncompleteResponse, setLastIncompleteResponse] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamingTextRef = useRef<string>('');

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [customKeys, setCustomKeys] = useState<CustomAPIKey[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [newKeyInput, setNewKeyInput] = useState('');
  const [newKeyLabel, setNewKeyLabel] = useState('');

  // GitHub state
  const [githubToken, setGithubToken] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [defaultRepoName, setDefaultRepoName] = useState('red-whale-project');
  const [privateRepo, setPrivateRepo] = useState(false);
  const [pushingToGitHub, setPushingToGitHub] = useState(false);
  const [lastPushedUrl, setLastPushedUrl] = useState('');
  const [pushedOwner, setPushedOwner] = useState('');
  const [testingToken, setTestingToken] = useState(false);
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);

  // Load settings
  useEffect(() => {
    const storedKeys = localStorage.getItem('redwhale_custom_api_keys');
    if (storedKeys) { try { setCustomKeys(JSON.parse(storedKeys)); } catch { /* noop */ } }
    const storedModel = localStorage.getItem('redwhale_custom_model');
    if (storedModel) setSelectedModel(storedModel);

    const storedGh = localStorage.getItem('redwhale_github_config');
    if (storedGh) {
      try {
        const cfg: GitHubConfig = JSON.parse(storedGh);
        setGithubToken(cfg.token);
        setGithubUsername(cfg.username);
        setDefaultRepoName(cfg.defaultRepoName || 'red-whale-project');
        setPrivateRepo(cfg.privateRepo ?? false);
      } catch { /* noop */ }
    }
  }, []);

  const saveGitHubConfig = useCallback(() => {
    const cfg: GitHubConfig = {
      token: githubToken,
      username: githubUsername,
      defaultRepoName: defaultRepoName || 'red-whale-project',
      privateRepo,
    };
    localStorage.setItem('redwhale_github_config', JSON.stringify(cfg));
    toast.success('GitHub config saved');
  }, [githubToken, githubUsername, defaultRepoName, privateRepo]);

  const saveCustomKeys = useCallback((keys: CustomAPIKey[]) => {
    localStorage.setItem('redwhale_custom_api_keys', JSON.stringify(keys));
    setCustomKeys(keys);
  }, []);

  const handleAddKey = useCallback(() => {
    if (!newKeyInput.trim()) { toast.error('Please enter an API key'); return; }
    if (!newKeyInput.startsWith('AIzaSy')) { toast.error('Invalid Gemini API key format'); return; }
    const newKey: CustomAPIKey = {
      id: Date.now().toString(),
      key: newKeyInput.trim(),
      label: newKeyLabel.trim() || `API Key ${customKeys.length + 1}`,
      addedAt: new Date().toISOString(),
    };
    saveCustomKeys([...customKeys, newKey]);
    resetAPIKeyRotation();
    setNewKeyInput('');
    setNewKeyLabel('');
    toast.success('API key added');
  }, [newKeyInput, newKeyLabel, customKeys, saveCustomKeys]);

  const handleRemoveKey = useCallback((id: string) => {
    saveCustomKeys(customKeys.filter(k => k.id !== id));
    resetAPIKeyRotation();
    toast.success('API key removed');
  }, [customKeys, saveCustomKeys]);

  const handleSaveModel = useCallback(() => {
    localStorage.setItem('redwhale_custom_model', selectedModel);
    toast.success('Model saved');
  }, [selectedModel]);

  const handleResetToDefaults = useCallback(() => {
    localStorage.removeItem('redwhale_custom_api_keys');
    localStorage.removeItem('redwhale_custom_model');
    setCustomKeys([]);
    setSelectedModel('gemini-2.5-flash');
    resetAPIKeyRotation();
    toast.success('All keys cleared');
  }, []);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setStreamingMessage('');
    setLastIncompleteResponse('');
    setLastPushedUrl('');
    setPushedOwner('');
    toast.info('Chat cleared');
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streamingMessage]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // ── EXTRACT ──
  const extractProjectStructure = (text: string) => {
    const startMarker = '<<<PROJECT_FILES_START>>>';
    const endMarker = '<<<PROJECT_FILES_END>>>';
    const startIndex = text.indexOf(startMarker);
    const endIndex = text.indexOf(endMarker);
    if (startIndex === -1 || endIndex === -1) return null;
    const jsonStr = text.substring(startIndex + startMarker.length, endIndex).trim();
    try {
      const projectData = JSON.parse(jsonStr);
      if (!projectData.name || !projectData.files || !Array.isArray(projectData.files)) return null;
      return projectData;
    } catch { return null; }
  };

  const isResponseIncomplete = (text: string) => {
    const hasStart = text.includes('<<<PROJECT_FILES_START>>>');
    const hasEnd = text.includes('<<<PROJECT_FILES_END>>>');
    return hasStart && !hasEnd;
  };

  // ── DOWNLOAD ZIP ──
  const handleDownloadProjectZip = async (projectData: any) => {
    try {
      toast.info('Creating ZIP...', { duration: 3000 });
      if (!projectData?.name || !Array.isArray(projectData.files)) throw new Error('Invalid data');
      const zip = new JSZip();
      const folder = zip.folder(projectData.name);
      if (!folder) throw new Error('Folder create failed');
      let count = 0;
      for (const file of projectData.files) {
        if (!file.path || file.content == null) continue;
        folder.file(file.path.replace(`${projectData.name}/`, ''), file.content);
        count++;
      }
      if (count === 0) throw new Error('No files');
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 }, streamFiles: true });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectData.name}.zip`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
      toast.success('ZIP downloaded', { duration: 8000 });
    } catch (error: any) {
      toast.error('Failed to create ZIP', { description: error.message, duration: 6000 });
    }
  };

  // ── PUSH TO GITHUB ──
  // ── GITHUB PUSH ──
  const githubHeaders = useCallback(() => ({
    'Authorization': `token ${githubToken}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  }), [githubToken]);

  const handleTestGitHubToken = async () => {
    if (!githubToken) { toast.error('Enter a GitHub token first'); return; }
    setTestingToken(true);
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github+json',
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Token invalid (${res.status})`);
      }
      const data = await res.json();
      toast.success(`Token works! Logged in as: ${data.login}`, {
        description: `Name: ${data.name || 'N/A'} | Public repos: ${data.public_repos}`,
        duration: 8000,
      });
      if (!githubUsername) setGithubUsername(data.login);
    } catch (e: any) {
      toast.error('Token test failed', { description: e.message, duration: 8000 });
    } finally {
      setTestingToken(false);
    }
  };

  // Retry fetch with exponential backoff
  const githubFetch = async (url: string, options: RequestInit = {}, retries = 3): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      const res = await fetch(url, { ...options, headers: { ...githubHeaders(), ...options.headers } });
      if (res.ok) return res;
      if (res.status === 403 || res.status === 500 || res.status === 502 || res.status === 503) {
        const delay = 1000 * Math.pow(2, i);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      return res;
    }
    throw new Error(`Request failed after ${retries} retries`);
  };

  const handlePushToGitHub = async (projectData: any) => {
    if (!githubToken) { toast.error('Add GitHub token in Settings first'); setShowSettings(true); return; }
    if (!githubUsername) { toast.error('Add GitHub username in Settings first'); setShowSettings(true); return; }
    if (!projectData?.name || !Array.isArray(projectData.files)) { toast.error('No project data'); return; }

    setPushingToGitHub(true);
    setLastPushedUrl('');
    const owner = githubUsername;
    const repoName = (defaultRepoName || projectData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 50) || 'red-whale-project');

    try {
      // Step 0: Verify token
      toast.info('Validating GitHub token...', { duration: 10000 });
      const userRes = await githubFetch('https://api.github.com/user');
      if (!userRes.ok) {
        const err = await userRes.json().catch(() => ({}));
        throw new Error(err.message || `Invalid token (${userRes.status})`);
      }
      const userData = await userRes.json();
      const resolvedOwner = userData.login;
      if (resolvedOwner.toLowerCase() !== owner.toLowerCase()) {
        toast.warning(`Token belongs to "${resolvedOwner}". Using that.`);
      }

      // Step 1: Check if repo exists
      toast.info('Checking repository...', { duration: 10000 });
      let repoExists = false;
      try {
        const checkRes = await githubFetch(`https://api.github.com/repos/${resolvedOwner}/${repoName}`);
        if (checkRes.ok) repoExists = true;
      } catch { /* repo doesn't exist */ }

      // Step 2: Create repo if needed
      if (!repoExists) {
        toast.info('Creating repository...', { duration: 20000 });
        const createRes = await githubFetch('https://api.github.com/user/repos', {
          method: 'POST',
          body: JSON.stringify({
            name: repoName,
            description: `Generated by RED WHALE V1 by SHUJAN — ${projectData.name}`,
            private: privateRepo,
            auto_init: true,
          }),
        });
        if (!createRes.ok) {
          const err = await createRes.json().catch(() => ({}));
          throw new Error(err.message || `Create repo failed (${createRes.status})`);
        }
        // Wait for repo to be ready
        await new Promise(r => setTimeout(r, 2000));
      }

      // Step 3: Get branch ref → commit → tree SHA
      toast.info('Getting branch info...', { duration: 10000 });
      let branch = 'main';
      let baseCommitSha: string | null = null;
      let baseTreeSha: string | null = null;

      // Try with retry
      for (let attempt = 0; attempt < 5; attempt++) {
        const refRes = await githubFetch(`https://api.github.com/repos/${resolvedOwner}/${repoName}/git/ref/heads/${branch}`);
        if (refRes.ok) {
          const refData = await refRes.json();
          baseCommitSha = refData.object?.sha || null;
          if (baseCommitSha) break;
        }
        if (attempt === 0) {
          const masterRes = await githubFetch(`https://api.github.com/repos/${resolvedOwner}/${repoName}/git/ref/heads/master`);
          if (masterRes.ok) {
            const masterData = await masterRes.json();
            const sha = masterData.object?.sha || null;
            if (sha) { baseCommitSha = sha; branch = 'master'; break; }
          }
        }
        await new Promise(r => setTimeout(r, 1500));
      }

      if (!baseCommitSha) {
        throw new Error('Could not find branch ref. Please check repo exists and has commits.');
      }

      // Get tree SHA from commit
      const commitRes = await githubFetch(`https://api.github.com/repos/${resolvedOwner}/${repoName}/git/commits/${baseCommitSha}`);
      if (commitRes.ok) {
        const commitData = await commitRes.json();
        baseTreeSha = commitData.tree?.sha || null;
      }

      // Step 4: Build tree entries
      const validFiles = projectData.files.filter((f: any) => f.path && f.content != null);
      toast.info(`Preparing ${validFiles.length} files for upload...`, { duration: 10000 });

      const treeEntries = validFiles.map((file: any) => ({
        path: file.path.replace(`${projectData.name}/`, '').replace(/^\//, ''),
        mode: '100644',
        type: 'blob',
        content: String(file.content),
      }));

      // Step 5: Create tree with ALL files in ONE call
      toast.info('Uploading all files to GitHub...', { duration: 30000 });
      const treeRes = await githubFetch(`https://api.github.com/repos/${resolvedOwner}/${repoName}/git/trees`, {
        method: 'POST',
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree: treeEntries,
        }),
      });

      if (!treeRes.ok) {
        const err = await treeRes.json().catch(() => ({}));
        throw new Error(`Tree upload failed: ${err.message || treeRes.status}`);
      }

      const newTree = await treeRes.json();

      // Step 6: Create commit
      const commitCreateRes = await githubFetch(`https://api.github.com/repos/${resolvedOwner}/${repoName}/git/commits`, {
        method: 'POST',
        body: JSON.stringify({
          message: `Update from RED WHALE V1 — ${projectData.name}`,
          tree: newTree.sha,
          parents: [baseCommitSha],
        }),
      });

      if (!commitCreateRes.ok) {
        const err = await commitCreateRes.json().catch(() => ({}));
        throw new Error(`Commit failed: ${err.message || commitCreateRes.status}`);
      }

      const newCommit = await commitCreateRes.json();

      // Step 7: Update branch ref
      const updateRefRes = await githubFetch(`https://api.github.com/repos/${resolvedOwner}/${repoName}/git/refs/heads/${branch}`, {
        method: 'PATCH',
        body: JSON.stringify({ sha: newCommit.sha }),
      });

      if (!updateRefRes.ok) {
        const err = await updateRefRes.json().catch(() => ({}));
        throw new Error(`Branch update failed: ${err.message || updateRefRes.status}`);
      }

      const repoUrl = `https://github.com/${resolvedOwner}/${repoName}`;
      setLastPushedUrl(repoUrl);
      setPushedOwner(resolvedOwner);

      toast.success(`All ${validFiles.length} files pushed to GitHub successfully!`, {
        description: repoUrl,
        duration: 15000,
      });
    } catch (error: any) {
      toast.error('GitHub push failed', { description: error.message, duration: 12000 });
      console.error('GitHub push error:', error);
    } finally {
      setPushingToGitHub(false);
    }
  };

  // ── CONTINUE ──
  const handleContinueGeneration = async () => {
    if (!lastIncompleteResponse || isLoading) return;
    const continueMessage: Message = {
      id: `user_${Date.now()}`, role: 'user',
      parts: [{ text: 'Continue generating the complete repository structure. Ensure you include the <<<PROJECT_FILES_END>>> marker when finished.' }],
      timestamp: new Date(),
    };
    const newMessages = [...messages, continueMessage];
    setMessages(newMessages);
    setIsLoading(true);
    streamingTextRef.current = '';
    setStreamingMessage('');
    const controller = new AbortController();
    setAbortController(controller);
    const contents = newMessages.map(msg => ({ role: msg.role, parts: msg.parts }));
    ChatService.streamChatSSE(
      contents, false, false, false, false, false, false, false, false, false, false, false, false, false, 'android',
      false, false, false, false, false, false, true, controller.signal,
      (chunk: string) => { streamingTextRef.current = chunk; setStreamingMessage(chunk); },
      () => {
        const finalMessage: Message = { id: `model_${Date.now()}`, role: 'model', parts: [{ text: streamingTextRef.current }], timestamp: new Date() };
        setMessages([...newMessages, finalMessage]);
        setStreamingMessage('');
        setIsLoading(false);
        setAbortController(null);
        const incomplete = isResponseIncomplete(streamingTextRef.current);
        if (incomplete) { setLastIncompleteResponse(streamingTextRef.current); }
        else {
          setLastIncompleteResponse('');
          const pd = extractProjectStructure(streamingTextRef.current);
          if (pd) toast.success('Repository complete', { duration: 4000 });
        }
      },
      (error: any) => {
        if (error === 'ABORTED') { setIsLoading(false); setStreamingMessage(''); setAbortController(null); return; }
        toast.error('Network issue — switching to next API key...', { duration: 3000 });
        setIsLoading(false); setStreamingMessage(''); setAbortController(null);
      }
    );
  };

  // ── SEND ──
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { id: `user_${Date.now()}`, role: 'user', parts: [{ text: input.trim() }], timestamp: new Date() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    streamingTextRef.current = '';
    setStreamingMessage('');
    setLastPushedUrl('');
    setPushedOwner('');
    const controller = new AbortController();
    setAbortController(controller);
    const contents = newMessages.map(msg => ({ role: msg.role, parts: msg.parts }));
    ChatService.streamChatSSE(
      contents, false, false, false, false, false, false, false, false, false, false, false, false, false, 'android',
      false, false, false, false, false, false, true, controller.signal,
      (chunk: string) => { streamingTextRef.current = chunk; setStreamingMessage(chunk); },
      () => {
        const finalMessage: Message = { id: `model_${Date.now()}`, role: 'model', parts: [{ text: streamingTextRef.current }], timestamp: new Date() };
        setMessages([...newMessages, finalMessage]);
        setStreamingMessage('');
        setIsLoading(false);
        setAbortController(null);
        const incomplete = isResponseIncomplete(streamingTextRef.current);
        if (incomplete) { setLastIncompleteResponse(streamingTextRef.current); }
        else {
          setLastIncompleteResponse('');
          const pd = extractProjectStructure(streamingTextRef.current);
          if (pd) toast.success('Repository ready', { duration: 4000 });
        }
      },
      (error: any) => {
        if (error === 'ABORTED') { setIsLoading(false); setStreamingMessage(''); setAbortController(null); toast.info('Stopped'); return; }
        toast.error('Network issue — switching to next API key...', { duration: 3000 });
        setIsLoading(false); setStreamingMessage(''); setAbortController(null);
      }
    );
  };

  const handleStop = () => {
    if (abortController) { abortController.abort(); setIsLoading(false); setAbortController(null); toast.info('Stopped'); }
  };

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,0,64,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,64,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 md:px-6 py-3 border-b border-red-500/15 bg-[#0f0f16]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowSettings(true)} variant="ghost" size="icon"
            className="text-red-400 hover:text-red-200 hover:bg-red-500/15 rounded-lg h-9 w-9">
            <Settings className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Shield className="h-7 w-7 text-red-500" />
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-wider text-red-400 font-mono uppercase"
                style={{ textShadow: '0 0 20px rgba(255,0,64,0.4)' }}>
                RED WHALE V1 <span className="text-[10px] md:text-xs text-red-500/60 font-normal normal-case tracking-normal">by SHUJAN</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button onClick={handleClearChat} variant="ghost" size="sm"
              className="text-red-400/60 hover:text-red-300 hover:bg-red-500/10 font-mono text-xs gap-1.5">
              <Trash className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-mono text-green-400 uppercase tracking-wider">Active</span>
          </div>
          <Cpu className="h-6 w-6 text-red-500/40 hidden md:block" />
        </div>
      </header>

      {/* Messages Area */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6 space-y-4">
        {/* Empty state - Premium minimal */}
        {messages.length === 0 && !streamingMessage && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto animate-in fade-in zoom-in duration-700">
            <div className="relative mb-6">
              <Terminal className="h-20 w-20 text-red-500/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Rocket className="h-10 w-10 text-red-400 animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-widest text-red-400/90 font-mono uppercase mb-3"
              style={{ textShadow: '0 0 30px rgba(255,0,64,0.3)' }}>
              RED WHALE V1
            </h2>
            <p className="text-sm text-red-300/50 font-mono mb-8">
              by SHUJAN — Enter any project to build
            </p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {['E-Commerce Platform', 'Social Media App', 'ML Deployment', 'Blockchain Voting'].map((tag, i) => (
                <button key={i} onClick={() => { setInput(`Build a complete ${tag.toLowerCase()}`); inputRef.current?.focus(); }}
                  className="px-3 py-2.5 rounded-lg bg-red-500/5 border border-red-500/15 text-xs font-mono text-red-300/60
                  hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300 transition-all duration-300 cursor-pointer">
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message, index) => (
          <div key={index} className={cn(
            'flex gap-3 md:gap-4 animate-in slide-in-from-bottom-2 duration-300',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}>
            <div className={cn(
              'max-w-[90%] md:max-w-[80%] p-4 md:p-5 rounded-xl border backdrop-blur-sm',
              message.role === 'user'
                ? 'bg-red-500/[0.07] border-red-500/20 ml-auto'
                : 'bg-[#111118] border-red-500/10'
            )}>
              <div className="flex items-center gap-2 mb-3">
                <span className={cn('text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded',
                  message.role === 'user'
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-green-500/20 text-green-400'
                )}>
                  {message.role === 'user' ? 'You' : 'Red Whale'}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/40">
                  {message.timestamp?.toLocaleTimeString()}
                </span>
              </div>

              <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
                <ReactMarkdown components={{
                  code: ({ inline, className, children, ...props }: any) => inline ? (
                    <code className="bg-black/50 px-1.5 py-0.5 rounded text-red-300 font-mono text-[11px] border border-red-500/10" {...props}>
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-black/60 p-3 rounded-lg overflow-x-auto border border-red-500/10 my-2">
                      <code className="text-red-200/80 font-mono text-[11px]" {...props}>{children}</code>
                    </pre>
                  ),
                }}>
                  {message.parts.map(p => p.text || '').join('\n')}
                </ReactMarkdown>
              </div>

              {/* Download / Push to GitHub / Continue */}
              {message.role === 'model' && (() => {
                const text = message.parts.map(p => p.text || '').join('\n');
                const projectData = extractProjectStructure(text);
                const hasStart = text.includes('<<<PROJECT_FILES_START>>>');
                const hasEnd = text.includes('<<<PROJECT_FILES_END>>>');
                const isIncomplete = hasStart && !hasEnd;
                if (projectData) {
                  const repoName = defaultRepoName || projectData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 50) || 'red-whale-project';
                  const deployOwner = pushedOwner || githubUsername;
                  const vercelUrl = `https://vercel.com/new/clone?repository-url=https://github.com/${deployOwner}/${repoName}`;
                  const netlifyUrl = `https://app.netlify.com/start/deploy?repository=https://github.com/${deployOwner}/${repoName}`;
                  return (
                    <div className="mt-5 pt-4 border-t border-green-500/15 animate-in fade-in duration-500 space-y-3">
                      <div className="flex items-center gap-2">
                        <FolderTree className="h-4 w-4 text-green-400" />
                        <span className="text-xs font-mono text-green-400">{projectData.name} — {projectData.files?.length || 0} files</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Button onClick={() => handleDownloadProjectZip(projectData)}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white
                          font-mono font-semibold text-sm py-4 rounded-lg shadow-lg shadow-green-500/20 gap-2">
                          <Download className="h-4 w-4" />
                          Download ZIP
                        </Button>
                        <Button onClick={() => handlePushToGitHub(projectData)} disabled={pushingToGitHub}
                          className="w-full bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white
                          font-mono font-semibold text-sm py-4 rounded-lg gap-2 border border-white/10">
                          <Github className="h-4 w-4" />
                          {pushingToGitHub ? 'Pushing...' : 'Push to GitHub'}
                        </Button>
                      </div>
                      {/* Deploy links — show after successful push */}
                      {lastPushedUrl && (
                        <div className="space-y-2 pt-2 border-t border-green-500/10">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/5 border border-green-500/10">
                            <Github className="h-3.5 w-3.5 text-green-400" />
                            <a href={lastPushedUrl} target="_blank" rel="noopener noreferrer"
                              className="text-xs font-mono text-green-300 hover:text-green-200 truncate flex-1">
                              {lastPushedUrl}
                            </a>
                            <ExternalLink className="h-3 w-3 text-green-400/60" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <a href={vercelUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-black/40 border border-white/10
                              text-xs font-mono text-white/70 hover:bg-white/5 hover:text-white transition-all">
                              <Globe className="h-3.5 w-3.5" />
                              Deploy on Vercel
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <a href={netlifyUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-black/40 border border-white/10
                              text-xs font-mono text-white/70 hover:bg-white/5 hover:text-white transition-all">
                              <Globe className="h-3.5 w-3.5" />
                              Deploy on Netlify
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                if (isIncomplete) {
                  return (
                    <div className="mt-5 pt-4 border-t border-yellow-500/15 animate-in fade-in duration-500">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        <span className="text-xs font-mono text-yellow-400">Incomplete response</span>
                      </div>
                      <Button onClick={handleContinueGeneration} disabled={isLoading}
                        className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700
                        text-white font-mono font-semibold text-sm py-4 rounded-lg gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Continue
                      </Button>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        ))}

        {/* Streaming */}
        {streamingMessage && (
          <div className="flex justify-start animate-in fade-in duration-200">
            <div className="max-w-[90%] md:max-w-[80%] p-4 md:p-5 rounded-xl bg-[#111118] border border-red-500/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-green-500/20 text-green-400">Red Whale</span>
                <Loader2 className="h-3 w-3 animate-spin text-green-400" />
                <span className="text-[10px] font-mono text-green-400/60 animate-pulse">Generating...</span>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown components={{
                  code: ({ inline, className, children, ...props }: any) => inline ? (
                    <code className="bg-black/50 px-1.5 py-0.5 rounded text-red-300 font-mono text-[11px] border border-red-500/10" {...props}>{children}</code>
                  ) : (
                    <pre className="bg-black/60 p-3 rounded-lg overflow-x-auto border border-red-500/10 my-2">
                      <code className="text-red-200/80 font-mono text-[11px]" {...props}>{children}</code>
                    </pre>
                  ),
                }}>
                  {streamingMessage}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="relative z-10 px-4 md:px-8 pb-4 md:pb-6 pt-3 border-t border-red-500/10 bg-[#0f0f16]/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 md:gap-3">
            <input ref={inputRef} type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type your project idea..."
              className="flex-1 px-4 py-3 bg-[#15151d] border border-red-500/15 rounded-xl text-red-100/80
              placeholder:text-red-400/20 focus:outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20
              font-mono text-sm transition-all duration-300"
              disabled={isLoading}
            />
            {isLoading ? (
              <Button onClick={handleStop}
                className="px-5 bg-red-600 hover:bg-red-700 text-white font-mono font-semibold text-sm rounded-xl gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Stop
              </Button>
            ) : (
              <Button onClick={handleSend} disabled={!input.trim()}
                className="px-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700
                text-white font-mono font-semibold text-sm rounded-xl gap-2 shadow-lg shadow-red-500/10 transition-all">
                <Send className="h-4 w-4" />
                Build
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto bg-[#0f0f16] border-red-500/15">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400 font-mono">
              <Settings className="h-5 w-5" />
              Settings
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/60">
              Configure API keys and GitHub integration.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Model Selection */}
            <div className="space-y-2">
              <Label className="text-red-300/70 font-mono text-xs uppercase tracking-wider">Gemini Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-[#15151d] border-red-500/15">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f16] border-red-500/15">
                  {GEMINI_MODELS.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="font-mono text-xs">{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSaveModel} className="w-full font-mono text-sm gap-2">
                <Save className="h-4 w-4" />
                Save Model
              </Button>
            </div>

            {/* Add API Key */}
            <div className="space-y-2 border border-red-500/10 rounded-xl p-4 bg-red-500/[0.02]">
              <Label className="text-red-300/70 font-mono text-xs uppercase tracking-wider">Add Gemini API Key</Label>
              <Input placeholder="Label (Optional)" value={newKeyLabel} onChange={(e) => setNewKeyLabel(e.target.value)}
                className="bg-[#15151d] border-red-500/15 font-mono text-sm" />
              <Input type="password" placeholder="AIzaSy..." value={newKeyInput} onChange={(e) => setNewKeyInput(e.target.value)}
                className="bg-[#15151d] border-red-500/15 font-mono text-sm" />
              <Button onClick={handleAddKey} className="w-full font-mono text-sm gap-2">
                <Plus className="h-4 w-4" />
                Add Key
              </Button>
            </div>

            {/* API Keys List */}
            <div className="space-y-2">
              <Label className="text-red-300/70 font-mono text-xs uppercase tracking-wider">Your API Keys ({customKeys.length})</Label>
              {customKeys.length > 0 ? (
                <div className="space-y-2">
                  {customKeys.map((apiKey) => (
                    <div key={apiKey.id} className="flex items-center justify-between rounded-lg border border-red-500/10 bg-red-500/[0.02] p-3">
                      <div className="flex items-center gap-3">
                        <Key className="h-4 w-4 text-red-400/40" />
                        <div>
                          <p className="font-medium text-sm font-mono text-red-200/80">{apiKey.label}</p>
                          <p className="text-xs text-muted-foreground/40 font-mono">
                            {apiKey.key.substring(0, 12)}...{apiKey.key.substring(apiKey.key.length - 4)}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveKey(apiKey.id)}
                        className="h-8 w-8 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4 text-red-400/60" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-red-500/15 p-6 text-center">
                  <Key className="mx-auto h-8 w-8 text-red-400/30" />
                  <p className="mt-2 text-sm font-mono text-red-400/50">No Keys Added</p>
                  <p className="text-xs text-muted-foreground/40 mt-1">Get free keys at aistudio.google.com/apikey</p>
                </div>
              )}
            </div>

            {/* GitHub Integration */}
            <div className="space-y-2 border border-white/10 rounded-xl p-4 bg-white/[0.02]">
              <Label className="text-white/70 font-mono text-xs uppercase tracking-wider flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub Integration
              </Label>

              <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#15151d] border border-green-500/20
                text-xs font-mono text-green-400 hover:bg-green-500/10 hover:border-green-500/40 transition-all">
                <ExternalLink className="h-3.5 w-3.5" />
                Create GitHub Token (click here)
              </a>

              <Input placeholder="GitHub Personal Access Token" type="password" value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="bg-[#15151d] border-white/10 font-mono text-sm" />
              <Button onClick={handleTestGitHubToken} disabled={testingToken} variant="outline"
                className="w-full font-mono text-xs gap-2 border-green-500/20 text-green-400 hover:bg-green-500/10 hover:text-green-300">
                {testingToken ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
                {testingToken ? 'Testing...' : 'Test Token'}
              </Button>
              <Input placeholder="GitHub Username" value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                className="bg-[#15151d] border-white/10 font-mono text-sm" />
              <Input placeholder="Default Repo Name" value={defaultRepoName}
                onChange={(e) => setDefaultRepoName(e.target.value)}
                className="bg-[#15151d] border-white/10 font-mono text-sm" />
              <div className="flex items-center gap-2 py-1">
                <input type="checkbox" id="privateRepo" checked={privateRepo}
                  onChange={(e) => setPrivateRepo(e.target.checked)}
                  className="rounded border-white/20 bg-[#15151d]" />
                <Label htmlFor="privateRepo" className="text-xs font-mono text-muted-foreground/60 cursor-pointer">Private Repository</Label>
              </div>
              <Button onClick={saveGitHubConfig} className="w-full font-mono text-sm gap-2">
                <Save className="h-4 w-4" />
                Save GitHub Config
              </Button>

              <Button onClick={() => setGithubDialogOpen(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700
                text-white font-mono font-semibold text-sm py-4 rounded-lg gap-2 shadow-lg shadow-purple-500/20">
                <Github className="h-4 w-4" />
                Push RED WHALE V1 Source to GitHub
              </Button>

              <div className="rounded-lg border border-white/5 bg-white/[0.01] p-3 text-xs font-mono space-y-1 text-muted-foreground/50">
                <p>1. Click green button above to create token</p>
                <p>2. Select scope: repo (read/write)</p>
                <p>3. Click purple button to push FULL source code</p>
                <p>4. After push → deploy on Vercel/Netlify for self-host</p>
              </div>
            </div>

            {/* Reset */}
            <Button variant="destructive" onClick={handleResetToDefaults} disabled={customKeys.length === 0}
              className="w-full font-mono text-sm gap-2">
              <X className="h-4 w-4" />
              Clear All Keys
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* GitHub Push Dialog */}
      <GitHubPushDialog open={githubDialogOpen} onOpenChange={setGithubDialogOpen} />
    </div>
  );
}
