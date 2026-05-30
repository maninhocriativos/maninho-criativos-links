-- Migração v7: screenshots simples e confiáveis com Thum.io
-- Thum.io é mais confiável que APIs que requerem autenticação

UPDATE portfolio SET
  image_url = 'https://image.thum.io/get/width/1200/https://bentesramoscrm.com.br',
  image_mobile_url = 'https://image.thum.io/get/width/420/https://bentesramoscrm.com.br'
WHERE title = 'CRM Bentes Ramos';

UPDATE portfolio SET
  image_url = 'https://image.thum.io/get/width/1200/https://sumaumaacium.com.br',
  image_mobile_url = 'https://image.thum.io/get/width/420/https://sumaumaacium.com.br'
WHERE title = 'CRM Suma Uma Acium';

UPDATE portfolio SET
  image_url = 'https://image.thum.io/get/width/1200/https://dravanessacosta.com',
  image_mobile_url = 'https://image.thum.io/get/width/420/https://dravanessacosta.com'
WHERE title = 'Dra. Vanessa Costa';

UPDATE portfolio SET
  image_url = 'https://image.thum.io/get/width/1200/https://fisiolasermanaus.com.br',
  image_mobile_url = 'https://image.thum.io/get/width/420/https://fisiolasermanaus.com.br'
WHERE title = 'Fisio Laser Manaus';

UPDATE portfolio SET
  image_url = 'https://image.thum.io/get/width/1200/https://ergofisiosaude.com.br',
  image_mobile_url = 'https://image.thum.io/get/width/420/https://ergofisiosaude.com.br'
WHERE title = 'Ergo Fisio Saúde';

UPDATE portfolio SET
  image_url = 'https://image.thum.io/get/width/1200/https://hildebrandoleite.com.br',
  image_mobile_url = 'https://image.thum.io/get/width/420/https://hildebrandoleite.com.br'
WHERE title = 'Hildebrand Leite';
