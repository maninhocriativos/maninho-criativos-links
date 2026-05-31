const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = './public/Images';
const files = ['manitinha-1.png', 'manitinha-2.png', 'manitinha-3.png', 'manitinha-4.png'];

(async () => {
  for (const file of files) {
    try {
      const inputPath = path.join(dir, file);
      const outputPath = path.join(dir, file.replace('.png', '.webp'));

      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(outputPath);

      console.log(`✅ Convertido: ${file} → ${path.basename(outputPath)}`);
    } catch (err) {
      console.error(`❌ Erro: ${file} - ${err.message}`);
    }
  }
  console.log('\n✅ Conversão completa!');
})();
