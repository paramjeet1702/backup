from fastapi import FastAPI
from server import app as app1
from users import app as app2
from img_upload import app as app3
from admin import app as app4

app = FastAPI()

# Mount the two apps without changing their internal endpoints.
app.mount("/app1", app1)
app.mount("/app2", app2)
app.mount("/app3", app3)
app.mount("/app4", app4)

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("main:app", host="0.0.0.0", port=8125, reload=False)
