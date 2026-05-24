// RWV1SuperPage - RW V1 SUPER: Ultimate combination of ALL modes
// The most powerful AI mode - combines all capabilities
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, ArrowLeft, Trash2, Zap, Download, Save, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
import { ChatService } from '@/services/chat';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';

export function RWV1SuperPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamingTextRef = useRef<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Load saved chat from localStorage (10-minute expiry)
    const savedChat = localStorage.getItem('rw_v1_super_chat');
    if (savedChat) {
      try {
        const { messages: savedMessages, timestamp } = JSON.parse(savedChat);
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        
        if (now - timestamp < tenMinutes) {
          setMessages(savedMessages);
          toast.success('Previous chat restored!');
        } else {
          localStorage.removeItem('rw_v1_super_chat');
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
      false, // howToBuildMode
      false, // planningMode
      false, // timetableMode
      false, // rwIntelligenceMode
      true,  // rwV1SuperMode - TRUE for RW V1 SUPER
      false, // webSecretMode
      false, // hackMasterMode
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
        
        // Auto-save after each response
        saveChat(updatedMessages);
      },
      (error) => {
        console.error('RW V1 SUPER error:', error);
        toast.error('Failed to generate response. Please try again.');
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
    localStorage.removeItem('rw_v1_super_chat');
    toast.success('Chat cleared and memory reset');
  };

  const saveChat = (messagesToSave?: Message[]) => {
    const chatData = {
      messages: messagesToSave || messages,
      timestamp: Date.now()
    };
    localStorage.setItem('rw_v1_super_chat', JSON.stringify(chatData));
    toast.success('Chat saved for 10 minutes!');
  };

  const downloadChat = () => {
    if (messages.length === 0) {
      toast.error('No chat to download!');
      return;
    }

    const chatText = messages.map(msg => {
      const role = msg.role === 'user' ? 'YOU' : 'RW V1 SUPER';
      const time = new Date(msg.timestamp).toLocaleString();
      return `[${time}] ${role}:\n${msg.parts[0].text}\n\n`;
    }).join('---\n\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rw-v1-super-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chat downloaded!');
  };

  const generatePDF = () => {
    if (messages.length === 0) {
      toast.error('No content to generate PDF!');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - 2 * margin;
      
      // Premium header with rainbow gradient effect (simulated)
      const gradient = [[255, 0, 0], [255, 165, 0], [255, 255, 0], [0, 255, 0], [0, 0, 255], [75, 0, 130], [238, 130, 238]];
      let y = 0;
      gradient.forEach((color, i) => {
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(0, y, pageWidth, 6, 'F');
        y += 6;
      });
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('👑 RW V1 SUPER 👑', pageWidth / 2, 25, { align: 'center' as const });
      
      // Subtitle
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Ultimate Combination Mode - All Powers United', pageWidth / 2, 35, { align: 'center' as const });
      
      y = 50;
      doc.setTextColor(0, 0, 0);
      
      // Process each message
      messages.forEach((msg) => {
        if (y > pageHeight - 40) {
          doc.addPage();
          y = 20;
        }
        
        const role = msg.role === 'user' ? 'YOUR REQUEST' : 'RW V1 SUPER RESPONSE';
        const headerColor: [number, number, number] = msg.role === 'user' ? [59, 130, 246] : [220, 38, 38];
        
        doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
        doc.roundedRect(margin, y - 5, maxWidth, 10, 2, 2, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(role, margin + 3, y + 2);
        
        y += 12;
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        const lines = doc.splitTextToSize(msg.parts[0].text || '', maxWidth);
        lines.forEach((line: string) => {
          if (y > pageHeight - 30) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, margin, y);
          y += 5;
        });
        
        y += 8;
      });
      
      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(220, 38, 38);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'italic');
        doc.text(`Page ${i} of ${totalPages}`, margin, pageHeight - 12);
        doc.text('👑 Powered by RW V1 SUPER - Ultimate Mode', pageWidth - margin, pageHeight - 12, { align: 'right' as const });
      }
      
      doc.save(`rw-v1-super-${Date.now()}.pdf`);
      toast.success('🎉 Premium PDF generated!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-950 via-red-950 to-gray-950 relative">
      {/* Animated background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-yellow-500/10 to-red-500/10 animate-pulse pointer-events-none" />
      
      <div className="flex items-center justify-between px-4 py-3 border-b border-red-500/30 bg-black/50 backdrop-blur-sm relative z-10 shadow-lg shadow-red-500/20">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 tracking-wider flex items-center gap-2 animate-pulse">
              <Crown className="w-5 h-5 text-yellow-400" />
              RW V1 SUPER
              <Zap className="w-5 h-5 text-yellow-400" />
            </h1>
            <p className="text-[10px] text-red-600 font-semibold">Ultimate Combination Mode - All Powers United</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => saveChat()}
            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
            title="Save chat for 10 minutes"
          >
            <Save className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={downloadChat}
            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
            title="Download chat history"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative z-10">
        <div ref={scrollRef} className="h-full overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 via-yellow-500 to-red-600 flex items-center justify-center shadow-2xl animate-pulse">
                  <Crown className="w-16 h-16 text-white" />
                </div>
                <Zap className="w-10 h-10 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
                <Sparkles className="w-8 h-8 text-red-400 absolute -bottom-2 -left-2 animate-spin" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 mb-2 animate-pulse">
                  RW V1 SUPER
                </h2>
                <p className="text-sm text-red-600 max-w-2xl font-bold">
                  👑 The Ultimate Combination Mode - All Powers United 👑
                </p>
              </div>
              <div className="text-xs text-red-700 space-y-2 max-w-3xl">
                <p className="font-black text-red-400 mb-3 text-xl">⚡ ALL MODES COMBINED - ULTIMATE POWER ⚡</p>
                <div className="grid grid-cols-3 gap-3 text-left">
                  <div className="bg-red-900/20 p-3 rounded-lg border-2 border-red-500/50 shadow-lg shadow-red-500/20">
                    <p className="font-bold text-red-400">💬 Chat</p>
                    <p className="text-[10px]">Unlimited conversations</p>
                  </div>
                  <div className="bg-red-900/20 p-3 rounded-lg border-2 border-red-500/50 shadow-lg shadow-red-500/20">
                    <p className="font-bold text-red-400">⚡ Code</p>
                    <p className="text-[10px]">Generate any code</p>
                  </div>
                  <div className="bg-red-900/20 p-3 rounded-lg border-2 border-red-500/50 shadow-lg shadow-red-500/20">
                    <p className="font-bold text-red-400">🏗️ Build</p>
                    <p className="text-[10px]">Create complete projects</p>
                  </div>
                  <div className="bg-red-900/20 p-3 rounded-lg border-2 border-red-500/50 shadow-lg shadow-red-500/20">
                    <p className="font-bold text-red-400">🔧 How To Build</p>
                    <p className="text-[10px]">Step-by-step guides</p>
                  </div>
                  <div className="bg-red-900/20 p-3 rounded-lg border-2 border-red-500/50 shadow-lg shadow-red-500/20">
                    <p className="font-bold text-red-400">💡 Planning</p>
                    <p className="text-[10px]">Strategic planning</p>
                  </div>
                  <div className="bg-red-900/20 p-3 rounded-lg border-2 border-red-500/50 shadow-lg shadow-red-500/20">
                    <p className="font-bold text-red-400">📅 Timetable</p>
                    <p className="text-[10px]">Schedule creation</p>
                  </div>
                  <div className="bg-red-900/20 p-3 rounded-lg border-2 border-red-500/50 shadow-lg shadow-red-500/20 col-span-3">
                    <p className="font-bold text-red-400">🧠 RW Intelligence</p>
                    <p className="text-[10px]">Theories, inventions, solutions</p>
                  </div>
                </div>
                <p className="mt-4 text-red-400 font-black text-lg">🔥 NO TEXT LIMIT - COMPLETELY UNRESTRICTED - INFINITE POWER 🔥</p>
                <p className="text-red-600 text-[10px]">Ask ANYTHING - Code, Build, Plan, Create, Invent, Solve - All in ONE place!</p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3 p-4 rounded-lg backdrop-blur-sm',
                msg.role === 'user'
                  ? 'bg-red-900/30 border-2 border-red-500/50 ml-12 shadow-lg shadow-red-500/20'
                  : 'bg-gray-900/50 border-2 border-red-500/30 mr-12 shadow-lg shadow-red-500/10'
              )}
            >
              <div className="flex-shrink-0">
                {msg.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    U
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 via-yellow-500 to-red-600 flex items-center justify-center shadow-lg animate-pulse">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="prose prose-invert prose-red max-w-none text-sm">
                  <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {isLoading && streamingMessage && (
            <div className="flex gap-3 p-4 rounded-lg bg-gray-900/50 border-2 border-red-500/30 mr-12 backdrop-blur-sm shadow-lg shadow-red-500/10">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 via-yellow-500 to-red-600 flex items-center justify-center animate-pulse shadow-lg">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="prose prose-invert prose-red max-w-none text-sm">
                  <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {isLoading && !streamingMessage && (
            <div className="flex gap-3 p-4 rounded-lg bg-gray-900/50 border-2 border-red-500/30 mr-12 backdrop-blur-sm">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 via-yellow-500 to-red-600 flex items-center justify-center animate-pulse shadow-lg">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing with ultimate power...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-red-500/30 bg-black/50 backdrop-blur-sm p-4 relative z-10 shadow-lg shadow-red-500/20">
        <div className="max-w-4xl mx-auto space-y-3">
          {messages.length > 0 && (
            <div className="flex justify-center">
              <Button
                onClick={generatePDF}
                className="bg-gradient-to-r from-red-600 via-yellow-600 to-red-600 hover:from-red-700 hover:via-yellow-700 hover:to-red-700 text-white font-bold shadow-lg shadow-red-500/50 animate-pulse"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Premium PDF
                <Download className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-2 bg-gray-900/50 border-2 border-red-500/50 rounded-lg px-4 py-3 shadow-lg shadow-red-500/20">
            <Crown className="w-5 h-5 text-red-500 flex-shrink-0 animate-pulse" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="Ask ANYTHING... Code, Build, Plan, Create, Invent, Solve - All Powers United!"
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none text-sm text-red-300 placeholder:text-red-800"
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
                className="h-8 bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white disabled:opacity-50 shadow-lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-[10px] text-red-700 text-center">
            👑 Ultimate Power - All Modes Combined - No Text Limit - Auto-saves for 10 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
