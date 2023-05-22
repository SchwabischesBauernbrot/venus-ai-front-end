import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { Card, Popconfirm, Tooltip, Space, Tag } from "antd";
import { truncate } from "lodash-es";
import { Link } from "react-router-dom";
import { CharacterLite, CharacterView } from "../../types/backend-alias";
import { profileUrl } from "../services/url-utils";
import { getBotAvatarUrl } from "../services/utils";
import { PrivateIndicator } from "./PrivateIndicator";
import { TagLink } from "./TagLink";
import { VerifiedMark } from "./shared";

export interface CharacterCardProps {
  character: CharacterView | CharacterLite;
  editable?: boolean;
  onDelete?: (characterId: string) => void;
  hidden?: boolean;
}

const CharacterImage = styled.img`
  aspect-ratio: 1/1;
  object-fit: cover;
  object-position: top;
`;
const CreatorName = styled.p`
  line-height: 0.8rem;
  margin-top: 2px;

  span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 85%;
  }
`;

const BLOCK_BOT_URL = "5695c612-fcf0-472c-9111-74b2823bb677.jpg";

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  editable,
  hidden,
  onDelete,
}) => {
  console.log({ hidden, character });

  return (
    <Card
      hoverable
      size="small"
      style={{ height: "100%" }}
      className="d-flex flex-column"
      key={character.id}
      title={
        <span>
          {"is_public" in character && <PrivateIndicator isPublic={character.is_public} />}{" "}
          {hidden ? "Blocked" : character.name}
        </span>
      }
      // Add bot statistics in cover here
      cover={
        <CharacterImage
          alt={character.name}
          src={getBotAvatarUrl(hidden ? BLOCK_BOT_URL : character.avatar)}
        />
      }
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
                    onDelete?.(character.id);
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
            <span>@{character.creator_name}</span>{" "}
            {character.creator_verified && <VerifiedMark size="small" />}
          </CreatorName>
        </Link>
      )}
      <Card.Meta
        description={
          <Tooltip title={character.description}>
            {hidden ? "" : truncate(character.description, { length: 100 })}
          </Tooltip>
        }
      />
      <Space className="mt-4 " size={[0, 4]} wrap>
        {character.is_nsfw ? <Tag color="error">🔞 NSFW</Tag> : ""}
        {"tags" in character && character.tags?.slice(0, 4).map((tag) => <TagLink tag={tag} />)}
      </Space>
    </Card>
  );
};
