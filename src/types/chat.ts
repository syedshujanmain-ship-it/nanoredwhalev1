// Type definitions for Red Whale

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // base64 encoded
  };
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  parts: MessagePart[];
  timestamp: Date;
}

export interface ChatRequest {
  contents: Array<{
    role: 'user' | 'model';
    parts: MessagePart[];
  }>;
}

export interface ChatResponse {
  candidates?: Array<{
    content: {
      role: string;
      parts: MessagePart[];
    };
    finishReason?: string;
  }>;
  error?: string;
}

export interface UploadedFile {
  name: string;
  type: string;
  data: string; // base64
  mimeType: string;
  preview?: string; // for images
}
