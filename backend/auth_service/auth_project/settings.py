import sys
import os
from pathlib import Path

# Agregar el directorio backend al path para poder importar 'shared'
# Esto permite que auth_service y menu_service compartan el módulo 'shared'
BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = str(BASE_DIR.parent)  # Esto apunta a /backend/
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-xgp=59ff8*(y8*@k-wpr@lpsh(pxt)h9fxsew5)pa3cke0@e)z'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'users',
    'rest_framework',
    'corsheaders',
    'django_celery_beat',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'auth_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'auth_project.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

# CQRS: Base de datos de ESCRITURA (Write Database)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DATABASE_NAME', 'auth_db'),
        'USER': os.environ.get('DATABASE_USER', 'admin'),
        'PASSWORD': os.environ.get('DATABASE_PASSWORD', '1234'),
        'HOST': os.environ.get('DATABASE_HOST', 'localhost'),
        'PORT': os.environ.get('DATABASE_PORT', '5432'),
    }
}

# CQRS: Base de datos de LECTURA (Read Database)
# Esta es una replica de solo lectura para consultas
DATABASES_READ = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DATABASE_READ_NAME', os.environ.get('DATABASE_NAME', 'auth_db')),
        'USER': os.environ.get('DATABASE_USER', 'admin'),
        'PASSWORD': os.environ.get('DATABASE_PASSWORD', '1234'),
        'HOST': os.environ.get('DATABASE_READ_HOST', os.environ.get('DATABASE_HOST', 'localhost')),
        'PORT': os.environ.get('DATABASE_READ_PORT', os.environ.get('DATABASE_PORT', '5432')),
    }
}

# Event Store: Base de datos para eventos (puede ser la misma o separada)
# Por defecto usamos la base de datos principal
EVENT_STORE_DB = 'default'


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'users.User'

CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=8),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
}

# ============================================
# CELERY CONFIGURATION
# ============================================
CELERY_BROKER_URL = 'amqp://guest:guest@rabbitmq:5672//'
CELERY_RESULT_BACKEND = 'redis://redis:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# Media files (imágenes subidas por usuarios)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')