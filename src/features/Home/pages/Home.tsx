import { useQuery } from "react-query";
import styled from "styled-components";
import { Typography, Spin, Segmented, Radio, Space } from "antd";

import { PageContainer } from "../../../shared/components/shared";
import { supabase } from "../../../config";
import { ChatEntityWithCharacter } from "../../../types/backend-alias";
import { useContext, useMemo, useState } from "react";
import { AppContext } from "../../../appContext";
import { ChatList } from "../../../shared/components";
import { Link } from "react-router-dom";
import {
  CharacterListWrapper,
  SearchParams,
} from "../../../shared/components/CharacterListWrapper";
import { EyeFilled, EyeInvisibleFilled, HeartFilled } from "@ant-design/icons";
import { Helmet } from "react-helmet";
import { useTags } from "../../../hooks/useTags";
import { TagLink } from "../../../shared/components/TagLink";
import { MOBILE_BREAKPOINT_CSS } from "../../../css-const";

const { Title } = Typography;

type Segment = "latest" | "popular" | "nsfw" | "female" | "male" | "anime" | "game" | "tags";

const SegmentContainer = styled.div`
  max-width: 100%;
  overflow-x: scroll;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TagContainer = styled.div`
  .ant-tag {
    font-size: 1.25rem;
    line-height: 2rem;

    ${MOBILE_BREAKPOINT_CSS} {
      font-size: 0.8rem;
      line-height: 1.25rem;
    }
  }
`;

export const Home: React.FC = () => {
  const { profile, localData, updateLocalData } = useContext(AppContext);
  const [segment, setSegment] = useState<Segment>("latest");
  const tags = useTags();

  const params: SearchParams | undefined = useMemo(() => {
    const modeParams = { mode: localData.character_view || "sfw" };

    switch (segment) {
      case "latest":
        return modeParams;
      case "popular":
        return { sort: "popular", ...modeParams };
      // Lol hard code for now
      case "female":
        return { tag_id: 2, ...modeParams };
      case "male":
        return { tag_id: 1, ...modeParams };
      case "anime":
        return { tag_id: 9, ...modeParams };
      case "game":
        return { tag_id: 8, ...modeParams };
    }
  }, [segment, localData]);

  const { data: chatData, isLoading: isChatLoading } = useQuery(
    ["chats", profile?.id],
    async () => {
      const responses = await supabase
        .from("chats")
        .select("*, characters(name, description, avatar)")
        .order("updated_at", { ascending: false })
        .order("created_at", { ascending: false })
        .eq("user_id", profile?.id)
        .limit(4)
        .returns<ChatEntityWithCharacter[]>();

      const chats = responses.data;
      return chats?.filter((chat) => chat.characters); // Character can be null if deleted or privated
    },
    { enabled: !!profile }
  );

  return (
    <PageContainer align="left">
      <Helmet>
        <title>Venus AI - Weeb Chat (for degenerate, and normal people too)</title>

        <meta
          name="description"
          content="Venus AI - Weeb Chat (for degenerate, and normal people too) at venusai.chat"
        />
        <meta
          property="og:title"
          content="Venus AI - Weeb Chat (for degenerate, and normal people too) at venusai.chat"
        />
        <meta
          property="og:description"
          content="Venus AI - Weeb Chat (for degenerate, and normal people too) at venusai.chat"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://venusai.chat" />
        <meta property="og:image" content="https://venusai.chat/logo.png" />
        <meta property="og:locale" content="en_EN" />
        <meta property="og:site_name" content="VenusAI" />

        <link rel="canonical" href="https://venusai.chat" />
      </Helmet>

      {profile && (
        <div>
          {isChatLoading && <Spin />}
          {chatData && chatData.length > 0 && (
            <div className="mb-4">
              <Title level={2}>
                Continue Chats <Link to="/my_chats">(All Chats)</Link>
              </Title>

              <ChatList size="small" chats={chatData} />
            </div>
          )}
        </div>
      )}

      <Radio.Group
        className="mb-4"
        defaultValue={localData.character_view || "sfw"}
        onChange={(e) => updateLocalData({ character_view: e.target.value })}
      >
        <Radio.Button value="all">
          <EyeFilled /> All
        </Radio.Button>
        <Radio.Button value="sfw">
          <EyeInvisibleFilled /> SFW Only
        </Radio.Button>
        <Radio.Button value="nsfw">
          <HeartFilled /> NSFW Only
        </Radio.Button>
      </Radio.Group>
      <SegmentContainer>
        <Segmented
          value={segment}
          onChange={(value) => setSegment(value as Segment)}
          options={[
            {
              label: "⚡️ Latest",
              value: "latest",
            },
            {
              label: "🔥 Most Popular",
              value: "popular",
            },
            {
              label: "👩‍🦰 Female",
              value: "female",
            },
            {
              label: "👨‍🦰 Male",
              value: "male",
            },
            {
              label: "📺 Anime",
              value: "anime",
            },
            {
              label: "🎮 Game",
              value: "game",
            },
            {
              label: "🌠 All Tags/Categories",
              value: "tags",
            },
          ]}
        />
      </SegmentContainer>

      {segment === "tags" ? (
        <TagContainer>
          <Space className="mt-4 " size={[2, 8]} wrap>
            {tags?.map((tag) => (
              <TagLink tag={tag} />
            ))}
          </Space>
        </TagContainer>
      ) : (
        <CharacterListWrapper size="small" cacheKey="main_page" additionalParams={params} />
      )}
    </PageContainer>
  );
};
