import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import rtlPlugin from "stylis-plugin-rtl";

import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";
import routes from "routes";
import {
  useMaterialUIController,
  setMiniSidenav,
  setOpenConfigurator
} from "context";

import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import AdminSignIn from "layouts/authentication/admin-sign-in";
import AdminSignUp from "layouts/authentication/admin-sign-up";

import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, direction, layout, openConfigurator, sidenavColor, transparentSidenav, whiteSidenav, darkMode } = controller;
  const { pathname } = useLocation();
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const [brandLogo, setBrandLogo] = useState(null);
  const [brandName, setBrandName] = useState("AI Dashboard");

  const checkAuthStatus = () => {
    const isUserLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";
    return isUserLoggedIn || isAdminLoggedIn;
  };

  const isLoggedIn = checkAuthStatus();

  useMemo(() => {
    setRtlCache(createCache({ key: "rtl", stylisPlugins: [rtlPlugin] }));
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const globalLogo = localStorage.getItem("customLogo_global");
      if (globalLogo) {
        setBrandLogo(globalLogo);
      } else {
        const userKey = localStorage.getItem("isAdminLoggedIn") === "true" ? "adminUsername" : "username";
        const storedLogo = localStorage.getItem(`customLogo_${localStorage.getItem(userKey)}`);
        setBrandLogo(storedLogo || ((transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite));
      }
    } else {
      setBrandLogo(null);
    }

    // Load the brand name
    const storedGlobalBrandName = localStorage.getItem("customBrandName_global");
    if (storedGlobalBrandName) {
      setBrandName(storedGlobalBrandName);
    }
  }, [transparentSidenav, darkMode, whiteSidenav, pathname, isLoggedIn]);

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (miniSidenav) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  const handleLogout = () => {
    ["isLoggedIn", "username", "token", "tokenExpiration", "isAdminLoggedIn", "adminUsername", "adminToken", "adminTokenExpiration"].forEach(item => localStorage.removeItem(item));
    window.location.href = "/authentication/sign-in";
  };

  return (
    <ThemeProvider theme={direction === "rtl" ? (darkMode ? themeDarkRTL : themeRTL) : (darkMode ? themeDark : theme)}>
      <CssBaseline />
      {isLoggedIn && layout === "dashboard" && (
        <>
          <Sidenav color={sidenavColor} brand={brandLogo} brandName={brandName} routes={routes} onMouseEnter={handleOnMouseEnter} onMouseLeave={handleOnMouseLeave} />
          <Configurator />
        </>
      )}
      <Routes>
        {isLoggedIn ? (
          <>
            {routes.map(route => <Route key={route.key} path={route.route} element={route.component} />)}
            <Route path="/logout" element={<Navigate to="/authentication/sign-in" />} action={handleLogout} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        ) : (
          <>
            <Route path="/authentication/sign-in" element={<SignIn />} />
            <Route path="/authentication/sign-up" element={<SignUp />} />
            <Route path="/authentication/admin-sign-in" element={<AdminSignIn />} />
            <Route path="/authentication/admin-sign-up" element={<AdminSignUp />} />
            <Route path="*" element={<Navigate to="/authentication/sign-in" />} />
          </>
        )}
      </Routes>
    </ThemeProvider>
  );
}