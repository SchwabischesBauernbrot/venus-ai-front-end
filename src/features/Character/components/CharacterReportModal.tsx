import { SaveOutlined, WarningOutlined } from "@ant-design/icons";
import { App, Button, Form, Input, Modal, Radio, Slider, Space, Typography } from "antd";

import { useContext, useMemo, useState } from "react";
import { supabase } from "../../../config";

const { Title } = Typography;

interface ChatSettingsModalProps {
  open: boolean;
  onModalClose: () => void;
}

interface FormValues {
  reason: "spam" | "stolen" | "illegal" | "other";
  other: string;
}

export const CharacterReportModal: React.FC<ChatSettingsModalProps> = ({ open, onModalClose }) => {
  const { message } = App.useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm<FormValues>();

  const initialValues: FormValues = {
    reason: "spam",
    other: "",
  };

  const onFinish = async (formValues: FormValues) => {
    try {
      console.log({ formValues });

      const result = await supabase.from("user_reports").insert({
        reason: formValues.reason,
        other: formValues.other,
        url: location.href,
      });

      if (result.error) {
        message.error("Fail to submit report, please try again later!");
        return;
      }

      message.success("Your report had been submitted successfully!");
      onModalClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Report this bot"
      open={open}
      okText={
        <span>
          <WarningOutlined /> Report
        </span>
      }
      okButtonProps={{ danger: true, disabled: isSubmitting, loading: isSubmitting }}
      onOk={() => {
        form.submit();
      }}
      onCancel={onModalClose}
    >
      <div className="pt-2">
        <Form form={form} onFinish={onFinish} initialValues={initialValues}>
          <Form.Item name="reason">
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="spam">This bot is a spam or duplicated one.</Radio>
                <Radio value="stolen">
                  This bot is mine. It's posted here without my permission.
                </Radio>
                <Radio value="illegal">This bot or its content is illegal or harmful.</Radio>
                <Radio value="other">Others (Please specify)</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="other">
            <Input.TextArea placeholder="Enter more details here. Please include the link to original bot on booru/discord/charhub." />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
