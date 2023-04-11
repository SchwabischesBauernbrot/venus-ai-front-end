import { useEffect, useState } from "react";
import { Form, Input, Upload, Select, Button, message, Typography, Radio } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import { axiosInstance, supabase } from "../../config";
import { parseCharacter } from "../../services/character-parse";
import { compressImage } from "../../services/image-helper";
import { useTags } from "../../hooks/useTags";
import { getAvatarUrl } from "../../services/utils";

import { FormContainer } from "../../components/shared.components";
import { AxiosError } from "axios";

const { Title } = Typography;

interface FormValues {
  avatar_payload?: { file: File };
  avatar: string;
  name: string;
  description: string;
  personality: string;
  scenario: string;
  example_dialogs: string;
  first_message: string;

  is_nsfw: boolean;
  is_public: boolean;
  tag_ids: number[];
}

export interface CharacterFormProps {
  id?: string;
  values: Partial<FormValues>;
}

export const CharacterForm: React.FC<CharacterFormProps> = ({ id, values }) => {
  const [form] = Form.useForm<FormValues>();
  const [botAvatar, setBotAvatar] = useState<string | undefined>();

  const tags = useTags();

  const mode = id ? "edit" : "create";

  const onFinish = async (values: FormValues) => {
    try {
      const avatarImg = values.avatar_payload?.file;

      if (!avatarImg) {
        // Require image
        return;
      }

      let avatar = botAvatar;
      if (!avatar) {
        const compressedImage = await compressImage(avatarImg);
        const extension = compressedImage.name.substring(avatarImg.name.lastIndexOf(".") + 1);

        const uploadedAvatar = await supabase.storage
          .from("bot-avatars")
          .upload(`${crypto.randomUUID()}.${extension}`, compressedImage, {
            cacheControl: "3600",
            upsert: true,
          });
        if (uploadedAvatar?.data?.path) {
          avatar = uploadedAvatar.data.path;
          setBotAvatar(avatar);
        }
      }

      const { avatar_payload, ...postData } = values;

      if (mode === "create") {
        const result = await axiosInstance.post("/characters", {
          ...postData,
          avatar,
        });
        message.success("Character created succesfully!");
        console.log({ result });
      } else if (mode === "edit" && id) {
        const result = await axiosInstance.patch("/characters/" + id, {
          ...postData,
          avatar,
        });
        message.success("Character edited succesfully!");
        console.log({ result });
      }
    } catch (err) {
      console.error("auth error", err);
      const backEndError = (err as AxiosError).response?.data;
      message.error(JSON.stringify(backEndError, null, 2));
    }
  };

  const avatarSection = () => {
    const avatarPayload = form.getFieldValue("avatar_payload")?.file as File | undefined;
    if (avatarPayload) {
      return (
        <img
          src={URL.createObjectURL(avatarPayload)}
          style={{ maxWidth: "100%", alignSelf: "flex-start", maxHeight: "10rem" }}
        />
      );
    }

    if (values?.avatar) {
      return (
        <img
          src={getAvatarUrl(values.avatar)}
          style={{ maxWidth: "100%", alignSelf: "flex-start", maxHeight: "10rem" }}
        />
      );
    }

    return (
      <div>
        <UploadOutlined /> Upload
      </div>
    );
  };

  return (
    <FormContainer>
      <Form
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        form={form}
        onFinish={onFinish}
        initialValues={values}
      >
        <Title level={4}>Character Info (How will your chracter be displayed and searched)</Title>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter a name." }]}
        >
          <Input placeholder="Name" />
        </Form.Item>

        <Form.Item
          name="avatar_payload"
          className="pb-6"
          label="Avatar"
          help="Select an image as bot avatar, or you can import Tavern PNG file"
          rules={[{ required: true, message: "Please select an avatar for the bot." }]}
        >
          <Upload
            accept="image/*"
            listType="picture-card"
            showUploadList={false}
            beforeUpload={async (file) => {
              form.setFieldValue("avatar_payload", file);

              try {
                const { character } = await parseCharacter(file);

                if (character && character.name) {
                  form.setFieldsValue({
                    name: character.name,
                    description: character.description,
                    personality: character.personality,
                    first_message: character.first_message,
                    example_dialogs: character.example_dialogs,
                    scenario: character.scenario,
                  });
                }
              } catch (ex) {
                message.error(JSON.stringify(ex, null, 2));
              }

              return false;
            }}
          >
            {avatarSection()}
          </Upload>
        </Form.Item>

        <Form.Item
          name="description"
          className="pb-4"
          label="Introduction"
          help="This will be displayed in your character detail, not including in prompt or influence your character."
        >
          <Input.TextArea rows={3} placeholder="Short introduction about your character" />
        </Form.Item>

        <Form.Item label="Tags" name="tag_ids">
          <Select mode="tags" placeholder="Tags your character">
            {tags &&
              tags.map((tag) => (
                <Select.Option key={tag.id} value={tag.id}>
                  {tag.name}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item label="Type" name="is_public" className="mb-2">
          <Radio.Group>
            <Radio value={true}>🌟 Public Bot </Radio>
            <Radio value={false}>🔒 Private Bot (only you can see it)</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Rating" name="is_nsfw" className="mb-4">
          <Radio.Group>
            <Radio value={false}>👪 SFW </Radio>
            <Radio value={true}>🔞 NSFW</Radio>
          </Radio.Group>
        </Form.Item>

        <Title level={4}>Character Definition (How your character will act)</Title>

        <Form.Item
          className="pb-5"
          label="Personality"
          name="personality"
          rules={[{ required: true, message: "Define the personality for your character." }]}
          help="Describe the character's persona here. Think of this as CharacterAI's description + definitions in one box."
        >
          <Input.TextArea rows={4} autoSize placeholder="Personality" />
        </Form.Item>
        <Form.Item
          className="pb-5"
          name="first_message"
          label="Initial message"
          rules={[{ required: true, message: "Please enter character's initial message." }]}
          help="First message from your character. Provide a lengthy first message to encourage the character to give longer responses."
        >
          <Input.TextArea rows={4} autoSize placeholder="First message" />
        </Form.Item>
        <Form.Item
          className="pb-5"
          label="Scenario"
          name="scenario"
          help="The current circumstances and context of the conversation and the characters."
        >
          <Input.TextArea rows={2} autoSize placeholder="Scenario" />
        </Form.Item>

        <Form.Item
          name="example_dialogs"
          label="Example dialogs"
          help="Example chat between you and the character. This section is very important for teaching your character should speak."
        >
          <Input.TextArea rows={4} autoSize placeholder="Example dialogs" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }} className="pt-4">
          <Button type="primary" htmlType="submit" block>
            {mode === "create" ? "Create New Character" : "Update Character"}
          </Button>
        </Form.Item>
      </Form>
    </FormContainer>
  );
};
