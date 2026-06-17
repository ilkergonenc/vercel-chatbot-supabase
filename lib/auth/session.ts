import "server-only";

import type { User as SupabaseUser } from "@supabase/supabase-js";
import { ensureUserProfile } from "@/lib/db/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UserType = "guest" | "regular";

export type AppUser = {
  id: string;
  email: string | null;
  type: UserType;
  name?: string | null;
  image?: string | null;
};

export type AppSession = {
  user: AppUser;
};

function getUserType(user: SupabaseUser): UserType {
  return user.is_anonymous ? "guest" : "regular";
}

export async function createSessionForSupabaseUser(
  user: SupabaseUser
): Promise<AppSession> {
  const type = getUserType(user);
  const profile = await ensureUserProfile({
    id: user.id,
    email: user.email ?? null,
    isAnonymous: type === "guest",
    name:
      typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null,
    image:
      typeof user.user_metadata?.avatar_url === "string"
        ? user.user_metadata.avatar_url
        : null,
  });

  return {
    user: {
      id: profile.id,
      email: type === "guest" ? profile.email : (user.email ?? profile.email),
      type,
      name: profile.name,
      image: profile.image,
    },
  };
}

export async function auth(): Promise<AppSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return createSessionForSupabaseUser(user);
}
