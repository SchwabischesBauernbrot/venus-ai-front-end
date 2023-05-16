import { Descriptions, Typography } from "antd";
import { Helmet } from "react-helmet";
import { SITE_NAME } from "../../../config";
import { VerifiedMark } from "../../../shared/components";
import { DonatorMark } from "../../../shared/components/shared";

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
            Our site will be completely free, so there won't be any paid option in the future.
          </span>{" "}
          <br />
          <span>
            Initally, the cost of running this site is minimal (10-30$/month at most) so I assume
            won't need any donations in the near term. I plan to run the page for 2-3 months before
            asking for any donations from the community.
          </span>
          <br />
          <span>
            However, somehow the pages got a lot of traffic{" "}
            <strong>(7000 users and 1.1 millions messages in 2 weeks)</strong>, so our old potato
            server (20$/month) didn't make it. This is my hobby project, the characters come from
            the community, so I don't want to commercialize it.
          </span>
          <br />
          <br />
          <span>
            Therefore, I'm asking for community's help to maintain our{" "}
            <strong>bigger potato server (70$/month)</strong>. You can give us some small donations
            by:
          </span>
          <ul>
            <li>
              Visit our Patreon and become a Patron at{" "}
              <a href="https://www.patreon.com/Venus_AI" target="_blank">
                patreon.com/Venus_AI
              </a>
            </li>
            <li>
              Give a one time donation at{" "}
              <a href="https://bmc.link/codedao" target="_blank">
                bmc.link/codedao
              </a>
            </li>
            <li>
              If you need a VPS, use my link to register at Digital Ocean:{" "}
              <a href="https://m.do.co/c/3978adf5a4fd" target="_blank">
                m.do.co/c/3978adf5a4fd
              </a>
              . You get $200 free credit, and I will also receive some credit to cover server cost.
            </li>
          </ul>
        </Descriptions.Item>

        <Descriptions.Item label="What will I get from donating?" span={3}>
          <span>
            We don't have anything to offer back for donators (yet), aside from some small perks:
          </span>
          <ul>
            <li>
              Some roles with color on{" "}
              <a href="https://discord.gg/wFPemXeEUf" target="_blank">
                our Discord.
              </a>
            </li>
            <li>
              A donator badge on our site <DonatorMark />.
            </li>
            <li>
              Your name in our <strong>Hall of Fame for donators</strong> (You can also opt-out if
              you want).
            </li>
          </ul>

          <span>
            We might add some merch/store in the future, if we have more resource for that.
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="What kind of content is banned?" span={3}>
          <span>
            We respect people's taste and fetishes.
            <br />
            However, there are some kind of contents that is{" "}
            <strong>not acceptable and will be removed immediately</strong> on this site, that we
            will remove to ensure the site follows hosting requirements.
          </span>
          <ul>
            <li>Child pornography</li>
            <li>Sexualized depictions of minors</li>
            <li>Heavy gore</li>
            <li>Bestiality</li>
            <li>Sexual violence</li>
          </ul>
          <span>
            Please help us report the content if you see it. This apply to{" "}
            <strong>real pictures or 3D-rendered picture</strong>. <br />
            The rules for <strong>hentai and drawn pictures</strong> is looser because they are
            fiction and not real people.
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
          <span>
            Chats are private by default unless you share and make it public. Bots can be
            private/public and toggle between them.
          </span>
          <br />
          <span>
            You can import any bot you want and start a chat. If you use a bot that you don't own,
            please <strong>kindly set it to Private</strong> so the bot creator can post the public
            one.
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="I found some bug/feedbacks?" span={3}>
          Please create a ticket{" "}
          <a href="https://github.com/pyg-ai-unonfficial/front-end/issues">on Github</a> or{" "}
          <a href="https://discord.gg/wFPemXeEUf">visit our Discord</a>. You can also{" "}
          <a href="https://tawk.to/chat/64545dc4ad80445890eb347b/1gvkosibs" target="blank">
            use this link
          </a>{" "}
          to send me an anonymous chat massage.
        </Descriptions.Item>
        <Descriptions.Item
          label="I found something wrong, suspicious in the ToS and Privacy Policy?"
          span={3}
        >
          Kindly let us know and we will fix it, I just copy/paste and ask ChatGPT to rephrase.
          Ain't nobody got time for reading that.
        </Descriptions.Item>
        <Descriptions.Item label="Where does the cards/character come from?" span={3}>
          <span>
            We respect the bot maker so we don't scrape the card from any source, and wait for the
            bot makers to upload themselves (or maybe give us permission to do it for them).
          </span>{" "}
          <br />
          <span>
            You can use the card you download from anywhere, just{" "}
            <strong>make it a private bot</strong>.
          </span>
        </Descriptions.Item>
        <Descriptions.Item
          label="My bots are stolen and posted here without my permission. Help me remove please?"
          span={3}
        >
          <span>Sure, I would love to help. We take bot authorship seriously.</span>
          <br />
          <span>
            You can click the <strong>Report this character!</strong> to report the bot, with some
            evidences that you or other are the original creator (link in booru, 4chan, discord,
            chracterhub...).
          </span>{" "}
          <br />
          <span> The stolen bots will then be set to private and removed from our main page.</span>
          <br />
          <br />
          <span>
            You can also send me an email to{" "}
            <a href="mailto:anonydev96@proton.me">anonydev96@proton.me</a>, with some evidences that
            you are the original creator and your account in our site.
          </span>
          <br />
          <span>
            {" "}
            We can transfer the bot to your account and give you verified status. <VerifiedMark />
          </span>
          <span>
            <br />
            For verified creators, we will help them check when copy/stole bot is created, so you
            don't have to report stolen one anymore ( ͡° ͜ʖ ͡°).
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="I am a bot maker. How can I get verify mark?" span={3}>
          <span>
            Just send me an email to <a href="mailto:anonydev96@proton.me">anonydev96@proton.me</a>{" "}
            and include your <strong>rentry/booru/characterhub/discord</strong> link.
          </span>
          <br />
          <span>
            After you are verified, you can get the verify mark next to your name in your profile
            page. <VerifiedMark />
          </span>
          <br />
          <span>
            Our admin team will also do some auto-verify if your username and character match your
            name on booru/characterhub. Or if you create consistent bot and tag them properly ^__^.
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Roadmap? Plan for new features?" span={3}>
          Yeah, you can check out roadmap here:{" "}
          <a href="https://github.com/orgs/venus-ai-team/projects/1">
            https://github.com/orgs/venus-ai-team/projects/1
          </a>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};
