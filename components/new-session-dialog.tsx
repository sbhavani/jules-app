'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface NewSessionDialogProps {
  onSessionCreated?: () => void;
}

export function NewSessionDialog({ onSessionCreated }: NewSessionDialogProps) {
  const { client } = useJules();
  const [open, setOpen] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    sourceId: '',
    title: '',
    prompt: '',
  });

  useEffect(() => {
    if (open && client) {
      loadSources();
    }
  }, [open, client]);

  const loadSources = async () => {
    if (!client) return;

    try {
      setError(null);
      const data = await client.listSources();
      setSources(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, sourceId: data[0].id }));
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
  };

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
      });
      setOpen(false);
      setFormData({ sourceId: '', title: '', prompt: '' });
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
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            Start a new Jules session by selecting a source and providing instructions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source">Source Repository</Label>
            <Select
              value={formData.sourceId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, sourceId: value }))
              }
              disabled={sources.length === 0}
            >
              <SelectTrigger id="source">
                <SelectValue placeholder={sources.length === 0 ? "No repositories available" : "Select a repository"} />
              </SelectTrigger>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sources.length === 0 && !error && (
              <p className="text-xs text-muted-foreground">
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

          <div className="space-y-2">
            <Label htmlFor="title">Session Title (Optional)</Label>
            <Input
              id="title"
              placeholder="e.g., Fix authentication bug"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Instructions</Label>
            <Textarea
              id="prompt"
              placeholder="Describe what you want Jules to do..."
              value={formData.prompt}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, prompt: e.target.value }))
              }
              className="min-h-[120px]"
              required
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.sourceId || !formData.prompt}>
              {loading ? 'Creating...' : 'Create Session'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
