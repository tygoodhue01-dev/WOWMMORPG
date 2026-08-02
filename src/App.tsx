import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import RealmsPage from '@/pages/RealmsPage';
import NewsPage from '@/pages/NewsPage';
import ConnectPage from '@/pages/ConnectPage';
import RegisterPage from '@/pages/RegisterPage';
import LoginPage from '@/pages/LoginPage';
import AccountPage from '@/pages/AccountPage';
import LeaderboardsPage from '@/pages/LeaderboardsPage';
import ArmoryPage from '@/pages/ArmoryPage';
import ItemDatabasePage from '@/pages/ItemDatabasePage';
import GuildsPage from '@/pages/GuildsPage';
import AdminPanel from '@/pages/AdminPanel';
import AdminRealms from '@/pages/admin/AdminRealms';
import AdminNews from '@/pages/admin/AdminNews';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminServerInfo from '@/pages/admin/AdminServerInfo';
import AdminServerManager from '@/pages/admin/AdminServerManager';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/realms" element={<RealmsPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/connect" element={<ConnectPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/leaderboards" element={<LeaderboardsPage />} />
            <Route path="/armory" element={<ArmoryPage />} />
            <Route path="/armory/:guid" element={<ArmoryPage />} />
            <Route path="/items" element={<ItemDatabasePage />} />
            <Route path="/items/:entry" element={<ItemDatabasePage />} />
            <Route path="/guilds" element={<GuildsPage />} />
            <Route path="/guilds/:guildId" element={<GuildsPage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/realms" element={<AdminRealms />} />
            <Route path="/admin/news" element={<AdminNews />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/server-info" element={<AdminServerInfo />} />
            <Route path="/admin/server-manager" element={<AdminServerManager />} />
            <Route path="*" element={<div style={{ padding: '20px', color: 'white' }}><h1>404</h1><p>Page not found</p></div>} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;