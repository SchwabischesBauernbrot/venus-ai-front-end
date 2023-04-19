import { Modal, Spin } from "antd";
import { useContext } from "react";
import { useQuery } from "react-query";
import { AppContext } from "../../../../appContext";
import { ChatList } from "../../../../components";
import { supabase } from "../../../../config";
import { ChatEntityWithCharacter } from "../../../../types/backend-alias";

interface ChatHistoryModalProps {
  character: ChatEntityWithCharacter["characters"];
  open: boolean;
  onModalClose: () => void;
}

export const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({
  open,
  character,
  onModalClose,
}) => {
  const { profile } = useContext(AppContext);

  // Get all chats
  const { data, refetch, isLoading } = useQuery(
    ["chats", profile?.id],
    async () => {
      const responses = await supabase
        .from("chats")
        .select("*, characters(name, description, avatar)")
        .order("created_at", { ascending: false })
        .eq("user_id", profile?.id)
        .eq("character_id", character.id)
        .returns<ChatEntityWithCharacter[]>();

      const chats = responses.data;
      return chats;
    },
    { enabled: !!profile }
  );

  return (
    <Modal
      title={`Your chats with ${character.name}`}
      open={open}
      onOk={onModalClose}
      onCancel={onModalClose}
      footer={null}
    >
      {isLoading && <Spin />}
      {data && <ChatList chats={data} size="small" onChatDeleted={() => refetch()} />}
    </Modal>
  );
};
