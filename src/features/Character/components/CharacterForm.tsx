import { useCallback, useContext, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Form, Input, Upload, Select, Button, message, Typography, Radio } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import { axiosInstance, supabase } from "../../../config";
import { parseCharacter } from "../services/character-parse";
import { compressImage } from "../../../shared/services/image-utils";
import { useTags } from "../../../hooks/useTags";
import { getBotAvatarUrl } from "../../../shared/services/utils";

import { FormContainer } from "../../../shared/components/shared";
import { AxiosError } from "axios";
import { useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { SupaCharacter } from "../../../types/backend-alias";
import { AppContext } from "../../../appContext";
import { Tokenizer } from "../services/character-parse/tokenizer";

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
  const queryClient = useQueryClient();
  const { profile } = useContext(AppContext);
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm<FormValues>();
  const [botAvatar, setBotAvatar] = useState<string | undefined>();

  const personalityWatch = Form.useWatch<string>("personality", form);
  const scenarioWatch = Form.useWatch<string>("scenario", form);
  const exampleDialogWatch = Form.useWatch<string>("example_dialogs", form);
  const firstMessageWatch = Form.useWatch<string>("first_message", form);

  const tags = useTags();

  const mode = id ? "edit" : "create";

  const countToken = useCallback((input?: string) => Tokenizer.tokenCountFormat(input), []);

  const onFinish = async (formValues: FormValues) => {
    try {
      setIsSubmitting(true);

      const avatarImg = formValues.avatar_payload?.file;
      if (mode === "create" && !avatarImg) {
        // Require image
        message.error("Please set an avatar for your character");
        return;
      }

      let avatar = botAvatar;
      if (!avatar && avatarImg) {
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

      const { avatar_payload, ...postData } = formValues;

      if (mode === "create") {
        const result = await axiosInstance.post<SupaCharacter>("/characters", {
          ...postData,
          avatar: avatar || values.avatar,
        });
        message.success("Character created successfully!");
        queryClient.invalidateQueries(["characters", profile?.id]);

        navigate(`/characters/${result.data.id}`);
      } else if (mode === "edit") {
        const result = await axiosInstance.patch<SupaCharacter>("/characters/" + id, {
          ...postData,
          avatar: avatar || values.avatar,
        });

        message.success("Character updated successfully!");

        queryClient.invalidateQueries(["character", id]);
        queryClient.invalidateQueries(["characters", profile?.id]);
      }
    } catch (err) {
      console.error("error", err);
      const backEndError = (err as AxiosError).response?.data;
      message.error(JSON.stringify(backEndError, null, 2));
    } finally {
      setIsSubmitting(false);
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
          src={getBotAvatarUrl(values.avatar)}
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
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        form={form}
        onFinish={onFinish}
        initialValues={values}
      >
        <Title level={4}>Character Info (How will your character be displayed and searched)</Title>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter a name." }]}
        >
          <Input placeholder="Name" />
        </Form.Item>

        <Form.Item name="avatar_payload" label="Avatar" className="mb-16">
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

        {mode === "create" && (
          <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
            <p>Select an image as bot avatar, or you can import Tavern PNG file.</p>
            <p>
              If you want to import CAI character, go to{" "}
              <a href="https://zoltanai.github.io/character-editor/" target="_blank">
                ZoltanAI Character Editor
              </a>{" "}
              and <strong>Download as Character Card</strong>
            </p>
            <span>
              Please make sure your image/character does not violate our{" "}
              <a href="/policy" target="_blank">
                content policy
              </a>
              . Otherwise we will be forced to remove it.
            </span>
          </Form.Item>
        )}

        <Form.Item
          name="description"
          className="pb-4"
          label="Introduction"
          help="This will be displayed in your character detail, not including in prompt or influence your character."
        >
          <Input.TextArea autoSize placeholder="Short introduction about your character" />
        </Form.Item>

        <Form.Item
          label="Tags"
          name="tag_ids"
          help="Tag your character, maximum 5 tags only"
          className="pb-4"
        >
          <Select
            mode="multiple"
            placeholder="Select gender/type/ of your character"
            optionLabelProp="label"
            filterOption={(input, option) =>
              String(option?.label ?? "")
                .toLocaleLowerCase()
                .includes(input.toLocaleLowerCase())
            }
          >
            {tags &&
              tags.map((tag) => (
                <Select.Option key={tag.id} value={tag.id} label={tag.name}>
                  {tag.name} ({tag.description})
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

        <p>
          Read{" "}
          <a href="https://rentry.co/chai-pygmalion-tips" target="_blank">
            this guide
          </a>{" "}
          and{" "}
          <a href="https://rentry.co/create-a-character-for-fucking-idiots" target="_blank">
            this guide
          </a>{" "}
          for help on creating better character.
        </p>

        <Form.Item
          className="pb-5"
          label="Personality"
          name="personality"
          extra={countToken(personalityWatch)}
          rules={[{ required: true, message: "Define the personality for your character." }]}
          help="Describe the character's persona here. Think of this as CharacterAI's description + definitions in one box."
        >
          <Input.TextArea rows={4} autoSize placeholder="Personality" />
        </Form.Item>
        <Form.Item
          className="pb-5"
          label="Initial message"
          name="first_message"
          extra={countToken(firstMessageWatch)}
          rules={[{ required: true, message: "Please enter character's initial message." }]}
          help="First message from your character. Provide a lengthy first message to encourage the character to give longer responses."
        >
          <Input.TextArea rows={4} autoSize placeholder="First message" />
        </Form.Item>
        <Form.Item
          className="pb-5"
          label="Scenario"
          name="scenario"
          extra={countToken(scenarioWatch)}
          help="The current circumstances and context of the conversation and the characters."
        >
          <Input.TextArea rows={2} autoSize placeholder="Scenario" />
        </Form.Item>

        <Form.Item
          name="example_dialogs"
          label="Example dialogs"
          extra={countToken(exampleDialogWatch)}
          help="Example chat between you and the character. This section is very important for teaching your character should speak."
        >
          <Input.TextArea rows={4} autoSize placeholder="Example dialogs" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6, span: 18 }} className="pt-4">
          <p>
            Total:{" "}
            {countToken(personalityWatch + firstMessageWatch + scenarioWatch + exampleDialogWatch)}
          </p>
          <Button type="primary" htmlType="submit" block loading={isSubmitting}>
            {mode === "create" ? "Create Character" : "Update Character"}
          </Button>
        </Form.Item>
      </Form>
    </FormContainer>
  );
};
