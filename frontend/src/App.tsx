import { Routes, Route } from 'react-router-dom';
import { Investigate } from './pages/Investigate';
import { Report } from './pages/Report';
import { Login } from './pages/Login';
import { History } from './pages/History';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Investigate />} />
      <Route path="/report/:id" element={<Report />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/history" element={<History />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;