"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Calendar, LayoutDashboard, Users, DollarSign, Menu, X, FileText, User } from "lucide-react"
import type { SVGProps } from "react"
import { useState, useEffect } from "react"

import { cn } from "@/lib/utils"

const teacherNavItems = [
  {
    title: "Dashboard",
    href: "/teacher",
    icon: LayoutDashboard,
  },
  {
    title: "Calendar",
    href: "/teacher/calendar",
    icon: Calendar,
  },
  {
    title: "Students",
    href: "/teacher/students",
    icon: Users,
  },
  {
    title: "Homework",
    href: "/teacher/homework",
    icon: ({ className, ...props }: SVGProps<SVGSVGElement>) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("h-4 w-4", className)}
        {...props}
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
    ),
  },
  {
    title: "Learning Materials",
    href: "/learning-materials",
    icon: FileText,
  },
  {
    title: "Salary",
    href: "/teacher/salary",
    icon: DollarSign,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
  // {
  //   title: "Info Portal",
  //   href: "/teacher/info",
  //   icon: Mail,
  // },
]

export function TeacherSidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkIfMobile()
    
    window.addEventListener('resize', checkIfMobile)
    
    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [])

  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false)
    }
  }, [pathname, isMobile])

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-2 left-4 z-50 p-2 rounded-md bg-background shadow-md"
        style={{ color: 'rgb(6,6,4)' }}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      
      <div className={cn(
        "sidebar-container fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-background transition-all duration-300 lg:static",
        isMobile ? (isMobileMenuOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0",
        "w-[240px] lg:translate-x-0"
      )}>
        <div className="flex h-20 items-center border-b px-4" style={{ backgroundColor: 'white', borderColor: 'rgb(251,187,20)' }}>
          <Link href="/" className="flex items-center gap-2 font-semibold w-full">
            <div className="relative w-8 h-8">
              <Image 
                src="/svg/netable.svg" 
                alt="NE TABLE logo" 
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
            <span className="text-base font-bold" style={{ color: 'rgb(6,6,4)' }}>NE TABLE School</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2" style={{ backgroundColor: 'white' }}>
          <nav className="grid items-start px-2 text-sm font-medium">
            {teacherNavItems.map((item, index) => {
              const isActive = pathname === item.href || 
                (pathname.startsWith(item.href + "/") && item.href !== "/teacher") || 
                (item.href === "/teacher" && pathname === "/teacher");
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    isActive 
                      ? "bg-[rgb(251,187,20)] text-[rgb(6,6,4)]" 
                      : "hover:bg-gray-100 text-[rgb(6,6,4)]",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
      
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

