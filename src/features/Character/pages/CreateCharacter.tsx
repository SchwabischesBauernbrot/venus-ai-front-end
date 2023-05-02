import { Typography } from "antd";
import { Helmet } from "react-helmet";
import { SITE_NAME } from "../../../config";
import { PageContainer } from "../../../shared/components/shared";
import { CharacterForm } from "../components/CharacterForm";

const { Title } = Typography;

export const CreateCharacter: React.FC = () => {
  return (
    <PageContainer>
      <Helmet>
        <title>{SITE_NAME} - Create character</title>
      </Helmet>
      <Title level={2}>Create Character</Title>

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
