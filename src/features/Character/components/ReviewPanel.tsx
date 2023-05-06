import { App, Avatar, Button, Divider, Form, Input, List, Radio, Typography } from "antd";
import { ReviewView } from "../../../types/backend-alias";
import { DeleteOutlined, DislikeFilled, LikeFilled } from "@ant-design/icons";
import { useContext, useState } from "react";
import { AppContext } from "../../../appContext";
import { getAvatarUrl } from "../../../shared/services/utils";
import { supabase } from "../../../config";
import { postReview } from "../services/character-service";

export interface ReviewPanelProps {
  reviews?: ReviewView[];
  characterId?: string;
  refetch: () => void;
}

interface FormValues {
  is_like: boolean;
  content: string;
}

const defaultValues: FormValues = {
  is_like: true,
  content: "",
};

export const Like = <LikeFilled style={{ color: "#2ecc71" }} />;
export const Dislike = <DislikeFilled style={{ color: "#e74c3c" }} />;

export const ReviewPanel: React.FC<ReviewPanelProps> = ({ reviews, characterId, refetch }) => {
  const { message } = App.useApp();
  const { profile } = useContext(AppContext);
  const [form] = Form.useForm<FormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canWriteReview = Boolean(
    profile && reviews && reviews.every((review) => review.user_id !== profile.id)
  );

  const deleteReview = async () => {
    if (!profile || !characterId) {
      return;
    }

    await supabase
      .from("reviews")
      .delete()
      .match({ user_id: profile.id, character_id: characterId });

    message.success("Review deleted!");

    refetch();
  };

  const submitReview = async (values: FormValues) => {
    if (!profile || !characterId) {
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await postReview({ ...values, character_id: characterId });
      if (result.character_id === characterId && result.user_id === profile.id) {
        message.success("Review posted!");
        refetch();
      }
    } catch (err) {
      message.error("Fail to post review, try again later!");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {canWriteReview && (
        <div className="mb-4">
          <Typography.Title level={5}>
            Leave a review or feedback for the creator ❤️
          </Typography.Title>

          <Form form={form} layout="inline" initialValues={defaultValues} onFinish={submitReview}>
            <Form.Item className="flex-grow-1" name="content">
              <Input placeholder="Write something (optional)" />
            </Form.Item>
            <Form.Item className="mb-py" name="is_like">
              <Radio.Group>
                <Radio.Button value={true}>{Like} Like</Radio.Button>
                <Radio.Button value={false}>{Dislike} Dislike</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item className="mr-0">
              <Button
                type="primary"
                block
                htmlType="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Post review
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}

      <Divider className="my-0" />
      <List
        itemLayout="horizontal"
        dataSource={reviews || []}
        renderItem={(item) => (
          <List.Item
            actions={
              profile && item.user_id === profile.id
                ? [<Button danger icon={<DeleteOutlined />} onClick={deleteReview} />]
                : undefined
            }
          >
            <List.Item.Meta
              avatar={<Avatar src={getAvatarUrl(item.user_profiles.avatar)} />}
              title={
                <span>
                  <strong>
                    {item.user_profiles.user_name || item.user_profiles.name || "Anon"}
                  </strong>{" "}
                  {item.is_like ? Like : Dislike} this characters
                </span>
              }
              description={item.content || ""}
            />
          </List.Item>
        )}
      />
    </div>
  );
};
