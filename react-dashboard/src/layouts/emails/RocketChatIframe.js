// RocketChatIframe.js
import React from "react";

function RocketChatIframe() {
  return (
    <iframe
      src="http://172.178.112.88:8100/channel/FSL-UI_Demo"
      title="RocketChat UI"
      style={{
        width: "100%",
        height: "100vh",
        border: "none",
      }}
    />
  );
}

export default RocketChatIframe;
