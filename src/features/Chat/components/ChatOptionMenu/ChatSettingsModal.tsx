import { SaveOutlined } from "@ant-design/icons";
import { App, Button, Collapse, Form, Input, Modal, Radio, Select, Space, Typography } from "antd";
import { AxiosError } from "axios";

import { useContext, useState } from "react";
import { AppContext } from "../../../../appContext";
import { UserConfig } from "../../../../shared/services/user-config";
import { UserLocalData } from "../../../../shared/services/user-local-data";
import { checkOpenAIAPIKey, OpenAIError } from "../../services/check-service";

const { Title } = Typography;

interface ChatSettingsModalProps {
  open: boolean;
  onModalClose: () => void;
}

type FormValues = UserConfig & UserLocalData;

const OPEN_AI_MODELS = ["gpt-3.5-turbo", "text-davinci-003", "gpt-4"];

export const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({ open, onModalClose }) => {
  const { localData, updateLocalData, config, updateConfig } = useContext(AppContext);
  const [isCheckingKey, setIsCheckingKey] = useState(false);
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();

  // This shouldn't happen because user should see config
  if (!config) {
    return null;
  }

  const apiWatch = Form.useWatch<string>("api", form);
  const openAIAPIWatch = Form.useWatch<string>("openAIKey", form);

  const initialValues: FormValues = { ...localData, ...config };

  const onFinish = (formValues: FormValues) => {
    console.log({ formValues });

    const newLocalData: Partial<UserLocalData> = {
      theme: formValues.theme,
      openAIKey: formValues.openAIKey,
    };
    updateLocalData(newLocalData);

    const newConfig: Partial<UserConfig> = {
      api: formValues.api,
      model: formValues.model,
      api_url: formValues.api_url,
      generation_settings: formValues.generation_settings,
    };
    updateConfig(newConfig);

    onModalClose();
  };

  const checkAPIKey = async () => {
    setIsCheckingKey(true);
    try {
      const checkResult = await checkOpenAIAPIKey(form.getFieldValue("openAIKey"));
      console.log({ checkResult });

      if (checkResult.choices[0].message.content.includes("TEST")) {
        message.success(
          "Valid API Key. Click Save Settings, and you can start chatting to your waifu/husbando now!"
        );
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ error: OpenAIError }>;
      const error = axiosError.response?.data?.error;
      error && message.error(`${error.code} - ${error.message}`);
    } finally {
      setIsCheckingKey(false);
    }
  };

  return (
    <Modal
      title="API & Generation Settings"
      open={open}
      okText={
        <span>
          <SaveOutlined /> Save Settings
        </span>
      }
      onOk={() => {
        form.submit();
      }}
      onCancel={onModalClose}
      width={800}
    >
      <div>
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          form={form}
          onFinish={onFinish}
          initialValues={initialValues}
        >
          <Form.Item
            name="api"
            label="API"
            rules={[{ required: true, message: "Please pick an item!" }]}
            help="More API support (Horde, Claude, NovelAI,...) coming soon!"
          >
            <Radio.Group>
              <Radio.Button value="openai">Open AI</Radio.Button>
              <Radio.Button value="kobold">Kobold AI</Radio.Button>
              <Radio.Button value="ooba">Oobabooga</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {apiWatch === "openai" && (
            <>
              <Title level={5}>OpenAI Settings</Title>
              <Form.Item name="model" label="OpenAI Model">
                <Select>
                  {OPEN_AI_MODELS.map((model) => (
                    <Select.Option key={model} value={model} label={model}>
                      {model}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="openAIKey"
                label="OpenAI Key"
                help={
                  <span>
                    Sign up and get this at{" "}
                    <a href="https://beta.openai.com/account/api-keys">
                      https://beta.openai.com/account/api-keys
                    </a>
                    <br />
                    For security reason, this key is{" "}
                    <strong>only stored locally in your device</strong> and never sent to server.
                  </span>
                }
              >
                <Space.Compact style={{ width: "100%" }}>
                  {/* BUG with Form.Item LOL */}
                  <Input
                    value={openAIAPIWatch || ""}
                    onChange={(e) => form.setFieldValue("openAIKey", e.target.value)}
                    placeholder="sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  />
                  <Button
                    loading={isCheckingKey}
                    disabled={isCheckingKey || !openAIAPIWatch || !openAIAPIWatch.startsWith("sk-")}
                    onClick={checkAPIKey}
                  >
                    Check API Key
                  </Button>
                </Space.Compact>
              </Form.Item>
            </>
          )}

          <Title level={5}>Generation Settings</Title>
        </Form>

        <span>
          The definitions are shamelessly copied from https://agnai.chat, so give them credit here.
        </span>

        <code>{JSON.stringify(initialValues, null, 2)}</code>
      </div>
    </Modal>
  );
};
