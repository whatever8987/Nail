# salons/management/commands/seed_salons.py

import random
import json
# Use the standard library's timezone, aliased correctly
from datetime import timedelta, timezone as datetime_timezone # Kept import but won't need datetime_timezone.utc anymore
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils.text import slugify
from django.conf import settings
from faker import Faker
# Keep django.utils.timezone if you use its functions like now() or make_aware()
from django.utils import timezone # Still useful for other potential time operations, but timezone.utc is not used here
from django.db.utils import DataError

# Import your models - Salon and Template are needed, User if linking owners
from salons.models import Template, Salon
User = get_user_model() # Needed if assigning owners (though we won't be assigning them now)

# Initialize Faker
fake = Faker()

# --- Helper Functions with PostgreSQL-safe lengths ---
# Re-use the truncate function
def truncate(value, max_length):
    """Ensure value doesn't exceed PostgreSQL field length limits"""
    if value is None:
        return None
    # Attempt to handle potential non-string values gracefully
    try:
        value_str = str(value)
        return value_str[:max_length] if len(value_str) > max_length else value_str
    except:
        return value # Return original value if conversion fails

# Re-use the data generation helpers for Salon-specific fields
def generate_fake_services(num):
    services = []
    for _ in range(num):
        services.append({
            "name": truncate(fake.bs().title(), 100),
            "price": f"${random.randint(20, 150)}{random.choice(['', '+'])}",
            "description": truncate(fake.sentence(nb_words=random.randint(5, 15)), 200),
        })
    return services

def generate_fake_gallery_images(num):
    images = []
    for _ in range(num):
        # Use a different source or strategy if picsum has issues
        seed = truncate(fake.word() + str(random.randint(1,10000)), 50) # Add random element
        images.append(f'https://picsum.photos/seed/{seed}/600/400')
    return images

def generate_fake_testimonials(num):
    testimonials = []
    for _ in range(num):
        testimonials.append({
            "quote": truncate(fake.paragraph(nb_sentences=random.randint(2, 5)), 500),
            "client_name": truncate(fake.name(), 50),
            "client_title": truncate(fake.job(), 50) if random.random() < 0.5 else None,
            # Add other testimonial fields like rating, date if needed
        })
    return testimonials

def generate_fake_social_links():
    platforms = ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'Pinterest']
    links = []
    # Ensure uniqueness of platform within the generated links for one salon
    chosen_platforms = random.sample(platforms, random.randint(1, len(platforms)))
    for platform in chosen_platforms:
        links.append({
            "platform": truncate(platform, 20),
            "url": truncate(fake.url(), 200),
        })
    return links

# --- End Helper Functions ---

class Command(BaseCommand):
    help = 'Seeds the database with realistic dummy data for Salon models only, setting all to unclaimed.'

    def handle(self, *args, **options):
        num_salons = 50 # Number of salons to create

        self.stdout.write(self.style.SUCCESS('Starting database seeding (Salons only - All unclaimed)...'))

        # --- 1. Fetch existing Templates ---
        # We need these to link to the salons
        templates = list(Template.objects.all())
        # No need to fetch users if we are setting all to unclaimed

        if not templates:
            self.stdout.write(self.style.WARNING('No Templates found. Create some templates first (e.g., by running seed_templates).'))
            # Decide if you want to abort or continue creating salons without templates
            # return # Uncomment this line to abort if no templates exist

        # --- 2. Create Salons ---
        self.stdout.write(f'Creating {num_salons} Unclaimed Salons...')
        created_count = 0
        failed_count = 0

        # Remove the is_claimed variable as it's no longer random
        # Remove the logic for owner_to_assign and claimed_at_date calculation

        for i in range(num_salons):
            salon_name_base = fake.company()
            salon_name = truncate(
                f"{salon_name_base} {random.choice(['Nails', 'Spa', 'Studio', 'Beauty', 'Hair'])}",
                100 # Assuming max_length=100 for Salon name
            )
            # Add a random element to the name to increase uniqueness if not using get_or_create
            if Salon.objects.filter(name=salon_name).exists():
                 salon_name = truncate(f"{salon_name[:90]} {random.randint(10, 99)}", 100)


            location_city = truncate(fake.city(), 50) # Assuming max_length=50
            location_state = truncate(fake.state_abbr(), 10) # Assuming max_length=10

            # --- Hardcode claimed status to False and owner/claimed_at to None ---
            # is_claimed = False # No need for this variable, just set directly
            # owner_to_assign = None
            # claimed_at_date = None
            # --------------------------------------------------------------------

            # Select a random template if templates exist, otherwise None
            template_to_assign = random.choice(templates) if templates else None


            salon_data = {
                'name': salon_name,
                'location': truncate(f"{location_city}, {location_state}", 100), # Assuming max_length=100
                'address': truncate(fake.street_address(), 200), # Assuming max_length=200
                'phone_number': truncate(fake.phone_number(), 20), # Assuming max_length=20
                'email': truncate(fake.company_email(), 100), # Assuming max_length=100
                'description': truncate(fake.paragraph(nb_sentences=random.randint(3, 6)), 500), # Assuming max_length=500
                'hero_subtitle': truncate(fake.sentence(nb_words=random.randint(5, 10)).strip('.'), 200), # Assuming max_length=200
                'services_tagline': truncate(fake.sentence(nb_words=random.randint(6, 12)).strip('.'), 200), # Assuming max_length=200
                'gallery_tagline': truncate(fake.sentence(nb_words=random.randint(6, 12)).strip('.'), 200), # Assuming max_length=200
                'footer_about': truncate(fake.paragraph(nb_sentences=random.randint(1, 3)), 300), # Assuming max_length=300
                'booking_url': truncate(fake.url(), 200) if random.random() < 0.7 else None, # Assuming max_length=200, nullable
                'gallery_url': truncate(fake.url(), 200) if random.random() < 0.3 else None, # Assuming max_length=200, nullable
                'services_url': truncate(fake.url(), 200) if random.random() < 0.3 else None, # Assuming max_length=200, nullable
                 # Assuming map_embed_url is TextField or CharField with sufficient length
                'map_embed_url': truncate(SAMPLE_MAP_EMBED_URL, 500), # Adjust max_length if needed

                # Image fields - Assuming CharField storing URLs, max_length=255 or similar
                'image': 'media/default.png',
                'logo_image': truncate(fake.image_url() if random.random() < 0.9 else None, 255),
                'cover_image': truncate(fake.image_url() if random.random() < 0.8 else None, 255),
                'about_image': truncate(fake.image_url() if random.random() < 0.7 else None, 255),
                'footer_logo_image': truncate(fake.image_url() if random.random() < 0.2 else None, 255),


                # JSONFields - Ensure these match your model structure and serializer expectations
                # They will be stored as JSON strings in the DB
                'services': generate_fake_services(random.randint(5, 15)),
                'gallery_images': generate_fake_gallery_images(random.randint(4, 10)),
                'testimonials': generate_fake_testimonials(random.randint(3, 6)),
                'social_links': generate_fake_social_links() if random.random() < 0.9 else [],
                'opening_hours': truncate(SAMPLE_OPENING_HOURS, 500), # Assuming TextField or long CharField


                # Foreign Key - assign the Template object
                'template': template_to_assign,

                # --- Explicitly set unclaimed status ---
                'claimed': False,
                'claimed_at': None,
                # Set contact status to one of the *unclaimed* options
                'contact_status': random.choice(['notContacted', 'contacted', 'interested', 'notInterested']),

                # Foreign Key - Set owner to None
                'owner': None,
                # ---------------------------------------
            }

            try:
                with transaction.atomic(): # Use atomic block for each creation
                     salon = Salon.objects.create(**salon_data)
                     # Your model might handle slug generation automatically on save, which is good.
                     # No need for manual slug generation here if the model's save method handles it.

                     created_count += 1
                     # Update print statement to reflect that they are all unclaimed
                     self.stdout.write(f'  Created Salon ({created_count}/{num_salons}): {salon.name} (Claimed: False)')

            except Exception as e:
                 failed_count += 1
                 self.stdout.write(self.style.ERROR(f'  Failed to create salon {salon_name} ({failed_count} failures): {e}'))
                 # Log specific field errors if available, e.g. via Django's ValidationError if using forms/serializers


        # --- Final Report ---
        total_salons_after = Salon.objects.count()
        self.stdout.write(self.style.SUCCESS('\nDatabase seeding (Salons only) completed!'))
        self.stdout.write(self.style.SUCCESS(f'Salons created in this run: {created_count}'))
        self.stdout.write(self.style.SUCCESS(f'Salons failed to create: {failed_count}'))
        self.stdout.write(self.style.SUCCESS(f'Total Salons in DB: {total_salons_after}'))


# Constants (move these inside the file if they were outside)
SAMPLE_OPENING_HOURS = "Monday - Friday: 9:00 AM - 7:00 PM\nSaturday: 9:00 AM - 6:00 PM\nSunday: Closed"
SAMPLE_MAP_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.264387659134!2d-74.01283148459468!3d40.7484402793281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259bf5c1654f3%3A0x2c159c7f79a37921!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1645745845828!5m2!1sen!2sus"