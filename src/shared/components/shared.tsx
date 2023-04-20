import styled from "styled-components";

export const PageContainer = styled.div<{ align?: "left" | "center" }>`
  text-align: ${(props) => props.align || "center"};
  padding: 2rem 1rem 1rem 1rem;
  min-height: 70vh;
`;

export const FormContainer = styled.div`
  text-align: left;
  max-width: 42rem;
  margin: 0 auto;
`;
