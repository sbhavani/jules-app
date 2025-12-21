"use client";

import { useState, useEffect } from "react";
import { SessionTemplate } from "@/types/jules";
import { saveTemplate } from "@/lib/templates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: SessionTemplate | null;
  onSave: () => void;
  initialValues?: Partial<SessionTemplate>;
}

export function TemplateFormDialog({
  open,
  onOpenChange,
  template,
  onSave,
  initialValues,
}: TemplateFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    prompt: "",
    title: "",
    tags: "", // Storing as string for input, will parse to array on save
  });

  useEffect(() => {
    if (open) {
      if (template) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          name: template.name,
          description: template.description,
          prompt: template.prompt,
          title: template.title || "",
          tags: template.tags?.join(", ") || "", // Convert array to comma-separated string
        });
      } else if (initialValues) {
        setFormData({
          name: initialValues.name || "",
          description: initialValues.description || "",
          prompt: initialValues.prompt || "",
          title: initialValues.title || "",
          tags: initialValues.tags?.join(", ") || "",
        });
      } else {
        setFormData({
          name: "",
          description: "",
          prompt: "",
          title: "",
          tags: "",
        });
      }
    }
  }, [open, template, initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedTags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");
      saveTemplate({
        id: template?.id,
        name: formData.name,
        description: formData.description,
        prompt: formData.prompt,
        title: formData.title,
        tags: parsedTags,
      });
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save template:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit Template" : "Create New Template"}
          </DialogTitle>
          <DialogDescription>
            {template
              ? "Update the details for this session template."
              : "Configure a new template for quick session creation."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="template-form"
          onSubmit={handleSubmit}
          className="space-y-4 pt-2"
        >
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold">
              Template Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., React Component Refactor"
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold">
              Description
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Brief description of what this template does"
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold">
              Default Session Title (Optional)
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g., Refactor Component"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags" className="text-xs font-semibold">
              Tags (comma-separated, optional)
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tags: e.target.value }))
              }
              placeholder="e.g., frontend, refactor, react"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prompt" className="text-xs font-semibold">
              Prompt Instructions
            </Label>
            <Textarea
              id="prompt"
              value={formData.prompt}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, prompt: e.target.value }))
              }
              placeholder="Enter the detailed instructions for Jules..."
              className="min-h-[100px] h-[200px] max-h-[300px] overflow-y-auto text-xs font-mono"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-8 text-[10px] font-mono uppercase tracking-widest"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-8 text-[10px] font-mono uppercase tracking-widest"
            >
              Save Template
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
