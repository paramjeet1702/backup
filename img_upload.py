from fastapi import FastAPI, File, HTTPException, UploadFile, Form
from fastapi.responses import JSONResponse, FileResponse
import shutil
import os

app = FastAPI()

# Define the directory where images will be saved
UPLOAD_DIR = "agent_configuration"

# Endpoint to upload the image
@app.post("/upload_image/")
async def upload_image(user:str = Form(...), image_name: str = Form(...), file: UploadFile = File(...)):
    try:
        os.makedirs(f"{UPLOAD_DIR}/{user}", exist_ok=True)
        # Get the file extension
        file_extension = file.filename.split('.')[-1]
        # Create a path for the saved file
        file_path = os.path.join(f"{UPLOAD_DIR}/{user}", f"{image_name}.{file_extension}")
        
        # Save the uploaded file locally
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        return JSONResponse(content={"message": f"{user}/{image_name}.{file_extension}"}
                            , status_code=200)
    
    except Exception as e:
        return JSONResponse(content={"message": f"Error: {str(e)}"}, status_code=500)



# @app.get("image/{user}/{img_path}")
# async def get_image(user: str, img_path: str):
#     # Define the base directory where the 'agent_configuration' folder is located
#     base_dir = os.path.join(os.getcwd(), "agent_configuration", user)
    
#     # Construct the full path to the requested image
#     img_full_path = os.path.join(base_dir, img_path)
    
#     # Debugging: Print the full image path
#     print(f"Looking for image at: {img_full_path}")
    
#     # Check if the file exists
#     if not os.path.isfile(img_full_path):
#         raise HTTPException(status_code=404, detail="Image not found")
    
#     return FileResponse(img_full_path)


@app.get("/image/{user}/{img_path}")
async def get_image(user: str, img_path: str):
    # Define the base directory where the 'agent_configuration' folder is located
    base_dir = os.path.join(os.getcwd(), "agent_configuration", user)
    
    # List of common image file extensions
    image_extensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    
    # Check if any of the image files with extensions exist
    img_full_path = None
    for ext in image_extensions:
        possible_path = os.path.join(base_dir, img_path + ext)
        if os.path.isfile(possible_path):
            img_full_path = possible_path
            break
    
    # If no matching file is found, raise a 404 error
    if img_full_path is None:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Return the image if it is found
    return FileResponse(img_full_path)



