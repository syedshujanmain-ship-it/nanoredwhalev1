// CustomStyleDialog - Create custom conversation styles
import { useState } from 'react';
import { Plus, Sparkles, Trash2, Download } from 'lucide-react';
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
import { saveCustomStyle, getCustomStyles, deleteCustomStyle, type CustomStyle } from './StyleSelector';
import { toast } from 'sonner';

export function CustomStyleDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [icon, setIcon] = useState('🎨');
  const [color, setColor] = useState('text-purple-500');
  const [customStyles, setCustomStyles] = useState<CustomStyle[]>([]);

  const loadCustomStyles = () => {
    const stored = localStorage.getItem('custom_styles');
    if (stored) {
      setCustomStyles(JSON.parse(stored));
    }
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      loadCustomStyles();
    }
  };

  const handleCreate = () => {
    if (!name.trim() || !prompt.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const newStyle: CustomStyle = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      prompt: prompt.trim(),
      icon: icon || '🎨',
      color: color || 'text-purple-500'
    };

    saveCustomStyle(newStyle);
    toast.success(`✅ Custom style "${name}" saved permanently! 🎉`, {
      description: 'Your style will be available even after closing the app'
    });
    
    // Reset form
    setName('');
    setPrompt('');
    setIcon('🎨');
    setColor('text-purple-500');
    
    // Reload list
    loadCustomStyles();
  };

  const handleDelete = (id: string, styleName: string) => {
    deleteCustomStyle(id);
    toast.success(`🗑️ Deleted "${styleName}" permanently`);
    loadCustomStyles();
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
    { value: 'text-purple-500', label: 'Purple' },
    { value: 'text-pink-500', label: 'Pink' },
    { value: 'text-blue-500', label: 'Blue' },
    { value: 'text-green-500', label: 'Green' },
    { value: 'text-yellow-500', label: 'Yellow' },
    { value: 'text-red-500', label: 'Red' },
    { value: 'text-orange-500', label: 'Orange' },
    { value: 'text-cyan-500', label: 'Cyan' },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50 transition-all shadow-sm hover:shadow-md"
          title="Create Custom Style"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span className="hidden sm:inline">Style</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Custom Conversation Styles
          </DialogTitle>
          <DialogDescription>
            Create your own AI personality with custom prompts. All styles are saved permanently to your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Permanent Storage Info Banner */}
          <div className="px-3 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-foreground flex items-center gap-2 flex-1">
                <span className="text-base">💾</span>
                <span className="font-semibold">Permanent Storage:</span>
                <span className="text-muted-foreground">All custom styles are saved to your browser and will persist even after closing the app!</span>
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
          
          {/* Create New Style Form */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New Style
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="style-name" className="text-xs">Style Name</Label>
                <Input
                  id="style-name"
                  placeholder="e.g., Pirate Captain"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="style-icon" className="text-xs">Icon Emoji</Label>
                <Input
                  id="style-icon"
                  placeholder="🎨"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="h-8 text-sm"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="style-color" className="text-xs">Color</Label>
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
              <Label htmlFor="style-prompt" className="text-xs">System Prompt</Label>
              <Textarea
                id="style-prompt"
                placeholder="You are a pirate captain AI! Talk like a pirate, use nautical terms, and add 'Arrr!' frequently. Be adventurous and bold!"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] text-sm resize-none"
              />
            </div>

            <Button
              onClick={handleCreate}
              className="w-full h-8 text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create Custom Style
            </Button>
          </div>

          {/* Existing Custom Styles */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Your Custom Styles ({customStyles.length})
            </h3>
            
            <ScrollArea className="flex-1 pr-3">
              {customStyles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No custom styles yet. Create one above! 🎨
                </div>
              ) : (
                <div className="space-y-2">
                  {customStyles.map((style) => (
                    <div
                      key={style.id}
                      className="p-3 bg-muted/50 rounded-lg border border-border/50 hover:border-border transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <span className="text-lg mt-0.5">{style.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold text-sm ${style.color}`}>
                              {style.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {style.prompt}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(style.id, style.name)}
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
