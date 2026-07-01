import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, getAuthHeaders } from "../config/api";
import { Copy, Check } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   EXTERNAL SCRIPTS LOADER
   Loads jQuery → DataTables → SweetAlert2 once, in order.
───────────────────────────────────────────────────────────────────────────── */
function loadScript(src, id) {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing) {
      // Kalau sudah pernah load sukses sebelumnya, langsung resolve.
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      // Kalau tag ada tapi BELUM selesai load, tunggu event onload-nya,
      // jangan asumsikan sudah siap.
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error(`Failed to load ${src}`)),
      );
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.id = id;
    s.onload = () => {
      s.dataset.loaded = "true";
      resolve();
    };
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}
function loadLink(href, id) {
  if (document.getElementById(id)) return;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  l.id = id;
  document.head.appendChild(l);
}

let depsPromise = null;

async function ensureDeps() {
  if (depsPromise) return depsPromise; // re-render lain pakai promise yang sama
  depsPromise = (async () => {
    loadLink(
      "https://cdn.datatables.net/1.13.8/css/jquery.dataTables.min.css",
      "dt-css",
    );
    loadLink(
      "https://cdn.datatables.net/responsive/2.5.0/css/responsive.dataTables.min.css",
      "dt-resp-css",
    );
    await loadScript("https://code.jquery.com/jquery-3.7.1.min.js", "jquery");
    await loadScript(
      "https://cdn.datatables.net/1.13.8/js/jquery.dataTables.min.js",
      "dataTables",
    );
    await loadScript(
      "https://cdn.datatables.net/responsive/2.5.0/js/dataTables.responsive.min.js",
      "dt-resp",
    );
    await loadScript("https://cdn.jsdelivr.net/npm/sweetalert2@11", "swal2");
  })();
  return depsPromise;
}

/* SweetAlert2 helpers */
const swal = (opts) => window.Swal?.fire(opts);

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
  });

/* ─────────────────────────────────────────────────────────────────────────────
   INLINE ICONS
───────────────────────────────────────────────────────────────────────────── */
const Ico = {
  Class: () => (
    <svg
      width="18"
      height="18"
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
  ),
  Book: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Monitor: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  Logout: () => (
    <svg
      width="18"
      height="18"
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
  ),
  Plus: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Edit: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  ),
  Eye: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  X: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Check: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Star: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function GuruDashboard() {
  const [activeTab, setActiveTab] = useState("kelas");
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [viewingAssignment, setViewingAssignment] = useState(null);
  const [inputNilai, setInputNilai] = useState({});
  const [inputCatatan, setInputCatatan] = useState({});
  const [studentsData, setStudentsData] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [namaKelas, setNamaKelas] = useState("");
  const [deskripsiKelas, setDeskripsiKelas] = useState("");
  const [editingClassId, setEditingClassId] = useState(null);
  const [editNamaKelas, setEditNamaKelas] = useState("");
  const [editDeskripsiKelas, setEditDeskripsiKelas] = useState("");
  const [judulTugas, setJudulTugas] = useState("");
  const [deskripsiTugas, setDeskripsiTugas] = useState("");
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [editJudulTugas, setEditJudulTugas] = useState("");
  const [editDeskripsiTugas, setEditDeskripsiTugas] = useState("");
  const [pendingStudents, setPendingStudents] = useState([]);
  const [editingGradeId, setEditingGradeId] = useState(null);
  const [depsReady, setDepsReady] = useState(false);

  const dtRef = useRef(null); // DataTable instance ref
  const tableRef = useRef(null); // <table> DOM ref

  const navigate = useNavigate();

  const [copiedCode, setCopiedCode] = useState(null);
  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000); // Reset status setelah 2 detik
    } catch (err) {
      console.error("Gagal menyalin teks: ", err);
    }
  };

  const [selectedFoto, setSelectedFoto] = useState(null);
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

  const getPhotoArray = (rawUrl) => {
    if (!rawUrl) return [];
    try {
      const parsed = JSON.parse(rawUrl);
      // Pastikan hasilnya selalu Array, meskipun isinya cuma 1 foto
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      // Fallback jika bukan JSON yang valid
      return [rawUrl.replace(/[\[\]"\\]/g, "")];
    }
  };

  const handleCloseModal = () => {
    setSelectedFoto(null);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
    setInitialDistance(null);
  };
  /* Load external deps once */
  useEffect(() => {
    ensureDeps().then(() => setDepsReady(true));
  }, []);

  useEffect(() => {
    // Jika ada foto yang dipilih (modal terbuka)
    if (selectedFoto) {
      // Kunci scroll pada body
      document.body.style.overflow = "hidden";
    } else {
      // Kembalikan scroll pada body saat modal ditutup
      document.body.style.overflow = "auto";
    }

    // Cleanup function: pastikan scroll dikembalikan jika komponen tiba-tiba di-unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedFoto]); // Efek ini akan berjalan setiap kali state 'selectedFoto' berubah

  /* Init/destroy DataTable whenever monitoring data changes */
  // Effect 1: Init DataTables ONCE when deps are ready and tab is monitoring
  useEffect(() => {
    if (!depsReady || activeTab !== "monitoring" || !tableRef.current) return;
    const $ = window.$;
    if (!$ || dtRef.current) return; // already initialised

    dtRef.current = $(tableRef.current).DataTable({
      responsive: true,
      language: {
        search: "Cari:",
        lengthMenu: "Tampilkan _MENU_ baris",
        info: "Menampilkan _START_ - _END_ dari _TOTAL_ siswa",
        infoEmpty: "Tidak ada data siswa",
        emptyTable: "Belum ada data siswa resmi di kelas ini.",
        zeroRecords: "Tidak ada siswa yang cocok",
        paginate: { previous: "\u2039 Sebelumnya", next: "Berikutnya \u203a" },
      },
      pageLength: 10,
      columnDefs: [{ targets: [2, 3], className: "dt-center" }],
    });

    return () => {
      if (dtRef.current) {
        dtRef.current.destroy();
        dtRef.current = null;
      }
    };
  }, [depsReady, activeTab]);

  // Effect 2: Feed new rows to DataTables via its API — never touch tbody with React
  useEffect(() => {
    if (!dtRef.current) return;
    const dt = dtRef.current;
    dt.clear();
    studentsData.forEach((student) => {
      const val = Number(student.rata_rata_nilai);
      const color =
        val >= 80
          ? "#065f46,#d1fae5"
          : val >= 60
            ? "#92400e,#fef3c7"
            : "#991b1b,#fee2e2";
      const [textColor, bgColor] = color.split(",");
      dt.row.add([
        `<span class="font-semibold" style="color:#1e293b">${student.nama}</span>`,
        `<span style="color:#64748b">${student.email}</span>`,
        `<span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold" style="background:#d1fae5;color:#065f46">${student.jumlah_dikerjakan || 0}</span>`,
        `<span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold" style="background:${bgColor};color:${textColor}">${val.toFixed(1)}</span>`,
      ]);
    });
    dt.draw();
  }, [studentsData]);

  /* ── Data fetching ── */
  const fetchClasses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/guru/classes`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
        if (data.length > 0 && !selectedClassId) setSelectedClassId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (activeTab === "kelas") fetchClasses();
  }, [activeTab]);

  // Auto-refresh data terbaru saat tab/window kembali difokuskan
  useEffect(() => {
    const refetchCurrentTab = () => {
      if (activeTab === "kelas") {
        fetchClasses();
      } else if (activeTab === "monitoring" && selectedClassId) {
        fetch(`${API_BASE_URL}/guru/monitoring/${selectedClassId}`, {
          headers: getAuthHeaders(),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => data && setStudentsData(data));

        fetch(
          `${API_BASE_URL}/guru/classes/${selectedClassId}/pending-students`,
          {
            headers: getAuthHeaders(),
          },
        )
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => data && setPendingStudents(data));
      } else if (activeTab === "materi" && selectedClassId) {
        fetch(`${API_BASE_URL}/guru/assignments/${selectedClassId}`, {
          headers: getAuthHeaders(),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => data && setAssignments(data));
      }
    };

    window.addEventListener("focus", refetchCurrentTab);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") refetchCurrentTab();
    });

    return () => {
      window.removeEventListener("focus", refetchCurrentTab);
    };
  }, [activeTab, selectedClassId]);
  useEffect(() => {
    if (!selectedClassId) return;
    const fetchMonitoring = async () => {
      const res = await fetch(
        `${API_BASE_URL}/guru/monitoring/${selectedClassId}`,
        { headers: getAuthHeaders() },
      );
      if (res.ok) setStudentsData(await res.json());
    };
    const fetchAssignments = async () => {
      const res = await fetch(
        `${API_BASE_URL}/guru/assignments/${selectedClassId}`,
        { headers: getAuthHeaders() },
      );
      if (res.ok) setAssignments(await res.json());
    };
    const fetchPending = async () => {
      const res = await fetch(
        `${API_BASE_URL}/guru/classes/${selectedClassId}/pending-students`,
        { headers: getAuthHeaders() },
      );
      if (res.ok) setPendingStudents(await res.json());
    };
    if (activeTab === "monitoring") {
      fetchMonitoring();
      fetchPending();
    }
    if (activeTab === "materi") fetchAssignments();
  }, [activeTab, selectedClassId]);

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

  /* ── Student action ── */
  const handleStudentAction = async (memberId, action) => {
    try {
      const res = await fetch(`${API_BASE_URL}/guru/classes/action-student`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ member_id: memberId, action }),
      });
      if (res.ok) {
        toast(
          "success",
          action === "approved"
            ? "Siswa berhasil diterima!"
            : "Permintaan siswa ditolak.",
        );
        const [rp, rm] = await Promise.all([
          fetch(
            `${API_BASE_URL}/guru/classes/${selectedClassId}/pending-students`,
            { headers: getAuthHeaders() },
          ),
          fetch(`${API_BASE_URL}/guru/monitoring/${selectedClassId}`, {
            headers: getAuthHeaders(),
          }),
        ]);
        if (rp.ok) setPendingStudents(await rp.json());
        if (rm.ok) setStudentsData(await rm.json());
      }
    } catch (_) {
      toast("error", "Gagal memproses aksi.");
    }
  };

  /* ── Class CRUD ── */
  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          nama_kelas: namaKelas,
          deskripsi: deskripsiKelas,
        }),
      });
      if (res.ok) {
        toast("success", "Kelas berhasil dibuat!");
        setNamaKelas("");
        setDeskripsiKelas("");
        fetchClasses();
      }
    } catch (_) {
      toast("error", "Gagal membuat kelas.");
    }
  };

  const handleUpdateClass = async (e, classId) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/guru/classes/${classId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          nama_kelas: editNamaKelas,
          deskripsi: editDeskripsiKelas,
        }),
      });
      if (res.ok) {
        toast("success", "Kelas diperbarui!");
        setEditingClassId(null);
        fetchClasses();
      }
    } catch (_) {
      toast("error", "Gagal memperbarui kelas.");
    }
  };

  const handleDeleteClass = async (classId) => {
    const result = await confirm(
      "Hapus kelas ini?",
      "Semua data di dalamnya akan hilang secara permanen.",
      "Ya, hapus kelas",
    );
    if (!result?.isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE_URL}/guru/classes/${classId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        toast("success", "Kelas berhasil dihapus.");
        if (selectedClassId === classId) setSelectedClassId("");
        fetchClasses();
      }
    } catch (_) {
      toast("error", "Gagal menghapus kelas.");
    }
  };

  /* ── Assignment CRUD ── */
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!selectedClassId) {
      toast("warning", "Pilih kelas terlebih dahulu!");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/guru/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          class_id: selectedClassId,
          judul: judulTugas,
          deskripsi: deskripsiTugas,
        }),
      });
      if (res.ok) {
        toast("success", "Materi/Soal berhasil diposting!");
        setJudulTugas("");
        setDeskripsiTugas("");
        const r = await fetch(
          `${API_BASE_URL}/guru/assignments/${selectedClassId}`,
          { headers: getAuthHeaders() },
        );
        if (r.ok) setAssignments(await r.json());
      }
    } catch (_) {
      toast("error", "Gagal membuat materi/soal.");
    }
  };

  const handleUpdateAssignment = async (e, assignmentId) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${API_BASE_URL}/guru/assignments/${assignmentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({
            judul: editJudulTugas,
            deskripsi: editDeskripsiTugas,
          }),
        },
      );
      if (res.ok) {
        toast("success", "Materi/Soal diperbarui!");
        setEditingAssignmentId(null);
        const r = await fetch(
          `${API_BASE_URL}/guru/assignments/${selectedClassId}`,
          { headers: getAuthHeaders() },
        );
        if (r.ok) setAssignments(await r.json());
      }
    } catch (_) {
      toast("error", "Gagal memperbarui.");
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    const result = await confirm(
      "Hapus materi/soal ini?",
      "Tindakan ini tidak bisa dibatalkan.",
      "Ya, hapus",
    );
    if (!result?.isConfirmed) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/guru/assignments/${assignmentId}`,
        { method: "DELETE", headers: getAuthHeaders() },
      );
      if (res.ok) {
        toast("success", "Materi/Soal dihapus.");
        if (viewingAssignment?.id === assignmentId) setViewingAssignment(null);
        const r = await fetch(
          `${API_BASE_URL}/guru/assignments/${selectedClassId}`,
          { headers: getAuthHeaders() },
        );
        if (r.ok) setAssignments(await r.json());
      }
    } catch (_) {
      toast("error", "Gagal menghapus.");
    }
  };

  const fetchSubmissions = async (assignment) => {
    // Toggle: kalau assignment yang sama sedang terbuka, tutup saja
    if (viewingAssignment?.id === assignment.id) {
      setViewingAssignment(null);
      setSubmissions([]);
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE_URL}/guru/assignments/${assignment.id}/submissions`,
        { headers: getAuthHeaders() },
      );
      if (res.ok) {
        setSubmissions(await res.json());
        setViewingAssignment(assignment);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveGrade = async (submissionId, currentNilai) => {
    const score = inputNilai[submissionId];
    const note = inputCatatan[submissionId] || "";
    if (score === undefined || score === "") {
      toast("warning", "Masukkan nilai terlebih dahulu!");
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE_URL}/guru/submissions/${submissionId}/grade`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ nilai: parseInt(score), catatan_guru: note }),
        },
      );
      if (res.ok) {
        toast(
          "success",
          currentNilai !== null
            ? "Nilai berhasil diubah!"
            : "Nilai berhasil disimpan!",
        );
        setEditingGradeId(null);
        fetchSubmissions(viewingAssignment);
      } else {
        const err = await res.json();
        toast("error", err.error || "Terjadi kesalahan.");
      }
    } catch (_) {
      toast("error", "Terjadi kesalahan saat menyimpan nilai.");
    }
  };

  /* ── Helpers ── */
  const selectedClassName =
    classes.find((c) => c.id === selectedClassId)?.nama_kelas || "";

  const navItems = [
    { id: "kelas", label: "Kelola Kelas", Icon: Ico.Class },
    { id: "materi", label: "Materi & Soal", Icon: Ico.Book },
    { id: "monitoring", label: "Monitoring Siswa", Icon: Ico.Monitor },
  ];

  /* ═══════════════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#F5EFE7] font-sans">
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
      {/* ── HEADER ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#525355] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold text-slate-800 tracking-tight">
                MathScan
              </span>
              <span className="ml-2 text-xs font-medium text-[#525355] bg-[#525355]/10 px-2 py-0.5 rounded-full">
                Guru
              </span>
            </div>
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
                <Icon />
                {label}
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#FF7675] transition-colors px-3 py-2 rounded-lg hover:bg-[#FF7675]/10"
          >
            <Ico.Logout />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* ── CLASS SELECTOR ribbon (shown on materi & monitoring) ── */}
      {activeTab !== "kelas" && classes.length > 0 && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
              Kelas Aktif:
            </span>
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedClassId === cls.id
                      ? "bg-[#525355] text-white border-[#525355] shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-[#525355]/40 hover:text-[#525355]"
                  }`}
                >
                  {cls.nama_kelas}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
        {/* ═══════════════════════════════════════════════════════
            TAB: KELOLA KELAS
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "kelas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Create class card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-800 text-lg">
                  Buat Kelas Baru
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Isi detail kelas, lalu bagikan kode ke siswa.
                </p>
              </div>
              <div className="p-6">
                <form onSubmit={handleCreateClass} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Nama Kelas
                    </label>
                    <input
                      type="text"
                      required
                      value={namaKelas}
                      onChange={(e) => setNamaKelas(e.target.value)}
                      placeholder="Contoh: Matematika 10A"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-[#F5EFE7] focus:outline-none focus:ring-2 focus:ring-[#525355]/60 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Deskripsi
                    </label>
                    <textarea
                      required
                      value={deskripsiKelas}
                      rows={3}
                      onChange={(e) => setDeskripsiKelas(e.target.value)}
                      placeholder="Deskripsi singkat kelas..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-[#F5EFE7] focus:outline-none focus:ring-2 focus:ring-[#525355]/60 focus:border-transparent resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#525355] hover:bg-[#3e3f40] text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Ico.Plus /> Buat Kelas
                  </button>
                </form>
              </div>
            </div>

            {/* Class list card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-800 text-lg">Kelas Saya</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {classes.length} kelas terdaftar.
                </p>
              </div>
              <div className="p-6">
                {classes.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-slate-400">
                    <Ico.Class />
                    <p className="mt-3 text-sm">
                      Belum ada kelas. Buat kelas pertamamu!
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {classes.map((cls) => (
                      <li
                        key={cls.id}
                        className="border border-slate-200 rounded-xl overflow-hidden"
                      >
                        {editingClassId === cls.id ? (
                          <form
                            onSubmit={(e) => handleUpdateClass(e, cls.id)}
                            className="p-4 space-y-3 bg-amber-50"
                          >
                            <input
                              type="text"
                              required
                              value={editNamaKelas}
                              onChange={(e) => setEditNamaKelas(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <textarea
                              required
                              value={editDeskripsiKelas}
                              rows={2}
                              onChange={(e) =>
                                setEditDeskripsiKelas(e.target.value)
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-1"
                              >
                                <Ico.Check /> Simpan
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingClassId(null)}
                                className="px-4 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 flex items-center gap-1"
                              >
                                <Ico.X /> Batal
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="font-bold text-slate-800 truncate">
                                  {cls.nama_kelas}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                  {cls.deskripsi}
                                </p>
                              </div>
                              <button
                                onClick={() => handleCopy(cls.kode_kelas)}
                                className="flex-shrink-0 flex items-center gap-1.5 font-mono text-xs font-bold text-[#525355] bg-[#525355]/10 border border-[#525355]/25 px-2.5 py-1 rounded-lg hover:bg-[#525355]/20 active:scale-95 transition-all duration-200 group relative"
                                title="Klik untuk menyalin"
                              >
                                <span>{cls.kode_kelas}</span>
                                {copiedCode === cls.kode_kelas ? (
                                  <Check className="w-3.5 h-3.5 text-green-600 transition-transform animate-scaleUp" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                                )}
                              </button>
                            </div>
                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                              <button
                                onClick={() => {
                                  setEditingClassId(cls.id);
                                  setEditNamaKelas(cls.nama_kelas);
                                  setEditDeskripsiKelas(cls.deskripsi);
                                }}
                                className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                              >
                                <Ico.Edit /> Edit
                              </button>
                              <span className="w-px h-3 bg-slate-200" />
                              <button
                                onClick={() => handleDeleteClass(cls.id)}
                                className="flex items-center gap-1 text-xs font-semibold text-[#FF7675] hover:text-[#e56665] transition-colors"
                              >
                                <Ico.Trash /> Hapus
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB: MATERI & SOAL
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "materi" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Create assignment */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-800 text-lg">
                  Buat Materi / Soal
                </h2>
                {selectedClassName && (
                  <p className="text-xs text-[#525355] font-semibold mt-1">
                    untuk {selectedClassName}
                  </p>
                )}
              </div>
              <div className="p-6">
                <form onSubmit={handleCreateAssignment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Judul Topik / Soal
                    </label>
                    <input
                      type="text"
                      required
                      value={judulTugas}
                      onChange={(e) => setJudulTugas(e.target.value)}
                      placeholder="Contoh: Soal Aljabar Linear"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-[#F5EFE7] focus:outline-none focus:ring-2 focus:ring-[#525355]/60 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Isi Materi / Pertanyaan
                    </label>
                    <textarea
                      required
                      value={deskripsiTugas}
                      rows={6}
                      onChange={(e) => setDeskripsiTugas(e.target.value)}
                      placeholder="Tuliskan soal atau penjelasan materi di sini..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-[#F5EFE7] focus:outline-none focus:ring-2 focus:ring-[#525355]/60 focus:border-transparent resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Ico.Plus /> Posting ke Kelas
                  </button>
                </form>
              </div>
            </div>

            {/* Assignment list */}
            <div className="lg:col-span-2 space-y-4">
              {!selectedClassId ? (
                <div className="flex flex-col items-center justify-center h-48 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                  <Ico.Book />
                  <p className="mt-2 text-sm">
                    Pilih kelas di atas untuk melihat materi.
                  </p>
                </div>
              ) : assignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                  <Ico.Book />
                  <p className="mt-2 text-sm">
                    Belum ada materi atau soal di kelas ini.
                  </p>
                </div>
              ) : (
                assignments.map((assg) => (
                  <div
                    key={assg.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    {editingAssignmentId === assg.id ? (
                      <form
                        onSubmit={(e) => handleUpdateAssignment(e, assg.id)}
                        className="p-6 space-y-3 bg-amber-50"
                      >
                        <input
                          type="text"
                          required
                          value={editJudulTugas}
                          onChange={(e) => setEditJudulTugas(e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <textarea
                          required
                          value={editDeskripsiTugas}
                          rows={4}
                          onChange={(e) =>
                            setEditDeskripsiTugas(e.target.value)
                          }
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-1"
                          >
                            <Ico.Check /> Simpan
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingAssignmentId(null)}
                            className="px-4 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1"
                          >
                            <Ico.X /> Batal
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="font-bold text-slate-800 text-base">
                                {assg.judul}
                              </h3>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {new Date(assg.created_at).toLocaleString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => {
                                  setEditingAssignmentId(assg.id);
                                  setEditJudulTugas(assg.judul);
                                  setEditDeskripsiTugas(assg.deskripsi);
                                }}
                                className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg transition-colors"
                              >
                                <Ico.Edit /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAssignment(assg.id)}
                                className="flex items-center gap-1 text-xs font-semibold text-[#FF7675] hover:text-[#e56665] bg-[#FF7675]/10 hover:bg-[#FF7675]/20 px-2.5 py-1.5 rounded-lg transition-colors"
                              >
                                <Ico.Trash /> Hapus
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap mt-3 leading-relaxed">
                            {assg.deskripsi}
                          </p>
                          <button
                            onClick={() => fetchSubmissions(assg)}
                            className={`mt-4 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                              viewingAssignment?.id === assg.id
                                ? "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                                : "bg-[#525355]/10 hover:bg-[#525355]/20 text-[#525355] border-[#525355]/25"
                            }`}
                          >
                            {viewingAssignment?.id === assg.id ? (
                              <>
                                <Ico.X /> Sembunyikan Hasil Pengerjaan
                              </>
                            ) : (
                              <>
                                <Ico.Eye /> Lihat Hasil Pengerjaan Siswa
                              </>
                            )}
                          </button>
                        </div>

                        {/* Submissions panel */}
                        {viewingAssignment?.id === assg.id && (
                          <div className="border-t border-[#525355]/20 bg-[#525355]/5">
                            <div className="px-5 py-4 flex items-center justify-between border-b border-[#525355]/20">
                              <h4 className="font-bold text-[#3e3f40]">
                                Hasil: {viewingAssignment.judul}
                              </h4>
                              <button
                                onClick={() => setViewingAssignment(null)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#525355]/20 text-[#525355] transition-colors"
                              >
                                <Ico.X />
                              </button>
                            </div>

                            <div className="p-5">
                              {submissions.length === 0 ? (
                                <p className="text-sm text-slate-500 italic text-center py-6">
                                  Belum ada siswa yang mengerjakan tugas ini.
                                </p>
                              ) : (
                                <div className="space-y-4">
                                  {submissions.map((sub) => {
                                    let photos = [];
                                    try {
                                      photos = JSON.parse(sub.image_url);
                                      if (!Array.isArray(photos)) photos = [];
                                    } catch (_) {}

                                    return (
                                      <div
                                        key={sub.id}
                                        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                                      >
                                        {/* Student header */}
                                        <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100 bg-[#F5EFE7]">
                                          <div>
                                            <p className="font-bold text-slate-800">
                                              {sub.nama}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                              {new Date(
                                                sub.created_at,
                                              ).toLocaleString("id-ID")}
                                            </p>
                                          </div>
                                          {sub.nilai !== null ? (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-sm">
                                              <Ico.Star /> {sub.nilai} / 100
                                            </div>
                                          ) : (
                                            <div className="px-3 py-1 bg-amber-100 text-amber-700 font-semibold rounded-full text-xs animate-pulse">
                                              Belum Dinilai
                                            </div>
                                          )}
                                        </div>

                                        <div className="p-5 space-y-4">
                                          {/* Photos */}
                                          {photos.length > 0 && (
                                            <div>
                                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                                Foto Pengerjaan
                                              </p>
                                              <div className="flex gap-2 flex-wrap">
                                                {photos.map((photo, idx) => (
                                                  <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() =>
                                                      setSelectedFoto(photo)
                                                    }
                                                    className="overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-[#525355]"
                                                  >
                                                    <img
                                                      src={`${photo}`}
                                                      alt={`Foto ${idx + 1}`}
                                                      className="h-20 w-20 object-cover border border-slate-200 rounded-lg shadow-sm hover:scale-105 transition-transform cursor-zoom-in"
                                                    />
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* OCR + AI */}
                                          <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                              Hasil OCR
                                            </p>
                                            <pre className="p-3 bg-[#F5EFE7] border border-slate-200 rounded-lg text-xs font-mono text-slate-600 overflow-auto whitespace-pre-wrap">
                                              {sub.ocr_result_text}
                                            </pre>
                                          </div>

                                          {sub.analisis_pembelajaran && (
                                            <div>
                                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                                Analisis AI
                                              </p>
                                              <div
                                                className="p-4 bg-[#FF7675]/10 border border-[#FF7675]/30 rounded-lg text-sm text-[#7a1f1e] border-l-4 border-l-[#FF7675]"
                                                dangerouslySetInnerHTML={{
                                                  __html:
                                                    sub.analisis_pembelajaran,
                                                }}
                                              />
                                            </div>
                                          )}

                                          {/* Grade form */}
                                          {sub.nilai !== null &&
                                          editingGradeId !== sub.id ? (
                                            <div className="flex justify-end">
                                              <button
                                                onClick={() => {
                                                  setEditingGradeId(sub.id);
                                                  setInputNilai({
                                                    ...inputNilai,
                                                    [sub.id]: sub.nilai,
                                                  });
                                                  setInputCatatan({
                                                    ...inputCatatan,
                                                    [sub.id]:
                                                      sub.catatan_guru || "",
                                                  });
                                                }}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-sm transition-colors"
                                              >
                                                <Ico.Edit /> Ubah Nilai
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="p-4 bg-[#525355]/10 border border-[#525355]/25 rounded-xl relative">
                                              {sub.nilai !== null && (
                                                <button
                                                  onClick={() =>
                                                    setEditingGradeId(null)
                                                  }
                                                  className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#525355]/20 text-[#525355]/60 transition-colors"
                                                >
                                                  <Ico.X />
                                                </button>
                                              )}
                                              <p className="text-xs font-bold text-[#3e3f40] mb-3">
                                                {sub.nilai !== null
                                                  ? "Ubah Penilaian"
                                                  : "Berikan Penilaian"}
                                              </p>
                                              <div className="flex flex-col sm:flex-row gap-3">
                                                <div className="sm:w-28">
                                                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                                                    Skor (0–100)
                                                  </label>
                                                  <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={
                                                      inputNilai[sub.id] || ""
                                                    }
                                                    onChange={(e) =>
                                                      setInputNilai({
                                                        ...inputNilai,
                                                        [sub.id]:
                                                          e.target.value,
                                                      })
                                                    }
                                                    placeholder="85"
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#525355]/60"
                                                  />
                                                </div>
                                                <div className="flex-1">
                                                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                                                    Catatan Guru (opsional)
                                                  </label>
                                                  <input
                                                    type="text"
                                                    value={
                                                      inputCatatan[sub.id] || ""
                                                    }
                                                    onChange={(e) =>
                                                      setInputCatatan({
                                                        ...inputCatatan,
                                                        [sub.id]:
                                                          e.target.value,
                                                      })
                                                    }
                                                    placeholder="Bagus! / Perhatikan rumus..."
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#525355]/60"
                                                  />
                                                </div>
                                                <div className="flex items-end">
                                                  <button
                                                    onClick={() =>
                                                      handleSaveGrade(
                                                        sub.id,
                                                        sub.nilai,
                                                      )
                                                    }
                                                    className={`px-5 py-2 text-white font-bold rounded-lg text-sm transition-colors whitespace-nowrap ${
                                                      sub.nilai !== null
                                                        ? "bg-amber-600 hover:bg-amber-700"
                                                        : "bg-[#525355] hover:bg-[#3e3f40]"
                                                    }`}
                                                  >
                                                    {sub.nilai !== null
                                                      ? "Update"
                                                      : "Simpan Nilai"}
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB: MONITORING SISWA
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "monitoring" && (
          <div className="space-y-5">
            {/* Pending approval */}
            {pendingStudents.length > 0 && (
              <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
                  <span className="w-6 h-6 bg-amber-400 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {pendingStudents.length}
                  </span>
                  <h2 className="font-bold text-amber-800">
                    Menunggu Persetujuan Bergabung
                  </h2>
                </div>
                <div className="p-5 space-y-3">
                  {pendingStudents.map((student) => (
                    <div
                      key={student.member_id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-amber-50 border border-amber-200 rounded-xl gap-3"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {student.nama}
                        </p>
                        <p className="text-xs text-slate-500">
                          {student.email}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleStudentAction(student.member_id, "approved")
                          }
                          className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                          <Ico.Check /> Terima
                        </button>
                        <button
                          onClick={() =>
                            handleStudentAction(student.member_id, "rejected")
                          }
                          className="flex items-center gap-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
                        >
                          <Ico.X /> Tolak
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Student performance DataTable */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-800 text-lg">
                  Performa Siswa
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {selectedClassName
                    ? `Kelas ${selectedClassName}`
                    : "Pilih kelas untuk melihat data."}
                </p>
              </div>
              <div className="p-5 overflow-x-auto">
                {/* DataTables styles override to fit our design */}
                <style>{`
                  table.dataTable thead th {
                    background: #F5EFE7;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: #64748b;
                    font-weight: 700;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 12px 16px;
                  }
                  table.dataTable tbody td {
                    padding: 12px 16px;
                    font-size: 0.875rem;
                    color: #334155;
                    border-bottom: 1px solid #f1f5f9;
                  }
                  table.dataTable tbody tr:hover td { background: #F5EFE7; }
                  table.dataTable tbody tr:last-child td { border-bottom: none; }
                  .dataTables_wrapper .dataTables_filter input {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 6px 12px;
                    font-size: 0.875rem;
                    outline: none;
                    margin-left: 6px;
                  }
                  .dataTables_wrapper .dataTables_filter input:focus { border-color: #525355; }
                  .dataTables_wrapper .dataTables_length select {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 4px 8px;
                    font-size: 0.875rem;
                    margin: 0 4px;
                  }
                  .dataTables_wrapper .dataTables_info { font-size: 0.8rem; color: #94a3b8; padding-top: 12px; }
                  .dataTables_wrapper .dataTables_paginate { padding-top: 12px; }
                  .dataTables_wrapper .dataTables_paginate .paginate_button {
                    border-radius: 8px !important;
                    font-size: 0.8rem !important;
                    border: none !important;
                    padding: 4px 10px !important;
                  }
                  .dataTables_wrapper .dataTables_paginate .paginate_button.current {
                    background: #525355 !important;
                    color: white !important;
                  }
                  .dataTables_wrapper .dataTables_paginate .paginate_button:hover:not(.current) {
                    background: #F5EFE7 !important;
                    color: #1e293b !important;
                  }
                  table.dataTable { border-collapse: collapse !important; }
                `}</style>
                {/* tbody is intentionally empty — DataTables owns all row mutations */}
                <table
                  ref={tableRef}
                  className="w-full text-sm"
                  style={{ width: "100%" }}
                >
                  <thead>
                    <tr>
                      <th>Nama Siswa</th>
                      <th>Email</th>
                      <th className="text-center">Tugas Dikerjakan</th>
                      <th className="text-center">Rata-rata Nilai</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30">
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
              <Icon />
              <span className="leading-none text-[10px]">
                {label.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
