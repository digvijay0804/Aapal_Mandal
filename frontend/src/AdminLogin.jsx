import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    const cleanUsername = username.trim();

    if (!cleanUsername || !password) {
      setError("कृपया Username आणि Password भरा.");
      return;
    }

    setLoading(true);

    // Temporary local authentication
    if (
      cleanUsername === "Digvijay" &&
      password === "Digvijay@0804"
    ) {
      sessionStorage.setItem("adminLoggedIn", "true");

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 400);

      return;
    }

    setTimeout(() => {
      setLoading(false);
      setError("Username किंवा Password चुकीचा आहे.");
    }, 400);
  };

  return (
    <div className="admin-login-page">

      {/* Background decoration */}
      <div className="login-glow login-glow-one"></div>
      <div className="login-glow login-glow-two"></div>

      <div className="admin-login-container">

        {/* =================================================
            BRAND PANEL
        ================================================= */}
        <section className="login-brand">

          {/* Festival Badge */}
          <div className="brand-top">
            🚩 सार्वजनिक गणेशोत्सव २०२६
          </div>

          {/* ONE MANDAL LOGO */}
          <div className="ganpati-logo">
            <img
              src="/images/kranti-logo.png"
              alt="क्रांती युवक गणेश मंडळ"
            />
          </div>

          {/* Mandal Name */}
          <h1>
            क्रांती युवक
            <br />
            गणेश मंडळ
          </h1>

          {/* Location */}
          <div className="brand-location">
            कालवडे
          </div>

          {/* Description */}
          <p className="brand-description">
            मंडळ व्यवस्थापन प्रणाली
          </p>

          {/* Mandal Information */}
          <div className="brand-info">

            <div>
              <strong>1992</strong>
              <span>स्थापना</span>
            </div>

            <div>
              <strong>2026</strong>
              <span>गणेशोत्सव</span>
            </div>

          </div>

        </section>


        {/* =================================================
            LOGIN PANEL
        ================================================= */}
        <section className="login-card">

          {/* Login Header */}
          <div className="login-header">

            <div className="login-icon">
              🔐
            </div>

            <span className="login-label">
              SECURE ADMIN ACCESS
            </span>

            <h2>
              Admin Login
            </h2>

            <p>
              मंडळ व्यवस्थापनासाठी सुरक्षितपणे Login करा
            </p>

          </div>


          {/* Error Message */}
          {error && (
            <div
              className="login-error"
              role="alert"
            >
              ⚠️ {error}
            </div>
          )}


          {/* =================================================
              LOGIN FORM
          ================================================= */}
          <form onSubmit={handleLogin}>

            {/* Username */}
            <div className="form-group">

              <label htmlFor="username">
                Username
              </label>

              <div className="input-wrapper">

                <span
                  className="input-icon"
                  aria-hidden="true"
                >
                  👤
                </span>

                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter username"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck="false"
                  required
                  disabled={loading}
                />

              </div>

            </div>


            {/* Password */}
            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">

                <span
                  className="input-icon"
                  aria-hidden="true"
                >
                  🔑
                </span>

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={loading}
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>


            {/* Login Button */}
            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Checking...
                </>
              ) : (
                <>
                  <span>🔐</span>

                  Login to Dashboard

                  <span className="login-arrow">
                    →
                  </span>
                </>
              )}

            </button>

          </form>


          {/* Back To Website */}
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/")}
            disabled={loading}
          >
            ← Back to Website
          </button>


          {/* Security */}
          <div className="login-security">
            <span>🔒</span>
            सुरक्षित Admin Area
            <span className="security-dot">•</span>
            Authorized Access Only
          </div>

        </section>

      </div>


      {/* Footer */}
      <footer className="login-footer">

        © 2026 क्रांती युवक गणेश मंडळ, कालवडे

        <span> • </span>

        गणपती बाप्पा मोरया 🚩

      </footer>

    </div>
  );
}

export default AdminLogin;