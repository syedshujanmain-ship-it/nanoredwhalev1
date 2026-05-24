// UsageIndicator - Shows REAL-TIME API usage stats and IST-based renewal timer
import { useState, useEffect } from 'react';
import { Activity, Clock, Key } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsageIndicatorProps {
  className?: string;
}

export function UsageIndicator({ className }: UsageIndicatorProps) {
  const [requestsUsed, setRequestsUsed] = useState(0);
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [renewalTime, setRenewalTime] = useState('');
  
  const TOTAL_KEYS = 6;
  const REQUESTS_PER_KEY = 20;
  const TOTAL_REQUESTS = TOTAL_KEYS * REQUESTS_PER_KEY; // 120

  useEffect(() => {
    const updateStats = () => {
      // Get REAL request count from localStorage
      const storedRequests = localStorage.getItem('redwhale_requests_used');
      const used = storedRequests ? parseInt(storedRequests, 10) : 0;
      setRequestsUsed(used);
      
      // Get current key index
      const storedIndex = localStorage.getItem('redwhale_api_key_index');
      const index = storedIndex ? parseInt(storedIndex, 10) : 0;
      setCurrentKeyIndex(index);
      
      // Calculate time until 5:30 AM IST from CURRENT IST TIME
      const now = new Date();
      
      // Convert current UTC time to IST (UTC + 5:30)
      const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
      const nowIST = new Date(now.getTime() + istOffset);
      
      // Get current IST hours and minutes
      const currentISTHours = nowIST.getUTCHours();
      const currentISTMinutes = nowIST.getUTCMinutes();
      
      // Calculate next 5:30 AM IST
      let hoursUntilReset = 0;
      let minutesUntilReset = 0;
      
      // If current time is before 5:30 AM IST today
      if (currentISTHours < 5 || (currentISTHours === 5 && currentISTMinutes < 30)) {
        // Time until 5:30 AM today
        hoursUntilReset = 5 - currentISTHours;
        minutesUntilReset = 30 - currentISTMinutes;
        
        if (minutesUntilReset < 0) {
          hoursUntilReset -= 1;
          minutesUntilReset += 60;
        }
      } else {
        // Time until 5:30 AM tomorrow
        hoursUntilReset = 24 - currentISTHours + 5;
        minutesUntilReset = 30 - currentISTMinutes;
        
        if (minutesUntilReset < 0) {
          hoursUntilReset -= 1;
          minutesUntilReset += 60;
        }
        
        if (hoursUntilReset >= 24) {
          hoursUntilReset -= 24;
        }
      }
      
      // Check if it's exactly 5:30 AM IST - reset counters
      if (currentISTHours === 5 && currentISTMinutes === 30) {
        localStorage.setItem('redwhale_requests_used', '0');
        localStorage.setItem('redwhale_api_key_index', '0');
        setRequestsUsed(0);
        setCurrentKeyIndex(0);
        setRenewalTime('Resetting...');
      } else {
        setRenewalTime(`${hoursUntilReset}h ${minutesUntilReset}m`);
      }
    };
    
    updateStats();
    
    // Update every 30 seconds for real-time accuracy
    const interval = setInterval(updateStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const remainingRequests = TOTAL_REQUESTS - requestsUsed;
  const remainingKeys = TOTAL_KEYS - currentKeyIndex;

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg text-[10px] font-medium",
      className
    )}>
      {/* Requests Used/Remaining */}
      <div className="flex items-center gap-1">
        <Activity className="w-3 h-3 text-primary" />
        <span className="text-foreground/80">
          <span className="font-bold text-foreground">{requestsUsed}</span>
          <span className="text-muted-foreground mx-0.5">/</span>
          <span className="text-muted-foreground">{TOTAL_REQUESTS}</span>
        </span>
      </div>

      {/* Separator */}
      <div className="w-px h-3 bg-border/50" />

      {/* Remaining Keys */}
      <div className="flex items-center gap-1">
        <Key className="w-3 h-3 text-blue-500" />
        <span className="font-bold text-foreground">{remainingKeys}</span>
      </div>

      {/* Separator */}
      <div className="w-px h-3 bg-border/50" />

      {/* Renewal Time (IST-based) */}
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3 text-amber-500" />
        <span className="font-bold text-foreground">{renewalTime}</span>
      </div>
    </div>
  );
}
