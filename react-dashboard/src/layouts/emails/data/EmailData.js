/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MailIcon from "@mui/icons-material/Mail";

// Import your JSON data (adjust the path as needed)
import emails from "layouts/emails/data/emails.json";

export default function data(onAgentClick, onMailClick) {
  // EmailCell now displays the mail Subject and From address.
  const EmailCell = ({ subject, from }) => (
    <MDBox display="flex" flexDirection="column">
      <MDTypography variant="body2" fontWeight="bold">
        {subject}
      </MDTypography>
      <MDTypography variant="caption" color="text">
        {from}
      </MDTypography>
    </MDBox>
  );

  // MailContentCell renders a button with a mail icon.
  // When clicked it calls onMailClick passing the mail content.
  const MailContentCell = ({ content, onMailClick }) => (
    <MDBox display="flex" justifyContent="center">
      <MDButton
        variant="outlined"
        color="primary"
        size="small"
        onClick={() => onMailClick(content)}
      >
        <MailIcon />
      </MDButton>
    </MDBox>
  );

  // AgentCell now receives the mail content as a prop.
  const AgentCell = ({ content }) => (
    <MDBox display="flex" justifyContent="center">
      <MDButton
        variant="outlined"
        color="info"
        size="small"
        onClick={() => onAgentClick(content)}
      >
        Trigger
      </MDButton>
    </MDBox>
  );

  // Generate rows dynamically from your emails.json file.
  const rows = Object.keys(emails).map((key) => {
    const mail = emails[key];
    return {
      email: <EmailCell subject={mail.Subject} from={mail.From} />,
      mailContent: <MailContentCell content={mail.Content} onMailClick={onMailClick} />,
      agent: <AgentCell content={mail.Content} />,
    };
  });

  return {
    columns: [
      { Header: "Message", accessor: "email", width: "40%", align: "left" },
      { Header: "Message Content", accessor: "mailContent", width: "20%", align: "center" },
      { Header: "Agent", accessor: "agent", width: "40%", align: "center" },
    ],
    rows,
  };
}
