# -*- coding: utf-8 -*-
from PIL import Image
import os

os.chdir('./public/Images')

# Desktop - cortar so o lado direito (Manitinha + paineis, sem textos)
img = Image.open('banner-hero-2.png')
w, h = img.size
print(f'Desktop original: {w}x{h}')

# Textos ficam no lado esquerdo (~55%), cortar a partir de 48%
cut_x = int(w * 0.48)
cropped = img.crop((cut_x, 0, w, h))
print(f'Desktop cropped: {cropped.size}')
cropped.save('banner-hero-desktop-clean.webp', 'WEBP', quality=90)
print(f'[OK] banner-hero-desktop-clean.webp')

# Mobile - cortar so a parte de baixo (Manitinha), textos ficam em cima
img_m = Image.open('banner-hero-mobile.png')
w2, h2 = img_m.size
print(f'Mobile original: {w2}x{h2}')

# No mobile textos ficam no topo (~45%), pegar so de baixo
cut_y = int(h2 * 0.45)
cropped_m = img_m.crop((0, cut_y, w2, h2))
print(f'Mobile cropped: {cropped_m.size}')
cropped_m.save('banner-hero-mobile-clean.webp', 'WEBP', quality=90)
print(f'[OK] banner-hero-mobile-clean.webp')
