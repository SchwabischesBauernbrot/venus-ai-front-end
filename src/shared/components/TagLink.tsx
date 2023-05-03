import { Link } from "react-router-dom";
import { TagEntity } from "../../types/backend-alias";
import { Tag, Tooltip } from "antd";

export const TagLink: React.FC<{ tag: TagEntity }> = ({ tag }) => (
  <Link to={`tags/${tag.id}_characters-with-tag-${tag.slug}`} target="_blank">
    <Tooltip key={tag.id} title={`${tag.description} - Click to view more`}>
      <Tag>{tag.name}</Tag>
    </Tooltip>
  </Link>
);
