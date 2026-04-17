import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Builder from './Builder';
import Dashboard from './Dashboard';
import Library from './Library';

export default function QuantGen() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="build" element={<Builder />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="library" element={<Library />} />
    </Routes>
  );
}
