-- Migração v4: adiciona image_mobile_url + screenshots reais

ALTER TABLE portfolio ADD COLUMN image_mobile_url TEXT DEFAULT '';

-- Atualiza projetos com screenshots reais desktop + mobile
-- Para desktop: width=1000, para mobile: width=420

UPDATE portfolio SET
  image_url = 'https://image.thum.io/get/width/1000/https://bentesramoscrm.com.br',
  image_mobile_url = 'https://image.thum.io/get/width/420/https://bentesramoscrm.com.br'
WHERE title = 'CRM Bentes Ramos';

UPDATE portfolio SET
  image_url = 'https://image.thum.io/get/width/1000/https://sumaumaacium.com.br',
  image_mobile_url = 'https://image.thum.io/get/width/420/https://sumaumaacium.com.br'
WHERE title = 'CRM Suma Uma Acium';

UPDATE portfolio SET
  image_url = 'https://image.thum.io/get/width/1000/https://dravanessacosta.com',
  image_mobile_url = 'https://image.thum.io/get/width/420/https://dravanessacosta.com'
WHERE title = 'Dra. Vanessa Costa';

UPDATE portfolio SET
  image_url = 'https://image.thum.io/get/width/1000/https://fisiolasermanaus.com.br',
  image_mobile_url = 'https://image.thum.io/get/width/420/https://fisiolasermanaus.com.br'
WHERE title = 'Fisio Laser Manaus';

UPDATE portfolio SET
  image_url = 'https://image.thum.io/get/width/1000/https://ergofisiosaude.com.br',
  image_mobile_url = 'https://image.thum.io/get/width/420/https://ergofisiosaude.com.br'
WHERE title = 'Ergo Fisio Saúde';

UPDATE portfolio SET
  image_url = 'https://image.thum.io/get/width/1000/https://hildebrandoleite.com.br',
  image_mobile_url = 'https://image.thum.io/get/width/420/https://hildebrandoleite.com.br'
WHERE title = 'Hildebrand Leite';
