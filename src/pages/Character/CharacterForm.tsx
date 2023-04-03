import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { axiosInstance, supabase, SUPABASE_BUCKET_URL } from "../../config";
import { parseCharacter } from "../../services/character_parse";

interface FormValues {
  import?: FileList;
  avatar: string;
  name: string;
  description: string;
  personality: string;
  scenario: string;
  example_dialogs: string;
  first_message: string;

  is_nsfw: boolean;
  is_public: boolean;
  tag_ids: string[];
}

export interface CharacterFormProps {
  id?: string;
  values?: Partial<FormValues>;
  mode: "create" | "edit";
}

export const CharacterForm: React.FC<CharacterFormProps> = ({ id, values, mode }) => {
  const {
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      is_nsfw: false,
      is_public: true,
      tag_ids: [],
      ...values,
    },
  });

  const [botAvatar, setBotAvatar] = useState<string | undefined>();
  const importFile = watch("import");

  useEffect(() => {
    async function run() {
      if (importFile?.[0]) {
        const file = importFile[0];
        console.log({ file });

        try {
          const { character, json, image } = await parseCharacter(file);
          console.log(character, image, json);

          if (character) {
            setValue("name", character.name);
            setValue("description", character.description);
            setValue("personality", character.personality);
            setValue("first_message", character.first_message);
            setValue("example_dialogs", character.example_dialogs);
            setValue("scenario", character.scenario);
          }
        } catch (ex) {
          console.error(ex);
        }
      }
    }

    run();
  }, [importFile]);

  const onSubmit = handleSubmit(async (values: FormValues) => {
    const avatarImg = importFile?.[0];

    if (!avatarImg) {
      // Require image
      return;
    }

    const extension = avatarImg.name.substring(avatarImg.name.lastIndexOf(".") + 1);

    let avatar = botAvatar;
    if (!avatar) {
      const uploadedAvatar = await supabase.storage
        .from("bot-avatars")
        .upload(`${crypto.randomUUID()}.${extension}`, avatarImg, {
          cacheControl: "3600",
          upsert: true,
        });
      if (uploadedAvatar?.data?.path) {
        avatar = uploadedAvatar.data.path;
        setBotAvatar(avatar);
      }
    }

    if (mode === "create") {
      const result = await axiosInstance.post("/character", {
        ...values,
        avatar,
      });
      console.log({ result });
    } else if (mode === "edit" && id) {
      const result = await axiosInstance.patch("/character/" + id, {
        ...values,
        avatar,
      });
      console.log({ result });
    }
  });

  return (
    <div>
      <h2>{mode === "create" ? "New Bot" : "Edit Bot"}</h2>

      <form onSubmit={onSubmit}>
        <input {...register("import")} type="file" />
        {botAvatar ? (
          <img src={`${SUPABASE_BUCKET_URL}/bot_avatars/${botAvatar}` || ""} />
        ) : (
          <span>{importFile?.[0] && <img src={URL.createObjectURL(importFile[0])} />}</span>
        )}
        <input {...register("name")} placeholder="Name" />
        <input {...register("description")} placeholder="description" />
        <input {...register("personality")} placeholder="personality" />
        <input {...register("scenario")} placeholder="scenario" />
        <textarea {...register("first_message")} placeholder="first_message" />
        <textarea {...register("example_dialogs")} placeholder="example_dialogs" />
        <input {...register("is_nsfw")} type="checkbox" /> Is NSFW Bot
        <input {...register("is_public")} type="checkbox" /> Is Public Bot
        <p>TAG NOT WORK YET</p>
        <input {...register("tag_ids")} placeholder="tags" />
        <input type="submit" value={mode === "create" ? "Create Bot" : "Update Bot"} />
      </form>
    </div>
  );
};
