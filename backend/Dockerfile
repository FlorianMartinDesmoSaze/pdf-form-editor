FROM python:3.12-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 UPLOAD_DIR=/tmp/pdf-uploads DETECTION_ENABLED=false MAX_UPLOAD_BYTES=20971520

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py pdf_processor.py ./
RUN mkdir -p /tmp/pdf-uploads

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
