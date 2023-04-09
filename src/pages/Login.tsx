import { useContext, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../appContext";
import { supabase } from "../config";

import { Typography, Input, Button, Form } from "antd";
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
  const [form] = Form.useForm<FormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { setSession } = useContext(AppContext);

  const onFinish = async ({ email, password }: FormValues) => {
    setIsSubmitting(true);

    try {
      const result = await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        console.log(result.error);
      } else {
        const { user, session } = result.data;
        console.log({ user, session });

        if (session) {
          setSession(session);
          navigate("/profile");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginWithProvider = (provider: string) => provider;

  return (
    <LoginFormContainer>
      <Title>Login</Title>

      <Form form={form} onFinish={onFinish}>
        <Form.Item name="email" rules={[{ required: true, message: "Please enter your email." }]}>
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please enter your password." }]}
        >
          <Input prefix={<LockOutlined />} type="password" placeholder="Password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={isSubmitting}>
            Login
          </Button>
        </Form.Item>
      </Form>

      <div>
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
