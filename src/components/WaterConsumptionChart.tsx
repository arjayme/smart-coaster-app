"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface SensorData {
    id: number;
    created_at: string;
    esp_time: string;
    consumption: number;
}

export default function WaterConsumptionChart() {
    const [data, setData] = useState<SensorData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Fetch initial data
        const fetchInitialData = async () => {
            const { data: initialData, error } = await supabase
                .from("sensor_data")
                .select("*")
                .order("created_at", { ascending: true }); // Order chronologically

            if (error) {
                console.error("Error fetching initial data:", error);
            } else if (initialData) {
                setData(initialData);
            }
            setLoading(false);
        };

        fetchInitialData();

        // 2. Set up real-time subscription
        const channel = supabase
            .channel("realtime:sensor_data")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "sensor_data",
                },
                (payload) => {
                    console.log("Change received!", payload);
                    // Handle various events
                    if (payload.eventType === "INSERT") {
                        setData((prevData) => [...prevData, payload.new as SensorData]);
                    } else if (payload.eventType === "UPDATE") {
                        setData((prevData) =>
                            prevData.map((item) =>
                                item.id === payload.new.id ? (payload.new as SensorData) : item
                            )
                        );
                    } else if (payload.eventType === "DELETE") {
                        setData((prevData) =>
                            prevData.filter((item) => item.id !== payload.old.id)
                        );
                    }
                }
            )
            .subscribe();

        // Cleanup subscription on unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 text-text-light h-[300px]">
                Loading live data...
            </div>
        );
    }

    // Formatting X-axis label to only show time for better readability
    const formatXAxis = (tickItem: string) => {
        try {
            // Assuming esp_time is like "9/2/2026 11:39"
            const parts = tickItem.split(" ");
            if (parts.length === 2) {
                return parts[1]; // Just return the time portion
            }
            return tickItem;
        } catch {
            return tickItem;
        }
    };

    return (
        <div className="w-full h-[300px] sm:h-[400px] bg-primary rounded-xl p-4 shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-center text-text-main">
                Live Water Consumption
            </h3>
            <div className="w-full h-[220px] sm:h-[320px]">
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-text-light">
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{
                                top: 5,
                                right: 20,
                                left: 0,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis
                                dataKey="esp_time"
                                stroke="#7f8ea3"
                                tickFormatter={formatXAxis}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis
                                stroke="#7f8ea3"
                                tick={{ fontSize: 12 }}
                                unit="ml"
                                width={50}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#2a3b5c', color: '#fff', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#00bcd4' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="consumption"
                                stroke="#00bcd4"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#00bcd4', strokeWidth: 0 }}
                                activeDot={{ r: 6, stroke: '#0097a7', strokeWidth: 2 }}
                                name="Consumption"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
