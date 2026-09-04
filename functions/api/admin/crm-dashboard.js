import { json } from '../_utils.js';
import { requireAuth } from './_auth.js';
export async function onRequestGet({request,env}) {
  const denied=await requireAuth(request,env);if(denied)return denied;
  const [clients,leads,projects,pipeline,revenue,deadlines,activities]=await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) n FROM clients WHERE is_active=1`).first(),
    env.DB.prepare(`SELECT COUNT(*) n FROM leads WHERE status NOT IN ('won','lost')`).first(),
    env.DB.prepare(`SELECT COUNT(*) n FROM design_projects WHERE status NOT IN ('delivered','cancelled')`).first(),
    env.DB.prepare(`SELECT COALESCE(SUM(value_cents),0) n FROM design_projects WHERE status NOT IN ('cancelled')`).first(),
    env.DB.prepare(`SELECT COALESCE(SUM(amount_cents),0) n FROM receipt_emails WHERE status IN ('sent','scheduled')`).first(),
    env.DB.prepare(`SELECT p.id,p.title,p.deadline,p.status,c.name client_name FROM design_projects p JOIN clients c ON c.id=p.client_id WHERE p.deadline IS NOT NULL AND p.status NOT IN ('delivered','cancelled') ORDER BY p.deadline LIMIT 6`).all(),
    env.DB.prepare(`SELECT * FROM crm_activities ORDER BY id DESC LIMIT 8`).all(),
  ]);
  return json({clients:clients?.n||0,open_leads:leads?.n||0,active_projects:projects?.n||0,pipeline_cents:pipeline?.n||0,revenue_cents:revenue?.n||0,deadlines:deadlines.results||[],activities:activities.results||[]});
}
