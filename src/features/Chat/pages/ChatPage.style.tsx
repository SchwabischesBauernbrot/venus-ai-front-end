import { Divider, Layout } from "antd";
import styled from "styled-components";
import { MOBILE_BREAKPOINT_CSS } from "../../../css-const";

export const ChatLayout = styled(Layout)`
  height: 100vh;
  height: 100dvh;
  display: grid;
  padding-top: 0.25rem;
  grid-template-rows: 3rem 1.75rem auto 6.5rem;
`;

export const ChatInputContainer = styled.div`
  padding: 0 1rem;
  margin: auto 0;
  width: 100%;

  textarea {
    font-size: 1rem; // Safari fix lol
  }
`;

export const ChatContainer = styled.div`
  overflow-y: scroll;
  padding: 0 0.5rem 0 1rem;

  .ant-list-item-meta-title {
    font-weight: 600;
    position: relative;
    top: -5px;
    margin-bottom: 0.25rem;
  }

  ${MOBILE_BREAKPOINT_CSS} {
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
    padding: 0.75rem 1.25rem 0.75rem 0;
    color: rgba(255, 255, 255, 0.85);
  }

  .ant-list-item .ant-list-item-meta {
    display: flex;
    flex: 1;
    align-items: flex-start;
    max-width: 100%;
  }

  .ant-list-item-meta-avatar {
    margin-inline-end: 1rem;

    ${MOBILE_BREAKPOINT_CSS} {
      margin-inline-end: 0.75rem;
    }
  }

  .ant-list-item-meta-content {
    flex: 1 0;
    width: 0;
  }
`;

export const BotMessageControl = styled.div`
  position: absolute;
  top: 0px;
  z-index: 1;
  display: flex;
  justify-content: space-around;
  width: calc(100% + 0.5rem);
  top: 40%;
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

      ${MOBILE_BREAKPOINT_CSS} {
        min-width: 80%;
      }
    }
  }
`;
