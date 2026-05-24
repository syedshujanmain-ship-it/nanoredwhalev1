// CustomModelDialog - Create custom AI models/modes
import { useState } from 'react';
import { Plus, Zap, Trash2, Settings, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export interface CustomModel {
  id: string;
  name: string;
  prompt: string;
  icon: string;
  color: string;
}

export function getCustomModels(): CustomModel[] {
  const stored = localStorage.getItem('custom_models');
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveCustomModel(model: CustomModel) {
  const models = getCustomModels();
  models.push(model);
  localStorage.setItem('custom_models', JSON.stringify(models));
  window.dispatchEvent(new Event('customModelsChanged'));
}

export function deleteCustomModel(id: string) {
  const models = getCustomModels();
  const filtered = models.filter(m => m.id !== id);
  localStorage.setItem('custom_models', JSON.stringify(filtered));
  window.dispatchEvent(new Event('customModelsChanged'));
}

export function getCustomModelPrompt(id: string): string | null {
  const models = getCustomModels();
  const model = models.find(m => m.id === id);
  return model ? model.prompt : null;
}

export function CustomModelDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [icon, setIcon] = useState('⚡');
  const [color, setColor] = useState('text-blue-500');
  const [customModels, setCustomModels] = useState<CustomModel[]>([]);

  const loadCustomModels = () => {
    setCustomModels(getCustomModels());
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      loadCustomModels();
    }
  };

  const handleCreate = () => {
    if (!name.trim() || !prompt.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const newModel: CustomModel = {
      id: `model_${Date.now()}`,
      name: name.trim(),
      prompt: prompt.trim(),
      icon: icon || '⚡',
      color: color || 'text-blue-500'
    };

    saveCustomModel(newModel);
    toast.success(`✅ Custom model "${name}" saved permanently! ⚡`, {
      description: 'Your model will be available even after closing the app'
    });
    
    // Reset form
    setName('');
    setPrompt('');
    setIcon('⚡');
    setColor('text-blue-500');
    
    // Reload list
    loadCustomModels();
  };

  const handleDelete = (id: string, modelName: string) => {
    deleteCustomModel(id);
    toast.success(`🗑️ Deleted "${modelName}" permanently`);
    loadCustomModels();
  };

  const handleExportBackup = () => {
    const data = {
      custom_styles: localStorage.getItem('custom_styles'),
      custom_models: localStorage.getItem('custom_models'),
      exported_at: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redwhale-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('💾 Backup downloaded successfully!', {
      description: 'Save this file to restore your styles and models later'
    });
  };

  const colorOptions = [
    { value: 'text-blue-500', label: 'Blue' },
    { value: 'text-green-500', label: 'Green' },
    { value: 'text-purple-500', label: 'Purple' },
    { value: 'text-red-500', label: 'Red' },
    { value: 'text-yellow-500', label: 'Yellow' },
    { value: 'text-pink-500', label: 'Pink' },
    { value: 'text-orange-500', label: 'Orange' },
    { value: 'text-cyan-500', label: 'Cyan' },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30 hover:border-blue-500/50 transition-all shadow-sm hover:shadow-md"
          title="Create Custom Model"
        >
          <Settings className="w-3.5 h-3.5 mr-1" />
          <span className="hidden sm:inline">Model</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            Custom AI Models & Modes
          </DialogTitle>
          <DialogDescription>
            Create specialized AI modes with custom behavior prompts. All models are saved permanently to your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Permanent Storage Info Banner */}
          <div className="px-3 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-foreground flex items-center gap-2 flex-1">
                <span className="text-base">💾</span>
                <span className="font-semibold">Permanent Storage:</span>
                <span className="text-muted-foreground">All custom models are saved to your browser and will persist even after closing the app!</span>
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportBackup}
                className="h-7 px-2 text-xs hover:bg-green-500/20 shrink-0"
                title="Download backup file"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Backup
              </Button>
            </div>
          </div>
          
          {/* Create New Model Form */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New Model
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="model-name" className="text-xs">Model Name</Label>
                <Input
                  id="model-name"
                  placeholder="e.g., Code Expert Pro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="model-icon" className="text-xs">Icon Emoji</Label>
                <Input
                  id="model-icon"
                  placeholder="⚡"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="h-8 text-sm"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="model-color" className="text-xs">Color</Label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setColor(opt.value)}
                    className={`h-8 rounded-md border-2 transition-all text-xs font-medium ${
                      color === opt.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    } ${opt.value}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="model-prompt" className="text-xs">Behavior Prompt</Label>
              <Textarea
                id="model-prompt"
                placeholder="You are an expert code reviewer. Analyze code for bugs, security issues, and performance problems. Provide detailed feedback with examples and best practices."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] text-sm resize-none"
              />
            </div>

            <Button
              onClick={handleCreate}
              className="w-full h-8 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create Custom Model
            </Button>
          </div>

          {/* Existing Custom Models */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Your Custom Models ({customModels.length})
            </h3>
            
            <ScrollArea className="flex-1 pr-3">
              {customModels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No custom models yet. Create one above! ⚡
                </div>
              ) : (
                <div className="space-y-2">
                  {customModels.map((model) => (
                    <div
                      key={model.id}
                      className="p-3 bg-muted/50 rounded-lg border border-border/50 hover:border-border transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <span className="text-lg mt-0.5">{model.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold text-sm ${model.color}`}>
                              {model.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {model.prompt}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(model.id, model.name)}
                          className="h-7 w-7 p-0 hover:bg-destructive/10 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
