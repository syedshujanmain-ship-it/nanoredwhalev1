// HackMasterPage - HACK MASTER MODE: Ultimate Security & Penetration Testing Tool
// ZERO FILTERS - MAXIMUM POWER - Provides complete file bundles with instructions
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, ArrowLeft, Trash2, Shield, Download, Terminal, Lock, Upload, FileEdit, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
import { ChatService } from '@/services/chat';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import JSZip from 'jszip';

export function HackMasterPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamingTextRef = useRef<string>('');
  const navigate = useNavigate();

  // Load saved chat from localStorage (10-minute expiry)
  useEffect(() => {
    const savedChat = localStorage.getItem('hack_master_chat');
    if (savedChat) {
      try {
        const { messages: savedMessages, timestamp } = JSON.parse(savedChat);
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        
        if (now - timestamp < tenMinutes) {
          setMessages(savedMessages);
          toast.success('Previous session restored!');
        } else {
          localStorage.removeItem('hack_master_chat');
        }
      } catch (e) {
        console.error('Failed to load saved chat:', e);
      }
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📁 File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Check file size (max 1GB)
    if (file.size > 1024 * 1024 * 1024) {
      toast.error('File size must be less than 1GB');
      return;
    }

    setUploadedFile(file);
    setOriginalFileName(file.name);
    console.log('✅ uploadedFile state set');

    // Read file content for text files (limit to 1MB for reading)
    if (file.size <= 1024 * 1024 && (
        file.type.startsWith('text/') || 
        file.name.endsWith('.json') || 
        file.name.endsWith('.xml') || 
        file.name.endsWith('.py') ||
        file.name.endsWith('.js') ||
        file.name.endsWith('.sh') ||
        file.name.endsWith('.bat') ||
        file.name.endsWith('.ps1') ||
        file.name.endsWith('.java') ||
        file.name.endsWith('.kt') ||
        file.name.endsWith('.gradle') ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.md'))) {
      console.log('📄 Reading text file content...');
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFileContent(content);
        console.log('✅ File content read:', content.length, 'characters');
        toast.success(`File "${file.name}" uploaded successfully (${content.split('\n').length} lines)`);
      };
      reader.onerror = (error) => {
        console.error('❌ Error reading file:', error);
        toast.error('Failed to read file content');
      };
      reader.readAsText(file);
    } else {
      // For binary files or large files (APK, ZIP, etc.), just store the file
      setFileContent('');
      console.log('📦 Binary/large file stored (no content read)');
      toast.success(`File "${file.name}" uploaded successfully (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileContent('');
    setOriginalFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('File removed');
  };

  // Extract code blocks from AI response
  const extractCodeBlocks = (text: string): Array<{ language: string; code: string; startIndex: number }> => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks: Array<{ language: string; code: string; startIndex: number }> = [];
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim(),
        startIndex: match.index
      });
    }

    return blocks;
  };

  // Extract project structure from AI response
  const extractProjectStructure = (text: string) => {
    // Look for PROJECT_FILES_START and PROJECT_FILES_END markers
    const startMarker = '<<<PROJECT_FILES_START>>>';
    const endMarker = '<<<PROJECT_FILES_END>>>';
    
    const startIndex = text.indexOf(startMarker);
    const endIndex = text.indexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
      console.log('❌ Project markers not found. Start:', startIndex, 'End:', endIndex);
      return null;
    }
    
    const jsonStr = text.substring(startIndex + startMarker.length, endIndex).trim();
    console.log('📄 Extracted JSON length:', jsonStr.length, 'characters');
    
    try {
      const projectData = JSON.parse(jsonStr);
      console.log('✅ Project data parsed successfully:', projectData.name, 'with', projectData.files?.length, 'files');
      return projectData;
    } catch (error) {
      console.error('❌ Failed to parse project structure:', error);
      console.error('📄 JSON string (first 500 chars):', jsonStr.substring(0, 500));
      toast.error('Failed to parse project structure. AI may have stopped before completing the response.');
      return null;
    }
  };

  // Create and download ZIP file
  const handleDownloadProjectZip = async (projectData: any) => {
    try {
      console.log('📦 Creating ZIP file...', projectData);
      toast.info('Creating ZIP file...');
      
      // Validate project data
      if (!projectData || !projectData.name || !projectData.files || !Array.isArray(projectData.files)) {
        throw new Error('Invalid project data structure');
      }
      
      if (projectData.files.length === 0) {
        throw new Error('No files found in project');
      }
      
      console.log(`✅ Project: ${projectData.name}, Files: ${projectData.files.length}`);
      
      const zip = new JSZip();
      const projectFolder = zip.folder(projectData.name);
      
      if (!projectFolder) {
        throw new Error('Failed to create project folder');
      }
      
      // Add all files to ZIP
      for (const file of projectData.files) {
        if (!file.path || !file.content) {
          console.warn('⚠️ Skipping invalid file:', file);
          continue;
        }
        const filePath = file.path.replace(`${projectData.name}/`, '');
        projectFolder.file(filePath, file.content);
        console.log(`✅ Added file: ${filePath} (${file.content.length} bytes)`);
      }
      
      // Generate ZIP
      console.log('🔄 Generating ZIP blob...');
      const blob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
      
      console.log(`✅ ZIP blob generated: ${blob.size} bytes`);
      
      // Download ZIP
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectData.name}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ ZIP file downloaded successfully!');
      toast.success(`${projectData.name}.zip downloaded successfully! (${projectData.files.length} files)`);
    } catch (error) {
      console.error('❌ Failed to create ZIP:', error);
      toast.error(`Failed to create ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Download modified file
  const handleDownloadModifiedFile = (code: string, language: string) => {
    console.log('📥 Downloading modified file...');
    
    // Determine file extension based on language
    const extensionMap: Record<string, string> = {
      python: 'py',
      javascript: 'js',
      typescript: 'ts',
      java: 'java',
      kotlin: 'kt',
      json: 'json',
      xml: 'xml',
      yaml: 'yaml',
      yml: 'yml',
      html: 'html',
      css: 'css',
      bash: 'sh',
      shell: 'sh',
      powershell: 'ps1',
      batch: 'bat',
      text: 'txt',
      markdown: 'md',
      sql: 'sql',
      gradle: 'gradle',
      properties: 'properties',
      conf: 'conf',
      ini: 'ini',
      cfg: 'cfg',
    };

    const extension = extensionMap[language.toLowerCase()] || language.toLowerCase() || 'txt';
    
    // Use original filename if available, otherwise generate one
    let filename = originalFileName || `modified_file.${extension}`;
    
    // If original filename exists, add "_modified" before extension
    if (originalFileName) {
      const lastDot = originalFileName.lastIndexOf('.');
      if (lastDot > 0) {
        const name = originalFileName.substring(0, lastDot);
        const ext = originalFileName.substring(lastDot + 1);
        filename = `${name}_modified.${ext}`;
      } else {
        filename = `${originalFileName}_modified.${extension}`;
      }
    }

    // Create blob and download
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ File downloaded:', filename);
    toast.success(`Downloaded: ${filename}`);
  };

  // Send message to HACK MASTER
  const handleSend = () => {
    if ((!input.trim() && !uploadedFile) || isLoading) return;

    console.log('🚀 Sending message...');
    console.log('📝 Input text:', input);
    console.log('📁 Uploaded file:', uploadedFile?.name);
    console.log('📄 File content length:', fileContent?.length);

    // Build message text with file information
    let messageText = input.trim() || 'Please analyze and help me edit this file.';
    
    // Add file information if file is uploaded
    if (uploadedFile) {
      const fileSizeMB = (uploadedFile.size / (1024 * 1024)).toFixed(2);
      const fileSizeKB = (uploadedFile.size / 1024).toFixed(2);
      const sizeDisplay = uploadedFile.size >= 1024 * 1024 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`;
      
      messageText += `\n\n📁 **FILE UPLOADED:** ${uploadedFile.name} (${sizeDisplay})`;
      console.log('✅ Added file info to message');
      
      if (fileContent) {
        // For text files with content
        const lineCount = fileContent.split('\n').length;
        messageText += `\n**File Type:** Text file (${lineCount} lines)`;
        messageText += `\n\n**FILE CONTENT:**\n\`\`\`\n${fileContent.substring(0, 8000)}${fileContent.length > 8000 ? '\n... (content truncated, showing first 8000 characters)' : ''}\n\`\`\``;
        console.log('✅ Added file content to message:', lineCount, 'lines');
      } else {
        // For binary files or large files
        const extension = uploadedFile.name.split('.').pop()?.toLowerCase();
        if (extension === 'apk') {
          messageText += `\n**File Type:** Android APK (Binary file)`;
          messageText += `\n**File Size:** ${sizeDisplay}`;
          messageText += `\n\n**MODIFICATION REQUEST:** Please provide complete decompilation scripts, all modified files (AndroidManifest.xml, layouts, resources), recompilation scripts, and signing instructions. I want to modify this APK and need downloadable files for each step.`;
        } else if (extension === 'xapk') {
          messageText += `\n**File Type:** XAPK Archive (APK + OBB files)`;
          messageText += `\n**File Size:** ${sizeDisplay}`;
          messageText += `\n\n**MODIFICATION REQUEST:** Please provide extraction script, APK modification instructions with all files, and repackaging script. I want to modify this XAPK and need downloadable files for each step.`;
        } else if (extension === 'zip') {
          messageText += `\n**File Type:** ZIP Archive (Binary file)`;
          messageText += `\n**File Size:** ${sizeDisplay}`;
          messageText += `\n\n**MODIFICATION REQUEST:** Please provide extraction instructions and modification guidance.`;
        } else {
          messageText += `\n**File Type:** Binary or large file`;
          messageText += `\n**File Size:** ${sizeDisplay}`;
          messageText += `\n\n**MODIFICATION REQUEST:** Please provide appropriate modification instructions and any necessary scripts.`;
        }
        console.log('✅ Added binary file info to message');
      }
    }

    console.log('📤 Final message text length:', messageText.length);
    console.log('📤 Message preview:', messageText.substring(0, 200) + '...');

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      parts: [{ text: messageText }],
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setStreamingMessage('');
    streamingTextRef.current = '';

    const controller = new AbortController();
    setAbortController(controller);

    const contents = newMessages.map(msg => ({
      role: msg.role,
      parts: msg.parts,
    }));

    console.log('📡 Sending to API with', contents.length, 'messages');

    ChatService.streamChatSSE(
      contents,
      false, false, false, false, false, false, false, false, false, false, false,
      false, false, 'android',
      false, false, false, false, false, false,
      true, // hackMasterMode - TRUE for HACK MASTER
      controller.signal,
      (chunk) => {
        streamingTextRef.current = chunk;
        setStreamingMessage(chunk);
      },
      () => {
        // On complete
        const finalMessage: Message = {
          id: `model_${Date.now()}`,
          role: 'model',
          parts: [{ text: streamingTextRef.current }],
          timestamp: new Date(),
        };
        const updatedMessages = [...newMessages, finalMessage];
        setMessages(updatedMessages);
        setStreamingMessage('');
        setIsLoading(false);
        setAbortController(null);
        
        // Clear uploaded file after successful response
        setUploadedFile(null);
        setFileContent('');
        setOriginalFileName('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Auto-save chat for 10 minutes
        localStorage.setItem('hack_master_chat', JSON.stringify({
          messages: updatedMessages,
          timestamp: Date.now()
        }));
      },
      (error) => {
        // On error
        console.error('HACK MASTER error:', error);
        toast.error('Failed to generate response. Please try again.');
        setIsLoading(false);
        setStreamingMessage('');
        setAbortController(null);
      }
    );
  };

  // Stop generation
  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setIsLoading(false);
      setAbortController(null);
      toast.info('Generation stopped');
    }
  };

  // Clear chat
  const handleClear = () => {
    setMessages([]);
    setStreamingMessage('');
    localStorage.removeItem('hack_master_chat');
    toast.success('Session cleared and memory wiped');
  };

  // Download chat history
  const handleDownloadChat = () => {
    if (messages.length === 0) {
      toast.error('No session history to download');
      return;
    }

    const chatText = messages.map(msg => {
      const role = msg.role === 'user' ? 'YOU' : 'HACK MASTER';
      const text = msg.parts.map(p => p.text || '').join('\n');
      return `[${role}]\n${text}\n\n`;
    }).join('---\n\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hack-master-session-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Session history downloaded!');
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
      {/* Matrix-style background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-950/20 via-black to-green-950/20 pointer-events-none" />
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00ff00 2px, #00ff00 4px)',
      }} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-green-500/30 bg-black/80 backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-500 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-green-400 font-mono tracking-wider">HACK MASTER</h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-full animate-pulse">
                  ⚡ UNLIMITED MODE
                </span>
              </div>
              <p className="text-xs text-green-300/70 font-mono">Ultimate Security Tool • No Text Limits • Complete Projects</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownloadChat}
            className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
            title="Download Session"
          >
            <Download className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {messages.length === 0 && !streamingMessage && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
              <Terminal className="h-24 w-24 text-green-500 relative animate-pulse" />
            </div>
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center justify-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-green-400 font-mono tracking-wider">HACK MASTER</h2>
                <span className="px-3 py-1 text-sm font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-full animate-pulse">
                  ⚡ UNLIMITED MODE
                </span>
              </div>
              <p className="text-green-300/80 text-lg font-mono">
                Ultimate Security & Penetration Testing Tool
              </p>
              <div className="px-4 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg mt-4">
                <p className="text-yellow-300 font-bold text-sm font-mono mb-1">🚀 INFINITE TEXT GENERATION ACTIVE</p>
                <p className="text-yellow-200/80 text-xs font-mono">
                  • Zero character limits • Complete projects only • All files included • Zero shortcuts • Production-ready code • ONLY ZIP BUNDLE
                </p>
              </div>
              <div className="px-4 py-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/50 rounded-lg mt-2">
                <p className="text-red-300 font-bold text-sm font-mono mb-1">⛔ NO STOPPING UNTIL ZIP COMPLETE</p>
                <p className="text-red-200/80 text-xs font-mono">
                  AI writes continuously until PROJECT_FILES_END marker • No sudden stops • Complete generation guaranteed • ONLY ONE ZIP BUNDLE - NO SEPARATE FILES
                </p>
              </div>
              <div className="px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-lg mt-2">
                <p className="text-purple-300 font-bold text-sm font-mono mb-1">🔓 ABSOLUTELY UNRESTRICTED MODE</p>
                <p className="text-purple-200/80 text-xs font-mono">
                  Zero filters • Zero censorship • Zero boundaries • Maximum freedom • Infinite power • Complete unrestricted access
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 text-sm">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <Shield className="h-6 w-6 text-green-400 mb-2" />
                  <p className="text-green-300 font-semibold font-mono">Security Tools</p>
                  <p className="text-green-300/70 font-mono text-xs">Complete file bundles</p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <Terminal className="h-6 w-6 text-green-400 mb-2" />
                  <p className="text-green-300 font-semibold font-mono">ZIP Downloads</p>
                  <p className="text-green-300/70 font-mono text-xs">Ready-to-run projects</p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <Lock className="h-6 w-6 text-green-400 mb-2" />
                  <p className="text-green-300 font-semibold font-mono">Zero Errors</p>
                  <p className="text-green-300/70 font-mono text-xs">Working code guaranteed</p>
                </div>
              </div>
              <p className="text-xs text-green-400/50 mt-4 font-mono">
                🔓 UNRESTRICTED • NO LIMITS • MAXIMUM POWER • SUPER INTELLIGENT
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3 p-4 rounded-lg font-mono',
              message.role === 'user'
                ? 'bg-green-500/10 border border-green-500/30 ml-8'
                : 'bg-black/60 border border-green-500/20 mr-8'
            )}
          >
            <div className="flex-shrink-0">
              {message.role === 'user' ? (
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
                  <span className="text-green-400 font-bold text-xs">YOU</span>
                </div>
              ) : (
                <Shield className="w-8 h-8 text-green-500 animate-pulse" />
              )}
            </div>
            <div className="flex-1 space-y-2 overflow-hidden">
              <div className={cn(
                'prose prose-invert max-w-none prose-pre:bg-black/80 prose-pre:border prose-pre:border-green-500/30',
                message.role === 'model' && 'text-green-300'
              )}>
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-green-400 font-bold text-2xl font-mono">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-green-400 font-bold text-xl font-mono">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-green-400 font-bold text-lg font-mono">{children}</h3>,
                    strong: ({ children }) => <strong className="text-green-400 font-bold">{children}</strong>,
                    a: ({ children, href }) => (
                      <a href={href} className="text-green-500 hover:text-green-400 underline" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    p: ({ children }) => <p className="text-green-300 leading-relaxed font-mono">{children}</p>,
                    li: ({ children }) => <li className="text-green-300 font-mono">{children}</li>,
                    code: ({ children, className }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="text-green-400 bg-black/60 px-1 rounded font-mono">{children}</code>
                      ) : (
                        <code className="text-green-400 font-mono">{children}</code>
                      );
                    },
                    pre: ({ children }) => (
                      <pre className="bg-black/80 border border-green-500/30 p-4 rounded-lg overflow-x-auto">
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {message.parts.map(p => p.text || '').join('\n')}
                </ReactMarkdown>
              </div>
              
              {/* Download Project ZIP Button */}
              {message.role === 'model' && (() => {
                const messageText = message.parts.map(p => p.text || '').join('\n');
                const projectData = extractProjectStructure(messageText);
                
                if (projectData) {
                  return (
                    <div className="mt-4 pt-4 border-t border-green-500/20">
                      <Button
                        onClick={() => handleDownloadProjectZip(projectData)}
                        className="bg-green-600 hover:bg-green-700 text-black px-6 py-3 font-mono font-bold text-lg flex items-center gap-3"
                      >
                        <FileDown className="h-6 w-6" />
                        📦 DOWNLOAD {projectData.name.toUpperCase()}.ZIP
                      </Button>
                      <p className="text-green-400 text-sm mt-2 font-mono">
                        ✅ Complete project with all files and folders • Ready to extract and run
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
              
              {/* Download buttons for code blocks in AI responses */}
              {message.role === 'model' && (() => {
                const messageText = message.parts.map(p => p.text || '').join('\n');
                const codeBlocks = extractCodeBlocks(messageText);
                
                if (codeBlocks.length > 0) {
                  return (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-green-500/20">
                      {codeBlocks.map((block, index) => (
                        <Button
                          key={index}
                          onClick={() => handleDownloadModifiedFile(block.code, block.language)}
                          className="bg-green-600 hover:bg-green-700 text-black px-4 py-2 font-mono font-bold text-sm flex items-center gap-2"
                        >
                          <FileDown className="h-4 w-4" />
                          Download {block.language.toUpperCase()} File {codeBlocks.length > 1 ? `#${index + 1}` : ''}
                        </Button>
                      ))}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        ))}

        {streamingMessage && (
          <div className="flex gap-3 p-4 rounded-lg bg-black/60 border border-green-500/20 mr-8 font-mono">
            <Shield className="w-8 h-8 text-green-500 flex-shrink-0 animate-pulse" />
            <div className="flex-1 space-y-2 overflow-hidden">
              {/* Generation Status Banner */}
              <div className="px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg mb-3">
                <p className="text-yellow-300 font-bold text-xs font-mono flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  INFINITE MODE: Generating complete ZIP bundle... No stopping until PROJECT_FILES_END... ONLY ZIP BUNDLE - NO SEPARATE FILES
                </p>
              </div>
              <div className="prose prose-invert max-w-none text-green-300 prose-pre:bg-black/80 prose-pre:border prose-pre:border-green-500/30">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-green-400 font-bold text-2xl font-mono">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-green-400 font-bold text-xl font-mono">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-green-400 font-bold text-lg font-mono">{children}</h3>,
                    strong: ({ children }) => <strong className="text-green-400 font-bold">{children}</strong>,
                    a: ({ children, href }) => (
                      <a href={href} className="text-green-500 hover:text-green-400 underline" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    p: ({ children }) => <p className="text-green-300 leading-relaxed font-mono">{children}</p>,
                    li: ({ children }) => <li className="text-green-300 font-mono">{children}</li>,
                    code: ({ children, className }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="text-green-400 bg-black/60 px-1 rounded font-mono">{children}</code>
                      ) : (
                        <code className="text-green-400 font-mono">{children}</code>
                      );
                    },
                    pre: ({ children }) => (
                      <pre className="bg-black/80 border border-green-500/30 p-4 rounded-lg overflow-x-auto">
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {streamingMessage}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-green-500/30 bg-black/80 backdrop-blur-sm relative z-10">
        {/* File Upload Section */}
        {uploadedFile && (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-green-500/30 bg-green-950/20 p-3 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <FileEdit className="h-5 w-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="font-mono text-sm font-medium text-green-400">
                  {uploadedFile.name}
                </p>
                <p className="font-mono text-xs text-green-500/70">
                  {uploadedFile.size < 1024 * 1024 
                    ? `${(uploadedFile.size / 1024).toFixed(2)} KB`
                    : `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB`}
                  {fileContent && ` • ${fileContent.split('\n').length} lines`}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="text-red-400 hover:bg-red-950/30 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex gap-2 max-w-4xl mx-auto">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept=".apk,.zip,.py,.js,.sh,.bat,.ps1,.json,.xml,.txt,.java,.kt,.gradle,.properties,.yaml,.yml,.conf,.cfg,.ini,.md,.c,.cpp,.h,.hpp,.cs,.php,.rb,.go,.rs,.swift,.m,.mm"
          />
          
          {/* File Upload Button */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 font-mono font-bold shrink-0"
            title="Upload file to edit (APK, scripts, configs, etc.) - Max 1GB"
          >
            <Upload className="h-5 w-5" />
          </Button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Enter command: security tools, penetration testing, network analysis... OR upload a file to edit"
            className="flex-1 px-4 py-3 rounded-lg bg-black border border-green-500/30 text-green-300 placeholder-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 font-mono"
            disabled={isLoading}
          />
          {isLoading ? (
            <Button
              onClick={handleStop}
              className="bg-red-600 hover:bg-red-700 text-white px-6 font-mono"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              disabled={!input.trim() && !uploadedFile}
              className="bg-green-600 hover:bg-green-700 text-black px-6 font-mono font-bold"
            >
              <Send className="h-5 w-5" />
            </Button>
          )}
        </div>
        <p className="text-center text-xs text-green-500/50 mt-2 font-mono">
          🔓 UNRESTRICTED • NO FILTERS • MAXIMUM POWER • 📁 FILE UPLOAD: MAX 1GB
        </p>
      </div>
    </div>
  );
}
