"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Building,
    UserCheck,
    LogOut,
    User,
    Settings,
    FileText,
    Calendar,
    Search,
    Briefcase,
    Users,
    BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function DashboardNavigation() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleSignOut = async () => {
        await signOut();
        router.push(user?.role === 'recruiter' ? '/recruiters/auth/signin' : '/auth/signin');
    };

    const getUserInitials = (name?: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Define navigation items based on user role
    const getNavigationItems = () => {
        if (user?.role === 'recruiter') {
            return [
                {
                    label: 'Dashboard',
                    href: '/dashboard',
                    icon: <BarChart3 className="h-4 w-4" />
                },
                {
                    label: 'Jobs',
                    href: '/dashboard/jobs',
                    icon: <Briefcase className="h-4 w-4" />
                },
                {
                    label: 'Applications',
                    href: '/dashboard/application',
                    icon: <FileText className="h-4 w-4" />
                },
                {
                    label: 'Candidates',
                    href: '/dashboard/candidates',
                    icon: <Users className="h-4 w-4" />
                },
                {
                    label: 'My Interviews',
                    href: '/dashboard/interview',
                    icon: <Calendar className="h-4 w-4" />
                }
            ];
        } else {
            // Candidate navigation
            return [
                {
                    label: 'Dashboard',
                    href: '/dashboard',
                    icon: <BarChart3 className="h-4 w-4" />
                },
                {
                    label: 'Browse Jobs',
                    href: '/dashboard/jobs',
                    icon: <Search className="h-4 w-4" />
                },
                {
                    label: 'My Applications',
                    href: `/dashboard/application/candidate/${user?.id}`,
                    icon: <FileText className="h-4 w-4" />
                },
                {
                    label: 'My Interviews',
                    href: '/dashboard/interview',
                    icon: <Calendar className="h-4 w-4" />
                }
            ];
        }
    };

    const navigationItems = getNavigationItems();

    const roleIcon = user?.role === 'recruiter' ? (
        <Building className="h-4 w-4" />
    ) : (
        <UserCheck className="h-4 w-4" />
    );

    const getRoleTitle = () => {
        return user?.role === 'recruiter' ? 'OpenHire Recruiter' : 'OpenHire';
    };

    const getRoleSubtitle = () => {
        return user?.role === 'recruiter' ? 'Talent Management Dashboard' : 'Job Search Dashboard';
    };

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Left side - Logo and navigation */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/dashboard" className="flex items-center">
                                <div className="bg-primary/10 p-2 rounded-lg">
                                    {roleIcon}
                                </div>
                                <div className="ml-3">
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {getRoleTitle()}
                                    </h1>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {getRoleSubtitle()}
                                    </p>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:ml-10 md:flex md:space-x-8">
                            {navigationItems.map((item) => {
                                const isActive = pathname === item.href ||
                                    (item.href !== '/dashboard' && pathname.startsWith(item.href));

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                            isActive
                                                ? "bg-primary/10 text-primary border-primary"
                                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
                                        )}
                                    >
                                        <span className="mr-2">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right side - User menu */}
                    <div className="flex items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-10 w-10 rounded-full"
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {getUserInitials(user?.app_metadata?.name || user?.email)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <div className="flex flex-col space-y-1 p-2">
                                    <p className="text-sm font-medium leading-none">
                                        {user?.app_metadata?.name || user?.email?.split('@')[0] || 'User'}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {roleIcon}
                                        <span className="text-xs text-muted-foreground capitalize">
                                            {user?.role}
                                        </span>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navigationItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== '/dashboard' && pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
                                    )}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}
