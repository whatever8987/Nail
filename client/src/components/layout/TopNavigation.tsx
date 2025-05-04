import React, { useState } from 'react';
// Using wouter's Link for navigation structure, but it won't navigate anywhere real without a Router
import { Link } from 'wouter';
// Import UI components directly
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, PlusCircle } from 'lucide-react';

// Define dummy props or default values for display purposes
interface TopNavigationProps {
  user?: { username: string; email?: string; role: 'user' | 'admin' } | null;
  isLoggedIn?: boolean;
}

// Dummy user data for display when logged in
const dummyUser = {
    username: "TestUser",
    email: "test@example.com",
    role: "user" as const // Use 'admin' to test admin view
};

export function TopNavigation({ user = null, isLoggedIn = false }: TopNavigationProps = {}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = '/'; // Dummy location for isActive calculation

    // Dummy handler
    const handleLogout = () => {
      alert("Logout clicked!");
    };

    // Dummy active check
    const isActive = (path: string) => {
      return location === path;
    };

    // Sample nav items
    const navItems = [
      { name: "Dashboard", href: "/" },
      { name: "Templates", href: "/templates" },
      { name: "Pricing", href: "/pricing" },
      { name: "Help", href: "/help" },
    ];

    // Use dummyUser if isLoggedIn prop is true but no user passed
    const displayUser = isLoggedIn && !user ? dummyUser : user;
    const displayIsLoggedIn = isLoggedIn || !!displayUser;

    return (
        <nav className="bg-background border-b shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <svg className="h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12c0 1.2-4 6-9 6s-9-4.8-9-6c0-1.2 4-6 9-6s9 4.8 9 6z" /><circle cx="12" cy="12" r="3" /></svg>
                            <span className="ml-2 font-semibold text-xl text-foreground">SalonSite</span>
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`${isActive(item.href)
                                            ? "border-primary text-foreground"
                                            : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                         {/* Conditionally render based on props/dummy data */}
                        {displayIsLoggedIn && displayUser?.role === "admin" && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="mr-3 rounded-full"
                                onClick={() => alert('Admin action clicked!')}
                                title="Admin Action"
                            >
                                <PlusCircle className="h-5 w-5" />
                                <span className="sr-only">Admin Action</span>
                            </Button>
                        )}

                        {displayIsLoggedIn && displayUser ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src="" alt={displayUser.username} />
                                            <AvatarFallback>{displayUser.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                     <DropdownMenuLabel>
                                        <p className="text-sm font-medium leading-none">{displayUser.username}</p>
                                        {displayUser.email && <p className="text-xs leading-none text-muted-foreground pt-1">{displayUser.email}</p>}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/account">Account</Link>
                                    </DropdownMenuItem>
                                     <DropdownMenuItem asChild>
                                        <Link href="/portal">My Website</Link>
                                    </DropdownMenuItem>
                                     <DropdownMenuItem asChild>
                                        <Link href="/subscribe">Billing</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/login">Sign in</Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link href="/register">Sign up</Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu */}
                    <div className="-mr-2 flex items-center sm:hidden">
                       <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                          <SheetTrigger asChild>
                             <Button variant="ghost" size="icon" className="text-muted-foreground">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Open main menu</span>
                             </Button>
                          </SheetTrigger>
                          <SheetContent side="right" className="w-[280px]">
                             <nav className="flex flex-col space-y-2 mt-6">
                                {navItems.map((item) => (
                                   <Link
                                      key={item.name}
                                      href={item.href}
                                      className={`${isActive(item.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'} px-3 py-2 rounded-md text-base font-medium`}
                                      onClick={() => setMobileMenuOpen(false)}
                                   >
                                      {item.name}
                                   </Link>
                                ))}
                                <div className="pt-4 border-t border-border">
                                  {!displayIsLoggedIn ? (
                                     <>
                                        <Link href="/login" className="block text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground px-3 py-2 rounded-md text-base font-medium" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
                                        <Link href="/register" className="mt-1 block bg-primary text-primary-foreground px-3 py-2 rounded-md text-base font-medium" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
                                     </>
                                  ) : (
                                     <>
                                         <p className="px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground uppercase">Account</p>
                                         <Link href="/account" className="block text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground px-3 py-2 rounded-md text-base font-medium" onClick={() => setMobileMenuOpen(false)}>Account Settings</Link>
                                         <Link href="/portal" className="block text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground px-3 py-2 rounded-md text-base font-medium" onClick={() => setMobileMenuOpen(false)}>My Website</Link>
                                         <Link href="/subscribe" className="block text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground px-3 py-2 rounded-md text-base font-medium" onClick={() => setMobileMenuOpen(false)}>Billing</Link>
                                         {displayUser?.role === 'admin' && <Link href="/admin/dashboard" className="block text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground px-3 py-2 rounded-md text-base font-medium" onClick={() => setMobileMenuOpen(false)}>Admin Dashboard</Link>}
                                         <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 mt-4 px-3 py-2 rounded-md text-base font-medium" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>Log out</Button>
                                     </>
                                  )}
                                </div>
                             </nav>
                          </SheetContent>
                       </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
}