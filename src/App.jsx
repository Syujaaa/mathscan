import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SiswaDashboard from './pages/SiswaDashboard';
import GuruDashboard from './pages/GuruDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />

                <Route
                    path="/siswa/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['siswa']}>
                            <SiswaDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/guru/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['guru']}>
                            <GuruDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;