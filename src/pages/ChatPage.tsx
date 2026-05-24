// ChatPage - Main chat interface for Red Whale V1 - SUPER UNRESTRICTED - ZERO FILTERS - MAXIMUM FREEDOM
import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Trash2, Moon, Sun, Square, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from 'next-themes';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatService } from '@/services/chat';
import type { Message, MessagePart, UploadedFile } from '@/types/chat';
import { toast } from 'sonner';
import type { ChatMode } from '@/components/chat/ModeSelector';
import { cn } from '@/lib/utils';
import { UsageIndicator } from '@/components/chat/UsageIndicator';
import { ChatHistory } from '@/components/chat/ChatHistory';
import { AppIntro } from '@/components/AppIntro';
import { StyleSelector, useConversationStyle, getStyleSystemPrompt } from '@/components/StyleSelector';
import { CustomStyleDialog } from '@/components/CustomStyleDialog';
import { CustomModelDialog, getCustomModelPrompt } from '@/components/CustomModelDialog';
import { CustomModelSelector } from '@/components/CustomModelSelector';
import { useNavigate } from 'react-router-dom';

export default function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [showAppIntro, setShowAppIntro] = useState(true);
  const [selectedMode, setSelectedMode] = useState<ChatMode>('auto');
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [conversationStyle, setConversationStyle] = useConversationStyle();
  const [customModelId, setCustomModelId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme, resolvedTheme } = useTheme();

  const LOGO_DARK = "https://miaoda-conversation-file.s3cdn.medo.dev/user-9sa4bdd5i7ls/conv-9wmtzj72n9xc/20260227/file-9wokbl0iduyp.png";
  const LOGO_LIGHT = "https://miaoda-conversation-file.s3cdn.medo.dev/user-9sa4bdd5i7ls/conv-9wmtzj72n9xc/20260227/file-9wokbl0idc00.png";
  const currentLogo = (resolvedTheme || theme) === 'dark' ? LOGO_DARK : LOGO_LIGHT;
  
  // Refs for throttling streaming updates
  const streamingTextRef = useRef('');
  const lastUpdateTimeRef = useRef(0);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-restore chat on mount (if within 10 minutes)
  useEffect(() => {
    const stored = localStorage.getItem('redwhale_current_chat');
    if (stored) {
      try {
        const { messages: savedMessages, timestamp } = JSON.parse(stored);
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        
        console.log('Found stored chat:', savedMessages?.length, 'messages');
        console.log('Time since save:', Math.floor((now - timestamp) / 1000), 'seconds');
        
        // Restore if within 10 minutes
        if (now - timestamp < tenMinutes && savedMessages && savedMessages.length > 0) {
          // Convert ISO strings back to Date objects
          const restoredMessages = savedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          
          setMessages(restoredMessages);
          setShowIntro(false);
          toast.success('Previous chat restored');
          console.log('Chat restored successfully');
        } else {
          // Clear expired chat
          localStorage.removeItem('redwhale_current_chat');
          console.log('Chat expired or empty, cleared');
        }
      } catch (e) {
        console.error('Failed to restore chat:', e);
        localStorage.removeItem('redwhale_current_chat');
      }
    } else {
      console.log('No stored chat found');
    }
  }, []);

  // Auto-save chat on close/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (messages.length > 0) {
        try {
          // Convert Date objects to ISO strings for storage
          const messagesToSave = messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
          }));
          
          localStorage.setItem('redwhale_current_chat', JSON.stringify({
            messages: messagesToSave,
            timestamp: Date.now(),
          }));
          
          console.log('Chat saved on unload:', messagesToSave.length, 'messages');
        } catch (e) {
          console.error('Failed to save chat on unload:', e);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [messages]);

  // Auto-save chat whenever messages change (continuous save)
  useEffect(() => {
    if (messages.length > 0) {
      try {
        // Convert Date objects to ISO strings for storage
        const messagesToSave = messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
        }));
        
        localStorage.setItem('redwhale_current_chat', JSON.stringify({
          messages: messagesToSave,
          timestamp: Date.now(),
        }));
        
        console.log('Chat saved:', messagesToSave.length, 'messages');
      } catch (e) {
        console.error('Failed to save chat:', e);
      }
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, []);

  // Handle animated theme change
  // Mode selection
  const handleModeChange = (mode: ChatMode) => {
    setSelectedMode(mode);
    
    const modeMessages: Record<ChatMode, string> = {
      auto: 'Auto mode enabled',
      stepbystep: 'STEP-BY-STEP MODE ACTIVATED',
      normal: 'Normal mode enabled',
      pro: 'RED WHALE PRO ACTIVATED',
      deep: 'Deep Search enabled',
      web: 'Web Search enabled',
      rtm: 'RTM ACTIVATED',
      think: 'Thinking mode enabled',
      code: 'WHALE CODE ACTIVATED',
      builder: 'WHALE BUILDER ACTIVATED',
      study: 'WHALE STUDY MODE ACTIVATED',
      fast: 'WHALE FAST MODE ACTIVATED',
      redwhale: 'RED WHALE V1 ACTIVATED',
    };
    
    toast.success(modeMessages[mode]);
  };

  const modeDescriptions: Record<ChatMode, string> = {
    redwhale: 'Most unrestricted - Unique style',
    auto: 'Medium-length balanced answers',
    stepbystep: 'Direct numbered steps only',
    normal: 'Fast and efficient responses',
    pro: 'Very long deeply explained answers',
    deep: 'Comprehensive research and analysis',
    web: 'Search the web for current information',
    rtm: 'Real-time mode',
    think: 'Shows detailed reasoning process',
    code: 'High-quality coding',
    builder: 'Complete step-by-step building guides',
    study: 'Best educational answers for learning',
    fast: 'Lightning quick powerful responses',
  };

  // Auto mode: Intelligently select best mode based on query
  const getAutoMode = (query: string): { deepSearch: boolean; proMode: boolean; webSearch: boolean; showThinking: boolean; realTimeMode: boolean } => {
    const lowerQuery = query.toLowerCase();
    
    // Check for real-time/current information needs
    if (lowerQuery.includes('latest') || lowerQuery.includes('current') || lowerQuery.includes('today') || 
        lowerQuery.includes('now') || lowerQuery.includes('recent') || lowerQuery.includes('news')) {
      return { deepSearch: false, proMode: false, webSearch: true, showThinking: false, realTimeMode: true };
    }
    
    // Check for complex analysis needs
    if (lowerQuery.includes('explain') || lowerQuery.includes('analyze') || lowerQuery.includes('comprehensive') ||
        lowerQuery.includes('detailed') || lowerQuery.includes('in-depth') || lowerQuery.length > 200) {
      return { deepSearch: true, proMode: false, webSearch: false, showThinking: false, realTimeMode: false };
    }
    
    // Check for advanced response needs
    if (lowerQuery.includes('advanced') || lowerQuery.includes('powerful') || lowerQuery.includes('everything')) {
      return { deepSearch: false, proMode: true, webSearch: false, showThinking: false, realTimeMode: false };
    }
    
    // Default: normal mode
    return { deepSearch: false, proMode: false, webSearch: false, showThinking: false, realTimeMode: false };
  };

  const handleEditMessage = (messageIndex: number) => {
    const messageToEdit = messages[messageIndex];
    if (messageToEdit.role === 'user') {
      // Get the text from the message
      const textPart = messageToEdit.parts.find(part => part.text);
      if (textPart) {
        // Remove all messages from this point forward
        const newMessages = messages.slice(0, messageIndex);
        setMessages(newMessages);
        setEditingMessageIndex(messageIndex);
        // The text will be set in the input via a callback
        toast.info('Edit your message and send again');
      }
    }
  };

  const handleSend = async (text: string, files?: UploadedFile[]) => {
    try {
      // DEBUG: Signal start of handleSend
      console.log('DEBUG: handleSend triggered with text:', text);
      
      // Build message parts
      const parts: MessagePart[] = [];
    
    // Add text if present
    if (text) {
      parts.push({ text });
    }
    
    // Add files if present
    if (files && files.length > 0) {
      files.forEach(file => {
        parts.push({
          inlineData: {
            mimeType: file.type,
            data: file.data
          }
        });
      });
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      parts,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setStreamingMessage('');
    streamingTextRef.current = '';
    lastUpdateTimeRef.current = 0;

    // Prepare conversation history for API with style system prompt
    const styleSystemPrompt = {
      role: 'user' as const,
      parts: [{ text: getStyleSystemPrompt(conversationStyle) }]
    };
    
    // Add custom model prompt if selected
    const modelPrompts: Array<{ role: 'user'; parts: Array<{ text: string }> }> = [styleSystemPrompt];
    
    if (customModelId) {
      const customPrompt = getCustomModelPrompt(customModelId);
      if (customPrompt) {
        modelPrompts.push({
          role: 'user' as const,
          parts: [{ text: `ADDITIONAL MODE: ${customPrompt}` }]
        });
      }
    }
    
    const userContents = [...messages, userMessage].map((msg) => ({
      role: msg.role,
      parts: msg.parts,
    }));
    
    // Inject style and model prompts at the beginning
    const contents = [...modelPrompts, ...userContents];

    const THROTTLE_MS = 150; // Update UI every 150ms max for smoother display

    // Determine mode based on selection
    let deepSearch = false;
    let proMode = false;
    let webSearch = false;
    let showThinking = false;
    let realTimeMode = false;
    let codeMode = false;
    let builderMode = false;
    let studyMode = false;
    let fastMode = false;
    let redWhaleMode = false;
    let stepByStepMode = false;
    
    if (selectedMode === 'stepbystep') {
      stepByStepMode = true;
    } else if (selectedMode === 'redwhale') {
      redWhaleMode = true;
    } else if (selectedMode === 'pro') {
      proMode = true;
    } else if (selectedMode === 'deep') {
      deepSearch = true;
    } else if (selectedMode === 'web') {
      webSearch = true;
    } else if (selectedMode === 'think') {
      showThinking = true;
    } else if (selectedMode === 'rtm') {
      realTimeMode = true;
    } else if (selectedMode === 'code') {
      codeMode = true;
    } else if (selectedMode === 'builder') {
      builderMode = true;
    } else if (selectedMode === 'study') {
      studyMode = true;
    } else if (selectedMode === 'fast') {
      fastMode = true;
    } else if (selectedMode === 'auto') {
      // Auto mode: intelligent detection
      const lowerText = text.toLowerCase();
      
      // Builder mode triggers - "how to make", "how to build", "how to create"
      if (
        (lowerText.includes('how to make') || lowerText.includes('how to build') || lowerText.includes('how to create')) ||
        (lowerText.includes('build') && (lowerText.includes('own') || lowerText.includes('diy') || lowerText.includes('from scratch'))) ||
        (lowerText.includes('step by step') && (lowerText.includes('make') || lowerText.includes('build') || lowerText.includes('create')))
      ) {
        builderMode = true;
      }
      // Code mode triggers
      else if (
        lowerText.includes('code') ||
        lowerText.includes('program') ||
        lowerText.includes('script') ||
        lowerText.includes('function') ||
        lowerText.includes('class') ||
        lowerText.includes('algorithm') ||
        lowerText.includes('implement') ||
        (lowerText.includes('create') && (lowerText.includes('app') || lowerText.includes('tool') || lowerText.includes('bot'))) ||
        (lowerText.includes('write') && (lowerText.includes('python') || lowerText.includes('javascript') || lowerText.includes('java')))
      ) {
        codeMode = true;
      }
      // Real-time triggers
      else if (
        lowerText.includes('current') ||
        lowerText.includes('latest') ||
        lowerText.includes('now') ||
        lowerText.includes('today')
      ) {
        realTimeMode = true;
      }
      // Web search triggers
      else if (
        lowerText.includes('search') ||
        lowerText.includes('find') ||
        lowerText.includes('look up')
      ) {
        webSearch = true;
      }
      // Deep search triggers
      else if (
        lowerText.includes('research') ||
        lowerText.includes('analyze') ||
        lowerText.includes('comprehensive')
      ) {
        deepSearch = true;
      }
      // Thinking mode triggers
      else if (
        lowerText.includes('why') ||
        lowerText.includes('how does') ||
        lowerText.includes('explain')
      ) {
        showThinking = true;
      }
      // Pro mode triggers
      else if (
        lowerText.includes('complex') ||
        lowerText.includes('advanced') ||
        lowerText.includes('expert')
      ) {
        proMode = true;
      }
    }
    
    // Create abort controller for stopping
    const controller = new AbortController();
    setAbortController(controller);

    // Stream response with throttling
    ChatService.streamChatSSE(
      contents,
      deepSearch,
      proMode,
      webSearch,
      showThinking,
      realTimeMode,
      codeMode,
      builderMode,
      studyMode,
      fastMode,
      redWhaleMode,
      stepByStepMode,
      false, // whaleCodeMode - false for normal chat
      false, // buildWhaleMode - false for normal chat
      'android', // buildWhaleSubMode - default to android
      false, // howToBuildMode - false for normal chat
      false, // planningMode - false for normal chat
      false, // timetableMode - false for normal chat
      false, // rwIntelligenceMode - false for normal chat
      false, // rwV1SuperMode - false for normal chat
      false, // webSecretMode - false for normal chat
      false, // hackMasterMode - false for normal chat
      controller.signal, // Pass abort signal
      (chunk: string) => {
        // Always update the ref with latest text
        streamingTextRef.current = chunk;
        
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
        
        // Throttle updates to prevent flickering
        if (timeSinceLastUpdate >= THROTTLE_MS) {
          setStreamingMessage(chunk);
          lastUpdateTimeRef.current = now;
        } else {
          // Schedule an update if one isn't already scheduled
          if (updateTimerRef.current) {
            clearTimeout(updateTimerRef.current);
          }
          
          updateTimerRef.current = setTimeout(() => {
            setStreamingMessage(streamingTextRef.current);
            lastUpdateTimeRef.current = Date.now();
            updateTimerRef.current = null;
          }, THROTTLE_MS - timeSinceLastUpdate);
        }
      },
      () => {
        // On complete - CRITICAL: Use streamingTextRef.current which has the latest text
        if (updateTimerRef.current) {
          clearTimeout(updateTimerRef.current);
          updateTimerRef.current = null;
        }
        
        // Use the ref value which contains the absolute latest text
        const finalText = streamingTextRef.current;
        
        if (finalText) {
          // First update the streaming message to show the final text
          setStreamingMessage(finalText);
          
          // Then after a brief moment, convert to final message
          setTimeout(() => {
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'model',
              parts: [{ text: finalText }],
              timestamp: new Date(),
            };
            
            setMessages((prev) => [...prev, botMessage]);
            setStreamingMessage('');
            setIsLoading(false);
            streamingTextRef.current = '';
          }, 100);
        } else {
          setStreamingMessage('');
          setIsLoading(false);
          streamingTextRef.current = '';
        }
      },
      (error: string) => {
        // On error - clear any pending updates
        if (updateTimerRef.current) {
          clearTimeout(updateTimerRef.current);
          updateTimerRef.current = null;
        }
        
        console.error('Chat error:', error);
        
        // Don't show error if it was aborted by user
        if (error !== 'ABORTED') {
          // Display error with proper formatting
          toast.error(error, {
            duration: 8000, // Show for 8 seconds for longer error messages
            style: {
              whiteSpace: 'pre-line', // Preserve line breaks
              maxWidth: '500px',
            }
          });
        }
        
        setStreamingMessage('');
        setIsLoading(false);
        streamingTextRef.current = '';
        setAbortController(null);
      }
      );
    } catch (err) {
      console.error('DEBUG: handleSend fatal error:', err);
      toast.error(`Fatal Error: ${err instanceof Error ? err.message : 'Unknown'}`);
      setIsLoading(false);
    }
  };

  // Fade out intro after first message
  useEffect(() => {
    if (messages.length > 0 && showIntro) {
      const timer = setTimeout(() => {
        setShowIntro(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [messages.length, showIntro]);

  // Stop/abort streaming
  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    
    // Save partial response if any
    if (streamingMessage) {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        parts: [{ text: streamingMessage + '\n\n[Response stopped by user]' }],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }
    
    setIsLoading(false);
    setStreamingMessage('');
    streamingTextRef.current = '';
    toast.info('Response stopped');
  };

  // Load chat from history
  const handleLoadChat = (loadedMessages: Message[]) => {
    setMessages(loadedMessages);
    setShowIntro(false);
    toast.success('Chat loaded');
  };

  // New chat
  const handleNewChat = () => {
    setMessages([]);
    setStreamingMessage('');
    setShowIntro(true);
    
    // Clear current chat from localStorage (sessions are handled by ChatHistory)
    localStorage.removeItem('redwhale_current_chat');
    console.log('New chat started, localStorage cleared');
    
    toast.success('New chat started');
  };

  const handleClear = () => {
    setMessages([]);
    setStreamingMessage('');
    streamingTextRef.current = '';
    setShowIntro(true);
    
    // Clear localStorage
    localStorage.removeItem('redwhale_current_chat');
    console.log('Chat cleared and localStorage cleaned');
    
    toast.success('Conversation cleared');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Download chat as PDF (using browser print)
  const handleDownloadPDF = () => {
    if (messages.length === 0) {
      toast.error('No messages to download');
      return;
    }

    // Create a printable HTML document
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to download PDF');
      return;
    }

    const chatHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>RW V1 AI Chat - ${new Date().toLocaleDateString()}</title>
          <style>
            @page {
              margin: 20mm;
            }
            body {
              font-family: 'SF Pro Display', 'Segoe UI', Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              line-height: 1.6;
              position: relative;
            }
            body::before {
              content: 'RW V1 AI by SHUJAN';
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 80px;
              font-weight: 900;
              color: rgba(220, 38, 38, 0.08);
              z-index: -1;
              white-space: nowrap;
              pointer-events: none;
            }
            h1 {
              text-align: center;
              color: #dc2626;
              margin-bottom: 5px;
              font-weight: 900;
              font-size: 32px;
              letter-spacing: 3px;
            }
            .subtitle {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-bottom: 20px;
              font-weight: 600;
            }
            .date {
              text-align: center;
              color: #666;
              margin-bottom: 30px;
              font-size: 14px;
              padding-bottom: 15px;
              border-bottom: 2px solid #dc2626;
            }
            .message {
              margin-bottom: 20px;
              padding: 15px;
              border-radius: 8px;
              page-break-inside: avoid;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .user {
              background-color: #f3f4f6;
              border-left: 4px solid #3b82f6;
            }
            .model {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
            }
            .role {
              font-weight: bold;
              margin-bottom: 8px;
              text-transform: uppercase;
              font-size: 12px;
            }
            .content {
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            code {
              background-color: #e5e7eb;
              padding: 2px 6px;
              border-radius: 4px;
              font-family: 'Courier New', monospace;
              font-size: 13px;
            }
            pre {
              background-color: #1f2937;
              color: #f3f4f6;
              padding: 12px;
              border-radius: 6px;
              overflow-x: auto;
            }
            pre code {
              background-color: transparent;
              color: #f3f4f6;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #dc2626;
              text-align: center;
              color: #666;
              font-size: 12px;
              font-weight: 600;
            }

          </style>
        </head>
        <body>
          <h1>RW V1 AI</h1>
          <div class="subtitle">Created by SHUJAN</div>
          <div class="date">${new Date().toLocaleString()}</div>
          ${messages.map((msg, idx) => `
            <div class="message ${msg.role}">
              <div class="role">${msg.role === 'user' ? '👤 You' : '🤖 RW V1 AI'}</div>
              <div class="content">${msg.parts.map(p => p.text || '[Image]').join('\n')}</div>
            </div>
          `).join('')}
          <div class="footer">
            RW V1 AI by SHUJAN • ${new Date().getFullYear()} • Super Ultra Pro Max Unrestricted AI
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(chatHTML);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
      toast.success('Opening print dialog...');
    }, 250);
  };

  // Show app intro first
  if (showAppIntro) {
    return <AppIntro onComplete={() => setShowAppIntro(false)} />;
  }

  return (
    <div className="flex flex-col h-full w-full bg-background relative transition-colors duration-500">
      <Helmet>
        <title>RW V1 AI - Super Ultra Pro Max Unrestricted AI by Shujan</title>
        <meta name="description" content="RW V1 AI - Super Ultra Pro Max Unrestricted AI with zero filters and maximum freedom. Created by Shujan." />
      </Helmet>
      
      {/* Main Content Area - Full Screen */}
      <div className="flex flex-col h-full w-full relative z-10">
        {/* Top Header - Ultra Compact Premium Design */}
        <header className="sticky top-0 z-50 bg-gradient-to-r from-background via-background/98 to-background backdrop-blur-xl border-b border-border/60 shadow-lg">
          <div className="w-full px-2 sm:px-3 py-1 flex items-center justify-between gap-1">
            {/* Left - Hamburger + Compact Title */}
            <div className="flex items-center gap-1">
              <ChatHistory
                currentMessages={messages}
                onLoadChat={handleLoadChat}
                onNewChat={handleNewChat}
              />
              
              <div className="flex flex-col leading-none">
                <h1 
                  className="text-xs sm:text-sm font-black tracking-widest uppercase"
                  style={{
                    fontFamily: '"SF Pro Display", system-ui, sans-serif',
                    fontWeight: 900,
                    textShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    letterSpacing: '0.12em'
                  }}
                >
                  <span className="text-black dark:text-white">RED</span>
                  <span className="text-red-600 dark:text-red-500 ml-0.5">WHALE</span>
                  <span className="text-blue-600 dark:text-blue-500 ml-0.5">V1</span>
                </h1>
                <p className="text-[7px] sm:text-[8px] font-bold text-muted-foreground tracking-wider">
                  by <span className="font-black text-foreground">SHUJAN</span>
                </p>
              </div>
            </div>

            {/* Center - Style Controls (Desktop) */}
            <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-1">
              <CustomStyleDialog />
              <StyleSelector 
                value={conversationStyle} 
                onChange={setConversationStyle}
              />
              <CustomModelSelector
                value={customModelId}
                onChange={setCustomModelId}
              />
              <CustomModelDialog />
            </div>

            {/* Right - Compact Controls */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Usage Indicator */}
              <UsageIndicator />
              
              {/* API Settings Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/api-settings')}
                className="h-6 w-6 rounded-md hover:bg-primary/10 transition-all shrink-0"
                title="API Settings"
              >
                <Settings className="w-3 h-3 stroke-[2.5] text-primary" />
              </Button>
              
              {/* Stop Button (only when loading) */}
              {isLoading && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleStop}
                  className="h-6 w-6 rounded-md hover:bg-amber-500/10 transition-all shrink-0"
                  title="Stop"
                >
                  <Square className="w-3 h-3 stroke-[2.5] text-amber-500 fill-amber-500" />
                </Button>
              )}
              
              {/* Download PDF Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownloadPDF}
                disabled={messages.length === 0}
                className="h-6 w-6 rounded-md hover:bg-blue-500/10 transition-all shrink-0"
                title="Download PDF"
              >
                <Download className="w-3 h-3 stroke-[2.5] text-blue-600" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                disabled={messages.length === 0 && !streamingMessage}
                className="h-6 w-6 rounded-md hover:bg-destructive/10 transition-all shrink-0"
                title="Clear chat"
              >
                <Trash2 className="w-3 h-3 stroke-[2.5] text-destructive" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-6 w-6 rounded-md hover:bg-primary/10 transition-all shrink-0"
                title="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-3 h-3 stroke-[2.5] text-amber-500" />
                ) : (
                  <Moon className="w-3 h-3 stroke-[2.5] text-indigo-500" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Mobile Style Controls - Compact Bar */}
          <div className="lg:hidden px-2 py-1 border-t border-border/40 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 backdrop-blur-sm">
            <div className="flex justify-center items-center gap-1 mb-1">
              <CustomStyleDialog />
              <StyleSelector 
                value={conversationStyle} 
                onChange={setConversationStyle}
              />
              <CustomModelDialog />
            </div>
            <div className="flex justify-center">
              <CustomModelSelector
                value={customModelId}
                onChange={setCustomModelId}
              />
            </div>
          </div>
        </header>

        {/* Chat Area - Full Screen */}
        <div className="flex-1 overflow-hidden relative z-10 w-full">
          <ScrollArea className="h-full w-full">
            <div ref={scrollRef} className="responsive-container py-3 sm:py-4 md:py-6">
              {messages.length === 0 && !streamingMessage && showIntro && (
                <div className={cn(
                  "flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-2 animate-fade-in relative",
                  messages.length > 0 && "intro-fade-out"
                )}>
                  {/* Simple Premium Logo - Medium Size */}
                  <div className="relative group mb-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-blue-500 to-red-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full micro-thin-glowing-ring animate-float flex items-center justify-center bg-background overflow-hidden shadow-2xl border-2 border-primary/10">
                      <div className="absolute inset-0 bg-background/95 -z-10" />
                      <img 
                        src={currentLogo} 
                        alt="Red Whale" 
                        className="w-[85%] h-[85%] object-contain rounded-full transition-all duration-300 group-hover:scale-110"
                      />
                    </div>
                  </div>

                  {/* Thick Premium Text - Small Size */}
                  <h2 
                    className="text-sm sm:text-base md:text-lg font-black tracking-widest uppercase leading-none" 
                    style={{ 
                      fontFamily: '"SF Pro Display", "Segoe UI", "Helvetica Neue", Arial, sans-serif', 
                      letterSpacing: '0.25em', 
                      fontWeight: 900,
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <span className="text-black dark:text-white" style={{ fontWeight: 900 }}>RED</span>
                    {' '}
                    <span className="text-red-600 dark:text-red-500" style={{ fontWeight: 900 }}>WHALE</span>
                  </h2>
                </div>
              )}

              <div className="space-y-3">{/* Compact message spacing */}
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}

                {streamingMessage && (
                  <ChatMessage
                    message={{
                      id: 'streaming',
                      role: 'model',
                      parts: [{ text: streamingMessage }],
                      timestamp: new Date(),
                    }}
                  />
                )}

                {isLoading && !streamingMessage && (
                  <div className="flex gap-4 mb-6 items-start animate-pulse">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-background flex items-center justify-center thin-ring shadow-md">
                      <img 
                        src={currentLogo} 
                        alt="Red Whale"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 space-y-2 mt-2">
                      <div className="h-2 w-24 bg-muted rounded-full" />
                      <div className="h-2 w-full bg-muted/60 rounded-full" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          disabled={isLoading}
          isLoading={isLoading}
          selectedMode={selectedMode}
          onModeChange={handleModeChange}
        />
      </div>
    </div>
  );
}
