import { EditOutlined } from "@ant-design/icons";
import { Card, Space, Tooltip, Tag } from "antd";
import Meta from "antd/es/card/Meta";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { truncate } from "lodash-es";

import { getBotAvatarUrl } from "../services/utils";
import { CharacterView } from "../../types/backend-alias";
import { PrivateIndicator } from "./PrivateIndicator";

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
    ${(props) => (props.size === "small" ? "minmax(15rem, 1fr)" : "minmax(18rem, 1fr)")}
  );
  grid-gap: ${(props) => (props.size === "small" ? "1rem" : "1.5rem")};
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
        <Link key={character.id} to={`/characters/${character.id}`} className="mb-4">
          <Card
            hoverable
            size="small"
            style={{ height: "100%" }}
            className="d-flex flex-column"
            key={character.id}
            title={
              <span>
                <PrivateIndicator isPublic={character.is_public} /> {character.name}
              </span>
            }
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
              <Link to={`/profiles/${character.creator_id}`}>
                <p>@{character.creator_name}</p>
              </Link>
            )}
            <Meta
              description={
                <Tooltip title={character.description}>
                  {truncate(character.description, { length: 100 })}
                </Tooltip>
              }
            />

            <Space className="mt-4 " size={[0, 8]} wrap>
              {character.is_nsfw ? <Tag color="error">🔞 NSFW</Tag> : ""}
              {character.tags?.map((tag) => (
                <Tooltip key={tag.id} title={tag.description}>
                  <Tag>{tag.name}</Tag>
                </Tooltip>
              ))}
            </Space>
          </Card>
        </Link>
      ))}
    </CharacterContainer>
  );
};
