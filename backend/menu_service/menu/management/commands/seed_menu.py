from decimal import Decimal
from django.core.management.base import BaseCommand

from menu.infrastructure.models import Category, Product, ProductOption


class Command(BaseCommand):
    help = "Crea categorias, productos y opciones demo para un restaurante."

    def add_arguments(self, parser):
        parser.add_argument(
            "--restaurant-id",
            dest="restaurant_id",
            type=int,
            default=1,
            help="ID del restaurante (int) para asociar el menu",
        )

    def handle(self, *args, **options):
        restaurant_id = options["restaurant_id"]

        categories_data = {
            "Entradas": [
                ("Tequenos", "6 unidades con salsa de ajo", Decimal("12.90")),
                ("Nachos clasicos", "Con guacamole y pico de gallo", Decimal("15.50")),
                ("Alitas BBQ", "8 unidades", Decimal("22.00")),
            ],
            "Platos fuertes": [
                ("Hamburguesa completa", "Carne 200g, queso, tocino", Decimal("24.90")),
                ("Lomo saltado", "Con papas fritas", Decimal("28.50")),
                ("Pasta al pesto", "Con pollo y parmesano", Decimal("23.00")),
            ],
            "Bebidas": [
                ("Limonada", "Vaso 400ml", Decimal("7.50")),
                ("Gaseosa", "Botella 500ml", Decimal("6.00")),
                ("Agua mineral", "Botella 500ml", Decimal("5.00")),
            ],
            "Postres": [
                ("Brownie", "Con helado", Decimal("12.00")),
                ("Cheesecake", "Porcion individual", Decimal("13.50")),
                ("Helado artesanal", "2 bolas", Decimal("9.50")),
            ],
        }

        created_categories = 0
        created_products = 0
        created_options = 0

        for category_name, products in categories_data.items():
            category, created = Category.objects.get_or_create(
                name=category_name,
                restaurant_id=restaurant_id,
            )
            if created:
                created_categories += 1

            for product_name, description, price in products:
                product, product_created = Product.objects.get_or_create(
                    name=product_name,
                    category=category,
                    defaults={
                        "price": price,
                        "description": description,
                        "restaurant_id": restaurant_id,
                    },
                )
                if not product_created:
                    product.price = price
                    product.description = description
                    product.restaurant_id = restaurant_id
                    product.save()
                else:
                    created_products += 1

                if product_name in ("Hamburguesa completa", "Pasta al pesto"):
                    for option_name, extra_price in (
                        ("Extra queso", Decimal("3.00")),
                        ("Extra tocino", Decimal("4.50")),
                    ):
                        _, opt_created = ProductOption.objects.get_or_create(
                            product=product,
                            name=option_name,
                            defaults={"extra_price": extra_price},
                        )
                        if opt_created:
                            created_options += 1

        self.stdout.write(self.style.SUCCESS("Seed menu completo"))
        self.stdout.write(
            self.style.SUCCESS(
                f"Categorias nuevas: {created_categories}, productos nuevos: {created_products}, opciones nuevas: {created_options}"
            )
        )
