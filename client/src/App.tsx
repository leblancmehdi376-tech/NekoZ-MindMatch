import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HostGamePage from './pages/HostGamePage';
import PlayerGamePage from './pages/PlayerGamePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/host/:code" element={<HostGamePage />} />
      <Route path="/play/:code" element={<PlayerGamePage />} />
    </Routes>
  );
}
