// ZipWhalePage - ZIP WHALE: Super Intelligent Project Creator
// Creates complete, working projects with NO ERRORS - Direct ZIP download
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, ArrowLeft, Package, Download, Zap, FileArchive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
import { ChatService } from '@/services/chat';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import JSZip from 'jszip';

export function ZipWhalePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamingTextRef = useRef<string>('');
  const navigate = useNavigate();

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

  // Extract project structure from AI response
  const extractProjectStructure = (text: string) => {
    const startMarker = '<<<PROJECT_FILES_START>>>';
    const endMarker = '<<<PROJECT_FILES_END>>>';
    
    const startIndex = text.indexOf(startMarker);
    const endIndex = text.indexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
      console.log('❌ Project markers not found. Start:', startIndex, 'End:', endIndex);
      return null;
    }
    
    const jsonStr = text.substring(startIndex + startMarker.length, endIndex).trim();
    console.log('📄 Extracted JSON length:', jsonStr.length, 'characters');
    
    try {
      const projectData = JSON.parse(jsonStr);
      console.log('✅ Project data parsed successfully:', projectData.name, 'with', projectData.files?.length, 'files');
      return projectData;
    } catch (error) {
      console.error('❌ Failed to parse project structure:', error);
      console.error('📄 JSON string (first 500 chars):', jsonStr.substring(0, 500));
      toast.error('Failed to parse project structure. AI may have stopped before completing the response.');
      return null;
    }
  };

  // Create and download ZIP file
  const handleDownloadProjectZip = async (projectData: any) => {
    try {
      console.log('📦 Creating ZIP file...', projectData);
      toast.info('Creating ZIP file...');
      
      if (!projectData || !projectData.name || !projectData.files || !Array.isArray(projectData.files)) {
        throw new Error('Invalid project data structure');
      }
      
      if (projectData.files.length === 0) {
        throw new Error('No files found in project');
      }
      
      console.log(`✅ Project: ${projectData.name}, Files: ${projectData.files.length}`);
      
      const zip = new JSZip();
      const projectFolder = zip.folder(projectData.name);
      
      if (!projectFolder) {
        throw new Error('Failed to create project folder');
      }
      
      // Add all files to ZIP
      for (const file of projectData.files) {
        if (!file.path || !file.content) {
          console.warn('⚠️ Skipping invalid file:', file);
          continue;
        }
        const filePath = file.path.replace(`${projectData.name}/`, '');
        projectFolder.file(filePath, file.content);
        console.log(`✅ Added file: ${filePath} (${file.content.length} bytes)`);
      }
      
      // Generate ZIP
      console.log('🔄 Generating ZIP blob...');
      const blob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
      
      console.log(`✅ ZIP blob generated: ${blob.size} bytes`);
      
      // Download ZIP
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectData.name}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ ZIP file downloaded successfully!');
      toast.success(`${projectData.name}.zip downloaded successfully! (${projectData.files.length} files)`, {
        description: 'Extract the ZIP file and follow the README instructions to get started.',
        duration: 8000,
      });
    } catch (error) {
      console.error('❌ Failed to create ZIP:', error);
      toast.error(`Failed to create ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle send message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      parts: [{ text: input.trim() }],
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    streamingTextRef.current = '';
    setStreamingMessage('');

    const controller = new AbortController();
    setAbortController(controller);

    const contents = newMessages.map(msg => ({
      role: msg.role,
      parts: msg.parts,
    }));

    console.log('🚀 Sending message to ZIP WHALE AI...');

    ChatService.streamChatSSE(
      contents,
      false, false, false, false, false, false, false, false, false, false, false,
      false, false, 'android',
      false, false, false, false, false, false,
      true, // hackMasterMode - TRUE for ZIP WHALE (uses same backend as HACK MASTER)
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
        
        console.log('✅ ZIP WHALE AI response complete');
        
        // Check if project was created
        const projectData = extractProjectStructure(streamingTextRef.current);
        if (projectData) {
          toast.success('🎉 Project created successfully!', {
            description: `${projectData.name} is ready with ${projectData.files?.length || 0} files. Click the download button below!`,
            duration: 5000,
          });
        }
      },
      (error: any) => {
        // On error
        console.error('❌ ZIP WHALE error:', error);
        toast.error('Failed to create project. Please try again.');
        setIsLoading(false);
        setStreamingMessage('');
        setAbortController(null);
      }
    );
  };

  // Handle stop generation
  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setIsLoading(false);
      setAbortController(null);
      toast.info('Generation stopped');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-950 via-purple-950 to-indigo-950">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-500/20 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="icon"
            className="text-blue-300 hover:text-blue-100 hover:bg-blue-500/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <FileArchive className="h-6 w-6 text-blue-400 animate-pulse" />
            <div>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 font-mono">
                ZIP WHALE
              </h1>
              <p className="text-[10px] text-blue-300 font-mono">
                Super Intelligent Project Creator • 100% Working Code • Direct ZIP Download
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs font-bold text-blue-300 font-mono">NO ERRORS</p>
            <p className="text-[10px] text-purple-300 font-mono">COMPLETE PROJECTS</p>
          </div>
          <Package className="h-8 w-8 text-purple-400 animate-bounce" />
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streamingMessage && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-3xl mx-auto">
            <FileArchive className="h-24 w-24 text-blue-400 animate-pulse" />
            <div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2 font-mono">
                ZIP WHALE
              </h2>
              <p className="text-blue-200 text-lg mb-4 font-mono">
                Super Intelligent Project Creator
              </p>
              <p className="text-blue-300 text-sm max-w-2xl font-mono">
                Create ANY project with 100% working code. Just describe what you want, and ZIP WHALE will create a complete, production-ready project with all files, documentation, and setup instructions. NO ERRORS. NO DEMOS. REAL WORKING CODE.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <Zap className="h-6 w-6 text-yellow-400 mb-2" />
                <h3 className="text-sm font-bold text-blue-300 mb-1 font-mono">Super Intelligent</h3>
                <p className="text-xs text-blue-200 font-mono">Infinite coding knowledge across all languages and frameworks</p>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <Package className="h-6 w-6 text-purple-400 mb-2" />
                <h3 className="text-sm font-bold text-purple-300 mb-1 font-mono">Complete Projects</h3>
                <p className="text-xs text-purple-200 font-mono">All files included: code, configs, README, setup scripts</p>
              </div>
              
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <Download className="h-6 w-6 text-green-400 mb-2" />
                <h3 className="text-sm font-bold text-green-300 mb-1 font-mono">Direct ZIP Download</h3>
                <p className="text-xs text-green-200 font-mono">One-click download of complete project as ZIP file</p>
              </div>
              
              <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/30">
                <Zap className="h-6 w-6 text-pink-400 mb-2" />
                <h3 className="text-sm font-bold text-pink-300 mb-1 font-mono">100% Working Code</h3>
                <p className="text-xs text-pink-200 font-mono">No errors, no demos, no placeholders - production ready</p>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 max-w-2xl">
              <p className="text-xs text-blue-200 font-mono mb-2">💡 Example prompts:</p>
              <ul className="text-xs text-blue-300 space-y-1 text-left font-mono">
                <li>• "Create a port scanner security tool in Python"</li>
                <li>• "Build a password manager with encryption"</li>
                <li>• "Make a web scraper for e-commerce sites"</li>
                <li>• "Create a Discord bot with admin commands"</li>
                <li>• "Build a REST API with authentication"</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              'flex gap-3 p-4 rounded-lg',
              message.role === 'user'
                ? 'bg-blue-500/20 border border-blue-500/30 ml-auto max-w-[80%]'
                : 'bg-purple-500/20 border border-purple-500/30'
            )}
          >
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-blue-300 font-mono">
                  {message.role === 'user' ? '👤 YOU' : '🐋 ZIP WHALE'}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {message.timestamp?.toLocaleTimeString()}
                </span>
              </div>
              
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    code: ({ node, inline, className, children, ...props }: any) => (
                      inline ? (
                        <code className="bg-black/30 px-1 py-0.5 rounded text-blue-300 font-mono text-xs" {...props}>
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-black/50 p-3 rounded-lg overflow-x-auto border border-blue-500/20">
                          <code className="text-blue-200 font-mono text-xs" {...props}>
                            {children}
                          </code>
                        </pre>
                      )
                    ),
                  }}
                >
                  {message.parts.map(p => p.text || '').join('\n')}
                </ReactMarkdown>
              </div>
              
              {/* Download Project ZIP Button */}
              {message.role === 'model' && (() => {
                const messageText = message.parts.map(p => p.text || '').join('\n');
                const projectData = extractProjectStructure(messageText);
                
                if (projectData) {
                  return (
                    <div className="mt-6 pt-4 border-t border-purple-500/30">
                      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 p-4 rounded-lg border border-green-500/30 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-5 w-5 text-green-400" />
                          <h3 className="text-sm font-bold text-green-300 font-mono">PROJECT COMPLETE!</h3>
                        </div>
                        <p className="text-xs text-green-200 font-mono mb-1">
                          ✅ {projectData.name} • {projectData.files?.length || 0} files • 100% working code
                        </p>
                        <p className="text-xs text-blue-200 font-mono">
                          📦 Ready to download as ZIP file • Extract and follow README instructions
                        </p>
                      </div>
                      
                      <Button
                        onClick={() => handleDownloadProjectZip(projectData)}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-6 font-mono font-bold text-lg flex items-center justify-center gap-3 shadow-lg"
                      >
                        <Download className="h-6 w-6 animate-bounce" />
                        📦 DOWNLOAD {projectData.name.toUpperCase()}.ZIP
                      </Button>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        ))}

        {streamingMessage && (
          <div className="flex gap-3 p-4 rounded-lg bg-purple-500/20 border border-purple-500/30">
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-purple-300 font-mono">🐋 ZIP WHALE</span>
                <Loader2 className="h-3 w-3 animate-spin text-purple-400" />
                <span className="text-[10px] text-purple-400 font-mono animate-pulse">
                  Creating your project...
                </span>
              </div>
              
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    code: ({ node, inline, className, children, ...props }: any) => (
                      inline ? (
                        <code className="bg-black/30 px-1 py-0.5 rounded text-blue-300 font-mono text-xs" {...props}>
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-black/50 p-3 rounded-lg overflow-x-auto border border-blue-500/20">
                          <code className="text-blue-200 font-mono text-xs" {...props}>
                            {children}
                          </code>
                        </pre>
                      )
                    ),
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
      <div className="p-4 border-t border-blue-500/20 bg-black/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Describe your project... (e.g., 'Create a security tool for port scanning')"
              className="flex-1 px-4 py-3 bg-black/50 border border-blue-500/30 rounded-lg text-blue-100 placeholder-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
              disabled={isLoading}
            />
            
            {isLoading ? (
              <Button
                onClick={handleStop}
                className="px-6 bg-red-600 hover:bg-red-700 text-white font-mono font-bold"
              >
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                STOP
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-mono font-bold"
              >
                <Send className="h-5 w-5 mr-2" />
                CREATE
              </Button>
            )}
          </div>
          
          <p className="text-[10px] text-blue-400 mt-2 text-center font-mono">
            🐋 ZIP WHALE creates complete, production-ready projects with 100% working code • No errors • No demos • Direct ZIP download
          </p>
        </div>
      </div>
    </div>
  );
}
