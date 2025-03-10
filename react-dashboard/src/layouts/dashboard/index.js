import React, { useState, useEffect } from "react";
// @mui material components
import Grid from "@mui/material/Grid";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
// Data for the line charts
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";
// Dashboard components
import Agents from "layouts/dashboard/components/Agents";
// Import the new Dual-Axis Chart component (replace MaxSRBarChart)
import DualAxisChart from "layouts/dashboard/DualAxisChart";

import { purple, red } from '@mui/material/colors';

const primary = red[500]; // #f44336
const accent = purple['A200']; // #e040fb

function Dashboard() {
  // Destructure charts data for line charts
  const { sales, tasks } = reportsLineChartData;

  // State for dynamic counts
  const [emailCount, setEmailCount] = useState(0);
  const [activeAgents, setActiveAgents] = useState(0);

  useEffect(() => {
    // --- Fetch Emails Count from emails.json ---
    fetch("/emails.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error fetching emails.json");
        }
        return response.json();
      })
      .then((data) => {
        setEmailCount(Object.keys(data).length);
      })
      .catch((error) => console.error("Error fetching emails data:", error));

    // --- Fetch Agents Data from API (for active agents count) ---
    fetch("http://172.178.112.88:8125/app5/api/agents")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error fetching agents data");
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.data) {
          const uniqueAgents = new Set(data.data.map((agent) => agent.agent_name));
          setActiveAgents(uniqueAgents.size);
        }
      })
      .catch((error) => console.error("Error fetching agents data:", error));
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Row 1 - Emails & Active Agents */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={2}>
              <ComplexStatisticsCard
                color="dark"
                icon="email"
                title="Emails"
                count={emailCount}
                percentage={null}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={2}>
              <ComplexStatisticsCard
                color="primary"
                icon="psychology"
                title="Active Agents"
                count={activeAgents}
                percentage={null}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="secondary"
                icon="accessibility"
                title="Agents Connected"
                count={14}
                percentage={null}
              />
            </MDBox>
          </Grid>
          {/* Tasks Pending Card */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                // color= ""
                icon="assignmentLate"
                title="Tasks Pending"
                count={7}
                percentage={null}
              />
            </MDBox>
          </Grid>
        </Grid>

        {/* Row 2 - Dual-Axis Chart */}
        <Grid container spacing={3} mt={3}>
          <Grid item xs={11}>
            <DualAxisChart />
          </Grid>
        </Grid>

        {/* Row 3 - Line Charts (Accuracy & Completed Tasks) */}
        <MDBox mt={5}>
          <Grid container spacing={3}>
            <Grid item xs={10} md={5.5} lg={5.5}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="Accuracy"
                  description={
                    <>
                      <strong>+15%</strong> increase in Accuracy.
                    </>
                  }
                  date="updated 4 min ago"
                  chart={sales}
                />
              </MDBox>
            </Grid>
            <Grid item xs={10} md={5.5} lg={5.5}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="Completed Tasks"
                  description="Agentic Tasks Completed"
                  date="just updated"
                  chart={tasks}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Row 4 - Enhanced Agents Card */}
        <MDBox mt={1}>
          <Grid container spacing={3}>
            <Grid item xs={11}>
              <Agents />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;