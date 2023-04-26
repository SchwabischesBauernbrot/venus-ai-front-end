import { SaveOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Collapse,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Switch,
  Typography,
} from "antd";
import { AxiosError } from "axios";

import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../../../appContext";
import {
  KOBOLD_AI_DEFAULT_GENERATION_SETTING,
  OPEN_AI_DEFAULT_GENERATION_SETTINGS,
} from "../../../../shared/services/generation-setting";
import { UserConfig, UserConfigAndLocalData } from "../../../../shared/services/user-config";
import { UserLocalData } from "../../../../shared/services/user-local-data";
import { CheckInput, checkKoboldURL, checkOpenAIKeyOrProxy } from "../../services/check-service";

const { Title } = Typography;

interface ChatSettingsModalProps {
  open: boolean;
  onModalClose: () => void;
}

type FormValues = UserConfigAndLocalData;

const OPEN_AI_MODELS = ["gpt-3.5-turbo", "text-davinci-003", "gpt-4"];

export const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({ open, onModalClose }) => {
  const { localData, updateLocalData, config, updateConfig } = useContext(AppContext);
  const [isCheckingOpenAI, setIsCheckingOpenAI] = useState(false);
  const [isCheckingKobol, setIsCheckingKobol] = useState(false);
  const [koboldModel, setKoboldModel] = useState("");

  const { message, modal } = App.useApp();
  const [form] = Form.useForm<FormValues>();

  // This shouldn't happen because user should see config
  if (!config) {
    return null;
  }

  const apiWatch = Form.useWatch<string>("api", form);
  const apiModeWatch = Form.useWatch<string>("open_ai_mode", form);
  const openAIAPIKeyWatch = Form.useWatch<string>("openAIKey", form);
  const openAIProxyWatch = Form.useWatch<string>("open_ai_reverse_proxy", form);
  const apiUrlWatch = Form.useWatch<string>("api_url", form);

  const initialValues: FormValues = { ...localData, ...config };

  const onFinish = (formValues: FormValues) => {
    const updateApiSetting = formValues.api !== initialValues.api;
    let shouldUpdateGenerationSetting = false;
    if (updateApiSetting) {
      if (formValues.api === "openai") {
        shouldUpdateGenerationSetting = confirm(
          "You just changed API. Do you want to set generation settings to OpenAI's default?"
        );
      } else if (formValues.api === "kobold") {
        shouldUpdateGenerationSetting = confirm(
          "You just changed API. Do you want to set generation settings to Kobold's default?"
        );
      }
    }

    const newLocalData: Partial<UserLocalData> = {
      ...localData,
      openAIKey: formValues.openAIKey,
    };
    updateLocalData(newLocalData);

    const newConfig: Partial<UserConfig> = {
      ...config,

      api: formValues.api,

      model: formValues.model,
      open_ai_mode: formValues.open_ai_mode,
      open_ai_reverse_proxy: formValues.open_ai_reverse_proxy,
      jailbreak_prompt: formValues.jailbreak_prompt,

      api_url: formValues.api_url,
    };
    if (shouldUpdateGenerationSetting) {
      if (formValues.api === "openai") {
        newConfig.generation_settings = OPEN_AI_DEFAULT_GENERATION_SETTINGS;
      } else if (formValues.api === "kobold") {
        newConfig.generation_settings = KOBOLD_AI_DEFAULT_GENERATION_SETTING;
      }
    }
    updateConfig(newConfig);

    onModalClose();
  };

  const checkOpenAI = async (checkInput: CheckInput) => {
    setIsCheckingOpenAI(true);
    try {
      const checkResult = await checkOpenAIKeyOrProxy(checkInput);
      console.log({ checkResult });

      if (!checkResult) {
        message.error("Network error. Try again later!");
        return;
      }

      if ("error" in checkResult) {
        message.error(`${checkResult.error.code} - ${checkResult.error.message}`);
      } else if (
        "choices" in checkResult &&
        checkResult.choices[0].message.content.includes("TEST")
      ) {
        message.success(
          "Valid API Key/Proxy. Click Save Settings, and you can start chatting to your waifu/husbando now!"
        );
      }
    } finally {
      setIsCheckingOpenAI(false);
    }
  };

  const checkKobold = async (apiUrl: string) => {
    setIsCheckingKobol(true);
    try {
      const checkResult = await checkKoboldURL(apiUrl);
      console.log({ checkResult });

      if (!checkResult) {
        message.error("Network error. Try if you can access the URL later!");
        return;
      }

      if ("error" in checkResult) {
        message.error(`${checkResult.error.code} - ${checkResult.error.message}`);
      } else {
        const modelLoaded = checkResult.result;

        setKoboldModel(modelLoaded);
        if (modelLoaded === "ReadOnly") {
          message.error(`No model loaded! Please visit ${apiUrl} and load a model.`);
        } else {
          message.success(
            `Kobold API detected. Model loaded: ${checkResult.result}. Save Settings to start chat.`
          );
        }
      }
    } finally {
      setIsCheckingKobol(false);
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
            help="More API support (Horde, Oobabooga, Claude, NovelAI,...) coming soon!"
          >
            <Radio.Group>
              {location.hostname === "localhost" && (
                <Radio.Button value="mock">Mock API for testing</Radio.Button>
              )}
              <Radio.Button value="openai">Open AI</Radio.Button>
              <Radio.Button value="kobold">Kobold AI</Radio.Button>
              {/* <Radio.Button value="ooba">Oobabooga</Radio.Button> */}
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

              <Form.Item name="open_ai_mode" label="Access OpenAI API">
                <Radio.Group>
                  <Radio.Button value="api_key">My Own API Key</Radio.Button>
                  <Radio.Button value="proxy">Reverse Proxy</Radio.Button>
                </Radio.Group>
              </Form.Item>

              {apiModeWatch === "api_key" ? (
                <Form.Item
                  name="openAIKey"
                  label="OpenAI Key"
                  help={
                    <span>
                      Sign up at{" "}
                      <a href="https://platform.openai.com/" target="_blank">
                        platform.openai.com
                      </a>{" "}
                      and get this at{" "}
                      <a href="https://beta.openai.com/account/api-keys">
                        beta.openai.com/account/api-keys
                      </a>
                      .
                      <br />
                      This key is <strong>only stored locally in your device</strong> and never sent
                      to server.
                    </span>
                  }
                >
                  <Space.Compact style={{ width: "100%" }}>
                    {/* BUG with Form.Item LOL */}
                    <Input
                      value={openAIAPIKeyWatch || ""}
                      onChange={(e) => form.setFieldValue("openAIKey", e.target.value)}
                      placeholder="sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    />
                    <Button
                      loading={isCheckingOpenAI}
                      disabled={
                        isCheckingOpenAI ||
                        !openAIAPIKeyWatch ||
                        !openAIAPIKeyWatch.startsWith("sk-")
                      }
                      onClick={() => checkOpenAI({ mode: "api_key", apiKey: openAIAPIKeyWatch })}
                    >
                      Check API Key
                    </Button>
                  </Space.Compact>
                </Form.Item>
              ) : (
                <Form.Item
                  name="open_ai_reverse_proxy"
                  label="Open AI Reverse Proxy"
                  help={
                    <span>
                      These proxies are contributed by communities. It might be slow or unstable.{" "}
                      <br />
                      Use at your own risk. <strong>Does NOT support text streaming.</strong>
                    </span>
                  }
                >
                  <Space.Compact style={{ width: "100%" }}>
                    {/* BUG with Form.Item LOL */}
                    <Input
                      value={openAIProxyWatch || ""}
                      onChange={(e) => form.setFieldValue("open_ai_reverse_proxy", e.target.value)}
                      placeholder="https://whocars123-oai-proxy.hf.space/proxy/openai"
                    />
                    <Button
                      loading={isCheckingOpenAI}
                      disabled={isCheckingOpenAI || !openAIProxyWatch}
                      onClick={() => checkOpenAI({ mode: "proxy", proxy: openAIProxyWatch })}
                    >
                      Check Proxy
                    </Button>
                  </Space.Compact>
                </Form.Item>
              )}

              <Form.Item
                name="jailbreak_prompt"
                label="Jailbreak Prompt"
                className="pt-4"
                help={
                  <span>
                    This is added to OpenAI prompt to set behaviour the of the bot. See{" "}
                    <a href="https://rentry.co/GPTJailbreakPrompting" target="_blank">
                      here
                    </a>{" "}
                    for more information.
                  </span>
                }
                rules={[{ required: true, message: "Please enter a prompt." }]}
              >
                <Input.TextArea autoSize rows={4} />
              </Form.Item>
            </>
          )}

          {apiWatch === "kobold" && (
            <>
              <Title level={5}>KoboldAI Settings</Title>

              <Form.Item
                name="api_url"
                label="KoboldAI API URL"
                help={koboldModel && <span>Model loaded: {koboldModel}</span>}
                extra={
                  <div className="mt-2">
                    <span>
                      Make sure you are running <strong>KoboldAI United</strong> version.
                    </span>
                    <br />
                    <span>
                      If you have a PC more than 4.5GB of VRAM. Follow{" "}
                      <a
                        href="https://docs.alpindale.dev/local-installation-(gpu)/kobold/"
                        target="_blank"
                      >
                        Local install Guide
                      </a>{" "}
                      to install and get the API URL.
                    </span>
                    <br />
                    <span>
                      You can also rent a GPU for 0.2$/hour. Follow{" "}
                      <a href="https://docs.alpindale.dev/cloud-installation/vast/" target="_blank">
                        VastAI guide
                      </a>{" "}
                      to install and get the API URL.
                    </span>
                  </div>
                }
              >
                <Space.Compact style={{ width: "100%" }}>
                  {/* BUG with Form.Item LOL */}
                  <Input
                    value={apiUrlWatch || ""}
                    onChange={(e) => form.setFieldValue("api_url", e.target.value)}
                    placeholder="https://pieces-strictly-transparency-luther.trycloudflare.com/api"
                  />
                  <Button
                    loading={isCheckingKobol}
                    disabled={isCheckingKobol || !apiUrlWatch}
                    onClick={() => checkKobold(apiUrlWatch)}
                  >
                    Check Kobold URL
                  </Button>
                </Space.Compact>
              </Form.Item>

              <Form.Item
                className="pt-4"
                name="use_pygmalion_format"
                label="Use Pygmalion Format"
                help="Use Pygmalion format (select this if you use any Pygmalion related model"
              >
                <Switch defaultChecked={form.getFieldValue("use_pygmalion_format")} />
              </Form.Item>
            </>
          )}
        </Form>

        <p className="mt-10">
          For more advanced generation settings (temparature, max token), go to{" "}
          <Link to="/settings" target="_blank">
            Profile / Advanced Settings
          </Link>
          .
        </p>
      </div>
    </Modal>
  );
};
