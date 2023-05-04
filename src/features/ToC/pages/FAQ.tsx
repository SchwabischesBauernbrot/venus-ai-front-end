import { Descriptions, Typography } from "antd";
import { Helmet } from "react-helmet";
import { SITE_NAME } from "../../../config";

const { Title } = Typography;

export const FAQ: React.FC = () => {
  return (
    <div className="my-4">
      <Helmet>
        <title>{`${SITE_NAME} - FAQs`}</title>
        <meta name="description" content="Frequently Asked Questions" />
      </Helmet>

      <Title level={3}>FAQs</Title>

      <Descriptions bordered size="small" layout="vertical">
        <Descriptions.Item label="Will the site be forever free?" span={3}>
          <span>
            Yes it is because we don't run the AI/back-end (running those are very expensive). You
            still need either an OpenAI API key, or KoboldAI endpoint. Think of the site as
            AgnAI/Tavern + CharacterHub, with less feature.
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Will there be a donation/paid option?" span={3}>
          <span>
            For now, the cost of running this site is minimal (10-30$/month at most) so I won't need
            any donations in the near term :D.
          </span>
          <br />
          <span>
            If you need a VPN, maybe can use my link to register at Digital Ocean:{" "}
            <a href="https://m.do.co/c/3978adf5a4fd">https://m.do.co/c/3978adf5a4fd</a>. You get
            $200 free credit, and I will have some credit to cover server cost.
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="What will you do with my keys?" span={3}>
          <span>
            Keys are stored in your device only (So you will need to enter your keys again when you
            switch devices).
          </span>
          <br />
          <span>
            The whole project is open-sourced on Github at{" "}
            <a href="https://github.com/venus-ai-team">https://github.com/venus-ai-team</a> so you
            can check and see what the code does.
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Why do I need to login?" span={3}>
          <span>
            I want to support anonymous login too, but the technology I use doesn't support that
            yet. It might be implemented later{" "}
            <a href="https://github.com/supabase/gotrue/issues/68">
              https://github.com/supabase/gotrue/issues/68
            </a>
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Are the bot and my chat private?" span={3}>
          Chat is private by default unless you share and make it public. Bot can be private/public
          and toggle between them.
        </Descriptions.Item>
        <Descriptions.Item label="I found some bug/feedbacks?" span={3}>
          Please create a ticket{" "}
          <a href="https://github.com/pyg-ai-unonfficial/front-end/issues">on Github</a> or{" "}
          <a href="https://discord.gg/wFPemXeEUf">visit our Discord</a>. We will find a way for
          easier report later.
        </Descriptions.Item>
        <Descriptions.Item
          label="I found something wrong, suspicious in the ToS and Privacy Policy?"
          span={3}
        >
          Kindly let us know and we will fix it, I just copy/paste and ask ChatGPT to rephrase.
          Ain't nobody got time for reading that.
        </Descriptions.Item>
        <Descriptions.Item label="Where does the cards/character come from?" span={3}>
          We respect the bot maker so we don't scrape the card from any source, and wait for the bot
          makers to upload themselves (or maybe give us permission to do it for them). You can use
          the card you download from anywhere, just make it a private bot.
        </Descriptions.Item>
        <Descriptions.Item label="Where does the cards/character come from?" span={3}>
          Yeah, you can check out roadmap here:{" "}
          <a href="https://github.com/orgs/venus-ai-team/projects/1">
            https://github.com/orgs/venus-ai-team/projects/1
          </a>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};
