from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import shutil
import requests
import json
import time
import os
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

COMFYUI = "http://127.0.0.1:8000"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT_DIR = r"C:\Users\dushy\Documents\ComfyUI\input"

OUTPUT_DIR = os.path.join(BASE_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# serve output images
app.mount("/output", StaticFiles(directory=OUTPUT_DIR), name="output")

WORKFLOW_FILE = os.path.join(
    os.path.dirname(__file__),
    "workflow.json"
)


@app.post("/tryon")
async def tryon(
    person: UploadFile = File(...),
    shirt: str = Form(...)
):
    unique_id = str(uuid.uuid4())

    person_filename = f"person_{unique_id}.png"
    shirt_filename = f"shirt_{unique_id}.png"
    result_filename = f"result_{unique_id}.png"

    person_path = os.path.join(INPUT_DIR, person_filename)
    shirt_path = os.path.join(INPUT_DIR, shirt_filename)
    output_path = os.path.join(OUTPUT_DIR, result_filename)

    # Save person image
    with open(person_path, "wb") as f:
        shutil.copyfileobj(person.file, f)

    # Copy shirt
    shirt_source = os.path.join(BASE_DIR, "frontend/assets/shirts", shirt)
    shutil.copy(shirt_source, shirt_path)

    # Load workflow
    with open(WORKFLOW_FILE) as f:
        workflow = json.load(f)

    workflow["76"]["inputs"]["image"] = person_filename
    workflow["81"]["inputs"]["image"] = shirt_filename

    # Send to ComfyUI
    r = requests.post(f"{COMFYUI}/prompt", json={"prompt": workflow})
    prompt_id = r.json()["prompt_id"]

    # Wait
    while True:
        history = requests.get(f"{COMFYUI}/history/{prompt_id}").json()
        if prompt_id in history:
            break
        time.sleep(1)

    outputs = history[prompt_id]["outputs"]

    # get LAST image (important fix)
    final_image = None
    for node in outputs.values():
        images = node.get("images", [])
        if images:
            final_image = images[0]

    if final_image:
        filename = final_image["filename"]
        subfolder = final_image["subfolder"]

        img_url = f"{COMFYUI}/view?filename={filename}&subfolder={subfolder}"
        print("Final image URL:", img_url)
        img = requests.get(img_url)

        with open(output_path, "wb") as f:
            f.write(img.content)

    # cleanup
    try:
        os.remove(person_path)
        os.remove(shirt_path)
    except:
        pass

    return FileResponse(output_path, media_type="image/png")
