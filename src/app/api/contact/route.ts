import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactMessage } from "@/lib/email";
import { readJson, zEmail } from "@/lib/api";

const Body = z.object({
  name: z.string().trim().min(1).max(200),
  email: zEmail,
  orderNumber: z.string().trim().max(20).optional(),
  message: z.string().trim().min(1).max(5000),
  company: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  if (parsed.data.company) return NextResponse.json({ ok: true });
  try {
    await sendContactMessage(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form failed", err);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }
}
