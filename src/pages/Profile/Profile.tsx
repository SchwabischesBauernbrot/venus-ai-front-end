import { useContext } from "react";
import { Typography, Spin } from "antd";

import { AppContext } from "../../appContext";
import { ProfileForm } from "./ProfileForm";
import { PageContainer } from "../../components/shared.components";
const { Title } = Typography;

export const Profile = () => {
  const { profile } = useContext(AppContext);

  return (
    <PageContainer>
      <Title>My Profile</Title>

      {profile ? <ProfileForm values={profile} /> : <Spin />}
    </PageContainer>
  );
};
