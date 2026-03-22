import { supabase } from "./supabase";

export const getUserId = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user.id;
  } catch { return null; }
};
