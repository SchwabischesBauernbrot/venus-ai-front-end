import styled from "styled-components";

import { MOBILE_BREAKPOINT_CSS } from "../../css-const";

export const PageContainer = styled.div<{ align?: "left" | "center" }>`
  text-align: ${(props) => props.align || "center"};
  padding: 1.5rem 0 1rem 0;
  min-height: 70vh;

  ${MOBILE_BREAKPOINT_CSS} {
    padding: 1rem 0;
  }
`;

export const FormContainer = styled.div`
  text-align: left;
  max-width: 42rem;
  margin: 0 auto;
`;
