import ReactMarkdown from "react-markdown";

export const Markdown: React.FC<{ children: string }> = ({ children }) => {
  return <ReactMarkdown children={children} />;
};
