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

        <footer
          style={{
            marginTop: "auto",
            textAlign: "center",
            padding: "1rem",
            fontSize: "0.75rem",
            color: "rgba(82, 83, 85, 0.8)",
            borderTop: "1px solid rgba(82, 83, 85, 0.15)",
            backgroundColor: "#ffffff",
            letterSpacing: "0.025em",
          }}
        >
          <div>
            &copy; {new Date().getFullYear()}{" "}
            <a
              href="https://farrassyuja.my.id"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#525355",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "#707174";
                e.target.style.textDecoration = "none";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#525355";
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