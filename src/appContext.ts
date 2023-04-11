import { Session } from "@supabase/supabase-js";
import { createContext } from "react";
import { Profile } from "./types/profile";

interface AppContextType {
  session?: Session | null;
  profile?: Profile | null;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
}

export const AppContext = createContext<AppContextType>({
  setSession: (session) => {},
  setProfile: (profile) => {},
});
