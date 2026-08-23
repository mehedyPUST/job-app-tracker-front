// src/components/Navbar.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
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
    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);

    const pathname = usePathname();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const navLinks = isAuthenticated
        ? (NAV_CONFIG[user?.role] || NAV_CONFIG.jobSeeker)
        : (NAV_CONFIG.guest || []);

    // 1. Scroll & Click-Outside for dropdown
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 15);

        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('click', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // 2. Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && isMobileOpen) {
                setIsMobileOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobileOpen]);

    // 3. Close everything on route change
    useEffect(() => {
        setIsMobileOpen(false);
        setIsDropdownOpen(false);
        setAvatarError(false);
    }, [pathname]);

    // 4. Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileOpen]);

    // 5. Close mobile menu with Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isMobileOpen) {
                setIsMobileOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isMobileOpen]);

    const isActive = (path) => (path === '/' ? pathname === path : pathname.startsWith(path));

    const avatarUrl = user?.avatar || user?.profile?.avatar;
    const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : 'U';

    const Avatar = ({ size = 'w-9 h-9' }) => (
        <div
            className={`relative flex-shrink-0 ${size} rounded-full overflow-hidden ring-2 ring-app-accent/30 bg-app-accent/10 flex items-center justify-center font-semibold text-app-accent text-xs`}
        >
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
            {/* ========== HEADER ========== */}
            <header
                className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 border-b border-app-border ${
                    isScrolled
                        ? 'bg-app-nav-scrolled backdrop-blur-md shadow-lg shadow-black/10'
                        : 'bg-app-nav'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-app-accent/10 border border-app-accent/20 flex items-center justify-center text-app-accent group-hover:bg-app-accent group-hover:text-app-accent-text transition-all">
                            <HiOutlineBriefcase className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg text-app-text tracking-tight group-hover:text-app-accent transition-colors">
                            Job<span className="text-app-accent">Tracker</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    {navLinks.length > 0 && (
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map(({ href, label, icon: Icon }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                        isActive(href)
                                            ? 'bg-app-accent/10 text-app-accent font-semibold'
                                            : 'text-app-muted hover:text-app-text hover:bg-app-card-alt'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </Link>
                            ))}
                        </nav>
                    )}

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="p-2 rounded-lg border border-app-border text-app-accent hover:bg-app-accent/10 transition-all hover:opacity-90"
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
                            <div className="w-9 h-9 rounded-full bg-app-card-alt animate-pulse" />
                        ) : !isAuthenticated ? (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="px-3.5 py-1.5 text-sm font-medium text-app-muted hover:text-app-text transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-3.5 py-1.5 text-sm font-medium text-app-accent-text bg-app-accent hover:bg-app-accent-hover rounded-lg font-semibold transition-all shadow-sm shadow-app-accent/20"
                                >
                                    Get Started
                                </Link>
                            </div>
                        ) : (
                            /* Desktop User Dropdown */
                            <div className="relative user-menu-container hidden md:block" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                                    className="flex items-center gap-2.5 p-1 rounded-full hover:bg-app-card-alt transition-colors focus:outline-none"
                                    aria-haspopup="true"
                                    aria-expanded={isDropdownOpen}
                                >
                                    <Avatar />
                                    <span className="text-sm font-medium text-app-muted">{user?.name?.split(' ')[0]}</span>
                                    <HiChevronDown
                                        className={`w-4 h-4 text-app-muted transition-transform duration-200 ${
                                            isDropdownOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-app-card rounded-xl shadow-app-md border border-app-border py-1.5 z-50">
                                        <div className="px-4 py-2 border-b border-app-border">
                                            <p className="text-sm font-medium text-app-text truncate">{user?.name}</p>
                                            <p className="text-xs text-app-muted truncate">{user?.email}</p>
                                        </div>

                                        <div className="py-1">
                                            {navLinks.map(({ href, label, icon: Icon }) => (
                                                <Link
                                                    key={href}
                                                    href={href}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-app-muted hover:text-app-accent hover:bg-app-accent/5 transition-colors"
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    {label}
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="border-t border-app-border pt-1">
                                            <button
                                                onClick={logout}
                                                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-app-danger hover:bg-app-danger/10 transition-colors"
                                            >
                                                <HiOutlineLogout className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Mobile Hamburger */}
                        <button
                            onClick={() => setIsMobileOpen((prev) => !prev)}
                            className="md:hidden p-2 rounded-lg text-app-muted hover:text-app-text hover:bg-app-card-alt transition-colors"
                            aria-label={isMobileOpen ? 'Close Menu' : 'Open Menu'}
                            aria-expanded={isMobileOpen}
                        >
                            {isMobileOpen ? <HiX className="w-6 h-6" /> : <HiMenuAlt3 className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* ========== MOBILE DRAWER (Slide-in) ========== */}
            <div
                className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
                    isMobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
            >
                {/* Backdrop */}
                <div
                    className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                        isMobileOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={() => setIsMobileOpen(false)}
                />

                {/* Drawer Panel */}
                <div
                    ref={mobileMenuRef}
                    className={`fixed right-0 top-0 bottom-0 w-72 bg-app-card border-l border-app-border p-5 flex flex-col justify-between shadow-2xl transform transition-transform duration-300 ease-out ${
                        isMobileOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    {/* Header */}
                    <div className="pb-6">
                        <div className="flex items-center justify-between pb-4 border-b border-app-border">
                            <span className="font-semibold text-app-text">Menu</span>
                            <button
                                onClick={() => setIsMobileOpen(false)}
                                className="p-1 text-app-muted hover:text-app-text transition-colors focus:outline-none"
                                aria-label="Close menu"
                            >
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>

                        {isAuthenticated && (
                            <div className="flex items-center gap-3 py-4 border-b border-app-border">
                                <Avatar size="w-10 h-10" />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-app-text truncate">{user?.name}</p>
                                    <p className="text-xs text-app-muted truncate">{user?.email}</p>
                                </div>
                            </div>
                        )}

                        <nav className="mt-4 space-y-1">
                            {isAuthenticated ? (
                                navLinks.map(({ href, label, icon: Icon }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-colors ${
                                            isActive(href)
                                                ? 'bg-app-accent/10 text-app-accent'
                                                : 'text-app-muted hover:bg-app-accent/5 hover:text-app-text'
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
                                            className="flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium text-app-muted hover:bg-app-accent/5 hover:text-app-text"
                                        >
                                            <Icon className="w-5 h-5" />
                                            {label}
                                        </Link>
                                    ))}
                                    <Link
                                        href="/login"
                                        className="block w-full py-3 text-center text-sm font-medium text-app-muted border border-app-border rounded-lg hover:bg-app-accent/5 transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="block w-full py-3 text-center text-sm font-medium text-app-accent-text bg-app-accent rounded-lg font-semibold shadow-sm shadow-app-accent/20 transition-colors hover:bg-app-accent-hover"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </div>

                    {/* Logout (pushed to bottom) */}
                    {isAuthenticated && (
                        <div className="pt-4 border-t border-app-border">
                            <button
                                onClick={logout}
                                className="flex w-full items-center gap-2.5 px-3.5 py-3 text-sm font-medium text-app-danger hover:bg-app-danger/10 rounded-lg transition-colors"
                            >
                                <HiOutlineLogout className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Spacer for fixed header */}
            <div className="h-16" />
        </>
    );
}
