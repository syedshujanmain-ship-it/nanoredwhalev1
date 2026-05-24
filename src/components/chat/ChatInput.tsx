// ChatInput component - Input area for sending messages with file upload support
import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Send, Loader2, Paperclip, X, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { UploadedFile } from '@/types/chat';
import { ModeSelector, type ChatMode } from './ModeSelector';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface ChatInputProps {
  onSend: (message: string, files?: UploadedFile[]) => void;
  onStop?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  selectedMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

export function ChatInput({ 
  onSend, 
  onStop,
  disabled, 
  isLoading,
  selectedMode,
  onModeChange
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const textareaRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (max 4MB)
      if (file.size > 4 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Max size is 4MB.`);
        continue;
      }

      // Check file type
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(`File type ${file.type} is not supported.`);
        continue;
      }

      // Read file as base64
      const reader = new FileReader();
      const fileData = await new Promise<UploadedFile>((resolve) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          const uploadedFile: UploadedFile = {
            name: file.name,
            type: file.type,
            data: base64.split(',')[1], // Remove data:image/jpeg;base64, prefix
            mimeType: file.type,
          };

          // Add preview for images
          if (file.type.startsWith('image/')) {
            uploadedFile.preview = base64;
          }

          resolve(uploadedFile);
        };
        reader.readAsDataURL(file);
      });

      newFiles.push(fileData);
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (newFiles.length > 0) {
      toast.success(`${newFiles.length} file(s) uploaded successfully`);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      // Revoke object URL if it exists
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if ((message.trim() || uploadedFiles.length > 0) && !disabled && !isLoading) {
      onSend(message.trim(), uploadedFiles.length > 0 ? uploadedFiles : undefined);
      setMessage('');
      
      // Clean up file previews
      uploadedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      setUploadedFiles([]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const getPlaceholder = () => {
    return 'Ask Red Whale...';
  };

  return (
    <div className="sticky bottom-0 z-50 w-full bg-gradient-to-t from-background via-background/95 to-transparent pt-12 pb-6 px-4 safe-bottom">
      <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-4">
        {/* File previews */}
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pb-2">
            {uploadedFiles.map((file, index) => (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                key={index} 
                className="relative group"
              >
                {file.preview ? (
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-card">
                    <img 
                      src={file.preview} 
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-black/60 backdrop-blur-md rounded-lg p-1 text-white hover:bg-destructive transition-colors shadow-lg"
                    >
                      <X className="w-3 h-3 stroke-[3]" />
                    </button>
                  </div>
                ) : (
                  <div className="relative flex items-center gap-2 px-3 py-2 bg-card rounded-2xl border border-white/10 shadow-xl">
                    <Paperclip className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-medium max-w-[80px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="hover:text-destructive transition-colors shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Premium Input Container with Black Border */}
        <div className="glass-card rounded-[2.5rem] p-2 flex items-center gap-3 shadow-2xl focus-within:ring-2 focus-within:ring-primary/40 transition-all duration-500 hover:shadow-primary/10 group border-[3px] border-black dark:border-black">
          {/* Mode selector */}
          <div className="shrink-0 pl-1">
            <ModeSelector
              selectedMode={selectedMode}
              onModeChange={onModeChange}
              disabled={disabled || isLoading}
            />
          </div>

          {/* File upload button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isLoading}
            className="h-11 w-11 shrink-0 hover:bg-primary/10 rounded-full transition-all group-hover:scale-110 duration-300"
          >
            <Paperclip className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors stroke-[2.5]" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Message input */}
          <input
            ref={textareaRef as any}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            placeholder={getPlaceholder()}
            disabled={disabled || isLoading}
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-base font-medium placeholder:text-muted-foreground/50 px-3 py-4"
            style={{ fontSize: '16px' }}
          />

          {/* Send/Stop button */}
          {isLoading ? (
            <Button
              type="button"
              size="icon"
              onClick={onStop}
              className="h-12 w-12 shrink-0 rounded-full shadow-2xl transition-all duration-500 bg-destructive hover:bg-destructive/90 scale-100 shadow-destructive/40 hover:scale-105"
            >
              <Square className="w-5 h-5 fill-current" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={disabled || (!message.trim() && uploadedFiles.length === 0)}
              className={cn(
                "h-12 w-12 shrink-0 rounded-full shadow-2xl transition-all duration-500",
                (message.trim() || uploadedFiles.length > 0)
                  ? "bg-primary hover:bg-primary/90 scale-100 rotate-0 shadow-primary/40 hover:scale-105"
                  : "bg-muted scale-95 opacity-50 grayscale"
              )}
            >
              <Send className={cn("w-5 h-5 fill-current stroke-[1.5]", message.trim() && "translate-x-0.5 -translate-y-0.5")} />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
