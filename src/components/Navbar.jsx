// src/components/Navbar.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
    HiMenuAlt3,
    HiX,
    HiOutlineBriefcase,
    HiOutlineChartBar,
    HiOutlineUser,
    HiOutlineViewGrid,
    HiOutlineChatAlt2,
    HiOutlineLogout,
    HiChevronDown,
    HiOutlineSun,
    HiOutlineMoon,
} from 'react-icons/hi';

const NAV_CONFIG = {
    admin: [
        { href: '/admin/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
        { href: '/interview-qa', label: 'Interview Q&A', icon: HiOutlineChatAlt2 },
    ],
    jobSeeker: [
        { href: '/jobs', label: 'Jobs', icon: HiOutlineBriefcase },
        { href: '/analytics', label: 'Analytics', icon: HiOutlineChartBar },
        { href: '/interview-qa', label: 'Interview Q&A', icon: HiOutlineChatAlt2 },
        { href: '/profile', label: 'Profile', icon: HiOutlineUser },
    ],
    guest: [
        { href: '/interview-qa', label: 'Interview Q&A', icon: HiOutlineChatAlt2 },
    ],
};

export default function Navbar() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [avatarError, setAvatarError] = useState(false);

    const pathname = usePathname();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const navLinks = isAuthenticated
        ? (NAV_CONFIG[user?.role] || NAV_CONFIG.jobSeeker)
        : (NAV_CONFIG.guest || []);

    // 1. Scroll & Click-Outside Listener for Desktop
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

    // 2. Resize Listener (Prevents scroll-lock bug if window is resized while mobile menu is open)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && isMobileOpen) {
                setIsMobileOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobileOpen]);

    // 3. Reset states strictly on Route Change
    useEffect(() => {
        setIsMobileOpen(false);
        setIsDropdownOpen(false);
        setAvatarError(false);
    }, [pathname]);

    // 4. Lock Body Scroll ONLY for mobile menu
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        // Cleanup function in case component unmounts while menu is open
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
                className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 border-b ${isScrolled
                    ? 'backdrop-blur-md shadow-lg shadow-black/10'
                    : ''
                    }`}
                style={{
                    backgroundColor: isScrolled ? 'var(--app-nav-scrolled)' : 'var(--app-nav)',
                    borderColor: 'var(--app-border)',
                }}
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
                    {navLinks.length > 0 && (
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

                    {/* Right Action Items */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="p-2 rounded-lg border transition-all hover:opacity-90"
                            style={{
                                borderColor: 'var(--app-border)',
                                color: 'var(--app-accent)',
                                backgroundColor: 'transparent',
                            }}
                            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                        >
                            {theme === 'dark' ? (
                                <HiOutlineSun className="w-5 h-5" />
                            ) : (
                                <HiOutlineMoon className="w-5 h-5" />
                            )}
                        </button>
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
                                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                                    className="flex items-center gap-2.5 p-1 rounded-full hover:bg-white/5 transition-colors focus:outline-none"
                                    aria-haspopup="true"
                                    aria-expanded={isDropdownOpen}
                                >
                                    <Avatar />
                                    <span className="text-sm font-medium text-gray-200">{user?.name?.split(' ')[0]}</span>
                                    <HiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
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
                            aria-label={isMobileOpen ? 'Close Menu' : 'Open Menu'}
                            aria-expanded={isMobileOpen}
                        >
                            {isMobileOpen ? <HiX className="w-6 h-6" /> : <HiMenuAlt3 className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer (z-50 ensures it covers the z-40 Header) */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileOpen(false)}
                    />

                    {/* Drawer Sidebar with overflow-y-auto for small screens */}
                    <div className="fixed right-0 top-0 bottom-0 w-72 bg-[#001E2B] border-l border-white/10 p-5 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">

                        <div className="pb-6">
                            <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                <span className="font-semibold text-white">Menu</span>
                                <button
                                    onClick={() => setIsMobileOpen(false)}
                                    className="p-1 text-gray-400 hover:text-white transition-colors focus:outline-none"
                                    aria-label="Close menu"
                                >
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
                                        {navLinks.map(({ href, label, icon: Icon }) => (
                                            <Link
                                                key={href}
                                                href={href}
                                                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                                            >
                                                <Icon className="w-5 h-5" />
                                                {label}
                                            </Link>
                                        ))}
                                        <Link
                                            href="/login"
                                            className="block w-full py-2.5 text-center text-sm font-medium text-gray-200 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="block w-full py-2.5 text-center text-sm font-medium text-[#001E2B] bg-[#00ED64] rounded-lg font-semibold shadow-sm transition-opacity hover:opacity-90"
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                )}
                            </nav>
                        </div>

                        {/* Logout pushes to bottom but stays accessible via scroll if screen is small */}
                        {isAuthenticated && (
                            <div className="mt-auto pt-4">
                                <button
                                    onClick={logout}
                                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border-t border-white/10"
                                >
                                    <HiOutlineLogout className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Spacer to prevent page content from hiding behind the fixed navbar */}
            <div className="h-16" />
        </>
    );
}