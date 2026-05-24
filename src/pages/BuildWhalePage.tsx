// BuildWhalePage - BUILD WHALE V1: Complete Android APK Project Generator + File Builder
// Generates full Android project folders OR complete file bundles for CMD/terminal
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Download, ArrowLeft, Trash2, FolderOpen, CheckCircle2, AlertCircle, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
import { ChatService } from '@/services/chat';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ProjectFile {
  path: string;
  content: string;
}

type BuildMode = 'android' | 'filebuilder';

export function BuildWhalePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [projectName, setProjectName] = useState('');
  const [isProjectComplete, setIsProjectComplete] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [buildMode, setBuildMode] = useState<BuildMode>('android');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamingTextRef = useRef<string>('');
  const navigate = useNavigate();

  // Load saved chat from localStorage (10-minute expiry)
  useEffect(() => {
    const savedChat = localStorage.getItem('build_whale_chat');
    if (savedChat) {
      try {
        const { messages: savedMessages, timestamp } = JSON.parse(savedChat);
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        
        if (now - timestamp < tenMinutes) {
          setMessages(savedMessages);
          toast.success('Previous chat restored!');
        } else {
          localStorage.removeItem('build_whale_chat');
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

  // Parse project files from AI response
  const parseProjectFiles = (responseText: string): ProjectFile[] => {
    const files: ProjectFile[] = [];
    
    // Extract project name from response
    const projectNameMatch = responseText.match(/PROJECT_NAME:\s*(\w+)/i);
    if (projectNameMatch) {
      setProjectName(projectNameMatch[1]);
    }
    
    // Parse file blocks: FILE: path/to/file.ext
    const fileBlockRegex = /FILE:\s*([^\n]+)\n```[\w]*\n([\s\S]*?)```/g;
    let match;
    
    while ((match = fileBlockRegex.exec(responseText)) !== null) {
      const filePath = match[1].trim();
      const fileContent = match[2].trim();
      
      files.push({
        path: filePath,
        content: fileContent
      });
    }
    
    return files;
  };

  // Send message to BUILD WHALE V1
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
    setProjectFiles([]);
    setIsProjectComplete(false);

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
      false, true, buildMode,
      false, false, false, false, false, false, false, // All other modes false
      controller.signal,
      (chunk) => {
        streamingTextRef.current = chunk;
        setStreamingMessage(chunk);
      },
      () => {
        // Use ref value which has the complete text
        const finalText = streamingTextRef.current;
        
        // Parse project files from response
        const parsedFiles = parseProjectFiles(finalText);
        
        if (parsedFiles.length > 0) {
          setProjectFiles(parsedFiles);
          setIsProjectComplete(true);
          toast.success(`Project generated! ${parsedFiles.length} files created`);
        }
        
        const aiMessage: Message = {
          id: `model_${Date.now()}`,
          role: 'model',
          parts: [{ text: finalText }],
          timestamp: new Date(),
        };
        const updatedMessages = [...newMessages, aiMessage];
        setMessages(updatedMessages);
        setStreamingMessage('');
        streamingTextRef.current = '';
        setIsLoading(false);
        setAbortController(null);
        
        // Auto-save chat for 10 minutes
        localStorage.setItem('build_whale_chat', JSON.stringify({
          messages: updatedMessages,
          timestamp: Date.now()
        }));
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
    
    setIsLoading(false);
    setStreamingMessage('');
    streamingTextRef.current = '';
    toast.info('Generation stopped');
  };

  // Download project as ZIP
  const handleDownloadProject = async () => {
    if (projectFiles.length === 0) {
      toast.error('No project files to download');
      return;
    }

    try {
      const zip = new JSZip();
      const folderName = projectName || 'AndroidProject';
      
      // Add all files to ZIP
      projectFiles.forEach(file => {
        zip.file(`${folderName}/${file.path}`, file.content);
      });
      
      // Generate ZIP file
      const blob = await zip.generateAsync({ type: 'blob' });
      
      // Download
      saveAs(blob, `${folderName}.zip`);
      toast.success(`${folderName}.zip downloaded successfully!`);
    } catch (error) {
      console.error('Failed to create ZIP:', error);
      toast.error('Failed to create project ZIP file');
    }
  };

  // Clear chat
  const handleClear = () => {
    setMessages([]);
    setInput('');
    setStreamingMessage('');
    streamingTextRef.current = '';
    setProjectFiles([]);
    setProjectName('');
    setIsProjectComplete(false);
    localStorage.removeItem('build_whale_chat');
    toast.success('Chat cleared and memory reset');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-orange-950 via-black to-red-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-orange-500/30 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="h-8 w-8 text-orange-400 hover:text-orange-300 hover:bg-orange-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-black text-orange-400 tracking-wider flex items-center gap-2">
              {buildMode === 'android' ? <FolderOpen className="w-5 h-5" /> : <FileCode className="w-5 h-5" />}
              BUILD WHALE V1
            </h1>
            <p className="text-[10px] text-orange-600 font-semibold">
              {buildMode === 'android' ? 'Complete Android APK Project Generator' : 'Complete File Bundle Builder'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Mode Selector */}
          <div className="flex items-center gap-1 bg-black/50 border border-orange-500/30 rounded-lg p-1">
            <Button
              onClick={() => setBuildMode('android')}
              size="sm"
              className={cn(
                "h-7 text-xs px-3 transition-all",
                buildMode === 'android'
                  ? "bg-orange-600 text-white"
                  : "bg-transparent text-orange-400 hover:bg-orange-500/20"
              )}
            >
              <FolderOpen className="w-3 h-3 mr-1" />
              Android APK
            </Button>
            <Button
              onClick={() => setBuildMode('filebuilder')}
              size="sm"
              className={cn(
                "h-7 text-xs px-3 transition-all",
                buildMode === 'filebuilder'
                  ? "bg-orange-600 text-white"
                  : "bg-transparent text-orange-400 hover:bg-orange-500/20"
              )}
            >
              <FileCode className="w-3 h-3 mr-1" />
              File Builder
            </Button>
          </div>
          
          {isProjectComplete && projectFiles.length > 0 && (
            <Button
              onClick={handleDownloadProject}
              size="sm"
              className="h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white font-bold"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download {buildMode === 'android' ? 'APK Project' : 'File Bundle'}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-8 w-8 text-orange-400 hover:text-orange-300 hover:bg-orange-500/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto px-4 py-6 space-y-4"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-2xl">
                {buildMode === 'android' ? <FolderOpen className="w-10 h-10 text-white" /> : <FileCode className="w-10 h-10 text-white" />}
              </div>
              <div>
                <h2 className="text-2xl font-black text-orange-400 mb-2">BUILD WHALE V1</h2>
                <p className="text-sm text-orange-600 max-w-md">
                  {buildMode === 'android' 
                    ? "Describe your Android app and I'll generate a complete, working APK project folder ready for Android Studio!"
                    : "Describe what you need and I'll generate a complete file bundle with scripts, configs, and executables ready to run!"}
                </p>
              </div>
              <div className="text-xs text-orange-700 space-y-1 max-w-lg">
                {buildMode === 'android' ? (
                  <>
                    <p className="font-bold text-orange-500 mb-2">🤖 ANDROID APK MODE:</p>
                    <p>✅ Complete Android project structure</p>
                    <p>✅ All files: Manifest, Gradle, Java, Resources</p>
                    <p>✅ Ready to import into Android Studio</p>
                    <p>✅ Build APK and install on device</p>
                    <p>✅ 25+ files including layouts, themes, icons</p>
                    <p className="mt-2 text-orange-600">Example: "Create a calculator app"</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-orange-500 mb-2">💻 FILE BUILDER MODE:</p>
                    <p>✅ Python scripts (.py) - Run: python script.py</p>
                    <p>✅ Batch files (.bat) - Run: script.bat</p>
                    <p>✅ Shell scripts (.sh) - Run: ./script.sh</p>
                    <p>✅ Node.js tools (.js) - Run: node script.js</p>
                    <p>✅ Includes requirements.txt, package.json, configs</p>
                    <p className="mt-2 text-orange-600">Example: "Create a Python script that downloads images"</p>
                  </>
                )}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <BuildMessage key={msg.id} message={msg} />
          ))}

          {streamingMessage && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shrink-0">
                <FolderOpen className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 bg-orange-950/50 border border-orange-500/30 rounded-lg p-3">
                <div className="text-xs text-orange-300 whitespace-pre-wrap font-mono">
                  {streamingMessage}
                </div>
              </div>
            </div>
          )}

          {/* Project Status */}
          {isProjectComplete && projectFiles.length > 0 && (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-green-950/50 to-emerald-950/50 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                  <div>
                    <h3 className="text-sm font-bold text-green-400">Project Generated Successfully!</h3>
                    <p className="text-xs text-green-600">Ready to download and import into Android Studio</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-black/30 rounded p-2">
                    <span className="text-green-600">Project Name:</span>
                    <span className="text-green-400 font-bold ml-2">{projectName || 'AndroidProject'}</span>
                  </div>
                  <div className="bg-black/30 rounded p-2">
                    <span className="text-green-600">Total Files:</span>
                    <span className="text-green-400 font-bold ml-2">{projectFiles.length}</span>
                  </div>
                </div>
                <div className="mt-3 max-h-40 overflow-y-auto space-y-1">
                  <p className="text-xs text-green-600 font-semibold mb-1">Files included:</p>
                  {projectFiles.map((file, idx) => (
                    <div key={idx} className="text-[10px] text-green-500 font-mono flex items-center gap-2">
                      <span className="text-green-700">📄</span>
                      {file.path}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Important Setup Instructions */}
              <div className="bg-gradient-to-r from-blue-950/50 to-cyan-950/50 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-blue-400">Important Setup Instructions</h3>
                </div>
                <div className="space-y-2 text-xs text-blue-300">
                  {buildMode === 'android' ? (
                    <>
                      <p className="font-semibold text-blue-200">After downloading:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Extract the ZIP file to your desired location</li>
                        <li>Open Android Studio</li>
                        <li>Click "Open" and select the extracted folder</li>
                        <li>Wait for Gradle sync to complete (Android Studio will auto-download gradle-wrapper.jar)</li>
                        <li>Click "Run" to build and install the APK</li>
                      </ol>
                      <p className="mt-2 text-blue-400 font-semibold">✅ All necessary files are included!</p>
                      <p className="text-blue-500 text-[10px]">Note: Android Studio will automatically download the Gradle wrapper on first sync.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-blue-200">After downloading:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Extract the ZIP file to your desired location</li>
                        <li>Open CMD (Windows) or Terminal (Mac/Linux)</li>
                        <li>Navigate to folder: <code className="bg-black/30 px-1 rounded">cd path/to/extracted/folder</code></li>
                        <li>Install dependencies (if needed):
                          <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                            <li>Python: <code className="bg-black/30 px-1 rounded">pip install -r requirements.txt</code></li>
                            <li>Node.js: <code className="bg-black/30 px-1 rounded">npm install</code></li>
                          </ul>
                        </li>
                        <li>Run the script:
                          <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                            <li>Python: <code className="bg-black/30 px-1 rounded">python script.py</code></li>
                            <li>Batch: <code className="bg-black/30 px-1 rounded">script.bat</code></li>
                            <li>Shell: <code className="bg-black/30 px-1 rounded">./script.sh</code></li>
                            <li>Node.js: <code className="bg-black/30 px-1 rounded">node script.js</code></li>
                          </ul>
                        </li>
                      </ol>
                      <p className="mt-2 text-blue-400 font-semibold">✅ All scripts are ready to run!</p>
                      <p className="text-blue-500 text-[10px]">Note: Check README.md in the bundle for specific instructions.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-orange-500/30 bg-black/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 bg-black border-2 border-orange-500 rounded-full px-4 py-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder={buildMode === 'android' ? "Describe your Android app..." : "Describe your file bundle (batch script, Python tool, etc.)..."}
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none text-sm text-orange-300 placeholder:text-orange-800"
            />

            {isLoading ? (
              <Button
                onClick={handleStop}
                size="icon"
                className="h-9 w-9 rounded-full bg-red-600 hover:bg-red-700 text-white shrink-0"
              >
                <AlertCircle className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                size="icon"
                className="h-9 w-9 rounded-full bg-orange-600 hover:bg-orange-700 text-white shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// BuildMessage component
function BuildMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const text = message.parts.find((p) => p.text)?.text || '';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-purple-600'
            : 'bg-gradient-to-br from-orange-500 to-red-600'
        )}
      >
        {isUser ? '👤' : <FolderOpen className="w-4 h-4 text-white" />}
      </div>
      <div
        className={cn(
          'flex-1 rounded-lg p-3 border',
          isUser
            ? 'bg-blue-950/50 border-blue-500/30'
            : 'bg-orange-950/50 border-orange-500/30'
        )}
      >
        <div
          className={cn(
            'text-xs whitespace-pre-wrap font-mono',
            isUser ? 'text-blue-300' : 'text-orange-300'
          )}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
