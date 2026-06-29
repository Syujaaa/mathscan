import { Navigate } from "react-router-dom";

const GuestRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user"); // Ambil key 'user' sesuai di gambar

  if (token && userString) {
    try {
      // Karena berbentuk JSON string, kita parse dulu menjadi objek
      const user = JSON.parse(userString);
      const role = user.role; // Mengambil "guru" dari dalam objek user

      switch (role) {
        case "siswa":
          return <Navigate to="/siswa" replace />;
        case "guru":
          return <Navigate to="/guru" replace />;
        case "admin":
          return <Navigate to="/admin" replace />;
        default:
          break;
      }
    } catch (error) {
      console.error("Error parsing user dari localStorage:", error);
    }
  }

  // Jika belum login, tampilkan halaman Login
  return children;
};

export default GuestRoute;
