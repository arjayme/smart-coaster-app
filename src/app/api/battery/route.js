// import { NextResponse } from "next/server";

// let latestBattery = null;

// export async function POST(request) {
//   const data = await request.json();

//   latestBattery = data.battery_percent;

//   return NextResponse.json({ status: "received" });
// }

// export async function GET() {

//   const { data, error } = await supabase
//     .from("sensor_data")
//     .select("battery_percent")
//     .order("created_at", { ascending: false })
//     .limit(1);

//   if (error) {
//     return NextResponse.json({ battery_percent: null });
//   }

//   return NextResponse.json({
//     battery_percent: data[0]?.battery_percent ?? null
//   });

// }

// // let latestBattery = null;

// // export async function POST(request) {

// //   const data = await request.json();
// //   latestBattery = data.battery_percent;

// //   return Response.json({ status: "received" });

// // }

// // export async function GET() {

// //   return Response.json({
// //     battery_percent: latestBattery
// //   });

// // }

