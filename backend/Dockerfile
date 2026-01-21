FROM python:3.11-slim

# All subsequent commands happen here.
WORKDIR /app

RUN apt-get update && apt-get install -y build-essential

# load uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY requirements.txt .

ENV UV_EXTRA_INDEX_URL=https://download.pytorch.org/whl/cpu

# RUN uv pip install --system --no-cache -r requirements.txt
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system -r requirements.txt


# Copies everything from your local ./backend folder (where the Dockerfile is) into /app.
COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
