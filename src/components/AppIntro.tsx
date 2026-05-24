// AppIntro - Premium splash screen for RW V1 AI
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface AppIntroProps {
  onComplete: () => void;
}

export function AppIntro({ onComplete }: AppIntroProps) {
  const [fadeOut, setFadeOut] = useState(false);
  const { resolvedTheme, theme } = useTheme();

  const LOGO_DARK = "https://miaoda-conversation-file.s3cdn.medo.dev/user-9sa4bdd5i7ls/conv-9wmtzj72n9xc/20260227/file-9wokbl0iduyp.png";
  const LOGO_LIGHT = "https://miaoda-conversation-file.s3cdn.medo.dev/user-9sa4bdd5i7ls/conv-9wmtzj72n9xc/20260227/file-9wokbl0idc00.png";
  const currentLogo = (resolvedTheme || theme) === 'dark' ? LOGO_DARK : LOGO_LIGHT;

  useEffect(() => {
    // Start fade out after 2 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    // Complete after 2.5 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-background via-background to-muted transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        {/* Premium Logo */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-blue-500 to-red-500 rounded-full blur-xl opacity-30 animate-pulse" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-background shadow-2xl flex items-center justify-center border-2 border-primary/20">
            <img
              src={currentLogo}
              alt="RW V1 AI"
              className="w-[80%] h-[80%] object-contain rounded-full"
            />
          </div>
        </div>

        {/* Premium Text */}
        <div className="text-center space-y-2">
          <h1
            className="text-2xl sm:text-3xl font-black tracking-[0.3em] uppercase"
            style={{
              fontFamily: '"SF Pro Display", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
              fontWeight: 900,
              textShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}
          >
            <span className="text-red-600 dark:text-red-500">RW</span>
            {' '}
            <span className="text-blue-600 dark:text-blue-500">V1</span>
            {' '}
            <span className="text-foreground">AI</span>
          </h1>
          <p
            className="text-xs sm:text-sm text-muted-foreground font-semibold tracking-wider"
            style={{
              fontFamily: '"SF Pro Display", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
            }}
          >
            Created by <span className="text-foreground font-black">SHUJAN</span>
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex gap-1.5 mt-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
