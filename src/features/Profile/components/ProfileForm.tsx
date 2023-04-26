import { axiosInstance, supabase, SUPABASE_BUCKET_URL } from "../../../config";
import { message, Input, Button, Upload, Form } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import { compressImage } from "../../../shared/services/image-utils";
import { AxiosError } from "axios";
import { FormContainer } from "../../../shared/components/shared";
import { useQueryClient } from "react-query";
import { getAvatarUrl, randomID } from "../../../shared/services/utils";
import { profileService } from "../services/profile-service";

interface FormValues {
  id: string;
  name: string;
  avatar: string;
  avatar_payload?: { file: File };
  about_me: string;
  profile: string;
  user_name: string | null;
}

export const ProfileForm = ({ values }: { values: FormValues }) => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<FormValues>();

  const onFinish = async ({ avatar_payload, name, user_name, profile, about_me }: FormValues) => {
    try {
      const avatarImg = avatar_payload?.file;
      let newAvatar = null;
      if (avatarImg) {
        const compressedImage = await compressImage(avatarImg);
        const extension = compressedImage.name.substring(avatarImg.name.lastIndexOf(".") + 1);

        const result = await supabase.storage
          .from("avatars")
          .upload(`${values.id}_${randomID()}.${extension}`, compressedImage, {
            cacheControl: "3600",
            upsert: true,
          });
        newAvatar = result.data && result.data.path;
      }

      const result = await profileService.updateProfile({
        about_me,
        avatar: avatarImg ? newAvatar || undefined : values.avatar,
        name,
        profile,
        user_name: user_name ? user_name : undefined,
      });

      if (result) {
        message.success("Profile updated!");
        queryClient.invalidateQueries("profile");
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

    if (values.avatar) {
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
        onFinish={onFinish}
        initialValues={values}
        form={form}
      >
        <Form.Item
          className="pb-4"
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please enter your name!" }]}
          help="This will be used in your conversation with bot"
        >
          <Input placeholder="Name" />
        </Form.Item>

        <Form.Item label="Avatar (Click to upload)" className="pb-6">
          <Form.Item name="avatar_payload" noStyle>
            <Upload
              accept="image/*"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                form.setFieldValue("avatar_payload", file);
                return false;
              }}
            >
              {avatarSection()}
            </Upload>
          </Form.Item>
        </Form.Item>

        <Form.Item
          className="pb-4"
          name="user_name"
          label="Username"
          help="This can only be set once and can't be changed"
          rules={[{ required: true, message: "Please enter a Username!" }]}
        >
          {values.user_name ? (
            <strong>{values.user_name}</strong>
          ) : (
            <Input placeholder="Username" disabled={!!values.user_name} />
          )}
        </Form.Item>

        <Form.Item
          className="pb-4"
          name="about_me"
          label="About me"
          help="This will be displayed in your profile. You can put link to your site or Discord..."
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        {/* <Form.Item
          name="profile"
          label="User profile"
          help="This will be included in the prompt to let the bot know about you"
        >
          <Input.TextArea rows={4} placeholder='name("Harry") age("29") gender("male")' />
        </Form.Item> */}

        <Form.Item
          wrapperCol={{
            lg: { offset: 8, span: 16 },
            xs: { offset: 0, span: 24 },
          }}
          className="pt-4"
        >
          <Button type="primary" htmlType="submit" block>
            Update profile
          </Button>
        </Form.Item>
      </Form>
    </FormContainer>
  );
};
