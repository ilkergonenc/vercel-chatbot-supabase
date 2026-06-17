import { NextResponse } from "next/server";
import { createSessionForSupabaseUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawRedirect = searchParams.get("redirectUrl") || "/";
  const redirectUrl =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/";

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: existingUser },
  } = await supabase.auth.getUser();

  if (existingUser) {
    await createSessionForSupabaseUser(existingUser);
    return NextResponse.redirect(new URL(`${base}/`, request.url));
  }

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error || !data.user) {
    return NextResponse.json(
      { error: "Guest authentication is not configured" },
      { status: 500 }
    );
  }

  await createSessionForSupabaseUser(data.user);

  return NextResponse.redirect(new URL(`${base}${redirectUrl}`, request.url));
}
