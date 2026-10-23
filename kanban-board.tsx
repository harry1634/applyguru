"use client";

import { useState, useCallback } from "react";
import { KanbanColumn } from "./kanban-column";
import { updateApplicationStatus } from "@/server/actions/applications";
import { KANBAN_COLUMNS, APPLICATION_STATUS_LABELS, type Application, type ApplicationStatus } from "@/types";
import { toast } from "sonner";

interface KanbanBoardProps {
  initialApplications: Application[];
  userId: string;
}

export function KanbanBoard({ initialApplications, userId }: KanbanBoardProps) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const byStatus = useCallback(
    (status: ApplicationStatus) => applications.filter((a) => a.status === status),
    [applications]
  );

  const handleDragStart = (id: string) => setDraggingId(id);
  const handleDragEnd = () => setDraggingId(null);

  const handleDrop = async (targetStatus: ApplicationStatus) => {
    if (!draggingId) return;
    const app = applications.find((a) => a.id === draggingId);
    if (!app || app.status === targetStatus) return;

    // Optimistic update
    setApplications((prev) =>
      prev.map((a) => (a.id === draggingId ? { ...a, status: targetStatus } : a))
    );
    setDraggingId(null);

    const result = await updateApplicationStatus(draggingId, targetStatus);
    if (result?.error) {
      // Rollback
      setApplications((prev) =>
        prev.map((a) => (a.id === draggingId ? { ...a, status: app.status } : a))
      );
      toast.error("Failed to update status");
    } else {
      toast.success(`Moved to ${APPLICATION_STATUS_LABELS[targetStatus]}`);
    }
  };

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {KANBAN_COLUMNS.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          applications={byStatus(status)}
          draggingId={draggingId}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
