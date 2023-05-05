import styled from "styled-components";

import { MOBILE_BREAKPOINT_CSS } from "../../css-const";
import { Tooltip } from "antd";
import { SafetyCertificateTwoTone } from "@ant-design/icons";
import { memo } from "react";

export const VerifiedMark: React.FC<{ size?: "small" | "normal" | "large" }> = memo(
  ({ size = "normal" }) => {
    const sizeToFontSize = { small: "1rem", normal: "1.5rem", large: "2rem" };

    return (
      <Tooltip title="Verified Creator Account">
        <SafetyCertificateTwoTone
          twoToneColor="#3498db"
          style={{ fontSize: sizeToFontSize[size] }}
        />
      </Tooltip>
    );
  }
);

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
