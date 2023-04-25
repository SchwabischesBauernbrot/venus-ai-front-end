import {
  Button,
  Col,
  Row,
  Spin,
  Input,
  Layout,
  InputRef,
  List,
  message,
  Divider,
  Space,
} from "antd";
import { LeftCircleFilled, LeftOutlined, RightOutlined, SendOutlined } from "@ant-design/icons";
import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
import { findLast } from "lodash-es";

import { ChatMessageEntity, SupaChatMessage } from "../../../types/backend-alias";
import { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AppContext } from "../../../appContext";
import { mockGenerateInstance } from "../services/generate/mock-generate";
import { openAiGenerateInstance } from "../services/generate/openai-generate";
import { chatService } from "../services/chat-service";
import {
  ChatContainer,
  BotMessageControl,
  ChatInputContainer,
  BotChoicesOverlay,
  BotChoicesContainer,
  CustomDivider,
  ChatLayout,
} from "./ChatPage.style";
import { MessageDisplay } from "../components/MessageDisplay";
import { ChatOptionMenu } from "../components/ChatOptionMenu/ChatOptionMenu";
import { PrivateIndicator } from "../../../shared/components";
import { UserConfigAndLocalData } from "../../../shared/services/user-config";
import { GenerateInterface } from "../services/generate/generate-interface";

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
  const { profile, config, localData } = useContext(AppContext);
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
  const isImmersiveMode = Boolean(config?.immersive_mode);
  const readyToChat = chatService.readyToChat(config, localData);

  const fullConfig: UserConfigAndLocalData = useMemo(() => {
    return { ...localData, ...config! };
  }, [localData, config]);
  let generateInstance: GenerateInterface = useMemo(() => {
    if (fullConfig.api === "openai") {
      return openAiGenerateInstance;
    }

    return mockGenerateInstance;
  }, [fullConfig]);

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

    scrollToBottom();
  };

  useEffect(() => {
    refreshChats();
  }, [profile]);

  const deleteMessage = async (messageId: number) => {
    if (messageId < 0) {
      return;
    }

    const messageToDeletes = chatState.messages.filter((message) => message.id >= messageId);
    await chatService.deleteMessages(
      chatId,
      messageToDeletes.map((message) => message.id)
    );

    refreshChats();
  };

  const swipe = async (direction: "left" | "right" | "regen") => {
    // If message already exist, just slide
    const directionIndex = { left: -1, regen: 0, right: 1 };
    const newIndex = choiceIndex + directionIndex[direction];
    if (newIndex < 0) {
      return;
    } else if (newIndex < botChoices.length) {
      dispatch({ type: "set_index", newIndex });
      return;
    } else if (!canEdit) {
      return;
    }

    if (isGenerating) {
      return;
    }

    // Otherwise, generate
    setIsGenerating(true);
    try {
      const localBotMessage: ChatMessageEntity = {
        id: -1,
        chat_id: 0,
        created_at: "",
        is_bot: true,
        is_main: false,
        message: `${data?.chat.characters.name} is replying...`,
      };
      dispatch({ type: "set_index", newIndex });
      dispatch({ type: "new_client_messages", messages: [localBotMessage] });

      let combined = "";

      // Simulate regenrate the massage
      const historyWithoutLastMessage = [...chatState.messages];
      historyWithoutLastMessage.pop();
      const lastMessage = findLast(chatState.messages, (m) => !m.is_bot);

      const prompt = generateInstance.buildPrompt(
        // message,
        lastMessage?.message || "",
        data?.chat!,
        historyWithoutLastMessage,
        fullConfig
      );

      // This method might fail for multiple reasons, allow user to regenerate
      const botMessages = await generateInstance.generate(prompt, fullConfig);

      if (direction === "right") {
        for await (const message of botMessages) {
          combined += message;
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
      } else if (direction === "regen") {
        const botChoice = botChoices[newIndex];
        botChoice.message = "";
        for await (const message of botMessages) {
          botChoice.message += message;
          dispatch({ type: "message_edited", message: botChoice });
          scrollToBottom();
        }

        // Update after regen
        const newRegenMessage = await chatService.updateMassage(chatId, botChoice.id, {
          message: botChoice.message,
        });
        dispatch({ type: "message_edited", message: newRegenMessage });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const sendChat = async () => {
    try {
      if (isGenerating) {
        return;
      }

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
        message: `${data?.chat.characters.name} is replying...`,
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

      const serverUserMassage = await chatService.createMessage(chatId, localUserMessage);

      // Generate prompt back-end to get generated message
      const prompt = generateInstance.buildPrompt(
        inputMessage,
        data?.chat!,
        chatState.messages,
        fullConfig
      );

      // This method might fail for multiple reasons, allow user to regenerate
      const generatedTexts = await generateInstance.generate(prompt, fullConfig);

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

      // If failed to create bot message, no need to save
      const serverBotMassage = await chatService.createMessage(chatId, localBotMessage);

      dispatch({ type: "new_server_messages", messages: [serverUserMassage, serverBotMassage] });
    } catch (err) {
      const error = err as Error;
      message.error(error.message, 3);

      // Refetch on error to avoid out of sync
      refreshChats();
    } finally {
      setIsGenerating(false);
    }
  };

  const editMessage = async (item: SupaChatMessage, messageId: number, newMessage: string) => {
    item.message = newMessage; // Local edit

    // Server edit
    const editedMessage = await chatService.updateMassage(chatId, messageId, {
      message: newMessage,
    });
    dispatch({ type: "message_edited", message: editedMessage });
  };

  return (
    <ChatLayout>
      {isLoading && (
        <div className="text-center mt-4">
          <Spin />
        </div>
      )}

      {data && (
        <>
          <Row justify="center">
            <Col lg={16} xs={24} md={20} className="d-flex justify-space-between align-center">
              <Link to={`/characters/${data.chat.characters.id}`}>
                <Button type="text" size="large">
                  <LeftCircleFilled /> Back
                </Button>
              </Link>

              <ChatOptionMenu readyToChat={readyToChat} chat={data.chat} />
            </Col>
          </Row>

          <CustomDivider>
            <PrivateIndicator isPublic={data.chat.is_public} /> Chat with{" "}
            {data.chat.characters.name}
          </CustomDivider>

          <Row justify="center" style={{ overflowY: "scroll" }} ref={messageDivRef}>
            <Col lg={16} xs={24} md={20}>
              <ChatContainer>
                <List
                  className="text-left"
                  itemLayout="horizontal"
                  dataSource={mainMessages}
                  renderItem={(item, index) => (
                    <MessageDisplay
                      key={item.id}
                      canEdit={canEdit && index > 0 && !isImmersiveMode}
                      message={item}
                      user={profile?.name}
                      userAvatar={profile?.avatar}
                      characterName={data.chat.characters.name}
                      characterAvatar={data.chat.characters.avatar}
                      onDelete={deleteMessage}
                      onEdit={async (messageId, newMessage) => {
                        editMessage(item, messageId, newMessage);
                      }}
                    />
                  )}
                />

                {botChoices.length > 0 && (
                  <BotChoicesContainer>
                    {!isGenerating && (
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
                    )}

                    <BotChoicesOverlay index={choiceIndex}>
                      {botChoices.map((item) => (
                        <MessageDisplay
                          key={item.id}
                          message={item}
                          canEdit={canEdit && !isImmersiveMode}
                          user={profile?.name}
                          userAvatar={profile?.avatar}
                          characterName={data.chat.characters.name}
                          characterAvatar={data.chat.characters.avatar}
                          onDelete={deleteMessage}
                          onEdit={(messageId, newMessage) => {
                            editMessage(item, messageId, newMessage);
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

      {!isLoading && canEdit && (
        <ChatInputContainer>
          <Row justify="center">
            <Col lg={16} xs={24} md={20}>
              <form onSubmit={sendChat}>
                <div className="d-flex align-center">
                  <Input.TextArea
                    rows={3}
                    disabled={!readyToChat}
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
                    disabled={!readyToChat || inputMessage.length === 0 || isGenerating}
                    icon={<SendOutlined />}
                    type="text"
                    size="large"
                    style={{
                      color: "#3498db",
                      fontSize: "1.5rem",
                      height: "4rem",
                      paddingLeft: "0.5rem",
                    }}
                    onClick={sendChat}
                  />
                </div>
              </form>
            </Col>
          </Row>
        </ChatInputContainer>
      )}
    </ChatLayout>
  );
};
