import { useNavigate } from 'react-router-dom'
import { StateView } from '../shared/ui/StateView'

export function PlaceholderPage({ title }: { title: string }) {
  const navigate = useNavigate()
  return <div className="page-container"><StateView message={`${title} entra no próximo marco de desenvolvimento.`} action="Voltar para explorar" onAction={() => navigate('/')} /></div>
}
