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
import { Provider } from "@supabase/supabase-js";
const { Title } = Typography;

interface FormValues {
  email: string;
  password: string;
}

const RegisterFormContainer = styled.div`
  max-width: 440px;
  text-align: center;
  margin: 0 auto;
  padding: 1rem;
`;

export const Register = () => {
  const { setSession } = useContext(AppContext);

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = handleSubmit(async ({ email, password }: FormValues) => {
    const result = await supabase.auth.signUp({
      email,
      password,
    });

    if (result.error) {
      console.error(result.error);
    } else {
      const { user } = result.data; // Session is null, but can request lol
      if (user) {
        const sessionData = await supabase.auth.getSession();
        if (sessionData.data.session) {
          setSession(sessionData.data.session);
        }

        navigate("/profile");
      }
    }
  });

  const registerWithProvider = (provider: Provider) => {
    return supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: "http://localhost:5173/profile",
      },
    });
  };

  return (
    <RegisterFormContainer>
      {/* <button>Create test users (Create a lot of test user with password 123456)</button> */}

      <form onSubmit={onSubmit}>
        <Title>Register</Title>

        <Input {...register("email")} prefix={<MailOutlined />} placeholder="Email" />

        <Input
          className="my-4"
          {...register("password")}
          prefix={<LockOutlined />}
          type="password"
          placeholder="Password"
        />

        <Button type="primary" htmlType="submit" block>
          Register
        </Button>
      </form>

      <div className="py-4">
        <p>
          We recommend register using third party. Our email sending might not working properly lol
          so you can't reset password.
        </p>

        <Button icon={<GoogleOutlined />} onClick={() => registerWithProvider("google")} block>
          Register with Google
        </Button>

        <Button icon={<DisconnectOutlined />} onClick={() => registerWithProvider("discord")} block>
          Register with Discord
        </Button>
        <Button icon={<GithubOutlined />} onClick={() => registerWithProvider("github")} block>
          Register with Github
        </Button>
      </div>
    </RegisterFormContainer>
  );
};
