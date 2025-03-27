import React, { useState } from "react";
// @mui material components
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
// MUI icons
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import CloseIcon from "@mui/icons-material/Close";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function LangGraphPage() {
  const [isExpanded, setIsExpanded] = useState(false);
  const iframeSrc = "http://172.178.112.88:8201/";

  return (
    <>
      {isExpanded ? (
        // Expanded full-screen view: hide DashboardNavbar/side nav
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Close button */}
          <IconButton
            onClick={() => setIsExpanded(false)}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              color: "#000",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              zIndex: 10000,
            }}
          >
            <CloseIcon />
          </IconButton>
          {/* Fullscreen iframe */}
          <iframe
            src={iframeSrc}
            title="Orchestration Flows Expanded"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              flex: 1,
              overflow: "auto", // Add scrollbars if content exceeds view
            }}
          />
        </div>
      ) : (
        // Normal view with layout
        <DashboardLayout>
          <DashboardNavbar />
          <MDBox py={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <MDBox 
                  mb={2} 
                  position="relative"
                  sx={{
                    height: "calc(100vh - 250px)", // Increased height
                    minHeight: "600px", // Minimum height to ensure visibility
                    maxHeight: "800px", // Maximum height to prevent overflow
                  }}
                >
                  {/* Expand icon button */}
                  <IconButton
                    onClick={() => setIsExpanded(true)}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      zIndex: 1,
                      color: "#000",
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                    }}
                  >
                    <FullscreenIcon />
                  </IconButton>
                  <iframe
                    src={iframeSrc}
                    title="Orchestration Flows"
                    style={{
                      width: "100%",
                      height: "100%", // Use 100% of parent container
                      border: "none",
                      borderRadius: "15px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      overflow: "auto", // Add scrollbars if needed
                    }}
                  />
                </MDBox>
              </Grid>
            </Grid>
          </MDBox>
          <Footer />
        </DashboardLayout>
      )}
    </>
  );
}

export default LangGraphPage;