'use client';

import { useState, useEffect, useCallback } from 'react';
import { useJules } from '@/lib/jules/provider';
import type { Source } from '@/types/jules';
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
import { Combobox } from '@/components/ui/combobox';
import { Plus, Loader2 } from 'lucide-react';

interface NewSessionDialogProps {
  onSessionCreated?: () => void;
  initialValues?: {
    sourceId?: string;
    title?: string;
    prompt?: string;
    startingBranch?: string;
  };
  trigger?: React.ReactNode;
}

export function NewSessionDialog({ onSessionCreated, initialValues, trigger }: NewSessionDialogProps) {
  const { client } = useJules();
  const [open, setOpen] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    sourceId: '',
    title: '',
    prompt: '',
    startingBranch: '',
    autoCreatePr: false,
  });

  const loadSources = useCallback(async () => {
    if (!client) return;

    try {
      setError(null);
      const data = await client.listSources();
      setSources(data);
      if (data.length > 0) {
        // Only set default source if not already set (e.g. from initialValues)
        setFormData((prev) => ({ ...prev, sourceId: prev.sourceId || data[0].id }));
      } else if (data.length === 0) {
        setError('No repositories found. Please connect a GitHub repository in the Jules web app first.');
      }
    } catch (err) {
      console.error('Failed to load sources:', err);
      // For 404 errors, show a helpful message
      if (err instanceof Error && err.message.includes('Resource not found')) {
        setError('Unable to load repositories. Please ensure you have connected at least one GitHub repository in the Jules web app.');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load repositories';
        setError(errorMessage);
      }
    }
  }, [client]);

  useEffect(() => {
    if (open) {
      // Apply initial values when dialog opens
      if (initialValues) {
        setFormData(prev => ({
          ...prev,
          sourceId: initialValues.sourceId || prev.sourceId,
          title: initialValues.title || prev.title,
          prompt: initialValues.prompt || prev.prompt,
          startingBranch: initialValues.startingBranch || prev.startingBranch,
        }));
      }
      
      if (client) {
        loadSources();
      }
    }
  }, [open, client, loadSources, initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !formData.sourceId || !formData.prompt) return;

    try {
      setLoading(true);
      setError(null);
      await client.createSession({
        sourceId: formData.sourceId,
        prompt: formData.prompt,
        title: formData.title || undefined,
        startingBranch: formData.startingBranch || undefined,
        autoCreatePr: formData.autoCreatePr,
      });
      setOpen(false);
      setFormData({ sourceId: '', title: '', prompt: '', startingBranch: '', autoCreatePr: false });
      setError(null);
      onSessionCreated?.();
    } catch (err) {
      console.error('Failed to create session:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button className="w-full sm:w-auto h-8 text-[10px] font-mono uppercase tracking-widest bg-purple-600 hover:bg-purple-500 text-white border-0">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Session
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
        <DialogHeader>
          <DialogTitle className="text-base">Create New Session</DialogTitle>
          <DialogDescription className="text-xs">
            Start a new Jules session by selecting a source and providing instructions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="source" className="text-xs font-semibold">Source Repository</Label>
            <Combobox
              id="source"
              options={sources.map((source) => ({
                value: source.id,
                label: source.name,
              }))}
              value={formData.sourceId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, sourceId: value }))
              }
              placeholder={sources.length === 0 ? "No repositories available" : "Select a repository"}
              searchPlaceholder="Search repositories..."
              emptyMessage="No repositories found."
              className={`text-xs ${sources.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            {sources.length === 0 && !error && (
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Connect a repository at{' '}
                <a
                  href="https://jules.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  jules.google.com
                </a>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="branch" className="text-xs font-semibold">Branch Name (Optional)</Label>
            <Input
              id="branch"
              placeholder="main"
              value={formData.startingBranch}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startingBranch: e.target.value }))
              }
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold">Session Title (Optional)</Label>
            <Input
              id="title"
              placeholder="e.g., Fix authentication bug"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prompt" className="text-xs font-semibold">Instructions</Label>
            <Textarea
              id="prompt"
              placeholder="Describe what you want Jules to do..."
              value={formData.prompt}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, prompt: e.target.value }))
              }
              className="min-h-[100px] text-xs"
              required
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="autoCreatePr"
              className="h-3.5 w-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 bg-black/20 border-white/20"
              checked={formData.autoCreatePr}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, autoCreatePr: e.target.checked }))
              }
            />
            <label
              htmlFor="autoCreatePr"
              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white/80"
            >
              Automatically create Pull Request when ready
            </label>
          </div>

          {error && (
            <div className="rounded bg-destructive/10 p-2.5">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.sourceId || !formData.prompt} className="h-8 text-xs">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Session'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
