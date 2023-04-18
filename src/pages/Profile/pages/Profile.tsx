import { useContext } from "react";
import { Typography, Spin } from "antd";

import { AppContext } from "../../../appContext";
import { ProfileForm } from "../components/ProfileForm";
import { PageContainer } from "../../../components/shared";
const { Title } = Typography;

export const Profile = () => {
  const { profile } = useContext(AppContext);

  return (
    <PageContainer>
      <Title level={2}>My Profile</Title>

      {profile ? <ProfileForm values={profile} /> : <Spin />}
    </PageContainer>
  );
};
