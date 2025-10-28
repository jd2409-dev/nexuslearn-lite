
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLogo } from "@/components/icons";
import { BookOpen, Bot, ClipboardCheck, Lightbulb, Timer, Star, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, useUser } from "@/firebase";
import { initiateEmailSignIn } from "@/firebase/non-blocking-login";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";
import { createUserWithEmailAndPassword } from "firebase/auth";


const features = [
  {
    title: "AI Tutor",
    description: "Get instant help with homework and complex topics. Our AI is available 24/7 to answer your questions.",
    icon: Bot,
  },
  {
    title: "Generate a Quiz",
    description: "Create practice quizzes for any subject to test your knowledge and prepare for exams effectively.",
    icon: ClipboardCheck,
  },
  {
    title: "Learning Journal",
    description: "Organize your notes, thoughts, and reflections in a digital journal to consolidate your learning.",
    icon: BookOpen,
  },
  {
    title: "Pomodoro Timer",
    description: "Use the Pomodoro technique with our built-in timer to focus your study sessions and improve efficiency.",
    icon: Timer,
  },
  {
    title: "Mistake Analysis",
    description: "Our AI analyzes your quiz results to identify weak areas and provide personalized suggestions for improvement.",
    icon: Lightbulb,
  },
  {
    title: "Gamified Learning",
    description: "Stay motivated with daily challenges and track your progress.",
    icon: Star,
  },
];


const AuthDialog = ({ onOpenChange }: { onOpenChange: (open: boolean) => void }) => {
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupFullName, setSignupFullName] = useState("");
    const [signupBoard, setSignupBoard] = useState("");
    const [signupGrade, setSignupGrade] = useState("");
    const { user } = useUser();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        initiateEmailSignIn(auth, loginEmail, loginPassword);
    }

    const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
        const newUser = userCredential.user;
        if (newUser) {
          const userRef = doc(firestore, "users", newUser.uid);
          const userData = {
            id: newUser.uid,
            name: signupFullName,
            email: signupEmail,
            board: signupBoard,
            grade: signupGrade,
            lastLoginDate: new Date().toISOString().split('T')[0],
          };
          await setDoc(userRef, userData, { merge: true });
          onOpenChange(false);
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Signup Error", error);
      }
    };

    useEffect(() => {
        if (user) {
            onOpenChange(false);
            router.push("/dashboard");
        }
    }, [user, router, onOpenChange]);

    return (
        <Dialog onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>Log In / Sign Up</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                    <DialogTitle className="text-2xl">Welcome</DialogTitle>
                    <DialogDescription>
                    Enter your credentials to access your learning dashboard.
                    </DialogDescription>
                </DialogHeader>
                 <Tabs defaultValue="login">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Log In</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login" className="mt-6">
                        <form onSubmit={handleLogin}>
                            <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="m@example.com" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                            </div>
                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Log In</Button>
                            </div>
                        </form>
                    </TabsContent>
                    <TabsContent value="signup" className="mt-6">
                        <form onSubmit={handleSignup}>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="full-name">Full Name</Label>
                                    <Input id="full-name" placeholder="John Doe" required value={signupFullName} onChange={e => setSignupFullName(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input id="signup-email" type="email" placeholder="m@example.com" required value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="signup-password">Password</Label>
                                    <Input id="signup-password" type="password" required value={signupPassword} onChange={e => setSignupPassword(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="board">Board</Label>
                                        <Select value={signupBoard} onValueChange={setSignupBoard}>
                                            <SelectTrigger id="board">
                                                <SelectValue placeholder="Select Board" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cbse">CBSE</SelectItem>
                                                <SelectItem value="icse">ICSE</SelectItem>
                                                <SelectItem value="ib">IB</SelectItem>
                                                <SelectItem value="state">State Board</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="grade">Grade</Label>
                                        <Select value={signupGrade} onValueChange={setSignupGrade}>
                                            <SelectTrigger id="grade">
                                                <SelectValue placeholder="Select Grade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[...Array(5)].map((_, i) => (
                                                    <SelectItem key={i+8} value={`${i+8}`}>{`Grade ${i+8}`}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Create Account</Button>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}


export default function LandingPage() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (isUserLoading || user) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin" />
        </div>
    )
  }


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="#" className="flex items-center gap-2 font-bold">
            <AppLogo className="h-6 w-6 text-primary" />
            <span className="font-headline text-xl">NexusLearn Lite</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4">
            <AuthDialog onOpenChange={setAuthDialogOpen} />
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20 text-center">
          <div className="container">
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Supercharge Your Studies with AI
            </h1>
            <p className="mx-auto mt-4 max-w-[700px] text-lg text-muted-foreground md:text-xl">
              NexusLearn Lite is your personal AI-powered learning companion. Master any subject with smart tools designed for modern students.
            </p>
            <div className="mt-8">
                <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg">Get Started for Free</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <AuthDialog onOpenChange={setAuthDialogOpen} />
                    </DialogContent>
                </Dialog>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-card">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">All-in-One Learning Platform</h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground">
                Everything you need to succeed, from AI-powered help to proven study techniques.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                        <feature.icon className="h-8 w-8 text-primary" />
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <p>Built by JD Vinod</p>
            <p>For support, contact nexuslearnlite@gmail.com</p>
        </div>
      </footer>
    </div>
  );
}

    