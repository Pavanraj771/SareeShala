import os
import django
import shutil
import sys
from pathlib import Path

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SareeShala.settings')
django.setup()

from products.models import Product, Category

# Base directories
BASE_DIR = Path(__file__).resolve().parent
MEDIA_ROOT = BASE_DIR / 'media' / 'product_images'
ARTIFACT_DIR = Path(r"C:\Users\PAVAN RAJ\.gemini\antigravity\brain\bfa42050-2cb6-4c34-9b2f-c10cae02b216")

MEDIA_ROOT.mkdir(parents=True, exist_ok=True)

# Define the products to add
products_data = [
    {
        "name": "Stunning Red Banarasi Silk Saree",
        "description": "A stunning red Banarasi silk saree with intricate gold zari work. Perfect for weddings and grand occasions. Woven with authentic Banarasi techniques.",
        "price": "15500.00",
        "stock": 10,
        "main_image": "banarasi_red_1777628922763.png"
    },
    {
        "name": "Luxurious Gold Kanjeevaram Silk",
        "description": "A luxurious gold Kanjeevaram silk saree with rich temple borders and heavy pallu. Crafted in Kanchipuram with pure mulberry silk.",
        "price": "22000.00",
        "stock": 5,
        "main_image": "kanjeevaram_gold_1777628940521.png"
    },
    {
        "name": "Midnight Blue Chiffon Georgette",
        "description": "A flowy midnight blue Chiffon georgette saree with minimal silver border. Elegant and lightweight for evening parties.",
        "price": "4500.00",
        "stock": 25,
        "main_image": "chiffon_blue_1777628959596.png"
    },
    {
        "name": "Emerald Green Cotton Handloom",
        "description": "A traditional emerald green Cotton handloom saree with earthy motifs. Comfortable, breathable, and perfect for daily wear or casual outings.",
        "price": "2800.00",
        "stock": 30,
        "main_image": "cotton_green_1777628977811.png"
    },
    {
        "name": "Royal Purple Paithani Saree",
        "description": "A royal purple Paithani saree featuring peacock motifs on the pallu. Handwoven in Maharashtra with exquisite silk and gold threads.",
        "price": "18500.00",
        "stock": 8,
        "main_image": "paithani_purple_1777628994178.png"
    },
    {
        "name": "Multicolor Double Ikat Patola",
        "description": "A vibrant multicolor double Ikat Patola saree with geometric patterns. A masterpiece of traditional Gujarati weaving.",
        "price": "35000.00",
        "stock": 2,
        "main_image": "patola_multi_1777629010410.png"
    },
    {
        "name": "Pastel Pink Mysore Silk",
        "description": "A soft pastel pink Mysore silk saree with pure gold zari border. Minimalistic, buttery soft, and elegant for any occasion.",
        "price": "9500.00",
        "stock": 15,
        "main_image": "mysore_pink_1777629027090.png"
    },
    {
        "name": "Sheer Pastel Floral Organza",
        "description": "A sheer pastel Organza saree with delicate floral embroidery. Light, airy, and romantic aesthetic for modern wearers.",
        "price": "6800.00",
        "stock": 20,
        "main_image": "organza_floral_1777629049316.png"
    },
    {
        "name": "Rustic Beige Tussar Silk",
        "description": "A sophisticated beige Tussar silk saree with rustic tribal art border. Features rich earthy tones and a slightly textured feel.",
        "price": "8200.00",
        "stock": 12,
        "main_image": "tussar_beige_1777629073926.png"
    },
    {
        "name": "Yellow & Red Mirror Bandhani",
        "description": "A bright yellow and red Bandhani tie-dye saree with mirror work border. Festive and vibrant, perfect for celebrations.",
        "price": "5400.00",
        "stock": 18,
        "main_image": "bandhani_yellow_1777629093957.png"
    }
]

detail_images = [
    "detail_embroidery_1777629122058.png",
    "detail_border_1777629138029.png",
    "detail_pallu_1777629155418.png",
    "detail_drape_1777629175201.png"
]

# Ensure we have a general category
category, created = Category.objects.get_or_create(
    name="Exclusive Sarees",
    defaults={"description": "Our premium curated collection of beautiful sarees."}
)

def copy_image_to_media(image_filename, prefix=""):
    src_path = ARTIFACT_DIR / image_filename
    if not src_path.exists():
        print(f"Warning: {src_path} not found.")
        return None
    
    new_filename = f"{prefix}{image_filename}"
    dest_path = MEDIA_ROOT / new_filename
    shutil.copy2(src_path, dest_path)
    
    return f"product_images/{new_filename}"

print("Starting to seed products...")
count = 0
for item in products_data:
    print(f"Adding {item['name']}...")
    
    # Check if already exists to avoid duplicates if run multiple times
    if Product.objects.filter(name=item['name']).exists():
        print(f"  {item['name']} already exists. Skipping.")
        continue

    # Copy images
    img1_path = copy_image_to_media(item['main_image'], prefix="main_")
    img2_path = copy_image_to_media(detail_images[0], prefix=f"d1_{count}_")
    img3_path = copy_image_to_media(detail_images[1], prefix=f"d2_{count}_")
    img4_path = copy_image_to_media(detail_images[2], prefix=f"d3_{count}_")
    img5_path = copy_image_to_media(detail_images[3], prefix=f"d4_{count}_")

    product = Product.objects.create(
        name=item['name'],
        category=category,
        description=item['description'],
        price=item['price'],
        stock=item['stock'],
        image1=img1_path,
        image2=img2_path,
        image3=img3_path,
        image4=img4_path,
        image5=img5_path
    )
    count += 1

print(f"Successfully added {count} new products!")
