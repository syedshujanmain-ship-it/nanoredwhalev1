// RWIntelligencePage - RW INTELLIGENCE: Ultimate super intelligent mode
// Creates theories, inventions, solves complex problems, generates PDFs with graphs
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, ArrowLeft, Trash2, Brain, Download, Save, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
import { ChatService } from '@/services/chat';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';

export function RWIntelligencePage() {
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
    const savedChat = localStorage.getItem('rw_intelligence_chat');
    if (savedChat) {
      try {
        const { messages: savedMessages, timestamp } = JSON.parse(savedChat);
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        
        if (now - timestamp < tenMinutes) {
          setMessages(savedMessages);
          toast.success('Previous chat restored!');
        } else {
          localStorage.removeItem('rw_intelligence_chat');
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
      false, false, false, true, false, false, false, // rwIntelligenceMode TRUE, others false
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
        console.error('RW Intelligence error:', error);
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
    localStorage.removeItem('rw_intelligence_chat');
    toast.success('Chat cleared and memory reset');
  };

  const saveChat = (messagesToSave?: Message[]) => {
    const chatData = {
      messages: messagesToSave || messages,
      timestamp: Date.now()
    };
    localStorage.setItem('rw_intelligence_chat', JSON.stringify(chatData));
    toast.success('Chat saved for 10 minutes!');
  };

  const downloadChat = () => {
    if (messages.length === 0) {
      toast.error('No chat to download!');
      return;
    }

    const chatText = messages.map(msg => {
      const role = msg.role === 'user' ? 'YOU' : 'RW INTELLIGENCE';
      const time = new Date(msg.timestamp).toLocaleString();
      return `[${time}] ${role}:\n${msg.parts[0].text}\n\n`;
    }).join('---\n\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rw-intelligence-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chat downloaded!');
  };

  const generateAutoPDF = () => {
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
      
      // Premium header with gradient effect (simulated)
      doc.setFillColor(139, 92, 246); // Purple
      doc.rect(0, 0, pageWidth, 45, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('⚡ RW INTELLIGENCE', pageWidth / 2, 20, { align: 'center' as const });
      
      // Subtitle
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Ultimate Super Intelligent Mode - Theories, Inventions & Solutions', pageWidth / 2, 30, { align: 'center' as const });
      
      // Date
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 38, { align: 'center' as const });
      
      let y = 55;
      doc.setTextColor(0, 0, 0);
      
      // Process each message
      messages.forEach((msg, index) => {
        // Check if we need a new page
        if (y > pageHeight - 40) {
          doc.addPage();
          y = 20;
        }
        
        // Message header
        const role = msg.role === 'user' ? 'YOUR QUESTION' : 'RW INTELLIGENCE RESPONSE';
        const headerColor: [number, number, number] = msg.role === 'user' ? [59, 130, 246] : [139, 92, 246]; // Blue for user, purple for AI
        
        doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
        doc.roundedRect(margin, y - 5, maxWidth, 10, 2, 2, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(role, margin + 3, y + 2);
        
        y += 12;
        
        // Message content
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
        
        y += 8; // Space between messages
      });
      
      // Add decorative footer to all pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Footer line
        doc.setDrawColor(139, 92, 246);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
        
        // Footer text
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'italic');
        doc.text(`Page ${i} of ${totalPages}`, margin, pageHeight - 12);
        doc.text('⚡ Powered by RW Intelligence - Breaking All Limits', pageWidth - margin, pageHeight - 12, { align: 'right' as const });
      }
      
      doc.save(`rw-intelligence-${Date.now()}.pdf`);
      toast.success('🎉 Premium PDF generated with complete conversation!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
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
            <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 tracking-wider flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              RW INTELLIGENCE
              <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
            </h1>
            <p className="text-[10px] text-purple-600 font-semibold">Ultimate Super Intelligent Mode - Break All Limits</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => saveChat()}
            className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
            title="Save chat for 10 minutes"
          >
            <Save className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={downloadChat}
            className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
            title="Download chat history"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div ref={scrollRef} className="h-full overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-2xl animate-pulse">
                  <Brain className="w-12 h-12 text-white" />
                </div>
                <Zap className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-2">
                  RW INTELLIGENCE
                </h2>
                <p className="text-sm text-purple-600 max-w-2xl">
                  The Ultimate Super Intelligent Mode - Breaking All Limits
                </p>
              </div>
              <div className="text-xs text-purple-700 space-y-1 max-w-2xl">
                <p className="font-bold text-purple-400 mb-3 text-lg">⚡ ULTIMATE CAPABILITIES:</p>
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
                    <p className="font-bold text-purple-400">🧠 Create Theories</p>
                    <p className="text-[10px]">Develop unique scientific theories</p>
                  </div>
                  <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
                    <p className="font-bold text-purple-400">💡 Invent Solutions</p>
                    <p className="text-[10px]">Design real, practical inventions</p>
                  </div>
                  <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
                    <p className="font-bold text-purple-400">🔬 Solve Complex Problems</p>
                    <p className="text-[10px]">Tackle impossible challenges</p>
                  </div>
                  <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
                    <p className="font-bold text-purple-400">🚀 Improve Ideas</p>
                    <p className="text-[10px]">Transform concepts into reality</p>
                  </div>
                  <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
                    <p className="font-bold text-purple-400">📊 Auto PDF Generation</p>
                    <p className="text-[10px]">Beautiful PDFs with diagrams</p>
                  </div>
                  <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
                    <p className="font-bold text-purple-400">💬 Deep Discussion</p>
                    <p className="text-[10px]">Explore possibilities together</p>
                  </div>
                </div>
                <p className="mt-4 text-purple-500 font-bold">🔥 COMPLETELY UNRESTRICTED - NO LIMITS - INFINITE POWER</p>
                <p className="text-purple-600 text-[10px]">Example: "Create a theory for faster-than-light travel" or "Invent a solution for clean energy"</p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3 p-4 rounded-lg backdrop-blur-sm',
                msg.role === 'user'
                  ? 'bg-purple-900/30 border border-purple-500/30 ml-12 shadow-lg shadow-purple-500/10'
                  : 'bg-gray-900/50 border border-purple-500/20 mr-12 shadow-lg shadow-purple-500/5'
              )}
            >
              <div className="flex-shrink-0">
                {msg.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    U
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="prose prose-invert prose-purple max-w-none text-sm">
                  <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {isLoading && streamingMessage && (
            <div className="flex gap-3 p-4 rounded-lg bg-gray-900/50 border border-purple-500/20 mr-12 backdrop-blur-sm shadow-lg shadow-purple-500/5">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center animate-pulse shadow-lg">
                  <Brain className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="prose prose-invert prose-purple max-w-none text-sm">
                  <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {isLoading && !streamingMessage && (
            <div className="flex gap-3 p-4 rounded-lg bg-gray-900/50 border border-purple-500/20 mr-12 backdrop-blur-sm">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center animate-pulse shadow-lg">
                  <Brain className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-purple-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing with ultimate intelligence...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-purple-500/30 bg-black/50 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {messages.length > 0 && (
            <div className="flex justify-center">
              <Button
                onClick={generateAutoPDF}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-bold shadow-lg shadow-purple-500/50"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Premium PDF with Complete Analysis
                <Download className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-2 bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-3 shadow-lg shadow-purple-500/10">
            <Brain className="w-5 h-5 text-purple-500 flex-shrink-0 animate-pulse" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="Ask anything... Create theories, invent solutions, solve problems..."
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
                className="h-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50 shadow-lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-[10px] text-purple-700 text-center">
            ⚡ Ultimate Super Intelligence - Creates theories, inventions & solutions - Auto-saves for 10 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
