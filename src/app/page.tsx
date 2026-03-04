"use client";

import Link from "next/link";
import { Search, Lightbulb } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
    const { user, loading } = useAuth();

    return (
        <div className="flex flex-col gap-16 pb-16">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-secondary to-primary rounded-b-[20px] py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-12">
                    <div className="flex-1 max-w-lg text-center md:text-left">
                        <h1 className="text-4xl md:text-6xl font-bold text-text-main mb-4 leading-tight">
                            Smart Coaster
                        </h1>
                        <p className="text-xl text-text-light mb-8">
                            Never forget to hydrate again.
                        </p>
                        <div className="flex gap-4 justify-center md:justify-start">
                            <Link
                                href="#features"
                                className="px-6 py-3 bg-accent text-secondary rounded-md font-semibold hover:bg-[#0097a7] transition-colors"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                    <div className="flex-1 w-full max-w-sm md:max-w-md flex justify-center items-center">
                        {/* Placeholder Image */}
                        <div className="w-full h-[300px] bg-[#b2ebf2] rounded-xl border-2 border-dashed border-accent flex justify-center items-center text-accent text-lg font-medium">
                            Product Image Placeholder
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl font-bold mb-12 text-text-main">Project Description</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Feature 1 */}
                    <div className="bg-primary p-8 rounded-xl text-left hover:-translate-y-1 transition-transform duration-300">
                        <Search className="text-accent w-12 h-12 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Smart Sensing</h3>
                        <p className="text-text-main">Detects when you place your drink and when you take a sip.</p>
                    </div>
                    {/* Feature 2 */}
                    <div className="bg-primary p-8 rounded-xl text-left hover:-translate-y-1 transition-transform duration-300">
                        <Lightbulb className="text-accent w-12 h-12 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Glow Reminders</h3>
                        <p className="text-text-main">Gentle LED glow reminds you to drink if haven&apos;t taking a sip for a while.</p>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-primary text-center py-16 px-4 sm:px-6 lg:px-8 mt-8">
                <h2 className="text-3xl font-bold mb-4 text-text-main">Ready to Start?</h2>
                <p className="text-lg text-text-light mb-8">
                    Join thousands of users improving their hydration habits.
                </p>
                <Link
                    href={loading ? "#" : user ? "/tracker" : "/login"}
                    className="inline-block px-8 py-3 bg-accent text-secondary rounded-md font-semibold hover:bg-[#0097a7] transition-colors"
                >
                    {loading ? "Loading..." : "Start Tracking"}
                </Link>
            </section>
        </div>
    );
}
