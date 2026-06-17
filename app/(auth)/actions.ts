"use server";

import { z } from "zod";

import { createSessionForSupabaseUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginActionState = {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
};

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error || !data.user) {
      return { status: "failed" };
    }

    await createSessionForSupabaseUser(data.user);

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};

export type RegisterActionState = {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "user_exists"
    | "invalid_data";
};

export const register = async (
  _: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const supabase = await createSupabaseServerClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    const { data, error } = currentUser?.is_anonymous
      ? await supabase.auth.updateUser({
          email: validatedData.email,
          password: validatedData.password,
        })
      : await supabase.auth.signUp({
          email: validatedData.email,
          password: validatedData.password,
        });

    if (error) {
      const message = error.message.toLowerCase();

      return message.includes("already") || message.includes("registered")
        ? { status: "user_exists" }
        : { status: "failed" };
    }

    if (!data.user) {
      return { status: "failed" };
    }

    await createSessionForSupabaseUser(data.user);

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}
