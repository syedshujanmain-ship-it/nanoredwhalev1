// HowToBuildPage - HOW TO BUILD MODE: Complete step-by-step building guide
// Tells how to make ANYTHING with materials, assembly, troubleshooting, cost & time
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, ArrowLeft, Trash2, Wrench, Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
import { ChatService } from '@/services/chat';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';

export function HowToBuildPage() {
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
    const savedChat = localStorage.getItem('how_to_build_chat');
    if (savedChat) {
      try {
        const { messages: savedMessages, timestamp } = JSON.parse(savedChat);
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        
        if (now - timestamp < tenMinutes) {
          setMessages(savedMessages);
          toast.success('Previous chat restored!');
        } else {
          localStorage.removeItem('how_to_build_chat');
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

  // Send message to HOW TO BUILD
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

    // Create abort controller
    const controller = new AbortController();
    setAbortController(controller);

    // Build contents for API
    const contents = newMessages.map((msg) => ({
      role: msg.role,
      parts: msg.parts,
    }));

    ChatService.streamChatSSE(
      contents,
      false, false, false, false, false, false, false, false, false, false, false,
      false, false, 'android',
      true,  // howToBuildMode - TRUE for HOW TO BUILD
      false, false, false, false, false, false, // All other modes false
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
        
        // Auto-save chat for 10 minutes
        localStorage.setItem('how_to_build_chat', JSON.stringify({
          messages: updatedMessages,
          timestamp: Date.now()
        }));
      },
      (error) => {
        // On error
        console.error('HOW TO BUILD error:', error);
        toast.error('Failed to generate guide. Please try again.');
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
    localStorage.removeItem('how_to_build_chat');
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
      doc.text('HOW TO BUILD - Red Whale V1', margin, 20);
      
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
          `Page ${i} of ${totalPages} | Created by Red Whale V1 - How To Build`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' as const }
        );
      }
      
      doc.save(`how-to-build-${Date.now()}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/30 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-black text-purple-400 tracking-wider flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              HOW TO BUILD
            </h1>
            <p className="text-[10px] text-purple-600 font-semibold">Complete Step-by-Step Building Guide for Anything</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto px-4 py-6 space-y-4"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-2xl animate-pulse">
                <Wrench className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-purple-400 mb-2">HOW TO BUILD</h2>
                <p className="text-sm text-purple-600 max-w-md">
                  Tell me what you want to build and I'll give you a complete, beginner-friendly guide!
                </p>
              </div>
              <div className="text-xs text-purple-700 space-y-1 max-w-lg">
                <p className="font-bold text-purple-500 mb-2">🔧 WHAT I PROVIDE:</p>
                <p>✅ Complete materials/items list with specifications</p>
                <p>✅ Step-by-step assembly instructions (beginner-friendly)</p>
                <p>✅ How it works explanation</p>
                <p>✅ Troubleshooting guide if it doesn't work</p>
                <p>✅ Cost estimation in INR (₹)</p>
                <p>✅ Time estimation for completion</p>
                <p>✅ Safety tips and precautions</p>
                <p className="mt-2 text-purple-600">Example: "How to build a toy car" or "How to make a robot"</p>
              </div>
            </div>
          )}

          {/* Display messages */}
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3 p-4 rounded-lg',
                msg.role === 'user'
                  ? 'bg-purple-900/30 border border-purple-500/30 ml-12'
                  : 'bg-gray-900/50 border border-purple-500/20 mr-12'
              )}
            >
              <div className="flex-shrink-0">
                {msg.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    U
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="prose prose-invert prose-purple max-w-none text-sm">
                  <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                </div>
                {msg.role === 'model' && msg.parts[0]?.text && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(msg.parts[0].text || '', index)}
                      className="h-7 text-xs bg-purple-900/30 border-purple-500/30 hover:bg-purple-800/40"
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
                      className="h-7 text-xs bg-purple-900/30 border-purple-500/30 hover:bg-purple-800/40"
                    >
                      <Download className="w-3 h-3 mr-1" /> PDF
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Streaming message */}
          {isLoading && streamingMessage && (
            <div className="flex gap-3 p-4 rounded-lg bg-gray-900/50 border border-purple-500/20 mr-12">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center animate-pulse">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="prose prose-invert prose-purple max-w-none text-sm">
                  <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && !streamingMessage && (
            <div className="flex gap-3 p-4 rounded-lg bg-gray-900/50 border border-purple-500/20 mr-12">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center animate-pulse">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-purple-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating complete building guide...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-purple-500/30 bg-black/50 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-3">
            <Wrench className="w-5 h-5 text-purple-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="What do you want to build? (e.g., toy car, robot, wooden shelf...)"
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none text-sm text-purple-300 placeholder:text-purple-800"
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
                className="h-8 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-[10px] text-purple-700 text-center mt-2">
            💡 Get complete materials list, assembly steps, troubleshooting, cost & time estimates
          </p>
        </div>
      </div>
    </div>
  );
}
