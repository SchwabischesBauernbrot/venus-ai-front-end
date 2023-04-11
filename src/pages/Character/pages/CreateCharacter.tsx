import { Typography } from "antd";
import { PageContainer } from "../../../components/shared.components";
import { CharacterForm } from "../components/CharacterForm";

const { Title } = Typography;

export const CreateCharacter: React.FC = () => {
  return (
    <PageContainer>
      <Title>Create Character</Title>

      <CharacterForm
        values={{
          is_nsfw: false,
          is_public: true,
          description: "",
          scenario: "",
          example_dialogs: "",
          first_message: "",
          tag_ids: [],
        }}
      />
    </PageContainer>
  );
};
