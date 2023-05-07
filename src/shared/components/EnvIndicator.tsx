import { Tag } from "antd";
import { useEffect, useState } from "react";
import { axiosInstance } from "../../config";

export const EnvIndicator: React.FC = () => {
  const [show, setShow] = useState(false);
  const [env, setEnv] = useState("");

  useEffect(() => {
    const run = async () => {
      if (location.hostname === "localhost") {
        const response = await axiosInstance.get<{ env: string }>("/env");
        setEnv(response.data.env);
        setShow(true);
      }
    };
    run();
  }, []);

  return show ? (
    <span>
      <Tag color={env === "local" ? "green" : "red"}>
        Back-end: <strong>{env}</strong>
      </Tag>
    </span>
  ) : null;
};
