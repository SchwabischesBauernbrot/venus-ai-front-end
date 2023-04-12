import {
  Typography,
  message,
  Spin,
  Row,
  Col,
  Avatar,
  Space,
  Tag,
  Tooltip,
  Button,
  Collapse,
  Descriptions,
} from "antd";
import ReactMarkdown from "react-markdown";
import { WechatOutlined } from "@ant-design/icons";
import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";

import { PageContainer } from "../../../components/shared";
import { supabase } from "../../../config";
import { useEffect } from "react";
import { getBotAvatarUrl } from "../../../services/utils";
import { CharacterWithProfileAndTag } from "../../../types/backend-alias";
import { Tokenizer } from "../../../services/character-parse/tokenizer";
import { Markdown } from "../../../components/Markdown";
import { Multiline } from "../../../components/MultiLine";

const { Title } = Typography;

export const ViewCharacter: React.FC = () => {
  const { characterId } = useParams();

  console.log({ characterId });

  // Get character
  const { data, isLoading } = useQuery(
    ["view_character", characterId],
    async () => {
      const response = await supabase
        .from("characters")
        .select("*, tags(*), user_profiles(*)")
        .eq("id", characterId)
        .returns<CharacterWithProfileAndTag[]>()
        .limit(1)
        .single();
      return response;
    },
    { enabled: !!characterId }
  );

  return (
    <PageContainer>
      {isLoading && <Spin />}
      {data && data.error && <p>Can not view this character. It might be deleted or private.</p>}
      {data && data.data !== null && (
        <Row>
          <Col span={6} className="text-left pt-2 pb-2">
            <Title level={3}>{data.data.name}</Title>

            <Avatar shape="square" size={100} src={getBotAvatarUrl(data.data.avatar)} />

            <div className="mt-2">
              <Link target="_blank" to={`/profiles/${data.data.user_profiles?.id}`}>
                <span>@{data.data.user_profiles?.user_name || data.data.user_profiles?.name}</span>
              </Link>
              <p>{data.data.description}</p>
            </div>

            <Space size={[0, 8]} wrap>
              {data.data.is_nsfw ? <Tag color="error">🔞 NSFW</Tag> : ""}
              {data.data.tags.map((tag) => (
                <Tooltip key={tag.id} title={tag.description}>
                  <Tag>{tag.name}</Tag>
                </Tooltip>
              ))}
            </Space>

            <div className="pr-4 mt-4">
              <Button type="primary" block>
                <WechatOutlined /> Chat with {data.data.name}
              </Button>
            </div>
          </Col>

          <Col span={18} className="text-left">
            <Collapse>
              <Collapse.Panel
                header={`Character definition (Total ${Tokenizer.tokenCountFormat(
                  data.data.personality +
                    data.data.first_message +
                    data.data.scenario +
                    data.data.example_dialogs
                )}) - May contains spoiler`}
                key="1"
              >
                <Descriptions bordered size="small">
                  <Descriptions.Item
                    label={`Personality (${Tokenizer.tokenCountFormat(data.data.personality)})`}
                    span={3}
                  >
                    <Multiline>{data.data.personality}</Multiline>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={`First Message (${Tokenizer.tokenCountFormat(data.data.first_message)})`}
                    span={3}
                  >
                    <Multiline>{data.data.first_message}</Multiline>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={`Scenario (${Tokenizer.tokenCountFormat(data.data.scenario)})`}
                    span={3}
                  >
                    <Multiline>{data.data.scenario}</Multiline>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={`Example Dialogs (${Tokenizer.tokenCountFormat(
                      data.data.example_dialogs
                    )})`}
                    span={3}
                  >
                    <Multiline>{data.data.example_dialogs}</Multiline>
                  </Descriptions.Item>
                </Descriptions>
              </Collapse.Panel>
            </Collapse>
          </Col>
        </Row>
      )}
    </PageContainer>
  );
};
