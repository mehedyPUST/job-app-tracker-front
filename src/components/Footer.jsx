// components/Footer.jsx
'use client';

import Link from 'next/link';
import {
    FaLeaf,
    FaGithub,
    FaTwitter,
    FaLinkedin,
    FaYoutube,
    FaHeart,
    FaBriefcase,
    FaUsers,
    FaShieldAlt,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt
} from 'react-icons/fa';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#001E2B] border-t border-[#00684A]/20">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

                    {/* Column 1 - Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <FaLeaf className="w-8 h-8 text-[#00ED64] group-hover:rotate-12 transition-transform duration-300" />
                            <span className="text-xl font-bold text-white hover:text-[#00ED64] transition-colors">
                                JobTracker
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Find your dream job with MongoDB's powerful job tracking platform.
                            Connect with top companies and take your career to the next level.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-[#00ED64] transition-colors duration-200"
                                aria-label="GitHub"
                            >
                                <FaGithub className="w-5 h-5" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-[#00ED64] transition-colors duration-200"
                                aria-label="Twitter"
                            >
                                <FaTwitter className="w-5 h-5" />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-[#00ED64] transition-colors duration-200"
                                aria-label="LinkedIn"
                            >
                                <FaLinkedin className="w-5 h-5" />
                            </a>
                            <a
                                href="https://youtube.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-[#00ED64] transition-colors duration-200"
                                aria-label="YouTube"
                            >
                                <FaYoutube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Column 2 - For Job Seekers */}
                    <div>
                        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                            For Job Seekers
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/jobs" className="text-gray-400 hover:text-[#00ED64] text-sm transition-colors duration-200">
                                    Browse Jobs
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-gray-400 hover:text-[#00ED64] text-sm transition-colors duration-200">
                                    My Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/applications" className="text-gray-400 hover:text-[#00ED64] text-sm transition-colors duration-200">
                                    My Applications
                                </Link>
                            </li>
                            <li>
                                <Link href="/profile" className="text-gray-400 hover:text-[#00ED64] text-sm transition-colors duration-200">
                                    Profile Settings
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3 - For Employers */}
                    <div>
                        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                            For Employers
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/admin/dashboard" className="text-gray-400 hover:text-[#00ED64] text-sm transition-colors duration-200">
                                    Employer Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/jobs/create" className="text-gray-400 hover:text-[#00ED64] text-sm transition-colors duration-200">
                                    Post a Job
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/applications" className="text-gray-400 hover:text-[#00ED64] text-sm transition-colors duration-200">
                                    Manage Applications
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="text-gray-400 hover:text-[#00ED64] text-sm transition-colors duration-200">
                                    Pricing Plans
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4 - Contact */}
                    <div>
                        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                            Get In Touch
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start space-x-3 text-gray-400 text-sm">
                                <FaEnvelope className="w-4 h-4 text-[#00ED64] mt-0.5 flex-shrink-0" />
                                <span>support@jobtracker.com</span>
                            </li>
                            <li className="flex items-start space-x-3 text-gray-400 text-sm">
                                <FaPhone className="w-4 h-4 text-[#00ED64] mt-0.5 flex-shrink-0" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-start space-x-3 text-gray-400 text-sm">
                                <FaMapMarkerAlt className="w-4 h-4 text-[#00ED64] mt-0.5 flex-shrink-0" />
                                <span>123 MongoDB Way,<br />New York, NY 10001</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-[#00684A]/20 mt-10 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        {/* Copyright */}
                        <p className="text-gray-400 text-sm">
                            © {currentYear} JobTracker. Built with{' '}
                            <FaHeart className="inline text-[#00ED64] w-3 h-3" />{' '}
                            for the developer community.
                        </p>

                        {/* Bottom Links */}
                        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                            <Link href="/privacy" className="text-gray-400 hover:text-[#00ED64] text-xs transition-colors duration-200">
                                Privacy Policy
                            </Link>
                            <span className="text-[#00684A]/40">|</span>
                            <Link href="/terms" className="text-gray-400 hover:text-[#00ED64] text-xs transition-colors duration-200">
                                Terms of Service
                            </Link>
                            <span className="text-[#00684A]/40">|</span>
                            <Link href="/cookies" className="text-gray-400 hover:text-[#00ED64] text-xs transition-colors duration-200">
                                Cookie Policy
                            </Link>
                            <span className="text-[#00684A]/40">|</span>
                            <Link href="/accessibility" className="text-gray-400 hover:text-[#00ED64] text-xs transition-colors duration-200">
                                Accessibility
                            </Link>
                        </div>

                        {/* MongoDB Badge */}
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Powered by</span>
                            <FaLeaf className="w-4 h-4 text-[#00ED64]" />
                            <span className="text-xs font-medium text-white">MongoDB</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}