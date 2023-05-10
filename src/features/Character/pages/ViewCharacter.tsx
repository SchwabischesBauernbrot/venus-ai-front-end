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
  Dropdown,
} from "antd";
import { useCallback, useContext, useState } from "react";
import {
  BookOutlined,
  DownloadOutlined,
  EditOutlined,
  LoadingOutlined,
  UserOutlined,
  WarningOutlined,
  WechatOutlined,
} from "@ant-design/icons";
import { Helmet } from "react-helmet";
import { useQuery } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";

import { supabase } from "../../../config";
import { getBotAvatarUrl, getRealId, toSlug } from "../../../shared/services/utils";
import { ChatEntityWithCharacter } from "../../../types/backend-alias";
import { Tokenizer } from "../services/character-parse/tokenizer";
import { AppContext } from "../../../appContext";
import { PrivateIndicator } from "../../../shared/components/PrivateIndicator";
import { chatService } from "../../Chat/services/chat-service";

import {
  ChatList,
  TagLink,
  MultiLine,
  PageContainer,
  VerifiedMark,
} from "../../../shared/components";
import { exportCharacter, getCharacter, getCharacterReviews } from "../services/character-service";
import { Character } from "../services/character-parse/character";
import { Dislike, Like, ReviewPanel } from "../components/ReviewPanel";
import { characterUrl, profileUrl } from "../../../shared/services/url-utils";
import { CharacterReportModal } from "../components/CharacterReportModal";

const { Title } = Typography;

export const ViewCharacter: React.FC = () => {
  const { characterId: seoFriendlyId } = useParams();
  const characterId = getRealId(seoFriendlyId);
  const { modal } = App.useApp();

  const navigate = useNavigate();
  const [openReportModal, setOpenReportModal] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const { profile } = useContext(AppContext);

  const { data: character, isLoading } = useQuery(
    ["view_character", characterId],
    async () => {
      const character = await getCharacter(characterId!);
      return character;
    },
    { enabled: !!characterId, retry: 1 }
  );

  const { data: reviews, refetch: refetchReviews } = useQuery(
    ["view_character_reviews", characterId],
    async () => {
      const reviews = await getCharacterReviews(characterId!);
      return reviews;
    },
    { enabled: Boolean(characterId && character) }
  );

  const canEdit = Boolean(profile && profile.id === character?.creator_id);

  const { data: chatData } = useQuery(
    ["public_chats", characterId],
    async () => {
      const responses = await supabase
        .from("chats")
        .select("*, characters(name, description, avatar)")
        .order("updated_at", { ascending: false })
        .order("created_at", { ascending: false })
        .eq("is_public", true)
        .eq("character_id", characterId)
        .returns<ChatEntityWithCharacter[]>();

      const chats = responses.data;
      return chats;
    },
    { enabled: Boolean(characterId && character) }
  );

  const startChat = useCallback(async () => {
    if (!profile) {
      modal.info({
        title: "Login to start chat!",
        content: (
          <span>
            Please <a href="/login">Login</a> or <a href="/register">Register</a> so that your chats
            and settings can be saved!
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
      {!isLoading && !character && (
        <p>Can not find this character. It might be deleted or set to private.</p>
      )}

      {character && (
        <Helmet>
          <title>
            {`Chat with ${character.name} - Total: ${character.stats?.chat} chats, ${character.stats?.message} messages`}
          </title>
          <meta
            property="og:title"
            content={`Chat with ${character.name} - Total: ${character.stats?.chat} chats, ${character.stats?.message} messages`}
          />
          <meta
            property="og:description"
            content={`Chat with ${character.name} - ${character.description}`}
          />
          <meta property="og:image" content={getBotAvatarUrl(character.avatar)} />
          <meta
            name="description"
            content={`Chat with ${character.name} - ${character.description}`}
          />
          <link
            rel="canonical"
            href={`${location.origin}${characterUrl(character.id, character.name)}`}
          />
        </Helmet>
      )}
      {character && (
        <Row gutter={16}>
          <Col lg={6} xs={24} className="text-left pt-2 pb-2 mb-2">
            <Title level={3}>
              <PrivateIndicator isPublic={character.is_public} /> {character.name}
            </Title>

            <Badge.Ribbon
              text={
                character.stats && (
                  <Tooltip
                    title={`Total: ${character.stats?.chat} chats, ${character.stats?.message} messages`}
                  >
                    <span>
                      <BookOutlined />
                      {character.stats?.chat} <WechatOutlined />
                      {character.stats?.message}
                    </span>
                  </Tooltip>
                )
              }
            >
              <Image src={getBotAvatarUrl(character.avatar)} />
            </Badge.Ribbon>

            <div className="mt-2">
              <Link target="_blank" to={profileUrl(character.creator_id, character.creator_name)}>
                <p>
                  @{character.creator_name}{" "}
                  {character.creator_verified && <VerifiedMark size="medium" />}
                </p>
              </Link>
              <p>{character.description}</p>
            </div>

            {character.is_nsfw || character.tags?.length ? (
              <Space size={[0, 8]} wrap>
                {character.is_nsfw ? <Tag color="error">🔞 NSFW</Tag> : ""}
                {character.tags?.map((tag) => (
                  <TagLink tag={tag} />
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
                {isStartingChat ? <LoadingOutlined /> : <WechatOutlined />} Chat with{" "}
                {character.name} 🔒
              </Button>

              <Dropdown
                trigger={["click"]}
                className="mt-4"
                menu={{
                  items: [
                    {
                      label: "TavernAI Character Card",
                      key: "card",
                      icon: <UserOutlined />,
                    },
                    {
                      label: "Character JSON file",
                      key: "json",
                      icon: <UserOutlined />,
                    },
                  ],
                  onClick: (e) => {
                    const imgSrc = getBotAvatarUrl(character.avatar);
                    const charToExport = Character.fromCharacterView(character);
                    const author = {
                      id: character.creator_id,
                      username: character.creator_name,
                      link: profileUrl(character.creator_id, character.creator_name),
                    };
                    exportCharacter(e.key as "card" | "json", imgSrc, charToExport, author);
                  },
                }}
              >
                <Button block>
                  <DownloadOutlined />
                  Export character
                </Button>
              </Dropdown>
            </div>
          </Col>

          <Col lg={18} xs={24} className="text-left">
            <Collapse defaultActiveKey={["reviews", "chats"]}>
              <Collapse.Panel
                header={`Character definition - May contains spoiler (Total ${Tokenizer.tokenCountFormat(
                  character.personality +
                    character.first_message +
                    character.scenario +
                    character.example_dialogs
                )}. Permanent: ${Tokenizer.tokenCountFormat(
                  character.personality + character.scenario
                )})`}
                key="definition"
              >
                <Descriptions bordered size="small" layout="vertical">
                  <Descriptions.Item
                    label={`Personality (${Tokenizer.tokenCountFormat(character.personality)})`}
                    span={3}
                  >
                    <MultiLine>{character.personality}</MultiLine>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={`First Message (${Tokenizer.tokenCountFormat(character.first_message)})`}
                    span={3}
                  >
                    <MultiLine>{character.first_message}</MultiLine>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={`Scenario (${Tokenizer.tokenCountFormat(character.scenario)})`}
                    span={3}
                  >
                    <MultiLine>{character.scenario}</MultiLine>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={`Example Dialogs (${Tokenizer.tokenCountFormat(
                      character.example_dialogs
                    )})`}
                    span={3}
                  >
                    <MultiLine>{character.example_dialogs}</MultiLine>
                  </Descriptions.Item>
                </Descriptions>
              </Collapse.Panel>

              <Collapse.Panel
                key="reviews"
                header={
                  reviews ? (
                    <span>
                      {reviews.length} reviews ({reviews.filter((review) => review.is_like).length}{" "}
                      {Like}, {reviews.filter((review) => !review.is_like).length} {Dislike})
                    </span>
                  ) : (
                    <span>0 review</span>
                  )
                }
              >
                <ReviewPanel
                  reviews={reviews}
                  characterId={characterId}
                  refetch={() => refetchReviews()}
                />
              </Collapse.Panel>

              <Collapse.Panel header={`${chatData?.length || 0} shared public chats`} key="chats">
                {chatData && <ChatList chats={chatData} size="small" mode="view" />}
              </Collapse.Panel>
            </Collapse>

            <div className="mt-4 text-right">
              {canEdit ? (
                <Link to={`/edit_character/${character.id}`}>
                  <Button size="large" icon={<EditOutlined />}>
                    Edit character
                  </Button>
                </Link>
              ) : (
                <>
                  <Button
                    icon={<WarningOutlined />}
                    onClick={() => setOpenReportModal(true)}
                    danger
                  >
                    Report this character!
                  </Button>

                  {openReportModal && (
                    <CharacterReportModal
                      open={openReportModal}
                      onModalClose={() => setOpenReportModal(false)}
                    />
                  )}
                </>
              )}
            </div>
          </Col>
        </Row>
      )}
    </PageContainer>
  );
};
