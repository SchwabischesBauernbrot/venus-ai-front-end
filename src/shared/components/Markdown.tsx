import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Markdown: React.FC<{ children: string }> = ({ children }) => {
  return <ReactMarkdown disallowedElements={[]} children={children} remarkPlugins={[remarkGfm]} />;
};
