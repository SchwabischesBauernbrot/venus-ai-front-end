import { SaveOutlined } from "@ant-design/icons";
import { Collapse, Form, Input, Modal, Radio, Select, Typography } from "antd";

import { useContext } from "react";
import { AppContext } from "../../../../appContext";
import { UserConfig } from "../../../../services/user-config";
import { UserLocalData } from "../../../../services/user-local-data";

const { Title } = Typography;

interface ChatSettingsModalProps {
  open: boolean;
  onModalClose: () => void;
}

type FormValues = UserConfig & UserLocalData;

const OPEN_AI_MODELS = ["gpt-3.5-turbo", "text-davinci-003", "gpt-4"];

export const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({ open, onModalClose }) => {
  const { localData, updateLocalData, config, updateConfig } = useContext(AppContext);
  const [form] = Form.useForm<FormValues>();

  // This shouldn't happen because user should see config
  if (!config) {
    return null;
  }

  const apiWatch = Form.useWatch<string>("api", form);

  const initialValues: FormValues = { ...localData, ...config };

  const onFinish = (formValues: FormValues) => {
    console.log({ formValues });
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
      onOk={onModalClose}
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
            help="More API support coming soon!"
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
                name="api_key"
                label="OpenAI Key"
                help={
                  <span>
                    Sign up and get this at{" "}
                    <a href="https://beta.openai.com/account/api-keys">
                      https://beta.openai.com/account/api-keys
                    </a>
                    <br />
                    For security reason, this key is <strong>
                      stored locally in your device
                    </strong>{" "}
                    and never sent to server.
                  </span>
                }
              >
                <Input placeholder="sk-XXXXXX..." />
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
