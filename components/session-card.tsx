'use client';

import type { Session } from '@/types/jules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SessionCardProps {
  session: Session;
  isDragging?: boolean;
}

export function SessionCard({ session }: SessionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: session.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 'auto',
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.03 }}
      className="mb-4 rounded-lg bg-zinc-900/50 border border-white/[0.08] cursor-grab active:cursor-grabbing"
    >
      <CardHeader className="p-4 border-b border-white/[0.08]">
        <CardTitle className="text-sm font-medium text-white/80">{session.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-xs text-white/50">
          {session.summary || 'No summary available.'}
        </p>
      </CardContent>
    </motion.div>
  );
}
