from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import requests
import json
import time
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

COMFYUI = "http://127.0.0.1:8000"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

INPUT_DIR = os.path.join(BASE_DIR,"input")
INPUT_DIR = r"C:\Users\dushy\Documents\ComfyUI\input"
OUTPUT_FILE = os.path.join(BASE_DIR,"output","result.png")

WORKFLOW_FILE = os.path.join(os.path.dirname(__file__),"workflow.json")

@app.post("/tryon")
async def tryon(person: UploadFile = File(...),shirt: str = Form(...)):


    person_path = os.path.join(INPUT_DIR,"person.png")
    shirt_path = os.path.join(INPUT_DIR,"shirt.png")

    # save user image
    with open(person_path,"wb") as f:
        shutil.copyfileobj(person.file,f)

    # copy selected shirt image
    shirt_source = os.path.join(BASE_DIR,"frontend","assets","shirts",shirt)
    shutil.copy(shirt_source,shirt_path)

    # load workflow
    with open(WORKFLOW_FILE) as f:
        workflow = json.load(f)

    # inject images into nodes
    workflow["76"]["inputs"]["image"] = "person.png"
    workflow["81"]["inputs"]["image"] = "shirt.png"

    # send workflow to ComfyUI
    r = requests.post(
    f"{COMFYUI}/prompt",
    json={"prompt":workflow}
    )
    print(r.json())
    prompt_id = r.json()["prompt_id"]

    # wait until generation finishes
    while True:

        history = requests.get(
            f"{COMFYUI}/history/{prompt_id}"
        ).json()

        if prompt_id in history:
            break

        time.sleep(1)

    outputs = history[prompt_id]["outputs"]

    for node in outputs.values():

        images = node.get("images",[])

        if images:

            filename = images[0]["filename"]
            subfolder = images[0]["subfolder"]

            img_url = f"{COMFYUI}/view?filename={filename}&subfolder={subfolder}"

            img = requests.get(img_url)

            with open(OUTPUT_FILE,"wb") as f:
                f.write(img.content)

            break

    return FileResponse(OUTPUT_FILE)
