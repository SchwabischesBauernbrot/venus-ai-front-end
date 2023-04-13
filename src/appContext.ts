import { Session } from "@supabase/supabase-js";
import { createContext } from "react";
import { getLocalData, LocalData } from "./services/local-data";
import { Profile } from "./types/profile";

interface AppContextType {
  session?: Session | null;
  profile?: Profile | null;
  localData: LocalData;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  updateLocalData: (data: Partial<LocalData>) => void;
}

export const AppContext = createContext<AppContextType>({
  setSession: (session) => {},
  setProfile: (profile) => {},
  localData: getLocalData(),
  updateLocalData: (data) => {},
});
