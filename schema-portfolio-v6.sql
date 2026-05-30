-- Migração v6: full page screenshots via ApiFlash (API mais confiável)

-- ApiFlash: full_page=true para capturar página inteira
-- width=1200 para desktop, width=375 para mobile

UPDATE portfolio SET
  image_url = 'https://api.apiflash.com/v1/urltoimage?access_key=FREE&url=https://bentesramoscrm.com.br&full_page=true&width=1200',
  image_mobile_url = 'https://api.apiflash.com/v1/urltoimage?access_key=FREE&url=https://bentesramoscrm.com.br&full_page=true&width=375'
WHERE title = 'CRM Bentes Ramos';

UPDATE portfolio SET
  image_url = 'https://api.apiflash.com/v1/urltoimage?access_key=FREE&url=https://sumaumaacium.com.br&full_page=true&width=1200',
  image_mobile_url = 'https://api.apiflash.com/v1/urltoimage?access_key=FREE&url=https://sumaumaacium.com.br&full_page=true&width=375'
WHERE title = 'CRM Suma Uma Acium';

UPDATE portfolio SET
  image_url = 'https://api.apiflash.com/v1/urltoimage?access_key=FREE&url=https://dravanessacosta.com&full_page=true&width=1200',
  image_mobile_url = 'https://api.apiflash.com/v1/urltoimage?access_key=FREE&url=https://dravanessacosta.com&full_page=true&width=375'
WHERE title = 'Dra. Vanessa Costa';

UPDATE portfolio SET
  image_url = 'https://api.apiflash.com/v1/urltoimage?access_key=FREE&url=https://fisiolasermanaus.com.br&full_page=true&width=1200',
  image_mobile_url = 'https://api.apiflash.com/v1/urltoimage?access_key=FREE&url=https://fisiolasermanaus.com.br&full_page=true&width=375'
WHERE title = 'Fisio Laser Manaus';

UPDATE portfolio SET
  image_url = 'https://api.apiflash.com/v1/urltoimage?access_key=FREE&url=https://ergofisiosaude.com.br&full_page=true&width=1200',
  image_mobile_url = 'https://api.apiflash.com/v1/urltoimage?access_key=FREE&url=https://ergofisiosaude.com.br&full_page=true&width=375'
WHERE title = 'Ergo Fisio Saúde';

UPDATE portfolio SET
  image_url = 'https://api.apiflash.com/v1/urltoimage?access_key=FREE&url=https://hildebrandoleite.com.br&full_page=true&width=1200',
  image_mobile_url = 'https://api.apiflash.com/v1/urltoimage?access_key=FREE&url=https://hildebrandoleite.com.br&full_page=true&width=375'
WHERE title = 'Hildebrand Leite';
