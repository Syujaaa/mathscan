import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, getAuthHeaders } from "../config/api";

// ─── Load CDN scripts/links once ──────────────────────────────────────────────
function useScript(src, id) {
  useEffect(() => {
    if (document.getElementById(id)) return;
    const s = document.createElement("script");
    s.src = src;
    s.id = id;
    s.async = true;
    document.body.appendChild(s);
  }, [src, id]);
}
function useLink(href, id) {
  useEffect(() => {
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    l.id = id;
    document.head.appendChild(l);
  }, [href, id]);
}
// ──────────────────────────────────────────────────────────────────────────────

// Helpers: render badge & action buttons as HTML strings for DataTables
const roleBadgeHtml = (r) =>
  r === "guru"
    ? `<span class="dt-badge dt-badge-guru"><span class="dt-dot dt-dot-guru"></span>GURU</span>`
    : `<span class="dt-badge dt-badge-siswa"><span class="dt-dot dt-dot-siswa"></span>SISWA</span>`;

const actionHtml = (id, nama) =>
  `<div class="dt-actions">
    <button class="dt-btn-edit" data-id="${id}" data-nama="${encodeURIComponent(nama)}">
      <svg class="dt-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
      </svg>Edit
    </button>
    <button class="dt-btn-hapus" data-id="${id}" data-nama="${encodeURIComponent(nama)}">
      <svg class="dt-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
      </svg>Hapus
    </button>
  </div>`;

export default function AdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats kept separately — lightweight, no DT involvement
  const [stats, setStats] = useState({ total: 0, guru: 0, siswa: 0 });

  const tableRef = useRef(null);
  const dtRef = useRef(null); // DataTables instance
  const usersMapRef = useRef({}); // id → full user object cache
  const dtReadyRef = useRef(false); // has DT been inited at least once?

  const navigate = useNavigate();

  // Form state
  const [currentId, setCurrentId] = useState(null);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("siswa");

  // ── CDN deps ──────────────────────────────────────────────────────────────
  useLink(
    "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css",
    "swal2-css",
  );
  useScript(
    "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js",
    "swal2-js",
  );
  useLink(
    "https://cdn.datatables.net/1.13.6/css/dataTables.tailwindcss.min.css",
    "dt-css",
  );
  useScript("https://code.jquery.com/jquery-3.7.0.min.js", "jquery-js");
  useScript(
    "https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js",
    "dt-js",
  );
  // ─────────────────────────────────────────────────────────────────────────

  // ── Swal helper ───────────────────────────────────────────────────────────
  const getSwal = () =>
    new Promise((res) => {
      const c = () => (window.Swal ? res(window.Swal) : setTimeout(c, 80));
      c();
    });

  const toast = useCallback(async (icon, title) => {
    const Swal = await getSwal();
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 2800,
      timerProgressBar: true,
      customClass: { popup: "swal-toast-custom" },
    });
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  // ── Recompute stats from cache ─────────────────────────────────────────
  const refreshStats = useCallback(() => {
    const all = Object.values(usersMapRef.current);
    setStats({
      total: all.length,
      guru: all.filter((u) => u.role === "guru").length,
      siswa: all.filter((u) => u.role === "siswa").length,
    });
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  // ── Init DataTables ONCE ──────────────────────────────────────────────────
  //    We attach click handlers via event delegation so they always work
  //    regardless of pagination / search filtering.
  const openEditModalRef = useRef(null);
  const handleDeleteRef = useRef(null);

  const initDT = useCallback((initialRows) => {
    const $ = window.$;
    if (!$ || !$.fn?.DataTable || dtReadyRef.current) return;
    dtReadyRef.current = true;

    dtRef.current = $(tableRef.current).DataTable({
      data: initialRows,
      columns: [
        {
          title: "ID",
          data: "id",
          render: (d) => `<span class="text-slate-400 text-sm">#${d}</span>`,
        },
        {
          title: "Nama Lengkap",
          data: "nama",
          render: (d) => `<span class="font-medium text-slate-800">${d}</span>`,
        },
        {
          title: "Email",
          data: "email",
          render: (d) => `<span class="text-slate-500 text-sm">${d}</span>`,
        },
        {
          title: "Role",
          data: "role",
          className: "text-center",
          render: (d) => roleBadgeHtml(d),
        },
        {
          title: "Aksi",
          data: "id",
          className: "text-center",
          orderable: false,
          render: (d, _t, row) => actionHtml(d, row.nama),
        },
      ],
      language: {
        search: "Cari:",
        lengthMenu: "Tampilkan _MENU_ data",
        info: "Menampilkan _START_–_END_ dari _TOTAL_ pengguna",
        infoEmpty: "Tidak ada data",
        paginate: { previous: "‹ Sebelum", next: "Berikut ›" },
        zeroRecords: "Tidak ada hasil ditemukan",
        emptyTable: "Belum ada pengguna terdaftar",
      },
      pageLength: 10,
      order: [[0, "asc"]],
      responsive: true,
      dom: '<"flex flex-wrap gap-2 items-center justify-between mb-4"lf>t<"flex flex-wrap gap-2 items-center justify-between mt-4"ip>',
    });

    // ── Event delegation — works across all pages ─────────────────────────
    $(tableRef.current).on("click", ".dt-btn-edit", function () {
      const id = parseInt(this.dataset.id, 10);
      const user = usersMapRef.current[id];
      if (user && openEditModalRef.current) openEditModalRef.current(user);
    });
    $(tableRef.current).on("click", ".dt-btn-hapus", function () {
      const id = parseInt(this.dataset.id, 10);
      const nama = decodeURIComponent(this.dataset.nama);
      if (handleDeleteRef.current) handleDeleteRef.current(id, nama);
    });
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  // ── Initial fetch — loads data AND inits DT ───────────────────────────────
  useEffect(() => {
    const tryLoad = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/users`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();

        // Populate cache
        usersMapRef.current = {};
        data.forEach((u) => {
          usersMapRef.current[u.id] = u;
        });
        refreshStats();

        // Wait for jQuery + DT then init with full dataset
        const wait = () => {
          if (window.$ && window.$.fn?.DataTable) initDT(data);
          else setTimeout(wait, 120);
        };
        wait();
      } catch {
        toast("error", "Gagal memuat data pengguna");
      }
    };
    tryLoad();
    return () => {
      if (dtRef.current) {
        dtRef.current.destroy();
        dtRef.current = null;
        dtReadyRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    const Swal = await getSwal();
    const r = await Swal.fire({
      title: "Keluar dari sesi?",
      text: "Kamu perlu login kembali untuk mengakses dashboard.",
      icon: "question",
      iconColor: "#6366f1",
      showCancelButton: true,
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
      customClass: { popup: "rounded-2xl" },
    });
    if (r.isConfirmed) {
      localStorage.clear();
      navigate("/login");
    }
  };

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentId(null);
    setNama("");
    setEmail("");
    setPassword("");
    setRole("siswa");
    setIsModalOpen(true);
  };

  const openEditModal = useCallback((user) => {
    setIsEditMode(true);
    setCurrentId(user.id);
    setNama(user.nama);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
    setIsModalOpen(true);
  }, []);

  // Keep refs in sync so DT click handlers always call the latest version
  openEditModalRef.current = openEditModal;

  // ── Submit: add or update row in-place via DT API ─────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const Swal = await getSwal();
    const dt = dtRef.current;

    const url = isEditMode
      ? `${API_BASE_URL}/admin/users/${currentId}`
      : `${API_BASE_URL}/admin/users`;
    const method = isEditMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ nama, email, role, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        const savedUser = data.user ?? {
          id: currentId ?? data.id,
          nama,
          email,
          role,
        };

        if (isEditMode) {
          // ── Update existing row without touching others ──────────────────
          usersMapRef.current[savedUser.id] = savedUser;

          if (dt) {
            dt.rows((_, rowData) => rowData.id === savedUser.id).every(
              function () {
                this.data(savedUser).invalidate();
              },
            );
            dt.draw(false); // false = stay on current page
          }
        } else {
          // ── Add new row at the top ────────────────────────────────────────
          usersMapRef.current[savedUser.id] = savedUser;
          if (dt) {
            dt.row.add(savedUser).draw(false);
          }
        }

        refreshStats();

        Swal.fire({
          icon: "success",
          title: isEditMode ? "Berhasil diperbarui!" : "Pengguna ditambahkan!",
          text: isEditMode
            ? `Data ${nama} telah berhasil disimpan.`
            : `Akun baru untuk ${nama} sudah aktif.`,
          confirmButtonColor: "#6366f1",
          confirmButtonText: "Oke",
          customClass: { popup: "rounded-2xl" },
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan",
          text: data.error || "Terjadi kesalahan, coba lagi.",
          confirmButtonColor: "#ef4444",
          customClass: { popup: "rounded-2xl" },
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Koneksi gagal",
        text: "Tidak dapat terhubung ke server.",
        confirmButtonColor: "#ef4444",
        customClass: { popup: "rounded-2xl" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete: remove row in-place via DT API ────────────────────────────────
  const handleDeleteUser = useCallback(
    async (id, namaUser) => {
      const Swal = await getSwal();
      const r = await Swal.fire({
        title: `Hapus "${namaUser}"?`,
        html: `<p class="text-gray-600 text-sm">Semua data pengerjaan milik <strong>${namaUser}</strong> akan ikut terhapus secara permanen.<br/>Tindakan ini tidak dapat dibatalkan.</p>`,
        icon: "warning",
        iconColor: "#f59e0b",
        showCancelButton: true,
        confirmButtonText: "Ya, Hapus Sekarang",
        cancelButtonText: "Batal",
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        reverseButtons: true,
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "rounded-lg",
          cancelButton: "rounded-lg",
        },
      });
      if (!r.isConfirmed) return;

      try {
        const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });

        if (res.ok) {
          // Remove from cache
          delete usersMapRef.current[id];

          // Remove from DT without redraw flash
          const dt = dtRef.current;
          if (dt) {
            dt.rows((_, rowData) => rowData.id === id)
              .remove()
              .draw(false);
          }

          refreshStats();
          toast("success", `${namaUser} berhasil dihapus`);
        } else {
          const data = await res.json();
          toast("error", data.error || "Gagal menghapus pengguna");
        }
      } catch {
        toast("error", "Terjadi kesalahan pada server");
      }
    },
    [refreshStats, toast],
  );

  // Keep ref in sync
  handleDeleteRef.current = handleDeleteUser;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        body { background: #f1f5f9; }

        /* ── DataTables tweaks ───────────────────────────────────────────── */
        .dataTables_wrapper .dataTables_filter input {
          border: 1px solid #e2e8f0; border-radius: .5rem;
          padding: .35rem .75rem; font-size: .875rem; outline: none; transition: border-color .15s;
        }
        .dataTables_wrapper .dataTables_filter input:focus {
          border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,.15);
        }
        .dataTables_wrapper .dataTables_length select {
          border: 1px solid #e2e8f0; border-radius: .5rem; padding: .35rem .5rem; font-size: .875rem;
        }
        .dataTables_wrapper .dataTables_paginate .paginate_button {
          border-radius: .375rem !important; padding: .25rem .65rem !important;
          margin: 0 2px; font-size: .8125rem;
        }
        .dataTables_wrapper .dataTables_paginate .paginate_button.current {
          background: #6366f1 !important; color: #fff !important; border: none !important;
        }
        .dataTables_wrapper .dataTables_paginate .paginate_button:hover:not(.current) {
          background: #ede9fe !important; color: #4f46e5 !important; border: none !important;
        }
        .dataTables_wrapper .dataTables_info { font-size: .8125rem; color: #64748b; }
        table.dataTable thead th {
          background: #f8fafc; color: #475569; font-size: .75rem; font-weight: 600;
          letter-spacing: .06em; text-transform: uppercase;
          border-bottom: 2px solid #e2e8f0 !important; padding: .875rem 1rem;
        }
        table.dataTable tbody td { padding: .875rem 1rem; border-bottom: 1px solid #f1f5f9; }
        table.dataTable tbody tr:hover td { background: #f8fafc; }
        table.dataTable { border-collapse: collapse !important; }

        /* ── Badge styles (rendered inside DT cells) ─────────────────────── */
        .dt-badge {
          display: inline-flex; align-items: center; gap: .25rem;
          padding: .2rem .65rem; border-radius: 9999px; font-size: .7rem; font-weight: 700; border-width: 1px;
        }
        .dt-badge-guru  { background:#f3e8ff; color:#6d28d9; border-color:#ddd6fe; }
        .dt-badge-siswa { background:#e0f2fe; color:#0369a1; border-color:#bae6fd; }
        .dt-dot  { width:.375rem; height:.375rem; border-radius:50%; display:inline-block; }
        .dt-dot-guru  { background:#7c3aed; }
        .dt-dot-siswa { background:#0284c7; }

        /* ── Action buttons (rendered inside DT cells) ───────────────────── */
        .dt-actions { display:flex; align-items:center; justify-content:center; gap:.375rem; }
        .dt-btn-edit, .dt-btn-hapus {
          display:inline-flex; align-items:center; gap:.25rem;
          padding:.3rem .6rem; border-radius:.5rem; font-size:.75rem; font-weight:600;
          cursor:pointer; border-width:1px; transition:background .12s;
        }
        .dt-btn-edit  { color:#92400e; background:#fffbeb; border-color:#fde68a; }
        .dt-btn-edit:hover  { background:#fef3c7; }
        .dt-btn-hapus { color:#991b1b; background:#fef2f2; border-color:#fecaca; }
        .dt-btn-hapus:hover { background:#fee2e2; }
        .dt-icon { width:.75rem; height:.75rem; }

        /* ── SweetAlert2 toast ───────────────────────────────────────────── */
        .swal-toast-custom { font-size:.9rem !important; }

        /* ── Modal entrance ─────────────────────────────────────────────── */
        .modal-enter { animation: fadeIn .15s ease; }
        @keyframes fadeIn { from { opacity:0; transform:scale(.97); } to { opacity:1; transform:scale(1); } }
      `}</style>

      <div className="min-h-screen bg-slate-100">
        {/* ── Navbar ──────────────────────────────────────────────────────── */}
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 leading-none">
                  Dashboard Admin
                </p>
                <h1 className="text-base font-bold text-slate-800 truncate">
                  MathScan
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="hidden sm:inline">Tambah User</span>
                <span className="sm:hidden">Tambah</span>
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* ── Main ────────────────────────────────────────────────────────── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {[
              {
                label: "Total Pengguna",
                value: stats.total,
                color: "indigo",
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0",
                span: "col-span-2 sm:col-span-1",
              },
              {
                label: "Guru",
                value: stats.guru,
                color: "violet",
                icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
                span: "col-span-1",
              },
              {
                label: "Siswa",
                value: stats.siswa,
                color: "sky",
                icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                span: "col-span-1",
              },
            ].map(({ label, value, color, icon, span }) => (
              <div
                key={label}
                className={`${span} bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3`}
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-${color}-50 flex items-center justify-center shrink-0`}
                >
                  <svg
                    className={`w-5 h-5 text-${color}-600`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d={icon}
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800 leading-none">
                    {value}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Table card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">
                Manajemen Pengguna
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola akun guru dan siswa
              </p>
            </div>
            <div className="p-4 sm:p-6 overflow-x-auto">
              {/* DataTables manages this table's DOM entirely */}
              <table
                ref={tableRef}
                className="w-full"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </main>
      </div>

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(15,23,42,.55)",
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div className="modal-enter w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${isEditMode ? "bg-amber-50" : "bg-indigo-50"}`}
                >
                  <svg
                    className={`w-5 h-5 ${isEditMode ? "text-amber-600" : "text-indigo-600"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {isEditMode ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    )}
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {isEditMode ? "Edit Data Pengguna" : "Tambah Pengguna Baru"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isEditMode
                      ? `Mengubah akun #${currentId}`
                      : "Isi semua kolom yang diperlukan"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {[
                {
                  label: "Nama Lengkap",
                  type: "text",
                  val: nama,
                  set: setNama,
                  req: true,
                  ph: "contoh: Budi Santoso",
                },
                {
                  label: "Email",
                  type: "email",
                  val: email,
                  set: setEmail,
                  req: true,
                  ph: "contoh: budi@sekolah.id",
                },
              ].map(({ label, type, val, set, req, ph }) => (
                <div key={label}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type}
                    required={req}
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    placeholder={ph}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-slate-300 transition"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Password{" "}
                  {isEditMode && (
                    <span className="font-normal text-slate-400">
                      (kosongkan jika tidak ingin diubah)
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!isEditMode}
                  placeholder={
                    isEditMode
                      ? "Masukkan password baru untuk mereset"
                      : "Minimal 6 karakter"
                  }
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-slate-300 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Role / Hak Akses
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white transition"
                >
                  <option value="siswa">Siswa</option>
                  <option value="guru">Guru</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors shadow-sm ${isSubmitting ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800"}`}
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
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
                      Menyimpan…
                    </span>
                  ) : isEditMode ? (
                    "Simpan Perubahan"
                  ) : (
                    "Tambah User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
