import { useContext } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Typography, Input, Button, Form, Space, App, Alert } from "antd";
import {
  LockOutlined,
  MailOutlined,
  GoogleOutlined,
  GithubOutlined,
  DisconnectOutlined,
  TwitterOutlined,
} from "@ant-design/icons";
import { Provider } from "@supabase/supabase-js";
import { AppContext } from "../../../appContext";
import { SITE_NAME, supabase } from "../../../config";
import { Helmet } from "react-helmet";

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
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [form] = Form.useForm<FormValues>();

  const onSubmit = async ({ email, password }: FormValues) => {
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

        message.success("Account created successfully. Please set your username.");
        navigate("/profile");
      }
    }
  };

  const registerWithProvider = (provider: Provider) => {
    return supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/profile`,
      },
    });
  };

  return (
    <RegisterFormContainer>
      <Helmet>
        <title>{`${SITE_NAME} - Register`}</title>
        <meta name="description" content="Register a new account" />
      </Helmet>

      <Form form={form} onFinish={onSubmit}>
        <Title level={2}>Register</Title>

        <Form.Item
          name="email"
          rules={[{ required: true, message: "Please enter your email." }]}
          help=""
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please enter your password." }]}
        >
          <Input prefix={<LockOutlined />} type="password" placeholder="Password" />
        </Form.Item>

        <Alert
          className="mb-4"
          message="We do not confirm your email. Feel free to just use a burner email or something, lol."
          type="info"
          showIcon
        />

        <p>
          {" "}
          By registering, you agree with our{" "}
          <a href="/policy" target="_blank">
            📜 Content & Private Policy
          </a>
          <span> and </span>
          <a href="/term" target="_blank">
            🤝 Term of Use.
          </a>
        </p>

        <Alert
          className="mb-4"
          message="This site is not for minor. Please do not register if you are less than 18 years old."
          type="warning"
          showIcon
        />

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Register
          </Button>
        </Form.Item>
      </Form>

      <Space.Compact direction="vertical" className="w-100">
        {/* <p>
          We recommend register using third party. Our email sending might not working properly lol
          so you can't reset password.
        </p> */}

        <Button icon={<GoogleOutlined />} onClick={() => registerWithProvider("google")} block>
          Register with Google
        </Button>

        <Button icon={<TwitterOutlined />} onClick={() => registerWithProvider("twitter")} block>
          Register with Twitter
        </Button>

        <Button icon={<DisconnectOutlined />} onClick={() => registerWithProvider("discord")} block>
          Register with Discord
        </Button>

        <Button icon={<GithubOutlined />} onClick={() => registerWithProvider("github")} block>
          Register with Github
        </Button>
      </Space.Compact>
    </RegisterFormContainer>
  );
};
