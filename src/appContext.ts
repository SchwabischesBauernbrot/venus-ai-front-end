import { Session } from "@supabase/supabase-js";
import { Models } from "appwrite";
import { createContext } from "react";

interface AccountPreference {
  avatar?: string;
}

interface AppContextType {
  session?: Session | null;
  setSession: (session: Session) => void;
}

export const AppContext = createContext<AppContextType>({
  setSession: (session) => {},
});
