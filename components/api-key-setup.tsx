'use client';

import { useState } from 'react';
import { useJules } from '@/lib/jules/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ApiKeySetup() {
  const { setApiKey } = useJules();
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      setApiKey(key.trim());
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Hey there! Let's get Jules setup.</CardTitle>
          <CardDescription>
            Enter your Jules API key to get started. Get your key from the{' '}
            <a
              href="https://jules.google.com/settings"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              Jules web app settings
            </a>
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Your Jules API key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">e.g., sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally in your browser and never sent to any server except Jules API.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={!key.trim()}>
              Save your key
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-muted p-4 text-sm">
            <h4 className="font-semibold mb-2">Getting Started</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Visit <a href="https://jules.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">jules.google.com</a></li>
              <li>Connect a GitHub repository</li>
              <li>Go to Settings and create an API key</li>
              <li>Paste your API key above</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
