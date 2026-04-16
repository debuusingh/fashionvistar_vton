from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
import uuid, os, shutil, json, asyncio
import httpx
from datetime import datetime

app = FastAPI()

COMFYUI = "http://127.0.0.1:8000"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT_DIR = r"C:\Users\dushy\Documents\ComfyUI\input"
WORKFLOW_FILE = os.path.join(
    os.path.dirname(__file__),
    "workflow.json"
)


@app.post("/tryon")
async def tryon(
    person: UploadFile = File(...),
    shirt: str = Form(...),
    gender: str = Form(...)
):
    unique_id = str(uuid.uuid4())

    person_filename = f"person_{unique_id}.png"
    cloth_filename = f"cloth_{unique_id}.png"

    person_path = os.path.join(INPUT_DIR, person_filename)
    cloth_path = os.path.join(INPUT_DIR, cloth_filename)

    # ✅ Save person (required for ComfyUI)
    with open(person_path, "wb") as f:
        shutil.copyfileobj(person.file, f)

    # ✅ Select cloth
    if gender.lower() == "female":
        cloth_source = os.path.join(BASE_DIR, "assets/women", shirt)
    elif gender.lower() == "male":
        cloth_source = os.path.join(BASE_DIR, "assets/man", shirt)
    else:
        raise ValueError("Invalid gender")

    shutil.copy(cloth_source, cloth_path)

    # ✅ Load workflow
    with open(WORKFLOW_FILE) as f:
        workflow = json.load(f)

    workflow["76"]["inputs"]["image"] = person_filename
    workflow["81"]["inputs"]["image"] = cloth_filename
    
    print(datetime.now(), "Workflow prepared, sending to ComfyUI...")

    async with httpx.AsyncClient(timeout=60.0) as client:

        # 🚀 Send prompt
        r = await client.post(f"{COMFYUI}/prompt", json={"prompt": workflow})
        prompt_id = r.json()["prompt_id"]
        print(datetime.now(), f"Prompt sent, received prompt_id: {prompt_id}. Waiting for results...")

        # 🚀 Smart polling (faster + less CPU)
        while True:
            history = await client.get(f"{COMFYUI}/history/{prompt_id}")
            history_json = history.json()

            if prompt_id in history_json:
                break

            await asyncio.sleep(0.2)  # optimized delay
        print(datetime.now(), "Results ready, fetching output...")

        outputs = history_json[prompt_id]["outputs"]

        final_image = None
        for node in outputs.values():
            images = node.get("images", [])
            if images:
                final_image = images[0]

        if not final_image:
            return {"error": "No image generated"}

        filename = final_image["filename"]
        subfolder = final_image["subfolder"]

        img_url = f"{COMFYUI}/view?filename={filename}&subfolder={subfolder}"

        print(datetime.now(), f"Final image URL: {img_url}. Streaming image...")
        
        # 🚀 STREAM IMAGE DIRECTLY (NO SAVE)
        img_response = await client.get(img_url)
        print(datetime.now(), "Image fetched, streaming response...")
        return StreamingResponse(
            content=img_response.aiter_bytes(),
            media_type="image/jpeg"   # 🔥 use jpeg for speed
        )
        
