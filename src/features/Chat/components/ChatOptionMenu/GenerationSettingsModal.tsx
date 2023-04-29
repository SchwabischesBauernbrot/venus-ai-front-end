import { SaveOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Slider,
  Space,
  Switch,
  Typography,
} from "antd";

import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../../../appContext";
import {
  GenerationSetting,
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

type FormValues = GenerationSetting;

const OPEN_AI_MODELS = ["gpt-3.5-turbo", "text-davinci-003", "gpt-4"];

export const GenerationSettingsModal: React.FC<ChatSettingsModalProps> = ({
  open,
  onModalClose,
}) => {
  const { config, updateConfig } = useContext(AppContext);

  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();

  // This shouldn't happen because user should see config
  if (!config) {
    return null;
  }

  const initialValues: FormValues = { ...config.generation_settings };

  const onFinish = (formValues: FormValues) => {
    const newConfig: Partial<UserConfig> = {
      ...config,

      generation_settings: formValues,
    };

    updateConfig(newConfig);

    onModalClose();
  };

  return (
    <Modal
      title="Generation Settings"
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
      {/*
temperature: This is a value used in Natural Language Processing (NLP) models like LLM (Language Model) to control the creativity of the model's responses. A temperature of 1 means the model will produce more unusual or unexpected responses, while a temperature of 0 will make the model produce only the most likely responses.

max_new_token: This parameter sets an upper limit on the number of new words that can be added to the generated text by the model. It is an optional parameter, which means that it is not required to be provided to the LLM, and if not set, it defaults to 0.

context_length: This parameter sets the number of previous words or tokens that the model uses to predict the next word or token. It determines how much context the model should consider before generating its response.

repetition_penalty: This value is used to reduce the likelihood of the model producing repeated words or phrases in its generated text. The repetition_penalty is a penalty applied to the model's probability distribution over words, which encourages the model to produce more diverse output. */}

      <div>
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          form={form}
          onFinish={onFinish}
          initialValues={initialValues}
        >
          <Form.Item
            name="temperature"
            label="Temparature"
            rules={[{ required: true, message: "Please pick an item!" }]}
            help="Control the creativity of the model's responses. A temperature of 1.5 means the model will produce more unusual or unexpected responses, while a temperature of 0 will make the model produce only the most likely responses."
          >
            <Slider min={0} max={2} step={0.05} />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
