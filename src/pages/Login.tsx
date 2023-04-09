import { useContext } from "react";
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
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { setSession } = useContext(AppContext);

  const onFinish = async ({ email, password }: { email: string; password: string }) => {
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
  };

  const loginWithProvider = (provider: string) => provider;

  return (
    <LoginFormContainer>
      <Title>Login</Title>

      <Form onFinish={onFinish}>
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
          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form.Item>
      </Form>

      {/* <Input
        prefix={<MailOutlined />}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        className="my-4"
        prefix={<LockOutlined />}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button type="primary" onClick={onSubmit}>
        Login
      </Button> */}

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
