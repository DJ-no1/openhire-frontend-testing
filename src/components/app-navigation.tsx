'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
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
    Menu,
    X
} from 'lucide-react';

interface NavigationItem {
    label: string;
    href: string;
    icon?: React.ReactNode;
}

interface AppNavigationProps {
    items: NavigationItem[];
    title: string;
    subtitle?: string;
}

export function AppNavigation({ items, title, subtitle }: AppNavigationProps) {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    const roleIcon = user?.role === 'recruiter' ? (
        <Building className="h-4 w-4" />
    ) : (
        <UserCheck className="h-4 w-4" />
    );

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Left side - Logo and title */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                {roleIcon}
                            </div>
                            <div className="ml-3">
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {title}
                                </h1>
                                {subtitle && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Desktop navigation */}
                        <div className="hidden md:flex md:ml-10 md:space-x-8">
                            {items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                                >
                                    {item.icon && <span className="mr-2">{item.icon}</span>}
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right side - User menu */}
                    <div className="flex items-center">
                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </Button>
                        </div>

                        {/* User dropdown */}
                        <div className="hidden md:flex md:items-center md:space-x-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center space-x-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {getUserInitials(user?.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {user?.name || 'User'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                {user?.role}
                                            </p>
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem>
                                        <User className="mr-2 h-4 w-4" />
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleSignOut}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Mobile navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-700">
                            {items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.icon && <span className="mr-3">{item.icon}</span>}
                                    {item.label}
                                </Link>
                            ))}

                            {/* Mobile user section */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                <div className="flex items-center px-3 py-2">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {getUserInitials(user?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="ml-3">
                                        <p className="text-base font-medium text-gray-900 dark:text-white">
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                            {user?.role}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-1">
                                    <button className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
                                        <User className="mr-3 h-5 w-5" />
                                        Profile
                                    </button>
                                    <button className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
                                        <Settings className="mr-3 h-5 w-5" />
                                        Settings
                                    </button>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                                    >
                                        <LogOut className="mr-3 h-5 w-5" />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
