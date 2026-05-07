FROM python:3.10-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Create dummy manage.py if it doesn't exist to prevent crash initially
RUN echo "import os\nimport sys\nif __name__ == '__main__':\n    print('Run django-admin startproject first')\n" > manage.py

COPY . .

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
