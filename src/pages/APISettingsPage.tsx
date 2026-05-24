// API Settings Page - Add your own Gemini API keys and choose models
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Trash2, Key, Settings, Save, X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { resetAPIKeyRotation } from '@/services/chat';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Available Gemini models
const GEMINI_MODELS = [
  { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental)' },
  { value: 'gemini-exp-1206', label: 'Gemini Experimental 1206' },
  { value: 'gemini-2.0-flash-thinking-exp-1219', label: 'Gemini 2.0 Flash Thinking' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Default)' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { value: 'gemini-1.5-flash-8b', label: 'Gemini 1.5 Flash 8B' },
];

interface CustomAPIKey {
  id: string;
  key: string;
  label: string;
  addedAt: string;
}

export function APISettingsPage() {
  const navigate = useNavigate();
  const [customKeys, setCustomKeys] = useState<CustomAPIKey[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [newKeyInput, setNewKeyInput] = useState('');
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Load custom keys and model on mount
  useEffect(() => {
    const stored = localStorage.getItem('redwhale_custom_api_keys');
    if (stored) {
      try {
        const keys = JSON.parse(stored);
        setCustomKeys(keys);
      } catch (e) {
        console.error('Failed to load custom API keys:', e);
      }
    }

    const storedModel = localStorage.getItem('redwhale_custom_model');
    if (storedModel) {
      setSelectedModel(storedModel);
    }
  }, []);

  // Save custom keys to localStorage
  const saveCustomKeys = (keys: CustomAPIKey[]) => {
    localStorage.setItem('redwhale_custom_api_keys', JSON.stringify(keys));
    setCustomKeys(keys);
  };

  // Add new API key
  const handleAddKey = () => {
    if (!newKeyInput.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    // Validate API key format (basic check)
    if (!newKeyInput.startsWith('AIzaSy')) {
      toast.error('Invalid Gemini API key format. Keys should start with "AIzaSy"');
      return;
    }

    const newKey: CustomAPIKey = {
      id: Date.now().toString(),
      key: newKeyInput.trim(),
      label: newKeyLabel.trim() || `API Key ${customKeys.length + 1}`,
      addedAt: new Date().toISOString(),
    };

    const updatedKeys = [...customKeys, newKey];
    saveCustomKeys(updatedKeys);
    
    // CRITICAL FIX: Reset API key rotation to use new keys immediately
    resetAPIKeyRotation();
    
    setNewKeyInput('');
    setNewKeyLabel('');
    setShowAddDialog(false);
    toast.success('API key added successfully! It will be used for your next request.');
  };

  // Remove API key
  const handleRemoveKey = (id: string) => {
    const updatedKeys = customKeys.filter(k => k.id !== id);
    saveCustomKeys(updatedKeys);
    
    // CRITICAL FIX: Reset API key rotation after removing keys
    resetAPIKeyRotation();
    
    toast.success('API key removed');
  };

  // Save model selection
  const handleSaveModel = () => {
    localStorage.setItem('redwhale_custom_model', selectedModel);
    toast.success('Model saved successfully');
  };

  // Reset to defaults
  const handleResetToDefaults = () => {
    localStorage.removeItem('redwhale_custom_api_keys');
    localStorage.removeItem('redwhale_custom_model');
    setCustomKeys([]);
    setSelectedModel('gemini-2.5-flash');
    
    // CRITICAL FIX: Reset API key rotation to use default keys
    resetAPIKeyRotation();
    
    toast.success('All API keys cleared. Add new keys to continue using the bot.');
  };

  return (
    <>
      <Helmet>
        <title>API Settings - Red Whale V1</title>
      </Helmet>

      <div className="flex min-h-screen flex-col bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">API Settings</h1>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleResetToDefaults}
              disabled={customKeys.length === 0}
            >
              Clear All Keys
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <ScrollArea className="flex-1">
          <div className="container max-w-4xl py-8 px-4 space-y-6">
            {/* Model Selection Card */}
            <Card>
              <CardHeader>
                <CardTitle>Gemini Model Selection</CardTitle>
                <CardDescription>
                  Choose which Gemini model to use for all chat modes. All models are completely unrestricted.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model-select">Select Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger id="model-select">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {GEMINI_MODELS.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveModel} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Model Selection
                </Button>
              </CardContent>
            </Card>

            {/* Custom API Keys Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your API Keys (Required)</CardTitle>
                <CardDescription>
                  Add your own Gemini API keys to use Red Whale V1. The bot requires at least one API key to function.
                  All features remain completely unrestricted.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Key Button */}
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New API Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New API Key</DialogTitle>
                      <DialogDescription>
                        Enter your Gemini API key. Get your free key from Google AI Studio.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="key-label">Label (Optional)</Label>
                        <Input
                          id="key-label"
                          placeholder="e.g., My Personal Key"
                          value={newKeyLabel}
                          onChange={(e) => setNewKeyLabel(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="api-key">API Key</Label>
                        <Input
                          id="api-key"
                          type="password"
                          placeholder="AIzaSy..."
                          value={newKeyInput}
                          onChange={(e) => setNewKeyInput(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddKey} className="flex-1">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Key
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAddDialog(false);
                            setNewKeyInput('');
                            setNewKeyLabel('');
                          }}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* List of Custom Keys */}
                {customKeys.length > 0 ? (
                  <div className="space-y-2">
                    <Label>Your API Keys ({customKeys.length})</Label>
                    <div className="space-y-2">
                      {customKeys.map((apiKey) => (
                        <div
                          key={apiKey.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-3">
                            <Key className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{apiKey.label}</p>
                              <p className="text-sm text-muted-foreground">
                                {apiKey.key.substring(0, 15)}...{apiKey.key.substring(apiKey.key.length - 4)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Added: {new Date(apiKey.addedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveKey(apiKey.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <Key className="mx-auto h-12 w-12 text-destructive" />
                    <h3 className="mt-4 font-semibold text-destructive">⚠️ No API Keys Added</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You must add at least one Gemini API key to use Red Whale V1.
                      The bot will not work without API keys.
                    </p>
                    <p className="mt-2 text-sm font-semibold text-primary">
                      Click "Add New API Key" above to get started!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="text-primary">Important Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>⚠️ API Keys Required:</strong> Red Whale V1 requires your own Gemini API keys to function. No default keys are provided.</p>
                <p>• Your API keys are stored locally in your browser and never sent to any server except Google's Gemini API.</p>
                <p>• If you add multiple keys, they will be used in rotation. When one reaches quota, it automatically switches to the next.</p>
                <p>• All features remain completely unrestricted regardless of which API keys are used.</p>
                <p>• You can get <strong>FREE</strong> Gemini API keys from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline font-semibold">Google AI Studio</a>.</p>
                <p>• Each free API key provides <strong>20 requests per day</strong>. Add multiple keys for more quota (e.g., 5 keys = 100 requests/day).</p>
                <p>• The selected model applies to all chat modes and custom keys.</p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
