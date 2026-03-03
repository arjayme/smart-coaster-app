"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Droplets, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function TrackerPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const currentIntake = 1000;
    const [dailyGoal, setDailyGoal] = useState(3000);
    const percentGoal = Math.round((currentIntake / dailyGoal) * 100);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    const handleChangeGoal = () => {
        const newGoal = prompt("Enter new daily goal (mL):", dailyGoal.toString());
        if (newGoal && !isNaN(Number(newGoal))) {
            setDailyGoal(Number(newGoal));
        }
    };

    // Simulated data for charts
    const dailyData = [
        { time: "6AM", value: 200 },
        { time: "9AM", value: 150 },
        { time: "12PM", value: 300 },
        { time: "3PM", value: 250 },
        { time: "6PM", value: 100 },
    ];

    const weeklyData = [
        { day: "Mon", value: 2800 },
        { day: "Tue", value: 3200 },
        { day: "Wed", value: 2500 },
        { day: "Thu", value: 3000 },
        { day: "Fri", value: 2700 },
        { day: "Sat", value: 3100 },
        { day: "Sun", value: 2900 },
    ];

    // Generate heatmap data (simulated)
    const generateHeatmap = () => {
        const days = [];
        for (let i = 1; i <= 31; i++) {
            const percentage = Math.floor(Math.random() * 100);
            days.push({ day: i, percentage });
        }
        return days;
    };

    const heatmapData = generateHeatmap();

    const getHeatmapColor = (percentage: number) => {
        if (percentage >= 100) return "bg-accent";
        if (percentage >= 75) return "bg-[#4dd0e1]";
        if (percentage >= 50) return "bg-[#80deea]";
        if (percentage >= 25) return "bg-[#b2ebf2]";
        return "bg-gray-200";
    };

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-text-light text-lg">Loading...</p>
            </div>
        );
    }

    // Don't render if not logged in (redirect in useEffect)
    if (!user) {
        return null;
    }

    const username = user.user_metadata?.username || user.email?.split("@")[0] || "User";

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <Link href="/" className="text-accent hover:underline">
                        &lt; Home Page
                    </Link>
                    <h1 className="text-3xl font-bold text-text-main">Water Consumption</h1>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <User className="text-accent" size={24} />
                        </div>
                        <span className="text-sm text-text-main font-medium hidden sm:inline">{username}</span>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Stats Card */}
                    <section className="bg-secondary p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-bold mb-4 text-accent">Stats</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-text-light">Last drink:</span>
                                <span className="font-semibold">10 min ago</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-light">% to goal:</span>
                                <span className="font-semibold">{percentGoal}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-light">Streak:</span>
                                <span className="font-semibold">3 days</span>
                            </div>
                        </div>
                    </section>

                    {/* Current Status (Circular Progress) */}
                    <section className="bg-secondary p-6 rounded-xl shadow-sm flex flex-col items-center">
                        <h2 className="text-xl font-bold mb-6 text-accent">Current Status</h2>
                        <div className="relative w-48 h-48 mb-4">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    stroke="#e0f7fa"
                                    strokeWidth="16"
                                    fill="none"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    stroke="#00bcd4"
                                    strokeWidth="16"
                                    fill="none"
                                    strokeDasharray={`${(percentGoal / 100) * 502.4} 502.4`}
                                    className="transition-all duration-500"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Droplets className="text-accent" size={48} />
                            </div>
                        </div>
                        <div className="text-center mb-4">
                            <span className="text-2xl font-bold">{currentIntake}</span> mL /{" "}
                            <span className="text-xl">{dailyGoal}</span> mL
                        </div>
                        <button
                            onClick={handleChangeGoal}
                            className="px-4 py-2 border border-accent text-accent rounded-md hover:bg-accent hover:text-secondary transition-colors text-sm font-semibold"
                        >
                            Change Daily Goal
                        </button>
                        <div className="text-sm text-text-light mt-2">Daily Goal</div>
                    </section>

                    {/* Daily Intake Chart */}
                    <section className="bg-secondary p-6 rounded-xl shadow-sm lg:col-span-1">
                        <h2 className="text-xl font-bold mb-4 text-accent">Daily Intake</h2>
                        <div className="h-48 flex items-end justify-around gap-2">
                            {dailyData.map((item, index) => (
                                <div key={index} className="flex flex-col items-center flex-1">
                                    <div
                                        className="w-full bg-accent rounded-t-md transition-all duration-300 hover:bg-[#0097a7]"
                                        style={{ height: `${(item.value / 300) * 100}%` }}
                                    ></div>
                                    <span className="text-xs mt-2 text-text-light">{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Weekly Progress Chart */}
                    <section className="bg-secondary p-6 rounded-xl shadow-sm lg:col-span-2">
                        <h2 className="text-xl font-bold mb-4 text-accent">Weekly Progress</h2>
                        <div className="h-48 flex items-end justify-around gap-3">
                            {weeklyData.map((item, index) => (
                                <div key={index} className="flex flex-col items-center flex-1">
                                    <div
                                        className="w-full bg-accent rounded-t-md transition-all duration-300 hover:bg-[#0097a7]"
                                        style={{ height: `${(item.value / 3200) * 100}%` }}
                                    ></div>
                                    <span className="text-xs mt-2 text-text-light">{item.day}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Monthly Progress (Heatmap) */}
                    <section className="bg-secondary p-6 rounded-xl shadow-sm lg:col-span-3">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-accent">Monthly Progress</h2>
                            <span className="text-sm text-text-light">JANUARY 2025</span>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {heatmapData.map((item) => (
                                <div
                                    key={item.day}
                                    className={`aspect-square rounded-md ${getHeatmapColor(
                                        item.percentage
                                    )} flex items-center justify-center text-xs font-semibold text-text-main hover:scale-110 transition-transform cursor-pointer`}
                                    title={`Day ${item.day}: ${item.percentage}%`}
                                >
                                    {item.day}
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
