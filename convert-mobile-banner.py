# -*- coding: utf-8 -*-
from PIL import Image
import os

os.chdir('./public/Images')

input_file = 'banner-hero-mobile.png'
output_file = 'banner-hero-mobile.webp'

try:
    img = Image.open(input_file)
    print(f'Original size: {os.path.getsize(input_file) / 1024:.0f} KB')
    print(f'Dimensions: {img.size}')

    img.save(output_file, 'WEBP', quality=90)

    webp_size = os.path.getsize(output_file) / 1024
    print(f'WebP size: {webp_size:.0f} KB')
    print(f'[OK] Converted: {output_file}')

except Exception as e:
    print(f'[ERR] Error: {e}')
