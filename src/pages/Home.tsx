import { useQuery } from "react-query";
import { Typography, Spin } from "antd";

import { PageContainer } from "../components/shared";
import { axiosInstance } from "../config";
import { CharacterView } from "../types/backend-alias";
import { CharacterList } from "../components/CharacterList";

const { Title } = Typography;

export const Home: React.FC = () => {
  const { data, isLoading } = useQuery("main_page", async () => {
    const response = await axiosInstance.get<CharacterView[]>("characters/home");
    return response.data;
  });

  return (
    <PageContainer align="left">
      <Title level={2}>Latest characters</Title>
      {isLoading && <Spin />}
      {data && <CharacterList size="small" characters={data} />}
    </PageContainer>
  );
};
