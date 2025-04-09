import os
import shutil
import sqlite3
import logging
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi import status


# Initialize FastAPI app
app = FastAPI()

# Set up basic logging
logging.basicConfig(level=logging.INFO)

# CORS config (optional)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configs
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

DB_NAME = "images.db"

# Initialize DB with 'name' and 'file_path'
def init_db():
    try:
        with sqlite3.connect(DB_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS images (
                    name TEXT PRIMARY KEY,
                    file_path TEXT NOT NULL
                )
            """)
            conn.commit()
            logging.info("Database initialized successfully.")
    except Exception as e:
        logging.error(f"Error initializing database: {e}")
        raise HTTPException(status_code=500, detail="Database initialization failed.")

init_db()

# 📤 Upload image with a custom name
@app.post("/upload-image/")
async def upload_image(
    name: str = Form(...), 
    file: UploadFile = File(...),
):
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files are allowed.")

        # Save new image with the username and file extension
        file_extension = file.filename.split('.')[-1]
        save_path = os.path.join(UPLOAD_DIR, f"{name}.{file_extension}")

        # Check if the user has already uploaded an image and if so, delete the old image
        with sqlite3.connect(DB_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT file_path FROM images WHERE name = ?", (name,))
            result = cursor.fetchone()

            if result:
                # If the image exists, delete the old file from disk
                old_file_path = result[0]
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)

                # Delete the old record from the DB
                cursor.execute("DELETE FROM images WHERE name = ?", (name,))
                conn.commit()

        # Save the new image to disk
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Insert new record into the database
        with sqlite3.connect(DB_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO images (name, file_path) VALUES (?, ?)",
                (name, save_path)
            )
            conn.commit()

        return JSONResponse({
            "message": "Image uploaded successfully, old image replaced if exists.",
            "name": name,
            "file_path": save_path
        })

    except Exception as e:
        logging.error(f"Error in /upload-image/: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during image upload.")

@app.get("/image/")
def get_image_by_name(name: str = Query(..., description="Custom name of the uploaded image")):
    try:
        with sqlite3.connect(DB_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT file_path FROM images WHERE name = ?", (name,))
            result = cursor.fetchone()

            if result and os.path.exists(result[0]):
                return FileResponse(path=result[0])
            else:
                raise HTTPException(status_code=404, detail="Image not found.")
    except Exception as e:
        logging.error(f"Error in /image/: {e}")
        raise HTTPException(status_code=500, detail="Internal server error when fetching image.")

@app.delete("/delete-image/")
def delete_image(name: str = Query(..., description="Custom name of the image to delete")):
    try:
        with sqlite3.connect(DB_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT file_path FROM images WHERE name = ?", (name,))
            result = cursor.fetchone()

            if not result:
                raise HTTPException(status_code=404, detail="Image not found in database.")

            file_path = result[0]

            # Delete the file from disk if it exists
            if os.path.exists(file_path):
                os.remove(file_path)
            else:
                raise HTTPException(status_code=404, detail="Image file not found on disk.")

            # Delete from DB
            cursor.execute("DELETE FROM images WHERE name = ?", (name,))
            conn.commit()

        return JSONResponse(
            {"message": f"Image '{name}' deleted successfully."},
            status_code=status.HTTP_200_OK
        )
    except Exception as e:
        logging.error(f"Error in /delete-image/: {e}")
        raise HTTPException(status_code=500, detail="Internal server error when deleting image.")
