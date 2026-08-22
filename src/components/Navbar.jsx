// src/components/Navbar.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    HiMenuAlt3,
    HiX,
    HiOutlineBriefcase,
    HiOutlineChartBar,
    HiOutlineUser,
    HiOutlineViewGrid,
    HiOutlineLogout,
    HiChevronDown,
} from 'react-icons/hi';

const NAV_CONFIG = {
    admin: [
        { href: '/admin/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
    ],
    jobSeeker: [
        { href: '/jobs', label: 'Jobs', icon: HiOutlineBriefcase },
        { href: '/analytics', label: 'Analytics', icon: HiOutlineChartBar },
        { href: '/profile', label: 'Profile', icon: HiOutlineUser },
    ],
};

export default function Navbar() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [avatarError, setAvatarError] = useState(false);

    const pathname = usePathname();
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    const navLinks = NAV_CONFIG[user?.role] || NAV_CONFIG.jobSeeker;

    // 1. Scroll and outside-click listeners
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 15);
        const handleClickOutside = (e) => {
            if (!e.target.closest('.user-menu-container')) setIsDropdownOpen(false);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // 2. Reset menus and errors ONLY on route change
    useEffect(() => {
        setIsMobileOpen(false);
        setIsDropdownOpen(false);
        setAvatarError(false);
    }, [pathname]);

    // 3. Handle body scroll locking independently
    useEffect(() => {
        document.body.style.overflow = isMobileOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileOpen]);

    const isActive = (path) => (path === '/' ? pathname === path : pathname.startsWith(path));

    const avatarUrl = user?.avatar || user?.profile?.avatar;
    const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : 'U';

    const Avatar = ({ size = 'w-9 h-9' }) => (
        <div className={`relative flex-shrink-0 ${size} rounded-full overflow-hidden ring-2 ring-[#00ED64]/30 bg-[#00ED64]/10 flex items-center justify-center font-semibold text-[#00ED64] text-xs`}>
            {avatarUrl && !avatarError ? (
                <img
                    src={avatarUrl}
                    alt={user?.name || 'User avatar'}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );

    return (
        <>
            <header
                className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled
                        ? 'bg-[#001E2B]/90 backdrop-blur-md shadow-lg shadow-black/20 border-b border-emerald-950/60'
                        : 'bg-[#001E2B] border-b border-white/5'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-[#00ED64]/10 border border-[#00ED64]/20 flex items-center justify-center text-[#00ED64] group-hover:bg-[#00ED64] group-hover:text-[#001E2B] transition-all">
                            <HiOutlineBriefcase className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg text-white tracking-tight group-hover:text-[#00ED64] transition-colors">
                            Job<span className="text-[#00ED64]">Tracker</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    {isAuthenticated && (
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map(({ href, label, icon: Icon }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive(href)
                                            ? 'bg-[#00ED64]/10 text-[#00ED64] font-semibold'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </Link>
                            ))}
                        </nav>
                    )}

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        {isLoading ? (
                            <div className="w-9 h-9 rounded-full bg-white/5 animate-pulse" />
                        ) : !isAuthenticated ? (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="px-3.5 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-3.5 py-1.5 text-sm font-medium text-[#001E2B] bg-[#00ED64] hover:bg-[#00ED64]/90 rounded-lg font-semibold transition-all shadow-sm shadow-[#00ED64]/20"
                                >
                                    Get Started
                                </Link>
                            </div>
                        ) : (
                            /* User Dropdown (Desktop) */
                            <div className="relative user-menu-container hidden md:block">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2.5 p-1 rounded-full hover:bg-white/5 transition-colors focus:outline-none"
                                >
                                    <Avatar />
                                    <span className="text-sm font-medium text-gray-200">{user?.name?.split(' ')[0]}</span>
                                    <HiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-[#002433] rounded-xl shadow-xl border border-white/10 py-1.5 z-50">
                                        <div className="px-4 py-2 border-b border-white/5">
                                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                        </div>

                                        <div className="py-1">
                                            {navLinks.map(({ href, label, icon: Icon }) => (
                                                <Link
                                                    key={href}
                                                    href={href}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-300 hover:text-[#00ED64] hover:bg-white/5 transition-colors"
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    {label}
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="border-t border-white/5 pt-1">
                                            <button
                                                onClick={logout}
                                                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
                                                <HiOutlineLogout className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Mobile Hamburger Button */}
                        <button
                            onClick={() => setIsMobileOpen((prev) => !prev)}
                            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                            aria-label="Toggle Menu"
                        >
                            {isMobileOpen ? <HiX className="w-6 h-6" /> : <HiMenuAlt3 className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />

                    <div className="fixed right-0 top-0 bottom-0 w-72 bg-[#001E2B] border-l border-white/10 p-5 flex flex-col justify-between shadow-2xl z-10">
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                <span className="font-semibold text-white">Menu</span>
                                <button onClick={() => setIsMobileOpen(false)} className="p-1 text-gray-400 hover:text-white">
                                    <HiX className="w-5 h-5" />
                                </button>
                            </div>

                            {isAuthenticated && (
                                <div className="flex items-center gap-3 py-4 border-b border-white/10">
                                    <Avatar size="w-10 h-10" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                    </div>
                                </div>
                            )}

                            <nav className="mt-4 space-y-1">
                                {isAuthenticated ? (
                                    navLinks.map(({ href, label, icon: Icon }) => (
                                        <Link
                                            key={href}
                                            href={href}
                                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(href)
                                                    ? 'bg-[#00ED64]/10 text-[#00ED64]'
                                                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {label}
                                        </Link>
                                    ))
                                ) : (
                                    <div className="space-y-2 pt-2">
                                        <Link
                                            href="/login"
                                            className="block w-full py-2.5 text-center text-sm font-medium text-gray-200 border border-white/10 rounded-lg hover:bg-white/5"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="block w-full py-2.5 text-center text-sm font-medium text-[#001E2B] bg-[#00ED64] rounded-lg font-semibold shadow-sm"
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                )}
                            </nav>
                        </div>

                        {isAuthenticated && (
                            <button
                                onClick={logout}
                                className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border-t border-white/10"
                            >
                                <HiOutlineLogout className="w-4 h-4" />
                                Sign Out
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Spacer */}
            <div className="h-16" />
        </>
    );
}