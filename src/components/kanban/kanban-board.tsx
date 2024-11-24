"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Trash2 } from 'lucide-react';

// Define types for our task structure
interface Task {
  id: string;
  content: string;
}

interface TasksByStatus {
  todo: Task[];
  inProgress: Task[];
  done: Task[];
}

interface DragData {
  taskId: string;
  sourceStatus: keyof TasksByStatus;
}

const KanbanBoard = () => {
  const [tasks, setTasks] = useState<TasksByStatus>({
    todo: [],
      inProgress: [],
      done: []
  });

  // Load data from localStorage after component mounts
  useEffect(() => {
    const savedTasks = localStorage.getItem('daily-tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // Set default tasks only if no saved data
      setTasks({
        todo: [],
        inProgress: [],
        done: []
      });
    }
  }, []);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    if (tasks) {
      localStorage.setItem('daily-tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  
// Clear all tasks function
const clearAllTasks = () => {
  if (window.confirm('Are you sure you want to clear all tasks? This cannot be undone.')) {
    setTasks({
      todo: [],
      inProgress: [],
      done: []
    });
    localStorage.removeItem('daily-tasks');
  }
  };
  
  const [newTask, setNewTask] = useState('');
  const [draggedItem, setDraggedItem] = useState<{id: string, sourceColumn: keyof TasksByStatus} | null>(null);

  const handleDragStart = (e: React.DragEvent, task: Task, status: keyof TasksByStatus) => {
  // Set the drag data
  e.dataTransfer.setData('application/json', JSON.stringify({
    taskId: task.id,
    sourceStatus: status
  }));
  
  // Set the drag effect
  e.dataTransfer.effectAllowed = 'move';
  
  // Add visual feedback
  if (e.currentTarget instanceof HTMLElement) {
    e.currentTarget.classList.add('opacity-50');
  }
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    // Reset the visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('opacity-50');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Show this is a valid drop target
    e.dataTransfer.dropEffect = 'move';
    
    // Add visual feedback for the drop target
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add('bg-slate-200');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Remove drop target feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('bg-slate-200');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, toStatus: keyof TasksByStatus) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Remove drop target feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('bg-slate-200');
    }
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json')) as DragData;
      const { taskId, sourceStatus } = data;
      
      if (sourceStatus === toStatus) return;
      
      setTasks(prev => {
        const sourceTask = prev[sourceStatus].find(t => t.id === taskId);
        if (!sourceTask) return prev;
        
        return {
          ...prev,
          [sourceStatus]: prev[sourceStatus].filter(t => t.id !== taskId),
          [toStatus]: [...prev[toStatus], sourceTask]
        };
      });
    } catch (err) {
      console.error('Failed to process drop:', err);
    }
  };
  // const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
  //   console.log(`Drag end`);
  //   if (e.currentTarget instanceof HTMLElement) {
  //     e.currentTarget.style.opacity = '1';
  //   }
  //   setDraggedItem(null);
  // };

  const Statistics = () => {
    const stats = {
      total: tasks.todo.length + tasks.inProgress.length + tasks.done.length,
      completed: tasks.done.length,
      inProgress: tasks.inProgress.length,
      pending: tasks.todo.length,
      completionRate: tasks.todo.length + tasks.inProgress.length + tasks.done.length === 0 
        ? 0 
        : Math.round((tasks.done.length / (tasks.todo.length + tasks.inProgress.length + tasks.done.length)) * 100)
    };
  
    return (
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Total Tasks</h3>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            <span className="text-sm text-slate-500">tasks</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">In Progress</h3>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            <span className="text-sm text-slate-500">tasks</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Completed</h3>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <span className="text-sm text-slate-500">tasks</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Completion Rate</h3>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-indigo-600">{stats.completionRate}</p>
            <span className="text-sm text-slate-500">%</span>
          </div>
        </div>
      </div>
    );
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const task = {
      id: Date.now().toString(),
      content: newTask
    };
    setTasks(prev => ({
      ...prev,
      todo: [...prev.todo, task]
    }));
    setNewTask('');
  };

  const removeTask = (taskId: string, status: keyof TasksByStatus) => {
    setTasks(prev => ({
      ...prev,
      [status]: prev[status].filter(task => task.id !== taskId)
    }));
  };

  const Column = ({ title, status, tasks }: { 
    title: string; 
    status: keyof TasksByStatus; 
    tasks: Task[] 
  }) => (
    <div
      className="bg-white p-4 rounded-lg w-80 min-h-[300px] shadow-sm border border-slate-200"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, status)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-slate-800">{title}</h3>
        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-sm">
          {tasks.length}
        </span>
      </div>
      {tasks.map(task => (
        <Card
          key={task.id}
          className="mb-3 hover:shadow-md transition-all group relative cursor-grab active:cursor-grabbing border-slate-200"
          draggable="true"
          onDragStart={(e) => handleDragStart(e, task, status)}
          onDragEnd={handleDragEnd}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-slate-700">{task.content}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeTask(task.id, status)}
              className="h-8 w-8 p-0 hover:bg-slate-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4 text-slate-500 hover:text-slate-700" />
            </Button>
          </CardContent>
        </Card>
      ))}
      {tasks.length === 0 && (
        <div className="h-20 flex items-center justify-center text-slate-500 border-2 border-dashed rounded-lg">
          Drop tasks here
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Daily Task Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage and track your daily tasks efficiently</p>
          </div>
          {/* Clear All Button */}
          <Button 
            onClick={clearAllTasks}
            variant="outline" 
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Tasks
          </Button>
        </div>
  
        {/* Statistics Section */}
        <Statistics />
        
        {/* Task Input Section */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex gap-4">
            <Input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task for today"
              className="w-96"
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
            />
            <Button onClick={addTask} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
        
        {/* Kanban Board Section */}
        <div className="flex gap-8">
          <Column 
            title="To Do" 
            status="todo" 
            tasks={tasks.todo}
          />
          <Column 
            title="In Progress" 
            status="inProgress" 
            tasks={tasks.inProgress}
          />
          <Column 
            title="Done" 
            status="done" 
            tasks={tasks.done}
          />
        </div>
  
        {/* Optional: Add a footer or statistics section */}
        <div className="mt-8 text-sm text-slate-500 text-center">
          <p>Tip: Drag and drop tasks to update their status</p>
        </div>
      </div>
    </div>
  );

};

export default KanbanBoard;