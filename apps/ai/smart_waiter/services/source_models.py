from django.db import models


class RestaurantCategory(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    slug = models.CharField(max_length=255, blank=True, default="")
    image_url = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        db_table = "restaurant_categories"
        managed = False
        app_label = "smart_waiter"


class RestaurantSetting(models.Model):
    id = models.BigAutoField(primary_key=True)
    restaurant_id = models.BigIntegerField(db_index=True)
    is_open = models.BooleanField(default=False)
    accept_orders = models.BooleanField(default=False)
    delivery_enabled = models.BooleanField(default=False)
    pickup_enabled = models.BooleanField(default=False)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    delivery_radius = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    delivery_fee_per_km = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    min_price_order = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "restaurant_settings"
        managed = False
        app_label = "smart_waiter"


class Restaurant(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255, blank=True, default="")
    phone_number = models.CharField(max_length=255, blank=True, default="")
    category_id = models.BigIntegerField(null=True, blank=True)
    description = models.TextField(blank=True, default="")
    logo_url = models.CharField(max_length=255, blank=True, default="")
    cover_image_url = models.CharField(max_length=255, blank=True, default="")
    address = models.TextField(blank=True, default="")
    status = models.CharField(max_length=64, blank=True, default="")
    average_rating = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    reviews_count = models.IntegerField(default=0)
    total_orders_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "restaurants"
        managed = False
        app_label = "smart_waiter"


class MenuCategory(models.Model):
    id = models.BigAutoField(primary_key=True)
    restaurant_id = models.BigIntegerField(db_index=True)
    title = models.CharField(max_length=255)
    icon_name = models.CharField(max_length=255, blank=True, default="")
    short_description = models.TextField(blank=True, default="")
    visibility = models.CharField(max_length=64, blank=True, default="")
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "menu_categories"
        managed = False
        app_label = "smart_waiter"


class MenuItem(models.Model):
    id = models.BigAutoField(primary_key=True)
    menu_category_id = models.BigIntegerField(db_index=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    image_url = models.CharField(max_length=255, blank=True, default="")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    availability = models.CharField(max_length=64, blank=True, default="")
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "items"
        managed = False
        app_label = "smart_waiter"


class RestaurantReview(models.Model):
    id = models.BigAutoField(primary_key=True)
    restaurant_id = models.BigIntegerField(db_index=True)
    user_id = models.BigIntegerField(null=True, blank=True)
    rating = models.IntegerField(default=0)
    comment = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "restaurant_reviews"
        managed = False
        app_label = "smart_waiter"


class Post(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id = models.BigIntegerField(null=True, blank=True)
    restaurant_id = models.BigIntegerField(db_index=True)
    order_id = models.BigIntegerField(null=True, blank=True)
    caption = models.TextField(blank=True, default="")
    status = models.CharField(max_length=64, blank=True, default="")
    likes_count = models.IntegerField(default=0)
    copy_count = models.IntegerField(default=0)
    published_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "posts"
        managed = False
        app_label = "smart_waiter"


class Cart(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id = models.BigIntegerField(unique=True, db_index=True)
    restaurant_id = models.BigIntegerField(db_index=True)
    group_order_id = models.BigIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "carts"
        managed = False
        app_label = "smart_waiter"


class CartItem(models.Model):
    id = models.BigAutoField(primary_key=True)
    cart_id = models.BigIntegerField(db_index=True)
    item_id = models.BigIntegerField(db_index=True)
    item_name = models.CharField(max_length=255)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "cart_items"
        managed = False
        app_label = "smart_waiter"


class Order(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id = models.BigIntegerField(db_index=True)
    restaurant_id = models.BigIntegerField(db_index=True)
    order_type = models.CharField(max_length=32)
    status = models.CharField(max_length=64)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    service_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "orders"
        managed = False
        app_label = "smart_waiter"


class OrderItem(models.Model):
    id = models.BigAutoField(primary_key=True)
    order_id = models.BigIntegerField(db_index=True)
    item_id = models.BigIntegerField(db_index=True)
    item_name = models.CharField(max_length=255)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "order_items"
        managed = False
        app_label = "smart_waiter"
