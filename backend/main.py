import asyncio
import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile

app = FastAPI(title="PDF Analysis API")

# The detection code is intentionally retained, but disabled in production until
# its quality is good enough to expose to users again.
DETECTION_ENABLED = os.getenv("DETECTION_ENABLED", "false").lower() == "true"
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(20 * 1024 * 1024)))
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@app.get("/health")
async def health_check():
    return {"status": "ok", "automatic_detection_enabled": DETECTION_ENABLED}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Run the optional detector with safe temporary-file handling."""
    if not DETECTION_ENABLED:
        raise HTTPException(status_code=503, detail="Automatic detection is currently paused.")
    if file.content_type not in {"application/pdf", "application/x-pdf"}:
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    temporary_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(dir=UPLOAD_DIR, suffix=".pdf", delete=False) as temporary_file:
            temporary_path = Path(temporary_file.name)
            bytes_written = 0
            while chunk := await file.read(1024 * 1024):
                bytes_written += len(chunk)
                if bytes_written > MAX_UPLOAD_BYTES:
                    raise HTTPException(status_code=413, detail="The PDF is too large.")
                temporary_file.write(chunk)

        # Import only when the paused functionality is activated. This keeps the
        # production process light on the free Render instance.
        from pdf_processor import process_pdf

        results = await asyncio.to_thread(process_pdf, str(temporary_path))
        return {"filename": file.filename, "results": results}
    except HTTPException:
        raise
    except Exception:
        # Do not reveal parser or server internals to the public API.
        raise HTTPException(status_code=422, detail="This PDF could not be analysed.")
    finally:
        await file.close()
        if temporary_path:
            temporary_path.unlink(missing_ok=True)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
