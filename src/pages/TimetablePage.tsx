// TimetablePage - TIMETABLE MODEL: Chat and create beautiful timetable PDF
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, ArrowLeft, Trash2, Calendar, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
import { ChatService } from '@/services/chat';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';

export function TimetablePage() {
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
    const savedChat = localStorage.getItem('timetable_model_chat');
    if (savedChat) {
      try {
        const { messages: savedMessages, timestamp } = JSON.parse(savedChat);
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        
        if (now - timestamp < tenMinutes) {
          setMessages(savedMessages);
          toast.success('Previous chat restored!');
        } else {
          localStorage.removeItem('timetable_model_chat');
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
      false, false, true, false, false, false, false, // timetableMode TRUE, others false
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
        localStorage.setItem('timetable_model_chat', JSON.stringify({
          messages: updatedMessages,
          timestamp: Date.now()
        }));
      },
      (error) => {
        console.error('Timetable error:', error);
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
    localStorage.removeItem('timetable_model_chat');
    toast.success('Chat cleared and memory reset');
  };

  const generateBeautifulTimetablePDF = () => {
    if (messages.length === 0) {
      toast.error('No timetable to generate. Please chat first!');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Beautiful gradient header background (simulated with rectangles)
      doc.setFillColor(59, 130, 246); // Blue
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('MY TIMETABLE', pageWidth / 2, 20, { align: 'center' as const });
      
      // Subtitle
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Created with Red Whale V1 - Timetable Model', pageWidth / 2, 30, { align: 'center' as const });
      
      // Date badge
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(pageWidth / 2 - 30, 35, 60, 8, 2, 2, 'F');
      doc.setFontSize(8);
      doc.text(new Date().toLocaleDateString(), pageWidth / 2, 40, { align: 'center' as const });
      
      // Reset text color for content
      doc.setTextColor(0, 0, 0);
      
      let y = 55;
      const margin = 15;
      const maxWidth = pageWidth - 2 * margin;
      
      // Collect all bot responses
      const botResponses = messages.filter(msg => msg.role === 'model');
      
      if (botResponses.length === 0) {
        doc.setFontSize(11);
        doc.text('No timetable content generated yet.', margin, y);
      } else {
        // Get the last bot response (final timetable)
        const finalTimetable = botResponses[botResponses.length - 1].parts[0]?.text || 'No content';
        
        // Section header
        doc.setFillColor(239, 246, 255); // Light blue background
        doc.rect(margin, y - 5, maxWidth, 10, 'F');
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text('📅 YOUR PERSONALIZED TIMETABLE', margin + 2, y + 2);
        
        y += 15;
        
        // Content
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        const lines = doc.splitTextToSize(finalTimetable, maxWidth);
        
        lines.forEach((line: string, index: number) => {
          if (y > pageHeight - 30) {
            doc.addPage();
            y = 20;
          }
          
          // Highlight time entries (lines starting with numbers or bullets)
          if (line.match(/^[\d•\-\*]/)) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(37, 99, 235);
          } else {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
          }
          
          doc.text(line, margin, y);
          y += 5;
        });
      }
      
      // Decorative footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Footer line
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
        
        // Footer text
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'italic');
        doc.text(
          `Page ${i} of ${totalPages}`,
          margin,
          pageHeight - 12
        );
        doc.text(
          '✨ Created with Red Whale V1',
          pageWidth - margin,
          pageHeight - 12,
          { align: 'right' as const }
        );
      }
      
      // Save with cute filename
      const filename = `my-timetable-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      toast.success('Beautiful timetable PDF downloaded! 🎉');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-950 via-pink-950 to-gray-950">
      <div className="flex items-center justify-between px-4 py-3 border-b border-pink-500/30 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="h-8 w-8 text-pink-400 hover:text-pink-300 hover:bg-pink-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-black text-pink-400 tracking-wider flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              TIMETABLE MODEL
            </h1>
            <p className="text-[10px] text-pink-600 font-semibold">Chat & Create Beautiful Timetable PDF</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-8 w-8 text-pink-400 hover:text-pink-300 hover:bg-pink-500/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div ref={scrollRef} className="h-full overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-2xl animate-pulse">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-pink-400 mb-2">TIMETABLE MODEL</h2>
                <p className="text-sm text-pink-600 max-w-md">
                  Let's chat and create your perfect timetable together!
                </p>
              </div>
              <div className="text-xs text-pink-700 space-y-1 max-w-lg">
                <p className="font-bold text-pink-500 mb-2">📅 HOW IT WORKS:</p>
                <p>1️⃣ Tell me about your schedule needs</p>
                <p>2️⃣ Discuss your preferences and constraints</p>
                <p>3️⃣ I'll create a personalized timetable</p>
                <p>4️⃣ Download as a beautiful PDF to save</p>
                <p className="mt-2 text-pink-600">Example: "I need a study timetable for exams" or "Create my daily routine"</p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3 p-4 rounded-lg',
                msg.role === 'user'
                  ? 'bg-pink-900/30 border border-pink-500/30 ml-12'
                  : 'bg-gray-900/50 border border-pink-500/20 mr-12'
              )}
            >
              <div className="flex-shrink-0">
                {msg.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white font-bold text-sm">
                    U
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="prose prose-invert prose-pink max-w-none text-sm">
                  <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {isLoading && streamingMessage && (
            <div className="flex gap-3 p-4 rounded-lg bg-gray-900/50 border border-pink-500/20 mr-12">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center animate-pulse">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="prose prose-invert prose-pink max-w-none text-sm">
                  <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {isLoading && !streamingMessage && (
            <div className="flex gap-3 p-4 rounded-lg bg-gray-900/50 border border-pink-500/20 mr-12">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center animate-pulse">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-pink-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating your timetable...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-pink-500/30 bg-black/50 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {messages.length > 0 && (
            <div className="flex justify-center">
              <Button
                onClick={generateBeautifulTimetablePDF}
                className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold shadow-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Beautiful PDF Timetable
                <Download className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-2 bg-gray-900/50 border border-pink-500/30 rounded-lg px-4 py-3">
            <Calendar className="w-5 h-5 text-pink-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="Discuss your timetable needs... (e.g., I need a study schedule)"
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none text-sm text-pink-300 placeholder:text-pink-800"
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
                className="h-8 bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-[10px] text-pink-700 text-center">
            💬 Chat with me to create your perfect timetable, then download as a beautiful PDF!
          </p>
        </div>
      </div>
    </div>
  );
}
