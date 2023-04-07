import { useContext, useEffect } from "react";
import styled from "styled-components";
import { useQuery } from "react-query";

import { AppContext } from "../../appContext";
import { supabase, SUPABASE_BUCKET_URL } from "../../config";
import { ProfileForm } from "./ProfileForm";
import { Typography, Input, Button } from "antd";
import { PageContainer } from "../../components/shared.components";
const { Title } = Typography;

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

  console.log(data?.data);

  return (
    <PageContainer>
      <Title>My Profile</Title>

      {data && data.data !== null && <ProfileForm values={data.data} />}

      <Title>My Bots</Title>

      <a href="/bot-new">New bot</a>
    </PageContainer>
  );
};
