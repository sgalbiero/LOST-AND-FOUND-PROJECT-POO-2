import { Link } from 'react-router-dom'

export function AdminPage() {
  return <div className="page-container moderation-page">
    <header className="dashboard-header"><div><span className="eyebrow">Equipe de apoio</span><h1>Painel da equipe</h1><p>Escolha uma área para iniciar o atendimento ou administrar o portal.</p></div></header>
    <div className="support-module-grid">
      <ModuleCard to="/admin/mediacoes" eyebrow="Atendimento" title="Pedidos de ajuda" description="Assuma uma mediação, entre na conversa e oriente os participantes." />
      <ModuleCard to="/admin/denuncias" eyebrow="Segurança" title="Denúncias" description="Analise conteúdos sinalizados e registre a resolução." />
      <ModuleCard to="/admin/catalogo" eyebrow="Configuração" title="Categorias e locais" description="Mantenha as opções usadas na publicação e busca de itens." />
      <ModuleCard to="/mensagens" eyebrow="Conversas" title="Minhas mediações" description="Acesse somente as conversas dos atendimentos que você assumiu." />
    </div>
  </div>
}

function ModuleCard({ to, eyebrow, title, description }: { to: string; eyebrow: string; title: string; description: string }) {
  return <Link className="support-module-card" to={to}><span>{eyebrow}</span><h2>{title}</h2><p>{description}</p><strong>Acessar →</strong></Link>
}
