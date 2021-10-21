FROM python:alpine

RUN mkdir /srv/app
COPY . /srv/app
WORKDIR /srv/app

RUN pip install flask flask_session
ENTRYPOINT ["python", "app.py"]
