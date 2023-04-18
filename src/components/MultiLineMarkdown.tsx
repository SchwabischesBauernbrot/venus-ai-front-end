import { Markdown } from "./Markdown";

export const MultilineMarkdown: React.FC<{ children: string }> = ({ children }) => {
  return (
    <div>
      {children.split("\n").map((text, index) => (
        <p key={index}>
          <Markdown>{text}</Markdown>
        </p>
      ))}
    </div>
  );
};
