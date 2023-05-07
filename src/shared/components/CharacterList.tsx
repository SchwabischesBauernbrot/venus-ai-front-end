import { BookOutlined, DeleteOutlined, EditOutlined, WechatOutlined } from "@ant-design/icons";
import { Card, Space, Tooltip, Tag, Badge, Button, Popconfirm } from "antd";
import Meta from "antd/es/card/Meta";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
import { truncate } from "lodash-es";

import { getBotAvatarUrl, toSlug } from "../services/utils";
import { CharacterView } from "../../types/backend-alias";
import { PrivateIndicator } from "./PrivateIndicator";
import { TagLink } from "./TagLink";
import { VerifiedMark } from "./shared";
import { characterUrl, profileUrl } from "../services/url-utils";
import { deleteCharacter } from "../../features/Character/services/character-service";

interface CharacterListProps {
  characters: CharacterView[];
  editable?: boolean;
  size?: "small" | "medium";
  onCharacterDeleted?: () => void;
}

const CharacterContainer = styled.div<{ size: "small" | "medium" }>`
  margin: 1rem 0;

  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    ${(props) => (props.size === "small" ? "minmax(10rem, 1fr)" : "minmax(14rem, 1fr)")}
  );
  grid-gap: ${(props) => (props.size === "small" ? "1rem" : "1.5rem")};
  align-items: stretch;

  .ant-card-cover {
    position: relative;
  }
  .ant-ribbon-wrapper {
    height: 100%;
  }

  ${(props) =>
    props.size === "small" &&
    css`
      .ant-card-head {
        min-height: 2rem;
        padding: 0 0.75rem;
        font-size: 0.8rem;
      }

      .ant-card-body {
        padding: 0.75rem;
        font-size: 0.8rem;
      }

      .ant-tag {
        font-size: 0.75rem;
        line-height: 1rem;
      }

      .ant-ribbon {
        padding: 0 0.3rem;
        line-height: 1.1rem;
      }
    `}
`;

const CharacterImage = styled.img`
  aspect-ratio: 1/1;
  object-fit: cover;
  object-position: top;
`;

const CharacterStats = styled.span`
  font-size: 0.8rem;
`;

const CreatorName = styled.p`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const CharacterCard: React.FC<{
  character: CharacterView;
  editable?: boolean;
  onDelete?: (character: CharacterView) => void;
}> = ({ character, editable, onDelete }) => {
  return (
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
                <EditOutlined /> Edit
              </Link>,
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <Popconfirm
                  title="Delete this character?"
                  description={
                    <div>
                      Are you sure to delete this character? <br /> All your chats will be lost
                      forever!
                    </div>
                  }
                  onConfirm={() => {
                    onDelete?.(character);
                  }}
                  okText="Yes"
                  cancelText="No"
                >
                  <DeleteOutlined /> Delete
                </Popconfirm>
              </span>,
            ]
          : undefined
      }
    >
      {!editable && (
        <Link to={profileUrl(character.creator_id, character.creator_name)}>
          <CreatorName>
            @{character.creator_name} {character.creator_verified && <VerifiedMark size="small" />}
          </CreatorName>
        </Link>
      )}
      <Meta
        description={
          <Tooltip title={character.description}>
            {truncate(character.description, { length: 100 })}
          </Tooltip>
        }
      />
      <Space className="mt-4 " size={[0, 4]} wrap>
        {character.is_nsfw ? <Tag color="error">🔞 NSFW</Tag> : ""}
        {character.tags?.slice(0, 4).map((tag) => (
          <TagLink tag={tag} />
        ))}
      </Space>
    </Card>
  );
};

export const CharacterList: React.FC<CharacterListProps> = ({
  characters,
  editable,
  size = "medium",
  onCharacterDeleted,
}) => {
  if (characters.length === 0) {
    return <p>No characters</p>;
  }

  const removeCharacter = async (character: CharacterView) => {
    await deleteCharacter(character.id);
    onCharacterDeleted?.();
  };

  return (
    <CharacterContainer size={size}>
      {characters.map((character) => (
        <Link key={character.id} to={characterUrl(character.id, character.name)}>
          {character.stats ? (
            <Badge.Ribbon
              text={
                character.stats && (
                  <Tooltip
                    title={`Total: ${character.stats?.chat} chats, ${character.stats?.message} messages`}
                  >
                    <CharacterStats>
                      <BookOutlined />
                      {character.stats?.chat} <WechatOutlined />
                      {character.stats?.message}
                    </CharacterStats>
                  </Tooltip>
                )
              }
            >
              <CharacterCard character={character} editable={editable} onDelete={removeCharacter} />
            </Badge.Ribbon>
          ) : (
            <CharacterCard character={character} editable={editable} onDelete={removeCharacter} />
          )}
        </Link>
      ))}
    </CharacterContainer>
  );
};
