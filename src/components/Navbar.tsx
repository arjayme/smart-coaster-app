"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Droplets, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, loading, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        setIsMenuOpen(false);
        router.push("/");
    };

    const username = user?.user_metadata?.username || user?.email?.split("@")[0] || "User";

    return (
        <header className="sticky top-0 z-50 bg-secondary shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-accent">
                        <Droplets size={28} />
                        <span>Smart Coaster</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/#features" className="text-text-main hover:text-accent transition-colors">
                            Description
                        </Link>
                        <Link href="/tracker" className="text-text-main hover:text-accent transition-colors">
                            Tracking
                        </Link>
                        <div className="flex items-center gap-4">
                            {loading ? (
                                <div className="w-20 h-8 bg-gray-100 rounded-md animate-pulse" />
                            ) : user ? (
                                <>
                                    <span className="text-sm text-text-main font-medium">
                                        Hi, {username}
                                    </span>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-2 px-4 py-2 text-red-500 border border-red-300 rounded-md hover:bg-red-50 transition-colors font-semibold"
                                    >
                                        <LogOut size={16} />
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 text-accent border border-accent rounded-md hover:bg-accent hover:text-secondary transition-colors font-semibold"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-4 py-2 bg-accent text-secondary rounded-md hover:bg-[#0097a7] transition-colors font-semibold"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-text-main hover:text-accent"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100">
                        <div className="flex flex-col gap-4">
                            <Link
                                href="/#features"
                                className="text-text-main hover:text-accent px-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Description
                            </Link>
                            <Link
                                href="/tracker"
                                className="text-text-main hover:text-accent px-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Tracking
                            </Link>
                            <div className="flex flex-col gap-2 mt-2">
                                {user ? (
                                    <>
                                        <span className="text-sm text-text-main font-medium px-2">
                                            Hi, {username}
                                        </span>
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center justify-center gap-2 px-4 py-2 text-red-500 border border-red-300 rounded-md font-semibold"
                                        >
                                            <LogOut size={16} />
                                            Log Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="px-4 py-2 text-center text-accent border border-accent rounded-md font-semibold"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Log In
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="px-4 py-2 text-center bg-accent text-secondary rounded-md font-semibold"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Sign Up
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
