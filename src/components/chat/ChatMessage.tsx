// ChatMessage component - Display individual chat messages
import { motion } from 'motion/react';
import { User, Copy, Check, Pencil, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Message } from '@/types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from 'next-themes';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  onEdit?: (messageIndex: number) => void;
  messageIndex?: number;
}

// Code Block Component with Copy Button
function CodeBlock({ children, inline }: { children: string; inline?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      toast.success('Code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  if (inline) {
    return (
      <code className="bg-primary/10 px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold border border-primary/20 text-primary">
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleCopyCode}
        className="absolute right-1.5 top-1.5 z-10 h-6 px-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 mr-1" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </>
        )}
      </Button>
      <pre className="bg-muted/90 p-3 pt-8 rounded-lg overflow-x-auto border border-border/50 shadow-md max-w-full" style={{ fontSize: '11px' }}>
        <code className="text-[11px] font-mono block leading-relaxed whitespace-pre-wrap break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>{children}</code>
      </pre>
    </div>
  );
}

export function ChatMessage({ message, isStreaming = false, onEdit, messageIndex }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const isUser = message.role === 'user';

  const LOGO_DARK = "https://miaoda-conversation-file.s3cdn.medo.dev/user-9sa4bdd5i7ls/conv-9wmtzj72n9xc/20260227/file-9wokbl0iduyp.png";
  const LOGO_LIGHT = "https://miaoda-conversation-file.s3cdn.medo.dev/user-9sa4bdd5i7ls/conv-9wmtzj72n9xc/20260227/file-9wokbl0idc00.png";
  const currentLogo = (resolvedTheme || theme) === 'dark' ? LOGO_DARK : LOGO_LIGHT;

  // Get text and images from parts
  const textParts = message.parts.filter(part => part.text);
  const imageParts = message.parts.filter(part => part.inlineData);
  const text = textParts.map(part => part.text).join(' ');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Message copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  const handleEdit = () => {
    if (onEdit && messageIndex !== undefined) {
      onEdit(messageIndex);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        'flex gap-4 mb-6 group w-full',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shadow-md thin-ring",
        isUser ? "bg-primary" : "bg-background"
      )}>
        {isUser ? (
          <User className="w-5 h-5 text-primary-foreground" />
        ) : (
          <img 
            src={currentLogo} 
            alt="Red Whale"
            className="w-full h-full object-contain"
          />
        )}
      </div>
      
      <div className={cn(
        "flex flex-col gap-1.5 max-w-[95%] md:max-w-[80%] min-w-0",
        isUser ? "items-end" : "items-start"
      )}>
        <div
          className={cn(
            'rounded-2xl px-3 py-2 break-words select-text shadow-md transition-all duration-300 border overflow-hidden max-w-full text-sm',
            'word-wrap-break-word overflow-wrap-anywhere hyphens-auto',
            isUser 
              ? 'bg-primary text-primary-foreground rounded-tr-sm hover:shadow-primary/20 border-primary/20' 
              : 'glass-card text-foreground rounded-tl-sm hover:shadow-primary/10 border-border/30'
          )}
          style={{
            wordWrap: 'break-word',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            hyphens: 'auto',
            fontSize: '14px'
          }}
        >
          {/* Display images if present */}
          {imageParts.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {imageParts.map((part, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden border border-border/50 max-w-full">
                  {part.inlineData?.mimeType.startsWith('image/') ? (
                    <img 
                      src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                      alt="Uploaded"
                      className="max-w-full h-auto"
                    />
                  ) : (
                    <div className="flex items-center gap-1.5 p-2 bg-background">
                      <FileText className="w-3 h-3 shrink-0" />
                      <span className="text-xs truncate">File</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Display text with proper markdown rendering */}
          {text && (
            isUser ? (
              <p className="text-xs whitespace-pre-wrap leading-relaxed select-text break-words" style={{ fontSize: '14px' }}>{text}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none select-text leading-relaxed break-words overflow-wrap-anywhere word-break-break-word hyphens-auto"
                style={{
                  wordWrap: 'break-word',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  maxWidth: '100%',
                  fontSize: '14px'
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    strong: ({ children }) => (
                      <strong className="font-extrabold text-foreground" style={{ fontWeight: 800 }}>
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-foreground/90">{children}</em>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-xl font-black mt-4 mb-3 text-foreground">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-bold mt-3 mb-2 text-foreground">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-bold mt-2 mb-1.5 text-foreground">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-3 leading-relaxed text-foreground">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed text-foreground">{children}</li>
                    ),
                    code: ({ inline, children }: any) => {
                      const codeString = String(children).replace(/\n$/, '');
                      return <CodeBlock inline={inline}>{codeString}</CodeBlock>;
                    },
                    pre: ({ children }) => <>{children}</>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-4 my-3 italic text-muted-foreground bg-muted/30 py-2 rounded-r">
                        {children}
                      </blockquote>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline font-semibold hover:text-primary/80 transition-colors"
                      >
                        {children}
                      </a>
                    ),
                    hr: () => <hr className="my-4 border-t-2 border-border/50" />,
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-3">
                        <table className="min-w-full border-collapse border border-border">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-muted">{children}</thead>
                    ),
                    tbody: ({ children }) => (
                      <tbody>{children}</tbody>
                    ),
                    tr: ({ children }) => (
                      <tr className="border-b border-border">{children}</tr>
                    ),
                    th: ({ children }) => (
                      <th className="px-3 py-2 text-left font-bold border border-border">{children}</th>
                    ),
                    td: ({ children }) => (
                      <td className="px-3 py-2 border border-border">{children}</td>
                    ),
                  }}
                >
                  {text}
                </ReactMarkdown>
              </div>
            )
          )}
        </div>

        {/* Action buttons */}
        {!isUser && text && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-[11px] rounded-full"
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
        )}

        {isUser && onEdit && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end mr-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-6 px-2 text-xs"
            >
              <Pencil className="w-3 h-3 mr-1" />
              Edit
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
