"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  PanelLeft,
  BotMessageSquare,
  ClipboardCheck,
  Book,
  Timer,
  Lightbulb,
  Search,
  FileText,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AppLogo } from "../icons"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/aichat", icon: BotMessageSquare, label: "AI Tutor" },
  { href: "/quiz", icon: ClipboardCheck, label: "Quizzes" },
  { href: "/essay-grader", icon: FileText, label: "Essay Grader" },
  { href: "/journal", icon: Book, label: "Journal" },
  { href: "/pomodoro", icon: Timer, label: "Pomodoro" },
  { href: "/reflection", icon: Lightbulb, label: "Reflection" },
];

const pageTitles: { [key: string]: string } = {
  "/dashboard": "Dashboard",
  "/aichat": "AI Tutor",
  "/quiz": "Quiz Generator",
  "/essay-grader": "Essay Grader",
  "/journal": "Learning Journal",
  "/pomodoro": "Pomodoro Timer",
  "/reflection": "Reflection",
};

export default function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "NexusLearn Lite";
  
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(p => p);
    if (paths.length === 0 || pathname === '/dashboard') return null;
    return (
      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <span>/</span>
        <span className="font-medium text-foreground">{title}</span>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <AppLogo className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">NexusLearn Lite</span>
            </Link>
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        {getBreadcrumbs() || <h1 className="font-semibold text-lg">{title}</h1>}
      </div>

      <div className="relative flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <Avatar>
              <AvatarImage src="https://picsum.photos/seed/avatar/32/32" alt="Avatar" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/">Logout</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
