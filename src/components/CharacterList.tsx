import { EditOutlined } from "@ant-design/icons";
import { Card, Space, Tooltip, Tag, Button } from "antd";
import Meta from "antd/es/card/Meta";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { getBotAvatarUrl } from "../services/utils";
import { CharacterView } from "../types/backend-alias";

interface CharacterListProps {
  characters: CharacterView[];
  editable?: boolean;
}

const CharacterContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  flex-wrap: wrap;
`;

const CharacterImage = styled.img`
  aspect-ratio: 1/1;
  object-fit: cover;
`;

export const CharacterList: React.FC<CharacterListProps> = ({ characters, editable }) => {
  return (
    <CharacterContainer>
      {characters.map((character) => (
        <Link to={`/characters/${character.id}`} target="_blank" className="mb-4">
          <Card
            hoverable
            size="small"
            style={{ maxWidth: "14rem", height: "100%" }}
            key={character.id}
            cover={<CharacterImage alt={character.name} src={getBotAvatarUrl(character.avatar)} />}
            actions={
              editable
                ? [
                    <Button>
                      <EditOutlined /> Edit Character
                    </Button>,
                  ]
                : undefined
            }
          >
            <Meta
              title={`${character.name} ${character.is_nsfw ? "(🔞 NSFW)" : ""}`}
              description={character.description}
            />

            {character.tags && (
              <Space className="mt-4" size={[0, 8]} wrap>
                {character.tags.map((tag) => (
                  <Tooltip key={tag.id} title={tag.description}>
                    <Tag>{tag.name}</Tag>
                  </Tooltip>
                ))}
              </Space>
            )}
          </Card>
        </Link>
      ))}
    </CharacterContainer>
  );
};
