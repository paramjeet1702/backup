// index.js
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
  const [expanded, setExpanded] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const [mailContentModalOpen, setMailContentModalOpen] = useState(false);
  const [selectedMailContent, setSelectedMailContent] = useState([]);

  // Helper function that sends a POST request to the API endpoint.
  const sendEmailApi = (emailContent) => {
    fetch("http://172.178.112.88:8375/process_email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_content: emailContent,
        groupid: "123",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  // When the trigger button is clicked:
  // - Send an API call with "Hello" immediately.
  // - After 5 seconds, send another API call with the actual mail content.
  const handleAgentClick = (mailContent) => {
    if (!chatOpen) {
      setChatOpen(true);
    }
    const messageText = Array.isArray(mailContent)
      ? mailContent.join(" ")
      : mailContent;

    // First API call with "Hello"
    sendEmailApi("Hello");

    // After 5 seconds, API call with actual mail content.
    setTimeout(() => {
      sendEmailApi(messageText);
    }, 5000);
  };

  const handleMailClick = (content) => {
    setSelectedMailContent(content);
    setMailContentModalOpen(true);
  };

  const handleCloseMailModal = () => {
    setMailContentModalOpen(false);
    setSelectedMailContent([]);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const { columns, rows } = authorsTableData(handleAgentClick, handleMailClick);

  return (
    <DashboardLayout>
      <MDBox pt={-1} pb={3}>
        <Grid container spacing={2}>
          {/* Inbox Section - Hidden when expanded */}
          {!(chatOpen && expanded) && (
            <Grid
              item
              xs={12}
              md={chatOpen ? 7 : 12}
            >
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
                {/* Inbox Header with Chat Open/Close Button */}
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
                    {chatOpen && (
                      <MDButton
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={toggleExpand}
                        sx={{ mr: 1 }}
                      >
                        Expand
                      </MDButton>
                    )}
                    <MDButton
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => {
                        setChatOpen(!chatOpen);
                        if (!chatOpen) {
                          setExpanded(false);
                        }
                      }}
                    >
                      {chatOpen ? "Close Chat" : "Open Chat"}
                    </MDButton>
                  </MDBox>
                </MDBox>
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
          )}

          {/* Rocket Chat Section */}
          {chatOpen && (
            <Grid
              item
              xs={12}
              md={expanded ? 12 : 5}
            >
              <Card
                sx={{
                  height: "100vh",
                  borderRadius: 3,
                  boxShadow: 3,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Add header with Normal View button in expanded mode */}
                {expanded && (
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
                    <MDTypography variant="h6">Chat</MDTypography>
                    <MDBox>
                      <MDButton
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={toggleExpand}
                      >
                        Normal View
                      </MDButton>
                    </MDBox>
                  </MDBox>
                )}
                <RocketChatIframe key={chatKey} />
              </Card>
            </Grid>
          )}
        </Grid>
      </MDBox>

      {/* Mail Content Modal */}
      <Dialog
        open={mailContentModalOpen}
        onClose={handleCloseMailModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Content</DialogTitle>
        <DialogContent dividers>
          {selectedMailContent &&
            selectedMailContent.map((line, index) => (
              <DialogContentText
                key={index}
                variant="body2"
                sx={{ marginBottom: 1 }}
              >
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