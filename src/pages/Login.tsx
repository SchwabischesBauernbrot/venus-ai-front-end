import { useContext } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../appContext";
import { supabase } from "../config";

import { Typography, Input, Button } from "antd";
import {
  LockOutlined,
  MailOutlined,
  GoogleOutlined,
  GithubOutlined,
  DisconnectOutlined,
} from "@ant-design/icons";
const { Title } = Typography;

interface FormValues {
  email: string;
  password: string;
}

const LoginFormContainer = styled.div`
  max-width: 440px;
  text-align: center;
  margin: 0 auto;
  padding: 1rem;
`;

export const Login = () => {
  const { setSession } = useContext(AppContext);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>();

  const onSubmit = handleSubmit(async ({ email, password }: FormValues) => {
    const result = await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      console.log(result.error);
    } else {
      const { user, session } = result.data;
      console.log({ user, session });

      if (session) {
        setSession(session);
        navigate("/");
      }
    }
  });

  const loginWithProvider = (provider: string) => provider;

  return (
    <LoginFormContainer>
      <form onSubmit={onSubmit}>
        <Title>Login</Title>

        <Input {...register("email")} prefix={<MailOutlined />} placeholder="Email" />

        <Input
          className="my-4"
          {...register("password")}
          prefix={<LockOutlined />}
          type="password"
          placeholder="Password"
        />

        <Button type="primary" htmlType="submit" block>
          Login
        </Button>
      </form>

      <div className="py-4">
        <p>
          We recommend login using third party, as our email sending might not working properly lol
        </p>

        <Button icon={<GoogleOutlined />} onClick={() => loginWithProvider("google")} block>
          Login with Google
        </Button>

        <Button icon={<DisconnectOutlined />} onClick={() => loginWithProvider("discord")} block>
          Login with Discord
        </Button>
        <Button icon={<GithubOutlined />} onClick={() => loginWithProvider("github")} block>
          Login with Github
        </Button>
      </div>
    </LoginFormContainer>
  );
};
