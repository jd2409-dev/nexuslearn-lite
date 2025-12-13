"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Book, Plus, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, doc, setDoc, deleteDoc, serverTimestamp, orderBy, query } from "firebase/firestore";
import { Loader2 } from "lucide-react";

type JournalEntry = {
  id: string;
  title: string;
  content: string;
  createdAt: any; 
  subject: string;
};

export default function JournalPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const journalCollectionRef = useMemoFirebase(() =>
    user ? collection(firestore, `users/${user.uid}/journalEntries`) : null
  , [firestore, user]);

  const journalQuery = useMemoFirebase(() =>
    journalCollectionRef ? query(journalCollectionRef, orderBy("createdAt", "desc")) : null
  , [journalCollectionRef]);

  const { data: entries, isLoading } = useCollection<Omit<JournalEntry, 'id'>>(journalQuery);

  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isLoading && entries && entries.length > 0 && !selectedEntry) {
      const firstEntry = entries[0];
      setSelectedEntry({
        ...firstEntry,
        createdAt: firstEntry.createdAt?.toDate(), 
      });
    }
  }, [entries, isLoading, selectedEntry]);

  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntry({
      ...entry,
      createdAt: entry.createdAt?.toDate ? entry.createdAt.toDate() : new Date(entry.createdAt),
    });
    setIsCreating(false);
  };
  
  const handleCreateNew = () => {
    const newEntry: JournalEntry = {
      id: `new-${Date.now()}`, 
      title: "New Entry",
      content: "",
      createdAt: new Date(),
      subject: "General"
    };
    setSelectedEntry(newEntry);
    setIsCreating(true);
  }

  const handleSaveEntry = async () => {
    if (!selectedEntry || !user) return;
    
    const entryData = {
        title: selectedEntry.title,
        content: selectedEntry.content,
        subject: selectedEntry.subject,
        createdAt: isCreating ? serverTimestamp() : selectedEntry.createdAt,
    };

    if (isCreating) {
      if (journalCollectionRef) {
        const docRef = await addDoc(journalCollectionRef, entryData);
        setSelectedEntry({ ...selectedEntry, id: docRef.id, createdAt: new Date() });
      }
      setIsCreating(false);
    } else {
      const entryDocRef = doc(firestore, `users/${user.uid}/journalEntries`, selectedEntry.id);
      await setDoc(entryDocRef, { ...entryData, createdAt: selectedEntry.createdAt }, { merge: true });
    }
  }

  const handleDeleteEntry = async (id: string) => {
    if (!user || isCreating) return;
    const entryDocRef = doc(firestore, `users/${user.uid}/journalEntries`, id);
    await deleteDoc(entryDocRef);
    if (selectedEntry?.id === id) {
        setSelectedEntry(entries && entries.length > 1 ? entries[0] : null);
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
          {isLoading && <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>}
          {entries?.map((entry) => (
            <button
              key={entry.id}
              className={`flex w-full flex-col items-start gap-1 border-b p-4 text-left ${selectedEntry?.id === entry.id ? "bg-secondary" : ""}`}
              onClick={() => handleSelectEntry(entry)}
            >
              <div className="flex w-full items-center">
                <div className="font-semibold">{entry.title}</div>
                <div className="ml-auto text-xs text-muted-foreground">
                  {entry.createdAt?.toDate && format(entry.createdAt.toDate(), "MMM d")}
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
                  <span>{selectedEntry.createdAt ? format(selectedEntry.createdAt, "PPPp") : 'Just now'}</span>
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
                  <Button variant="ghost" size="icon" disabled={isCreating}>
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
              {isLoading ? "Loading your journal..." : (entries && entries.length > 0 ? "Select an entry to view it." : "Create a new entry to get started.")}
            </p>
            {!isLoading && (!entries || entries.length === 0) && (
              <Button className="mt-4" onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" /> Create New Entry
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
