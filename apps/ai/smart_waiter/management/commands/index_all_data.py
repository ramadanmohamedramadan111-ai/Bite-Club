from django.core.management.base import BaseCommand

from smart_waiter.services.indexer import SmartWaiterIndexer


class Command(BaseCommand):
    help = "Index all Smart Waiter searchable data into the vector store."

    def add_arguments(self, parser):
        parser.add_argument(
            "--restaurant-id",
            type=int,
            default=None,
            help="Refresh only one restaurant instead of rebuilding the full index.",
        )

    def handle(self, *args, **options):
        indexer = SmartWaiterIndexer()
        restaurant_id = options.get("restaurant_id")

        if restaurant_id:
            count = indexer.refresh_restaurant(restaurant_id)
            self.stdout.write(self.style.SUCCESS(f"Refreshed restaurant {restaurant_id} with {count} documents."))
            return

        counts = indexer.index_all()
        self.stdout.write(self.style.SUCCESS(f"Indexed Smart Waiter data: {counts}"))
