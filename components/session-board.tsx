'use client';

import { useState, useEffect } from 'react';
import type { Session } from '@/types/jules';
import { useJules } from '@/lib/jules/provider';
import { DndContext, DragEndEvent, DragOverlay, closestCorners, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { SessionColumn } from './session-column';
import { SessionCard } from './session-card';

type Columns = {
  [key: string]: Session[];
};

export function SessionBoard() {
  const { julesClient } = useJules();
  const [columns, setColumns] = useState<Columns>({
    active: [],
    paused: [],
    completed: [],
  });
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      const fetchedSessions = await julesClient.listSessions();
      const newColumns: Columns = {
        active: [],
        paused: [],
        completed: [],
      };
      for (const session of fetchedSessions) {
        if (session.status in newColumns) {
          newColumns[session.status].push(session);
        }
      }
      setColumns(newColumns);
    }
    fetchSessions();
  }, [julesClient]);

  const findContainer = (id: string) => {
    if (id in columns) {
      return id;
    }
    return Object.keys(columns).find((key) => columns[key].find((item) => item.id === id));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);

    if (!activeContainer || !overContainer) {
      return;
    }

    if (activeContainer === overContainer) {
      setColumns((prev) => {
        const activeItems = prev[activeContainer];
        const oldIndex = activeItems.findIndex((item) => item.id === active.id);
        const newIndex = activeItems.findIndex((item) => item.id === over.id);
        return {
          ...prev,
          [activeContainer]: arrayMove(activeItems, oldIndex, newIndex),
        };
      });
    } else {
      let draggedSession: Session | undefined;
      const newColumns = { ...columns };

      const oldColumn = newColumns[activeContainer];
      const activeIndex = oldColumn.findIndex((item) => item.id === active.id);
      if (activeIndex > -1) {
        draggedSession = oldColumn.splice(activeIndex, 1)[0];
      }

      if (draggedSession) {
        const newColumn = newColumns[overContainer];
        const overIndex = newColumn.findIndex((item) => item.id === over.id);

        if (overIndex > -1) {
          newColumn.splice(overIndex, 0, draggedSession);
        } else {
          newColumns[overContainer] = [...newColumns[overContainer], draggedSession];
        }

        const newStatus = overContainer as 'active' | 'paused' | 'completed';
        draggedSession.status = newStatus;
        julesClient.updateSession(draggedSession.id, { status: newStatus });

        setColumns(newColumns);
      }
    }
  };

  const activeSession = activeId ? Object.values(columns).flat().find((session) => session.id === activeId) : null;

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      collisionDetection={closestCorners}
    >
      <div className="flex-1 overflow-x-auto p-4 sm:p-6 md:p-8">
        <div className="flex gap-6">
          <SessionColumn id="active" title="Active" sessions={columns.active || []} />
          <SessionColumn id="paused" title="Paused" sessions={columns.paused || []} />
          <SessionColumn id="completed" title="Completed" sessions={columns.completed || []} />
        </div>
      </div>
      <DragOverlay>
        {activeSession ? <SessionCard session={activeSession} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
