import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import SiswaDashboard from "./pages/SiswaDashboard";
import GuruDashboard from "./pages/GuruDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

function App() {
  return (
    <Router>
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh",
        backgroundColor: "#F5EFE7"
      }}>
        
        {/* Area Konten Utama Halaman */}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />

            <Route
              path="/siswa"
              element={
                <ProtectedRoute allowedRoles={["siswa"]}>
                  <SiswaDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/guru"
              element={
                <ProtectedRoute allowedRoles={["guru"]}>
                  <GuruDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Komponen Copyrights (Footer) */}
        <footer style={{ 
          textAlign: "center", 
          padding: "1rem", 
          fontSize: "0.75rem", 
          color: "rgba(0, 98, 102, 0.65)", 
          borderTop: "1px solid rgba(0, 98, 102, 0.1)", 
          letterSpacing: "0.025em"
        }}>
          <div>
            &copy; {new Date().getFullYear()}{" "}
            <a 
              href="https://farrassyuja.my.id" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: "#FF7675", // Menggunakan warna pink kemerahan agar langsung mencolok
                textDecoration: "underline", // Menandakan dengan jelas bahwa ini adalah link
                textUnderlineOffset: "3px", // Memberi jarak sedikit antara teks dan garis bawah agar rapi
                fontWeight: "bold", // Teks ditebalkan
                transition: "all 0.3s ease" // Animasi transisi yang halus
              }}
              // Berubah menjadi warna hijau tua dan tanpa garis bawah saat disorot kursor
              onMouseEnter={(e) => {
                e.target.style.color = "#006266";
                e.target.style.textDecoration = "none";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#FF7675";
                e.target.style.textDecoration = "underline";
              }}
            >
              LIDM Application
            </a>
            . All Rights Reserved.
          </div>
        </footer>

      </div>
    </Router>
  );
}

export default App;