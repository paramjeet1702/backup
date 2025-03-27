import { useEffect, useState, useRef } from "react";
import { useLocation, NavLink } from "react-router-dom";
import PropTypes from "prop-types";

// @mui material components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";

// Custom styles for the Sidenav
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";

// Import the image to be rendered at the bottom of the navbar
import relaiImg from "assets/images/relai.jpg";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;
  const location = useLocation();
  const collapseName = location.pathname.replace("/", "");

  let textColor = "white";
  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  // Use state for the brand name; initialize it from the prop (set in App.js)
  const [brandNameState, setBrandNameState] = useState(brandName);

  // Check if admin is logged in
  const isAdmin = localStorage.getItem("isAdminLoggedIn") === "true";

  // Create a ref for the textarea (admin only)
  const textareaRef = useRef(null);

  useEffect(() => {
    // Directly use the global brand name for all users
    const storedGlobalBrandName = localStorage.getItem("customBrandName_global");
    if (storedGlobalBrandName) {
      setBrandNameState(storedGlobalBrandName);
    }
  }, []);

  // Auto-resize the textarea when the content changes (for admin)
  useEffect(() => {
    if (isAdmin && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 80) + "px";
    }
  }, [brandNameState, isAdmin]);

  // Handle brand name change (for admins only)
  const handleBrandNameChange = (event) => {
    const newBrandName = event.target.value;
    setBrandNameState(newBrandName);
    if (isAdmin) {
      // Save globally for all users
      localStorage.setItem("customBrandName_global", newBrandName);
    }
  };

  // Render the routes for the side navigation
  const renderRoutes = routes.map(
    ({ type, name, icon, title, noCollapse, key, href, route }) => {
      let returnValue;
      if (type === "collapse") {
        returnValue = href ? (
          <Link
            href={href}
            key={key}
            target="_blank"
            rel="noreferrer"
            sx={{ textDecoration: "none" }}
          >
            <SidenavCollapse
              name={name}
              icon={icon}
              active={key === collapseName}
              noCollapse={noCollapse}
            />
          </Link>
        ) : (
          <NavLink key={key} to={route}>
            <SidenavCollapse
              name={name}
              icon={icon}
              active={key === collapseName}
            />
          </NavLink>
        );
      } else if (type === "title") {
        returnValue = (
          <MDTypography
            key={key}
            color={textColor}
            display="block"
            variant="caption"
            fontWeight="bold"
            textTransform="uppercase"
            pl={3}
            mt={2}
            mb={1}
            ml={1}
          >
            {title}
          </MDTypography>
        );
      } else if (type === "divider") {
        returnValue = (
          <Divider
            key={key}
            light={
              (!darkMode && !whiteSidenav && !transparentSidenav) ||
              (darkMode && !transparentSidenav && whiteSidenav)
            }
          />
        );
      }
      return returnValue;
    }
  );

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden', // Prevent overall scrolling
      }}
    >
      <MDBox pt={3} pb={0} px={4} textAlign="center">
        <MDBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <MDTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </MDTypography>
        </MDBox>
        <MDBox
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          width="100%"
        >
          {/* Clickable Logo */}
          {brand && (
            <NavLink to="/">
              <MDBox
                component="img"
                src={brand}
                alt="Brand"
                width="80px"
                height="auto"
              />
            </NavLink>
          )}
          
          {/* Brand Name Container */}
          <MDBox
            width="100%"
            sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={2}
          >
            {isAdmin ? (
              // Admin editable version with auto-resize
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={brandNameState}
                  onChange={handleBrandNameChange}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height =
                      Math.min(e.target.scrollHeight, 80) + "px";
                  }}
                  wrap="soft"
                  style={{
                    width: "100%",
                    maxHeight: "80px",
                    background: "transparent",
                    border: "none",
                    color: textColor,
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "20px",
                    resize: "none",
                    overflow: "hidden",
                    lineHeight: "1.2",
                    padding: "0px 5px",
                    margin: 0,
                    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                  }}
                />
              </div>
            ) : (
              // Regular user non-editable version - using a div for more control
              <div
                style={{
                  fontSize: "20px",
                  lineHeight: "1.2",
                  whiteSpace: "normal",
                  textAlign: "center",
                  fontWeight: "bold",
                  color: textColor,
                  width: "100%",
                  wordBreak: "break-word",
                  padding: "0px 5px",
                  fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                }}
              >
                {brandNameState}
              </div>
            )}
          </MDBox>
        </MDBox>
      </MDBox>
      <Divider
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />
      {/* Scrollable Routes Container */}
      <List 
        sx={{
          flexGrow: 1,
          overflowY: 'auto', // Enable vertical scrolling only for routes
          overflowX: 'hidden', // Prevent horizontal scrolling
          height: '100%', // Take remaining vertical space
          
          // Custom scrollbar styling
          '&::-webkit-scrollbar': {
            width: '8px', // Thin scrollbar
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent', // Transparent track
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0, 0, 0, 0.2)', // Subtle gray for light mode
            borderRadius: '10px',
            '&:hover': {
              background: 'rgba(0, 0, 0, 0.3)', // Slightly darker on hover
            }
          },
          // Dark mode scrollbar (if needed)
          ...(darkMode && {
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.2)', // Subtle light gray for dark mode
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.3)', // Slightly lighter on hover
              }
            }
          })
        }}
      >
        {renderRoutes}
      </List>
      {/* Fixed Bottom Image */}
      <MDBox p={2} textAlign="center">
        <img
          src={relaiImg}
          alt="Relai"
          style={{ maxWidth: "100%", height: "auto", borderRadius: "4px" }}
        />
      </MDBox>
    </SidenavRoot>
  );
}

Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

Sidenav.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
  ]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;