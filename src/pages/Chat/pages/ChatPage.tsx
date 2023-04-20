import { Button, Col, Row, Spin, Input, Layout, InputRef, List, message, Divider } from "antd";
import { LeftCircleFilled, LeftOutlined, RightOutlined, SendOutlined } from "@ant-design/icons";
import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
import { findLast } from "lodash-es";

import { ChatMessageEntity, SupaChatMessage } from "../../../types/backend-alias";
import { useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import { AppContext } from "../../../appContext";
import { generate } from "../../../services/generate/mock-generate";
import { chatService } from "../services/chat-service";
import {
  ChatContainer,
  BotMessageControl,
  ChatInputContainer,
  BotChoicesOverlay,
  BotChoicesContainer,
} from "./ChatPage.style";
import { MessageDisplay } from "../components/MessageDisplay";
import { formatTime, getBotAvatarUrl } from "../../../services/utils";
import { ChatOptionMenu } from "../components/ChatOptionMenu/ChatOptionMenu";
import { PrivateIndicator } from "../../../components";

interface ChatState {
  messages: SupaChatMessage[]; // All server-side messages
  messagesToDisplay: SupaChatMessage[]; // For displaying: service-side messages + client-side messages
  choiceIndex: number;
}

const initialChatState: ChatState = {
  messages: [],
  messagesToDisplay: [],
  choiceIndex: 0,
};

type Action =
  | { type: "set_messages"; messages: SupaChatMessage[] }
  | { type: "set_index"; newIndex: number }
  | { type: "delete_message"; messageId: number }
  | { type: "new_client_messages"; messages: SupaChatMessage[] }
  | { type: "new_server_messages"; messages: SupaChatMessage[] }
  | { type: "message_edited"; message: SupaChatMessage };

const dispatchFunction = (state: ChatState, action: Action): ChatState => {
  switch (action.type) {
    case "set_messages":
      return { ...state, messages: [...action.messages], messagesToDisplay: [...action.messages] };

    case "set_index":
      return { ...state, choiceIndex: action.newIndex };

    case "new_client_messages":
      return { ...state, messagesToDisplay: [...state.messages, ...action.messages] };

    case "new_server_messages":
      return {
        ...state,
        messages: [...state.messages, ...action.messages],
        messagesToDisplay: [...state.messages, ...action.messages],
      };

    case "message_edited":
      const editIndex = state.messages.findIndex((m) => m.id === action.message.id);
      const newMessages = state.messages.map((content, i) =>
        i === editIndex ? action.message : content
      );
      return dispatchFunction(state, { type: "set_messages", messages: newMessages });

    default:
      return state;
  }
};

export const ChatPage: React.FC = () => {
  const { profile } = useContext(AppContext);
  const { chatId } = useParams();
  const inputRef = useRef<InputRef>(null);
  const messageDivRef = useRef<HTMLDivElement>(null);

  const [inputMessage, setInputMessage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [chatState, dispatch] = useReducer(dispatchFunction, initialChatState);
  const { choiceIndex, messagesToDisplay } = chatState;
  const mainMessages = messagesToDisplay.filter((message) => message.is_main);
  const botChoices = messagesToDisplay.filter((message) => message.is_bot && !message.is_main);

  const canEdit = Boolean(profile);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (messageDivRef.current) {
        messageDivRef.current.scrollTop = messageDivRef.current?.scrollHeight;
      }
    }, 50);
  }, [messageDivRef.current]);

  const { data, refetch, isLoading } = useQuery(
    ["chat", chatId],
    async () => chatService.getChatById(chatId),
    {
      enabled: false,
      onSuccess: () => {
        inputRef.current?.focus();

        scrollToBottom();
      },
    }
  );

  const refreshChats = async () => {
    const data = await refetch();
    const messages = data.data?.chatMessages || [];
    messages.sort((a, b) => a.id - b.id);
    dispatch({ type: "set_messages", messages });
  };

  useEffect(() => {
    refreshChats();
  }, [profile]);

  const deleteMessage = async (messageId: number) => {
    const messageToDeletes = chatState.messages.filter((message) => message.id >= messageId);
    await chatService.deleteMessages(
      chatId,
      messageToDeletes.map((message) => message.id)
    );

    refreshChats();
  };

  const swipe = async (direction: "left" | "right") => {
    // If message already have, just slide
    const newIndex = choiceIndex + (direction === "left" ? -1 : 1);
    if (newIndex < 0) {
      return;
    } else if (newIndex < botChoices.length) {
      dispatch({ type: "set_index", newIndex });
      return;
    } else if (!canEdit) {
      return;
    }

    // Otherwise, generate
    setIsGenerating(true);
    try {
      const fakeBotMessage: ChatMessageEntity = {
        id: -1,
        chat_id: 0,
        created_at: "",
        is_bot: true,
        is_main: false,
        message: "",
      };
      dispatch({ type: "set_index", newIndex });
      dispatch({ type: "new_client_messages", messages: [fakeBotMessage] });

      let combined = "";
      // try get prompt somehow
      const prompt = findLast(chatState.messages, (m) => !m.is_bot)?.message || "";
      const botMessages = await generate(prompt);
      for await (const message of botMessages) {
        combined = combined += message;
        const newBotMessage: ChatMessageEntity = {
          id: -1,
          chat_id: 0,
          created_at: "",
          is_bot: true,
          is_main: false,
          message: combined,
        };
        dispatch({ type: "new_client_messages", messages: [newBotMessage] });
        scrollToBottom();
      }

      const botMessage = await chatService.createMessage(chatId, {
        message: combined,
        is_bot: true,
        is_main: false,
      });
      dispatch({ type: "new_server_messages", messages: [botMessage] });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendChat = async () => {
    try {
      setIsGenerating(true);
      setInputMessage("");

      const localUserMessage: ChatMessageEntity = {
        id: -2,
        chat_id: 0,
        created_at: "",
        is_bot: false,
        is_main: true,
        message: inputMessage.trimEnd(),
      };
      const localBotMessage: ChatMessageEntity = {
        id: -1,
        chat_id: 0,
        created_at: "",
        is_bot: true,
        is_main: false,
        message: "",
      };

      // Remove non is_main message
      const choiceToKeep = botChoices[choiceIndex];
      if (choiceToKeep) {
        choiceToKeep.is_main = true;

        // No await, lol
        chatService.updateMassage(chatId, choiceToKeep.id, {
          is_main: true,
        });
      }
      const choicesToDelete = botChoices.filter((v, i) => i !== choiceIndex);
      if (choicesToDelete.length > 0) {
        chatService.deleteMessages(
          chatId,
          choicesToDelete.map((message) => message.id)
        );
      }

      // Assume deleting always success lol
      dispatch({
        type: "set_messages",
        messages: [...chatState.messages.filter((message) => message.is_main)],
      });
      dispatch({
        type: "new_client_messages",
        messages: [localUserMessage, localBotMessage],
      });
      dispatch({ type: "set_index", newIndex: 0 });
      scrollToBottom();

      // Generate prompt back-end to get generated message
      const chatHistory = [...chatState.messages, localUserMessage];
      const prompt = findLast(chatHistory, (m) => !m.is_bot)?.message || "";
      const generatedTexts = await generate(prompt);

      let streamingText = "";
      for await (const text of generatedTexts) {
        streamingText += text;
        localBotMessage.message = streamingText;
        dispatch({
          type: "new_client_messages",
          messages: [localUserMessage, localBotMessage],
        });

        scrollToBottom();
      }

      // Don't do in parallel, make sure user message is created first
      // Create both of them, if failed to create bot message, no need to save
      const serverUserMassage = await chatService.createMessage(chatId, localUserMessage);
      const serverBotMassage = await chatService.createMessage(chatId, localBotMessage);

      console.log("this is called??");
      dispatch({ type: "new_server_messages", messages: [serverUserMassage, serverBotMassage] });
    } catch (error) {
      message.error(JSON.stringify(error, null, 2));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout
      style={{ minHeight: "100vh" }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          swipe("left");
        } else if (event.key === "ArrowRight") {
          swipe("right");
        }
      }}
    >
      <Layout.Content>
        <div className="pt-4">
          {isLoading && (
            <div className="text-center">
              <Spin />
            </div>
          )}

          {data && (
            <>
              <Row>
                <Col span={12} offset={6} className="d-flex justify-space-between align-center">
                  <Link to="/">
                    <Button type="text" size="large">
                      <LeftCircleFilled /> Back
                    </Button>
                  </Link>

                  <ChatOptionMenu chat={data.chat} />
                </Col>
              </Row>

              <Divider className="mt-2">
                <PrivateIndicator isPublic={data.chat.is_public} /> Chat with{" "}
                {data.chat.characters.name} (Started at {formatTime(data.chat.created_at)})
              </Divider>

              <Row>
                <Col span={12} offset={6}>
                  <ChatContainer ref={messageDivRef}>
                    <List
                      className="text-left"
                      itemLayout="horizontal"
                      dataSource={mainMessages}
                      renderItem={(item) => (
                        <MessageDisplay
                          key={item.id}
                          canEdit={canEdit}
                          message={item}
                          user={profile?.name}
                          userAvatar={profile?.avatar}
                          characterName={data.chat.characters.name}
                          characterAvatar={data.chat.characters.avatar}
                          onDelete={deleteMessage}
                          onEdit={async (messageId, newMessage) => {
                            item.message = newMessage; // Local edit

                            // Server edit
                            const editedMessage = await chatService.updateMassage(
                              chatId,
                              messageId,
                              {
                                message: newMessage,
                              }
                            );
                            dispatch({ type: "message_edited", message: editedMessage });
                          }}
                        />
                      )}
                    />

                    {botChoices.length > 0 && (
                      <BotChoicesContainer>
                        <BotMessageControl>
                          {choiceIndex > 0 && (
                            <Button
                              type="text"
                              shape="circle"
                              size="large"
                              onClick={() => swipe("left")}
                            >
                              <LeftOutlined />
                            </Button>
                          )}
                          <Button
                            style={{ marginLeft: "auto" }}
                            type="text"
                            shape="circle"
                            size="large"
                            onClick={() => swipe("right")}
                          >
                            <RightOutlined />
                          </Button>
                        </BotMessageControl>

                        <BotChoicesOverlay index={choiceIndex}>
                          {botChoices.map((item) => (
                            <MessageDisplay
                              key={item.id}
                              message={item}
                              canEdit={canEdit}
                              user={profile?.name}
                              userAvatar={profile?.avatar}
                              characterName={data.chat.characters.name}
                              characterAvatar={data.chat.characters.avatar}
                              onDelete={deleteMessage}
                              onEdit={(messageId, newMessage) => {
                                console.log(messageId, newMessage);
                              }}
                            />
                          ))}
                        </BotChoicesOverlay>
                      </BotChoicesContainer>
                    )}
                  </ChatContainer>
                </Col>
              </Row>
            </>
          )}

          <ChatInputContainer>
            <Row>
              {/* TODO: Disable this when not set API */}
              <Col span={12} offset={6}>
                <form onSubmit={sendChat}>
                  <div className="d-flex align-center">
                    <Input.TextArea
                      rows={3}
                      placeholder="Enter your chat"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onPressEnter={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault(); // prevent the default line break behavior
                          sendChat();
                        }
                      }}
                      ref={inputRef}
                    />
                    <Button
                      loading={isGenerating}
                      disabled={inputMessage.length === 0 || isGenerating}
                      icon={<SendOutlined />}
                      type="text"
                      size="large"
                      style={{ color: "#3498db" }}
                      onClick={sendChat}
                    />
                  </div>
                </form>
              </Col>
            </Row>
          </ChatInputContainer>
        </div>
      </Layout.Content>
    </Layout>
  );
};
