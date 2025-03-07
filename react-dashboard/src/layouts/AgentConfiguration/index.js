import React, { useState, useEffect, useRef } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

// Material Dashboard components
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function AgentConfiguration() {
  // Retrieve the username from localStorage (or from your auth context)
  const username = localStorage.getItem("username") || "defaultUser";
  const isAdmin = localStorage.getItem("isAdminLoggedIn") === "true";

  // State to store agents data (fetched from the API)
  const [data, setData] = useState({});
  // State for the "Add Agent" dialog inputs
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [context, setContext] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  // State for the "Edit Agent" dialog inputs
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editAgentName, setEditAgentName] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [editContext, setEditContext] = useState("");
  const [editLogoUrl, setEditLogoUrl] = useState("");

  // State to track which card is active (clicked)
  const [activeCard, setActiveCard] = useState(null);
  // Ref for the active card to reset scroll position when closed
  const activeCardRef = useRef(null);

  const baseUrl = "http://172.178.112.88:8125/app2";

  // Function to fetch the current user's agents from the API
  const fetchData = () => {
    // Use "admin" as the username to fetch agent data for both admin and regular users.
    fetch(`${baseUrl}/api/user-keys?username=${encodeURIComponent("admin")}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error fetching user agents");
        }
        return response.json();
      })
      .then((fetchedData) => {
        setData(fetchedData);
      })
      .catch((error) => console.error("Error:", error));
  };

  // Fetch agents on mount (and when username changes)
  useEffect(() => {
    fetchData();
  }, [username]);

  // ------------------ ADD AGENT HANDLERS ------------------
  const handleOpenAddDialog = () => {
    if (!isAdmin) {
      alert("Only admin can add an agent.");
      return;
    }
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setAgentName("");
    setPrompt("");
    setContext("");
    setLogoUrl("");
  };

  const handleAddAgent = () => {
    if (!isAdmin) {
      alert("Only admin can add an agent.");
      return;
    }
    if (!agentName || !prompt || !context || !logoUrl) {
      alert("Please fill in all fields");
      return;
    }
    // Since only admin is allowed, we force the payload username to "admin"
    const newAgent = {
      username: "admin",
      agent_name: agentName,
      prompt,
      context,
      logo_url: logoUrl,
    };

    fetch(`${baseUrl}/api/user-keys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newAgent),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error adding new agent");
        }
        return response.json();
      })
      .then((result) => {
        console.log("Agent added:", result);
        fetchData();
        handleCloseAddDialog();
      })
      .catch((error) => console.error("Error:", error));
  };

  // ------------------ DELETE AGENT HANDLER ------------------
  const handleDeleteAgent = (agentNameToDelete, e) => {
    e.stopPropagation();
    if (!isAdmin) {
      alert("Only admin can delete an agent.");
      return;
    }
    const payload = { username: "admin", agent_name: agentNameToDelete };
    fetch(`${baseUrl}/api/user-keys`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error deleting agent");
        }
        return response.json();
      })
      .then((result) => {
        console.log("Agent deleted:", result);
        fetchData();
      })
      .catch((error) => console.error("Error:", error));
  };

  // ------------------ EDIT AGENT HANDLERS ------------------
  // Opens the edit dialog and populates with current details.
  const handleOpenEditDialog = (agent, details, e) => {
    e.stopPropagation();
    if (!isAdmin) {
      alert("Only admin can edit an agent.");
      return;
    }
    setEditAgentName(agent);
    setEditPrompt(details.prompt || "");
    setEditContext(details.context || "");
    setEditLogoUrl(details.logo_url || "");
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditAgentName("");
    setEditPrompt("");
    setEditContext("");
    setEditLogoUrl("");
  };

  const handleUpdateAgent = () => {
    if (!isAdmin) {
      alert("Only admin can update an agent.");
      return;
    }
    if (!editPrompt && !editContext && !editLogoUrl) {
      alert("Please update at least one field");
      return;
    }
    const updatePayload = {
      username: "admin",
      agent_name: editAgentName,
      prompt: editPrompt,
      context: editContext,
      logo_url: editLogoUrl,
    };

    fetch(`${baseUrl}/api/user-keys`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Agent not found");
          }
          throw new Error("Error updating agent");
        }
        return response.json();
      })
      .then((result) => {
        console.log("Agent updated:", result);
        fetchData();
        handleCloseEditDialog();
      })
      .catch((error) => console.error("Error:", error));
  };

  // File upload handler for logo
  const handleLogoUpload = async (e) => {
    if (!isAdmin) {
      alert("Only admin can upload a logo.");
      return;
    }
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setLogoUrl(previewUrl);

      // Prepare the form data
      const formData = new FormData();
      formData.append('user', "admin");
      formData.append('image_name', agentName);
      formData.append('file', file);

      try {
        const response = await fetch('http://172.178.112.88:8125/app3/upload_image/', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log('File uploaded successfully:', data);
          const filePath = data.message;
          setLogoUrl(filePath);
        } else {
          console.error('File upload failed:', response.statusText);
        }
      } catch (error) {
        console.error('Error during file upload:', error);
      }
    }
  };

  // Close the enlarged card and reset its scroll position
  const handleCloseActiveCard = () => {
    if (activeCardRef.current) {
      activeCardRef.current.scrollTop = 0;
    }
    setActiveCard(null);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* "Add Agent" Button is only visible to admin */}
        {isAdmin && (
          <Box mb={3}>
            <Button
              variant="contained"
              sx={{
                color: "#fff",  
                backgroundColor: "#1976d2",  
                "&:hover": { backgroundColor: "#1565c0" },
              }}
              onClick={handleOpenAddDialog}
            >
              Add Agent
            </Button>
          </Box>
        )}

        {/* Dialog for adding a new agent */}
        <Dialog
          open={openAddDialog}
          onClose={handleCloseAddDialog}
          BackdropProps={{ style: { backdropFilter: "blur(4px)" } }}
          sx={{
            "& .MuiDialogContent-root": {
              width: "400px",
            },
          }}
        >
          <DialogTitle>Add a New Agent</DialogTitle>
          <DialogContent>
            <Box mt={2} display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Agent Name"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                fullWidth
              />
              <TextField
                label="Context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                fullWidth
              />
              {/* File Upload for Logo */}
              <Box>
                <Button
                  variant="contained"
                  sx={{
                    color: "#fff",
                    backgroundColor: "#1976d2",
                    "&:hover": { backgroundColor: "#1565c0" },
                  }}
                  component="label"
                >
                  Upload Logo
                  <input type="file" hidden onChange={handleLogoUpload} />
                </Button>
                {logoUrl && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {logoUrl}
                  </Typography>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddDialog}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              sx={{
                color: "#fff",
                backgroundColor: "#1976d2",
                "&:hover": { backgroundColor: "#1565c0" },
              }}
              onClick={handleAddAgent}
            >
              Add Agent
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog for editing an existing agent */}
        <Dialog
          open={openEditDialog}
          onClose={handleCloseEditDialog}
          BackdropProps={{ style: { backdropFilter: "blur(4px)" } }}
        >
          <DialogTitle>Edit Agent: {editAgentName}</DialogTitle>
          <DialogContent>
            <Box mt={2} display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Prompt"
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                fullWidth
              />
              <TextField
                label="Context"
                value={editContext}
                onChange={(e) => setEditContext(e.target.value)}
                fullWidth
              />
              <TextField
                label="Logo URL"
                value={editLogoUrl}
                onChange={(e) => setEditLogoUrl(e.target.value)}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              sx={{
                color: "#fff",
                backgroundColor: "#1976d2",
                "&:hover": { backgroundColor: "#1565c0" },
              }}
              onClick={handleUpdateAgent}
            >
              Update Agent
            </Button>
          </DialogActions>
        </Dialog>

        {/* Blurred backdrop for the enlarged card */}
        {activeCard && (
          <Box
            onClick={handleCloseActiveCard}
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backdropFilter: "blur(4px)",
              backgroundColor: "rgba(0,0,0,0.2)",
              zIndex: 1200,
              transition: "opacity 0.3s ease",
            }}
          />
        )}

        {/* Display each agent as a card */}
        <Grid container spacing={3}>
          {Object.entries(data).map(([agent, details]) => (
            <Grid item xs={12} md={6} lg={6} key={agent}>
              <Card
                onClick={() => setActiveCard(agent)}
                ref={activeCard === agent ? activeCardRef : null}
                sx={{
                  height: activeCard === agent ? "auto" : "300px",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                  ...(activeCard === agent && {
                    position: "fixed",
                    top: "50%",
                    left: "70%",
                    transform: "translate(-70%, -50%)",
                    width: "60vw",
                    maxHeight: "90vh",
                    zIndex: 1300,
                    overflowY: "auto",
                  }),
                }}
              >
                <CardContent>
                  {/* Agent Header with Logo and Name */}
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    {/* Agent Logo */}
                    {details.logo_url && (
                      <img
                        src={`http://172.178.112.88:8125/app3/image/admin/${agent}`}
                        alt={`${agent} logo`}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "50%",
                          border: "2px solid #ccc",
                        }}
                      />
                    )}
                    {/* Agent Name */}
                    <Typography variant="h6" gutterBottom>
                      {agent}
                    </Typography>
                    {/* Edit and delete icons appear only when enlarged and only for admin */}
                    {activeCard === agent && isAdmin && (
                      <Box ml="auto">
                        <IconButton onClick={(e) => handleOpenEditDialog(agent, details, e)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={(e) => handleDeleteAgent(agent, e)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  {/* Prompt and Context */}
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Prompt:</strong> {details.prompt}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Context:</strong> {details.context}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AgentConfiguration;
