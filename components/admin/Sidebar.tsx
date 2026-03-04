import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    GraduationCap,
    CreditCard,
    Bell,
    Layers,
    Settings,
    LogOut,
    BookOpen,
} from "lucide-react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "~/components/ui/hover-card";

const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Applications", href: "/admin/applications", icon: FileText },
    { name: "Students", href: "/admin/users", icon: GraduationCap },
    { name: "Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Cohorts", href: "/admin/cohorts", icon: Layers },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
            <div className="flex h-16 shrink-0 items-center px-6">
                <span className="text-xl font-bold tracking-tight text-primary">
                    Enrollment
                </span>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto">
                <nav className="flex-1 space-y-1 px-4 py-4">
                    {navigation.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive
                                        ? "text-primary"
                                        : "text-gray-400 group-hover:text-gray-500"
                                        }`}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t border-gray-200 p-4">
                <HoverCard openDelay={200} closeDelay={300}>
                    <HoverCardTrigger asChild>
                        <button
                            type="button"
                            className="flex w-full items-center rounded-md px-2 py-2 transition-colors hover:bg-gray-50"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <span className="text-sm font-medium leading-none">AD</span>
                            </div>
                            <div className="ml-3 flex min-w-0 flex-1 flex-col text-left">
                                <span className="truncate text-sm font-medium text-gray-900">Admin User</span>
                                <span className="truncate text-xs text-gray-500 mt-0.5">admin@example.com</span>
                            </div>
                        </button>
                    </HoverCardTrigger>
                    <HoverCardContent side="top" align="end" sideOffset={8} className="w-56 p-2">
                        <button
                            type="button"
                            className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            onClick={() => {
                                // TODO: Implement actual sign out when auth is added
                                console.log("Sign out clicked");
                            }}
                        >
                            <LogOut
                                className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                            />
                            Sign Out
                        </button>
                    </HoverCardContent>
                </HoverCard>
            </div>
        </div>
    );
}
