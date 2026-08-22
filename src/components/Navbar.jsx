// src/components/Navbar.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    FaBars,
    FaTimes,
    FaUser,
    FaSignOutAlt,
    FaTachometerAlt,
    FaBriefcase,
    FaChartBar,
    FaChevronDown,
    FaHome,
} from 'react-icons/fa';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
        setIsDropdownOpen(false);
        setAvatarError(false);
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isDropdownOpen && !e.target.closest('.dropdown-container')) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isDropdownOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const isActive = (path) => {
        if (path === '/') return pathname === path;
        return pathname.startsWith(path);
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getAvatarUrl = () => {
        if (!user) return null;
        if (user.avatar) return user.avatar;
        if (user.profile?.avatar) return user.profile.avatar;
        return null;
    };

    const avatarUrl = getAvatarUrl();

    const getJobSeekerLinks = () => [
        { href: '/jobs', label: 'Jobs', icon: FaBriefcase },
        { href: '/analytics', label: 'Analytics', icon: FaChartBar },
        { href: '/profile', label: 'Profile', icon: FaUser },
    ];

    const getAdminLinks = () => [
        { href: '/admin/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    ];

    const getNavLinks = () => {
        if (!isAuthenticated) return [];
        if (user?.role === 'admin') return getAdminLinks();
        return getJobSeekerLinks();
    };

    const navLinks = getNavLinks();

    const handleLogout = async () => {
        setIsDropdownOpen(false);
        setIsOpen(false);
        try {
            await logout();
        } catch (error) {
            console.error('Logout error in Navbar:', error);
            router.push('/login');
        }
    };

    const getUserName = () => {
        if (!user?.name) return 'User';
        return user.name.split(' ')[0];
    };

    const renderAvatar = (size = 'normal') => {
        const sizeClasses =
            size === 'small' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';

        if (avatarUrl && !avatarError) {
            return (
                <img
                    src={avatarUrl}
                    alt={user?.name || 'User'}
                    className={`${sizeClasses} rounded-full object-cover border-2 border-[#00ED64]/30`}
                    onError={() => setAvatarError(true)}
                    loading="lazy"
                />
            );
        }

        return (
            <div
                className={`${sizeClasses} rounded-full bg-[#00ED64] flex items-center justify-center text-[#001E2B] font-semibold`}
            >
                {getInitials(user?.name)}
            </div>
        );
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                        ? 'bg-[#001E2B]/95 backdrop-blur-md shadow-lg'
                        : 'bg-[#001E2B] border-b border-[#00684A]/20'
                    }`}
            >
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="w-9 h-9 rounded-lg bg-[#00ED64]/10 border border-[#00ED64]/30 flex items-center justify-center group-hover:bg-[#00ED64]/20 transition-colors">
                                <FaBriefcase className="w-5 h-5 text-[#00ED64]" />
                            </div>
                            <span className="text-xl font-bold text-white group-hover:text-[#00ED64] transition-colors">
                                JobTracker
                            </span>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center space-x-1">
                            {!isLoading &&
                                isAuthenticated &&
                                navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive(link.href)
                                                ? 'text-[#00ED64] bg-[#00ED64]/10'
                                                : 'text-gray-300 hover:text-[#00ED64] hover:bg-[#00684A]/20'
                                            }`}
                                    >
                                        <link.icon className="w-4 h-4 mr-2" />
                                        {link.label}
                                    </Link>
                                ))}
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center space-x-3">
                            {isLoading ? (
                                <div className="flex items-center space-x-3">
                                    <div className="hidden md:block w-24 h-8 bg-[#00684A]/30 rounded animate-pulse" />
                                    <div className="w-10 h-10 bg-[#00684A]/30 rounded-full animate-pulse" />
                                </div>
                            ) : !isAuthenticated ? (
                                /* Unauthenticated */
                                <div className="flex items-center space-x-3">
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 text-sm font-medium text-[#00ED64] hover:bg-[#00ED64]/10 rounded-lg transition-all duration-200 border border-[#00ED64]/30 hover:border-[#00ED64]"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-4 py-2 text-sm font-medium text-[#001E2B] bg-[#00ED64] hover:bg-[#00ED64]/90 rounded-lg transition-all duration-200 shadow-lg shadow-[#00ED64]/20 hover:shadow-[#00ED64]/40"
                                    >
                                        Register
                                    </Link>
                                </div>
                            ) : (
                                /* Authenticated */
                                <>
                                    {/* Desktop user dropdown */}
                                    <div className="relative dropdown-container hidden md:block">
                                        <button
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:ring-offset-2 focus:ring-offset-[#001E2B] rounded-full group"
                                            aria-expanded={isDropdownOpen}
                                            aria-haspopup="true"
                                        >
                                            {renderAvatar()}
                                            <span className="text-sm font-medium text-white group-hover:text-[#00ED64] transition-colors">
                                                {getUserName()}
                                            </span>
                                            <FaChevronDown
                                                className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                                                    }`}
                                            />
                                            {user?.role === 'admin' && (
                                                <span className="px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                                                    Admin
                                                </span>
                                            )}
                                            {user?.role === 'jobSeeker' && (
                                                <span className="px-2 py-0.5 text-xs font-medium bg-[#00ED64]/20 text-[#00ED64] rounded-full border border-[#00ED64]/30">
                                                    Job Seeker
                                                </span>
                                            )}
                                        </button>

                                        {isDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-64 bg-[#001E2B] rounded-lg shadow-2xl ring-1 ring-[#00684A]/30 border border-[#00684A]/20 z-50">
                                                {/* User info */}
                                                <div className="px-4 py-3 border-b border-[#00684A]/20 flex items-center gap-3">
                                                    {renderAvatar('small')}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-white truncate">
                                                            {user?.name}
                                                        </p>
                                                        <p className="text-xs text-gray-400 truncate">
                                                            {user?.email}
                                                        </p>
                                                        {user?.role === 'admin' && (
                                                            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                                                                Administrator
                                                            </span>
                                                        )}
                                                        {user?.role === 'jobSeeker' && (
                                                            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-[#00ED64]/20 text-[#00ED64] rounded-full">
                                                                Job Seeker
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Quick links */}
                                                <div className="py-1">
                                                    {navLinks.map((link) => (
                                                        <Link
                                                            key={link.href}
                                                            href={link.href}
                                                            className={`flex items-center px-4 py-2.5 text-sm transition-colors ${isActive(link.href)
                                                                    ? 'text-[#00ED64] bg-[#00ED64]/10'
                                                                    : 'text-gray-300 hover:text-white hover:bg-[#00684A]/30'
                                                                }`}
                                                            onClick={() => setIsDropdownOpen(false)}
                                                        >
                                                            <link.icon className="w-4 h-4 mr-3 text-[#00ED64]" />
                                                            {link.label}
                                                        </Link>
                                                    ))}
                                                </div>

                                                {/* Logout */}
                                                <div className="border-t border-[#00684A]/20 py-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex w-full items-center px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <FaSignOutAlt className="w-4 h-4 mr-3" />
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile avatar */}
                                    <div className="md:hidden">{renderAvatar('small')}</div>
                                </>
                            )}

                            {/* Hamburger button - mobile only */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="md:hidden p-2 rounded-lg hover:bg-[#00684A]/30 transition-colors"
                                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={isOpen}
                            >
                                {isOpen ? (
                                    <FaTimes className="w-6 h-6 text-white" />
                                ) : (
                                    <FaBars className="w-6 h-6 text-white" />
                                )}
                            </button>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Mobile Drawer */}
            {isOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Drawer panel */}
                    <div className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-[#001E2B] shadow-2xl border-l border-[#00684A]/20 flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-[#00684A]/20">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-lg bg-[#00ED64]/10 border border-[#00ED64]/30 flex items-center justify-center">
                                    <FaBriefcase className="w-4 h-4 text-[#00ED64]" />
                                </div>
                                <span className="text-xl font-bold text-white">Menu</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-[#00684A]/30 rounded-lg transition-colors"
                                aria-label="Close menu"
                            >
                                <FaTimes className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {isLoading ? (
                                <div className="space-y-4">
                                    <div className="h-12 bg-[#00684A]/20 rounded-lg animate-pulse" />
                                    <div className="h-12 bg-[#00684A]/20 rounded-lg animate-pulse" />
                                    <div className="h-12 bg-[#00684A]/20 rounded-lg animate-pulse" />
                                </div>
                            ) : !isAuthenticated ? (
                                <div className="space-y-3">
                                    <Link
                                        href="/"
                                        className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-[#00684A]/30 rounded-lg transition-all"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <FaHome className="w-5 h-5 mr-3 text-[#00ED64]" />
                                        Home
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="block w-full text-center px-4 py-3 text-[#00ED64] border border-[#00ED64]/30 hover:bg-[#00ED64]/10 rounded-lg transition-all"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="block w-full text-center px-4 py-3 text-[#001E2B] bg-[#00ED64] hover:bg-[#00ED64]/90 rounded-lg transition-all shadow-lg shadow-[#00ED64]/20"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Register
                                    </Link>
                                </div>
                            ) : (
                                <nav className="space-y-1">
                                    {/* User card */}
                                    <div className="bg-[#002433] rounded-lg p-4 mb-4 border border-[#00684A]/20">
                                        <div className="flex items-center gap-3">
                                            {renderAvatar('small')}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-medium truncate">
                                                    {user?.name}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex gap-2">
                                            {user?.role === 'admin' && (
                                                <span className="inline-block px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                                                    Admin
                                                </span>
                                            )}
                                            {user?.role === 'jobSeeker' && (
                                                <span className="inline-block px-2 py-0.5 text-xs font-medium bg-[#00ED64]/20 text-[#00ED64] rounded-full">
                                                    Job Seeker
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Home link */}
                                    <Link
                                        href="/"
                                        className={`flex items-center px-4 py-3 rounded-lg transition-all ${isActive('/')
                                                ? 'bg-[#00ED64]/10 text-[#00ED64] font-medium border border-[#00ED64]/20'
                                                : 'text-gray-300 hover:text-white hover:bg-[#00684A]/30'
                                            }`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <FaHome className="w-5 h-5 mr-3" />
                                        Home
                                    </Link>

                                    {/* Main nav links */}
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`flex items-center px-4 py-3 rounded-lg transition-all ${isActive(link.href)
                                                    ? 'bg-[#00ED64]/10 text-[#00ED64] font-medium border border-[#00ED64]/20'
                                                    : 'text-gray-300 hover:text-white hover:bg-[#00684A]/30'
                                                }`}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <link.icon className="w-5 h-5 mr-3" />
                                            {link.label}
                                        </Link>
                                    ))}

                                    {/* Logout */}
                                    <div className="pt-4 mt-4 border-t border-[#00684A]/20">
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                                        >
                                            <FaSignOutAlt className="w-5 h-5 mr-3" />
                                            Sign Out
                                        </button>
                                    </div>
                                </nav>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Spacer for fixed header */}
            <div className="h-16" />
        </>
    );
}
