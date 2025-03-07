import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "examples/Footer";
import DataTable from "examples/Emails/DataTable";
import authorsTableData from "layouts/emails/data/EmailData";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import RocketChatIframe from "./RocketChatIframe";

function Emails() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const [mailContentModalOpen, setMailContentModalOpen] = useState(false);
  const [selectedMailContent, setSelectedMailContent] = useState([]);

  const handleAgentClick = (mailContent) => {
    // Open the chat panel immediately
    if (!chatOpen) {
      setChatOpen(true);
    }
    // Generate a random group id
    const groupid = Math.random().toString(36).substring(2, 15);
    const payload = {
      email_content: mailContent,
      groupid: groupid,
    };

    // Hit the API after opening the chat
    fetch("http://172.178.112.88:8360/process_email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          console.error("Error processing email:", response.statusText);
        }
      })
      .catch((error) => {
        console.error("Error while calling API:", error);
      });
  };

  const handleMailClick = (content) => {
    setSelectedMailContent(content);
    setMailContentModalOpen(true);
  };

  const handleCloseMailModal = () => {
    setMailContentModalOpen(false);
    setSelectedMailContent([]);
  };

  const { columns, rows } = authorsTableData(handleAgentClick, handleMailClick);

  return (
    <DashboardLayout>
      {/* Removed DashboardNavbar from here */}
      <MDBox pt={-1} pb={3}>
        <Grid container spacing={2}>
          {/* Inbox Section */}
          <Grid item xs={12} md={chatOpen ? 7 : 12}>
            <Card
              sx={{
                height: "100vh",
                borderRadius: 3,
                boxShadow: 3,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Inbox Header with trigger button */}
              <MDBox
                sx={{
                  background: "linear-gradient(135deg, #1e88e5, #42a5f5)",
                  color: "#fff",
                  px: 3,
                  py: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <MDTypography variant="h6">Inbox</MDTypography>
                <MDBox>
                  <MDButton
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => setChatOpen(!chatOpen)}
                    sx={{ mr: 1 }}
                  >
                    {chatOpen ? "Close Chat" : "Open Chat"}
                  </MDButton>
                </MDBox>
              </MDBox>
              {/* Inbox Content */}
              <MDBox
                sx={{
                  flexGrow: 1,
                  p: 2,
                  backgroundColor: "#f9f9f9",
                  overflowX: "hidden",
                  width: "100%",
                }}
              >
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>


          {chatOpen && (
            <Grid item xs={12} md={5}>
              <RocketChatIframe key={chatKey} />
            </Grid>
          )}
        </Grid>
      </MDBox>

      {/* Mail Content Modal */}
      <Dialog open={mailContentModalOpen} onClose={handleCloseMailModal} fullWidth maxWidth="md">
        <DialogTitle>Email Content</DialogTitle>
        <DialogContent dividers>
          {selectedMailContent &&
            selectedMailContent.map((line, index) => (
              <DialogContentText key={index} variant="body2" sx={{ marginBottom: 1 }}>
                {line}
              </DialogContentText>
            ))}
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleCloseMailModal} color="primary">
            Close
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default Emails;
