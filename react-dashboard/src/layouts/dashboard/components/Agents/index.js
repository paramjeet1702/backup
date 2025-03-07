// Agents/index.js
import React, { useState, useEffect } from "react";

import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React examples
import DataTable from "examples/Emails/DataTable";

function Agents() {
  const theme = useTheme();

  // Original agents from API and a local copy for UI modifications.
  const [originalAgents, setOriginalAgents] = useState([]);
  const [localAgents, setLocalAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState(null);

  // Dialog state for adding an agent (kept unchanged)
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");

  // Deletion mode and states for pending deletion animations
  const [deleteMode, setDeleteMode] = useState(false);
  const [pendingDeletions, setPendingDeletions] = useState([]); // agents marked for deletion
  const [removingAgents, setRemovingAgents] = useState([]); // agents currently animating out

  // Fetch agents from API
  const fetchAgents = () => {
    setLoading(true);
    fetch("http://172.178.112.88:8125/app1/api/agents")
      .then((response) => response.json())
      .then((result) => {
        // Assuming API returns { data: [ { agent_name, start_timestamp, stop_timestamp }, ... ] }
        const data = result.data || [];
        // Remove duplicates by agent_name and sort alphabetically
        const uniqueAgents = data.filter(
          (agent, index, self) => index === self.findIndex((a) => a.agent_name === agent.agent_name)
        );
        uniqueAgents.sort((a, b) => a.agent_name.localeCompare(b.agent_name));

        // Save both as original and local copies (localAgents is what is rendered)
        setOriginalAgents(uniqueAgents);
        setLocalAgents(uniqueAgents);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching agents data:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // --- Menu Handlers ---
  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  // --- Add Agent Dialog Handlers ---
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
    closeMenu();
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewAgentName("");
  };

  const handleAddAgent = () => {
    fetch("http://172.178.112.88:8125/app1/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agent_name: newAgentName,
        start_timestamp: new Date().toISOString(),
      }),
    })
      .then((response) => response.json())
      .then(() => {
        fetchAgents();
        handleCloseAddDialog();
      })
      .catch((error) => console.error("Error adding agent:", error));
  };
  // Function to update agents.json directly
  const updateAgentJsonLocally = (agentName, description) => {
    fetch("http://172.178.112.88:8125/app1/api/update-agents-json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agent_name: agentName,
        description: description,
      }),
    })
      .then((response) => response.json())
      .catch((error) => console.error("Error updating agents.json:", error));
  };

  // --- Deletion (Pending) Handlers ---
  // Called when the red bin icon is clicked on a row.
  const handleMarkForDeletion = (agentName) => {
    if (removingAgents.includes(agentName)) return; // avoid multiple clicks
    setRemovingAgents((prev) => [...prev, agentName]);
    // Simulate a slide-out animation duration (300ms)
    setTimeout(() => {
      // Find the agent in the current UI list
      const agentToDelete = localAgents.find((agent) => agent.agent_name === agentName);
      if (agentToDelete) {
        // Add to pending deletions so we can confirm later
        setPendingDeletions((prev) => [...prev, agentToDelete]);
        // Remove from the visible list
        setLocalAgents((prev) => prev.filter((agent) => agent.agent_name !== agentName));
      }
      // Remove from the "removing" list
      setRemovingAgents((prev) => prev.filter((name) => name !== agentName));
    }, 300);
  };

  // Confirm deletions: send DELETE requests for all pending agents
  const handleConfirmDeletions = () => {
    Promise.all(
      pendingDeletions.map((agent) =>
        fetch("http://172.178.112.88:8125/app1/api/agents", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent_name: agent.agent_name }),
        }).then((response) => response.json())
      )
    )
      .then(() => {
        fetchAgents();
        // Clear pending deletions and exit deletion mode
        setPendingDeletions([]);
        setDeleteMode(false);
      })
      .catch((error) => console.error("Error deleting agents:", error));
  };

  // Cancel deletion: restore the removed agents back to the UI.
  const handleCancelDeletions = () => {
    // Restore visible agents from the original copy
    setLocalAgents(originalAgents);
    setPendingDeletions([]);
    setDeleteMode(false);
  };

  // Activate deletion mode from the menu.
  const handleActivateDeleteMode = () => {
    setDeleteMode(true);
    closeMenu();
  };

  // --- Prepare Table Data ---
  // Define columns; add an "Actions" column if in deletion mode.
  const computedColumns = [
    { Header: "ID", accessor: "id", align: "left" },
    { Header: "Agent Name", accessor: "agent_name", align: "left" },
  ];
  if (deleteMode) {
    computedColumns.push({
      Header: "Actions",
      accessor: "actions",
      align: "center",
    });
  }

  // Map visible agents to rows.
  const computedRows = localAgents.map((agent, index) => {
    const row = {
      id: index + 1,
      agent_name: (
        <Link to={`/agent/${agent.agent_name}`} style={{ textDecoration: "none", color: "blue" }}>
          {agent.agent_name}
        </Link>
      ),
      start_timestamp: agent.start_timestamp,
      stop_timestamp: agent.stop_timestamp,
    };

    if (deleteMode) {
      row.actions = (
        <Icon
          onClick={() => handleMarkForDeletion(agent.agent_name)}
          sx={{
            color: "#c62828", // Matte error red
            cursor: "pointer",
            transition: "transform 0.3s ease-out",
            transform: removingAgents.includes(agent.agent_name)
              ? "translateX(-100%)"
              : "translateX(0)",
          }}
        >
          delete
        </Icon>
      );
    }
    return row;
  });

  // --- Render Menu ---
  const renderMenu = (
    <Menu
      id="agent-menu"
      anchorEl={menu}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(menu)}
      onClose={closeMenu}
    >
      <MenuItem onClick={handleOpenAddDialog}>Add Agent</MenuItem>
      <MenuItem onClick={handleActivateDeleteMode}>Remove Agent</MenuItem>
    </Menu>
  );

  return (
    <Card
      sx={{
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[3],
        backgroundColor: "#ffffff", // Matte white background
      }}
    >
      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={3}
        sx={{
          backgroundColor: "#424242", // Matte dark gray
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: "#ffffff",
        }}
      >
        <MDBox>
          <MDTypography variant="h6" gutterBottom color="white">
            {" "}
            {/* Changed to white */}
            Agents
          </MDTypography>
          <MDBox display="flex" alignItems="center" lineHeight={0}>
            <Icon
              sx={{ fontWeight: "bold", color: "#ffffff", mt: -0.5 }} // Changed to white
            >
              done
            </Icon>
            <MDTypography variant="button" fontWeight="regular" color="white">
              {" "}
              {/* Changed to white */}
              &nbsp;
              {loading ? "Loading agents..." : <strong>{localAgents.length} Agents</strong>}
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox color="inherit" px={2}>
          {/* In deletion mode, show both confirm (green check) and cancel (red X) icons */}
          {deleteMode ? (
            <MDBox display="flex" alignItems="center">
              <Icon
                sx={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  color: "#2e7d32", // Matte green for confirmation
                  mr: 1,
                }}
                fontSize="small"
                onClick={handleConfirmDeletions}
              >
                check
              </Icon>
              <Icon
                sx={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  color: "#c62828", // Matte red for cancellation
                }}
                fontSize="small"
                onClick={handleCancelDeletions}
              >
                close
              </Icon>
            </MDBox>
          ) : (
            <Icon
              sx={{ cursor: "pointer", fontWeight: "bold" }}
              fontSize="small"
              onClick={openMenu}
            >
              more_vert
            </Icon>
          )}
        </MDBox>
        {renderMenu}
      </MDBox>

      <MDBox p={3}>
        {loading ? (
          <MDTypography variant="body1" align="center">
            Loading...
          </MDTypography>
        ) : (
          <DataTable
            table={{ columns: computedColumns, rows: computedRows }}
            showTotalEntries={false}
            isSorted={false}
            noEndBorder
            entriesPerPage={false}
          />
        )}
      </MDBox>

      {/* --- Add Agent Dialog --- */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius,
            boxShadow: theme.shadows[5],
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#424242", // Matte dark gray
            color: "#ffffff",
          }}
        >
          Add Agent
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Agent Name"
            type="text"
            fullWidth
            variant="standard"
            value={newAgentName}
            onChange={(e) => setNewAgentName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button onClick={handleAddAgent} disabled={!newAgentName.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default Agents;
