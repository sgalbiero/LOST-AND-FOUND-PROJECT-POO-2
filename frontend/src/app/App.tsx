import { Route, Routes } from 'react-router-dom'
import { LoginPage } from '../features/auth/presentation/LoginPage'
import { RegistrationPage } from '../features/auth/presentation/RegistrationPage'
import { ProfilePage } from '../features/auth/presentation/ProfilePage'
import { ClaimsPage } from '../features/claims/presentation/ClaimsPage'
import { ExplorePage } from '../features/items/presentation/ExplorePage'
import { ItemDetailsPage } from '../features/items/presentation/ItemDetailsPage'
import { MyItemsPage } from '../features/items/presentation/MyItemsPage'
import { PublishItemPage } from '../features/items/presentation/PublishItemPage'
import { MessagesPage } from '../features/messages/presentation/MessagesPage'
import { ReturnPage } from '../features/returns/presentation/ReturnPage'
import { StateView } from '../shared/ui/StateView'
import { Layout } from './Layout'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminPage } from '../features/moderation/presentation/AdminPage'
import { MediationsPage } from '../features/moderation/presentation/MediationsPage'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ExplorePage />} />
        <Route path="itens/novo" element={<ProtectedRoute><PublishItemPage /></ProtectedRoute>} />
        <Route path="itens/:id/editar" element={<ProtectedRoute><PublishItemPage /></ProtectedRoute>} />
        <Route path="itens/:id" element={<ItemDetailsPage />} />
        <Route path="itens/:id/devolucao" element={<ProtectedRoute><ReturnPage /></ProtectedRoute>} />
        <Route path="entrar" element={<LoginPage />} />
        <Route path="cadastro" element={<RegistrationPage />} />
        <Route path="meus-itens" element={<ProtectedRoute><MyItemsPage /></ProtectedRoute>} />
        <Route path="reivindicacoes" element={<ProtectedRoute><ClaimsPage /></ProtectedRoute>} />
        <Route path="mensagens" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="mediacoes" element={<ProtectedRoute><MediationsPage /></ProtectedRoute>} />
        <Route path="admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="*" element={<div className="page-container"><StateView message="Esta página não existe ou mudou de endereço." action="Ir para o início" onAction={() => location.assign('/')} /></div>} />
      </Route>
    </Routes>
  )
}
