from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the Pydantic model for the request body
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str

# Function to check if username and password exist in the database
def check_credentials(username: str, password: str) -> bool:
    conn = sqlite3.connect('admin.db')
    cursor = conn.cursor()
    
    # Query to check if the username and password exist in the admin table
    cursor.execute('''
        SELECT * FROM admin WHERE username = ? AND password = ?
    ''', (username, password))
    
    result = cursor.fetchone()
    conn.close()
    
    return result is not None

# Function to register a new admin user
def register_admin(username: str, password: str) -> bool:
    conn = sqlite3.connect('admin.db')
    cursor = conn.cursor()
    
    # Check if username already exists
    cursor.execute('''
        SELECT * FROM admin WHERE username = ?
    ''', (username,))
    existing_user = cursor.fetchone()
    if existing_user:
        conn.close()
        return False  # Username already exists
    
    # Insert the new admin user into the database
    cursor.execute('''
        INSERT INTO admin (username, password)
        VALUES (?, ?)
    ''', (username, password))
    conn.commit()
    conn.close()
    
    return True

# Endpoint to verify user credentials
@app.post("/admin-signin")
def login(credentials: LoginRequest):
    # Check if the credentials exist in the database
    exists = check_credentials(credentials.username, credentials.password)
    
    if exists:
        return {"message": True}
    else:
        return {"message": False}

# Endpoint to register a new admin
@app.post("/admin-signup")
def register(credentials: RegisterRequest):
    # Register the new admin
    success = register_admin(credentials.username, credentials.password)
    
    if success:
        return {"message": True}
    else:
        return {"message": False}
