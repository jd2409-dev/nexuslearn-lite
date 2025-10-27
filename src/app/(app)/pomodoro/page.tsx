"use client";

import React, { useState, useEffect } from "react";
import { Timer, Play, Pause, RotateCcw, Settings, Briefcase, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "work" | "shortBreak" | "longBreak";

const modeConfig: Record<Mode, { text: string; icon: React.ElementType }> = {
  work: { text: "Focus Session", icon: Briefcase },
  shortBreak: { text: "Short Break", icon: Coffee },
  longBreak: { text: "Long Break", icon: Coffee },
};

export default function PomodoroPage() {
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);

  const [mode, setMode] = useState<Mode>("work");
  const [time, setTime] = useState(workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    let newTime;
    if (mode === "work") newTime = workDuration * 60;
    else if (mode === "shortBreak") newTime = shortBreakDuration * 60;
    else newTime = longBreakDuration * 60;
    setTime(newTime);
    setIsActive(false);
  }, [mode, workDuration, shortBreakDuration, longBreakDuration]);

  useEffect(() => {
    if (!isActive) return;
    if (time <= 0) {
      handleTimerEnd();
      return;
    }
    const interval = setInterval(() => {
      setTime(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, time]);

  function handleTimerEnd() {
    if (mode === "work") {
      const newCycles = cycles + 1;
      setCycles(newCycles);
      if (newCycles % 4 === 0 && newCycles > 0) {
        switchMode("longBreak");
      } else {
        switchMode("shortBreak");
      }
    } else {
      switchMode("work");
    }
  }

  function switchMode(newMode: Mode) {
    setMode(newMode);
  }

  function toggleTimer() {
    setIsActive(active => !active);
  }

  function resetTimer() {
    setIsActive(false);
    // Resetting to 'work' mode should also trigger the time update via the first useEffect
    setMode("work");
    setCycles(0);
  }


  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  const totalDuration =
    (mode === "work"
      ? workDuration
      : mode === "shortBreak"
      ? shortBreakDuration
      : longBreakDuration) * 60;
  const progress = totalDuration > 0 ? (time / totalDuration) * 100 : 0;

  const ModeIcon = modeConfig[mode].icon;

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Timer /> Pomodoro Timer
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={mode === "work" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => switchMode("work")}
              >
                Focus
              </Button>
              <Button
                variant={mode === "shortBreak" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => switchMode("shortBreak")}
              >
                Short Break
              </Button>
              <Button
                variant={mode === "longBreak" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => switchMode("longBreak")}
              >
                Long Break
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-6">
          <div className="relative h-64 w-64">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              <circle
                className="stroke-current text-secondary"
                strokeWidth="4"
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
              ></circle>
              <circle
                className="stroke-current text-primary transition-all duration-1000 ease-linear"
                strokeWidth="4"
                strokeDasharray="283"
                strokeDashoffset={283 - (progress / 100) * 283}
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                transform="rotate(-90 50 50)"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-bold font-mono">
                {formatTime(time)}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                {ModeIcon && <ModeIcon className="h-4 w-4" />}
                <span>{modeConfig[mode].text}</span>
              </div>
            </div>
          </div>
          <div className="flex w-full items-center justify-center gap-4">
            <Button size="lg" className="w-48" onClick={toggleTimer}>
              {isActive ? (
                <Pause className="mr-2 h-5 w-5" />
              ) : (
                <Play className="mr-2 h-5 w-5" />
              )}
              {isActive ? "Pause" : "Start"}
            </Button>
            <Button size="lg" variant="outline" onClick={resetTimer}>
              <RotateCcw className="mr-2 h-5 w-5" />
              Reset
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Completed cycles: {cycles}
          </p>
          <Card className="w-full bg-secondary/50">
            <CardHeader className="flex-row items-center justify-between py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" /> Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 pb-4">
              <div className="grid gap-2">
                <Label htmlFor="work">Focus (min)</Label>
                <Input
                  id="work"
                  type="number"
                  min={1}
                  value={workDuration}
                  onChange={e =>
                    setWorkDuration(Math.max(1, Number(e.target.value)))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="short">Short Break (min)</Label>
                <Input
                  id="short"
                  type="number"
                  min={1}
                  value={shortBreakDuration}
                  onChange={e =>
                    setShortBreakDuration(Math.max(1, Number(e.target.value)))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="long">Long Break (min)</Label>
                <Input
                  id="long"
                  type="number"
                  min={1}
                  value={longBreakDuration}
                  onChange={e =>
                    setLongBreakDuration(Math.max(1, Number(e.target.value)))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
