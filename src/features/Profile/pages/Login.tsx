import { useContext, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import { Typography, Input, Button, Form, message, Space } from "antd";
import {
  LockOutlined,
  MailOutlined,
  GoogleOutlined,
  GithubOutlined,
  DisconnectOutlined,
  TwitterOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../../appContext";
import { SITE_NAME, supabase } from "../../../config";
import { Provider } from "@supabase/supabase-js";
import { Helmet } from "react-helmet";

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
  padding-bottom: 2rem;
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
        message.error(JSON.stringify(result.error, null, 2));
      } else {
        const { session } = result.data;
        if (session) {
          setSession(session);
          navigate("/");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginWithProvider = (provider: Provider) => {
    return supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: location.origin,
      },
    });
  };

  return (
    <LoginFormContainer>
      <Helmet>
        <title>{`${SITE_NAME} - Login`}</title>
        <meta name="description" content="Login into your account" />
      </Helmet>

      <Title level={2}>Login</Title>

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

      <Space.Compact direction="vertical" className="w-100">
        <Button icon={<GoogleOutlined />} onClick={() => loginWithProvider("google")} block>
          Login with Google
        </Button>

        <Button icon={<TwitterOutlined />} onClick={() => loginWithProvider("twitter")} block>
          Login with Twitter
        </Button>

        <Button icon={<DisconnectOutlined />} onClick={() => loginWithProvider("discord")} block>
          Login with Discord
        </Button>
        <Button icon={<GithubOutlined />} onClick={() => loginWithProvider("github")} block>
          Login with Github
        </Button>
      </Space.Compact>
    </LoginFormContainer>
  );
};
