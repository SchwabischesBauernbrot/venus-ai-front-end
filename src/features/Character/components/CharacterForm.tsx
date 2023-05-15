import { useCallback, useContext, useState } from "react";
import {
  Form,
  Input,
  Upload,
  Select,
  Button,
  message,
  Typography,
  Radio,
  ColProps,
  Alert,
  Row,
  Col,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

import { axiosInstance, supabase } from "../../../config";
import { checkCharacter, parseCharacter } from "../services/character-service";
import { compressImage } from "../../../shared/services/image-utils";
import { useTags } from "../../../hooks/useTags";
import { getBotAvatarUrl } from "../../../shared/services/utils";

import { FormContainer, VerifiedMark } from "../../../shared/components/shared";
import { AxiosError } from "axios";
import { useQueryClient } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import { CharacterLite, SupaCharacter } from "../../../types/backend-alias";
import { AppContext } from "../../../appContext";
import { Tokenizer } from "../services/character-parse/tokenizer";
import { characterUrl } from "../../../shared/services/url-utils";
import { CharacterCard } from "../../../shared/components/CharacterCard";

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

  is_force_remove: boolean;
}

export interface CharacterFormProps {
  id?: string;
  values: Partial<FormValues>;
}

const RESPONSIVE_WRAPPER_COL: ColProps = {
  lg: { offset: 6, span: 18 },
  xs: { offset: 0, span: 24 },
};

export const CharacterForm: React.FC<CharacterFormProps> = ({ id, values }) => {
  const queryClient = useQueryClient();
  const { profile } = useContext(AppContext);
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existedCharacters, setExistedCharacters] = useState<CharacterLite[]>([]);
  const [form] = Form.useForm<FormValues>();
  const [botAvatar, setBotAvatar] = useState<string | undefined>();

  const avatarPayloadWatch = Form.useWatch("avatar_payload", form);
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
            cacheControl: "1209600", // 2 weeks
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
        const character = result.data;

        navigate(characterUrl(character.id, character.name));
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

  const avatarSection = (payload: { file?: File } | undefined) => {
    const avatarPayload = payload?.file;

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

  const checkCharacterExist = async (name: string, personality: string) => {
    if (mode === "edit") {
      return;
    }

    const result = await checkCharacter({ name, personality: personality.substring(0, 200) });
    setExistedCharacters(result);
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

                  checkCharacterExist(character.name, character.personality);
                }
              } catch (ex) {
                message.error(JSON.stringify(ex, null, 2));
              }

              return false;
            }}
          >
            {avatarSection(avatarPayloadWatch)}
          </Upload>
        </Form.Item>

        {mode === "create" && (
          <Form.Item wrapperCol={RESPONSIVE_WRAPPER_COL}>
            <p>
              Select an image as bot avatar, or you can import Tavern PNG file. You can also{" "}
              <a href="/search" target="_blank">
                search for existing character
              </a>{" "}
              before importing a new one!
            </p>
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

        {existedCharacters.length > 0 && (
          <Form.Item wrapperCol={RESPONSIVE_WRAPPER_COL}>
            <Alert
              className="mb-4"
              message="This character seems to already existed in our system!"
              description={
                <div>
                  <Row className="mt-4">
                    {existedCharacters.map((character) => (
                      <Col xs={24} lg={12}>
                        <Link to={characterUrl(character.id, character.name)} target="_blank">
                          <CharacterCard key={character.id} character={character} />
                        </Link>
                      </Col>
                    ))}
                  </Row>

                  <p className="mt-4 mb-0">
                    If this character is originally made by you, please click to view it and click{" "}
                    <strong>Report this character</strong>.
                    <br />
                    We will help to transfer it back to your account.
                  </p>
                </div>
              }
              type="warning"
            />
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
          help={
            <div>
              <span>Tag your character, maximum 5 tags only.</span> <br />
              <span>
                Don't see the tag you need? Visit{" "}
                <a href="https://discord.gg/wFPemXeEUf" target="_blank">
                  our Discord
                </a>{" "}
                and let us know.
              </span>
            </div>
          }
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

        <Form.Item
          label="Type"
          name="is_public"
          help={
            mode === "create" ? (
              <div>
                <span>
                  If you are not the creator of this bot, please kindly{" "}
                  <strong>set it as Private.</strong>
                </span>{" "}
                <br />
                <span>
                  We will need to{" "}
                  <strong>set your bot to private or transfer it to the original creator</strong> if
                  they request it.
                </span>
              </div>
            ) : values.is_force_remove ? (
              <Alert
                message="Bot set to private!"
                description="Your bot was set to private due to original's creator request, or marked as duplicated/spam/harmful by admin. You can still chat or modify it."
                type="warning"
                showIcon
              />
            ) : undefined
          }
        >
          <Radio.Group disabled={values.is_force_remove}>
            <Radio value={true}>🌟 Public Bot </Radio>
            <Radio value={false}>🔒 Private Bot (only you can see it)</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Rating" name="is_nsfw" className="pt-2 mb-4">
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
          help={
            <div>
              <span>
                Describe the character's persona here. Think of this as CharacterAI's description +
                definitions in one box.
              </span>
              <br />
              <span>
                This field is called <strong>Description</strong> in TavernAI and
                <strong>Personality</strong> in Character Editor.
              </span>
            </div>
          }
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
          help="Example chat between you and the character. This section is very important for teaching your character how they should speak."
        >
          <Input.TextArea rows={4} autoSize placeholder="Example dialogs" />
        </Form.Item>

        <Form.Item wrapperCol={RESPONSIVE_WRAPPER_COL} className="pt-4">
          <p>
            Total:{" "}
            {countToken(personalityWatch + firstMessageWatch + scenarioWatch + exampleDialogWatch)}.
            Permanent: {countToken(personalityWatch + scenarioWatch)}
          </p>
          <Button type="primary" htmlType="submit" block loading={isSubmitting}>
            {mode === "create" ? "Create Character" : "Update Character"}
          </Button>

          {profile?.is_verified === false && (
            <p className="mt-4">
              If you create the bots yourselves, please send me an email at{" "}
              <a href="mailto:anonydev96@proton.me">anonydev96@proton.me</a> or my Discord{" "}
              <strong>codedao#9342</strong> to get your creator profile verified <VerifiedMark />.
            </p>
          )}
        </Form.Item>
      </Form>
    </FormContainer>
  );
};
