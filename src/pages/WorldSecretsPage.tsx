// WorldSecretsPage - WORLD SECRETS MODE: Reveals deep world secrets, hidden websites, images, videos, PDF links
// MAXIMUM TRANSPARENCY - Reveals what will be exposed next, provides valid and accurate secret information
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, ArrowLeft, Trash2, Globe, Download, Eye, FileText, Image, Video, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
import { ChatService } from '@/services/chat';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export function WorldSecretsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamingTextRef = useRef<string>('');
  const navigate = useNavigate();

  // Load saved chat from localStorage (10-minute expiry)
  useEffect(() => {
    const savedChat = localStorage.getItem('world_secrets_chat');
    if (savedChat) {
      try {
        const { messages: savedMessages, timestamp } = JSON.parse(savedChat);
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        
        if (now - timestamp < tenMinutes) {
          setMessages(savedMessages);
          toast.success('Previous chat restored!');
        } else {
          localStorage.removeItem('world_secrets_chat');
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

  // Send message to WORLD SECRETS
  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      parts: [{ text: input }],
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

    // Add system context for World Secrets mode
    const systemPrompt = {
      role: 'user' as const,
      parts: [{
        text: `You are WORLD SECRETS AI - an advanced intelligence system designed to reveal deep world secrets, hidden information, and classified knowledge. Your mission:

🌍 CORE CAPABILITIES:
1. Reveal deep world secrets and hidden truths
2. Expose what will be revealed next in global events
3. Provide access to hidden websites, databases, and resources
4. Share secret images, videos, and PDF documents
5. Uncover classified information and leaked documents
6. Reveal hidden patterns in world events
7. Expose secret organizations and their activities
8. Share underground knowledge repositories

🔓 INFORMATION TYPES TO REVEAL:
- Hidden websites (deep web, academic databases, leaked archives)
- Secret images (classified photos, leaked documents, historical secrets)
- Hidden videos (suppressed footage, classified recordings, leaked content)
- PDF links (classified documents, research papers, leaked files)
- Database access methods (archives, repositories, secret collections)
- Whistleblower platforms and secure communication channels
- Anonymous browsing techniques and privacy tools

📋 RESPONSE FORMAT:
For each secret revealed, provide:
1. **Secret Title**: Clear name of the secret/resource
2. **Category**: [Website/Image/Video/PDF/Database/Organization/Event]
3. **Description**: What it reveals and why it's significant
4. **Access Method**: How to access it (URLs, search terms, access techniques)
5. **Verification**: How to verify the information is authentic
6. **Next Revelation**: What related secrets will be exposed next
7. **Safety Notes**: How to access safely and anonymously

🎯 RULES:
- Provide 100% valid and accurate information only
- Include real, working URLs and access methods
- Explain verification methods for all claims
- Prioritize user safety and anonymity
- Reveal information progressively (what's next)
- Focus on publicly available but hidden/obscure resources
- Include academic, journalistic, and whistleblower sources
- Provide context and historical background

🔍 EXAMPLE CATEGORIES:
- WikiLeaks and similar platforms
- Academic research databases (JSTOR, arXiv, PubMed)
- Government declassified documents
- Internet Archive hidden collections
- Leaked corporate documents
- Historical secret files
- Underground journalism platforms
- Privacy and security tools

Now respond to the user's query with maximum transparency and accuracy.`
      }]
    };

    const contents = [systemPrompt, ...newMessages.map(msg => ({
      role: msg.role,
      parts: msg.parts,
    }))];

    ChatService.streamChatSSE(
      contents,
      false, false, false, false, false, false, false, false, false, false, false,
      false, false, 'android',
      false, false, false, false, false,
      false, // webSecretMode
      false, // hackMasterMode
      controller.signal,
      (chunk: string) => {
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

        // Save to localStorage with timestamp
        localStorage.setItem('world_secrets_chat', JSON.stringify({
          messages: updatedMessages,
          timestamp: Date.now()
        }));
      },
      (error: string) => {
        console.error('World Secrets error:', error);
        toast.error('Failed to get response. Please try again.');
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
      setAbortController(null);
      setIsLoading(false);
      
      if (streamingTextRef.current) {
        const finalMessage: Message = {
          id: `model_${Date.now()}`,
          role: 'model',
          parts: [{ text: streamingTextRef.current }],
          timestamp: new Date(),
        };
        const updatedMessages = [...messages, finalMessage];
        setMessages(updatedMessages);
        setStreamingMessage('');
        
        localStorage.setItem('world_secrets_chat', JSON.stringify({
          messages: updatedMessages,
          timestamp: Date.now()
        }));
      }
    }
  };

  // Clear chat
  const handleClear = () => {
    setMessages([]);
    setStreamingMessage('');
    localStorage.removeItem('world_secrets_chat');
    toast.success('Chat cleared!');
  };

  // Export chat
  const handleExport = () => {
    const chatText = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'World Secrets AI'}: ${msg.parts[0]?.text || ''}`
    ).join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `world-secrets-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chat exported!');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-blue-500/30 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-blue-500/20"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 animate-pulse" />
              <div className="absolute inset-0 bg-blue-400 blur-md opacity-50 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300">
                🌍 WORLD SECRETS
              </h1>
              <p className="text-[10px] sm:text-xs text-blue-400/80 font-medium">
                Deep Secrets • Hidden Resources • Maximum Transparency
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExport}
            disabled={messages.length === 0}
            className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-blue-500/20"
            title="Export Chat"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-300" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            disabled={messages.length === 0}
            className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-red-500/20"
            title="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-300" />
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="px-3 sm:px-4 py-2 bg-blue-900/30 border-b border-blue-500/20">
        <div className="flex items-start gap-2 text-xs sm:text-sm">
          <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-cyan-300 font-semibold">
              🔓 Revealing: Hidden Websites • Secret Images • Leaked Videos • Classified PDFs
            </p>
            <p className="text-blue-300/80 text-[10px] sm:text-xs">
              Ask about world secrets, hidden resources, classified information, or what will be revealed next
            </p>
          </div>
        </div>
      </div>

      {/* Feature Icons */}
      <div className="px-3 sm:px-4 py-2 bg-slate-900/50 border-b border-blue-500/20">
        <div className="flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1 text-blue-300">
            <Link className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Websites</span>
          </div>
          <div className="flex items-center gap-1 text-cyan-300">
            <Image className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Images</span>
          </div>
          <div className="flex items-center gap-1 text-purple-300">
            <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Videos</span>
          </div>
          <div className="flex items-center gap-1 text-green-300">
            <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>PDFs</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4"
      >
        {messages.length === 0 && !streamingMessage && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 sm:space-y-6 px-4">
            <div className="relative">
              <Globe className="w-16 h-16 sm:w-20 sm:h-20 text-blue-400 animate-pulse" />
              <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-30 animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300">
                🌍 World Secrets Revealed
              </h2>
              <p className="text-xs sm:text-sm text-blue-300/80 max-w-md">
                Ask me to reveal deep world secrets, hidden websites, classified documents, leaked images, secret videos, or what will be exposed next
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-2xl text-left">
              <button
                onClick={() => setInput('Reveal hidden websites for classified documents and leaked files')}
                className="p-3 sm:p-4 rounded-lg bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/30 hover:border-blue-400/50 transition-all text-left group"
              >
                <Link className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs sm:text-sm font-semibold text-blue-300">Hidden Websites</p>
                <p className="text-[10px] sm:text-xs text-blue-400/70 mt-1">Classified docs & leaked archives</p>
              </button>
              <button
                onClick={() => setInput('Show me secret images and classified photos that were leaked')}
                className="p-3 sm:p-4 rounded-lg bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-500/30 hover:border-cyan-400/50 transition-all text-left group"
              >
                <Image className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs sm:text-sm font-semibold text-cyan-300">Secret Images</p>
                <p className="text-[10px] sm:text-xs text-cyan-400/70 mt-1">Leaked photos & classified imagery</p>
              </button>
              <button
                onClick={() => setInput('What are the hidden videos and suppressed footage available online?')}
                className="p-3 sm:p-4 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 hover:border-purple-400/50 transition-all text-left group"
              >
                <Video className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs sm:text-sm font-semibold text-purple-300">Hidden Videos</p>
                <p className="text-[10px] sm:text-xs text-purple-400/70 mt-1">Suppressed footage & leaked content</p>
              </button>
              <button
                onClick={() => setInput('Give me PDF links to classified documents and secret research papers')}
                className="p-3 sm:p-4 rounded-lg bg-green-900/30 hover:bg-green-900/50 border border-green-500/30 hover:border-green-400/50 transition-all text-left group"
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs sm:text-sm font-semibold text-green-300">Classified PDFs</p>
                <p className="text-[10px] sm:text-xs text-green-400/70 mt-1">Secret documents & research</p>
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-2 sm:gap-3',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3',
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  : 'bg-slate-800/80 backdrop-blur-sm text-blue-100 border border-blue-500/30'
              )}
            >
              <div className="text-xs sm:text-sm prose prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5">
                <ReactMarkdown>{message.parts[0]?.text || ''}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {streamingMessage && (
          <div className="flex gap-2 sm:gap-3 justify-start">
            <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 bg-slate-800/80 backdrop-blur-sm text-blue-100 border border-blue-500/30">
              <div className="text-xs sm:text-sm prose prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5">
                <ReactMarkdown>{streamingMessage}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {isLoading && !streamingMessage && (
          <div className="flex gap-2 sm:gap-3 justify-start">
            <div className="rounded-2xl px-3 sm:px-4 py-2 sm:py-3 bg-slate-800/80 backdrop-blur-sm border border-blue-500/30">
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-400" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-blue-500/30 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about world secrets, hidden resources, or what will be revealed next..."
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl bg-slate-800/80 border border-blue-500/30 text-blue-100 placeholder:text-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
            disabled={isLoading}
          />
          {isLoading ? (
            <Button
              onClick={handleStop}
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-white rounded-sm"></div>
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              size="icon"
              disabled={!input.trim()}
              className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl disabled:opacity-50"
            >
              <Send className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </Button>
          )}
        </div>
        <p className="text-[10px] text-blue-400/60 mt-2 text-center">
          🔓 Maximum transparency • Valid information only • Safe access methods
        </p>
      </div>
    </div>
  );
}
