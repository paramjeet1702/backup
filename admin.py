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


def get_all_admins():
    conn = sqlite3.connect('admin.db')
    cursor = conn.cursor()

    # Fetch all admin users
    cursor.execute('SELECT username FROM admin')
    admins = [row[0] for row in cursor.fetchall()]

    conn.close()
    return admins


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

def delete_admin(username: str) -> bool:
    conn = sqlite3.connect('admin.db')
    cursor = conn.cursor()

    # Check if the user exists
    cursor.execute('SELECT * FROM admin WHERE username = ?', (username,))
    existing_user = cursor.fetchone()
    
    if not existing_user:
        conn.close()
        return False  # Username does not exist

    # Delete the admin user
    cursor.execute('DELETE FROM admin WHERE username = ?', (username,))
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


@app.delete("/admin-delete")
def delete_admin_user(username: str):
    success = delete_admin(username)
    
    if success:
        return {"message": True}
    else:
        return {"message": False}



@app.get("/admin-list")
def get_admins():
    admins = get_all_admins()
    return {"admins": admins}