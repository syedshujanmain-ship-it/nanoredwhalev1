// ChatHistory - Stores and manages recent chats with auto-delete after 10 minutes
import { useState, useEffect } from 'react';
import { Menu, Trash2, Clock, Code2, FolderOpen, Globe, Shield, FileArchive, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import type { Message } from '@/types/chat';

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  expiresAt: number;
}

interface ChatHistoryProps {
  currentMessages: Message[];
  onLoadChat: (messages: Message[]) => void;
  onNewChat: () => void;
}

export function ChatHistory({ currentMessages, onLoadChat, onNewChat }: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Load sessions from localStorage
  useEffect(() => {
    const loadSessions = () => {
      const stored = localStorage.getItem('redwhale_chat_sessions');
      if (stored) {
        try {
          const parsed: ChatSession[] = JSON.parse(stored);
          const now = Date.now();
          
          // Filter out expired sessions (older than 10 minutes)
          const validSessions = parsed.filter(session => session.expiresAt > now).map(session => ({
            ...session,
            // Convert ISO strings back to Date objects for messages
            messages: session.messages.map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
            }))
          }));
          
          if (validSessions.length !== parsed.length) {
            // Some sessions expired, update storage
            localStorage.setItem('redwhale_chat_sessions', JSON.stringify(validSessions));
          }
          
          setSessions(validSessions);
        } catch (e) {
          console.error('Failed to load chat sessions:', e);
          localStorage.removeItem('redwhale_chat_sessions');
        }
      }
    };

    loadSessions();
    
    // Check for expired sessions every 30 seconds
    const interval = setInterval(loadSessions, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Save current chat as a session
  const saveCurrentChat = () => {
    if (currentMessages.length === 0) return;

    try {
      const now = Date.now();
      
      // Convert Date objects to ISO strings for storage
      const messagesToSave = currentMessages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
      }));
      
      const newSession: ChatSession = {
        id: `chat_${now}`,
        title: currentMessages[0]?.parts?.[0]?.text?.substring(0, 50) || 'New Chat',
        messages: messagesToSave as any,
        createdAt: now,
        expiresAt: now + (10 * 60 * 1000), // 10 minutes from now
      };

      const updatedSessions = [newSession, ...sessions].slice(0, 20); // Keep max 20 sessions
      setSessions(updatedSessions);
      localStorage.setItem('redwhale_chat_sessions', JSON.stringify(updatedSessions));
      
      console.log('Chat session saved:', newSession.id);
    } catch (e) {
      console.error('Failed to save chat session:', e);
    }
  };

  // Delete a session
  const deleteSession = (id: string) => {
    const updatedSessions = sessions.filter(s => s.id !== id);
    setSessions(updatedSessions);
    localStorage.setItem('redwhale_chat_sessions', JSON.stringify(updatedSessions));
  };

  // Load a session
  const loadSession = (session: ChatSession) => {
    // Convert ISO strings back to Date objects
    const restoredMessages = session.messages.map((msg: any) => ({
      ...msg,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
    }));
    
    onLoadChat(restoredMessages);
    setIsOpen(false);
    console.log('Chat session loaded:', session.id);
  };

  // Start new chat
  const handleNewChat = () => {
    if (currentMessages.length > 0) {
      saveCurrentChat();
    }
    onNewChat();
    setIsOpen(false);
  };

  // Calculate time remaining
  const getTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const remaining = expiresAt - now;
    const minutes = Math.floor(remaining / 60000);
    return `${minutes}m`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg hover:bg-primary/10 transition-colors shrink-0"
          title="Chat History"
        >
          <Menu className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-sm font-bold">Menu</SheetTitle>
          <SheetDescription className="text-xs">
            Navigation & Recent Chats
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="mt-4 space-y-2">
          <Button
            onClick={handleNewChat}
            className="w-full text-xs h-8"
            variant="default"
          >
            + New Chat
          </Button>
          
          {/* RW V1 SUPER - Ultimate Mode with Glowing Frame */}
          <div className="relative p-1 rounded-lg bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 animate-pulse shadow-lg shadow-red-500/50">
            <Button
              onClick={() => {
                navigate('/rw-v1-super');
                setIsOpen(false);
              }}
              className="w-full text-xs h-10 bg-gradient-to-r from-red-600 via-yellow-600 to-red-600 hover:from-red-700 hover:via-yellow-700 hover:to-red-700 text-white font-black shadow-lg"
              variant="secondary"
            >
              <span className="mr-1.5">👑</span>
              RW V1 SUPER
              <span className="ml-1.5">⚡</span>
            </Button>
          </div>
          
          <Button
            onClick={() => {
              navigate('/whale-code');
              setIsOpen(false);
            }}
            className="w-full text-xs h-8 bg-green-600 hover:bg-green-700 text-white"
            variant="secondary"
          >
            <Code2 className="w-3.5 h-3.5 mr-1.5" />
            WHALE CODE V1
          </Button>
          
          <Button
            onClick={() => {
              navigate('/build-whale');
              setIsOpen(false);
            }}
            className="w-full text-xs h-8 bg-orange-600 hover:bg-orange-700 text-white"
            variant="secondary"
          >
            <FolderOpen className="w-3.5 h-3.5 mr-1.5" />
            🏗️ BUILD WHALE V1
          </Button>
          
          <Button
            onClick={() => {
              navigate('/how-to-build');
              setIsOpen(false);
            }}
            className="w-full text-xs h-8 bg-purple-600 hover:bg-purple-700 text-white"
            variant="secondary"
          >
            <span className="mr-1.5">🔧</span>
            HOW TO BUILD
          </Button>
          
          <Button
            onClick={() => {
              navigate('/planning');
              setIsOpen(false);
            }}
            className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
            variant="secondary"
          >
            <span className="mr-1.5">💡</span>
            PLANNING MODEL
          </Button>
          
          <Button
            onClick={() => {
              navigate('/timetable');
              setIsOpen(false);
            }}
            className="w-full text-xs h-8 bg-pink-600 hover:bg-pink-700 text-white"
            variant="secondary"
          >
            <span className="mr-1.5">📅</span>
            TIMETABLE MODEL
          </Button>
          
          <Button
            onClick={() => {
              navigate('/rw-intelligence');
              setIsOpen(false);
            }}
            className="w-full text-xs h-8 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-bold shadow-lg"
            variant="secondary"
          >
            <span className="mr-1.5">⚡</span>
            RW INTELLIGENCE
            <span className="ml-1.5">🧠</span>
          </Button>
          
          <Button
            onClick={() => {
              navigate('/web-secret');
              setIsOpen(false);
            }}
            className="w-full text-xs h-8 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white font-bold"
            variant="secondary"
          >
            <Globe className="w-3.5 h-3.5 mr-1.5" />
            🌐 WEB SECRET
          </Button>

          <Button
            onClick={() => {
              navigate('/hack-master');
              setIsOpen(false);
            }}
            className="w-full text-xs h-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-black font-bold font-mono"
            variant="secondary"
          >
            <Shield className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
            🛡️ HACK MASTER
          </Button>

          <Button
            onClick={() => {
              navigate('/world-secrets');
              setIsOpen(false);
            }}
            className="w-full text-xs h-8 bg-gradient-to-r from-slate-700 via-blue-700 to-slate-700 hover:from-slate-800 hover:via-blue-800 hover:to-slate-800 text-cyan-300 font-bold shadow-lg"
            variant="secondary"
          >
            <Globe className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
            🌍 WORLD SECRETS
          </Button>

          <Button
            onClick={() => {
              navigate('/zip-whale');
              setIsOpen(false);
            }}
            className="w-full text-xs h-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold shadow-lg font-mono"
            variant="secondary"
          >
            <FileArchive className="w-3.5 h-3.5 mr-1.5 animate-bounce" />
            🐋 ZIP WHALE
          </Button>

          <Button
            onClick={() => {
              navigate('/nano-red-whale');
              setIsOpen(false);
            }}
            className="w-full text-xs h-8 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-700 hover:via-orange-700 hover:to-yellow-700 text-white font-bold shadow-lg font-mono animate-pulse"
            variant="secondary"
          >
            <Rocket className="w-3.5 h-3.5 mr-1.5 animate-bounce" />
            🚀 NANO RED WHALE
          </Button>
          </div>

          <div className="mt-4 mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground">Recent Chats</h3>
            <p className="text-[10px] text-muted-foreground">Auto-deleted after 10 minutes</p>
          </div>

          <div className="space-y-2 pb-4">
            {sessions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                No recent chats
              </p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="group relative p-2 rounded-lg border border-border/50 hover:border-primary/50 transition-all cursor-pointer bg-card"
                  onClick={() => loadSession(session)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {session.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          {getTimeRemaining(session.expiresAt)} left
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
