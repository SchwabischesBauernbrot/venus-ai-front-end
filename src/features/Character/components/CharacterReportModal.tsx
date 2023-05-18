import { WarningOutlined } from "@ant-design/icons";
import { App, Form, Input, Modal, Radio, Space, Typography } from "antd";

import { useContext, useState } from "react";
import { supabase } from "../../../config";
import { AppContext } from "../../../appContext";

interface ChatSettingsModalProps {
  open: boolean;
  characterId: string;
  onModalClose: () => void;
}

interface FormValues {
  reason: "stolen" | "wrong_tag" | "spam" | "illegal" | "other";
  other: string;
}

export const CharacterReportModal: React.FC<ChatSettingsModalProps> = ({
  open,
  characterId,
  onModalClose,
}) => {
  const { profile } = useContext(AppContext);
  const { message } = App.useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm<FormValues>();

  const selectedReason = Form.useWatch("reason", form);
  const initialValues: FormValues = {
    reason: "stolen",
    other: "",
  };

  const onFinish = async (formValues: FormValues) => {
    try {
      console.log({ formValues });

      const result = await supabase.from("user_reports").insert({
        reason: formValues.reason,
        other: formValues.other,
        url: location.href,
        character_id: characterId,
        profile_id: profile ? profile.id : null,
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
                <Radio value="stolen">
                  This bot is mine. It's posted here without my permission.
                </Radio>
                <Radio value="wrong_tag">
                  This bot's tag is wrong. (Missing NSFW, missing tags)
                </Radio>
                <Radio value="spam">This bot is a spam, low-quality, or duplicated one.</Radio>
                <Radio value="illegal">This bot or its content is illegal or harmful.</Radio>
                <Radio value="other">Others (Please specify)</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="other"
            help={
              selectedReason === "stolen" && (
                <div className="pt-2">
                  <span>Please include the link to original bot on booru/discord/charhub.</span>
                  <br />
                  <span>
                    You can also include your venus.ai profile, the mods will{" "}
                    <strong>transfer the bot to your accounts</strong> and help you monitor for
                    duplicated/stolen bots.
                  </span>
                </div>
              )
            }
          >
            <Input.TextArea placeholder="Enter more details here." />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
