import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import agentsData from "./agents.json"; // Ensure correct path

const AgentDetails = () => {
  const { name } = useParams();
  const [agent, setAgent] = useState(null);

  useEffect(() => {
    if (name) {
      const formattedName = decodeURIComponent(name);
      const selectedAgent = agentsData.find(
        (agent) => agent.agent_name.toLowerCase() === formattedName.toLowerCase()
      );
      setAgent(selectedAgent || null);
    }
  }, [name]);

  if (!agent) {
    return <p>Agent not found.</p>;
  }

  const getProgressBarColor = (index) => {
    const colors = ["#4caf50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0"]; // Add more colors as needed
    return colors[index % colors.length]; // Cycle through colors
  };
  return (
    <div style={styles.container}>
      {/* Agent Name (Title) */}
      <h2 style={styles.title}>{agent.agent_name} Agent</h2>

      {/* Description & Image */}
      <div style={styles.header}>
        <img
          src={agent.image || "/images/categorizer.png"}
          alt={agent.agent_name}
          style={styles.image}
        />
        <p style={styles.description}>{agent.description}</p>
      </div>
      {/* Three Containers (Description, Skills, Prompt) */}
      <div style={styles.boxContainer}>
        <div style={styles.box}>
          <img src={"/images/description.jpg"} alt={agent.agent_name} style={styles.boxImage} />
          <h3>{agent.agent_name} Description</h3>
          <p>{agent.long_description || "No detailed description available."}</p>
        </div>
        <div style={styles.box}>
          <img src={"/images/skill.jpg"} alt={agent.agent_name} style={styles.boxImage} />
          <h3>{agent.agent_name} Skills</h3>
          <p>{agent.skill || "No skills listed."}</p>
        </div>
        <div style={styles.box}>
          <img src={"/images/prompt.jpg"} alt={agent.agent_name} style={styles.boxImage} />
          <h3>{agent.agent_name} Prompt</h3>
          <p>{agent.prompt || "No prompt listed."}</p>
        </div>
      </div>

      {/* Key Skills Progress Bars */}
      <h3>Key Skills</h3>
      <div style={styles.progressContainer}>
        {agent.skills && agent.skills.length > 0 ? (
          agent.skills.map((skill, index) => (
            <div key={index} style={styles.progressBarContainer}>
              <span>{skill.label}</span>
              <div style={styles.progressBarBackground}>
                <div
                  style={{
                    ...styles.progressBar,
                    width: `${skill.value}%`,
                    backgroundColor: getProgressBarColor(index),
                  }}
                >
                  <span style={styles.progressText}>{skill.value}% </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No skill data available.</p>
        )}
      </div>

      <div style={styles.statsContainer}>
        {agent.stats && agent.stats.length > 0 ? (
          agent.stats.map((stat, index) => (
            <div key={index} style={styles.statBox}>
              <h2 style={styles.statNumber}>{stat.number}</h2>
              <p style={styles.statLabel}>{stat.label}</p>
            </div>
          ))
        ) : (
          <p>No stats available.</p>
        )}
      </div>

      {/* Back Link */}
      <br />
      <a href="/agents">Back to Agent List</a>
    </div>
  );
};

/* Styles */
const styles = {
  container: {
    width: "75%",
    margin: "auto",
    marginLeft: "290px", // Adjust left margin to prevent floating overlap
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "20px",
    flexDirection: "column", // Stack items vertically
    alignItems: "center", // Center-align them
  },
  description: {
    //maxWidth: "50%",
  },
  image: {
    width: "20%",
    height: "150px",
    borderRadius: "8px",
    alignItems: "center",
  },
  boxImage: {
    width: "90%",
    height: "150px",
    borderRadius: "8px",
    alignItems: "center",
  },
  boxContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
    color: "ffffff",
  },
  box: {
    width: "30%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#f9f9f9",
    fontSize: "14px",
  },
  progressContainer: {
    width: "80%",
    margin: "20px auto",
  },
  progressBarContainer: {
    textAlign: "left",
    marginBottom: "10px",
  },
  progressBarBackground: {
    width: "100%",
    height: "25px",
    backgroundColor: "#ddd",
    borderRadius: "5px",
    position: "relative",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#17a2b8",
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "bold",
  },
  progressText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    fontSize: "14px",
    color: "#fff",
  },

  statsContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "stretch",
    marginTop: "30px",
    width: "100%",
    gap: "10px",
  },

  statBox: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#ffffff",
    textAlign: "center",
    Width: "25vw",
    Height: "20vh",
  },

  statLabel: {
    fontSize: "16px",
    fontWeight: "normal",
    color: "#000",
    marginTop: "5px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    width: "100%",
  },

  statNumber: {
    fontSize: "38px",
    fontWeight: "bold",
    color: "#007bff",
  },
  /*statLabel: {
    fontSize: "16px",
    fontWeight: "normal",
    color: "#000", // Black color for the label
    marginTop: "5px",
  },*/
};

export default AgentDetails;
