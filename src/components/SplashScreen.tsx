import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500);
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-50 via-white to-white pointer-events-none"
      />
      
      <div className="relative z-10 flex flex-col items-center px-6">
        <div className="overflow-hidden flex flex-col items-center">
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.8, ease: [0.19, 1, 0.22, 1] }}
            className="flex items-center gap-2 md:gap-4"
          >
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter flex items-center leading-none">
              <motion.span 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="text-black inline-block"
              >
                RED
              </motion.span>
              <motion.span 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="ml-2 md:ml-4 text-[#ef4444] inline-block"
              >
                WHALE
              </motion.span>
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1.2, duration: 2, ease: [0.19, 1, 0.22, 1] }}
            className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#ef4444] to-transparent mt-6"
          />
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 2, duration: 1 }}
            className="text-[10px] md:text-xs font-black tracking-[1em] text-neutral-500 uppercase mt-6 ml-[1em]"
          >
            Intelligence
          </motion.p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-16 flex flex-col items-center gap-2"
      >
        <p className="text-[10px] font-bold tracking-[0.4em] text-black/80 uppercase">
          Created by Shujan
        </p>
      </motion.div>
    </motion.div>
  );
}

