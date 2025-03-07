import { useEffect, useState } from "react";
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

  useEffect(() => {
    // When the component mounts, load the brand name from global storage first,
    // falling back to the user-specific key if needed.
    let storedBrandName = localStorage.getItem("customBrandName_global");
    if (!storedBrandName) {
      const username = localStorage.getItem("username");
      if (username) {
        storedBrandName = localStorage.getItem(`customBrandName_${username}`);
      }
    }
    if (storedBrandName) {
      setBrandNameState(storedBrandName);
    }
  }, []);

  // Handle brand name change so that the new name is stored globally (for admins)
  const handleBrandNameChange = (event) => {
    const newBrandName = event.target.value;
    setBrandNameState(newBrandName);
    if (isAdmin) {
      // Save globally so that normal users see the updated name
      localStorage.setItem("customBrandName_global", newBrandName);
    } else {
      const username = localStorage.getItem("username");
      if (username) {
        localStorage.setItem(`customBrandName_${username}`, newBrandName);
      }
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
            <SidenavCollapse name={name} icon={icon} active={key === collapseName} />
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
          {/* Editable Brand Name (only editable for admins) */}
          <MDBox
            width="100%"
            sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
            display="flex"
            justifyContent="center"
            mt={2}
          >
            {isAdmin ? (
              <MDTypography component="div" variant="h5" fontWeight="bold" color={textColor}>
                <textarea
                  value={brandNameState}
                  onChange={handleBrandNameChange}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  style={{
                    width: "160px",
                    background: "transparent",
                    border: "none",
                    color: textColor,
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "24px",
                    resize: "none",
                    overflow: "hidden",
                    whiteSpace: "normal",
                    lineHeight: "1.2",
                    padding: 0,
                    margin: 0,
                  }}
                />
              </MDTypography>
            ) : (
              <MDTypography variant="h5" fontWeight="bold" color={textColor}>
                {brandNameState}
              </MDTypography>
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
      <List>{renderRoutes}</List>
      {/* Image rendered at the bottom of the sidenav */}
      <MDBox p={2} mt="auto" textAlign="center">
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
