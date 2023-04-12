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
  size?: "small" | "medium";
}

const CharacterContainer = styled.div<{ size: "small" | "medium" }>`
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    ${(props) => (props.size === "small" ? "12rem" : "15rem")}
  );
  grid-gap: ${(props) => (props.size === "small" ? "1rem" : "2rem")};
  align-items: stretch;
`;

const CharacterImage = styled.img`
  aspect-ratio: 1/1;
  object-fit: cover;
  object-position: top;
`;

export const CharacterList: React.FC<CharacterListProps> = ({
  characters,
  editable,
  size = "medium",
}) => {
  if (characters.length === 0) {
    return <p>No characters</p>;
  }

  return (
    <CharacterContainer size={size}>
      {characters.map((character) => (
        <Link
          key={character.id}
          to={`/characters/${character.id}`}
          target="_blank"
          className="mb-4"
        >
          <Card
            hoverable
            size="small"
            style={{ maxWidth: "16rem", height: "100%" }}
            key={character.id}
            title={`${character.is_public === false ? "🔒" : ""} ${character.name}`}
            // Add bot statistics in cover here
            cover={<CharacterImage alt={character.name} src={getBotAvatarUrl(character.avatar)} />}
            actions={
              editable
                ? [
                    <Link to={`/edit_character/${character.id}`}>
                      <EditOutlined /> Edit Character
                    </Link>,
                  ]
                : undefined
            }
          >
            {!editable && (
              <Link target="_blank" to={`/profiles/${character.creator_id}`}>
                <p>@{character.creator_name}</p>
              </Link>
            )}
            <Meta description={character.description} />

            {character.tags && (
              <Space className="mt-4" size={[0, 8]} wrap>
                {character.is_nsfw ? <Tag color="error">🔞 NSFW</Tag> : ""}
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
