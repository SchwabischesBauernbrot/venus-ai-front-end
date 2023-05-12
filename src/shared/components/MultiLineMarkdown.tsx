import { Markdown } from "./Markdown";
import styled from "styled-components";
import { useContext } from "react";
import { AppContext } from "../../appContext";

const MarkdownContainer = styled.div<{ theme: "light" | "dark" }>`
  p {
    color: ${(props) => (props.theme === "light" ? "black" : "rgb(229, 224, 216)")};
    margin-bottom: 0.7rem;
    word-wrap: break-word;
  }

  img {
    max-height: 40vh;
    max-width: 40vw;
  }

  code {
    font-size: 0.9rem;
    letter-spacing: -0.5px;
  }

  em {
    color: #8f8e8e;
  }
`;

export const MultiLineMarkdown: React.FC<{ children: string }> = ({ children }) => {
  const { localData } = useContext(AppContext);

  return (
    <MarkdownContainer theme={localData.theme}>
      {children.split("\n").map((text, index) => (
        <p key={index}>
          <Markdown>{text}</Markdown>
        </p>
      ))}
    </MarkdownContainer>
  );
};
