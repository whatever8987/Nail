# core/management/commands/seed_db.py

import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction # To run all creations in one transaction
from django.utils.text import slugify

from faker import Faker

# Import your models from other apps
from salons.models import Template, Salon
from blog.models import BlogPost, BlogComment
from payments.models import SubscriptionPlan
# from core.models import Stats # Not usually seeded directly

# Get the User model
User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with realistic dummy data for testing and development.'

    # Optional: Add arguments (e.g., how many users/salons to create)
    # def add_arguments(self, parser):
    #     parser.add_argument('--users', type=int, default=10, help='Number of users to create')
    #     parser.add_argument('--salons', type=int, default=20, help='Number of salons to create')
    #     parser.add_argument('--posts', type=int, default=15, help='Number of blog posts to create')

    @transaction.atomic # Ensure all or nothing gets created
    def handle(self, *args, **options):
        # Retrieve argument values (if defined)
        # num_users = options['users']
        # num_salons = options['salons']
        # num_posts = options['posts']
        # Use fixed numbers for simplicity in this example:
        num_users = 15
        num_salons = 30
        num_posts = 25
        num_comments_per_post = 5

        # Initialize Faker
        fake = Faker()
        # Use specific locales if needed, e.g., Faker('en_US')

        self.stdout.write(self.style.SUCCESS('Starting database seeding...'))

        # --- 0. Clean Slate (Optional - Use with Caution!) ---
        # Uncomment these lines ONLY if you want to delete existing data first
        # self.stdout.write('Deleting existing data...')
        # BlogComment.objects.all().delete()
        # BlogPost.objects.all().delete()
        # Salon.objects.all().delete()
        # Template.objects.all().delete()
        # SubscriptionPlan.objects.all().delete()
        # User.objects.filter(is_superuser=False, is_staff=False).delete() # Keep admin/staff users

        # --- 1. Create Templates ---
        self.stdout.write('Creating Templates...')
        template_names = ["Elegant", "Modern", "Luxury", "Friendly", "Minimalist", "Artistic", "Vibrant", "Dark Mode", "Natural", "Classic"]
        templates = []
        for name in template_names:
            template, created = Template.objects.get_or_create(
                name=name,
                defaults={
                    'description': fake.sentence(nb_words=10),
                    'preview_image_url': f'https://picsum.photos/seed/{slugify(name)}/600/400',
                    'features': fake.json(data_columns={'feature': 'word', 'desc': 'sentence'}, num_rows=random.randint(2, 4)),
                    'is_mobile_optimized': True
                }
            )
            templates.append(template)
            if created: self.stdout.write(f'  Created Template: {name}')

        if not templates:
            self.stdout.write(self.style.ERROR('Could not create or find Templates. Aborting seed.'))
            return

        # --- 2. Create Subscription Plans ---
        self.stdout.write('Creating Subscription Plans...')
        plans_data = [
            {"name": "Basic", "price_cents": 7900, "stripe_price_id": "price_basic_fake", "trial_days": 14, "is_popular": True},
            {"name": "Premium", "price_cents": 14900, "stripe_price_id": "price_premium_fake", "trial_days": 14},
            {"name": "Luxury", "price_cents": 23900, "stripe_price_id": "price_luxury_fake", "trial_days": 14},
        ]
        plans = []
        for data in plans_data:
            plan, created = SubscriptionPlan.objects.get_or_create(
                stripe_price_id=data['stripe_price_id'], # Use stripe_id as unique key
                defaults={
                    'name': data['name'],
                    'description': fake.sentence(nb_words=8),
                    'price_cents': data['price_cents'],
                    'currency': 'usd',
                    'features': fake.json(data_columns={'feature': 'word'}, num_rows=random.randint(3, 5)),
                    'trial_period_days': data['trial_days'],
                    'is_active': True,
                    'is_popular': data.get('is_popular', False)
                }
            )
            plans.append(plan)
            if created: self.stdout.write(f'  Created Plan: {data["name"]}')

        # --- 3. Create Users (including Admins/Staff if needed) ---
        self.stdout.write(f'Creating {num_users} Users...')
        users = []

        # Ensure at least one admin exists (if not created via createsuperuser)
        admin_user, created = User.objects.get_or_create(
            username='admin_seed',
            defaults={
                'email': 'admin_seed@example.com',
                'first_name': 'Admin',
                'last_name': 'Seeded',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
             admin_user.set_password('password') # Set a default password
             admin_user.save()
             self.stdout.write(f'  Created Seed Admin: admin_seed (pw: password)')
        users.append(admin_user)

        # Create regular users
        for _ in range(num_users - len(users)): # Adjust count based on existing/created admins
            first_name = fake.first_name()
            last_name = fake.last_name()
            username = f'{first_name.lower()}_{last_name.lower()}{random.randint(1, 99)}'
            email = fake.email()
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': first_name,
                    'last_name': last_name,
                    'role': 'user',
                    'phone_number': fake.phone_number(),
                    'is_staff': False,
                    'is_superuser': False,
                }
            )
            if created:
                user.set_password('password') # Set a default password
                user.save()
                self.stdout.write(f'  Created User: {username} (pw: password)')
            users.append(user)


        # --- 4. Create Salons ---
        self.stdout.write(f'Creating {num_salons} Salons...')
        salons = []
        contact_statuses = [choice[0] for choice in Salon.CONTACT_STATUS_CHOICES]
        for i in range(num_salons):
            salon_name = f"{fake.company()} {random.choice(['Nails', 'Spa', 'Studio', 'Nail Bar', 'Salon'])}"
            location_city = fake.city()
            location_state = fake.state_abbr()
            is_claimed = random.random() < 0.3 # ~30% chance of being claimed
            owner = random.choice(users) if is_claimed else None

            # Use update_or_create to avoid issues if script run multiple times
            # Need a unique field to check against, sample_url is good AFTER first save
            # Let's just create for simplicity here, assuming clean slate or checking name/location
            salon = Salon.objects.create(
                name=salon_name,
                location=f"{location_city}, {location_state}",
                address=fake.street_address(),
                phone_number=fake.phone_number(),
                email=fake.company_email(),
                description=fake.paragraph(nb_sentences=3),
                services=fake.json(data_columns={'service': 'bs', 'price': 'random_int'}, num_rows=random.randint(3, 8)),
                opening_hours=f"Mon-Fri: 9am-7pm\nSat: 10am-5pm\nSun: {random.choice(['Closed', '11am-4pm'])}",
                template=random.choice(templates),
                owner=owner,
                claimed=is_claimed,
                claimed_at=fake.past_datetime(start_date='-1y') if is_claimed else None,
                contact_status=random.choice(contact_statuses) if not is_claimed else 'subscribed', # Claimed salons likely subscribed
            )
            # sample_url is generated on save
            salons.append(salon)
            self.stdout.write(f'  Created Salon: {salon.name} (Claimed: {is_claimed})')

        # --- 5. Create Blog Posts ---
        self.stdout.write(f'Creating {num_posts} Blog Posts...')
        posts = []
        categories = [choice[0] for choice in BlogPost.CATEGORY_CHOICES]
        for _ in range(num_posts):
            title = fake.sentence(nb_words=random.randint(5, 10)).replace('.', '')
            publish_status = random.random() < 0.8 # 80% published
            publish_date = fake.past_datetime(start_date='-2y') if publish_status else None
            post = BlogPost.objects.create(
                title=title,
                # slug generated on save
                content='\n\n'.join(fake.paragraphs(nb=random.randint(5, 15))),
                excerpt=fake.paragraph(nb_sentences=2),
                cover_image=f'https://picsum.photos/seed/{slugify(title)}/800/400',
                author=random.choice(users), # Assign a random author
                category=random.choice(categories),
                tags=fake.json(data_columns={'tag': 'word'}, num_rows=random.randint(2, 5)),
                published=publish_status,
                featured=random.random() < 0.2, # 20% featured
                published_at=publish_date,
            )
            posts.append(post)
            self.stdout.write(f'  Created Post: {post.title} (Published: {publish_status})')

        if not posts:
             self.stdout.write(self.style.WARNING('No blog posts created, skipping comments.'))
        else:
             # --- 6. Create Blog Comments ---
             self.stdout.write(f'Creating Blog Comments...')
             for post in posts:
                 for _ in range(random.randint(1, num_comments_per_post)):
                     # Decide if comment is from registered user or guest
                     is_guest = random.random() < 0.4
                     commenter_user = random.choice(users) if not is_guest else None
                     commenter_name = fake.name() if is_guest else None
                     commenter_email = fake.email() if is_guest else None

                     BlogComment.objects.create(
                         post=post,
                         user=commenter_user,
                         name=commenter_name,
                         email=commenter_email,
                         content=fake.paragraph(nb_sentences=random.randint(1, 4)),
                         approved=random.random() < 0.75 # 75% approved
                     )
                 self.stdout.write(f'  Added comments to Post: {post.title}')

        # --- 7. Final Report ---
        self.stdout.write(self.style.SUCCESS('--------------------'))
        self.stdout.write(self.style.SUCCESS(f'Templates: {Template.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Plans: {SubscriptionPlan.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Users: {User.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Salons: {Salon.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Blog Posts: {BlogPost.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'Blog Comments: {BlogComment.objects.count()}'))
        self.stdout.write(self.style.SUCCESS('Database seeding completed!'))