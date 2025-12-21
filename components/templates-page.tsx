"use client";

import { useState, useEffect, useCallback } from "react";
import { SessionTemplate } from "@/types/jules";
import { getTemplates, deleteTemplate, saveTemplate } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Import Badge
import { Plus, Trash2, Edit2, Play, LayoutTemplate, Star } from "lucide-react"; // Import Star
import { TemplateFormDialog } from "./template-form-dialog";

interface TemplatesPageProps {
  onStartSession: (template: SessionTemplate) => void;
}

export function TemplatesPage({ onStartSession }: TemplatesPageProps) {
  const [templates, setTemplates] = useState<SessionTemplate[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<SessionTemplate | null>(null);

  const loadTemplates = useCallback(() => {
    setTemplates(getTemplates());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTemplates();
  }, [loadTemplates]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplate(id);
      loadTemplates();
    }
  };

  const handleToggleFavorite = (template: SessionTemplate) => {
    saveTemplate({
      ...template,
      isFavorite: !template.isFavorite,
    });
    loadTemplates();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-black">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-6">
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest uppercase">
              Session Templates
            </h2>
            <p className="text-[11px] text-white/40 mt-1 uppercase tracking-wide font-mono">
              Manage and use your reusable prompt templates
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="h-8 text-[10px] uppercase tracking-widest font-mono border-0"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create Template
          </Button>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-lg bg-white/5">
            <div className="bg-white/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutTemplate className="h-6 w-6 text-white/60" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">
              No templates yet
            </h3>
            <p className="text-[11px] text-white/40 max-w-sm mx-auto mb-6 font-mono uppercase tracking-wide leading-relaxed">
              Create your first template to save common prompts and
              configurations for quick reuse.
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              variant="outline"
              className="h-8 text-[10px] uppercase tracking-widest font-mono"
            >
              Create Template
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="group flex flex-col rounded-sm bg-zinc-950 border border-white/10 hover:border-white/20 transition-colors"
              >
                <CardHeader className="flex-1 p-4 pb-2">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <CardTitle className="text-xs font-bold text-white uppercase tracking-wide leading-tight">
                      {template.name}
                    </CardTitle>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 ${template.isFavorite ? "text-yellow-400" : "text-white/40"} hover:text-yellow-300 hover:bg-white/10`}
                        onClick={() => handleToggleFavorite(template)}
                        aria-label={
                          template.isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        <Star className="h-3 w-3 fill-current" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white/40 hover:text-white hover:bg-white/10"
                        onClick={() => setEditingTemplate(template)}
                        aria-label="Edit template"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white/40 hover:text-destructive hover:bg-white/10"
                        onClick={() => handleDelete(template.id)}
                        aria-label="Delete template"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-[10px] text-white/40 font-mono leading-relaxed line-clamp-3">
                    {template.description}
                  </CardDescription>
                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          className="text-[8px] font-mono uppercase px-1 py-0 h-4 bg-white/10 text-white/60 border-transparent"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardFooter className="p-4 pt-2 mt-auto">
                  <Button
                    className="w-full h-8 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-purple-500/30 text-[10px] uppercase tracking-widest font-mono transition-colors"
                    onClick={() => onStartSession(template)}
                  >
                    <Play className="h-3 w-3 mr-1.5 text-purple-500" />
                    Start Session
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <TemplateFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSave={loadTemplates}
      />

      <TemplateFormDialog
        open={!!editingTemplate}
        onOpenChange={(open) => !open && setEditingTemplate(null)}
        template={editingTemplate}
        onSave={loadTemplates}
      />
    </div>
  );
}
