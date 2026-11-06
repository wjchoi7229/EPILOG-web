"""Django settings for the EPILOG web application.

Deployment-specific values are read from environment variables (see README.md) or from an
optional, untracked ``prj_epilepsy/local_settings.py``.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def _env_bool(name, default):
    return os.environ.get(name, str(default)).strip().lower() in ('1', 'true', 'yes', 'on')


SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-dev-only-placeholder')
DEBUG = _env_bool('DJANGO_DEBUG', False)
ALLOWED_HOSTS = [h.strip() for h in os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',') if h.strip()]

INSTALLED_APPS = [
    'web_epilepsy.apps.WebEpilepsyConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'prj_epilepsy.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'prj_epilepsy.wsgi.application'

# SQLite database (not distributed with the code; see README.md)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': Path(os.environ.get('EPILOG_DB_PATH', BASE_DIR / 'epilepsy_db.sqlite3')),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Seoul'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
DATA_UPLOAD_MAX_MEMORY_SIZE = 20971520

# Directory with the predicted structure files served by the viewer:
#   <EPILOG_STRUCTURE_DIR>/<GENE>/<GENE>_<VARIANT>/ranked_0.pdb  and  <GENE>/<GENE>_wild/ranked_0.pdb
# Optional per-gene files: ranked_0_plddt.csv, ranked_0_pae_downsampled_t200.json
_STRUCTURE_DIR = os.environ.get('EPILOG_STRUCTURE_DIR', str(BASE_DIR / 'data' / 'af2result')).rstrip('/\\') + '/'
EPILEPSY_DIR = {
    'local': [
        _STRUCTURE_DIR,  # 0 (unused)
        _STRUCTURE_DIR,  # 1 (unused)
        _STRUCTURE_DIR,  # 2 variant structures
        _STRUCTURE_DIR,  # 3 (unused)
        _STRUCTURE_DIR,  # 4 (unused)
        _STRUCTURE_DIR,  # 5 wild-type structures
    ]
}
EPILEPSY_ENV = 'local'
AF2_MODELS_TO_SERVE = 1

# Optional: untracked local overrides
try:
    from .local_settings import *  # noqa: F401,F403
except ImportError:
    pass
