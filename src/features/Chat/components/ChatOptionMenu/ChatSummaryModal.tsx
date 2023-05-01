import { Modal, Input, Button, Tooltip, App, Space } from "antd";
import { useContext, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { AppContext } from "../../../../appContext";
import { ChatEntityWithCharacter } from "../../../../types/backend-alias";
import React from "react";
import { CopyOutlined, SaveOutlined } from "@ant-design/icons";
import { chatService } from "../../services/chat-service";
import { countMessagesToken, summaryUsingOpenAI } from "../../services/summary-service";
import { last } from "lodash-es";

interface ChatHistoryModalProps {
  chat: ChatEntityWithCharacter;
  open: boolean;
  onReload: () => void;
  onModalClose: () => void;
}

export const ChatSummaryModal: React.FC<ChatHistoryModalProps> = ({
  open,
  chat,
  onReload,
  onModalClose,
}) => {
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

  const messagesToConsider = React.useMemo(() => {
    // Need to reverse because messages is sorted by created time on back-end lol
    const messages = [...(data?.chatMessages || [])].reverse();

    const mainMessages = messages.filter((m) => m.is_main);
    // Get the first non-main message
    const lastMessage = messages.find((m) => !m.is_main);

    const messagesToSummary = [...mainMessages];
    if (lastMessage && lastMessage.id > last(mainMessages)!.id) {
      messagesToSummary.push(lastMessage);
    }

    return messagesToSummary;
  }, [data]);

  const massagesSinceLastSave = messagesToConsider.filter(
    (m) => m.id >= (data?.chat.summary_chat_id || 0)
  );

  const generateSummary = async (type: "full" | "last") => {
    const messagesToSummary = type === "last" ? massagesSinceLastSave : messagesToConsider;

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
      summary_chat_id: last(messagesToConsider)?.id,
    });

    if (result.id) {
      message.success("Sucesfully update chat summary");

      // Refresh ChatPage, can not auto reload because we set enable:false
      queryClient.cancelQueries(["chat", chat.id]);
      onReload();

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

      <p>
        {chat.summary_chat_id ? (
          <span>
            You have updated the chat summary around{" "}
            <strong>
              ~{massagesSinceLastSave.length} messages ({countMessagesToken(massagesSinceLastSave)}{" "}
              tokens)
            </strong>{" "}
            ago.
          </span>
        ) : (
          <span>
            You have{" "}
            <strong>
              ~{messagesToConsider.length} messages ({countMessagesToken(messagesToConsider)}{" "}
              tokens)
            </strong>{" "}
            unsaved.
          </span>
        )}
      </p>

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
              style={{ whiteSpace: "normal", height: "auto" }}
              onClick={() => generateSummary("last")}
              type="primary"
              block
            >
              <span>
                <CopyOutlined /> Auto Summary (Since last updated)
              </span>
            </Button>
          )}

          <Button
            disabled={!canAutoGenerate || isGeneratingSummary}
            loading={isGeneratingSummary}
            style={{ whiteSpace: "normal", height: "auto" }}
            onClick={() => generateSummary("full")}
            block
          >
            <span>
              <CopyOutlined /> Auto Summary (As far as possible)
            </span>
          </Button>
        </Space.Compact>
      </Tooltip>
    </Modal>
  );
};
