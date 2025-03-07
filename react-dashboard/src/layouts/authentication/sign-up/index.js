import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout"; // Changed to BasicLayout
// import bgImage from "assets/images/bg-sign-up-cover.jpeg";
import bgImage from "assets/images/test-one-sign-up.png";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");  // Clear any previous errors

    try {
      const response = await fetch("http://172.178.112.88:8125/app2/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: name, email, password }),
      });

      // Check if the response is JSON
      const contentType = response.headers.get("Content-Type");
      let responseBody;

      // Only attempt to parse JSON if the response is of type application/json
      if (contentType && contentType.includes("application/json")) {
        responseBody = await response.json();
      } else {
        throw new Error("Expected JSON, but received something else.");
      }

      if (!response.ok) {
        throw new Error(responseBody.message || "Registration failed");
      }

      // If registration is successful, navigate to the sign-in page
      navigate("/authentication/sign-in");
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
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
            Welcome!
          </MDTypography>
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 1, mb: 2 }} />
        </MDBox>
        <MDBox pt={5} pb={5} px={5}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={3}>
              <MDInput
                type="text"
                label="Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </MDBox>
            <MDBox mb={3}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <MDButton type="submit" variant="gradient" color="info" fullWidth disabled={loading}>
                {loading ? "Registering..." : "Sign Up"}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
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

export default SignUp;
