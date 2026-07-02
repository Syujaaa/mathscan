import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, getAuthHeaders } from "../config/api";

// ── Icon components (inline SVG, no extra deps) ──────────────────────────────
const IconScan = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <line x1="7" y1="12" x2="17" y2="12" />
  </svg>
);
const IconClass = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconHistory = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="12 8 12 12 14 14" />
    <path d="M3.05 11a9 9 0 1 0 .5-4.5" />
    <polyline points="3 3 3 9 9 9" />
  </svg>
);
const IconLogout = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconUpload = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);
const IconCheck = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconArrow = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const LoadingSpinner = ({ label = "Memuat..." }) => (
  <div className="flex items-center justify-center gap-2 py-4 text-sm font-medium text-slate-500">
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
    <span>{label}</span>
  </div>
);

function loadScript(src, id) {
  return new Promise((resolve) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.id = id;
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

/* SweetAlert2 helpers */
const toast = (icon, title) =>
  window.Swal?.fire({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2800,
    timerProgressBar: true,
    icon,
    title,
  });

const confirm = (title, text, confirmText = "Ya, lanjutkan") =>
  window.Swal?.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#525355",
    cancelButtonColor: "#94a3b8",
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    reverseButtons: true,
    customClass: {
      popup: "rounded-2xl",
      confirmButton: "rounded-lg font-semibold",
      cancelButton: "rounded-lg font-semibold",
    },
  });

const IconSparkle = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  </svg>
);

// ── Badge status ──────────────────────────────────────────────────────────────
function StatusBadge({ status, nilai }) {
  if (status !== "completed")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F5EFE7] text-slate-500">
        Belum dikerjakan
      </span>
    );
  if (nilai !== null && nilai !== undefined)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
        <IconCheck size={11} /> Nilai: {nilai}/100
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FF7675]/15 text-[#c94b4a]">
      Menunggu penilaian
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SiswaDashboard() {
  const [activeTab, setActiveTab] = useState("kelas");
  const navigate = useNavigate();
  const [selectedAnalisis, setSelectedAnalisis] = useState(null);
  const [selectedFoto, setSelectedFoto] = useState(null);
  // Scan tab state
  const [images, setImages] = useState([]);
  const [activeAssignmentId, setActiveAssignmentId] = useState("");
  const [activeAssignmentTitle, setActiveAssignmentTitle] = useState("");
  const [loadingScan, setLoadingScan] = useState(false);
  const [statusTugas, setStatusTugas] = useState("draft");
  const [scanResult, setScanResult] = useState(null);
  const [submissionDetail, setSubmissionDetail] = useState(null);

  // Class tab state
  const [kodeKelas, setKodeKelas] = useState("");
  const [joinedClasses, setJoinedClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // History tab state
  const [riwayat, setRiwayat] = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);

  const TOPIK_LIST = [
    "Bilangan (Bulat, Pecahan, Desimal, Persen)",
    "Aljabar",
    "Persamaan Linear",
    "Perbandingan & Skala",
    "Bangun Datar",
    "Pythagoras",
    "Bangun Ruang",
    "Statistika",
    "Peluang",
    "Persamaan Kuadrat",
  ];
  const TINGKAT_LIST = ["Mudah", "Sedang", "Sulit"];
  // Latihan AI tab state
  const [latihanTopik, setLatihanTopik] = useState(TOPIK_LIST[0]);
  const [latihanTingkat, setLatihanTingkat] = useState(TINGKAT_LIST[0]);
  const [latihanSoal, setLatihanSoal] = useState("");
  const [loadingSoal, setLoadingSoal] = useState(false);
  const [latihanImages, setLatihanImages] = useState([]);
  const [loadingLatihanScan, setLoadingLatihanScan] = useState(false);
  const [latihanResult, setLatihanResult] = useState(null);
  const [initialDistance, setInitialDistance] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const getDistance = (touches) => {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY,
    );
  };
  // Fungsi untuk menutup modal sekaligus mereset zoom
  const handleCloseModal = () => {
    setSelectedFoto(null);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  const getPhotoArray = (rawUrl) => {
    if (!rawUrl) return [];

    try {
      // 1. Bersihkan double quotes ganda ("") menjadi satu kutip (") agar jadi JSON valid
      const cleanJson = rawUrl.replace(/""/g, '"');

      // 2. Parse string tersebut menjadi array
      const parsed = JSON.parse(cleanJson);

      // 3. Pastikan output selalu berupa array pembungkus
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      // Fallback jika formatnya benar-benar rusak / teks biasa, split berdasarkan koma
      const cleanStr = rawUrl.replace(/[\[\]"\\]/g, "");
      return cleanStr
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);
    }
  };
  useEffect(() => {
    loadScript("https://cdn.jsdelivr.net/npm/sweetalert2@11", "swal2");
    fetchClasses();
    fetchRiwayat();
  }, []);

  useEffect(() => {
    if (selectedClass) fetchAssignments(selectedClass);
  }, [selectedClass]);

  useEffect(() => {
    if (activeTab === "kelas") {
      fetchClasses();
      if (selectedClass) fetchAssignments(selectedClass);
    } else if (activeTab === "riwayat") {
      fetchRiwayat();
    }
  }, [activeTab]);

  useEffect(() => {
    const refetchCurrentTab = () => {
      if (activeTab === "kelas") {
        fetchClasses();
        if (selectedClass) fetchAssignments(selectedClass);
      } else if (activeTab === "riwayat") {
        fetchRiwayat();
      }
    };

    window.addEventListener("focus", refetchCurrentTab);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") refetchCurrentTab();
    });

    return () => {
      window.removeEventListener("focus", refetchCurrentTab);
    };
  }, [activeTab, selectedClass]);

  const handleLogout = async () => {
    const result = await window.Swal?.fire({
      title: "Keluar dari MathScan?",
      text: "Sesi kamu akan diakhiri.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#FF7675",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Ya, keluar",
      cancelButtonText: "Batal",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-lg font-semibold",
        cancelButton: "rounded-lg font-semibold",
      },
    });
    if (result?.isConfirmed) {
      await window.Swal?.fire({
        title: "Sampai jumpa!",
        text: "Kamu telah keluar dari akun.",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
        customClass: { popup: "rounded-2xl" },
      });
      localStorage.clear();
      navigate("/login");
    }
  };

  const handleGenerateSoal = async () => {
    setLoadingSoal(true);
    setLatihanSoal("");
    setLatihanResult(null);
    setLatihanImages([]);
    try {
      const res = await fetch(`${API_BASE_URL}/siswa/latihan/soal`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          topik: latihanTopik,
          tingkat_kesulitan: latihanTingkat,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setLatihanSoal(data.soal);
      } else {
        toast("error", data.error || "Gagal membuat soal.");
      }
    } catch (_) {
      toast("error", "Terjadi kesalahan saat membuat soal.");
    } finally {
      setLoadingSoal(false);
    }
  };

  const handleSubmitLatihan = async (e) => {
    e.preventDefault();
    if (latihanImages.length === 0)
      return toast("warning", "Pilih minimal 1 foto pengerjaan!");
    setLoadingLatihanScan(true);
    const formData = new FormData();
    formData.append("topik", latihanTopik);
    formData.append("tingkat_kesulitan", latihanTingkat);
    formData.append("soal_text", latihanSoal);
    for (let i = 0; i < latihanImages.length; i++)
      formData.append("images", latihanImages[i]);
    try {
      const res = await fetch(`${API_BASE_URL}/siswa/latihan/scan`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setLatihanResult(data.analysis);
        toast("success", "Latihan berhasil dievaluasi!");
        fetchRiwayat();
      } else {
        toast("error", data.error || "Gagal mengevaluasi latihan.");
      }
    } catch (_) {
      toast("error", "Terjadi kesalahan saat mengevaluasi latihan.");
    } finally {
      setLoadingLatihanScan(false);
    }
  };

  const handleSoalBaru = () => {
    setLatihanSoal("");
    setLatihanResult(null);
    setLatihanImages([]);
  };

  /* ── Data fetching ── */
  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const res = await fetch(`${API_BASE_URL}/siswa/classes`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) setJoinedClasses(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchRiwayat = async () => {
    setLoadingRiwayat(true);
    try {
      const res = await fetch(`${API_BASE_URL}/siswa/riwayat-scan`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) setRiwayat(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRiwayat(false);
    }
  };

  const fetchAssignments = async (class_id) => {
    setLoadingAssignments(true);
    try {
      const res = await fetch(`${API_BASE_URL}/siswa/assignments/${class_id}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      const withStatus = await Promise.all(
        data.map(async (assg) => {
          try {
            const sr = await fetch(
              `${API_BASE_URL}/submissions/check/${assg.id}`,
              { headers: getAuthHeaders() },
            );
            if (sr.ok) {
              const sd = await sr.json();
              return {
                ...assg,
                submissionStatus: sd.status,
                nilaiGuru: sd.data?.nilai ?? null,
              };
            }
          } catch (_) {}
          return { ...assg, submissionStatus: "draft", nilaiGuru: null };
        }),
      );
      setAssignments(withStatus);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAssignments(false);
    }
  };

  /* ── Submit handlers ── */
  const handleJoinClass = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/classes/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ kode_kelas: kodeKelas }),
      });
      const data = await res.json();
      if (res.ok) {
        toast("success", "Permintaan bergabung berhasil dikirim.");
        setKodeKelas("");
        fetchClasses();
      } else {
        toast("error", data.error || "Gagal bergabung ke kelas.");
      }
    } catch (_) {
      toast("error", "Terjadi kesalahan saat bergabung ke kelas.");
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!activeAssignmentId)
      return toast("warning", "Silakan pilih tugas terlebih dahulu!");
    if (images.length === 0)
      return toast("warning", "Pilih minimal 1 gambar pengerjaan!");
    setLoadingScan(true);
    const formData = new FormData();
    formData.append("assignment_id", activeAssignmentId);
    for (let i = 0; i < images.length; i++)
      formData.append("images", images[i]);
    try {
      const res = await fetch(`${API_BASE_URL}/scan`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setScanResult(data.analysis);
        setSubmissionDetail(data.db);
        setStatusTugas("completed");
        toast("success", "Jawaban berhasil dikirim & dianalisis!");
        fetchRiwayat();
      } else {
        toast("error", data.error || "Gagal memproses gambar.");
      }
    } catch (_) {
      toast("error", "Terjadi kesalahan saat memproses gambar.");
    } finally {
      setLoadingScan(false);
    }
  };

  const handlePilihTugas = async (assg) => {
    setActiveAssignmentId(assg.id);
    setActiveAssignmentTitle(assg.judul);
    setActiveTab("scan");
    setStatusTugas("draft");
    setScanResult(null);
    setSubmissionDetail(null);
    setImages([]);
    try {
      const res = await fetch(`${API_BASE_URL}/submissions/check/${assg.id}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.status) {
        setStatusTugas(data.status);
        if (data.status === "completed" && data.data)
          setSubmissionDetail(data.data);
      }
    } catch (_) {}
  };

  const getParsedPhotos = () => {
    if (!submissionDetail?.image_url) return [];
    try {
      return JSON.parse(submissionDetail.image_url);
    } catch {
      return [];
    }
  };

  /* ── Nav items ── */
  const navItems = [
    { id: "kelas", label: "Kelas Saya", Icon: IconClass },
    { id: "scan", label: "Kerjakan Tugas", Icon: IconScan },
    { id: "latihan", label: "Latihan AI", Icon: IconSparkle },
    { id: "riwayat", label: "Riwayat Belajar", Icon: IconHistory },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="h-full bg-[#F5EFE7] font-sans">
      {selectedAnalisis && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedAnalisis(null)} // Tutup jika klik area hitam/luar modal
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat konten dalam modal diklik
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F5EFE7]">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                Detail Analisis Pembelajaran
              </h3>
              <button
                className="text-slate-400 hover:text-slate-600 text-2xl font-semibold leading-none transition-colors"
                onClick={() => setSelectedAnalisis(null)}
              >
                &times;
              </button>
            </div>

            {/* Konten Utama (Render HTML Otomatis dari Database) */}
            <div className="overflow-y-auto p-6 text-sm">
              <div dangerouslySetInnerHTML={{ __html: selectedAnalisis }} />
            </div>

            {/* Footer Modal */}
            <div className="flex justify-end px-6 py-3.5 border-t border-slate-100 bg-[#F5EFE7]">
              <button
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                onClick={() => setSelectedAnalisis(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedFoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 overflow-hidden"
          // Event listener utama untuk menangkap pergeseran mouse
          onMouseMove={
            isDragging
              ? (e) =>
                  setPosition({
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y,
                  })
              : undefined
          }
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          {/* Tombol Close (X) */}
          <button
            className="absolute top-6 right-8 text-white text-4xl font-bold hover:text-slate-300 transition-colors z-[60]"
            onClick={handleCloseModal}
          >
            &times;
          </button>

          {/* Kontrol Zoom di Bawah */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 px-6 py-3 rounded-full backdrop-blur-sm z-[60] shadow-xl border border-white/10">
            <button
              className="text-white hover:text-[#FF7675] font-bold text-xl px-2"
              onClick={(e) => {
                e.stopPropagation();
                setScale((p) => Math.max(1, p - 0.5));
              }}
            >
              -
            </button>
            <span className="text-white text-sm font-medium w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              className="text-white hover:text-[#FF7675] font-bold text-xl px-2"
              onClick={(e) => {
                e.stopPropagation();
                setScale((p) => Math.min(5, p + 0.5));
              }}
            >
              +
            </button>
            <div className="w-[1px] h-4 bg-white/30 mx-2"></div>
            <button
              className="text-xs text-white/80 hover:text-white uppercase tracking-wider font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                setScale(1);
                setPosition({ x: 0, y: 0 });
              }}
            >
              Reset
            </button>
          </div>

          {/* Area pembungkus untuk menangkap Scroll (Wheel) dan klik background */}
          <div
            className="absolute inset-0 flex items-center justify-center touch-none" // Tambahkan touch-none agar browser tidak ikut men-scroll halaman
            onClick={handleCloseModal}
            // === LOGIKA LAPTOP / PC ===
            onWheel={(e) => {
              if (e.deltaY < 0) {
                setScale((p) => Math.min(5, p + 0.25));
              } else {
                setScale((p) => {
                  const newScale = Math.max(1, p - 0.25);
                  if (newScale === 1) setPosition({ x: 0, y: 0 });
                  return newScale;
                });
              }
            }}
            onMouseMove={
              isDragging
                ? (e) =>
                    setPosition({
                      x: e.clientX - dragStart.x,
                      y: e.clientY - dragStart.y,
                    })
                : undefined
            }
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            // === LOGIKA HP / TOUCHSCREEN ===
            onTouchStart={(e) => {
              if (e.touches.length === 2) {
                // Jika 2 jari menyentuh layar, mulai mode Zoom
                setInitialDistance(getDistance(e.touches));
              } else if (e.touches.length === 1 && scale > 1) {
                // Jika 1 jari dan gambar sedang di-zoom, mulai mode Geser (Pan)
                setIsDragging(true);
                setDragStart({
                  x: e.touches[0].clientX - position.x,
                  y: e.touches[0].clientY - position.y,
                });
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 2 && initialDistance) {
                // Proses Zooming 2 jari
                e.preventDefault();
                const currentDistance = getDistance(e.touches);
                // Hitung rasio perubahan jarak jari
                const scaleChange = currentDistance / initialDistance;

                setScale((p) => {
                  const newScale = Math.min(Math.max(1, p * scaleChange), 5);
                  if (newScale === 1) setPosition({ x: 0, y: 0 });
                  return newScale;
                });

                // Perbarui jarak awal untuk pergerakan selanjutnya agar mulus
                setInitialDistance(currentDistance);
              } else if (e.touches.length === 1 && isDragging) {
                // Proses Geser 1 jari
                setPosition({
                  x: e.touches[0].clientX - dragStart.x,
                  y: e.touches[0].clientY - dragStart.y,
                });
              }
            }}
            onTouchEnd={() => {
              setIsDragging(false);
              setInitialDistance(null);
            }}
          >
            {/* Gambar Ukuran Besar */}
            <img
              src={selectedFoto}
              alt="Foto Jawaban Diperbesar"
              draggable={false} // Mencegah gambar terseret (fitur bawaan browser)
              className={`max-w-full max-h-[85vh] object-contain rounded shadow-2xl ${
                scale > 1
                  ? isDragging
                    ? "cursor-grabbing"
                    : "cursor-grab"
                  : "cursor-default"
              }`}
              style={{
                // Terapkan skala (zoom) dan translasi (geser)
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                // Matikan animasi CSS saat sedang di-drag agar pergerakan mouse responsif
                transition: isDragging ? "none" : "transform 0.15s ease-out",
              }}
              onClick={(e) => e.stopPropagation()} // Mencegah klik pada gambar menutup modal
              onMouseDown={(e) => {
                // Mulai drag hanya jika gambar sedang di-zoom
                if (scale > 1) {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                  setDragStart({
                    x: e.clientX - position.x,
                    y: e.clientY - position.y,
                  });
                }
              }}
            />
          </div>
        </div>
      )}
      {/* ── TOP HEADER ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="w-8 h-8 rounded-lg bg-[#525355] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-800 tracking-tight">
              MathScan
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === id
                    ? "bg-[#525355]/10 text-[#525355]"
                    : "text-slate-500 hover:text-slate-800 hover:bg-[#F5EFE7]"
                }`}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#FF7675] transition-colors px-3 py-2 rounded-lg hover:bg-[#FF7675]/10"
          >
            <IconLogout size={17} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
        {(loadingClasses || loadingAssignments || loadingRiwayat) && (
          <div className="mb-4 flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            <LoadingSpinner label="Memuat data dashboard..." />
          </div>
        )}

        {/* Active assignment ribbon (only on scan tab) */}
        {activeTab === "scan" && activeAssignmentId && (
          <div className="mb-5 flex items-center gap-3 p-3 bg-[#525355] text-white rounded-xl shadow-sm">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <IconScan size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/70">
                Sedang Mengerjakan
              </p>
              <p className="font-semibold truncate">{activeAssignmentTitle}</p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            TAB: KERJAKAN TUGAS (Scan)
        ════════════════════════════════════════ */}
        {activeTab === "scan" && (
          <>
            {/* Empty state — belum pilih tugas */}
            {!activeAssignmentId ? (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                <div className="w-20 h-20 bg-[#525355]/10 rounded-2xl flex items-center justify-center mb-6">
                  <IconScan size={36} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">
                  Pilih tugas dulu, yuk!
                </h2>
                <p className="text-slate-500 max-w-sm mb-6">
                  Pergi ke tab <strong>Kelas Saya</strong>, buka kelasmu, lalu
                  klik tombol
                  <em> Kerjakan</em> pada tugas yang ingin dikerjakan.
                </p>
                <button
                  onClick={() => setActiveTab("kelas")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#525355] text-white rounded-xl font-semibold hover:bg-[#3F4042] transition-colors shadow-sm"
                >
                  Lihat Kelas Saya <IconArrow size={16} />
                </button>
              </div>
            ) : (
              /* Content: form + result */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left: upload / status card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                    <h2 className="font-bold text-slate-800 text-lg">
                      {statusTugas === "completed"
                        ? "Status Pengiriman"
                        : "Upload Pengerjaan"}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {statusTugas === "completed"
                        ? "Tugasmu telah berhasil dikirim ke guru."
                        : "Foto lembar jawabanmu, lalu kirim untuk dianalisis AI."}
                    </p>
                  </div>

                  <div className="p-6">
                    {statusTugas === "draft" ? (
                      <form onSubmit={handleScan} className="space-y-5">
                        {/* Drop zone */}
                        <label className="block cursor-pointer group">
                          <div className="border-2 border-dashed border-slate-200 group-hover:border-[#525355]/60 rounded-xl p-8 text-center transition-colors bg-[#F5EFE7] group-hover:bg-[#525355]/10">
                            <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-[#525355] transition-colors">
                              <IconUpload size={28} />
                              <p className="font-semibold text-sm">
                                Klik untuk pilih foto
                              </p>
                              <p className="text-xs">
                                JPG, PNG — boleh lebih dari 1 foto
                              </p>
                            </div>
                            {images.length > 0 && (
                              <p className="mt-3 text-sm font-semibold text-[#525355]">
                                {images.length} foto terpilih ✓
                              </p>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            onChange={(e) => setImages(e.target.files)}
                          />
                        </label>

                        {/* Preview thumbnails */}
                        {images.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {Array.from(images).map((file, i) => (
                              <div
                                key={i}
                                className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0"
                              >
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={loadingScan}
                          className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            loadingScan
                              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                              : "bg-[#525355] hover:bg-[#3F4042] text-white shadow-sm hover:shadow-md"
                          }`}
                        >
                          {loadingScan ? (
                            <>
                              <svg
                                className="animate-spin w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8z"
                                />
                              </svg>
                              Menganalisis...
                            </>
                          ) : (
                            "Kirim & Analisis"
                          )}
                        </button>
                      </form>
                    ) : (
                      /* Status: completed */
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <IconCheck size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-emerald-800">
                              Tugas Berhasil Dikirim
                            </p>
                            <p className="text-sm text-emerald-700 mt-0.5">
                              {submissionDetail?.nilai !== null &&
                              submissionDetail?.nilai !== undefined
                                ? "Guru telah memberikan penilaian."
                                : "Menunggu penilaian dari guru."}
                            </p>
                          </div>
                        </div>

                        {/* Nilai guru */}
                        {submissionDetail?.nilai !== null &&
                          submissionDetail?.nilai !== undefined && (
                            <div className="p-4 bg-[#525355]/10 border border-[#525355]/25 rounded-xl">
                              <p className="text-xs font-bold uppercase tracking-widest text-[#525355]/60 mb-1">
                                Nilai
                              </p>
                              <p className="text-3xl font-black text-[#525355]">
                                {submissionDetail.nilai}
                                <span className="text-base font-bold text-[#525355]/60">
                                  /100
                                </span>
                              </p>
                              {submissionDetail.catatan_guru && (
                                <p className="text-sm text-[#3F4042] mt-2 italic border-t border-[#525355]/25 pt-2">
                                  "{submissionDetail.catatan_guru}"
                                </p>
                              )}
                            </div>
                          )}

                        {/* Foto terkirim */}
                        {getParsedPhotos().length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                              Foto yang dikirim
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {getParsedPhotos().map((photo, idx) => (  
                                  <img
                                    onClick={() => {
                                      setSelectedFoto(photo);
                                    }}
                                    src={`${photo}`}
                                    alt="Tugas"
                                    className="h-16 w-16 object-cover border border-slate-200 rounded-lg shadow-sm hover:scale-105 transition-transform"
                                  />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: AI result */}
                <div>
                  {scanResult || submissionDetail?.analisis_pembelajaran ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full">
                      <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#FF7675]/15 rounded-md flex items-center justify-center">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                            <path d="M21.17 8H12V2.83" />
                          </svg>
                        </div>
                        <h3 className="font-bold text-slate-800">
                          Analisis AI
                        </h3>
                      </div>
                      <div className="p-6 space-y-5">
                        {/* OCR result */}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                            Soal terdeteksi
                          </p>
                          <pre className="p-3 bg-[#F5EFE7] border border-slate-200 rounded-xl text-xs font-mono text-slate-700 overflow-auto whitespace-pre-wrap leading-relaxed">
                            {scanResult
                              ? scanResult.ocr_result_text
                              : submissionDetail?.ocr_result_text}
                          </pre>
                        </div>
                        {/* Analysis */}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                            Umpan Balik Pembelajaran
                          </p>
                          <div className="p-4 bg-[#525355]/10 border border-[#FF7675]/30 rounded-xl text-sm text-[#7a1f1e] leading-relaxed">
                            {scanResult?.analisis_pembelajaran ||
                            submissionDetail?.analisis_pembelajaran ? (
                              <div
                                className="space-y-2 prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html:
                                    scanResult?.analisis_pembelajaran ||
                                    submissionDetail?.analisis_pembelajaran,
                                }}
                              />
                            ) : (
                              <p className="italic text-[#FF7675]">
                                Tidak ada umpan balik.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full min-h-56 p-8 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                      <div className="w-14 h-14 bg-[#FF7675]/10 rounded-xl flex items-center justify-center mb-4">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#FF7675"
                          strokeWidth="1.5"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M3 9h18M9 21V9" />
                        </svg>
                      </div>
                      <p className="text-slate-400 text-sm max-w-xs">
                        Hasil analisis AI akan muncul di sini setelah kamu
                        mengirim foto pengerjaanmu.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════
            TAB: KELAS SAYA
        ════════════════════════════════════════ */}
        {activeTab === "kelas" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Sidebar: join + class list */}
            <div className="md:col-span-1 space-y-4">
              {/* Join class */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h2 className="font-bold text-slate-800 mb-1">Gabung Kelas</h2>
                <p className="text-xs text-slate-500 mb-4">
                  Masukkan kode dari gurumu.
                </p>
                <form onSubmit={handleJoinClass} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="48K..."
                    value={kodeKelas}
                    onChange={(e) => setKodeKelas(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-mono uppercase text-sm bg-[#F5EFE7] focus:outline-none focus:ring-2 focus:ring-[#525355]/60 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#525355] hover:bg-[#3F4042] text-white rounded-xl font-semibold text-sm transition-colors"
                  >
                    Gabung Sekarang
                  </button>
                </form>
              </div>

              {/* Class list */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h2 className="font-bold text-slate-800 mb-3">Daftar Kelas</h2>
                {loadingClasses ? (
                  <div className="rounded-xl border border-slate-100 bg-[#F5EFE7]/60 p-4">
                    <LoadingSpinner label="Memuat kelas..." />
                  </div>
                ) : joinedClasses.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">
                    Belum bergabung ke kelas manapun.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {joinedClasses.map((cls) => (
                      <li key={cls.id}>
                        <button
                          onClick={() => setSelectedClass(cls.id)}
                          className={`w-full text-left p-3 rounded-xl border transition-all ${
                            selectedClass === cls.id
                              ? "border-[#525355]/60 bg-[#525355]/10 shadow-sm"
                              : "border-slate-200 hover:border-slate-300 hover:bg-[#F5EFE7]"
                          }`}
                        >
                          <p className="font-semibold text-slate-800 text-sm">
                            {cls.nama_kelas}
                          </p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {cls.kode_kelas}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Assignments panel */}
            <div className="md:col-span-2">
              {selectedClass ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full">
                  <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                    <h2 className="font-bold text-slate-800 text-lg">
                      Materi & Tugas
                    </h2>
                    <p className="text-sm text-slate-500">
                      Klik "Kerjakan" untuk mulai mengerjakan tugas.
                    </p>
                  </div>
                  <div className="p-6">
                    {loadingAssignments ? (
                      <div className="rounded-xl border border-slate-100 bg-[#F5EFE7]/60 p-6">
                        <LoadingSpinner label="Memuat tugas kelas..." />
                      </div>
                    ) : assignments.length === 0 ? (
                      <div className="flex flex-col items-center py-12 text-center text-slate-400">
                        <svg
                          className="mb-3"
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                        <p className="text-sm">Belum ada tugas dari guru.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {assignments.map((assg) => {
                          const isCompleted =
                            assg.submissionStatus === "completed";
                          const hasNilai =
                            isCompleted &&
                            assg.nilaiGuru !== null &&
                            assg.nilaiGuru !== undefined;
                          const isWaiting = isCompleted && !hasNilai;

                          return (
                            <div
                              key={assg.id}
                              className={`p-4 rounded-xl border transition-all ${
                                hasNilai
                                  ? "border-emerald-200 bg-emerald-50"
                                  : isWaiting
                                    ? "border-[#FF7675]/40  bg-[#FF7675]/10"
                                    : "border-slate-200  bg-white hover:border-[#525355]/30 hover:bg-[#525355]/5"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h3 className="font-bold text-slate-800">
                                      {assg.judul}
                                    </h3>
                                    <StatusBadge
                                      status={assg.submissionStatus}
                                      nilai={assg.nilaiGuru}
                                    />
                                  </div>
                                  <p className="text-xs text-slate-400 mb-2">
                                    {new Date(
                                      assg.created_at,
                                    ).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </p>
                                  <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-3">
                                    {assg.deskripsi}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handlePilihTugas(assg)}
                                className={`mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                  hasNilai
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    : isWaiting
                                      ? "bg-[#FF7675]  hover:bg-[#e56665]  text-white"
                                      : "bg-[#525355] hover:bg-[#3F4042]  text-white"
                                }`}
                              >
                                {hasNilai ? (
                                  <>
                                    Lihat Hasil <IconArrow size={14} />
                                  </>
                                ) : isWaiting ? (
                                  "Lihat Status"
                                ) : (
                                  <>
                                    Kerjakan <IconArrow size={14} />
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-64 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8">
                  <IconClass size={36} />
                  <p className="mt-3 text-slate-400 text-sm">
                    Pilih kelas di sebelah kiri untuk melihat tugas.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            TAB: RIWAYAT BELAJAR
        ════════════════════════════════════════ */}
        {activeTab === "riwayat" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 text-lg">
                Riwayat Belajar
              </h2>
              <p className="text-sm text-slate-500">
                Rekap seluruh tugas yang pernah kamu kerjakan.
              </p>
            </div>
            <div className="overflow-x-auto">
              {loadingRiwayat ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <LoadingSpinner label="Memuat riwayat belajar..." />
                </div>
              ) : riwayat.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-slate-400">
                  <IconHistory size={36} />
                  <p className="mt-3 text-sm">Belum ada riwayat belajar.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F5EFE7] text-left">
                      <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                        Tanggal
                      </th>
                      <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 text-center">
                        Foto jawaban
                      </th>
                      <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                        Soal (OCR)
                      </th>

                      <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 text-center">
                        Hasil Analisis
                      </th>
                      <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 text-center">
                        Nilai
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {riwayat.map((item) => {
                      // Panggil fungsi pembaca array foto di sini agar kode di bawah lebih bersih
                      const fotoUrls = getPhotoArray(item.image_url);
                      const thumbnailFoto = fotoUrls[0]; // Ambil foto pertama untuk thumbnail

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-[#F5EFE7] transition-colors"
                        >
                          <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap text-xs">
                            {new Date(item.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>

                          <td className="px-5 py-3.5 text-center">
                            {fotoUrls.length > 0 ? (
                              // Menggunakan flex untuk menjajarkan foto, justify-center agar tetap di tengah,
                              // dan flex-wrap agar jika fotonya terlalu banyak otomatis turun ke bawah (tidak merusak tabel)
                              <div className="flex items-center justify-center gap-2 flex-wrap">
                                {fotoUrls.map((url, index) => (
                                  <img
                                    key={index}
                                    src={url}
                                    alt={`Thumbnail Jawaban ${index + 1}`}
                                    className="w-10 h-10 object-cover rounded cursor-pointer border border-slate-200 hover:opacity-75 transition-opacity"
                                    onClick={() => setSelectedFoto(url)} // Klik foto mana saja, modal akan membesar sesuai foto tersebut
                                  />
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>

                          <td className="px-5 py-3.5 font-mono text-slate-600 text-xs truncate max-w-xs">
                            {item.ocr_result_text}
                          </td>

                          <td className="px-5 py-3.5 text-center">
                            {item.analisis_pembelajaran ? (
                              <button
                                onClick={() =>
                                  setSelectedAnalisis(
                                    item.analisis_pembelajaran,
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#525355]/10 text-[#525355] hover:bg-[#525355]/20 font-semibold rounded-lg text-xs transition-colors"
                              >
                                Lihat Analisis AI
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>

                          <td className="px-5 py-3.5 text-center">
                            {item.nilai !== null ? (
                              <span className="inline-block px-2.5 py-1 bg-[#525355]/15 text-[#525355] font-bold rounded-full text-xs">
                                {item.nilai}/100
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-1 bg-[#FF7675]/15 text-[#c94b4a] font-semibold rounded-full text-xs">
                                Menunggu
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
    TAB: LATIHAN AI
════════════════════════════════════════ */}
        {activeTab === "latihan" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: pilih topik & buat soal */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-800 text-lg">
                  Latihan Soal Mandiri
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Pilih topik & tingkat kesulitan, lalu minta AI membuatkan soal
                  untukmu.
                </p>
              </div>

              <div className="p-6 space-y-5">
                {!latihanSoal ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Topik
                      </label>
                      <select
                        value={latihanTopik}
                        onChange={(e) => setLatihanTopik(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-[#F5EFE7] focus:outline-none focus:ring-2 focus:ring-[#525355]/60"
                      >
                        {TOPIK_LIST.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Tingkat Kesulitan
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {TINGKAT_LIST.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setLatihanTingkat(t)}
                            className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                              latihanTingkat === t
                                ? "bg-[#525355] text-white border-[#525355]"
                                : "bg-[#F5EFE7] text-slate-500 border-slate-200 hover:border-[#525355]/40"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateSoal}
                      disabled={loadingSoal}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        loadingSoal
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-[#525355] hover:bg-[#3F4042] text-white shadow-sm hover:shadow-md"
                      }`}
                    >
                      {loadingSoal ? (
                        <>
                          <svg
                            className="animate-spin w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            />
                          </svg>
                          Membuat soal...
                        </>
                      ) : (
                        <>
                          <IconSparkle size={16} /> Buatkan Soal
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Soal yang dibuat AI */}
                    <div className="p-4 bg-[#525355]/10 border border-[#525355]/25 rounded-xl">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#525355]/60 mb-2">
                        Soal · {latihanTopik} ({latihanTingkat})
                      </p>
                      <p className="text-sm text-[#3F4042] whitespace-pre-wrap leading-relaxed">
                        {latihanSoal}
                      </p>
                    </div>

                    {!latihanResult ? (
                      <form
                        onSubmit={handleSubmitLatihan}
                        className="space-y-5"
                      >
                        <label className="block cursor-pointer group">
                          <div className="border-2 border-dashed border-slate-200 group-hover:border-[#525355]/60 rounded-xl p-8 text-center transition-colors bg-[#F5EFE7] group-hover:bg-[#525355]/10">
                            <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-[#525355] transition-colors">
                              <IconUpload size={28} />
                              <p className="font-semibold text-sm">
                                Klik untuk pilih foto jawaban
                              </p>
                              <p className="text-xs">
                                JPG, PNG — boleh lebih dari 1 foto
                              </p>
                            </div>
                            {latihanImages.length > 0 && (
                              <p className="mt-3 text-sm font-semibold text-[#525355]">
                                {latihanImages.length} foto terpilih ✓
                              </p>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            onChange={(e) => setLatihanImages(e.target.files)}
                          />
                        </label>

                        {latihanImages.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {Array.from(latihanImages).map((file, i) => (
                              <div
                                key={i}
                                className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0"
                              >
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleSoalBaru}
                            className="px-4 py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                          >
                            Ganti Soal
                          </button>
                          <button
                            type="submit"
                            disabled={loadingLatihanScan}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                              loadingLatihanScan
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-[#525355] hover:bg-[#3F4042] text-white shadow-sm hover:shadow-md"
                            }`}
                          >
                            {loadingLatihanScan ? (
                              <>
                                <svg
                                  className="animate-spin w-4 h-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8z"
                                  />
                                </svg>
                                Mengevaluasi...
                              </>
                            ) : (
                              "Kirim & Evaluasi"
                            )}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={handleSoalBaru}
                        className="w-full py-3 rounded-xl font-bold text-sm bg-[#525355] hover:bg-[#3F4042] text-white transition-all flex items-center justify-center gap-2"
                      >
                        <IconSparkle size={16} /> Coba Soal Baru
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right: hasil evaluasi AI */}
            <div>
              {latihanResult ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full">
                  <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#FF7675]/15 rounded-md flex items-center justify-center">
                      <IconSparkle size={14} />
                    </div>
                    <h3 className="font-bold text-slate-800">
                      Hasil Evaluasi AI
                    </h3>
                  </div>
                  <div className="p-6 space-y-5">
                    {latihanResult.nilai !== null &&
                      latihanResult.nilai !== undefined && (
                        <div className="p-4 bg-[#525355]/10 border border-[#525355]/25 rounded-xl text-center">
                          <p className="text-xs font-bold uppercase tracking-widest text-[#525355]/60 mb-1">
                            Nilai Kamu
                          </p>
                          <p className="text-4xl font-black text-[#525355]">
                            {latihanResult.nilai}
                            <span className="text-base font-bold text-[#525355]/60">
                              /100
                            </span>
                          </p>
                        </div>
                      )}

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                        Jawaban terdeteksi
                      </p>
                      <pre className="p-3 bg-[#F5EFE7] border border-slate-200 rounded-xl text-xs font-mono text-slate-700 overflow-auto whitespace-pre-wrap leading-relaxed">
                        {latihanResult.ocr_result_text}
                      </pre>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                        Umpan Balik Pembelajaran
                      </p>
                      <div className="p-4 bg-[#FF7675]/10 border border-[#FF7675]/30 rounded-xl text-sm text-[#7a1f1e] leading-relaxed">
                        {latihanResult.analisis_pembelajaran ? (
                          <div
                            className="space-y-2 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: latihanResult.analisis_pembelajaran,
                            }}
                          />
                        ) : (
                          <p className="italic text-[#FF7675]">
                            Tidak ada umpan balik.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-56 p-8 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="w-14 h-14 bg-[#FF7675]/10 rounded-xl flex items-center justify-center mb-4">
                    <IconSparkle size={24} />
                  </div>
                  <p className="text-slate-400 text-sm max-w-xs">
                    {latihanSoal
                      ? "Upload foto pengerjaanmu untuk melihat evaluasi AI di sini."
                      : "Buat soal terlebih dahulu untuk memulai latihan mandiri."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 safe-bottom">
        <div className="flex">
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                activeTab === id
                  ? "text-[#525355]"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={22} />
              <span className="leading-none">{label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
