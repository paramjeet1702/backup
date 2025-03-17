import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import bgImage from "assets/images/test-one-sign-up.png";

function AdminSignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");  // Clear any previous errors

    try {
      const response = await fetch("http://172.178.112.88:8125/app4/admin-signup", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          username, 
          password
        }),
        // Add timeout to prevent long-hanging requests
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      // Check if the response is ok before parsing
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.message === true) {
        // Registration successful, navigate to admin sign-in
        navigate("/authentication/admin-sign-in");
      } else {
        throw new Error("Admin registration failed");
      }
    } catch (err) {
      console.error("Admin registration error:", err);
      if (err.name === "AbortError") {
        setError("Request timed out. Please check your network connection.");
      } else if (err.message.includes("Failed to fetch")) {
        setError("Unable to connect to the server. Please check if the server is running.");
      } else {
        setError(`Registration error: ${err.message}`);
      }
    } finally {
      setLoading(false);
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
            Admin Registration
          </MDTypography>
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 1, mb: 2 }} />
        </MDBox>
        <MDBox pt={5} pb={5} px={5}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={3}>
              <MDInput
                type="text"
                label="Admin Username"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </MDBox>
            <MDBox mb={3}>
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
              <MDButton type="submit" variant="gradient" color="info" fullWidth disabled={loading}>
                {loading ? "Registering..." : "Register Admin"}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an admin account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/admin-sign-in"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign In
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default AdminSignUp;