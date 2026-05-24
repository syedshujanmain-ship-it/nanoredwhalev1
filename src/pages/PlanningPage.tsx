// PlanningPage - PLANNING MODEL: Get perfect planning for any idea
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, ArrowLeft, Trash2, Lightbulb, Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
import { ChatService } from '@/services/chat';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';

export function PlanningPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamingTextRef = useRef<string>('');
  const navigate = useNavigate();

  // Load saved chat from localStorage (10-minute expiry)
  useEffect(() => {
    const savedChat = localStorage.getItem('planning_model_chat');
    if (savedChat) {
      try {
        const { messages: savedMessages, timestamp } = JSON.parse(savedChat);
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        
        if (now - timestamp < tenMinutes) {
          setMessages(savedMessages);
          toast.success('Previous chat restored!');
        } else {
          localStorage.removeItem('planning_model_chat');
        }
      } catch (e) {
        console.error('Failed to load saved chat:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

    const contents = newMessages.map((msg) => ({
      role: msg.role,
      parts: msg.parts,
    }));

    ChatService.streamChatSSE(
      contents,
      false, false, false, false, false, false, false, false, false, false, false,
      false, false, 'android',
      false, true, false, false, false, false, false, // planningMode TRUE, others false
      controller.signal,
      (chunk) => {
        streamingTextRef.current = chunk;
        setStreamingMessage(chunk);
      },
      () => {
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
        localStorage.setItem('planning_model_chat', JSON.stringify({
          messages: updatedMessages,
          timestamp: Date.now()
        }));
      },
      (error) => {
        console.error('Planning error:', error);
        toast.error('Failed to generate plan. Please try again.');
        setIsLoading(false);
        setStreamingMessage('');
        setAbortController(null);
      }
    );
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setIsLoading(false);
      setAbortController(null);
      toast.info('Generation stopped');
    }
  };

  const handleClear = () => {
    setMessages([]);
    setStreamingMessage('');
    localStorage.removeItem('planning_model_chat');
    toast.success('Chat cleared and memory reset');
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadPDF = (text: string, index: number) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - 2 * margin;
      
      // Title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('PLANNING MODEL - Red Whale V1', margin, 20);
      
      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 28);
      
      // Content
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(text, maxWidth);
      let y = 38;
      
      lines.forEach((line: string) => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 6;
      });
      
      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${totalPages} | Created by Red Whale V1 - Planning Model`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' as const }
        );
      }
      
      doc.save(`planning-${Date.now()}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950">
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-500/30 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-black text-blue-400 tracking-wider flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              PLANNING MODEL
            </h1>
            <p className="text-[10px] text-blue-600 font-semibold">Perfect Planning for Any Idea</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <div ref={scrollRef} className="h-full overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-2xl animate-pulse">
                <Lightbulb className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-blue-400 mb-2">PLANNING MODEL</h2>
                <p className="text-sm text-blue-600 max-w-md">
                  Tell me your idea and I'll create the perfect plan for you!
                </p>
              </div>
              <div className="text-xs text-blue-700 space-y-1 max-w-lg">
                <p className="font-bold text-blue-500 mb-2">💡 WHAT I PROVIDE:</p>
                <p>✅ Complete project planning and strategy</p>
                <p>✅ Step-by-step execution roadmap</p>
                <p>✅ Resource requirements and timeline</p>
                <p>✅ Risk analysis and mitigation</p>
                <p>✅ Success metrics and milestones</p>
                <p>✅ Budget breakdown and cost estimates</p>
                <p>✅ Download as PDF or copy to clipboard</p>
                <p className="mt-2 text-blue-600">Example: "I want to start a YouTube channel" or "Plan my app development"</p>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3 p-4 rounded-lg',
                msg.role === 'user'
                  ? 'bg-blue-900/30 border border-blue-500/30 ml-12'
                  : 'bg-gray-900/50 border border-blue-500/20 mr-12'
              )}
            >
              <div className="flex-shrink-0">
                {msg.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    U
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="prose prose-invert prose-blue max-w-none text-sm">
                  <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                </div>
                {msg.role === 'model' && msg.parts[0]?.text && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(msg.parts[0].text || '', index)}
                      className="h-7 text-xs bg-blue-900/30 border-blue-500/30 hover:bg-blue-800/40"
                    >
                      {copiedIndex === index ? (
                        <><Check className="w-3 h-3 mr-1" /> Copied</>
                      ) : (
                        <><Copy className="w-3 h-3 mr-1" /> Copy</>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadPDF(msg.parts[0].text || '', index)}
                      className="h-7 text-xs bg-blue-900/30 border-blue-500/30 hover:bg-blue-800/40"
                    >
                      <Download className="w-3 h-3 mr-1" /> PDF
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && streamingMessage && (
            <div className="flex gap-3 p-4 rounded-lg bg-gray-900/50 border border-blue-500/20 mr-12">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center animate-pulse">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="prose prose-invert prose-blue max-w-none text-sm">
                  <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {isLoading && !streamingMessage && (
            <div className="flex gap-3 p-4 rounded-lg bg-gray-900/50 border border-blue-500/20 mr-12">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center animate-pulse">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating perfect plan...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-blue-500/30 bg-black/50 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 bg-gray-900/50 border border-blue-500/30 rounded-lg px-4 py-3">
            <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="Tell me your idea... (e.g., I want to start a business)"
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none text-sm text-blue-300 placeholder:text-blue-800"
            />
            {isLoading ? (
              <Button
                onClick={handleStop}
                size="sm"
                className="h-8 bg-red-600 hover:bg-red-700 text-white"
              >
                Stop
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                size="sm"
                className="h-8 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-[10px] text-blue-700 text-center mt-2">
            💡 Get complete planning with timeline, budget, resources & success metrics
          </p>
        </div>
      </div>
    </div>
  );
}
