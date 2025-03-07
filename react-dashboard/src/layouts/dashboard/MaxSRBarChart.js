// src/layouts/dashboard/components/MaxSRBarChart.js
import React, { useEffect, useState, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useTheme } from "@mui/material/styles";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MaxSRBarChart = () => {
  const theme = useTheme();
  const { palette, typography, shape, shadows } = theme;
  const [chartData, setChartData] = useState(null);

  /**
   * Generate a unique, matte HSL color based on the agent's name.
   * The colors are less saturated and lighter for a matte appearance.
   * Adjust the lightness for the hover state.
   */
  const getColorFromAgentName = (agentName, hover = false) => {
    let hash = 0;
    for (let i = 0; i < agentName.length; i++) {
      hash = agentName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360; // Hue between 0 and 359
    const saturation = 50; // Lower saturation for a matte finish
    const lightness = hover ? 50 : 60; // Matte colors: slightly darker on hover
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://172.178.112.88:8125/app1/api/agents/max-sr");
        if (!response.ok) throw new Error("Error fetching data");
        const data = await response.json();
        if (data.data) {
          // Use full agent names for labels
          const labels = data.data.map((item) => item.agent_name);
          const values = data.data.map((item) => item.max_sr_number);
          const agentNames = data.data.map((item) => item.agent_name);

          const backgroundColors = agentNames.map((name) => getColorFromAgentName(name, false));
          const hoverBackgroundColors = agentNames.map((name) => getColorFromAgentName(name, true));

          setChartData({
            labels,
            datasets: [
              {
                label: "Max SR Number",
                data: values,
                backgroundColor: backgroundColors,
                hoverBackgroundColor: hoverBackgroundColors,
                borderRadius: 4,
                borderSkipped: false,
                maxBarThickness: 20, // Reduced bar thickness
                // Storing agent names for tooltip callback
                agentNames: agentNames,
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching max sr data:", error);
      }
    };

    fetchData();
  }, [theme]);

  const options = useMemo(
    () => ({
      indexAxis: "y", // Horizontal bar chart
      layout: {
        padding: { top: 20, right: 20, bottom: 20, left: 20 },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const agentNames = context.dataset.agentNames;
              const agentName = agentNames ? agentNames[context.dataIndex] : "";
              const value = context.dataset.data[context.dataIndex];
              return `${agentName}: ${value}`;
            },
          },
          backgroundColor: palette.background.paper,
          titleColor: palette.text.primary,
          bodyColor: palette.text.secondary,
          borderWidth: 1,
          borderColor: palette.divider,
          cornerRadius: 4,
        },
        legend: { display: false },
      },
      scales: {
        x: {
          title: {
            display: true,
            color: palette.text.primary,
            font: { family: typography.fontFamily, size: 14, weight: 500 },
          },
          beginAtZero: true,
          max: 100, // Extend the x-axis to 100
          ticks: {
            color: palette.text.secondary,
            font: { family: typography.fontFamily },
          },
          grid: { display: false }, // Remove vertical grid lines
        },
        y: {
          position: "left", // Shift the y-axis to the right side
          categoryPercentage: 0.5,
          title: {
            display: true,
            color: palette.text.primary,
            font: { family: typography.fontFamily, size: 14, weight: 500 },
          },
          ticks: {
            color: palette.text.secondary,
            font: { family: typography.fontFamily },
            autoSkip: false, // Ensure full agent names are displayed
          },
          grid: { display: false }, // Remove horizontal grid lines
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    }),
    [palette, typography]
  );

  return (
    <MDBox
      sx={{
        backgroundColor: palette.background.paper,
        borderRadius: shape.borderRadius,
        boxShadow: shadows[3],
        mt: 4,
      }}
    >
      <MDBox p={2}>
        <MDTypography variant="h6" fontWeight="medium" color="textPrimary">
          Agents Invoked
        </MDTypography>
      </MDBox>
      <MDBox sx={{ height: "400px", p: 2 }}>
        {chartData ? <Bar data={chartData} options={options} /> : "Loading..."}
      </MDBox>
    </MDBox>
  );
};

export default MaxSRBarChart;
