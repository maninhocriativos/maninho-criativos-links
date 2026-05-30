-- Migração v9: usar screenshots com nomes simples (sem timestamps)

UPDATE portfolio SET
  image_url = '/Images/bentesramos-desktop.png',
  image_mobile_url = '/Images/bentesramos-desktop.png'
WHERE title = 'CRM Bentes Ramos';

UPDATE portfolio SET
  image_url = '/Images/dravanessa-desktop.png',
  image_mobile_url = '/Images/dravanessa-mobile.png'
WHERE title = 'Dra. Vanessa Costa';

UPDATE portfolio SET
  image_url = '/Images/fisiolaser-desktop.png',
  image_mobile_url = '/Images/fisiolaser-mobile.png'
WHERE title = 'Fisio Laser Manaus';

UPDATE portfolio SET
  image_url = '/Images/ergofisio-desktop.png',
  image_mobile_url = '/Images/ergofisio-desktop.png'
WHERE title = 'Ergo Fisio Saúde';

UPDATE portfolio SET
  image_url = '/Images/hildebrand-desktop.png',
  image_mobile_url = '/Images/hildebrand-mobile.png'
WHERE title = 'Hildebrand Leite';
