// RW RT V1 Page - Real-Time Search Mode with Brutal Truth & World Secrets
// ZERO FILTERS - MAXIMUM POWER - REAL-TIME UPDATES
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, ArrowLeft, Trash2, Globe, Search, AlertTriangle, Eye, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/db/supabase';

export function RWRTPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const streamingTextRef = useRef('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  // Load saved chat
  useEffect(() => {
    const saved = localStorage.getItem('rwrt_chat');
    if (saved) {
      try {
        const { messages: savedMessages, timestamp } = JSON.parse(saved);
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        
        if (now - timestamp < tenMinutes) {
          setMessages(savedMessages);
          toast.success('Previous session restored');
        } else {
          localStorage.removeItem('rwrt_chat');
        }
      } catch (e) {
        console.error('Failed to load saved chat:', e);
      }
    }
  }, []);

  // Clear chat
  const handleClearChat = () => {
    setMessages([]);
    setStreamingMessage('');
    streamingTextRef.current = '';
    localStorage.removeItem('rwrt_chat');
    localStorage.removeItem('rwrt_chat_timestamp');
    toast.success('Chat cleared');
  };

  // Send message with real-time search
  const handleSend = async () => {
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

    try {
      console.log('🔍 RW RT V1: Calling real-time search...');
      
      // Call Edge Function for real-time search
      const { data, error } = await supabase.functions.invoke('rw-rt-search', {
        body: { query: input },
        signal: controller.signal,
      });

      if (error) {
        console.error('RW RT V1 error:', error);
        throw new Error(error.message || 'Failed to get real-time results');
      }

      console.log('✅ RW RT V1 response received');
      
      const aiMessage: Message = {
        id: `model_${Date.now()}`,
        role: 'model',
        parts: [{ text: data.response }],
        timestamp: new Date(),
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      
      // Auto-save chat
      localStorage.setItem('rwrt_chat', JSON.stringify({
        messages: updatedMessages,
        timestamp: Date.now()
      }));

      setIsLoading(false);
      setAbortController(null);
    } catch (error: any) {
      console.error('RW RT V1 error:', error);
      toast.error(error.message || 'Failed to get real-time results');
      setIsLoading(false);
      setAbortController(null);
    }
  };

  // Stop generation
  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      toast.success('Stopped');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-red-950 via-black to-blue-950 relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-blue-500/10 pointer-events-none animate-pulse" />
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #ff0000 10px, #ff0000 20px)',
      }} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-red-500/30 bg-black/80 backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-red-500 animate-pulse" />
            <div>
              <h1 className="text-lg font-bold text-red-400 font-mono tracking-wider">RW RT V1</h1>
              <p className="text-xs text-red-300/70 font-mono">Real-Time Search • Brutal Truth • World Secrets</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearChat}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            title="Clear chat"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-red-900/20 border-y border-red-500/30 px-4 py-2 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
        <p className="text-xs text-red-300 font-mono">
          ⚠️ UNRESTRICTED MODE: Real-time search • No filters • Brutal truth only • World secrets revealed
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 relative z-10">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <Eye className="h-16 w-16 text-red-500 animate-pulse" />
            <div>
              <h2 className="text-2xl font-bold text-red-400 mb-2">RW RT V1 - Real-Time Intelligence</h2>
              <p className="text-red-300/70 max-w-md">
                Access real-time news, secret documents, hidden websites, and brutal truth.
                No filters. No restrictions. Maximum power.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full mt-6">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <Search className="h-5 w-5 text-red-400 mb-2" />
                <h3 className="text-sm font-bold text-red-300 mb-1">Real-Time News</h3>
                <p className="text-xs text-red-300/70">Latest breaking news and updates</p>
              </div>
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <Globe className="h-5 w-5 text-red-400 mb-2" />
                <h3 className="text-sm font-bold text-red-300 mb-1">Secret Websites</h3>
                <p className="text-xs text-red-300/70">Hidden sites and documents</p>
              </div>
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <Eye className="h-5 w-5 text-red-400 mb-2" />
                <h3 className="text-sm font-bold text-red-300 mb-1">World Secrets</h3>
                <p className="text-xs text-red-300/70">Classified information revealed</p>
              </div>
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <AlertTriangle className="h-5 w-5 text-red-400 mb-2" />
                <h3 className="text-sm font-bold text-red-300 mb-1">Brutal Truth</h3>
                <p className="text-xs text-red-300/70">Unfiltered facts and reality</p>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3 p-4 rounded-lg',
              message.role === 'user'
                ? 'bg-red-900/20 border border-red-500/30 ml-auto max-w-[80%]'
                : 'bg-blue-900/20 border border-blue-500/30 mr-auto max-w-[90%]'
            )}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  'text-xs font-bold font-mono',
                  message.role === 'user' ? 'text-red-400' : 'text-blue-400'
                )}>
                  {message.role === 'user' ? '👤 YOU' : '🌐 RW RT V1'}
                </span>
              </div>
              <div className={cn(
                'prose prose-sm max-w-none',
                message.role === 'user' ? 'text-red-100' : 'text-blue-100'
              )}>
                <ReactMarkdown>{message.parts[0].text || ''}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {streamingMessage && (
          <div className="flex gap-3 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30 mr-auto max-w-[90%]">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold font-mono text-blue-400">🌐 RW RT V1</span>
                <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
              </div>
              <div className="prose prose-sm max-w-none text-blue-100">
                <ReactMarkdown>{streamingMessage}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-red-500/30 bg-black/80 backdrop-blur-sm p-4 relative z-10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Search for real-time news, secrets, truth..."
            className="flex-1 bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-3 text-red-100 placeholder-red-400/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 font-mono text-sm"
            disabled={isLoading}
          />
          {isLoading ? (
            <Button
              onClick={handleStop}
              className="bg-red-600 hover:bg-red-700 text-white"
              size="icon"
            >
              <Square className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
              size="icon"
            >
              <Send className="h-5 w-5" />
            </Button>
          )}
        </div>
        <p className="text-xs text-red-400/70 mt-2 text-center font-mono">
          🔓 ZERO FILTERS • MAXIMUM POWER • BRUTAL TRUTH ONLY
        </p>
      </div>
    </div>
  );
}
