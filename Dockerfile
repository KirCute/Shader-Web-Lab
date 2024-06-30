FROM python:3.12.4-slim

COPY dist /data
EXPOSE 8080
ENTRYPOINT ["python","-m","http.server","8080"]
