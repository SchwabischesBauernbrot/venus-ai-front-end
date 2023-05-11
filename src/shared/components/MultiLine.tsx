export const MultiLine: React.FC<{ children: string }> = ({ children }) => {
  return (
    <div>
      {children.split("\n").map((text, index) => (
        <p style={{ wordWrap: "break-word" }} key={index}>
          {text}
        </p>
      ))}
    </div>
  );
};
