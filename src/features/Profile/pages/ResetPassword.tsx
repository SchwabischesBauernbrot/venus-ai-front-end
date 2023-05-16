import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { Typography, Input, Button, Form, App } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { Provider, Session } from "@supabase/supabase-js";
import { AppContext } from "../../../appContext";
import { SITE_NAME, supabase } from "../../../config";
import { Helmet } from "react-helmet";

const { Title } = Typography;

interface FormValues {
  password: string;
  passwordConfirm: string;
}

const RegisterFormContainer = styled.div`
  max-width: 440px;
  text-align: center;
  margin: 0 auto;
  padding: 1rem;
`;

export const ResetPassword = () => {
  const [showResetForm, setShowResetForm] = useState(false);
  const [tempSession, setTempSession] = useState<Session | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { message } = App.useApp();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(event, session);

      if (event == "PASSWORD_RECOVERY" || event == "INITIAL_SESSION") {
        setShowResetForm(true);
      }
    });
  }, []);

  const [form] = Form.useForm<FormValues>();

  const onSubmit = async ({ password }: FormValues) => {
    try {
      setIsSubmitting(true);
      const { data, error } = await supabase.auth.updateUser({ password });

      if (error) {
        message.error(JSON.stringify(error, null, 2));
        return;
      }

      if (data) {
        message.info("Password updated successfully. Redirect to home page.");
        navigate("/");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log({ showResetForm });

  return (
    <RegisterFormContainer>
      <Helmet>
        <title>{`${SITE_NAME} - Reset Password`}</title>
        <meta name="description" content="Reset password" />
      </Helmet>

      {showResetForm ? (
        <Form form={form} onFinish={onSubmit}>
          <Title level={2}>Reset Password</Title>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password." }]}
          >
            <Input prefix={<LockOutlined />} type="password" placeholder="New password" />
          </Form.Item>

          <Form.Item
            name="password_confirm"
            rules={[
              { required: true, message: "Please confirm your password." },
              {
                validator: (_, value: string) => {
                  if (value && value !== form.getFieldValue("password")) {
                    return Promise.reject("The two passwords that you entered do not match!");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              prefix={<LockOutlined />}
              type="password"
              placeholder="New password confirmation"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <span>
          This page is not accessiable or your reset password link is expired.{" "}
          <Link to="/login">Back to Login Page.</Link>
        </span>
      )}
    </RegisterFormContainer>
  );
};
