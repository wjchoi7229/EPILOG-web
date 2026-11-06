# Deployment example (gunicorn + nginx)

This is a generic example. Adapt paths, user names and host names to your environment.

## 1. Install

```bash
python3 -m venv /srv/epilog/venv
/srv/epilog/venv/bin/pip install -r requirements.txt gunicorn
```

## 2. Configure

Set the environment variables described in the README, for example in a systemd environment file:

```
DJANGO_SECRET_KEY=<a long random value>
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=example.org
EPILOG_DB_PATH=/srv/epilog/epilepsy_db.sqlite3
EPILOG_STRUCTURE_DIR=/srv/epilog/af2result
```

Collect the static files and check the configuration:

```bash
python manage.py collectstatic --noinput
python manage.py check --deploy
```

## 3. gunicorn (systemd)

```ini
[Unit]
Description=EPILOG web application
After=network.target

[Service]
User=epilog
WorkingDirectory=/srv/epilog/app
EnvironmentFile=/srv/epilog/epilog.env
ExecStart=/srv/epilog/venv/bin/gunicorn prj_epilepsy.wsgi:application --bind 127.0.0.1:8000 --workers 3
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## 4. nginx

```nginx
server {
    listen 80;
    server_name example.org;

    location /static/ {
        alias /srv/epilog/app/staticfiles/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable HTTPS (for example with Certbot) and then set `CSRF_TRUSTED_ORIGINS` and the secure-cookie options in an untracked
`prj_epilepsy/local_settings.py`.
