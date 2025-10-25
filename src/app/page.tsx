"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppleIcon, GoogleIcon, MicrosoftIcon, AppLogo } from "@/components/icons";
import { CheckCircle } from "lucide-react";

export default function LoginPage() {
  const features = [
    "Personalized Learning Journal",
    "Effective Pomodoro Timer",
    "Custom Quiz Generator",
    "Instant AI Tutor",
    "Insightful Reflection Tools",
    "Gamified Learning Experience",
  ];

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex-col items-center justify-center bg-card p-8 lg:flex">
        <div className="mx-auto grid w-[450px] gap-6">
          <div className="flex items-center gap-4">
            <AppLogo className="h-10 w-10 text-primary" />
            <h1 className="font-headline text-3xl font-bold">NexusLearn AI</h1>
          </div>
          <p className="text-muted-foreground">
            Your personal AI-powered learning companion. Master any subject with smart tools designed for modern students.
          </p>
          <div className="grid gap-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-foreground/80">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 lg:p-12">
        <Card className="mx-auto w-full max-w-md border-0 bg-transparent shadow-none lg:border lg:bg-card lg:shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>
              Enter your credentials to access your learning dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <Link href="#" className="ml-auto inline-block text-sm underline">
                        Forgot your password?
                      </Link>
                    </div>
                    <Input id="password" type="password" required />
                  </div>
                  <Link href="/dashboard" className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Log In</Button>
                  </Link>
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline"><GoogleIcon className="h-5 w-5" /></Button>
                    <Button variant="outline"><AppleIcon className="h-5 w-5" /></Button>
                    <Button variant="outline"><MicrosoftIcon className="h-5 w-5" /></Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="signup" className="mt-6">
                 <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="full-name">Full Name</Label>
                        <Input id="full-name" placeholder="John Doe" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input id="signup-email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input id="signup-password" type="password" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="board">Board</Label>
                            <Select>
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
                             <Select>
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
                     <Link href="/dashboard" className="w-full">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Create Account</Button>
                    </Link>
                 </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
