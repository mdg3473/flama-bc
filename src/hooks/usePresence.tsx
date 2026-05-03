import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tracks the current user as "online" in a global presence channel.
 * Call from any authenticated page to mark the user as online while it's mounted.
 */
export const usePresence = (userId: string | undefined) => {
  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel("online-users", {
      config: { presence: { key: userId } },
    });
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
};