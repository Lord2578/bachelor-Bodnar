"use client"

import { Bell, ChevronDown } from "lucide-react"
import { useRouter } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserProfileProps {
  name: string
  avatar: string
  initials: string
}

export function UserProfile({ name, avatar, initials }: UserProfileProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          sessionStorage.clear();
          
          window.location.href = '/';
          return;
        }
        
        router.push('/');
        router.refresh();
      } else {
        console.error('Error during logout');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        style={{ color: 'rgb(6,6,4)' }}
      >
        <Bell className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[rgb(251,187,20)] text-[10px] text-[rgb(6,6,4)]">
          3
        </span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2"
            style={{ color: 'rgb(6,6,4)' }}
          >
            <Avatar className="h-8 w-8 border-2" style={{ borderColor: 'rgb(251,187,20)' }}>
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback style={{ backgroundColor: 'rgb(251,187,20)', color: 'rgb(6,6,4)' }}>{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline">{name}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Help</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}


