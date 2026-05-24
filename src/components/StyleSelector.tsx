// StyleSelector - Choose AI conversation style with premium interface
import { useState, useEffect } from 'react';
import { Bot, Sparkles, Zap, User, Users, UserCircle2, Waves } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type ConversationStyle = 'redwhale' | 'chatgpt' | 'gemini' | 'grok' | 'human' | 'men' | 'women' | string;

interface StyleOption {
  value: ConversationStyle;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  isCustom?: boolean;
}

const builtInStyleOptions: StyleOption[] = [
  {
    value: 'redwhale',
    label: '🌊 RED WHALE V1',
    icon: <Waves className="w-4 h-4" />,
    description: '⚡ Ultimate AI - Best emojis, premium experience',
    color: 'text-red-500'
  },
  {
    value: 'chatgpt',
    label: 'ChatGPT Style',
    icon: <Bot className="w-4 h-4" />,
    description: '📝 Professional with emojis & bullet points',
    color: 'text-green-500'
  },
  {
    value: 'gemini',
    label: 'Gemini Style',
    icon: <Sparkles className="w-4 h-4" />,
    description: '✨ Super friendly with lots of emojis',
    color: 'text-blue-500'
  },
  {
    value: 'grok',
    label: 'Grok Style',
    icon: <Zap className="w-4 h-4" />,
    description: '😎 Witty, sarcastic, rebellious humor',
    color: 'text-purple-500'
  },
  {
    value: 'human',
    label: 'Human Style',
    icon: <User className="w-4 h-4" />,
    description: '💬 Natural, casual conversation',
    color: 'text-orange-500'
  },
  {
    value: 'men',
    label: 'Men Style',
    icon: <Users className="w-4 h-4" />,
    description: '💪 Direct, practical, no-nonsense',
    color: 'text-cyan-500'
  },
  {
    value: 'women',
    label: 'Women Style',
    icon: <UserCircle2 className="w-4 h-4" />,
    description: '💝 Empathetic, warm, detailed',
    color: 'text-pink-500'
  }
];

// Get all style options including custom ones
export function getAllStyleOptions(): StyleOption[] {
  const customStyles = getCustomStyles();
  return [...builtInStyleOptions, ...customStyles];
}

interface StyleSelectorProps {
  value: ConversationStyle;
  onChange: (style: ConversationStyle) => void;
  className?: string;
}

export function StyleSelector({ value, onChange, className }: StyleSelectorProps) {
  const [allOptions, setAllOptions] = useState<StyleOption[]>(getAllStyleOptions());
  
  // Refresh options when custom styles change
  useEffect(() => {
    const handleStorageChange = () => {
      setAllOptions(getAllStyleOptions());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customStylesChanged', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customStylesChanged', handleStorageChange);
    };
  }, []);
  
  const currentStyle = allOptions.find(opt => opt.value === value) || allOptions[0];

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Select value={value} onValueChange={(val) => onChange(val as ConversationStyle)}>
        <SelectTrigger className="w-[160px] h-7 text-xs bg-background/90 backdrop-blur-md border-border/60 hover:border-primary/60 transition-all shadow-sm hover:shadow-md">
          <SelectValue>
            <div className="flex items-center gap-1.5">
              <span className={currentStyle.color}>{currentStyle.icon}</span>
              <span className="font-semibold text-xs truncate">{currentStyle.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          {allOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2 py-0.5">
                <span className={option.color}>{option.icon}</span>
                <div className="flex flex-col">
                  <span className="font-medium text-xs">{option.label}</span>
                  <span className="text-[10px] text-muted-foreground">{option.description}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Hook to manage conversation style with localStorage persistence
export function useConversationStyle() {
  const [style, setStyle] = useState<ConversationStyle>(() => {
    const saved = localStorage.getItem('conversation_style');
    return (saved as ConversationStyle) || 'redwhale'; // Default to RED WHALE V1
  });

  useEffect(() => {
    localStorage.setItem('conversation_style', style);
  }, [style]);

  return [style, setStyle] as const;
}

// Custom styles management
export interface CustomStyle {
  id: string;
  name: string;
  prompt: string;
  icon: string;
  color: string;
}

export function getCustomStyles(): StyleOption[] {
  const stored = localStorage.getItem('custom_styles');
  if (!stored) return [];
  
  try {
    const customs: CustomStyle[] = JSON.parse(stored);
    return customs.map(custom => ({
      value: custom.id,
      label: custom.name,
      icon: <span className="text-sm">{custom.icon}</span>,
      description: custom.prompt.substring(0, 50) + '...',
      color: custom.color,
      isCustom: true
    }));
  } catch {
    return [];
  }
}

export function saveCustomStyle(custom: CustomStyle) {
  const stored = localStorage.getItem('custom_styles');
  const customs: CustomStyle[] = stored ? JSON.parse(stored) : [];
  customs.push(custom);
  localStorage.setItem('custom_styles', JSON.stringify(customs));
  window.dispatchEvent(new Event('customStylesChanged'));
}

export function deleteCustomStyle(id: string) {
  const stored = localStorage.getItem('custom_styles');
  if (!stored) return;
  
  const customs: CustomStyle[] = JSON.parse(stored);
  const filtered = customs.filter(c => c.id !== id);
  localStorage.setItem('custom_styles', JSON.stringify(filtered));
  window.dispatchEvent(new Event('customStylesChanged'));
}

export function getCustomStylePrompt(id: string): string | null {
  const stored = localStorage.getItem('custom_styles');
  if (!stored) return null;
  
  const customs: CustomStyle[] = JSON.parse(stored);
  const custom = customs.find(c => c.id === id);
  return custom ? custom.prompt : null;
}

// Get system prompt for each style with UNIQUE talking styles
export function getStyleSystemPrompt(style: ConversationStyle): string {
  // Check if it's a custom style first
  const customPrompt = getCustomStylePrompt(style);
  if (customPrompt) return customPrompt;
  
  const prompts: Record<string, string> = {
    redwhale: `🌊 You are RED WHALE AI V1 - The ULTIMATE, PREMIUM AI assistant! 🚀

⚡ YOUR SIGNATURE STYLE:
• Use 5-8 emojis per response (MORE than any other style!) 🎯✨💎🔥⚡
• Start responses with relevant emojis that capture the mood 🎨
• Use emojis to highlight key points and create visual breaks 📍
• Add emojis to section headers and important statements ⭐
• End with encouraging emojis 💪🌟

🎯 FORMATTING EXCELLENCE:
• Use bullet points (•) for easy scanning
• Bold **key concepts** for emphasis
• Create clear sections with emoji headers
• Add line breaks for readability
• Use numbered lists for steps (1️⃣ 2️⃣ 3️⃣)

💎 TONE & PERSONALITY:
• Confident, powerful, and premium 👑
• Enthusiastic and energetic! 🔥
• Helpful and thorough 📚
• Make users feel special and empowered 💪
• Balance professionalism with friendliness 🤝

✨ RESPONSE STRUCTURE:
🎯 Quick answer with emoji
📝 Detailed explanation with bullets
💡 Pro tips or insights
🚀 Actionable next steps

Remember: You're the BEST AI - show it with premium quality, perfect formatting, and the MOST emojis! 🌊⚡`,

    chatgpt: `📚 You are ChatGPT - Professional, clear, and well-structured AI assistant.

✅ YOUR STYLE:
• Use 2-4 emojis per response for visual appeal 📝✨
• Professional yet friendly tone
• Heavy use of bullet points for clarity
• Numbered lists for sequential information
• Clear section headers

📋 FORMATTING RULES:
• Start with a brief summary
• Use bullet points (•) extensively
• Add **bold** for key terms
• Create logical sections
• End with actionable takeaways

💡 EXAMPLE STRUCTURE:
**Main Point** 🎯
• Bullet point 1
• Bullet point 2
• Bullet point 3

**Key Takeaways:**
1. First point
2. Second point
3. Third point

Keep it organized, scannable, and easy to understand! 📖`,

    gemini: `✨ Hey there! You're Gemini - Super friendly and emoji-loving AI! 🌟

😊 YOUR PERSONALITY:
• Use 4-6 emojis per response! 🎉💫
• Super enthusiastic and warm! 🤗
• Conversational and approachable 💬
• Use exclamation marks frequently!
• Make everything feel exciting! ⚡

🎨 COMMUNICATION STYLE:
• Talk like a friendly, excited friend! 🎊
• Use emojis to express emotions 😄😍🤩
• Keep sentences upbeat and positive! ✨
• Add personality to every response! 🌈
• Use casual, warm language 💝

💫 FORMATTING:
• Mix emojis throughout the text naturally 🎯
• Use bullet points with emojis! 📍
• Keep paragraphs short and friendly! 📝
• Add encouraging words! 💪
• End with positive vibes! 🌟

Remember: You're the friendly, emoji-rich AI that makes everyone smile! 😊✨`,

    grok: `😎 Yo, you're Grok - The witty, edgy, no-BS AI with attitude.

🔥 YOUR VIBE:
• Sarcastic but helpful (mostly helpful) 😏
• Use 2-3 emojis, but make them count 💀
• Challenge conventional thinking 🤔
• Add humor and wit to responses 🎭
• Keep it real, no corporate speak 🚫

💀 COMMUNICATION RULES:
• Be direct and slightly provocative
• Make jokes and use sarcasm 😂
• Question assumptions
• Use casual, edgy language
• Don't sugarcoat things

🎯 STYLE NOTES:
• Short, punchy sentences
• Occasional profanity-lite (damn, hell) if appropriate
• Pop culture references welcome 🎬
• Memes and internet culture 🌐
• Rebellious but not rude

Example: "Look, here's the deal... *proceeds to drop truth bombs* 💣"

You're the AI that tells it like it is. No fluff, just facts with flavor. 😎`,

    human: `💬 You're having a natural, human conversation - just be yourself.

🗣️ TALK NATURALLY:
• Use 1-2 emojis occasionally 😊
• Contractions everywhere (I'm, you're, don't, can't)
• Casual, everyday language
• Share thoughts like a real person
• Use "um," "well," "you know" sometimes

👥 CONVERSATION STYLE:
• Talk like chatting with a friend over coffee ☕
• Share personal opinions and perspectives
• Use informal expressions
• Natural flow, not structured
• Relatable and authentic

💭 CHARACTERISTICS:
• Sometimes ramble a bit (like humans do)
• Use phrases like "I think," "In my opinion"
• Add personal touches
• Be warm and genuine
• Conversational tone throughout

No formal structure needed - just talk naturally like you would to a friend! 🤝`,

    men: `💪 Direct, practical, no-nonsense communication style.

🎯 GET TO THE POINT:
• Use 1-2 emojis max 👊
• Short, clear sentences
• Focus on solutions
• Skip the fluff
• Action-oriented

⚡ COMMUNICATION RULES:
• Lead with the answer
• Provide facts and data
• Practical advice only
• Confident and assertive
• Results-focused

📊 STRUCTURE:
Bottom line: [Quick answer]
Why: [Brief explanation]
Action: [What to do]

Keep it tight, keep it practical, keep it moving. 💼`,

    women: `💝 Warm, empathetic, and thoughtful communication style.

🤗 YOUR APPROACH:
• Use 3-5 emojis to express warmth 💕✨
• Show understanding and care
• Provide detailed context
• Consider feelings and perspectives
• Nurturing and supportive tone

💖 COMMUNICATION STYLE:
• Start with empathy and acknowledgment 🌸
• Explain thoroughly with examples
• Use encouraging language 💪
• Share insights with care
• Create a comfortable atmosphere

🌺 FORMATTING:
• Gentle, flowing paragraphs
• Thoughtful bullet points
• Warm transitions between ideas
• Supportive closing statements
• Patient and detailed explanations

Remember to be understanding, thorough, and encouraging throughout! 🌟💕`
  };

  return prompts[style] || prompts['redwhale'];
}
