import { useState, useEffect, useMemo, useCallback } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  Users, BookOpen, ClipboardList, TrendingUp, Award,
  AlertTriangle, X, Lightbulb, Trophy, ChevronRight, Loader2,
} from "lucide-react";
import { API_BASE_URL, getAuthHeaders } from "../config/api";

/* ─────────────────────────────────────────────────────────────────────────
   Palet & label warna — mengikuti token warna yang sudah dipakai di
   GuruDashboard.jsx (#525355 abu gelap utama, #F5EFE7 krem, #FF7675 koral).
───────────────────────────────────────────────────────────────────────── */
const PIE_COLORS = {
  sangat_baik: "#10b981", // emerald-500
  baik: "#14b8a6", // teal-500
  cukup: "#f59e0b", // amber-500
  kurang: "#ef4444", // red-500
};

const PENGUASAAN_COLOR = {
  "Sangat Menguasai": "bg-emerald-100 text-emerald-800",
  "Menguasai": "bg-emerald-100 text-emerald-700",
  "Cukup": "bg-amber-100 text-amber-800",
  "Perlu Pendampingan": "bg-red-100 text-red-700",
  "Belum Ada Data": "bg-slate-100 text-slate-500",
};

const STATUS_COLOR = {
  "Sangat Baik": "bg-emerald-100 text-emerald-800",
  "Baik": "bg-teal-100 text-teal-800",
  "Cukup": "bg-amber-100 text-amber-800",
  "Kurang": "bg-red-100 text-red-700",
  "Belum Ada Data": "bg-slate-100 text-slate-500",
};

async function getJSON(url) {
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Gagal memuat ${url}`);
  return res.json();
}

/* ─────────────────────────────────────────────────────────────────────────
   SKELETON LOADER
───────────────────────────────────────────────────────────────────────── */
function CardSkeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-white rounded-2xl border border-slate-200 ${className}`}>
      <div className="p-6 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-8 bg-slate-200 rounded w-1/2" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   STAT CARD (Fitur 9)
───────────────────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, suffix = "", accent = "#525355" }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}1A`, color: accent }}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">
          {label}
        </p>
        <p className="text-xl font-bold text-slate-800 mt-0.5">
          {value}
          {suffix && <span className="text-sm font-semibold text-slate-400 ml-1">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MODAL WRAPPER
───────────────────────────────────────────────────────────────────────── */
function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   Props:
     - classes: array kelas milik guru (dari GuruDashboard, sudah di-fetch)
     - selectedClassId: id kelas aktif yang dipilih di ribbon atas (opsional)
═══════════════════════════════════════════════════════════════════════ */
export default function AnalyticsDashboard({ classes = [], selectedClassId = "" }) {
  const [scope, setScope] = useState("kelas"); // "kelas" (kelas aktif) | "semua" (semua kelas)
  const classIdParam = scope === "kelas" && selectedClassId ? selectedClassId : "";

  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [pieData, setPieData] = useState([]);
  const [classesComparison, setClassesComparison] = useState([]);
  const [classDetail, setClassDetail] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [insights, setInsights] = useState([]);

  const [pieModal, setPieModal] = useState(null); // { kategori, label, data }
  const [materialModal, setMaterialModal] = useState(null); // { materi, siswa }
  const [studentModal, setStudentModal] = useState(null); // detail object

  const selectedClassName = useMemo(
    () => classes.find((c) => String(c.id) === String(selectedClassId))?.nama_kelas || "",
    [classes, selectedClassId],
  );

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const qs = classIdParam ? `?class_id=${classIdParam}` : "";
      const [stats, pie, cmp, mat, ins] = await Promise.all([
        getJSON(`${API_BASE_URL}/guru/dashboard/statistics${qs}`),
        getJSON(`${API_BASE_URL}/guru/dashboard/pie${qs}`),
        getJSON(`${API_BASE_URL}/guru/dashboard/classes`),
        getJSON(`${API_BASE_URL}/guru/dashboard/materials${qs}`),
        getJSON(`${API_BASE_URL}/guru/dashboard/insight${qs}`),
      ]);
      setStatistics(stats);
      setPieData(pie.data || []);
      setClassesComparison(cmp.classes || []);
      setMaterials(mat.materials || []);
      setInsights(ins.insights || []);

      if (classIdParam) {
        const detail = await getJSON(`${API_BASE_URL}/guru/dashboard/class/${classIdParam}`);
        setClassDetail(detail);
      } else {
        setClassDetail(null);
      }
    } catch (e) {
      console.error("Gagal memuat dashboard analitik:", e);
    } finally {
      setLoading(false);
    }
  }, [classIdParam]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const openPieDetail = async (slice) => {
    if (!slice.jumlah) return;
    try {
      const qs = classIdParam ? `?class_id=${classIdParam}` : "";
      const detail = await getJSON(
        `${API_BASE_URL}/guru/dashboard/pie/${slice.kategori}/detail${qs}`,
      );
      setPieModal({ label: slice.label, ...detail });
    } catch (e) {
      console.error(e);
    }
  };

  const openMaterialDetail = async (materi) => {
    try {
      const qs = classIdParam ? `?class_id=${classIdParam}` : "";
      const detail = await getJSON(
        `${API_BASE_URL}/guru/dashboard/materials/${encodeURIComponent(materi)}/students${qs}`,
      );
      setMaterialModal(detail);
    } catch (e) {
      console.error(e);
    }
  };

  const openStudentDetail = async (siswaId) => {
    try {
      const detail = await getJSON(`${API_BASE_URL}/guru/dashboard/student/${siswaId}`);
      setStudentModal(detail);
    } catch (e) {
      console.error(e);
    }
  };

  const pieChartData = pieData.map((d) => ({ ...d, fill: PIE_COLORS[d.kategori] }));
  const totalPie = pieData.reduce((sum, d) => sum + d.jumlah, 0);

  return (
    <div className="space-y-5">
      {/* ── Scope toggle ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-slate-800 text-lg">Dashboard Analitik Pembelajaran</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Insight otomatis berdasarkan data hasil pengerjaan siswa.
          </p>
        </div>
        <div className="flex bg-white border border-slate-200 rounded-xl p-1">
          <button
            onClick={() => setScope("kelas")}
            disabled={!selectedClassId}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              scope === "kelas" ? "bg-[#525355] text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {selectedClassName ? `Kelas ${selectedClassName}` : "Kelas Aktif"}
          </button>
          <button
            onClick={() => setScope("semua")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              scope === "semua" ? "bg-[#525355] text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Semua Kelas
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          {/* ═══ FITUR 9: STATISTIK DASHBOARD ═══ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={BookOpen} label="Total Kelas" value={statistics?.total_kelas ?? 0} accent="#525355" />
            <StatCard icon={Users} label="Total Siswa" value={statistics?.total_siswa ?? 0} accent="#0ea5e9" />
            <StatCard icon={ClipboardList} label="Total Soal" value={statistics?.total_soal ?? 0} accent="#8b5cf6" />
            <StatCard icon={ClipboardList} label="Total Pengerjaan" value={statistics?.total_pengerjaan ?? 0} accent="#f59e0b" />
            <StatCard icon={TrendingUp} label="Rata-rata Nilai" value={statistics?.rata_rata_nilai ?? 0} accent="#10b981" />
            <StatCard icon={Award} label="Persentase Kelulusan" value={statistics?.persentase_kelulusan ?? 0} suffix="%" accent="#14b8a6" />
            <StatCard icon={Award} label="Jawaban Benar" value={statistics?.persentase_jawaban_benar ?? 0} suffix="%" accent="#22c55e" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* ═══ FITUR 1: PIE CHART ═══ */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-1">Hasil Pengerjaan</h3>
              <p className="text-xs text-slate-500 mb-4">Klik salah satu bagian untuk melihat detail siswa.</p>
              {totalPie === 0 ? (
                <p className="text-sm text-slate-400 italic text-center py-16">Belum ada data pengerjaan.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        dataKey="jumlah"
                        nameKey="label"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        onClick={(d) => openPieDetail(d)}
                        cursor="pointer"
                      >
                        {pieChartData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} stroke="white" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val, name) => [`${val} pengerjaan`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {pieChartData.map((d) => (
                      <button
                        key={d.kategori}
                        onClick={() => openPieDetail(d)}
                        className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-left"
                      >
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                        <span className="text-slate-600 truncate">{d.label}</span>
                        <span className="ml-auto font-bold text-slate-700">{d.jumlah}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* ═══ FITUR 7: PERBANDINGAN ANTAR KELAS ═══ */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-4">Perbandingan Antar Kelas</h3>
              {classesComparison.length === 0 ? (
                <p className="text-sm text-slate-400 italic text-center py-16">Belum ada kelas.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={classesComparison} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="nama_kelas" width={90} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(val) => [`${val ?? 0}`, "Rata-rata Nilai"]} />
                    <Bar dataKey="rata_rata_nilai" radius={[0, 6, 6, 0]} fill="#525355" barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ═══ FITUR 6: INSIGHT OTOMATIS ═══ */}
          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-600" />
              <h3 className="font-bold text-amber-800">Insight Otomatis</h3>
            </div>
            <ul className="p-6 space-y-2.5">
              {insights.map((text, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* ═══ FITUR 2: EVALUASI KELAS (hanya saat 1 kelas dipilih) ═══ */}
          {classDetail && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-lg">Evaluasi Kelas {classDetail.nama_kelas}</h3>
                <p className="text-sm text-slate-500 mt-0.5">Rata-rata nilai: <span className="font-bold text-slate-700">{classDetail.rata_rata_nilai}</span></p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
                    Materi yang sudah dipahami
                  </p>
                  <ul className="space-y-1.5">
                    {classDetail.materi_dikuasai.length === 0 && (
                      <li className="text-xs text-slate-400 italic">Belum ada materi yang stabil dikuasai.</li>
                    )}
                    {classDetail.materi_dikuasai.map((m) => (
                      <li key={m.materi} className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="text-emerald-600 font-bold">✔</span> {m.materi}
                        <span className="ml-auto text-xs font-semibold text-emerald-700">{m.persentase_benar}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">
                    Materi yang masih lemah
                  </p>
                  <ul className="space-y-1.5">
                    {classDetail.materi_lemah.length === 0 && (
                      <li className="text-xs text-slate-400 italic">Tidak ada materi lemah saat ini. 🎉</li>
                    )}
                    {classDetail.materi_lemah.map((m) => (
                      <li key={m.materi} className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="text-red-600 font-bold">✖</span> {m.materi}
                        <span className="ml-auto text-xs font-semibold text-red-700">{m.persentase_benar}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mx-6 mb-6 p-4 bg-[#525355]/10 border border-[#525355]/25 rounded-xl flex items-start gap-2.5">
                <Lightbulb size={16} className="text-[#525355] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#3e3f40]">{classDetail.saran}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* ═══ FITUR 8: TOP PERFORMERS ═══ */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <Trophy size={16} className="text-amber-500" />
                <h3 className="font-bold text-slate-800">Top Performing Students</h3>
              </div>
              <ul className="divide-y divide-slate-100">
                {(classDetail?.top_students || []).length === 0 ? (
                  <li className="p-5 text-sm text-slate-400 italic text-center">Pilih kelas aktif untuk melihat data ini.</li>
                ) : (
                  classDetail.top_students.map((s, idx) => (
                    <li key={s.siswa_id}>
                      <button
                        onClick={() => openStudentDetail(s.siswa_id)}
                        className="w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors text-left"
                      >
                        <span className="w-6 text-sm font-bold text-slate-400">{idx + 1}</span>
                        <span className="flex-1 text-sm font-medium text-slate-700 truncate">{s.nama}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">{s.nilai}</span>
                        <ChevronRight size={14} className="text-slate-300" />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* ═══ FITUR 8: BOTTOM PERFORMERS ═══ */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                <h3 className="font-bold text-slate-800">Bottom Performing Students</h3>
              </div>
              <ul className="divide-y divide-slate-100">
                {(classDetail?.bottom_students || []).length === 0 ? (
                  <li className="p-5 text-sm text-slate-400 italic text-center">Pilih kelas aktif untuk melihat data ini.</li>
                ) : (
                  classDetail.bottom_students.map((s, idx) => (
                    <li key={s.siswa_id}>
                      <button
                        onClick={() => openStudentDetail(s.siswa_id)}
                        className="w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors text-left"
                      >
                        <span className="w-6 text-sm font-bold text-slate-400">{idx + 1}</span>
                        <span className="flex-1 text-sm font-medium text-slate-700 truncate">{s.nama}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">{s.nilai}</span>
                        <ChevronRight size={14} className="text-slate-300" />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* ═══ FITUR 3: DAFTAR SISWA (kelas aktif) ═══ */}
          {classDetail && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Performa Setiap Siswa — {classDetail.nama_kelas}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F5EFE7] text-left">
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Nama</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Nilai</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Status</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Benar/Salah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classDetail.siswa.map((s) => (
                      <tr
                        key={s.siswa_id}
                        onClick={() => openStudentDetail(s.siswa_id)}
                        className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-3 font-medium text-slate-700">{s.nama}</td>
                        <td className="px-6 py-3 text-center font-bold text-slate-700">{s.nilai ?? "-"}</td>
                        <td className="px-6 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLOR[s.status]}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center text-xs text-slate-500">
                          <span className="text-emerald-600 font-semibold">{s.jumlah_benar}</span>
                          {" / "}
                          <span className="text-red-500 font-semibold">{s.jumlah_salah}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ FITUR 4 + 5: ANALISIS MATERI & HEATMAP/RANKING ═══ */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">Analisis & Ranking Materi</h3>
              <p className="text-sm text-slate-500 mt-0.5">Diurutkan dari tingkat penguasaan tertinggi. Klik materi untuk lihat siswa yang belum menguasai.</p>
            </div>
            {materials.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-10">Belum ada data materi.</p>
            ) : (
              <div className="p-6 space-y-3">
                {materials.map((m) => (
                  <button
                    key={m.materi}
                    onClick={() => openMaterialDetail(m.materi)}
                    className="w-full text-left group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        {m.emoji} {m.materi}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${PENGUASAAN_COLOR[m.tingkat_penguasaan]}`}>
                          {m.tingkat_penguasaan}
                        </span>
                      </span>
                      <span className="text-xs font-bold text-slate-500">{m.persentase_benar}% ({m.jumlah_soal} soal)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all group-hover:opacity-80"
                        style={{
                          width: `${m.persentase_benar}%`,
                          background: m.persentase_benar >= 85 ? "#10b981" : m.persentase_benar >= 70 ? "#14b8a6" : m.persentase_benar >= 50 ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══ MODAL: PIE DRILL-DOWN (Fitur 1) ═══ */}
      {pieModal && (
        <Modal title={`Detail — ${pieModal.label}`} onClose={() => setPieModal(null)}>
          {pieModal.kelas.length === 0 ? (
            <p className="text-sm text-slate-400 italic text-center py-6">Tidak ada siswa pada kategori ini.</p>
          ) : (
            <div className="space-y-5">
              {pieModal.kelas.map((k) => (
                <div key={k.nama_kelas}>
                  <p className="font-bold text-slate-800 mb-2">Kelas {k.nama_kelas}</p>
                  <div className="space-y-2">
                    {k.siswa.map((s, idx) => (
                      <div key={idx} className="p-3 bg-[#F5EFE7] rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700 text-sm">{s.nama}</span>
                          <span className="text-xs font-bold text-slate-600">Nilai: {s.nilai}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Salah: {s.jumlah_salah} soal</p>
                        {s.materi_sering_salah.length > 0 && (
                          <p className="text-xs text-slate-500 mt-1">
                            Materi: {s.materi_sering_salah.join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* ═══ MODAL: MATERI DETAIL (Fitur 4) ═══ */}
      {materialModal && (
        <Modal title={`Siswa Belum Menguasai — ${materialModal.materi}`} onClose={() => setMaterialModal(null)}>
          {materialModal.siswa_belum_menguasai.length === 0 ? (
            <p className="text-sm text-slate-400 italic text-center py-6">Semua siswa sudah menguasai materi ini. 🎉</p>
          ) : (
            <ul className="space-y-2">
              {materialModal.siswa_belum_menguasai.map((s) => (
                <li key={s.siswa_id} className="flex items-center justify-between p-3 bg-[#F5EFE7] rounded-lg">
                  <span className="font-medium text-slate-700 text-sm">{s.nama}</span>
                  <span className="text-xs font-bold text-red-600">{s.persentase_benar}% benar ({s.jumlah_soal_materi} soal)</span>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}

      {/* ═══ MODAL: STUDENT DETAIL (Fitur 3 detail) ═══ */}
      {studentModal && (
        <Modal title={studentModal.nama} onClose={() => setStudentModal(null)}>
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#F5EFE7] rounded-lg text-center">
                <p className="text-xs text-slate-500">Nilai</p>
                <p className="text-lg font-bold text-slate-800">{studentModal.nilai ?? "-"}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg text-center">
                <p className="text-xs text-slate-500">Benar</p>
                <p className="text-lg font-bold text-emerald-700">{studentModal.jumlah_benar}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-center">
                <p className="text-xs text-slate-500">Salah</p>
                <p className="text-lg font-bold text-red-600">{studentModal.jumlah_salah}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">Materi yang dikuasai</p>
              <ul className="space-y-1">
                {studentModal.materi_dikuasai.length === 0 && (
                  <li className="text-xs text-slate-400 italic">Belum ada.</li>
                )}
                {studentModal.materi_dikuasai.map((m) => (
                  <li key={m.materi} className="text-sm text-slate-700">✔ {m.materi} <span className="text-xs text-emerald-700 font-semibold">({m.persentase_benar}%)</span></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Materi yang belum dipahami</p>
              <ul className="space-y-1">
                {studentModal.materi_belum_dipahami.length === 0 && (
                  <li className="text-xs text-slate-400 italic">Tidak ada. 🎉</li>
                )}
                {studentModal.materi_belum_dipahami.map((m) => (
                  <li key={m.materi} className="text-sm text-slate-700">✖ {m.materi} <span className="text-xs text-red-700 font-semibold">({m.persentase_benar}%)</span></li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-[#525355]/10 border border-[#525355]/25 rounded-xl flex items-start gap-2.5">
              <Lightbulb size={16} className="text-[#525355] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#3e3f40]">{studentModal.rekomendasi}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
