import { useQuery } from "react-query";
import { axiosInstance } from "../config";
import { CharacterView } from "../types/backend-alias";

function Home() {
  const { data } = useQuery(
    "main_page",
    async () => await (await axiosInstance.get<CharacterView>("characters/home")).data
  );

  return (
    <div className="App">
      This is main page lol
      {data && <code>{JSON.stringify(data, null, 2)}</code>}
    </div>
  );
}

export default Home;
