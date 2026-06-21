import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "./useAuthUser";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  age: number | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  body_fat: number | null;
  activity_level: string | null;
  occupation: string | null;
  medical_conditions: string | null;
  allergies: string | null;
  food_preferences: string | null;
  fitness_goal: string | null;
  skin_type: string | null;
  skin_concerns: string | null;
  lifestyle_habits: string | null;
  sleep_hours: number | null;
  water_intake_target: number | null;
  smoking: string | null;
  alcohol: string | null;
  emergency_contact: string | null;
  country: string | null;
  cuisine_preference: string | null;
  budget: string | null;
};

async function fetchAvatarSignedUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

export function useProfile() {
  const { user } = useAuthUser();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      const profile = data as Profile | null;
      let avatarSignedUrl: string | null = null;
      if (profile?.avatar_url) avatarSignedUrl = await fetchAvatarSignedUrl(profile.avatar_url);
      return { profile, avatarSignedUrl };
    },
  });
}
