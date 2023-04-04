import { useState } from "react";
import { useQuery } from "react-query";
import reactLogo from "./assets/react.svg";
import { supabase } from "./config";

function App() {
  const { data } = useQuery(
    "main_page",
    async () => await supabase.from("character_tags_view").select()
  );

  console.log({ data });

  return (
    <div className="App">
      This is main page lol
      {data?.data && <code>{JSON.stringify(data, null, 2)}</code>}
    </div>
  );
}

export default App;
