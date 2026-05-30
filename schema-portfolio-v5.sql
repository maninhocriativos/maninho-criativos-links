-- Migração v5: full page screenshots (desktop + mobile)
-- Usando Microlink API para captura completa de páginas

-- DESKTOP: full page em 1200px de largura
-- MOBILE: full page em 375px de largura

UPDATE portfolio SET
  image_url = 'https://cdn.microlink.io/?url=https://bentesramoscrm.com.br&screenshot=true&full=true&viewport.width=1200&viewport.height=2400',
  image_mobile_url = 'https://cdn.microlink.io/?url=https://bentesramoscrm.com.br&screenshot=true&full=true&viewport.width=375&viewport.height=667'
WHERE title = 'CRM Bentes Ramos';

UPDATE portfolio SET
  image_url = 'https://cdn.microlink.io/?url=https://sumaumaacium.com.br&screenshot=true&full=true&viewport.width=1200&viewport.height=2400',
  image_mobile_url = 'https://cdn.microlink.io/?url=https://sumaumaacium.com.br&screenshot=true&full=true&viewport.width=375&viewport.height=667'
WHERE title = 'CRM Suma Uma Acium';

UPDATE portfolio SET
  image_url = 'https://cdn.microlink.io/?url=https://dravanessacosta.com&screenshot=true&full=true&viewport.width=1200&viewport.height=2400',
  image_mobile_url = 'https://cdn.microlink.io/?url=https://dravanessacosta.com&screenshot=true&full=true&viewport.width=375&viewport.height=667'
WHERE title = 'Dra. Vanessa Costa';

UPDATE portfolio SET
  image_url = 'https://cdn.microlink.io/?url=https://fisiolasermanaus.com.br&screenshot=true&full=true&viewport.width=1200&viewport.height=2400',
  image_mobile_url = 'https://cdn.microlink.io/?url=https://fisiolasermanaus.com.br&screenshot=true&full=true&viewport.width=375&viewport.height=667'
WHERE title = 'Fisio Laser Manaus';

UPDATE portfolio SET
  image_url = 'https://cdn.microlink.io/?url=https://ergofisiosaude.com.br&screenshot=true&full=true&viewport.width=1200&viewport.height=2400',
  image_mobile_url = 'https://cdn.microlink.io/?url=https://ergofisiosaude.com.br&screenshot=true&full=true&viewport.width=375&viewport.height=667'
WHERE title = 'Ergo Fisio Saúde';

UPDATE portfolio SET
  image_url = 'https://cdn.microlink.io/?url=https://hildebrandoleite.com.br&screenshot=true&full=true&viewport.width=1200&viewport.height=2400',
  image_mobile_url = 'https://cdn.microlink.io/?url=https://hildebrandoleite.com.br&screenshot=true&full=true&viewport.width=375&viewport.height=667'
WHERE title = 'Hildebrand Leite';
