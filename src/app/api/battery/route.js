let latestBattery = null;

export async function POST(request) {

  const data = await request.json();
  latestBattery = data.battery_percent;

  return Response.json({ status: "received" });

}

export async function GET() {

  return Response.json({
    battery_percent: latestBattery
  });

}