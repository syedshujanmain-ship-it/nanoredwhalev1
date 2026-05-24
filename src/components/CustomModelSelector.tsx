// CustomModelSelector - Quick selector for active custom model
import { useState, useEffect } from 'react';
import { Zap, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getCustomModels, type CustomModel } from './CustomModelDialog';

interface CustomModelSelectorProps {
  value: string | null;
  onChange: (modelId: string | null) => void;
  className?: string;
}

export function CustomModelSelector({ value, onChange, className }: CustomModelSelectorProps) {
  const [models, setModels] = useState<CustomModel[]>([]);

  const loadModels = () => {
    setModels(getCustomModels());
  };

  useEffect(() => {
    loadModels();
    
    const handleChange = () => {
      loadModels();
    };
    
    window.addEventListener('customModelsChanged', handleChange);
    return () => window.removeEventListener('customModelsChanged', handleChange);
  }, []);

  if (models.length === 0) {
    return null; // Don't show if no custom models
  }

  const currentModel = models.find(m => m.id === value);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {value && currentModel ? (
        <div className="flex items-center gap-1 px-2 h-7 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-md">
          <span className="text-sm">{currentModel.icon}</span>
          <span className={`text-xs font-semibold ${currentModel.color}`}>
            {currentModel.name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
            className="h-4 w-4 p-0 hover:bg-destructive/20 ml-1"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <Select value={value || 'none'} onValueChange={(val) => onChange(val === 'none' ? null : val)}>
          <SelectTrigger className="w-[140px] h-7 text-xs bg-background/90 backdrop-blur-md border-border/60 hover:border-blue-500/60 transition-all shadow-sm">
            <SelectValue>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-medium text-xs">Add Model</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <div className="flex items-center gap-2">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs">No Model</span>
              </div>
            </SelectItem>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{model.icon}</span>
                  <span className={`text-xs font-medium ${model.color}`}>
                    {model.name}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
