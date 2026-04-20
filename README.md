1. git clone https://github.com/MRHELLBOY-DC/RestoSys.git
	-cd RestoSys
	-dir
	-cd backend
	- dir
2. levantar docker
	- asegurate de estar en la carpeta backend del proyecto 	clonado
	- asegurate de que tu docker desktop este abierto o 	corriendo
	-levantar docker: docker-compose up -d --build
	-verifica que este corriendo: docker-compose ps
	-por si hay errores: docker-compose logs --tail=30
3. migraciones de base de datos
	-migraciones de auth_service
		-docker exec -it RestoSys-auth-1 bash
		-python manage.py makemigrations users
		-python manage.py migrate
		-exit
	-migraciones de menu_service
		-docker exec -it RestoSys-menu-1 bash
		-python manage.py makemigrations menu
		-python manage.py migrate
		-exit
	-verificar que se aplicaron las migraciones
		-docker exec -it RestoSys-auth-1 bash -c "python manage.py showmigrations"
		-docker exec -it RestoSys-menu-1 bash -c "python manage.py showmigrations"
4. crear usuarios admin
	-docker exec -it RestoSys-auth-1 bash
	-python manage.py createsuperuser
		-aqui despues de ejecutar te pedira username, email, password, repetir password
	-exit
5. levantar frontend
	-entrar a la carpeta frontend desde terminal
	-yarn install
	-yarn dev
