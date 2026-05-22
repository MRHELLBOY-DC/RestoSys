Proyecto: Menu Digital (microservicios)

Requisitos
- Docker Desktop
- Node.js 18+ (solo si quieres correr el frontend fuera de Docker)

Estructura
- docker-compose.yml en la raiz (levanta todo: auth, menu, orders, frontend, dbs, rabbitmq, redis)
- backend/docker-compose.yml (opcional si solo quieres backend)

Levantar todo con Docker (recomendado)
1) Clonar el repo
   git clone https://github.com/MRHELLBOY-DC/RestoSys.git
   cd RestoSys

2) Levantar servicios
   docker-compose up -d --build

3) Verificar estado
   docker-compose ps
   docker-compose logs --tail=50

Migraciones (Django)
1) Auth service
   docker exec -it RestoSys-auth-1 bash
   python manage.py makemigrations users
   python manage.py migrate
   exit

2) Menu service
   docker exec -it RestoSys-menu-1 bash
   python manage.py makemigrations menu
   python manage.py migrate
   exit

3) Verificar migraciones (opcional)
   docker exec -it RestoSys-auth-1 bash -c "python manage.py showmigrations"
   docker exec -it RestoSys-menu-1 bash -c "python manage.py showmigrations"

Crear usuario admin (Django)
   docker exec -it RestoSys-auth-1 bash
   python manage.py createsuperuser
   exit


Frontend sin Docker (opcional)
1) cd frontend
2) npm install
3) npm run dev

Notas rapidas
- Si necesitas reiniciar todo: docker-compose down -v (borra volumnes y datos)
- Para ver logs de un servicio: docker-compose logs -f auth|menu|orders|frontend
