# -*- coding: utf-8 -*-
from PIL import Image
import os

os.chdir('./public/Images')

# Remove background from manitinha images
for i in range(1, 5):
    input_file = f'manitinha-{i}.png'
    output_png = f'manitinha-{i}-nobg.png'
    output_webp = f'manitinha-{i}.webp'

    try:
        # Open image
        img = Image.open(input_file).convert('RGBA')
        data = img.getdata()

        # Get background color from corner pixel (top-left)
        bg_color = img.getpixel((0, 0))
        print(f'{input_file}: Background color = {bg_color}')

        # Create new image with transparency
        new_data = []
        for item in data:
            # If pixel is close to background color, make it transparent
            # Using tolerance of 30 for color matching
            if abs(item[0] - bg_color[0]) < 30 and \
               abs(item[1] - bg_color[1]) < 30 and \
               abs(item[2] - bg_color[2]) < 30:
                new_data.append((255, 255, 255, 0))  # Transparent
            else:
                new_data.append(item)

        img.putdata(new_data)

        # Save as PNG with transparency
        img.save(output_png, 'PNG')
        print(f'  [OK] Saved: {output_png}')

        # Convert to WebP with transparency
        img.save(output_webp, 'WEBP', quality=85)
        print(f'  [OK] Converted: {output_webp}')

    except Exception as e:
        print(f'  [ERR] Erro em {input_file}: {e}')

print('\n[DONE] Background removal complete!')
