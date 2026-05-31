# -*- coding: utf-8 -*-
from PIL import Image
import os
import sys

os.chdir('./public/Images')

for i in range(1, 5):
    input_file = f'manitinha-{i}.png'
    output_file = f'manitinha-{i}.webp'

    try:
        img = Image.open(input_file)
        img.save(output_file, 'WEBP', quality=85)
        print(f'Convertido: {input_file} -> {output_file}', file=sys.stdout)
    except Exception as e:
        print(f'Erro em {input_file}: {e}', file=sys.stdout)

print('Conversao completa!')
