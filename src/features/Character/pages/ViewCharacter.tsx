import {
  Typography,
  Spin,
  Row,
  Col,
  Image,
  App,
  Space,
  Tag,
  Tooltip,
  Button,
  Collapse,
  Descriptions,
  message,
  Badge,
} from "antd";
import { useCallback, useContext, useState } from "react";
import { BookOutlined, LoadingOutlined, WechatOutlined } from "@ant-design/icons";
import { useQuery } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";

import { PageContainer } from "../../../shared/components/shared";
import { axiosInstance, supabase } from "../../../config";
import { getBotAvatarUrl } from "../../../shared/services/utils";
import { FullCharacterView } from "../../../types/backend-alias";
import { Tokenizer } from "../services/character-parse/tokenizer";
import { MultiLine } from "../../../shared/components/MultiLine";
import { AppContext } from "../../../appContext";
import { PrivateIndicator } from "../../../shared/components/PrivateIndicator";
import { chatService } from "../../Chat/services/chat-service";

const { Title } = Typography;

export const ViewCharacter: React.FC = () => {
  const { characterId } = useParams();
  const { modal } = App.useApp();

  const navigate = useNavigate();
  const [isStartingChat, setIsStartingChat] = useState(false);
  const { profile } = useContext(AppContext);

  // Get character
  const { data, isLoading } = useQuery(
    ["view_character", characterId],
    async () => {
      const response = await axiosInstance.get<FullCharacterView>(`/characters/${characterId}`);
      return response.data;
    },
    { enabled: !!characterId }
  );

  const startChat = useCallback(async () => {
    if (!profile) {
      modal.info({
        title: "Login to start chat!",
        content: (
          <span>
            Please <a href="/login">Login</a> or <a href="/register">Regsiter</a> so that your chats
            and setting can be saved!
          </span>
        ),
      });
      return;
    }

    try {
      setIsStartingChat(true);
      const existingChat = await supabase
        .from("chats")
        .select("id")
        .match({ user_id: profile.id, character_id: characterId })
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (existingChat.data) {
        navigate(`/chats/${existingChat.data.id}`);
      } else {
        const newChat = await chatService.createChat(characterId!);

        if (newChat) {
          navigate(`/chats/${newChat.id}`);
        }
      }
    } catch (err) {
      message.error(JSON.stringify(err, null, 2));
    } finally {
      setIsStartingChat(false);
    }
  }, [profile]);

  return (
    <PageContainer>
      {isLoading && <Spin />}
      {!isLoading && !data && <p>Can not view this character. It might be deleted or private.</p>}

      {data && (
        <Row gutter={16}>
          <Col lg={6} xs={24} className="text-left pt-2 pb-2 mb-2">
            <Title level={3}>
              <PrivateIndicator isPublic={data.is_public} /> {data.name}
            </Title>

            <Badge.Ribbon
              text={
                data.stats && (
                  <Tooltip
                    title={`Total: ${data.stats?.chat} chats, ${data.stats?.message} messages`}
                  >
                    <span>
                      <BookOutlined />
                      {data.stats?.chat} <WechatOutlined />
                      {data.stats?.message}
                    </span>
                  </Tooltip>
                )
              }
            >
              <Image src={getBotAvatarUrl(data.avatar)} />
            </Badge.Ribbon>

            <div className="mt-2">
              <Link target="_blank" to={`/profiles/${data.creator_id}`}>
                <span>@{data.creator_name}</span>
              </Link>
              <p>{data.description}</p>
            </div>

            {data.is_nsfw || data.tags?.length ? (
              <Space size={[0, 8]} wrap>
                {data.is_nsfw ? <Tag color="error">🔞 NSFW</Tag> : ""}
                {data.tags?.map((tag) => (
                  <Tooltip key={tag.id} title={tag.description}>
                    <Tag>{tag.name}</Tag>
                  </Tooltip>
                ))}
              </Space>
            ) : null}

            <div className="mt-4">
              <Button
                type="primary"
                block
                onClick={startChat}
                style={{ whiteSpace: "normal", height: "auto" }}
                disabled={isStartingChat}
              >
                {isStartingChat ? <LoadingOutlined /> : <WechatOutlined />} Chat with {data.name} 🔒
              </Button>
            </div>
          </Col>

          <Col lg={18} xs={24} className="text-left">
            <Collapse>
              <Collapse.Panel
                header={`Character definition - May contains spoiler (Total ${Tokenizer.tokenCountFormat(
                  data.personality + data.first_message + data.scenario + data.example_dialogs
                )}. Permanent: ${Tokenizer.tokenCountFormat(data.personality + data.scenario)})`}
                key="1"
              >
                <Descriptions bordered size="small" layout="vertical">
                  <Descriptions.Item
                    label={`Personality (${Tokenizer.tokenCountFormat(data.personality)})`}
                    span={3}
                  >
                    <MultiLine>{data.personality}</MultiLine>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={`First Message (${Tokenizer.tokenCountFormat(data.first_message)})`}
                    span={3}
                  >
                    <MultiLine>{data.first_message}</MultiLine>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={`Scenario (${Tokenizer.tokenCountFormat(data.scenario)})`}
                    span={3}
                  >
                    <MultiLine>{data.scenario}</MultiLine>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={`Example Dialogs (${Tokenizer.tokenCountFormat(data.example_dialogs)})`}
                    span={3}
                  >
                    <MultiLine>{data.example_dialogs}</MultiLine>
                  </Descriptions.Item>
                </Descriptions>
              </Collapse.Panel>
              <Collapse.Panel header="Shared public chats (coming soon)" key="2">
                <Title level={3} className="my-2">
                  Public chats (coming soon)
                </Title>
              </Collapse.Panel>
            </Collapse>
          </Col>
        </Row>
      )}
    </PageContainer>
  );
};
