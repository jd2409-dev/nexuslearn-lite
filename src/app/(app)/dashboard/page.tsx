
"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  BookOpen,
  ClipboardCheck,
  Timer,
  Lightbulb,
  Upload,
  Loader2,
  FileText,
  CalendarDays,
} from "lucide-react";
import { doc, collection, updateDoc } from "firebase/firestore";
import { format } from 'date-fns';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { useEffect } from "react";

const quickAccessItems = [
    {
        title: "AI Tutor",
        description: "Get instant help with homework and complex topics.",
        href: "/aichat",
        icon: Bot,
    },
    {
        title: "Generate a Quiz",
        description: "Create practice quizzes for any subject.",
        href: "/quiz",
        icon: ClipboardCheck,
    },
    {
        title: "Essay Grader",
        description: "Get AI-powered feedback on your writing.",
        href: "/essay-grader",
        icon: FileText,
    },
    {
        title: "Study Planner",
        description: "Generate a personalized study plan with AI.",
        href: "/study-planner",
        icon: CalendarDays,
    },
    {
        title: "Learning Journal",
        description: "Organize your notes and reflections.",
        href: "/journal",
        icon: BookOpen,
    },
    {
        title: "Pomodoro Timer",
        description: "Focus your study sessions for maximum efficiency.",
        href: "/pomodoro",
        icon: Timer,
    },
    {
        title: "Mistake Analysis",
        description: "Review past quizzes and learn from your mistakes.",
        href: "/reflection",
        icon: Lightbulb,
    },
];

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() =>
    user ? doc(firestore, `users/${user.uid}`) : null
  , [firestore, user]);
  const { data: userData } = useDoc(userDocRef);

  const studyGoalsCollectionRef = useMemoFirebase(() =>
    user ? collection(firestore, `users/${user.uid}/studyGoals`) : null
    , [firestore, user]);
  const { data: studyGoals } = useCollection(studyGoalsCollectionRef);


   useEffect(() => {
    if (userData && userDocRef) {
      // Daily Login XP
      const today = format(new Date(), 'yyyy-MM-dd');
      if (userData.lastLoginDate !== today) {
        updateDoc(userDocRef, {
          lastLoginDate: today,
        });
      }
    }
  }, [userData, userDocRef]);


  const studyChallenges = studyGoals?.map(goal => ({
      title: goal.goalDescription,
      completed: goal.completed,
  })) || [];

  if (isUserLoading || !userData) {
    return (
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin" />
        </div>
    )
  }

  return (
    <div className="flex-1 space-y-8">
        <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {quickAccessItems.map((item) => (
                <Card key={item.title} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <Link href={item.href}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
                      </div>
                      <CardDescription className="text-sm mt-2">{item.description}</CardDescription>
                    </CardContent>
                  </Link>
                </Card>
              ))}
                <Card className="flex flex-col items-center justify-center p-6 bg-card hover:bg-secondary transition-colors">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="text-base font-semibold text-center mb-1">Upload Textbook</h3>
                    <p className="text-xs text-muted-foreground text-center mb-4">Scan chapters and get AI-powered answers.</p>
                    <Button variant="outline" size="sm">Upload PDF</Button>
                </Card>
            </div>
          </div>
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle>AI Recommendations</CardTitle>
                  <CardDescription>
                    Personalized suggestions to boost your learning.
                  </CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1 bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="#">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
               <CardContent className="grid gap-4">
                 <div className="flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-sm text-muted-foreground">AI recommendations are currently unavailable.</p>
                  </div>
                </CardContent>
            </Card>
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Daily Study Challenges</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Challenge</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studyChallenges.map(challenge => (
                                <TableRow key={challenge.title} className={challenge.completed ? 'text-muted-foreground line-through' : ''}>
                                    <TableCell>
                                        <div className="font-medium">{challenge.title}</div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                       {challenge.completed ? <Badge variant="secondary">Done</Badge> : <Badge variant="outline">Pending</Badge>}
                                    </TableCell>
                                </TableRow>
                            ))}
                             {studyChallenges.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground">No study challenges for today.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}
