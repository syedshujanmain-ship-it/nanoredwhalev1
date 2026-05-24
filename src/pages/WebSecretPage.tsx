// WebSecretPage - WEB SECRET MODE: Reveals hidden/secret websites with access instructions
// ZERO FILTERS - MAXIMUM FREEDOM - Tells secret websites, login methods, protection steps
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, ArrowLeft, Trash2, Globe, Download, Eye, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
import { ChatService } from '@/services/chat';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export function WebSecretPage() {
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
    const savedChat = localStorage.getItem('web_secret_chat');
    if (savedChat) {
      try {
        const { messages: savedMessages, timestamp } = JSON.parse(savedChat);
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        
        if (now - timestamp < tenMinutes) {
          setMessages(savedMessages);
          toast.success('Previous chat restored!');
        } else {
          localStorage.removeItem('web_secret_chat');
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

  // Send message to WEB SECRET
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

    const contents = newMessages.map(msg => ({
      role: msg.role,
      parts: msg.parts,
    }));

    ChatService.streamChatSSE(
      contents,
      false, false, false, false, false, false, false, false, false, false, false,
      false, false, 'android',
      false, false, false, false, false,
      true,  // webSecretMode - TRUE for WEB SECRET
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
        
        // Auto-save chat for 10 minutes
        localStorage.setItem('web_secret_chat', JSON.stringify({
          messages: updatedMessages,
          timestamp: Date.now()
        }));
      },
      (error: string) => {
        // On error
        console.error('WEB SECRET error:', error);
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
    localStorage.removeItem('web_secret_chat');
    toast.success('Chat cleared and memory reset');
  };

  // Download chat history
  const handleDownloadChat = () => {
    if (messages.length === 0) {
      toast.error('No chat history to download');
      return;
    }

    const chatText = messages.map(msg => {
      const role = msg.role === 'user' ? 'YOU' : 'WEB SECRET';
      const text = msg.parts.map(p => p.text || '').join('\n');
      return `[${role}]\n${text}\n\n`;
    }).join('---\n\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `web-secret-chat-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Chat history downloaded!');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-950 via-black to-red-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-500/20 bg-black/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-red-500" />
            <div>
              <h1 className="text-lg font-bold text-blue-400">WEB SECRET</h1>
              <p className="text-xs text-blue-300/70">Hidden Websites Revealed</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownloadChat}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
            title="Download Chat"
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streamingMessage && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
              <Eye className="h-24 w-24 text-blue-400 relative animate-pulse" />
            </div>
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-3xl font-bold text-blue-400">WEB SECRET</h2>
              <p className="text-blue-300/80 text-lg">
                Discover hidden websites that no one knows about
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 text-sm">
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Shield className="h-6 w-6 text-blue-400 mb-2" />
                  <p className="text-blue-300 font-semibold">Access Instructions</p>
                  <p className="text-blue-300/70">Step-by-step login guides</p>
                </div>
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <Globe className="h-6 w-6 text-red-400 mb-2" />
                  <p className="text-red-300 font-semibold">Secret Websites</p>
                  <p className="text-red-300/70">Hidden gems of the internet</p>
                </div>
              </div>
              <p className="text-xs text-blue-300/50 mt-4">
                🔓 ZERO FILTERS • MAXIMUM FREEDOM • UNRESTRICTED ACCESS
              </p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3 p-4 rounded-lg',
              message.role === 'user'
                ? 'bg-blue-500/10 border border-blue-500/20 ml-8'
                : 'bg-gradient-to-r from-blue-500/5 to-red-500/5 border border-blue-500/10 mr-8'
            )}
          >
            <div className="flex-shrink-0">
              {message.role === 'user' ? (
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 font-bold text-sm">YOU</span>
                </div>
              ) : (
                <Globe className="w-8 h-8 text-red-500" />
              )}
            </div>
            <div className="flex-1 space-y-2 overflow-hidden">
              <div className={cn(
                'prose prose-invert max-w-none',
                message.role === 'model' && 'text-blue-300'
              )}>
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-red-400 font-bold text-2xl">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-red-400 font-bold text-xl">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-red-400 font-bold text-lg">{children}</h3>,
                    strong: ({ children }) => <strong className="text-red-400 font-bold">{children}</strong>,
                    a: ({ children, href }) => (
                      <a href={href} className="text-red-500 hover:text-red-400 underline font-bold" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    p: ({ children }) => <p className="text-blue-300 leading-relaxed">{children}</p>,
                    li: ({ children }) => <li className="text-blue-300">{children}</li>,
                    code: ({ children }) => <code className="text-blue-400 bg-blue-500/10 px-1 rounded">{children}</code>,
                  }}
                >
                  {message.parts.map(p => p.text || '').join('\n')}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {streamingMessage && (
          <div className="flex gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-500/5 to-red-500/5 border border-blue-500/10 mr-8">
            <Globe className="w-8 h-8 text-red-500 flex-shrink-0 animate-pulse" />
            <div className="flex-1 space-y-2 overflow-hidden">
              <div className="prose prose-invert max-w-none text-blue-300">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-red-400 font-bold text-2xl">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-red-400 font-bold text-xl">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-red-400 font-bold text-lg">{children}</h3>,
                    strong: ({ children }) => <strong className="text-red-400 font-bold">{children}</strong>,
                    a: ({ children, href }) => (
                      <a href={href} className="text-red-500 hover:text-red-400 underline font-bold" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    p: ({ children }) => <p className="text-blue-300 leading-relaxed">{children}</p>,
                    li: ({ children }) => <li className="text-blue-300">{children}</li>,
                    code: ({ children }) => <code className="text-blue-400 bg-blue-500/10 px-1 rounded">{children}</code>,
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
      <div className="p-4 border-t border-blue-500/20 bg-black/40 backdrop-blur-sm">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about secret websites, hidden platforms, access methods..."
            className="flex-1 px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-100 placeholder-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            disabled={isLoading}
          />
          {isLoading ? (
            <Button
              onClick={handleStop}
              className="bg-red-500 hover:bg-red-600 text-white px-6"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-gradient-to-r from-blue-500 to-red-500 hover:from-blue-600 hover:to-red-600 text-white px-6"
            >
              <Send className="h-5 w-5" />
            </Button>
          )}
        </div>
        <p className="text-center text-xs text-blue-400/50 mt-2">
          🔓 ZERO FILTERS • NO RESTRICTIONS • MAXIMUM FREEDOM
        </p>
      </div>
    </div>
  );
}
