import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";
// import bgImage from "assets/images/bg-sign-in-basic.jpeg";
import bgImage from "assets/images/test-one-sign-in.png";

function Basic() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear any previous error
    setError("");

    try {
      // Make a POST request to the backend API with the entered credentials
      const response = await fetch("http://172.178.112.88:8125/app2/signin", {  // Assuming the backend has a "/signin" endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const responseBody = await response.json();
        setError(responseBody.message || "Login failed");
        return;
      }

      // If successful, save user data and navigate
      const data = await response.json();
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", username);
      
      // If your backend provides a token, store it
      if (data.token) {
        localStorage.setItem("token", data.token);
        
        // Optional: Store token expiration time if provided
        if (data.expiresIn) {
          const expirationTime = new Date().getTime() + data.expiresIn * 1000;
          localStorage.setItem("tokenExpiration", expirationTime);
        }
      }
      
      navigate("/dashboard");
    } catch (err) {
      setError("An error occurred during login");
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={5}
          mt={-4}
          p={1.5}
          mb={5}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="black" mt={1}>
            Welcome!
          </MDTypography>
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 1, mb: 2 }} />
        </MDBox>
        <MDBox pt={5} pb={5} px={5}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={3}>
              <MDInput
                type="text"
                label="Username"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </MDBox>
            {error && (
              <MDTypography variant="button" color="error" textAlign="center" mb={2}>
                {error}
              </MDTypography>
            )}
            <MDBox mt={4} mb={1}>
              <MDButton type="submit" variant="gradient" color="info" fullWidth>
                Sign In
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                New User?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-up"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign up
                </MDTypography>
              </MDTypography>
            </MDBox>
            <MDBox mt={2} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Are you an Admin?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/admin-sign-in"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign in as Admin
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;