import { useState, useEffect } from "react";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import ConfiguratorRoot from "examples/Configurator/ConfiguratorRoot";
import {
  useMaterialUIController,
  setOpenConfigurator,
  setTransparentSidenav,
  setWhiteSidenav,
  setFixedNavbar,
  setDarkMode,
} from "context";
import { useNavigate } from "react-router-dom";

function Configurator() {
  const [controller, dispatch] = useMaterialUIController();
  const { openConfigurator, fixedNavbar, transparentSidenav, whiteSidenav, darkMode } = controller;
  const [disabled, setDisabled] = useState(false);
  const [user, setUser] = useState(null);
  const [customLogo, setCustomLogo] = useState("");
  const navigate = useNavigate();

  // Update disabled state based on window width
  useEffect(() => {
    function handleDisabled() {
      setDisabled(window.innerWidth <= 1200);
    }
    window.addEventListener("resize", handleDisabled);
    handleDisabled();
    return () => window.removeEventListener("resize", handleDisabled);
  }, []);

  // Initialize user from localStorage on mount
  // useEffect(() => {
  //   const username = localStorage.getItem("username");
  //   if (localStorage.getItem("isLoggedIn") === "true" && username) {
  //     setUser({ name: username });
  //   }
  // }, []);

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";
    if (isAdminLoggedIn) {
      const adminUsername = localStorage.getItem("adminUsername");
      if (adminUsername) {
        setUser({ name: adminUsername, type: "admin" });
      }
    } else {
      const username = localStorage.getItem("username");
      if (localStorage.getItem("isLoggedIn") === "true" && username) {
        setUser({ name: username, type: "user" });
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      const imageUrl = `http://172.178.112.88:8125/app6/image/?name=${user.name}`;
      fetch(imageUrl)
        .then((res) => {
          if (!res.ok) throw new Error("Not found");
          return res.blob();
        })
        .then((blob) => {
          const imgURL = URL.createObjectURL(blob);
          setCustomLogo(imgURL);
  
          // cache
          sessionStorage.setItem("customLogo_session", imgURL);
          localStorage.setItem("customLogo_global", imgURL);
          localStorage.setItem(`customLogo_fsladmin}`, imgURL);
        })
        .catch(() => {
          // fallback
          const storedLogo = localStorage.getItem(`customLogo_${user.name}`);
          setCustomLogo(storedLogo || "");
        });
    }
  }, [user]);
  
  

  const handleCloseConfigurator = () => setOpenConfigurator(dispatch, false);
  const handleTransparentSidenav = () => {
    setTransparentSidenav(dispatch, true);
    setWhiteSidenav(dispatch, false);
  };
  const handleWhiteSidenav = () => {
    setWhiteSidenav(dispatch, true);
    setTransparentSidenav(dispatch, false);
  };
  const handleDarkSidenav = () => {
    setWhiteSidenav(dispatch, false);
    setTransparentSidenav(dispatch, false);
  };
  const handleFixedNavbar = () => setFixedNavbar(dispatch, !fixedNavbar);
  const handleDarkMode = () => setDarkMode(dispatch, !darkMode);

  // Styles for sidenav type buttons
  const sidenavTypeButtonsStyles = ({
    functions: { pxToRem },
    palette: { white, dark, background },
    borders: { borderWidth },
  }) => ({
    height: pxToRem(39),
    background: darkMode ? background.sidenav : white.main,
    color: darkMode ? white.main : dark.main,
    border: `${borderWidth[1]} solid ${darkMode ? white.main : dark.main}`,
    "&:hover, &:focus, &:focus:not(:hover)": {
      background: darkMode ? background.sidenav : white.main,
      color: darkMode ? white.main : dark.main,
      border: `${borderWidth[1]} solid ${darkMode ? white.main : dark.main}`,
    },
  });

  const sidenavTypeActiveButtonStyles = ({
    functions: { pxToRem, linearGradient },
    palette: { white, gradients, background },
  }) => ({
    height: pxToRem(39),
    background: darkMode ? white.main : linearGradient(gradients.dark.main, gradients.dark.state),
    color: darkMode ? background.sidenav : white.main,
    "&:hover, &:focus, &:focus:not(:hover)": {
      background: darkMode ? white.main : linearGradient(gradients.dark.main, gradients.dark.state),
      color: darkMode ? background.sidenav : white.main,
    },
  });

  // Handle sign out by clearing login flags and redirecting to the Sign In page
  const handleLogout = () => {
    setUser(null);
    // Remove user keys
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiration");
  
    // Remove admin keys
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminTokenExpiration");
  
    // Force a full page reload to re-read authentication state
    window.location.href = "/authentication/sign-in";
  };
  

  // Handle logo upload: read file as base64 and store in state and localStorage
  // const handleLogoUpload = async (e) => {
  //   const file = e.target.files[0];
  //   if (file && user?.name) {
  //     const formData = new FormData();
  //     formData.append("name", user.name);
  //     formData.append("file", file);
  
  //     try {
  //       const response = await fetch("http://172.178.112.88:8125/app6/upload-image/", {
  //         method: "POST",
  //         body: formData,
  //       });
  
  //       if (!response.ok) {
  //         const errorData = await response.json();
  //         throw new Error(errorData.detail || "Image upload failed");
  //       }
  
  //       const result = await response.json();
  //       const imageUrl = `http://172.178.112.88:8125/app6/image/?name=${user.name}`;
  
  //       setCustomLogo(imageUrl);
  
  //       // Still cache for session or fallback
  //       if (user.type === "admin") {
  //         sessionStorage.setItem("customLogo_session", imageUrl);
  //         localStorage.setItem("customLogo_global", imageUrl);
  //         localStorage.setItem(`customLogo_${user.name}`, imageUrl);
  //       }
  //     } catch (error) {
  //       console.error("Upload error:", error.message);
  //       alert("Failed to upload logo. " + error.message);
  //     }
  //   }
  // };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      // Always use "fsladmin" as the name as requested
      formData.append("name", "fsladmin");
      formData.append("file", file);
      
      try {
        const response = await fetch("http://172.178.112.88:8125/app6/upload-image/", {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Image upload failed");
        }
        
        // Add timestamp to force cache refresh
        const timestamp = new Date().getTime();
        const imageUrl = `http://172.178.112.88:8125/app6/image/?name=fsladmin&t=${timestamp}`;
        
        // Update UI
        setCustomLogo(imageUrl);
        
        // Store in both local and sessionStorage with consistent naming
        localStorage.setItem("customLogo_global", imageUrl);
        localStorage.setItem("customLogo_fsladmin", imageUrl);
        sessionStorage.setItem("customLogo_session", imageUrl);
        
        // Create a custom event to notify other components about logo change
        const event = new CustomEvent('logoUpdated', { 
          detail: { logoUrl: imageUrl } 
        });
        window.dispatchEvent(event);
        
        // Force a refresh of the logo in the Sidenav
        if (window.updateGlobalLogo) {
          window.updateGlobalLogo(imageUrl);
        }
        
      } catch (error) {
        console.error("Upload error:", error.message);
        alert("Failed to upload logo. " + error.message);
      }
    }
  };
  
  // Handle removal of the custom logo
  const handleRemoveLogo = () => {
    setCustomLogo("");
    localStorage.removeItem(`customLogo_${user.name}`);
  };

  return (
    <>
      <ConfiguratorRoot variant="permanent" ownerState={{ openConfigurator }}>
        <MDBox>
          <MDBox display="flex" justifyContent="space-between" alignItems="baseline" pt={4} pb={0.5} px={3}>
            <MDBox>
              <MDTypography variant="h5">Agentic UI Configurator</MDTypography>
              <MDTypography variant="body2" color="text">
                See our dashboard options.
              </MDTypography>
            </MDBox>
            <Icon
              sx={({ typography: { size }, palette: { dark, white } }) => ({
                fontSize: `${size.lg} !important`,
                color: darkMode ? white.main : dark.main,
                stroke: "currentColor",
                strokeWidth: "2px",
                cursor: "pointer",
                transform: "translateY(5px)",
              })}
              onClick={handleCloseConfigurator}
            >
              close
            </Icon>
          </MDBox>

          <Divider />

          <MDBox pt={0.5} pb={3} px={3}>
            <MDBox mt={3} lineHeight={1}>
              <MDTypography variant="h6">Sidenav Type</MDTypography>
              <MDTypography variant="button" color="text">
                Choose between different sidenav types.
              </MDTypography>
              <MDBox sx={{ display: "flex", mt: 2, mr: 1 }}>
                <MDButton
                  color="dark"
                  variant="gradient"
                  onClick={handleDarkSidenav}
                  disabled={disabled}
                  fullWidth
                  sx={
                    !transparentSidenav && !whiteSidenav
                      ? sidenavTypeActiveButtonStyles
                      : sidenavTypeButtonsStyles
                  }
                >
                  Dark
                </MDButton>
                <MDBox sx={{ mx: 1, width: "8rem", minWidth: "8rem" }}>
                  <MDButton
                    color="dark"
                    variant="gradient"
                    onClick={handleTransparentSidenav}
                    disabled={disabled}
                    fullWidth
                    sx={
                      transparentSidenav && !whiteSidenav
                        ? sidenavTypeActiveButtonStyles
                        : sidenavTypeButtonsStyles
                    }
                  >
                    Transparent
                  </MDButton>
                </MDBox>
                <MDButton
                  color="dark"
                  variant="gradient"
                  onClick={handleWhiteSidenav}
                  disabled={disabled}
                  fullWidth
                  sx={
                    whiteSidenav && !transparentSidenav
                      ? sidenavTypeActiveButtonStyles
                      : sidenavTypeButtonsStyles
                  }
                >
                  White
                </MDButton>
              </MDBox>
            </MDBox>

            <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={3} lineHeight={1}>
              <MDTypography variant="h6">Navbar Fixed</MDTypography>
              <Switch checked={fixedNavbar} onChange={handleFixedNavbar} />
            </MDBox>
            <Divider />
            <MDBox display="flex" justifyContent="space-between" alignItems="center" lineHeight={1}>
              <MDTypography variant="h6">Light / Dark</MDTypography>
              <Switch checked={darkMode} onChange={handleDarkMode} />
            </MDBox>
            <Divider />

            {/* Sign Out Section */}
            {user && (
              <MDBox mt={3}>
                <MDTypography variant="h6">Welcome, {user.name}</MDTypography>
                <MDButton onClick={handleLogout} fullWidth variant="gradient" color="error" sx={{ mt: 2 }}>
                  Sign Out
                </MDButton>
              </MDBox>
            )}

            {/* Enhanced Logo Upload Section */}
            {user && user.type === "admin" && (
  <MDBox mt={3}>
    <MDTypography variant="h6">
      {customLogo ? "Choose a Different Logo" : "Upload Logo"}
    </MDTypography>
    <MDTypography variant="button" color="text">
      {customLogo
        ? "Choose different logo "
        : "Upload a logo to personalize your dashboard."}
    </MDTypography>
    <input
      type="file"
      accept="image/*"
      onChange={handleLogoUpload}
      style={{ marginTop: "0.5rem" }}
    />
    {customLogo && (
      <MDBox mt={2} display="flex" flexDirection="column" alignItems="center">
        <img
          src={customLogo}
          alt="Custom Logo"
          style={{
            maxWidth: "100%",
            height: "auto",
            borderRadius: "4px",
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
          }}
        />
        <MDButton
          onClick={handleRemoveLogo}
          variant="outlined"
          color="error"
          sx={{ mt: 2 }}
        >
          Remove Logo
        </MDButton>
      </MDBox>
    )}
  </MDBox>
)}

          </MDBox>
        </MDBox>
      </ConfiguratorRoot>
    </>
  );
}

export default Configurator;
