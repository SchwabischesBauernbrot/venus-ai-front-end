import { useState } from "react";
import { components } from "./types/backend";
import { useQuery } from "react-query";
import reactLogo from "./assets/react.svg";
import { axiosInstance, supabase } from "./config";
import { CharacterView } from "./types/backend-alias";

function App() {
  const { data } = useQuery(
    "main_page",
    async () => await (await axiosInstance.get<CharacterView>("characters/home")).data
  );

  console.log({ data });

  return (
    <div className="App">
      This is main page lol
      {data && <code>{JSON.stringify(data, null, 2)}</code>}
    </div>
  );
}

export default App;
