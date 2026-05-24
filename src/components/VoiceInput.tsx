// VoiceInput component - Voice chat functionality
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
        toast.success(`Heard: "${transcript}"`);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          toast.error(`Voice input error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Failed to stop recognition:', error);
      }
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('🎤 Listening... Speak now');
      } catch (error) {
        console.error('Failed to start recognition:', error);
        toast.error('Failed to start voice input. Please try again.');
      }
    }
  };

  const toggleSpeaking = () => {
    if (!synthRef.current) {
      toast.error('Speech synthesis not supported in this browser');
      return;
    }

    const newState = !isSpeakingEnabled;
    setIsSpeakingEnabled(newState);
    
    if (!newState) {
      // Stop any ongoing speech
      synthRef.current.cancel();
      toast.info('Voice output disabled');
    } else {
      toast.success('🔊 Voice output enabled');
    }
  };

  // Function to speak text
  const speak = (text: string) => {
    if (!synthRef.current || !isSpeakingEnabled || !text) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    // Create new utterance
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.rate = 1.0;
    utteranceRef.current.pitch = 1.0;
    utteranceRef.current.volume = 1.0;
    utteranceRef.current.lang = 'en-US';

    utteranceRef.current.onstart = () => {
      console.log('Speech started');
    };

    utteranceRef.current.onend = () => {
      console.log('Speech ended');
    };

    utteranceRef.current.onerror = (event) => {
      console.error('Speech error:', event);
    };

    // Speak the text
    synthRef.current.speak(utteranceRef.current);
  };

  // Expose speak function globally
  useEffect(() => {
    (window as any).nanoSpeakResponse = (text: string) => {
      if (isSpeakingEnabled) {
        speak(text);
      }
    };
    
    return () => {
      delete (window as any).nanoSpeakResponse;
    };
  }, [isSpeakingEnabled]);

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant={isListening ? "default" : "outline"}
        size="icon"
        onClick={toggleListening}
        disabled={disabled}
        title={isListening ? "Stop listening" : "Start voice input"}
        className={isListening ? "animate-pulse" : ""}
      >
        {isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </Button>

      <Button
        type="button"
        variant={isSpeakingEnabled ? "default" : "outline"}
        size="icon"
        onClick={toggleSpeaking}
        disabled={disabled}
        title={isSpeakingEnabled ? "Disable voice output" : "Enable voice output"}
      >
        {isSpeakingEnabled ? (
          <Volume2 className="w-5 h-5" />
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
}
