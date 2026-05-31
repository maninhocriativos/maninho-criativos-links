# -*- coding: utf-8 -*-
from PIL import Image
import os, glob

folder = './public/Images/Fotos para o serviço de ensaio fotografico com ia'
os.chdir(folder)

# Find PNGs and JPGs that don't have a WebP yet
files = glob.glob('*.png') + glob.glob('*.jpg') + glob.glob('*.jpeg')
converted = 0

for f in sorted(files):
    base = os.path.splitext(f)[0]
    out = base + '.webp'
    if os.path.exists(out):
        print(f'[SKIP] {f} -> already exists')
        continue
    try:
        img = Image.open(f).convert('RGB')
        # Resize to max 800px wide keeping aspect ratio
        w, h = img.size
        if w > 800:
            img = img.resize((800, int(h * 800 / w)), Image.LANCZOS)
        img.save(out, 'WEBP', quality=85)
        orig_kb = os.path.getsize(f) // 1024
        new_kb  = os.path.getsize(out) // 1024
        print(f'[OK] {f} ({orig_kb}KB) -> {out} ({new_kb}KB)')
        converted += 1
    except Exception as e:
        print(f'[ERR] {f}: {e}')

print(f'\n{converted} novas imagens convertidas.')
