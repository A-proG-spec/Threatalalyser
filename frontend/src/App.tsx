// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { Investigate } from './pages/Investigate';
import { Report } from './pages/Report';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile'; // <-- Import Profile
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Investigate />} />
      <Route path="/report/:id" element={<Report />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/history" element={<History />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} /> {/* <-- Add Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;