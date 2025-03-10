# from fastapi import FastAPI
# import sqlite3
# from fastapi.middleware.cors import CORSMiddleware


# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# def get_agent_logs():
#     conn = sqlite3.connect("../txt/AgenticAI/Comcast_Demo/Langgraph_code/agents_log.db")
#     cursor = conn.cursor()
#     cursor.execute("SELECT id, agent_name, duration FROM agent_logs;")
#     rows = cursor.fetchall()
#     conn.close()
    
#     agent_data = {}
#     for id, agent_name, duration in rows:
#         if agent_name not in agent_data:
#             agent_data[agent_name] = {"id": id, "total_duration": 0, "count": 0}
        
#         if id > agent_data[agent_name]["id"]:
#             agent_data[agent_name]["id"] = id
        
#         agent_data[agent_name]["total_duration"] += duration
#         agent_data[agent_name]["count"] += 1
    
#     # Compute average duration
#     for agent_name in agent_data:
#         agent_data[agent_name] = {
#             "id": agent_data[agent_name]["id"],
#             "duration": round(agent_data[agent_name]["total_duration"] / agent_data[agent_name]["count"],2)
#         }
    
#     return agent_data


# def get_agent_names():
#     conn = sqlite3.connect("../txt/AgenticAI/Comcast_Demo/Langgraph_code/agents_log.db")
#     cursor = conn.cursor()
#     cursor.execute("SELECT DISTINCT agent_name FROM agent_logs;")  # Use DISTINCT to get unique agent names
#     rows = cursor.fetchall()
#     conn.close()

#     # Extract agent names from the rows (which are tuples)
#     unique_agent_names = [row[0] for row in rows]
#     return unique_agent_names

# @app.get("/agents")
# def get_agents():
#     return get_agent_names()

# @app.get("/grouped_agents")
# def read_agents():
#     return get_agent_logs()


import sqlite3
import re
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow CORS and JSON body parsing so your React app can call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_short_form(agent_name):
    if agent_name.endswith("_agent"):
        agent_name = agent_name[:-6]  # Remove '_agent'
    
    # Split the name by underscores
    parts = agent_name.split('_')
    
    if agent_name == "human_feedback_oh":
        return "HF"
    
    short_form = ''.join([part[:3].upper() for part in parts])
    
    return short_form


# Open the SQLite database in read/write mode (mimicking sqlite3.OPEN_READWRITE)
try:
    db = sqlite3.connect('file:../txt/AgenticAI/Comcast_Demo/Langgraph_code/agents_log.db?mode=rw', uri=True, check_same_thread=False)

    logging.info("Connected to the SQLite database.")
except sqlite3.Error as e:
    logging.error("Error opening database: " + str(e))

# Set row_factory to return dictionary-like rows
db.row_factory = sqlite3.Row




# Model for agent endpoints
class Agent(BaseModel):
    agent_name: str


# GET endpoint to fetch agents
@app.get("/api/agents")
def get_agents():
    try:
        cursor = db.execute("SELECT sr_number, agent_name, start_timestamp, stop_timestamp FROM agent_logs")
        rows = cursor.fetchall()
        data = [dict(row) for row in rows]
        return {"data": data}
    except sqlite3.Error as e:
        logging.error("Error querying agents: " + str(e))
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/api/grouped_agents")
def get_grouped_agents():
    try:
        cursor = db.execute("SELECT sr_number, agent_name, duration FROM agent_logs")
        rows = cursor.fetchall()
        
        agent_data = {}
        
        for sr_number, agent_name, duration in rows:
            # Ensure duration is not None, and if it is, treat it as 0
            if duration is None:
                duration = 0
            
            if agent_name not in agent_data:
                agent_data[agent_name] = {"id": sr_number, "total_duration": 0, "count": 0}
            
            if sr_number > agent_data[agent_name]["id"]:
                agent_data[agent_name]["id"] = sr_number
            
            agent_data[agent_name]["total_duration"] += duration
            agent_data[agent_name]["count"] += 1
        
        # Compute average duration and add short form
        for agent_name in agent_data:
            short_form = get_short_form(agent_name)  # Ensure this function is defined somewhere
            agent_data[agent_name] = {
                "id": agent_data[agent_name]["id"],
                "duration": round(agent_data[agent_name]["total_duration"] / agent_data[agent_name]["count"], 2),
                "short_form": short_form
            }
        
        return {"data": agent_data}  # Wrap the response in a consistent format
    
    except sqlite3.Error as e:
        logging.error("Error querying agents: " + str(e))
        raise HTTPException(status_code=500, detail=str(e))




# GET endpoint to fetch unique agent names with their max id
@app.get("/api/agents/max-sr")
def get_agents_max_sr():
    try:
        cursor = db.execute("SELECT agent_name, MAX(sr_number) AS max_id FROM agent_logs GROUP BY agent_name")
        rows = cursor.fetchall()
        data = [dict(row) for row in rows]

        def getShortForm(name):
            # Split at capital letters, take the first letter of each part, and return the uppercase short form.
            parts = re.split('(?=[A-Z])', name)
            parts = [p for p in parts if p]  # filter out empty strings
            return ''.join([p[0] for p in parts]).upper()

        # Add short_name to each row
        for row in data:
            row["short_name"] = getShortForm(row["agent_name"])
        return {"data": data}
    except sqlite3.Error as e:
        logging.error("Error querying max id for agents: " + str(e))
        raise HTTPException(status_code=500, detail=str(e))


# POST endpoint to add an agent
@app.post("/api/agents")
def add_agent(agent: Agent):
    if not agent.agent_name:
        raise HTTPException(status_code=400, detail="agent_name is required")
    try:
        cursor = db.execute(
            "INSERT INTO agent_logs (agent_name, start_time) VALUES (?, datetime('now'))",
            (agent.agent_name,)
        )
        db.commit()
        return {"data": {"id": cursor.lastrowid, "agent_name": agent.agent_name}}
    except sqlite3.Error as e:
        logging.error("Error adding agent: " + str(e))
        raise HTTPException(status_code=500, detail=str(e))


# DELETE endpoint to remove an agent by name
@app.delete("/api/agents")
def delete_agent(agent: Agent):
    if not agent.agent_name:
        raise HTTPException(status_code=400, detail="agent_name is required")
    try:
        cursor = db.execute("DELETE FROM agent_logs WHERE agent_name = ?", (agent.agent_name,))
        db.commit()
        return {"data": {"agent_name": agent.agent_name, "changes": cursor.rowcount}}
    except sqlite3.Error as e:
        logging.error("Error removing agent: " + str(e))
        raise HTTPException(status_code=500, detail=str(e))


# Global exception logging similar to Node's process.on events
@app.exception_handler(Exception)
def global_exception_handler(request, exc):
    logging.error("Unhandled Exception: " + str(exc))
    return HTTPException(status_code=500, detail="Internal Server Error")


