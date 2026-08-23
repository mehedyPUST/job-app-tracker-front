// src/components/Footer.jsx
'use client';

import Link from 'next/link';
import {
    FaGithub,
    FaLinkedin,
    FaFacebook,
    FaGlobe,
    FaHeart,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaBriefcase,
    FaChartLine,
    FaUser,
} from 'react-icons/fa';
import { Briefcase } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#001E2B] border-t border-[#00684A]/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="inline-flex items-center gap-2.5 group">
                            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#00ED64]/10 border border-[#00ED64]/25 group-hover:bg-[#00ED64]/20 transition-colors">
                                <Briefcase className="w-5 h-5 text-[#00ED64]" />
                            </span>
                            <span className="text-xl font-bold text-white group-hover:text-[#00ED64] transition-colors">
                                JobTracker
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            Track applications, interviews, and offers in one place.
                            Built for job seekers who want clarity in their search.
                        </p>
                        <div className="flex items-center gap-3 pt-1">
                            <a
                                href="https://github.com/mehedyPUST"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-lg bg-[#002433] border border-[#00684A]/30 flex items-center justify-center text-gray-400 hover:text-[#00ED64] hover:border-[#00ED64]/40 transition-all"
                                aria-label="GitHub"
                            >
                                <FaGithub className="w-4 h-4" />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/mehedypust/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-lg bg-[#002433] border border-[#00684A]/30 flex items-center justify-center text-gray-400 hover:text-[#00ED64] hover:border-[#00ED64]/40 transition-all"
                                aria-label="LinkedIn"
                            >
                                <FaLinkedin className="w-4 h-4" />
                            </a>
                            <a
                                href="https://www.facebook.com/Me.WZPDCL"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-lg bg-[#002433] border border-[#00684A]/30 flex items-center justify-center text-gray-400 hover:text-[#00ED64] hover:border-[#00ED64]/40 transition-all"
                                aria-label="Facebook"
                            >
                                <FaFacebook className="w-4 h-4" />
                            </a>
                            <a
                                href="https://mehedy-pust.vercel.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-lg bg-[#002433] border border-[#00684A]/30 flex items-center justify-center text-gray-400 hover:text-[#00ED64] hover:border-[#00ED64]/40 transition-all"
                                aria-label="Portfolio"
                            >
                                <FaGlobe className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                            Product
                        </h4>
                        <ul className="space-y-2.5">
                            <li>
                                <Link href="/dashboard" className="text-gray-400 hover:text-[#00ED64] text-sm transition-colors inline-flex items-center gap-2">
                                    <FaChartLine className="w-3.5 h-3.5 opacity-60" />
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/jobs" className="text-gray-400 hover:text-[#00ED64] text-sm transition-colors inline-flex items-center gap-2">
                                    <FaBriefcase className="w-3.5 h-3.5 opacity-60" />
                                    My Jobs
                                </Link>
                            </li>
                            <li>
                                <Link href="/analytics" className="text-gray-400 hover:text-[#00ED64] text-sm transition-colors inline-flex items-center gap-2">
                                    <FaChartLine className="w-3.5 h-3.5 opacity-60" />
                                    Analytics
                                </Link>
                            </li>
                            <li>
                                <Link href="/profile" className="text-gray-400 hover:text-[#00ED64] text-sm transition-colors inline-flex items-center gap-2">
                                    <FaUser className="w-3.5 h-3.5 opacity-60" />
                                    Profile
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Developer */}
                    <div>
                        <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                            Developer
                        </h4>
                        <div className="space-y-3">
                            <p className="text-white font-medium text-sm">Mehedy Hasan</p>
                            <p className="text-gray-400 text-sm">Full-Stack Web Developer</p>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                Next.js · React · TypeScript · Node.js · Express · MongoDB
                            </p>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                            Contact
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="mailto:mehedy.pust@gmail.com"
                                    className="text-gray-400 hover:text-[#00ED64] text-sm transition-colors inline-flex items-start gap-2.5"
                                >
                                    <FaEnvelope className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#00ED64]/70" />
                                    mehedy.pust@gmail.com
                                </a>
                            </li>
                            <li>
                                <a
                                    href="tel:+8801751479474"
                                    className="text-gray-400 hover:text-[#00ED64] text-sm transition-colors inline-flex items-start gap-2.5"
                                >
                                    <FaPhone className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#00ED64]/70" />
                                    (+880) 1751-479474
                                </a>
                            </li>
                            <li>
                                <span className="text-gray-400 text-sm inline-flex items-start gap-2.5">
                                    <FaMapMarkerAlt className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#00ED64]/70" />
                                    Kushtia, Bangladesh
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-[#00684A]/20 mt-10 pt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                        <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-left">
                            © {currentYear} JobTracker · Designed & developed by{' '}
                            <span className="text-gray-300">Mehedy Hasan</span>
                            {' '}
                            <FaHeart className="inline text-[#00ED64] w-3 h-3 mx-0.5" />
                        </p>
                        <p className="text-gray-600 text-xs">
                            Bangla (Native) · English (Work Proficiency)
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}