import { useContext, useEffect } from "react";
import { useQuery } from "react-query";

import { AppContext } from "../../appContext";
import { supabase, SUPABASE_BUCKET_URL } from "../../config";
import { ProfileForm } from "./ProfileForm";

export const Profile = () => {
  const { session } = useContext(AppContext);

  // Maybe just replace this with usePromise lol
  const { data } = useQuery(
    "profile",
    async () => {
      return await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session?.user.id)
        .limit(1)
        .single();
    },
    { enabled: !!session }
  );

  return (
    <div>
      <h1>Profile</h1>

      {data && data.data !== null && <ProfileForm values={data.data} />}

      <h2>Your bots</h2>

      <a href="/bot-new">New bot</a>

      <form>
        <h3>Import TavernAI bot</h3>
        <input type="file" />
        <input type="submit" value="Import" />
      </form>
    </div>
  );
};
