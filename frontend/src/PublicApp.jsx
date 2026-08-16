import { useNavigate } from "react-router-dom";
import "./PublicApp.css";

function PublicApp() {
  const navigate = useNavigate();

  const mandal = {
    name: "क्रांती युवक गणेश मंडळ",
    location: "कालवडे",
    established: "1992",
    festivalYear: "2026",

    heroImage: "/images/ganpati-2026.jpg",

    upiId: "digvijaythorat855-1@okhdfcbank",
    qrImage: "/images/ganpati-qr.png",

    krantiLogo: "/images/kranti-logo.png",
    mandalLogo: "/images/mandal-logo.png",

    instagram:
      "https://www.instagram.com/kranti_boys_kalavde?igsh=MXgwbDd2a2l6Mm5sOA==",

    description:
      "भक्ती, एकता आणि सामाजिक बांधिलकी जपत दरवर्षी गणेशोत्सव मोठ्या उत्साहात साजरा करणारे आपले मंडळ.",
  };

  // =====================================================
  // HISTORY
  // प्रत्येक वर्षासाठी फक्त एक image
  // =====================================================

  const history = [
    {
      year: "2025",
      image: "/images/ganpati-2025.jpg",
      text: "गणेशोत्सव 2025 मधील सुंदर आणि अविस्मरणीय आठवणी.",
    },
    {
      year: "2024",
      image: "/images/ganpati-2024.jpg",
      text: "गणेशोत्सव 2024 मधील भक्तिमय क्षण.",
    },
    {
      year: "2023",
      image: "/images/ganpati-2023.jpg",
      text: "गणेशोत्सव 2023 मधील श्री गणरायाचे सुंदर दर्शन.",
    },
    {
      year: "2022",
      image: "/images/ganpati-2022.jpg",
      text: "गणेशोत्सव 2022 मधील सुंदर आठवणी.",
    },
    {
      year: "2021",
      image: "/images/ganpati-2021.jpg",
      text: "गणेशोत्सव 2021 मधील अविस्मरणीय क्षण.",
    },
  ];

  // =====================================================
  // MEMBERS
  // फक्त नंबर + पूर्ण नाव + मंडळ सदस्य
  // =====================================================

  const members = [
    "Pranav Sanjay Thorat",
    "Sujit Dilip Thorat",
    "Harshad Krushnat Jadhav",
    "Akshay Hanmant Thorat",
    "Rudra Rajendra Thorat",
    "Pankaj Rajaram Patil",
    "Sagar Sanjay Thorat",
    "Rushikesh Nanaso Thorat",
  ];

  return (
    <div className="public-site">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="public-header">

        <div className="header-top">

          {/* LEFT LOGO */}
          <div className="header-logo header-logo-left">
            <img
              src={mandal.krantiLogo}
              alt="क्रांती युवक गणेश मंडळ"
            />
          </div>

          {/* HEADER TITLE */}
          <div className="header-title">

            <span>
              ॥ सार्वजनिक गणेशोत्सव {mandal.festivalYear} ॥
            </span>

            <h1>
              {mandal.name}
            </h1>

            <p>
              📍 {mandal.location}
            </p>

          </div>

          {/* RIGHT LOGO */}
          <div className="header-logo header-logo-right">
            <img
              src={mandal.mandalLogo}
              alt="मंडळ लोगो"
            />
          </div>

        </div>

        <div className="header-line"></div>

        <div className="header-greeting">
          गणपती बाप्पा मोरया! 🚩
        </div>

      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="hero-2026"
        style={{
          backgroundImage: `url(${mandal.heroImage})`,
        }}
      >

        <div className="hero-2026-overlay"></div>

        <div className="hero-2026-content">

          <span className="hero-2026-small">
            🙏 सार्वजनिक गणेशोत्सव 2026
          </span>

          <h2>
            क्रांती युवक
            <br />
            <span>गणेश मंडळ</span>
          </h2>

          <p>
            📍 {mandal.location}
          </p>

          <div className="hero-2026-divider"></div>

          <strong>
            गणपती बाप्पा मोरया! 🚩
          </strong>

          <div className="hero-2026-buttons">

            <a
              href="#history"
              className="hero-history-btn"
            >
              मागील वर्षांच्या आठवणी ↓
            </a>

            <a
              href="#donation"
              className="hero-donation-btn"
            >
              🙏 देणगी द्या
            </a>

          </div>

        </div>

      </section>


      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="intro-section">

        <span>
          ॥ श्री गणेशाय नमः ॥
        </span>

        <h2>
          भक्तीचा उत्सव, एकतेची ओळख
        </h2>

        <p>
          {mandal.description}
        </p>

      </section>


      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="stats-section">

        <div className="stats-container">

          <div className="stat-card">

            <strong>
              {mandal.established}
            </strong>

            <span>
              स्थापना वर्ष
            </span>

          </div>


          <div className="stat-card">

            <strong>
              34+
            </strong>

            <span>
              वर्षांची परंपरा
            </span>

          </div>


          <div className="stat-card">

            <strong>
              {mandal.festivalYear}
            </strong>

            <span>
              वर्तमान गणेशोत्सव
            </span>

          </div>

        </div>

      </section>


      {/* =====================================================
          ABOUT
      ===================================================== */}

      <section
        id="about"
        className="public-section"
      >

        <div className="section-title">

          <span>
            आमच्याबद्दल
          </span>

          <h2>
            क्रांती युवक गणेश मंडळ
          </h2>

          <div className="title-line"></div>

        </div>


        <div className="about-card">

          <div className="about-logo">

            <img
              src={mandal.mandalLogo}
              alt="मंडळ लोगो"
            />

          </div>


          <div className="about-text">

            <h3>
              भक्ती • एकता • संस्कृती • समाजसेवा
            </h3>

            <p>
              <strong>
                {mandal.name}
              </strong>{" "}
              हे {mandal.location} येथील सामाजिक,
              सांस्कृतिक आणि धार्मिक उपक्रम राबवणारे
              मंडळ आहे.
            </p>

            <p>
              सन{" "}
              <strong>
                {mandal.established}
              </strong>{" "}
              पासून मंडळाने गणेशोत्सवाच्या माध्यमातून
              भक्ती, सामाजिक एकता आणि समाजसेवेची
              परंपरा जपली आहे.
            </p>

            <p>
              सर्व नागरिकांच्या सहकार्याने आणि
              गणपती बाप्पांच्या आशीर्वादाने
              गणेशोत्सव दरवर्षी उत्साहात साजरा
              केला जातो.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          VALUES
      ===================================================== */}

      <section className="values-section">

        <div className="values-container">

          <div className="value-card">

            <div>
              🙏
            </div>

            <h3>
              भक्ती
            </h3>

            <p>
              श्री गणेशाची सेवा
            </p>

          </div>


          <div className="value-card">

            <div>
              🤝
            </div>

            <h3>
              एकता
            </h3>

            <p>
              सर्वांना सोबत घेऊन
            </p>

          </div>


          <div className="value-card">

            <div>
              🌺
            </div>

            <h3>
              संस्कृती
            </h3>

            <p>
              परंपरेचे जतन
            </p>

          </div>


          <div className="value-card">

            <div>
              ❤️
            </div>

            <h3>
              समाजसेवा
            </h3>

            <p>
              समाजासाठी योगदान
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          HISTORY
      ===================================================== */}

      <section
        id="history"
        className="history-section"
      >

        <div className="section-title">

          <span>
            आपल्या आठवणी
          </span>

          <h2>
            मागील गणेशोत्सव
          </h2>

          <div className="title-line"></div>

          <p>
            2021 ते 2025 पर्यंतच्या गणेशोत्सवाच्या
            सुंदर आठवणी
          </p>

        </div>


        <div className="history-list">

          {history.map((item, index) => (

            <article
              className={`history-item ${
                index % 2 !== 0
                  ? "history-reverse"
                  : ""
              }`}
              key={`history-${item.year}`}
            >

              {/* IMAGE */}

              <div className="history-photo">

                <div className="history-photo-frame">

                  <img
                    src={item.image}
                    alt={`गणेशोत्सव ${item.year}`}
                    loading="lazy"
                  />

                </div>

              </div>


              {/* DETAILS */}

              <div className="history-info">

                <span className="history-year">
                  गणेशोत्सव • {item.year}
                </span>

                <h3>
                  गणेशोत्सव
                  <br />
                  {item.year}
                </h3>

                <div className="history-line"></div>

                <p>
                  {item.text}
                </p>

                <strong className="history-blessing">
                  🙏 श्री गणरायाचा आशीर्वाद 🙏
                </strong>

              </div>

            </article>

          ))}

        </div>

      </section>


      {/* =====================================================
          MEMBERS
      ===================================================== */}

      <section
        id="members"
        className="members-section"
      >

        <div className="section-title light">

          <span>
            👥 आमची टीम
          </span>

          <h2>
            मंडळ सदस्य
          </h2>

          <div className="title-line"></div>

          <p>
            गणेशोत्सवाच्या आयोजनासाठी कार्यरत
            असलेले मंडळातील सदस्य
          </p>

        </div>


        <div className="members-list">

          {members.map((member, index) => (

            <div
              className="member-row"
              key={`member-${index}`}
            >

              {/* NUMBER */}

              <span className="member-index">
                {String(index + 1).padStart(2, "0")}
              </span>


              {/* FULL NAME */}

              <span className="member-name">
                {member}
              </span>


              {/* ROLE */}

              <span className="member-role">
                मंडळ सदस्य
              </span>

            </div>

          ))}

        </div>

      </section>


      {/* =====================================================
          DONATION
      ===================================================== */}

      <section
        id="donation"
        className="donation-section"
      >

        <div className="section-title light">

          <span>
            आपले योगदान
          </span>

          <h2>
            गणपती बाप्पांसाठी देणगी
          </h2>

          <div className="title-line"></div>

          <p>
            आपल्या इच्छेनुसार देणगी देऊन
            गणेशोत्सवाच्या या पवित्र कार्यात
            सहभागी व्हा.
          </p>

        </div>


        <div className="donation-card">

          <div className="donation-logo">

            <img
              src={mandal.krantiLogo}
              alt="मंडळ लोगो"
            />

          </div>


          <h3>
            QR Code Scan करा
          </h3>

          <p>
            कोणत्याही UPI App द्वारे देणगी द्या.
          </p>


          <div className="qr-frame">

            <img
              src={mandal.qrImage}
              alt="UPI QR Code"
              className="public-qr"
            />

          </div>


          <div className="upi-details">

            <span>
              UPI ID
            </span>

            <strong>
              {mandal.upiId}
            </strong>

          </div>


          <small>
            ✓ सुरक्षित UPI Payment
          </small>

        </div>

      </section>


      {/* =====================================================
          CONTACT
      ===================================================== */}

      <section className="public-section">

        <div className="section-title">

          <span>
            संपर्क
          </span>

          <h2>
            आमच्याशी संपर्क करा
          </h2>

          <div className="title-line"></div>

        </div>


        <div className="contact-grid">

          <a
            href={mandal.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card"
          >

            <div className="contact-card-icon">
              ◎
            </div>

            <div>

              <span>
                Instagram
              </span>

              <strong>
                @kranti_boys_kalavde
              </strong>

              <small>
                Instagram वर Follow करा
              </small>

            </div>

          </a>


          <div className="contact-card">

            <div className="contact-card-icon">
              📍
            </div>

            <div>

              <span>
                ठिकाण
              </span>

              <strong>
                {mandal.location}
              </strong>

              <small>
                {mandal.name}
              </small>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          INSTAGRAM
      ===================================================== */}

      <section className="instagram-section">

        <div className="instagram-banner">

          <div className="instagram-banner-logo">

            <img
              src={mandal.mandalLogo}
              alt="मंडळ लोगो"
            />

          </div>


          <div>

            <span>
              आमच्या सोबत जोडलेले रहा
            </span>

            <h2>
              Instagram वर Follow करा
            </h2>

            <p>
              गणेशोत्सवातील नवीन अपडेट्स,
              कार्यक्रम आणि फोटो पाहण्यासाठी
              आमच्या Instagram पेजला भेट द्या.
            </p>

          </div>


          <a
            href={mandal.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-button"
          >
            Instagram वर जा →
          </a>

        </div>

      </section>


      {/* =====================================================
          ADMIN
      ===================================================== */}

      <section className="admin-section">

        <div className="admin-card">

          <div className="admin-card-logo">

            <img
              src={mandal.krantiLogo}
              alt="मंडळ लोगो"
            />

          </div>


          <div className="admin-card-content">

            <span>
              मंडळ व्यवस्थापन
            </span>

            <h3>
              Admin Dashboard
            </h3>

            <p>
              देणगी, पावत्या आणि मंडळाच्या
              व्यवस्थापनासाठी Admin Panel वापरा.
            </p>

          </div>


          <button
            type="button"
            className="admin-button"
            onClick={() => navigate("/admin")}
          >
            🔐 Admin Login →
          </button>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="public-footer">

        <div className="footer-logo">

          <img
            src={mandal.krantiLogo}
            alt="क्रांती युवक गणेश मंडळ"
          />

        </div>


        <h2>
          {mandal.name}
        </h2>

        <p>
          {mandal.location}
        </p>


        <div className="footer-line"></div>


        <span>
          सार्वजनिक गणेशोत्सव {mandal.festivalYear}
        </span>


        <strong>
          गणपती बाप्पा मोरया! 🚩
        </strong>


        <small>
          © {mandal.festivalYear} {mandal.name},{" "}
          {mandal.location}
        </small>

      </footer>

    </div>
  );
}

export default PublicApp;