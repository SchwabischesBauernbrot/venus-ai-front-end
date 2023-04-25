import { useContext } from "react";
import { Typography, Spin } from "antd";

import { AppContext } from "../../../appContext";
import { ProfileForm } from "../components/ProfileForm";
import { PageContainer } from "../../../shared/components/shared";
const { Title } = Typography;

export const Settings = () => {
  const { profile } = useContext(AppContext);

  return (
    <PageContainer>
      <Title level={2}>Advanced Settings</Title>

      <p>Max New Tokens</p>

      <p>Max Context Length</p>

      <p>Temperature</p>

      <p>Repetion Penalty</p>
    </PageContainer>
  );
};
