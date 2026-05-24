import { useState, useEffect } from 'react';
import { Github, Loader2, ExternalLink, Copy, Check, Rocket, AlertTriangle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { pushToGitHub, type PushResult } from '@/utils/githubPush';
import { toast } from 'sonner';

interface GitHubPushDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GitHubPushDialog({ open, onOpenChange }: GitHubPushDialogProps) {
  const [token, setToken] = useState('');
  const [repoName, setRepoName] = useState('red-whale-v1');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [result, setResult] = useState<PushResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handlePush = async () => {
    if (!token.trim()) {
      toast.error('Please enter your GitHub Personal Access Token');
      return;
    }
    if (!repoName.trim()) {
      toast.error('Please enter a repository name');
      return;
    }

    setLoading(true);
    setResult(null);
    setProgress('Starting...');
    setProgressPercent(0);

    const res = await pushToGitHub(
      token.trim(),
      repoName.trim(),
      isPrivate,
      (msg, current) => {
        setProgress(msg);
        setProgressPercent(current);
      }
    );

    setLoading(false);
    setResult(res);

    if (res.success) {
      toast.success('Pushed to GitHub successfully!');
      setCountdown(45); // 45s countdown for GitHub to fully propagate before Vercel deploy
    } else {
      toast.error(res.message);
    }
  };

  const copyRepoUrl = () => {
    if (result?.repoUrl) {
      navigator.clipboard.writeText(result.repoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('URL copied!');
    }
  };

  const reset = () => {
    setResult(null);
    setProgress('');
    setProgressPercent(0);
    setToken('');
    setRepoName('red-whale-v1');
    setIsPrivate(false);
    setCopied(false);
    setCountdown(0);
  };

  useEffect(() => {
    if (result?.success && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [result?.success, countdown]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[500px] bg-[#0a0a10] border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono">
            <Github className="h-5 w-5" />
            Push to GitHub
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-white/50">
            Push the complete source code to your GitHub repository for self-hosting on Vercel, Netlify, etc.
          </DialogDescription>
        </DialogHeader>

        {!result && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-mono text-xs text-white/70">GitHub Classic Token</Label>
                <a
                  href="https://github.com/settings/tokens/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-mono text-green-400 hover:text-green-300"
                >
                  <ExternalLink className="h-3 w-3" />
                  Get Token
                </a>
              </div>
              <Input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="bg-[#15151d] border-white/10 font-mono text-sm"
              />
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs font-mono text-yellow-400/80 space-y-1">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-semibold">MUST use Classic Token (NOT Fine-Grained)</span>
                </div>
                <p>Required scope: <strong>repo</strong> — Full control of private repositories</p>
                <p>Token is only used to push code and is never stored.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-xs text-white/70">Repository Name</Label>
              <Input
                placeholder="red-whale-v1"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="bg-[#15151d] border-white/10 font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-mono text-xs text-white/70">Private Repository</Label>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded border-white/20 bg-[#15151d]"
                />
              </div>
              <p className="text-xs font-mono text-white/40">
                {isPrivate
                  ? 'One-click Vercel deploy will NOT work. Use manual deploy.'
                  : 'Recommended — one-click Vercel deploy works'}
              </p>
            </div>

            {loading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-mono text-white/60">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {progress}
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handlePush}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-mono font-semibold gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Pushing...
                </>
              ) : (
                <>
                  <Github className="h-4 w-4" />
                  Push to GitHub
                </>
              )}
            </Button>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {result.success ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-center">
                  <div className="text-2xl mb-1">✅</div>
                  <p className="font-mono font-semibold text-green-400">Successfully pushed!</p>
                  <p className="font-mono text-xs text-white/60 mt-1 whitespace-pre-line">{result.message}</p>
                </div>

                {result.repoUrl && (
                  <div className="space-y-2">
                    <Label className="font-mono text-xs text-white/70">Repository URL</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={result.repoUrl}
                        readOnly
                        className="bg-[#15151d] border-white/10 font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyRepoUrl}
                        className="shrink-0 border-white/10"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {countdown > 0 ? (
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 text-center space-y-3">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-purple-400" />
                      <p className="font-mono text-sm text-white/60">GitHub is indexing your repo...</p>
                      <p className="font-mono text-3xl font-bold text-purple-400">{countdown}s</p>
                      <p className="font-mono text-xs text-white/40">Vercel needs the repo fully propagated before cloning</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCountdown(0)}
                        className="font-mono text-xs border-white/10"
                      >
                        Skip Wait — Deploy Now
                      </Button>
                    </div>
                  ) : (
                    <>
                      {!isPrivate && result.repoUrl && (
                        <a
                          href={`https://vercel.com/new/clone?repository-url=${encodeURIComponent(result.repoUrl)}&project-name=${encodeURIComponent(repoName)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#000] border border-white/10 font-mono text-sm font-semibold text-white hover:bg-white/5 transition-all"
                        >
                          <Rocket className="h-4 w-4" />
                          Deploy to Vercel
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}

                      <a
                        href={`https://app.netlify.com/start/deploy?repository=${encodeURIComponent(result.repoUrl || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#15151d] border border-white/10 font-mono text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Globe className="h-4 w-4" />
                        Deploy to Netlify
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>

                      {result.repoUrl && (
                        <a
                          href={result.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#15151d] border border-white/10 font-mono text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Github className="h-4 w-4" />
                          Open GitHub Repo
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
                <div className="text-2xl mb-1">❌</div>
                <p className="font-mono font-semibold text-red-400">Push failed</p>
                <p className="font-mono text-xs text-white/60 mt-1 whitespace-pre-line">{result.message}</p>
              </div>
            )}

            <Button
              onClick={reset}
              variant="outline"
              className="w-full font-mono text-sm gap-2 border-white/10"
            >
              <Github className="h-4 w-4" />
              Push Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
