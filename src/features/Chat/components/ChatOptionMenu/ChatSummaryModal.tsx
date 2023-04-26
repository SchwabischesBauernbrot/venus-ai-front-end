import { Modal, Spin, Input, Form, Button, Tooltip } from "antd";
import { useContext, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { AppContext } from "../../../../appContext";
import { ChatList } from "../../../../shared/components";
import { supabase } from "../../../../config";
import { ChatEntityWithCharacter } from "../../../../types/backend-alias";
import React from "react";
import { CopyOutlined, SaveOutlined } from "@ant-design/icons";
import { chatService } from "../../services/chat-service";
import { summaryUsingOpenAI } from "../../services/summary-service";

interface ChatHistoryModalProps {
  chat: ChatEntityWithCharacter;
  open: boolean;
  onModalClose: () => void;
}

export const ChatSummaryModal: React.FC<ChatHistoryModalProps> = ({ open, chat, onModalClose }) => {
  // Get all chats
  const { config, localData } = useContext(AppContext);

  const [summary, setSummary] = useState(chat.summary);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const canAutoGenerate = useMemo(
    () => chatService.readyToChat(config, localData) && config?.api === "openai",
    [config, localData]
  );

  const { data } = useQuery(["chat", chat.id], async () => chatService.getChatById(chat.id), {
    enabled: Boolean(chat.id),
  });

  const generateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const chatMessages = data?.chatMessages;
      const summaries = await summaryUsingOpenAI(chatMessages || [], { ...config!, ...localData });

      let concentrated = "";
      for await (const summary of summaries) {
        concentrated += summary;
        setSummary(concentrated);
      }
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <Modal
      title="Summary of this chat"
      open={open}
      onOk={onModalClose}
      okText={
        <span>
          <SaveOutlined /> Save Summary
        </span>
      }
      onCancel={onModalClose}
    >
      <p>
        Enter a summary for your chat. This will be included into the prompt as long-term memory.
      </p>

      <Input.TextArea
        autoSize
        rows={4}
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />

      <Tooltip title="If you use OpenAI's API, click this button to auto generate the summary">
        <Button
          disabled={!canAutoGenerate || isGeneratingSummary}
          loading={isGeneratingSummary}
          icon={<CopyOutlined />}
          onClick={() => generateSummary()}
          type="primary"
          block
          className="my-4"
        >
          Auto Summary
        </Button>
      </Tooltip>
    </Modal>
  );
};
