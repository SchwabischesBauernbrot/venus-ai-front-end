import { Tooltip } from "antd";

export const PrivateIndicator: React.FC<{ isPublic: boolean }> = ({ isPublic }) => {
  if (!isPublic) {
    return <Tooltip title="Only you can see this character/chat">🔒</Tooltip>;
  }
  return null;
};
