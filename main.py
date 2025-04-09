from fastapi import FastAPI
from server import app as app1
from users import app as app2
from img_upload import app as app3
from admin import app as app4
from comcast_db import app as app5
from admin_img import app as app6
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Mount the two apps without changing their internal endpoints.
app.mount("/app1", app1)
app.mount("/app2", app2)
app.mount("/app3", app3)
app.mount("/app4", app4)
app.mount("/app5", app5)
app.mount("/app6", app6)

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("main:app", host="0.0.0.0", port=8125, reload=False)
