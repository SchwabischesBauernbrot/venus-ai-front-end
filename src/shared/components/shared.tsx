import styled from "styled-components";

import { IPAD_BREAKPOINT_CSS } from "../../css-const";
import { Tooltip } from "antd";
import { SafetyCertificateTwoTone, StarTwoTone, TrophyTwoTone } from "@ant-design/icons";
import { memo } from "react";

export const VerifiedMark: React.FC<{ size?: "small" | "medium" | "large" }> = memo(
  ({ size = "medium" }) => {
    const sizeToFontSize = { small: "0.9rem", medium: "1.2rem", large: "1.5rem" };

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

export const DonatorMark: React.FC<{ size?: "small" | "medium" | "large" }> = memo(
  ({ size = "medium" }) => {
    const sizeToFontSize = { small: "0.9rem", medium: "1.2rem", large: "1.5rem" };

    return (
      <Tooltip title="Generous Donator">
        <StarTwoTone twoToneColor="#f1c40f" style={{ fontSize: sizeToFontSize[size] }} />
      </Tooltip>
    );
  }
);

export const PageContainer = styled.div<{ align?: "left" | "center" }>`
  text-align: ${(props) => props.align || "center"};
  padding: 1.5rem 0 1rem 0;
  min-height: 70vh;

  ${IPAD_BREAKPOINT_CSS} {
    padding: 1rem 0;
  }
`;

export const FormContainer = styled.div`
  text-align: left;
  max-width: 42rem;
  margin: 0 auto;
`;
