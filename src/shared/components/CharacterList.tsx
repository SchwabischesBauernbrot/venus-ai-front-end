import { BookOutlined, WechatOutlined } from "@ant-design/icons";
import { Tooltip, Badge } from "antd";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

import { CharacterView } from "../../types/backend-alias";
import { characterUrl } from "../services/url-utils";
import { deleteCharacter } from "../../features/Character/services/character-service";
import { CharacterCard } from "./CharacterCard";
import { useCallback, useContext } from "react";
import { AppContext } from "../../appContext";
import { isBlocked, isTagBlocked } from "../../features/Profile/services/profile-service";

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

const CharacterStats = styled.span`
  font-size: 0.8rem;
`;

export const CharacterList: React.FC<CharacterListProps> = ({
  characters,
  editable,
  size = "medium",
  onCharacterDeleted,
}) => {
  const { profile } = useContext(AppContext);

  if (characters.length === 0) {
    return <p>No characters</p>;
  }

  const removeCharacter = async (characterId: string) => {
    await deleteCharacter(characterId);
    onCharacterDeleted?.();
  };

  const hideCard = useCallback(
    (character: CharacterView) => {
      if (!profile) {
        return false;
      }

      return (
        isBlocked(profile.block_list, "bots", character.id) ||
        isBlocked(profile.block_list, "creators", character.creator_id) ||
        isTagBlocked(
          profile.block_list,
          (character.tags || []).map((tag) => tag.id)
        )
      );
    },
    [profile]
  );

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
              <CharacterCard
                character={character}
                editable={editable}
                onDelete={removeCharacter}
                hidden={hideCard(character)}
              />
            </Badge.Ribbon>
          ) : (
            <CharacterCard
              character={character}
              editable={editable}
              onDelete={removeCharacter}
              hidden={hideCard(character)}
            />
          )}
        </Link>
      ))}
    </CharacterContainer>
  );
};
