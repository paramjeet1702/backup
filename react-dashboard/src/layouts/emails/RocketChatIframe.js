// RocketChatIframe.js
import React, { forwardRef } from "react";

const RocketChatIframe = forwardRef((props, ref) => {
  return (
    <iframe
      ref={ref}
      src="http://172.178.112.88:8200/channel/FSL-Telecom_OH_TSH"
      title="RocketChat UI"
      style={{
        width: "100%",
        height: "100vh",
        border: "none",
      }}
    />
  );
});

export default RocketChatIframe;
