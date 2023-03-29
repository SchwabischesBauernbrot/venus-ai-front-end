import axios from "axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { axiosInstance, supabase } from "../../config";
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
}

export const CharacterForm = () => {
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
    },
  });

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
    let botAvatar = null;
    if (avatarImg) {
      const extension = avatarImg.name.substring(avatarImg.name.lastIndexOf(".") + 1);

      const result = await supabase.storage
        .from("bot-avatars")
        .upload(`${crypto.randomUUID()}.${extension}`, avatarImg, {
          cacheControl: "3600",
          upsert: true,
        });
      botAvatar = result.data && result.data.path;
    }

    const result = await axiosInstance.post("/character", {
      ...values,
      avatar: botAvatar,
    });

    console.log(result.data);
  });

  return (
    <div>
      BotForm
      <form onSubmit={onSubmit}>
        <h3>Import TavernAI bot</h3>
        <input {...register("import")} type="file" />
        <input {...register("name")} placeholder="Name" />
        <input {...register("description")} placeholder="description" />
        <input {...register("personality")} placeholder="personality" />
        <input {...register("scenario")} placeholder="scenario" />
        <textarea {...register("first_message")} placeholder="first_message" />
        <textarea {...register("example_dialogs")} placeholder="example_dialogs" />
        <input {...register("is_nsfw")} type="checkbox" /> Is NSFW Bot
        <input {...register("is_public")} type="checkbox" /> Is Public Bot
        <input type="submit" value="Import" />
      </form>
    </div>
  );
};
