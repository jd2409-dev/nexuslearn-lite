"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Book, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type JournalEntry = {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  subject: string;
};

const initialEntries: JournalEntry[] = [
  {
    id: 1,
    title: "Key Concepts of Photosynthesis",
    content: "Chlorophyll is the pigment that absorbs sunlight. The process is divided into light-dependent and light-independent reactions. ATP and NADPH are energy carriers.",
    createdAt: new Date("2023-10-26T10:00:00Z"),
    subject: "Biology",
  },
  {
    id: 2,
    title: "Newton's Laws of Motion",
    content: "1. Inertia: An object at rest stays at rest. 2. F=ma: Force equals mass times acceleration. 3. Action-Reaction: Every action has an equal and opposite reaction.",
    createdAt: new Date("2023-10-25T14:30:00Z"),
    subject: "Physics",
  },
];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(entries[0] || null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsCreating(false);
  };
  
  const handleCreateNew = () => {
    const newEntry: JournalEntry = {
      id: Date.now(),
      title: "New Entry",
      content: "",
      createdAt: new Date(),
      subject: "General"
    };
    setSelectedEntry(newEntry);
    setIsCreating(true);
  }

  const handleSaveEntry = () => {
    if (!selectedEntry) return;

    if (isCreating) {
      setEntries([selectedEntry, ...entries]);
      setIsCreating(false);
    } else {
      setEntries(entries.map(e => e.id === selectedEntry.id ? selectedEntry : e));
    }
  }

  const handleDeleteEntry = (id: number) => {
    setEntries(entries.filter(e => e.id !== id));
    if (selectedEntry?.id === id) {
        setSelectedEntry(entries.length > 1 ? entries[1] : null);
    }
  }

  const updateSelectedEntry = (field: keyof JournalEntry, value: string) => {
    if (selectedEntry) {
        setSelectedEntry({...selectedEntry, [field]: value});
    }
  }

  return (
    <div className="grid h-[calc(100vh-8rem)] w-full md:grid-cols-[300px_1fr]">
      <div className="flex flex-col border-r bg-card">
        <div className="flex h-14 items-center justify-between border-b px-4">
          <h2 className="text-lg font-semibold">My Journal</h2>
          <Button variant="ghost" size="icon" onClick={handleCreateNew}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          {entries.map((entry) => (
            <button
              key={entry.id}
              className={`flex w-full flex-col items-start gap-1 border-b p-4 text-left ${selectedEntry?.id === entry.id ? "bg-secondary" : ""}`}
              onClick={() => handleSelectEntry(entry)}
            >
              <div className="flex w-full items-center">
                <div className="font-semibold">{entry.title}</div>
                <div className="ml-auto text-xs text-muted-foreground">
                  {format(entry.createdAt, "MMM d")}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{entry.subject}</div>
              <div className="line-clamp-2 text-sm text-muted-foreground">{entry.content}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col">
        {selectedEntry ? (
          <>
            <div className="flex h-14 items-center gap-4 border-b bg-card px-4">
              <div className="flex-1">
                <Input 
                  value={selectedEntry.title} 
                  onChange={(e) => updateSelectedEntry('title', e.target.value)}
                  className="text-lg font-bold border-0 shadow-none focus-visible:ring-0"
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground px-3">
                  <span>{format(selectedEntry.createdAt, "PPPp")}</span>
                   |
                  <Input 
                    value={selectedEntry.subject} 
                    onChange={(e) => updateSelectedEntry('subject', e.target.value)}
                    className="h-auto p-0 border-0 shadow-none focus-visible:ring-0 bg-transparent w-24"
                  />
                </div>
              </div>
              <Button onClick={handleSaveEntry}>Save</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDeleteEntry(selectedEntry.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex-1 p-4">
              <Textarea
                value={selectedEntry.content}
                onChange={(e) => updateSelectedEntry('content', e.target.value)}
                placeholder="Start writing your notes..."
                className="h-full resize-none border-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border-dashed p-8 text-center">
            <Book className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-6 text-xl font-semibold">Your Learning Journal</h2>
            <p className="mt-2 text-center text-muted-foreground">
              Select an entry to view it, or create a new one to get started.
            </p>
            <Button className="mt-4" onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" /> Create New Entry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
