-- Migração v3: adiciona project_url + projetos reais

ALTER TABLE portfolio ADD COLUMN project_url TEXT DEFAULT '';

-- Projetos reais — preview via thum.io (screenshot automático)
-- CRMs
INSERT INTO portfolio (title, category, description, image_url, project_url, order_index) VALUES
  (
    'CRM Bentes Ramos',
    'CRM & Meta',
    'CRM personalizado para gestão de leads, pipeline de vendas e integração com Meta Ads para a equipe Bentes Ramos.',
    'https://image.thum.io/get/width/800/https://bentesramoscrm.com.br',
    'https://bentesramoscrm.com.br',
    60
  ),
  (
    'CRM Suma Uma Acium',
    'CRM & Meta',
    'Sistema de CRM desenvolvido sob medida com automação de follow-up, qualificação de leads e dashboard analítico.',
    'https://image.thum.io/get/width/800/https://sumaumaacium.com.br',
    'https://sumaumaacium.com.br',
    61
  );

-- Páginas / Landing Pages
INSERT INTO portfolio (title, category, description, image_url, project_url, order_index) VALUES
  (
    'Dra. Vanessa Costa',
    'Desenvolvimento de Apps',
    'Landing page premium para clínica médica com agenda online, depoimentos, área de serviços e captação de leads pelo WhatsApp.',
    'https://image.thum.io/get/width/800/https://dravanessacosta.com',
    'https://dravanessacosta.com',
    70
  ),
  (
    'Fisio Laser Manaus',
    'Desenvolvimento de Apps',
    'Site institucional para clínica de fisioterapia e laser com apresentação de tratamentos, equipe e formulário de agendamento.',
    'https://image.thum.io/get/width/800/https://fisiolasermanaus.com.br',
    'https://fisiolasermanaus.com.br',
    71
  ),
  (
    'Ergo Fisio Saúde',
    'Desenvolvimento de Apps',
    'Página profissional para clínica de ergonomia e fisioterapia com foco em conversão e experiência mobile-first.',
    'https://image.thum.io/get/width/800/https://ergofisiosaude.com.br',
    'https://ergofisiosaude.com.br',
    72
  ),
  (
    'Hildebrand Leite',
    'Desenvolvimento de Apps',
    'Site pessoal/institucional com apresentação de serviços, portfólio e integração direta com WhatsApp para contato.',
    'https://image.thum.io/get/width/800/https://hildebrandoleite.com.br',
    'https://hildebrandoleite.com.br',
    73
  );
