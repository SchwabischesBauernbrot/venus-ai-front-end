import { Session } from "@supabase/supabase-js";
import { createContext } from "react";

interface AppContextType {
  session?: Session | null;
  setSession: (session: Session) => void;
}

export const AppContext = createContext<AppContextType>({
  setSession: (session) => {},
});
