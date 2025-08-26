FROM python:3.11-slim
WORKDIR /app

COPY services/common/requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt

COPY services/common/common /app/common
COPY services/feed/main.py /app/main.py

ENV PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
