import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Chart } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function DualAxisChart() {
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from the API
    fetch("http://172.178.112.88:8125/app5/api/grouped_agents")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Handle both response formats: with or without a "data" property.
        const apiData = data.data || data;
        const enhancedData = {};
        Object.keys(apiData).forEach((key) => {
          enhancedData[key] = {
            ...apiData[key],
            invocations: apiData[key].id, // Mock data for demonstration
          };
        });
        setAgentData(enhancedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching agent data:", error);
        setError("Failed to load agent data");
        setLoading(false);
      });
  }, []);

  const prepareChartData = () => {
    if (!agentData) return null;

    // Compute two label arrays:
    // - shortLabels for the x-axis (using short_form if available)
    // - fullLabels for tooltips (always the formatted full name)
    const shortLabels = Object.keys(agentData).map((key) => {
      const agent = agentData[key];
      return agent.short_form
        ? agent.short_form
        : key
            .replace(/_agent/g, " Agent")
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    });

    // Full names always using formatted key
    const fullLabels = Object.keys(agentData).map((key) =>
      key
        .replace(/_agent/g, " Agent")
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );

    // Extract duration and invocation data.
    const durations = Object.values(agentData).map((agent) => agent.duration);
    const invocations = Object.values(agentData).map(
      (agent) => agent.invocations
    );

    return { shortLabels, fullLabels, durations, invocations };
  };

  // Compute a dynamic maximum for the "Invocations" y-axis.
  // If the highest invocation is less than 100, we set the max to 100.
  // Otherwise, we add a 20% margin and round up to the next 10.
  const computedYMax = agentData
    ? Math.max(
        100,
        Math.ceil(
          Math.max(
            ...Object.values(agentData).map((agent) => agent.invocations)
          ) *
            1.2 /
            10
        ) *
          10
      )
    : 100;

  // Get prepared chart data if available
  const chartDataPrepared = prepareChartData();

  // Destructure shortLabels and fullLabels if available
  const shortLabels = chartDataPrepared ? chartDataPrepared.shortLabels : [];
  const fullLabels = chartDataPrepared ? chartDataPrepared.fullLabels : [];
  const durations = chartDataPrepared ? chartDataPrepared.durations : [];
  const invocations = chartDataPrepared ? chartDataPrepared.invocations : [];

  const chartData = {
    labels: shortLabels,
    datasets: [
      {
        type: "bar",
        label: "Invocations",
        backgroundColor: "rgba(208, 189, 244, 0.7)", // Transparent version of #d0bdf4
        borderColor: "#8458B3", // Border color for the bar
        borderWidth: 1,
        data: invocations,
        yAxisID: "y",
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      },
      {
        type: "line",
        label: "Duration (seconds)",
        borderColor: "#a28089", // Duration color
        borderWidth: 2,
        fill: false,
        data: durations,
        yAxisID: "y1",
        pointBackgroundColor: "#a28089", // Duration color for points
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#a28089", // Duration color on hover
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          // Use the full name on tooltip hover
          title: (tooltipItems) => {
            if (!fullLabels.length) return "";
            const index = tooltipItems[0].dataIndex;
            return fullLabels[index];
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 14,
          },
          padding: 10,
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        max: computedYMax, // Dynamic maximum for invocations
        title: {
          display: true,
          text: "Invocations",
          color: "#8458B3",
          font: {
            weight: "bold",
          },
        },
        grid: {
          borderDash: [2],
          drawBorder: false,
        },
        ticks: {
          padding: 10,
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Duration (seconds)",
          color: "#a28089",
          font: {
            weight: "bold",
          },
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          padding: 10,
        },
      },
    },
  };

  return (
    <Card>
      <MDBox padding="0.5">
        {error ? (
          <MDTypography variant="h6" color="error">
            {error}
          </MDTypography>
        ) : loading ? (
          <MDTypography variant="button" color="text">
            Loading...
          </MDTypography>
        ) : (
          <>
            {/* Chart Container */}
            <MDBox
              variant="gradient"
              bgColor="#a0d2eb"
              borderRadius="lg"
              coloredShadow="#a0d2eb"
              py={1}
              pr={0.5}
              mt={-5}
              height="16rem"
              display="flex"
              flexDirection="column"
            >
              <MDBox flex={1}>
                <Chart
                  type="bar"
                  data={chartData}
                  options={chartOptions}
                  height="100%"
                />
              </MDBox>
            </MDBox>

            {/* Info / Legend Section */}
            <MDBox pt={2} pb={0} px={1}>
              <MDTypography variant="h6" textTransform="capitalize">
                Agent Performance Metrics
              </MDTypography>
              <MDTypography
                component="div"
                variant="button"
                color="text"
                fontWeight="light"
              >
                Invocation count (bars) and processing duration (line) for all agents
              </MDTypography>
              <Divider />
              <MDBox display="flex" alignItems="center"></MDBox>
            </MDBox>
          </>
        )}
      </MDBox>
    </Card>
  );
}

export default DualAxisChart;
