# -*- coding: utf-8 -*-
from PIL import Image
import os

os.chdir('./public/Images')

files = {
    'ChatGPT Image 30 de mai. de 2026, 17_47_34 (1).png': 'hero-desktop-clean.webp',
    'ChatGPT Image 30 de mai. de 2026, 17_47_34 (2).png': 'hero-mobile-clean.webp',
}

for src, dst in files.items():
    try:
        img = Image.open(src)
        print(f'{src}')
        print(f'  Dimensoes: {img.size}')
        print(f'  Original: {os.path.getsize(src) / 1024:.0f} KB')
        img.save(dst, 'WEBP', quality=90)
        print(f'  WebP: {os.path.getsize(dst) / 1024:.0f} KB')
        print(f'  [OK] -> {dst}')
    except Exception as e:
        print(f'  [ERR] {e}')
