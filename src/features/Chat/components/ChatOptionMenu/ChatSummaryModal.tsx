import { Modal, Input, Button, Tooltip, App, Space } from "antd";
import { useContext, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { AppContext } from "../../../../appContext";
import { ChatEntityWithCharacter } from "../../../../types/backend-alias";
import React from "react";
import { CopyOutlined, SaveOutlined } from "@ant-design/icons";
import { chatService } from "../../services/chat-service";
import { summaryUsingOpenAI } from "../../services/summary-service";
import { last } from "lodash-es";

interface ChatHistoryModalProps {
  chat: ChatEntityWithCharacter;
  open: boolean;
  onModalClose: () => void;
}

export const ChatSummaryModal: React.FC<ChatHistoryModalProps> = ({ open, chat, onModalClose }) => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const { config, localData } = useContext(AppContext);

  const [summary, setSummary] = useState(chat.summary || "");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const canAutoGenerate = useMemo(
    () => chatService.readyToChat(config, localData) && config?.api === "openai",
    [config, localData]
  );

  const { data } = useQuery(["chat", chat.id], async () => chatService.getChatById(chat.id), {
    enabled: Boolean(chat.id),
  });

  const messagesSinceLastSave = React.useMemo(() => {
    const messages = [...(data?.chatMessages || [])].filter((message) => message.is_main).reverse();

    // const result =
    return chat.summary_chat_id !== null
      ? messages.filter((message) => message.id > (chat.summary_chat_id ?? 0))
      : messages;

    // return result;
  }, [data]);

  const generateSummary = async (type: "full" | "last") => {
    // Need to reverse because messages is sorted by created time on back-end lol
    const messages = [...(data?.chatMessages || [])].filter((message) => message.is_main).reverse();
    const messagesToSummary = type === "last" ? messagesSinceLastSave : messages;

    if (messagesToSummary.length === 0) {
      message.info("Nothing new to summary.");
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const summaries = await summaryUsingOpenAI(messagesToSummary || [], {
        ...config!,
        ...localData,
      });

      let newSummary = type === "last" && chat.summary ? chat.summary + "\n" : "";
      for await (const smr of summaries) {
        newSummary += smr;
        setSummary(newSummary);
      }
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const onSave = async () => {
    const result = await chatService.updateChat(chat.id, {
      summary,
      summary_chat_id: last(messagesSinceLastSave)?.id,
    });

    if (result.id) {
      message.success("Sucesfully update chat summary");
      queryClient.invalidateQueries(["chat", chat.id]); // Refresh chat page

      onModalClose();
      return result;
    }
  };

  return (
    <Modal
      title="Summary of this chat"
      open={open}
      onOk={() => onSave()}
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

      {chat.summary_chat_id && (
        <p>
          You have updated the chat summary around ~ {messagesSinceLastSave?.length} messages ago.
        </p>
      )}

      <Input.TextArea
        autoSize
        rows={4}
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />

      <Tooltip title="If you use OpenAI's API, click to auto generate the summary" className="my-4">
        <Space.Compact direction="vertical" block>
          {chat.summary_chat_id && (
            <Button
              disabled={!canAutoGenerate || isGeneratingSummary}
              loading={isGeneratingSummary}
              icon={<CopyOutlined />}
              onClick={() => generateSummary("last")}
              type="primary"
              block
            >
              Generate Summary (Since last save)
            </Button>
          )}

          <Button
            disabled={!canAutoGenerate || isGeneratingSummary}
            loading={isGeneratingSummary}
            icon={<CopyOutlined />}
            onClick={() => generateSummary("full")}
            block
          >
            Generate Summary (All)
          </Button>
        </Space.Compact>
      </Tooltip>
    </Modal>
  );
};
