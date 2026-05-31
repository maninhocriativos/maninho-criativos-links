# -*- coding: utf-8 -*-
from PIL import Image
import os, shutil, glob

src_dir = './public/Images/Fotos para o serviço de ensaio fotografico com ia'
dst_dir = './public/ensaio'

# Pegar todos os WebP da pasta de imagens novas
new_webps = sorted([
    f for f in glob.glob(os.path.join(src_dir, '*.webp'))
])

print(f'Encontradas {len(new_webps)} imagens WebP novas')

# Descobrir o proximo numero sequencial
existing = glob.glob(os.path.join(dst_dir, 'foto-*.webp'))
next_num = max([int(f.split('foto-')[1].replace('.webp','')) for f in existing], default=0) + 1

print(f'Proxima numeracao: foto-{next_num}.webp')
print()

added = []
for webp_path in new_webps:
    dst_name = f'foto-{next_num}.webp'
    dst_path = os.path.join(dst_dir, dst_name)
    shutil.copy2(webp_path, dst_path)
    print(f'[OK] {os.path.basename(webp_path)} -> {dst_name}')
    added.append((next_num, os.path.basename(webp_path)))
    next_num += 1

total = next_num - 1
print(f'\nTotal de fotos no carrossel agora: {total}')
print(f'Primeiros novos: foto-23.webp | Ultimo: foto-{total}.webp')

# Gerar SQL para o portfolio
print('\n--- SQL PARA O PORTFOLIO ---')
for num, orig in added:
    print(f"INSERT INTO portfolio (title, category, description, image_url, is_active) VALUES ('Ensaio com IA #{num}', 'Ensaio Fotográfico', 'Ensaio fotográfico premium com inteligência artificial.', '/ensaio/foto-{num}.webp', 1);")
