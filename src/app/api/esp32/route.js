import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const data = await request.json();

    const { esp_time, consumption, battery_percent } = data;

    const { error } = await supabase
      .from("sensor_data")
      .insert([
        {
          esp_time: esp_time,
          consumption: consumption,
          battery_percent: battery_percent
        }
      ]);
    
    console.log([data,esp_time,consumption,battery_percent])
      
    if (error) throw error;

    return NextResponse.json({
      status: "success",
      message: "Data storedd"
    });

  } catch (err) {

    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );

  }
}