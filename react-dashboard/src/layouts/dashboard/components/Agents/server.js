const fs = require('fs');
const path = require('path');

// Define the path to agents.json
const agentsFilePath = path.join('src', 'layouts', 'dashboard', 'components', 'Agents', 'agents.json');

// Function to save a new agent to agents.json
const saveAgent = (agentName) => {
    // Read the current content of agents.json
    fs.readFile(agentsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading agents.json:', err);
            return;
        }

        let agents = JSON.parse(data); // Parse the JSON content
        // Add the new agent
        agents.push({ "agent_name": agentName });

        // Write the updated data back to the agents.json file
        fs.writeFile(agentsFilePath, JSON.stringify(agents, null, 2), (err) => {
            if (err) {
                console.error('Error writing to agents.json:', err);
            } else {
                console.log('Agent added successfully!');
            }
        });
    });
};

// Example usage of the saveAgent function
saveAgent('New Agent');
