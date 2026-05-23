# RestoSys Monorepo

Este archivo permite levantar todo el proyecto desde la raíz del repositorio.

## Requisitos

- Docker Desktop abierto.
- Puertos libres: `5173`, `8000`, `8001`, `8002`, `5432`, `5433`, `5434`, `5672`, `15672`.

## Levantar todo

```powershell
cd C:\Users\herma\Desktop\restosys\RestoSys
docker-compose up -d --build
docker-compose ps
```

## Migraciones Django

```powershell
docker-compose exec auth python manage.py makemigrations users
docker-compose exec auth python manage.py migrate
docker-compose exec menu python manage.py makemigrations menu
docker-compose exec menu python manage.py migrate
```

## Crear superusuario

```powershell
docker-compose exec auth python manage.py createsuperuser
```

## URLs

- Frontend: http://localhost:5173
- Auth API: http://localhost:8000
- Menu API: http://localhost:8001
- Orders API: http://localhost:8002
- RabbitMQ panel: http://localhost:15672

## Bases de datos

- `db-auth`: `auth_db`, puerto local `5432`.
- `db-menu`: `menu_db`, puerto local `5433`.
- `db-orders`: `orders_db`, puerto local `5434`.

RabbitMQ usa `guest` / `guest`.

## Ver tablas

```powershell
docker-compose exec db-auth psql -U admin -d auth_db -c "\dt"
docker-compose exec db-menu psql -U admin -d menu_db -c "\dt"
docker-compose exec db-orders psql -U admin -d orders_db -c "\dt"
```

## Ver usuarios

```powershell
docker-compose exec db-auth psql -U admin -d auth_db -c "SELECT id, username, email, role, is_active FROM users_user;"
```

## Logs

```powershell
docker-compose logs --tail=30
docker-compose logs -f auth
docker-compose logs -f menu
docker-compose logs -f orders
docker-compose logs -f frontend
```

## Apagar

```powershell
docker-compose down
```

Para borrar también las bases de datos y volúmenes:

```powershell
docker-compose down -v
```
