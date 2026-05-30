-- Migração v2: novas categorias de portfólio
INSERT INTO portfolio (title, category, description, image_url, order_index) VALUES
  -- Desenvolvimento de Apps
  ('App Mobile', 'Desenvolvimento de Apps', 'Aplicativo mobile React Native para iOS e Android, com autenticação, push notifications e integração de API.', '/portfolio/app-01.svg', 30),
  ('Web App / Dashboard', 'Desenvolvimento de Apps', 'Dashboard administrativo com Next.js, TypeScript e API REST, com relatórios em tempo real e multi-tenant.', '/portfolio/app-02.svg', 31),
  ('Landing Page Premium', 'Desenvolvimento de Apps', 'Landing page de alta conversão hospedada na Cloudflare Pages com integração ao WhatsApp e CRM.', '/portfolio/app-03.svg', 32),

  -- CRM Integrado à Meta
  ('CRM + Meta Ads', 'CRM & Meta', 'Integração completa entre CRM e Meta Ads para captura automática de leads com qualificação instantânea.', '/portfolio/crm-01.svg', 40),
  ('Dashboard de Leads', 'CRM & Meta', 'Painel analítico de campanhas Meta com KPIs em tempo real: CPL, taxa de conversão e ROAS.', '/portfolio/crm-02.svg', 41),
  ('Pipeline Kanban', 'CRM & Meta', 'CRM Kanban personalizado com automação de follow-up e pontuação de lead score via IA.', '/portfolio/crm-03.svg', 42),

  -- Automação de IA para Vendas
  ('Agente IA WhatsApp', 'Automação de IA', 'Agente conversacional GPT-4 no WhatsApp que qualifica leads, agenda reuniões e fecha vendas 24/7.', '/portfolio/ai-01.svg', 50),
  ('Automação de Vendas', 'Automação de IA', 'Fluxo n8n completo: lead entra → IA qualifica → segmenta → dispara WhatsApp personalizado → atualiza CRM.', '/portfolio/ai-02.svg', 51),
  ('Agente Multi-Canal', 'Automação de IA', 'Agente IA omnichannel (WhatsApp + Email + Meta Retargeting) gerenciado por um único fluxo inteligente.', '/portfolio/ai-03.svg', 52);
