// ModeSelector component - Unified mode selection dropdown
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sparkles, Crown, Brain, Globe, Radio, Zap, Check, Code2, Hammer, GraduationCap, Rocket, Waves, ListOrdered } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export type ChatMode = 'auto' | 'normal' | 'pro' | 'deep' | 'web' | 'think' | 'rtm' | 'code' | 'builder' | 'study' | 'fast' | 'redwhale' | 'stepbystep';

interface ModeSelectorProps {
  selectedMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  disabled?: boolean;
}

const modes = [
  {
    id: 'auto' as ChatMode,
    label: 'Auto',
    icon: Sparkles,
    description: 'Medium-length answers',
    color: 'text-purple-500',
  },
  {
    id: 'stepbystep' as ChatMode,
    label: 'Step-by-Step',
    icon: ListOrdered,
    description: 'Direct numbered steps',
    color: 'text-teal-500',
  },
  {
    id: 'normal' as ChatMode,
    label: 'Normal',
    icon: Zap,
    description: 'Balanced & powerful',
    color: 'text-blue-500',
  },
  {
    id: 'pro' as ChatMode,
    label: 'RED WHALE PRO',
    icon: Crown,
    description: 'Very long deep answers',
    color: 'text-amber-500',
  },
  {
    id: 'deep' as ChatMode,
    label: 'Deep Search',
    icon: Brain,
    description: 'Comprehensive analysis',
    color: 'text-primary',
  },
  {
    id: 'web' as ChatMode,
    label: 'Web Search',
    icon: Globe,
    description: 'Current web information',
    color: 'text-green-500',
  },
  {
    id: 'rtm' as ChatMode,
    label: 'RTM',
    icon: Radio,
    description: 'Real-time mode',
    color: 'text-emerald-500',
  },
  {
    id: 'think' as ChatMode,
    label: 'Thinking',
    icon: Brain,
    description: 'Show thought process',
    color: 'text-indigo-500',
  },
  {
    id: 'code' as ChatMode,
    label: 'WHALE CODE',
    icon: Code2,
    description: 'Advanced coding',
    color: 'text-cyan-500',
  },
  {
    id: 'builder' as ChatMode,
    label: 'WHALE BUILDER',
    icon: Hammer,
    description: 'Building guides',
    color: 'text-orange-500',
  },
  {
    id: 'study' as ChatMode,
    label: 'WHALE STUDY',
    icon: GraduationCap,
    description: 'Educational answers',
    color: 'text-green-500',
  },
  {
    id: 'fast' as ChatMode,
    label: 'WHALE FAST',
    icon: Rocket,
    description: 'Quick responses',
    color: 'text-red-500',
  },
  {
    id: 'redwhale' as ChatMode,
    label: 'RED WHALE V1',
    icon: Waves,
    description: 'Most unrestricted mode',
    color: 'text-primary',
  },
];

export function ModeSelector({ selectedMode, onModeChange, disabled }: ModeSelectorProps) {
  const currentMode = modes.find(m => m.id === selectedMode) || modes[0];
  const Icon = currentMode.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="h-10 w-10 shrink-0 hover:bg-primary/10 rounded-xl transition-all"
        >
          <Icon className={cn("w-5 h-5 transition-all", currentMode.color)} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 glass-panel rounded-3xl p-2 shadow-2xl">
        <DropdownMenuLabel className="px-3 py-2 text-xs font-black tracking-widest uppercase opacity-50">RED WHALE V1 MODEL</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />
        <div className="grid gap-1 mt-1">
          {modes.map((mode) => {
            const ModeIcon = mode.icon;
            const isSelected = mode.id === selectedMode;
            
            return (
              <DropdownMenuItem
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className={cn(
                  "cursor-pointer rounded-2xl p-3 transition-all duration-300",
                  isSelected ? "bg-primary/10 border-white/5 shadow-inner" : "hover:bg-white/5"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl bg-background shadow-lg", mode.color)}>
                      <ModeIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={cn("font-bold text-sm tracking-tight", isSelected ? "text-primary" : "text-foreground")}>{mode.label}</p>
                      <p className="text-[10px] text-muted-foreground/80 font-medium leading-tight">{mode.description}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <motion.div layoutId="mode-check">
                      <Check className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
