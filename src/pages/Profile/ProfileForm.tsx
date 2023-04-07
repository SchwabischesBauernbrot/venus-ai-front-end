import { useForm } from "react-hook-form";
import { axiosInstance, supabase, SUPABASE_BUCKET_URL } from "../../config";
import { useQueryClient } from "react-query";
import { Typography, Input, Button, Upload } from "antd";

import { compressImage } from "../../services/image-helper";
import { AxiosError } from "axios";

interface FormValues {
  id: string;
  name: string;
  avatar: string;
  avatar_payload?: FileList;
  about_me: string;
  profile: string;
  user_name: string;
}

export const ProfileForm = ({ values }: { values: FormValues }) => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: values });

  const avatarPayload = watch("avatar_payload");

  const onSubmit = handleSubmit(
    async ({ avatar_payload, name, user_name, profile, avatar, about_me }: FormValues) => {
      try {
        const avatarImg = avatar_payload?.[0];
        let newAvatar = null;
        if (avatarImg) {
          const compressedImage = await compressImage(avatarImg);
          const extension = compressedImage.name.substring(avatarImg.name.lastIndexOf(".") + 1);

          const result = await supabase.storage
            .from("avatars")
            .upload(`${values.id}.${extension}`, compressedImage, {
              cacheControl: "3600",
              upsert: true,
            });
          newAvatar = result.data && result.data.path;
        }

        const response = await axiosInstance.patch("/profiles/mine", {
          about_me,
          avatar: avatarImg ? newAvatar : avatar,
          name,
          profile,
          user_name,
        });
        const result = response.data;

        if (result.error) {
          console.log(result.error);
        } else {
          console.log("success");

          location.reload(); // Reload to update avatar url lol
        }
      } catch (err) {
        console.error("cauth error", err);
        const backEndErro = (err as AxiosError).response?.data;
        console.error({ backEndErro });
      }
    }
  );

  return (
    <form onSubmit={onSubmit}>
      {avatarPayload && avatarPayload[0] ? (
        <img src={URL.createObjectURL(avatarPayload[0])} />
      ) : (
        values.avatar && <img src={`${SUPABASE_BUCKET_URL}/avatars/${values.avatar}` || ""} />
      )}
      {/*
      <Upload name="avatar_payload" listType="picture-circle" showUploadList={false}>

      </Upload> */}

      <input {...register("avatar_payload")} type="file" accept="image/*" placeholder="Avatar" />

      <input
        {...register("user_name")}
        placeholder="Username (Can only set once)"
        disabled={!!values.user_name}
      />

      <input {...register("name")} placeholder="Name" />

      <input {...register("about_me")} placeholder="All about you" />

      <input {...register("profile")} placeholder="Name=Harry, Age=18, Sex=Female" />

      <Button type="primary" htmlType="submit" block>
        Update Profile
      </Button>
    </form>
  );
};
