// app/api/feedback/route.js
import { saveFeedback } from "@/lib/db";

export async function POST(req) {
  const { message } = await req.json();
  if (!message || message.length > 5000) {
    return new Response("형식에 맞지 않는 피드백입니다.", { status: 400 });
  }
  await saveFeedback({ message });
  return new Response("피드백 감사합니다!", { status: 200 });
}
