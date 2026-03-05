"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Droplets, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SensorData {
    id: number;
    created_at: string;
    esp_time: string;
    consumption: number;
}

export default function TrackerPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // User goal state
    const [dailyGoal, setDailyGoal] = useState(3000);

    // Data states
    const [sensorData, setSensorData] = useState<SensorData[]>([]);
    const [currentIntake, setCurrentIntake] = useState(0);
    const [lastDrinkText, setLastDrinkText] = useState("No data yet");
    const [streakDays, setStreakDays] = useState(0);

    const percentGoal = Math.round((currentIntake / dailyGoal) * 100);

    //Battery percent part
    // const [batteryPercent, setBatteryPercent] = useState<number | null>(null);

    // async function getBattery() {
    //     const res = await fetch("/api/battery");
    //     const data = await res.json();
    //     return data.battery_percent;
    // }

    // useEffect(() => {
    //     const interval = setInterval(async () => {
    //     const battery = await getBattery();
    //     setBatteryPercent(battery);
    //     }, 5000);

    //     return () => clearInterval(interval);
    // }, []);
    //

    const parseEspTime = (timeStr: string) => {
        try {
            const [datePart, timePart] = timeStr.split(" ");
            if (datePart && timePart) {
                const [day, month, year] = datePart.split("/").map(Number);
                const [hour, min] = timePart.split(":").map(Number);
                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                    return new Date(year, month - 1, day, hour || 0, min || 0);
                }
            }
        } catch (e) {
            console.error("Format error", e);
        }
        const parsed = new Date(timeStr);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    const now = new Date();

    // Fetch initial data & setup real-time subscription
    useEffect(() => {
        if (loading || !user) return; // Wait until auth is resolved

        const fetchData = async () => {
            const { data, error } = await supabase
                .from("sensor_data")
                .select("*")
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Error fetching sensor data:", error);
            } else if (data) {
                setSensorData(data);
            }
        };

        fetchData();

        const channel = supabase
            .channel("realtime:tracker_sensor_data")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "sensor_data" },
                (payload) => {
                    // Update main data cache safely
                    setSensorData((prev) => {
                        if (payload.eventType === "INSERT") {
                            return [...prev, payload.new as SensorData];
                        } else if (payload.eventType === "UPDATE") {
                            return prev.map(item => item.id === payload.new.id ? (payload.new as SensorData) : item);
                        } else if (payload.eventType === "DELETE") {
                            return prev.filter(item => item.id !== payload.old.id);
                        }
                        return prev;
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, loading]);

    // Calculate metrics whenever data updates
    useEffect(() => {
        if (!sensorData || sensorData.length === 0) return;

        const sortedData = [...sensorData].sort(
            (a, b) => parseEspTime(b.esp_time).getTime() - parseEspTime(a.esp_time).getTime()
        );

        const todayStr = now.toLocaleDateString('en-US'); // MM/DD/YYYY to match standard JS

        // --- 1. Calculate Today's Consumption ---
        let todaySum = 0;
        const uniqueDaysSet = new Set<string>();

        sortedData.forEach((item) => {
            const itemDate = parseEspTime(item.esp_time);
            const itemDateString = itemDate.toLocaleDateString('en-US'); // To ignore time

            uniqueDaysSet.add(itemDateString);

            if (itemDateString === todayStr) {
                todaySum += item.consumption;
            }
        });
        setCurrentIntake(todaySum);

        // --- 2. Calculate Last Drink ---
        const mostRecentData = sortedData[0];
        if (mostRecentData) {
            const lastDrinkDate = parseEspTime(mostRecentData.esp_time);
            const diffMs = now.getTime() - lastDrinkDate.getTime();
            const diffMinutes = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMinutes / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffDays > 0) {
                setLastDrinkText(`${diffDays} day${diffDays > 1 ? 's' : ''} ago`);
            } else if (diffHours > 0) {
                setLastDrinkText(`${diffHours} hr ago`);
            } else if (diffMinutes > 0) {
                setLastDrinkText(`${diffMinutes} min ago`);
            } else {
                setLastDrinkText('Just now');
            }
        }

        // --- 3. Calculate Streak ---
        // Sort the unique dates descending
        const sortedUniqueDays = Array.from(uniqueDaysSet).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        // We start with checking if today is in the streak. If not, the streak might be 0, or maybe they just haven't drank today *yet* but drank yesterday. We'll be forgiving and check starting from today or yesterday.
        let calculatedStreak = 0;
        let currentDateToCheck = new Date();
        currentDateToCheck.setHours(0, 0, 0, 0);

        let foundTodayData = uniqueDaysSet.has(currentDateToCheck.toLocaleDateString('en-US'));
        if (!foundTodayData) {
            // If no data today, check yesterday as the starting point for active streaks
            let yesterday = new Date(currentDateToCheck);
            yesterday.setDate(yesterday.getDate() - 1);
            if (!uniqueDaysSet.has(yesterday.toLocaleDateString('en-US'))) {
                setStreakDays(0);
                return;
            }
            currentDateToCheck = yesterday; // Start counting from yesterday
        }

        while (uniqueDaysSet.has(currentDateToCheck.toLocaleDateString('en-US'))) {
            calculatedStreak++;
            // Move to the previous day
            currentDateToCheck.setDate(currentDateToCheck.getDate() - 1);
        }

        setStreakDays(calculatedStreak);

    }, [sensorData]);

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

    // Dynamic chart data calculations
    const dailyData = useMemo(() => {
        const intervals: { time: string; value: number }[] = [];
        for (let i = 0; i < 24; i++) {
            const hourStr = i === 0 ? "12AM" : i < 12 ? `${i}AM` : i === 12 ? "12PM" : `${i - 12}PM`;
            intervals.push({ time: hourStr, value: 0 });
        }
        const todayStr = now.toLocaleDateString('en-US');
        sensorData.forEach(item => {
            const itemDate = parseEspTime(item.esp_time);
            if (itemDate.toLocaleDateString('en-US') === todayStr) {
                const index = itemDate.getHours();
                if (index >= 0 && index < 24) intervals[index].value += item.consumption;
            }
        });
        return intervals;
    }, [sensorData]); // eslint-disable-line react-hooks/exhaustive-deps

    const maxDailyScale = Math.max(...dailyData.map(d => d.value), 100);

    const weeklyData = useMemo(() => {
        const days = [
            { day: "Mon", value: 0 },
            { day: "Tue", value: 0 },
            { day: "Wed", value: 0 },
            { day: "Thu", value: 0 },
            { day: "Fri", value: 0 },
            { day: "Sat", value: 0 },
            { day: "Sun", value: 0 },
        ];
        const currentDay = now.getDay();
        const diffToMon = currentDay === 0 ? -6 : 1 - currentDay;
        const monday = new Date(now);
        monday.setDate(now.getDate() + diffToMon);
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        sensorData.forEach(item => {
            const itemDate = parseEspTime(item.esp_time);
            if (itemDate >= monday && itemDate <= sunday) {
                const d = itemDate.getDay();
                const index = d === 0 ? 6 : d - 1;
                days[index].value += item.consumption;
            }
        });
        return days;
    }, [sensorData]); // eslint-disable-line react-hooks/exhaustive-deps

    const maxWeeklyScale = Math.max(...weeklyData.map(d => d.value), 500);

    const heatmapDataInfo = useMemo(() => {
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const monthData: { day: number; value: number; percentage: number }[] = [];
        for (let i = 1; i <= daysInMonth; i++) {
            monthData.push({ day: i, value: 0, percentage: 0 });
        }

        sensorData.forEach(item => {
            const itemDate = parseEspTime(item.esp_time);
            if (itemDate.getFullYear() === year && itemDate.getMonth() === month) {
                const d = itemDate.getDate();
                if (d >= 1 && d <= daysInMonth) monthData[d - 1].value += item.consumption;
            }
        });

        monthData.forEach(d => {
            d.percentage = Math.min(Math.round((d.value / dailyGoal) * 100), 100);
        });

        return {
            data: monthData,
            label: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
        };
    }, [sensorData, dailyGoal]); // eslint-disable-line react-hooks/exhaustive-deps

    const getHeatmapColor = (percentage: number, value: number) => {
        if (value === 0) return "bg-gray-200";
        if (percentage >= 100) return "bg-accent";
        if (percentage >= 75) return "bg-[#4dd0e1]";
        if (percentage >= 50) return "bg-[#80deea]";
        if (percentage >= 25) return "bg-[#b2ebf2]";
        return "bg-[#e0f7fa]";
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
                    <Link href="/" className="text hover:underline">
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
                <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Stats Card */}
                    <section className="bg-secondary p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-bold mb-4 text">Stats</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-text-light">Last drink:</span>
                                <span className="font-semibold">{lastDrinkText}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-light">% to goal:</span>
                                <span className="font-semibold">{Math.min(percentGoal, 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-light">Streak:</span>
                                <span className="font-semibold">{streakDays} {streakDays <= 1 ? "day" : "days"}</span>
                            </div>
                        </div>
                    </section>

                    {/* Current Status (Circular Progress) */}
                    <section className="bg-secondary p-6 rounded-xl shadow-sm flex flex-col items-center">
                        <h2 className="text-xl font-bold mb-6 text">Current Status</h2>
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
                    <section className="bg-secondary p-6 rounded-xl shadow-sm lg:col-span-2">
                        <h2 className="text-xl font-bold mb-4 text">Daily Intake</h2>
                        <div className="h-48 w-full -ml-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                    <XAxis dataKey="time" stroke="#7f8ea3" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={15} />
                                    <YAxis stroke="#7f8ea3" tick={{ fontSize: 10 }} domain={[0, maxDailyScale]} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} cursor={{ fill: 'transparent' }} />
                                    <Line type="monotone" dataKey="value" stroke="#00bcd4" strokeWidth={3} dot={{ r: 3, fill: '#00bcd4' }} name="mL" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* Weekly Progress Chart */}
                    <section className="bg-secondary p-6 rounded-xl shadow-sm lg:col-span-2">
                        <h2 className="text-xl font-bold mb-4 text">Weekly Progress</h2>
                        <div className="h-48 w-full -ml-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                    <XAxis dataKey="day" stroke="#7f8ea3" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#7f8ea3" tick={{ fontSize: 12 }} domain={[0, maxWeeklyScale]} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} cursor={{ fill: 'transparent' }} />
                                    <Line type="monotone" dataKey="value" stroke="#00bcd4" strokeWidth={3} dot={{ r: 4, fill: '#00bcd4' }} name="mL" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* Monthly Progress (Heatmap) */}
                    <section className="bg-secondary p-6 rounded-xl shadow-sm lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text">Monthly Progress</h2>
                            <span className="text-sm text-text-light">{heatmapDataInfo.label}</span>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {heatmapDataInfo.data.map((item) => (
                                <div
                                    key={item.day}
                                    className={`aspect-square rounded-md ${getHeatmapColor(
                                        item.percentage,
                                        item.value
                                    )} flex items-center justify-center text-xs font-semibold text-text-main hover:scale-110 transition-transform cursor-pointer`}
                                    title={`Day ${item.day}: ${item.value} mL (${item.percentage}%)`}
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
