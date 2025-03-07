const fs = require('fs');
const path = require('path');

const agentsFilePath = path.join(__dirname, 'agents.json');

module.exports = (req, res) => {
    const agents = req.body;

    fs.writeFile(agentsFilePath, JSON.stringify(agents, null, 2), (err) => {
        if (err) {
            return res.status(500).send('Unable to write to agents file');
        }

        res.status(200).send({ message: 'Agents updated successfully' });
    });
};