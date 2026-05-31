import { createRequire } from 'module';
import { readdirSync, mkdirSync } from 'fs';
import { join, extname, basename } from 'path';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const SRC = "g:/Meu Drive/Maninho Criati/página de links maninhos/public/Images/Fotos para o serviço de ensaio fotografico com ia";
const OUT = "g:/Meu Drive/Maninho Criati/página de links maninhos/public/ensaio";

mkdirSync(OUT, { recursive: true });

const files = readdirSync(SRC).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

let i = 1;
for (const file of files) {
  const input  = join(SRC, file);
  const output = join(OUT, `foto-${i}.webp`);
  try {
    await sharp(input)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(output);
    console.log(`✓ foto-${i}.webp  ←  ${file}`);
    i++;
  } catch(e) {
    console.error(`✗ ${file}: ${e.message}`);
  }
}
console.log(`\nTotal: ${i-1} imagens convertidas para WebP`);
