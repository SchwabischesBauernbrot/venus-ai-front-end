import { useContext } from "react";
import { Typography, Spin } from "antd";

import { AppContext } from "../../../appContext";
import { ProfileForm } from "../components/ProfileForm";
import { PageContainer } from "../../../shared/components/shared";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { SITE_NAME } from "../../../config";
const { Title } = Typography;

export const Profile = () => {
  const { profile } = useContext(AppContext);

  return (
    <PageContainer>
      <Helmet>
        <title>{SITE_NAME} - My Profile</title>
      </Helmet>
      <Title level={2}>
        My Profile <Link to={`/profiles/${profile?.id}`}>(Public Profile)</Link>
      </Title>

      {profile ? <ProfileForm values={profile} /> : <Spin />}
    </PageContainer>
  );
};
