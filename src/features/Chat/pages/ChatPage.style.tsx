import { Divider, Layout } from "antd";
import styled, { css } from "styled-components";
import { IPAD_BREAKPOINT_CSS } from "../../../css-const";

export const ChatLayout = styled(Layout)<{ showControl: boolean }>`
  height: 100vh;
  height: 100dvh;
  display: grid;
  padding-top: 0.25rem;
  grid-template-rows: ${(p) =>
    p.showControl ? "3rem 1.75rem auto 6.5rem" : "3rem 1.75rem auto 0.75rem"};
`;

export const ChatContainer = styled.div`
  overflow-y: scroll;
  padding: 0 0.5rem 0 1rem;

  .ant-list-item-meta-title {
    font-weight: 600;
    position: relative;
    top: -5px;
    margin-bottom: 0.25rem;
    font-size: 1.05rem !important;
  }

  .ant-list-item-meta-description {
    font-size: 1.05rem !important;
  }

  ${IPAD_BREAKPOINT_CSS} {
    .ant-list-item-meta-description {
      font-size: 0.95rem !important; // Chat font smaller on web
    }
  }
`;

export const BotChoicesContainer = styled.div`
  overflow-x: hidden;
  position: relative;
  border-block-start: 1px solid rgba(253, 253, 253, 0.12);
`;

// Fix this dark-mode too?
export const BotChoicesOverlay = styled.div<{ index: number }>`
  text-align: left;
  display: flex;
  min-height: 5rem;

  transition: 0.5s;
  transform: ${(props) => `translateX(-${props.index * 100}%)`};
  scroll-snap-type: x mandatory;

  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;

  .ant-list-item {
    flex: 0 0 100%;
    width: 100%;
    list-style-type: none;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 0.75rem 1.4rem 0.75rem 0;
    color: rgba(255, 255, 255, 0.85);

    &:last-child {
      padding-bottom: 0;
    }
  }

  .ant-list-item .ant-list-item-meta {
    display: flex;
    flex: 1;
    align-items: flex-start;
    max-width: 100%;
  }

  .ant-list-item-meta-avatar {
    margin-inline-end: 1rem;

    ${IPAD_BREAKPOINT_CSS} {
      margin-inline-end: 0.75rem;
    }
  }

  .ant-list-item-meta-content {
    flex: 1 0;
    width: 0;
  }
`;

export const BotMessageControlWrapper = styled.div<{ side: "left" | "right" }>`
  position: absolute;
  top: 40%;
  z-index: 1;

  ${(props) =>
    props.side === "left"
      ? css`
          left: 0;
        `
      : css`
          right: -0.4rem;
        `}
`;

export const CustomDivider = styled(Divider)`
  &&.ant-divider {
    white-space: normal;
    margin: 0;
    margin-bottom: 0.5rem;
    span {
      min-width: 50%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      ${IPAD_BREAKPOINT_CSS} {
        min-width: 80%;
      }
    }
  }
`;
