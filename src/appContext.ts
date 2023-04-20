import { Session } from "@supabase/supabase-js";
import { createContext } from "react";
import { getLocalData, UserLocalData } from "./shared/services/user-local-data";
import { UserConfig } from "./shared/services/user-config";
import { Profile } from "./types/profile";

interface AppContextType {
  session?: Session | null;
  setSession: (session: Session | null) => void;
  profile?: Profile | null;
  setProfile: (profile: Profile | null) => void;
  config?: UserConfig;
  updateConfig: (config: Partial<UserConfig>) => void;
  localData: UserLocalData;
  updateLocalData: (data: Partial<UserLocalData>) => void;
}

export const AppContext = createContext<AppContextType>({
  setSession: (session) => {},
  setProfile: (profile) => {},
  localData: getLocalData(),
  updateLocalData: (data) => {},
  updateConfig: (config) => {},
});
