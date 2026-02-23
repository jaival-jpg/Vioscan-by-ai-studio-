import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Scan from './pages/Scan';
import Generate from './pages/Generate';
import Result from './pages/Result';
import History from './pages/History';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/scan" element={<Scan />} />
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/generate" element={<Layout><Generate /></Layout>} />
          <Route path="/history" element={<Layout><History /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
          <Route path="/result" element={<Result />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
