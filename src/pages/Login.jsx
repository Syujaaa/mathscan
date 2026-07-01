import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Email atau password salah");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const routes = {
        siswa: "/siswa",
        guru: "/guru",
        admin: "/admin",
      };
      navigate(routes[data.user.role] ?? "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-root {
          min-height: calc(100dvh - 60px);
          background: #F5EFE7;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* subtle dot-grid background matching the app feel */
        .login-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: radial-gradient(#E3D9C6 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
          z-index: 0;
        }

        .login-wrapper {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
        }

        /* ── Logo header above card ── */
        .login-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .6rem;
          margin-bottom: 1.5rem;
        }
        .login-brand-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: #525355;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(82,83,85,.35);
        }
        .login-brand-icon svg { width: 22px; height: 22px; color: #fff; }
        .login-brand-name {
          font-size: 1.3rem;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -.02em;
        }
        .login-brand-name span { color: #525355; }

        /* ── Card ── */
        .login-card {
          background: #ffffff;
          border: 1px solid #E8DFCE;
          border-radius: 20px;
          box-shadow:
            0 1px 2px rgba(15,23,42,.04),
            0 8px 32px rgba(15,23,42,.08);
          padding: 2.25rem 2rem;
        }
        @media (min-width: 480px) {
          .login-card { padding: 2.5rem 2.5rem; }
        }

        /* ── Card header ── */
        .login-card-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -.02em;
          margin-bottom: .3rem;
        }
        .login-card-sub {
          font-size: .82rem;
          color: #A69C8C;
          margin-bottom: 1.75rem;
        }

        /* ── Error ── */
        .login-error {
          display: flex;
          align-items: flex-start;
          gap: .5rem;
          background: #FFEEEC;
          border: 1px solid #FFC7C4;
          border-radius: 10px;
          padding: .7rem .9rem;
          margin-bottom: 1.25rem;
        }
        .login-error-icon { color: #FF7675; flex-shrink: 0; margin-top: 1px; }
        .login-error-icon svg { width: 15px; height: 15px; }
        .login-error-text { font-size: .8rem; color: #C1443F; line-height: 1.45; }

        /* ── Fields ── */
        .login-field { margin-bottom: 1rem; }
        .login-label {
          display: block;
          font-size: .75rem;
          font-weight: 600;
          color: #5B5347;
          margin-bottom: .4rem;
          letter-spacing: .02em;
        }
        .login-input-wrap { position: relative; }
        .login-input-icon {
          position: absolute; left: .8rem; top: 50%;
          transform: translateY(-50%);
          color: #A69C8C; pointer-events: none;
          display: flex; align-items: center;
        }
        .login-input-icon svg { width: 15px; height: 15px; }

        .login-input {
          width: 100%;
          padding: .7rem .875rem .7rem 2.35rem;
          border: 1px solid #E8DFCE;
          border-radius: 10px;
          font-size: .875rem;
          color: #0f172a;
          background: #FBF8F3;
          outline: none;
          transition: border-color .15s, box-shadow .15s, background .15s;
          -webkit-appearance: none;
        }
        .login-input::placeholder { color: #C9BFAC; }
        .login-input:focus {
          border-color: #525355;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(82,83,85,.15);
        }

        .login-pw-toggle {
          position: absolute; right: .75rem; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #A69C8C; padding: .2rem;
          display: flex; align-items: center;
          border-radius: 5px;
          transition: color .12s, background .12s;
        }
        .login-pw-toggle:hover { color: #525355; background: #E7E7E8; }
        .login-pw-toggle svg { width: 15px; height: 15px; }

        /* ── Button ── */
        .login-btn {
          width: 100%;
          margin-top: 1.5rem;
          padding: .8rem;
          border: none;
          border-radius: 10px;
          background: #525355;
          color: #fff;
          font-size: .9rem;
          font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: .45rem;
          transition: background .15s, transform .1s, box-shadow .15s;
          box-shadow: 0 2px 8px rgba(82,83,85,.3);
          letter-spacing: .01em;
        }
        .login-btn:hover:not(:disabled) {
          background: #3F4042;
          box-shadow: 0 4px 16px rgba(82,83,85,.4);
          transform: translateY(-1px);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); box-shadow: none; }
        .login-btn:disabled { opacity: .65; cursor: not-allowed; }

        .login-btn-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: lspin .65s linear infinite;
        }
        @keyframes lspin { to { transform: rotate(360deg); } }

        /* ── Divider note ── */
        .login-footer {
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid #EDE5D8;
          text-align: center;
          font-size: .75rem;
          color: #A69C8C;
          line-height: 1.6;
        }
        .login-footer strong { color: #5B5347; font-weight: 600; }
      `}</style>

      <div className="login-root">
        <div className="login-wrapper">
          {/* Brand mark */}
          <div className="login-brand">
            <div className="login-brand-icon">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="login-brand-name">
              Math<span>Scan</span>
            </span>
          </div>

          {/* Card */}
          <div className="login-card">
            <h1 className="login-card-title">Masuk ke akun kamu</h1>
            <p className="login-card-sub">
              Gunakan email dan password yang telah didaftarkan.
            </p>

            {/* Error */}
            {error && (
              <div className="login-error" role="alert">
                <span className="login-error-icon">
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </span>
                <p className="login-error-text">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div className="login-field">
                <label className="login-label" htmlFor="lp-email">
                  Alamat Email
                </label>
                <div className="login-input-wrap">
                  <span className="login-input-icon">
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                  <input
                    id="lp-email"
                    type="email"
                    required
                    autoComplete="email"
                    className="login-input"
                    placeholder="nama@sekolah.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-field">
                <label className="login-label" htmlFor="lp-password">
                  Password
                </label>
                <div className="login-input-wrap">
                  <span className="login-input-icon">
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </span>
                  <input
                    id="lp-password"
                    type={showPw ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    className="login-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: "2.6rem" }}
                  />
                  <button
                    type="button"
                    className="login-pw-toggle"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={
                      showPw ? "Sembunyikan password" : "Tampilkan password"
                    }
                  >
                    {showPw ? (
                      <svg
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="login-btn-spinner" />
                    Memverifikasi…
                  </>
                ) : (
                  <>
                    Masuk
                    <svg
                      width="15"
                      height="15"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              Belum punya akun? Hubungi <strong>administrator sekolah</strong>{" "}
              untuk mendapatkan akses.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
