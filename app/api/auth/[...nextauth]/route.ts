import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextRequest } from "next/server";

const handler = NextAuth(authOptions);

export async function GET(req: NextRequest, ctx: any) {
  try {
    return await handler(req, ctx);
  } catch (error) {
    console.error("🔥 NextAuth GET Error:", error);
    throw error;
  }
}

export async function POST(req: NextRequest, ctx: any) {
  try {
    return await handler(req, ctx);
  } catch (error) {
    console.error("🔥 NextAuth POST Error:", error);
    throw error;
  }
}
