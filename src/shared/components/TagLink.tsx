import { Link } from "react-router-dom";
import { TagEntity } from "../../types/backend-alias";
import { Tag, Tooltip } from "antd";
import { tagUrl } from "../services/url-utils";

export const TagLink: React.FC<{ tag: TagEntity }> = ({ tag }) => (
  <Link to={tagUrl(tag.id, tag.slug)} target="_blank">
    <Tooltip key={tag.id} title={`${tag.description} - Click to view more`}>
      <Tag>{tag.name}</Tag>
    </Tooltip>
  </Link>
);
