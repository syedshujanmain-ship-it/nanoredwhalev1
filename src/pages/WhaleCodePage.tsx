// WhaleCodePage - WHALE CODE V1: King of Codes Mode
// Pure black background, neon green code, master coder persona
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Image as ImageIcon, Copy, Check, ArrowLeft, Download, Trash2, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Message, UploadedFile } from '@/types/chat';
import { ChatService } from '@/services/chat';
import { useNavigate } from 'react-router-dom';
import { ChatHistory } from '@/components/chat/ChatHistory';

export function WhaleCodePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [uploadedImage, setUploadedImage] = useState<UploadedFile | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamingTextRef = useRef<string>(''); // Capture streaming text
  const navigate = useNavigate();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  // Auto-save chat whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        // Convert Date objects to ISO strings for storage
        const messagesToSave = messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
        }));
        
        localStorage.setItem('whalecode_current_chat', JSON.stringify({
          messages: messagesToSave,
          timestamp: Date.now(),
        }));
        
        console.log('Whale Code chat saved:', messagesToSave.length, 'messages');
      } catch (e) {
        console.error('Failed to save Whale Code chat:', e);
      }
    }
  }, [messages]);

  // Auto-restore chat on mount (if within 10 minutes)
  useEffect(() => {
    const stored = localStorage.getItem('whalecode_current_chat');
    if (stored) {
      try {
        const { messages: savedMessages, timestamp } = JSON.parse(stored);
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        
        console.log('Found stored Whale Code chat:', savedMessages?.length, 'messages');
        console.log('Time since save:', Math.floor((now - timestamp) / 1000), 'seconds');
        
        if (now - timestamp < tenMinutes && savedMessages && savedMessages.length > 0) {
          // Convert ISO strings back to Date objects
          const restoredMessages = savedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          
          setMessages(restoredMessages);
          toast.success('Previous chat restored');
          console.log('Whale Code chat restored successfully');
        } else {
          localStorage.removeItem('whalecode_current_chat');
          console.log('Whale Code chat expired or empty, cleared');
        }
      } catch (e) {
        console.error('Failed to restore Whale Code chat:', e);
        localStorage.removeItem('whalecode_current_chat');
      }
    } else {
      console.log('No stored Whale Code chat found');
    }
  }, []);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error('Image too large. Max 4MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Only images allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedImage({
        name: file.name,
        type: file.type,
        data: base64.split(',')[1],
        mimeType: file.type,
        preview: base64,
      });
      toast.success('Image uploaded');
    };
    reader.readAsDataURL(file);
  };

  // Send message
  const handleSend = () => {
    if (!input.trim() && !uploadedImage) return;
    if (isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      parts: [],
      timestamp: new Date(),
    };

    if (input.trim()) {
      userMessage.parts.push({ text: input.trim() });
    }

    if (uploadedImage) {
      userMessage.parts.push({
        inlineData: {
          mimeType: uploadedImage.mimeType,
          data: uploadedImage.data,
        },
      });
    }

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setUploadedImage(null);
    setIsLoading(true);
    setStreamingMessage('');
    streamingTextRef.current = ''; // Reset ref

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
      true,  // whaleCodeMode - TRUE for WHALE CODE V1
      false, 'android',
      false, false, false, false, false, false, false, // All other modes false
      controller.signal,
      (chunk) => {
        streamingTextRef.current = chunk; // Store in ref
        setStreamingMessage(chunk);
      },
      () => {
        // Use ref value which has the complete text
        const finalText = streamingTextRef.current;
        const aiMessage: Message = {
          id: `model_${Date.now()}`,
          role: 'model',
          parts: [{ text: finalText }],
          timestamp: new Date(),
        };
        setMessages([...newMessages, aiMessage]);
        setStreamingMessage('');
        streamingTextRef.current = '';
        setIsLoading(false);
        setAbortController(null);
      },
      (error) => {
        if (error !== 'ABORTED') {
          toast.error(error);
        }
        setIsLoading(false);
        setStreamingMessage('');
        streamingTextRef.current = '';
        setAbortController(null);
      }
    );
  };

  // Stop streaming
  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    
    // Save partial response if any
    if (streamingMessage) {
      const aiMessage: Message = {
        id: `model_${Date.now()}`,
        role: 'model',
        parts: [{ text: streamingMessage + '\n\n[Response stopped by user]' }],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }
    
    setIsLoading(false);
    setStreamingMessage('');
    streamingTextRef.current = '';
    toast.info('Response stopped');
  };

  // Load chat from history
  const handleLoadChat = (loadedMessages: Message[]) => {
    setMessages(loadedMessages);
    toast.success('Chat loaded');
  };

  // Start new chat
  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setStreamingMessage('');
    streamingTextRef.current = '';
    
    // Clear current chat from localStorage
    localStorage.removeItem('whalecode_current_chat');
    console.log('New Whale Code chat started, localStorage cleared');
    
    toast.success('New chat started');
  };

  // Clear chat
  const handleClear = () => {
    setMessages([]);
    setInput('');
    setStreamingMessage('');
    streamingTextRef.current = '';
    
    // Clear localStorage
    localStorage.removeItem('whalecode_current_chat');
    console.log('Whale Code chat cleared and localStorage cleaned');
    
    toast.success('Chat cleared');
  };

  // Download chat as PDF
  const handleDownloadPDF = () => {
    if (messages.length === 0) {
      toast.error('No messages to download');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to download PDF');
      return;
    }

    const chatHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>WHALE CODE V1 Chat - ${new Date().toLocaleDateString()}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              line-height: 1.6;
              background-color: #000;
              color: #22c55e;
            }
            h1 {
              text-align: center;
              color: #22c55e;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 3px;
            }
            .date {
              text-align: center;
              color: #16a34a;
              margin-bottom: 30px;
              font-size: 14px;
            }
            .message {
              margin-bottom: 20px;
              padding: 15px;
              border-radius: 8px;
              page-break-inside: avoid;
              border: 1px solid #22c55e;
            }
            .user {
              background-color: #052e16;
              border-left: 4px solid #22c55e;
            }
            .model {
              background-color: #14532d;
              border-left: 4px solid #4ade80;
            }
            .role {
              font-weight: bold;
              margin-bottom: 8px;
              text-transform: uppercase;
              font-size: 12px;
              color: #4ade80;
            }
            .content {
              white-space: pre-wrap;
              word-wrap: break-word;
              color: #22c55e;
            }
            code {
              background-color: #14532d;
              padding: 2px 6px;
              border-radius: 4px;
              font-family: 'Courier New', monospace;
              font-size: 13px;
              color: #4ade80;
            }
            pre {
              background-color: #052e16;
              color: #22c55e;
              padding: 12px;
              border-radius: 6px;
              overflow-x: auto;
              border: 1px solid #22c55e;
            }
            pre code {
              background-color: transparent;
              color: #22c55e;
            }
            @media print {
              body { background-color: white; color: black; }
              .message { border-color: #ccc; }
              .user { background-color: #f0f0f0; }
              .model { background-color: #e8e8e8; }
            }
          </style>
        </head>
        <body>
          <h1>👑 WHALE CODE V1</h1>
          <div class="date">${new Date().toLocaleString()}</div>
          ${messages.map((msg) => `
            <div class="message ${msg.role}">
              <div class="role">${msg.role === 'user' ? '👤 You' : '👑 King of Codes'}</div>
              <div class="content">${msg.parts.map(p => p.text || '[Image]').join('\n')}</div>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    printWindow.document.write(chatHTML);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      toast.success('Opening print dialog...');
    }, 250);
  };

  return (
    <div className="flex flex-col h-full bg-black text-green-400">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black border-b border-green-500/30 shadow-lg shadow-green-500/10">
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChatHistory
              currentMessages={messages}
              onLoadChat={handleLoadChat}
              onNewChat={handleNewChat}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="h-7 w-7 rounded-lg hover:bg-green-500/20 text-green-400"
              title="Back to Red Whale V1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-sm sm:text-base font-black tracking-wider uppercase">
              <span className="text-green-400">WHALE CODE V1</span>
              <span className="text-green-600 ml-2 text-xs">King of Codes</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownloadPDF}
              disabled={messages.length === 0}
              className="h-7 w-7 rounded-lg hover:bg-green-500/20 text-green-400"
              title="Download as PDF"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              disabled={messages.length === 0}
              className="h-7 w-7 rounded-lg hover:bg-red-500/20 text-red-400"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {messages.length === 0 && !streamingMessage && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center mb-3">
              <span className="text-2xl">👑</span>
            </div>
            <h2 className="text-base font-bold text-green-400 mb-1">WHALE CODE V1</h2>
            <p className="text-xs text-green-600">Master Coder • GitHub Links • Step-by-Step</p>
          </div>
        )}

        {messages.map((msg) => (
          <CodeMessage key={msg.id} message={msg} />
        ))}

        {streamingMessage && (
          <CodeMessage
            message={{
              id: 'streaming',
              role: 'model',
              parts: [{ text: streamingMessage }],
              timestamp: new Date(),
            }}
          />
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-black border-t border-green-500/30 p-3">
        {uploadedImage && (
          <div className="mb-2 relative inline-block">
            <img
              src={uploadedImage.preview}
              alt="Upload"
              className="w-16 h-16 rounded border border-green-500/50 object-cover"
            />
            <button
              onClick={() => setUploadedImage(null)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 bg-black border-2 border-green-500 rounded-full px-3 py-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="h-7 w-7 rounded-full hover:bg-green-500/20 text-green-400"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder="Ask the Master Coder..."
            disabled={isLoading}
            className="flex-1 bg-transparent border-none outline-none text-sm text-green-400 placeholder:text-green-700"
          />

          {isLoading ? (
            <Button
              onClick={handleStop}
              size="icon"
              className="h-7 w-7 rounded-full bg-red-500 hover:bg-red-600 text-white"
            >
              <Square className="w-4 h-4 fill-current" />
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              disabled={!input.trim() && !uploadedImage}
              size="icon"
              className="h-7 w-7 rounded-full bg-green-500 hover:bg-green-600 text-black"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// CodeMessage component with copy button
function CodeMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const text = message.parts.find((p) => p.text)?.text || '';
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse code blocks
  const renderContent = (): React.ReactNode => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <p key={`text-${lastIndex}`} className="text-xs whitespace-pre-wrap">
            {text.substring(lastIndex, match.index)}
          </p>
        );
      }

      // Add code block
      const lang = match[1] || 'code';
      const code = match[2];
      parts.push(
        <div key={`code-${match.index}`} className="relative my-2 group">
          <div className="flex items-center justify-between bg-green-950/50 px-2 py-1 rounded-t border border-green-500/30">
            <span className="text-[10px] text-green-600 font-mono">{lang}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(code)}
              className="h-5 px-2 text-[10px] text-green-400 hover:bg-green-500/20"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <pre className="bg-black border border-green-500/30 border-t-0 rounded-b p-2 overflow-x-auto max-w-full">
            <code className="text-[11px] font-mono text-green-400 block whitespace-pre-wrap break-words">
              {code}
            </code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <p key={`text-${lastIndex}`} className="text-xs whitespace-pre-wrap">
          {text.substring(lastIndex)}
        </p>
      );
    }

    return parts.length > 0 ? parts : <p className="text-xs whitespace-pre-wrap">{text}</p>;
  };

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-lg px-3 py-2 text-xs',
          isUser
            ? 'bg-green-500/20 border border-green-500/50 text-green-300'
            : 'bg-black border border-green-500/30 text-green-400'
        )}
      >
        {renderContent()}
      </div>
    </div>
  );
}
