from django.core.management.base import BaseCommand

from users.domain.entities import Restaurant, User, UserRestaurant


class Command(BaseCommand):
    help = "Crea usuarios demo (admin, restaurante, cliente) y un restaurante de ejemplo."

    def handle(self, *args, **options):
        admin_username = "admin"
        admin_email = "admin@restosys.test"
        admin_password = "Admin123!"

        admin_user = User.objects.filter(username=admin_username).first()
        if not admin_user:
            admin_user = User.objects.create_superuser(
                username=admin_username,
                email=admin_email,
                password=admin_password,
            )
            self.stdout.write(self.style.SUCCESS("Admin creado"))
        else:
            self.stdout.write(self.style.WARNING("Admin ya existe"))
        admin_user.role = "admin"
        admin_user.full_name = "Administrador"
        admin_user.email = admin_email
        admin_user.save()

        restaurant, created_restaurant = Restaurant.objects.get_or_create(
            name="Restaurante Demo",
            defaults={"address": "Av. Principal 123"},
        )
        if created_restaurant:
            self.stdout.write(self.style.SUCCESS("Restaurante demo creado"))
        else:
            self.stdout.write(self.style.WARNING("Restaurante demo ya existe"))

        restaurante_username = "restaurante1"
        restaurante_email = "restaurante@restosys.test"
        restaurante_password = "Rest123!"
        restaurante_user = User.objects.filter(username=restaurante_username).first()
        if not restaurante_user:
            restaurante_user = User.objects.create_user(
                username=restaurante_username,
                email=restaurante_email,
                password=restaurante_password,
                role="restaurante",
                full_name="Restaurante Demo",
            )
            self.stdout.write(self.style.SUCCESS("Usuario restaurante creado"))
        else:
            self.stdout.write(self.style.WARNING("Usuario restaurante ya existe"))
            restaurante_user.role = "restaurante"
            restaurante_user.full_name = "Restaurante Demo"
            restaurante_user.email = restaurante_email
            restaurante_user.save()

        UserRestaurant.objects.get_or_create(user=restaurante_user, restaurant=restaurant)

        cliente_username = "cliente1"
        cliente_email = "cliente@restosys.test"
        cliente_password = "Cliente123!"
        cliente_user = User.objects.filter(username=cliente_username).first()
        if not cliente_user:
            User.objects.create_user(
                username=cliente_username,
                email=cliente_email,
                password=cliente_password,
                role="cliente",
                full_name="Cliente Demo",
            )
            self.stdout.write(self.style.SUCCESS("Usuario cliente creado"))
        else:
            self.stdout.write(self.style.WARNING("Usuario cliente ya existe"))

        self.stdout.write(self.style.SUCCESS("Seed completo"))
