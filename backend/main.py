from fileinput import filename

from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import JSONResponse
import uuid, os, shutil, json, asyncio
import httpx
from datetime import datetime
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Mount ComfyUI's output folder
COMFYUI_OUTPUT = r"C:\Users\dushy\Documents\ComfyUI\output"
app.mount("/comfy-output", StaticFiles(directory=COMFYUI_OUTPUT), name="comfy-output")

COMFYUI = "http://127.0.0.1:8000"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT_DIR = r"C:\Users\dushy\Documents\ComfyUI\input"
WORKFLOW_FILE = os.path.join(os.path.dirname(__file__), "workflow.json")

# Hostinger endpoint to receive the final image
HOSTINGER_SAVE_URL = "https://fashionvistar.com/save_result.php"   # <-- REPLACE

async def run_comfyui_and_upload(person_path: str, cloth_path: str, request_id: str):
    try:
        # Load workflow (same as before)
        with open(WORKFLOW_FILE) as f:
            workflow = json.load(f)
        workflow["76"]["inputs"]["image"] = os.path.basename(person_path)
        workflow["81"]["inputs"]["image"] = os.path.basename(cloth_path)

        async with httpx.AsyncClient(timeout=120.0) as client:
            # ComfyUI is local HTTP, no SSL issues
            r = await client.post(f"{COMFYUI}/prompt", json={"prompt": workflow})
            prompt_id = r.json()["prompt_id"]
            print(datetime.now(), f"Prompt {prompt_id} for request {request_id}")

            # Wait for completion (same polling)
            while True:
                history = await client.get(f"{COMFYUI}/history/{prompt_id}")
                history_json = history.json()
                if prompt_id in history_json:
                    break
                await asyncio.sleep(0.5)

            outputs = history_json[prompt_id]["outputs"]
            final_image = None
            for node in outputs.values():
                images = node.get("images", [])
                if images:
                    final_image = images[0]
                    break

            if not final_image:
                raise Exception("No image generated")

            filename = final_image["filename"]
            subfolder = final_image["subfolder"]
            img_url = f"{COMFYUI}/view?filename={filename}&subfolder={subfolder}"
            img_response = await client.get(img_url)
            img_bytes = img_response.content

        # ===== Upload to Hostinger with SSL verification disabled =====
        # Use a separate client with verify=False to bypass expired certificate
        # async with httpx.AsyncClient(timeout=30.0, verify=False) as upload_client:
        #     files = {"image": ("result.jpg", img_bytes, "image/jpeg")}
        #     data = {"request_id": request_id}
        #     await upload_client.post(HOSTINGER_SAVE_URL, data=data, files=files)

        print(datetime.now(), f"Uploaded result for request {request_id}")
        return  filename

    except Exception as e:
        print(f"Background job failed for {request_id}: {e}")
        # Optionally inform Hostinger of the error (also with verify=False)
        try:
            async with httpx.AsyncClient(verify=False) as error_client:
                await error_client.post(HOSTINGER_SAVE_URL, data={"request_id": request_id, "error": str(e)})
        except:
            print("Could not report error to Hostinger")
            
@app.post("/tryon")
async def tryon(
    background_tasks: BackgroundTasks,
    person: UploadFile = File(...),
    shirt: str = Form(...),
    gender: str = Form(...)
):
    request_id = str(uuid.uuid4())

    # Save person image (either uploaded or default)
    person_filename = f"person_{request_id}.png"
    person_path = os.path.join(INPUT_DIR, person_filename)
    with open(person_path, "wb") as f:
        shutil.copyfileobj(person.file, f)

    # Determine cloth image path
    if gender.lower() == "female":
        cloth_source = os.path.join(BASE_DIR, "assets/women", shirt)
    else:
        cloth_source = os.path.join(BASE_DIR, "assets/man", shirt)

    cloth_filename = f"cloth_{request_id}.png"
    cloth_path = os.path.join(INPUT_DIR, cloth_filename)
    shutil.copy(cloth_source, cloth_path)

    # Start background task
    # background_tasks.add_task(run_comfyui_and_upload, person_path, cloth_path, request_id)

    # return JSONResponse(content={"request_id": request_id})
    image_name = await run_comfyui_and_upload(person_path, cloth_path,request_id)
    image_url =  f"https://lustiness-patriarch-figure.ngrok-free.dev/comfy-output/{image_name}"

    
    

    return JSONResponse(content={"image_url": image_url})
