import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { parseCharacter } from "../../services/character_parse";

interface FormValues {
  import?: FileList;
}

export const CharacterForm = () => {
  const {
    register,
    // handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: {} });

  const importFile = watch("import");

  useEffect(() => {
    async function run() {
      if (importFile?.[0]) {
        const file = importFile[0];
        console.log({ file });

        try {
          const source = await parseCharacter(file);
          console.log(source, source.character, source.image, source.json, source.character.tokens);
        } catch (ex) {
          console.error(ex);
        }
      }
    }

    run();
  }, [importFile]);

  const onSubmit = () => {
    console.log("hello");
  };

  return (
    <div>
      BotForm
      <form onSubmit={onSubmit}>
        <h3>Import TavernAI bot</h3>
        <input {...register("import")} type="file" />
        <input type="submit" value="Import" />
      </form>
    </div>
  );
};
