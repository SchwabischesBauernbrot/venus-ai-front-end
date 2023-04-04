import { useForm } from "react-hook-form";
import { supabase, SUPABASE_BUCKET_URL } from "../../config";
import { useQueryClient } from "react-query";
import { compressImage } from "../../services/image-helper";

interface FormValues {
  id: string;
  name: string;
  avatar: string;
  avatar_payload?: FileList;
  about_me: string;
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

  const onSubmit = handleSubmit(async ({ avatar_payload, name, avatar, about_me }: FormValues) => {
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

    const result = await supabase
      .from("user_profiles")
      .update({ name, avatar: newAvatar || avatar, about_me })
      .eq("id", values.id);

    if (result.error) {
      console.log(result.error);
    } else {
      console.log("success");

      location.reload(); // Reload to update avatar url lol
    }
  });

  return (
    <form onSubmit={onSubmit}>
      {avatarPayload && avatarPayload[0] ? (
        <img src={URL.createObjectURL(avatarPayload[0])} />
      ) : (
        <img src={`${SUPABASE_BUCKET_URL}/avatars/${values.avatar}` || ""} />
      )}

      <input {...register("avatar_payload")} type="file" accept="image/*" placeholder="Avatar" />

      <input {...register("name")} placeholder="Name" />

      <textarea {...register("about_me")} placeholder="All about you" />

      <input type="submit" value="Update" />
    </form>
  );
};
