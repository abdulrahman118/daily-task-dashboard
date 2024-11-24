"use client";  // Add this at the top!

import KanbanBoard from '@/components/kanban/kanban-board';

export default function Home() {
  return (
    <main className="min-h-screen">
      <KanbanBoard />
    </main>
  );
}