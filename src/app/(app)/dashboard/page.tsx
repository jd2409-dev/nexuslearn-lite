"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Bot,
  BookOpen,
  ClipboardCheck,
  Timer,
  Lightbulb,
  Trophy,
  DollarSign,
  Star,
  Upload,
  BookCopy,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { doc, collection } from "firebase/firestore";

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
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { getAiRecommendations } from "@/ai/flows/get-ai-recommendations";
import { useEffect, useState } from "react";

const quickAccessItems = [
  {
    title: "AI Tutor",
    description: "Get instant help with homework and complex topics.",
    href: "/aichat",
    icon: Bot,
    image: PlaceHolderImages.find((img) => img.id === "ai-tutor"),
  },
  {
    title: "Generate a Quiz",
    description: "Create practice quizzes for any subject.",
    href: "/quiz",
    icon: ClipboardCheck,
    image: PlaceHolderImages.find((img) => img.id === "quiz"),
  },
  {
    title: "Learning Journal",
    description: "Organize your notes and reflections.",
    href: "/journal",
    icon: BookOpen,
    image: PlaceHolderImages.find((img) => img.id === "journal"),
  },
  {
    title: "Pomodoro Timer",
    description: "Focus your study sessions for maximum efficiency.",
    href: "/pomodoro",
    icon: Timer,
    image: PlaceHolderImages.find((img) => img.id === "pomodoro"),
  },
  {
    title: "Mistake Analysis",
    description: "Review past quizzes and learn from your mistakes.",
    href: "/reflection",
    icon: Lightbulb,
    image: PlaceHolderImages.find((img) => img.id === "reflection"),
  },
];


const iconMap: { [key: string]: React.ElementType } = {
    review: BookCopy,
    practice: ClipboardCheck,
    focus: Timer,
    default: Lightbulb
};


export default function Dashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  const userDocRef = useMemoFirebase(() =>
    user ? doc(firestore, `users/${user.uid}`) : null
  , [firestore, user]);
  const { data: userData } = useDoc(userDocRef);

  const achievementsCollectionRef = useMemoFirebase(() =>
    user ? collection(firestore, `users/${user.uid}/achievements`) : null
  , [firestore, user]);
  const { data: achievements } = useCollection(achievementsCollectionRef);

  const studyGoalsCollectionRef = useMemoFirebase(() =>
    user ? collection(firestore, `users/${user.uid}/studyGoals`) : null
    , [firestore, user]);
  const { data: studyGoals } = useCollection(studyGoalsCollectionRef);

   useEffect(() => {
    if (userData) {
      setLoadingRecs(true);
      const input = {
        studentGrade: userData.grade,
        studentBoard: userData.board,
        recentPerformance: "mixed",
      };
      getAiRecommendations(input)
        .then(response => {
          setRecommendations(response.recommendations);
          setLoadingRecs(false);
        })
        .catch(err => {
            console.error("Error fetching AI recommendations", err);
            setLoadingRecs(false);
        });
    }
  }, [userData]);


  const studyChallenges = studyGoals?.map(goal => ({
      title: goal.goalDescription,
      xp: 50, // Assuming a fixed XP for now
      completed: goal.completed,
  })) || [];


  return (
    <div className="flex-1 space-y-4">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">XP Points</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData?.xp || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coins</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData?.coins || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{achievements?.length || 0} / 50</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5 Days</div>
              <p className="text-xs text-muted-foreground">
                Keep it up!
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {quickAccessItems.map((item) => (
                <Card key={item.title} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <Link href={item.href}>
                    <CardHeader className="p-0">
                      {item.image && (
                         <Image
                            alt={item.title}
                            className="aspect-video w-full object-cover"
                            height="112"
                            src={item.image.imageUrl}
                            width="200"
                            data-ai-hint={item.image.imageHint}
                        />
                      )}
                    </CardHeader>
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
                {loadingRecs ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : recommendations.length > 0 ? (
                  recommendations.map((rec, index) => {
                    const Icon = iconMap[rec.type] || iconMap.default;
                    return (
                        <div key={index} className=" flex items-center gap-4 p-2 rounded-lg hover:bg-secondary">
                        <div className="p-2 bg-primary/10 rounded-md">
                            <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="grid gap-1">
                            <p className="text-sm font-medium leading-none">
                            {rec.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                            {rec.reason}
                            </p>
                        </div>
                        </div>
                    );
                  })
                ) : (
                    <p className="text-sm text-muted-foreground p-4 text-center">No recommendations available right now.</p>
                )}
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
                                <TableHead className="text-right">XP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studyChallenges.map(challenge => (
                                <TableRow key={challenge.title} className={challenge.completed ? 'text-muted-foreground line-through' : ''}>
                                    <TableCell>
                                        <div className="font-medium">{challenge.title}</div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={challenge.completed ? 'secondary' : 'outline'} className="text-accent-foreground border-accent">{challenge.xp} XP</Badge>
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
