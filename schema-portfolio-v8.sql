-- Migração v8: usar screenshots locais da pasta public/Images

UPDATE portfolio SET
  image_url = '/Images/screencapture-bentesramos-br-2026-05-30-15_56_23.png',
  image_mobile_url = '/Images/screencapture-bentesramos-br-2026-05-30-15_56_23.png'
WHERE title = 'CRM Bentes Ramos';

UPDATE portfolio SET
  image_url = '/Images/screencapture-dravanessacosta-2026-05-30-15_49_39.png',
  image_mobile_url = '/Images/screencapture-dravanessacosta-2026-05-30-15_56_02.png'
WHERE title = 'Dra. Vanessa Costa';

UPDATE portfolio SET
  image_url = '/Images/screencapture-fisiolasermanaus-br-2026-05-30-15_50_00.png',
  image_mobile_url = '/Images/screencapture-fisiolasermanaus-br-2026-05-30-15_55_06.png'
WHERE title = 'Fisio Laser Manaus';

UPDATE portfolio SET
  image_url = '/Images/screencapture-ergofisiosaude-br-2026-05-30-15_47_14.png',
  image_mobile_url = '/Images/screencapture-ergofisiosaude-br-2026-05-30-15_47_14.png'
WHERE title = 'Ergo Fisio Saúde';

UPDATE portfolio SET
  image_url = '/Images/screencapture-hildebrandoleite-pages-dev-desktop-2026-05-30-15_48_04.png',
  image_mobile_url = '/Images/screencapture-hildebrandoleite-pages-dev-desktop-2026-05-30-15_56_47.png'
WHERE title = 'Hildebrand Leite';
