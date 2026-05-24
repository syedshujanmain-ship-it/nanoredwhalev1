// ThemeSelector - Ultimate animated theme selector for Red Whale
import { useState } from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type AnimatedTheme = 'cyclone' | 'aurora' | 'fire' | 'ocean' | 'galaxy';

interface ThemeSelectorProps {
  selectedTheme: AnimatedTheme;
  onThemeChange: (theme: AnimatedTheme) => void;
}

const themes = [
  {
    id: 'cyclone' as AnimatedTheme,
    name: '🌪️ Cyclone',
    description: 'Red/Blue/White Storm',
    gradient: 'from-red-500 via-blue-500 to-white',
  },
  {
    id: 'aurora' as AnimatedTheme,
    name: '🌌 Aurora',
    description: 'Purple/Green/Cyan Lights',
    gradient: 'from-purple-500 via-green-500 to-cyan-500',
  },
  {
    id: 'fire' as AnimatedTheme,
    name: '🔥 Fire Storm',
    description: 'Orange/Red/Yellow Flames',
    gradient: 'from-orange-500 via-red-500 to-yellow-500',
  },
  {
    id: 'ocean' as AnimatedTheme,
    name: '🌊 Ocean Wave',
    description: 'Blue/Teal/White Waves',
    gradient: 'from-blue-500 via-teal-500 to-white',
  },
  {
    id: 'galaxy' as AnimatedTheme,
    name: '✨ Galaxy',
    description: 'Purple/Pink/Blue Space',
    gradient: 'from-purple-600 via-pink-500 to-indigo-500',
  },
];

export function ThemeSelector({ selectedTheme, onThemeChange }: ThemeSelectorProps) {
  const currentTheme = themes.find(t => t.id === selectedTheme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <Palette className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Ultimate Animated Themes
        </div>
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-3 w-full">
              <div className={`w-8 h-8 rounded-md bg-gradient-to-r ${theme.gradient} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm flex items-center gap-2">
                  {theme.name}
                  {selectedTheme === theme.id && (
                    <span className="text-xs text-primary">✓</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {theme.description}
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
