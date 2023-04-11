import { useContext } from "react";

import { AppContext } from "../../appContext";
import { ProfileForm } from "./ProfileForm";
import { Typography } from "antd";
import { PageContainer } from "../../components/shared.components";
const { Title } = Typography;

export const Profile = () => {
  const { profile } = useContext(AppContext);

  return (
    <PageContainer>
      <Title>My Profile</Title>

      {profile && <ProfileForm values={profile} />}
    </PageContainer>
  );
};
