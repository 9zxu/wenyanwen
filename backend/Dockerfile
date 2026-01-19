FROM python:3.10-slim

# Sets the target folder. All subsequent commands happen here.
WORKDIR /app

RUN apt-get update && apt-get install -y build-essential

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# Copies everything from your local ./backend folder (where the Dockerfile is) into /app.
COPY . .

# Command to run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]