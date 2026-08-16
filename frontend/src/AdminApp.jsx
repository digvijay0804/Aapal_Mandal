import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import "./App.css";

const API_URL = "http://localhost:5000/api/receipts";

const MANDAL_GROUP_URL =
  "https://chat.whatsapp.com/JXTUsGhwPNSCLoFC3O0y37";

function App() {
  // =====================================================
  // EMPTY FORM
  // =====================================================

  const emptyForm = {
    donor_name: "",
    mobile: "",
    amount: "",
    payment_mode: "Cash",
  };

  // =====================================================
  // STATES
  // =====================================================

  const [form, setForm] = useState(emptyForm);
  const [receipt, setReceipt] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [preparingImage, setPreparingImage] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);

  const receiptRef = useRef(null);

  // =====================================================
  // FETCH HISTORY
  // =====================================================

  const fetchReceipts = async () => {
    setHistoryLoading(true);

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (response.ok) {
        setReceipts(data.receipts || []);
      } else {
        alert(data.message || "History fetch failed.");
      }
    } catch (error) {
      console.error("Fetch History Error:", error);
      alert("Backend server is not running.");
    } finally {
      setHistoryLoading(false);
    }
  };

  // =====================================================
  // LOAD HISTORY
  // =====================================================

  useEffect(() => {
    fetchReceipts();
  }, []);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================================
  // EDIT RECEIPT
  // =====================================================

  const handleEdit = (item) => {
    setEditingId(item.id);

    setForm({
      donor_name: item.donor_name || "",
      mobile: String(item.mobile || "").replace(/\D/g, ""),
      amount: item.amount || "",
      payment_mode: item.payment_mode || "Cash",
    });

    setReceipt(null);
    setReceiptFile(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setReceipt(null);
    setReceiptFile(null);
  };

  // =====================================================
  // DELETE RECEIPT
  // =====================================================

  const handleDelete = async (id, receiptNo) => {
    const confirmed = window.confirm(
      `Receipt ${receiptNo} delete करायची आहे का?\n\nही action undo करता येणार नाही.`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        alert("Receipt deleted successfully 🗑️");

        if (editingId === id) {
          setEditingId(null);
          setForm(emptyForm);
        }

        if (receipt && receipt.id === id) {
          setReceipt(null);
          setReceiptFile(null);
        }

        await fetchReceipts();
      } else {
        alert(data.message || "Receipt delete failed.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Backend server is not running.");
    }
  };

  // =====================================================
  // CREATE RECEIPT IMAGE
  // =====================================================

  const createReceiptImage = async () => {
    if (!receiptRef.current) {
      throw new Error("Receipt element not found.");
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });

    const canvas = await html2canvas(receiptRef.current, {
      scale: 3,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 15000,
      scrollX: 0,
      scrollY: 0,
      windowWidth: receiptRef.current.scrollWidth,
      windowHeight: receiptRef.current.scrollHeight,
    });

    const blob = await new Promise((resolve) => {
      canvas.toBlob(
        (result) => {
          resolve(result);
        },
        "image/png",
        1.0
      );
    });

    if (!blob) {
      throw new Error("Receipt image could not be created.");
    }

    return blob;
  };

  // =====================================================
  // PREPARE RECEIPT IMAGE
  // =====================================================

  useEffect(() => {
    if (!receipt) {
      setReceiptFile(null);
      return;
    }

    let cancelled = false;

    const prepareImage = async () => {
      setPreparingImage(true);

      try {
        const blob = await createReceiptImage();

        if (cancelled) {
          return;
        }

        const file = new File(
          [blob],
          `Receipt-${receipt.receipt_no}.png`,
          {
            type: "image/png",
          }
        );

        setReceiptFile(file);
      } catch (error) {
        console.error("Receipt Image Error:", error);
      } finally {
        if (!cancelled) {
          setPreparingImage(false);
        }
      }
    };

    prepareImage();

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt]);

  // =====================================================
  // GET RECEIPT FILE
  // =====================================================

  const getReceiptFile = async () => {
    if (receiptFile) {
      return receiptFile;
    }

    const blob = await createReceiptImage();

    return new File(
      [blob],
      `Receipt-${receipt.receipt_no}.png`,
      {
        type: "image/png",
      }
    );
  };

  // =====================================================
  // AUTOMATIC DOWNLOAD RECEIPT IMAGE
  // =====================================================

  const downloadReceiptImage = async () => {
    if (!receipt) {
      throw new Error("Receipt is not available.");
    }

    const file = await getReceiptFile();

    const url = URL.createObjectURL(file);

    const link = document.createElement("a");

    link.href = url;
    link.download = `Receipt-${receipt.receipt_no}.png`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  // =====================================================
  // GET DONOR WHATSAPP URL
  // =====================================================

  const getDonorWhatsAppUrl = (mobile) => {
    const cleanMobile = String(mobile || "").replace(/\D/g, "");

    if (!/^[0-9]{10}$/.test(cleanMobile)) {
      throw new Error(
        "Donor mobile number is invalid."
      );
    }

    return `https://wa.me/91${cleanMobile}`;
  };

  // =====================================================
  // OPEN DONOR WHATSAPP + AUTO DOWNLOAD IMAGE
  // =====================================================

  const handleDonorWhatsApp = async () => {
    if (!receipt) {
      alert("Receipt is not available.");
      return;
    }

    try {
      await downloadReceiptImage();

      const whatsappUrl = getDonorWhatsAppUrl(
        receipt.mobile
      );

      window.open(
        whatsappUrl,
        "_blank"
      );
    } catch (error) {
      console.error(
        "Donor WhatsApp Error:",
        error
      );

      alert(error.message);
    }
  };

  // =====================================================
  // OPEN MANDAL WHATSAPP GROUP + AUTO DOWNLOAD IMAGE
  // =====================================================

  const handleMandalWhatsApp = async () => {
    if (!receipt) {
      alert("Receipt is not available.");
      return;
    }

    try {
      await downloadReceiptImage();

      window.open(
        MANDAL_GROUP_URL,
        "_blank"
      );
    } catch (error) {
      console.error(
        "Mandal WhatsApp Error:",
        error
      );

      alert(
        "Receipt image download करता आली नाही."
      );
    }
  };

  // =====================================================
  // HISTORY SUMMARY
  // =====================================================

  const handleHistoryWhatsApp = async () => {
    if (receipts.length === 0) {
      alert(
        "History मध्ये कोणतीही receipt उपलब्ध नाही."
      );

      return;
    }

    const totalCollection = receipts.reduce(
      (total, item) =>
        total + Number(item.amount || 0),
      0
    );

    const cashTotal = receipts
      .filter(
        (item) =>
          item.payment_mode === "Cash"
      )
      .reduce(
        (total, item) =>
          total + Number(item.amount || 0),
        0
      );

    const upiTotal = receipts
      .filter(
        (item) =>
          item.payment_mode === "UPI"
      )
      .reduce(
        (total, item) =>
          total + Number(item.amount || 0),
        0
      );

    const bankTotal = receipts
      .filter(
        (item) =>
          item.payment_mode ===
          "Bank Transfer"
      )
      .reduce(
        (total, item) =>
          total + Number(item.amount || 0),
        0
      );

    const today =
      new Date().toLocaleDateString(
        "en-IN"
      );

    const message = `🚩 *गणपती बाप्पा मोरया* 🚩

📊 *देणगी संकलन अहवाल*

*क्रांती युवक गणेश मंडळ, कालवडे*
सार्वजनिक गणेशोत्सव २०२६

📅 Date: ${today}

🧾 Total Receipts: ${receipts.length}

💰 *Total Collection: ₹${totalCollection.toFixed(
      2
    )}*

💵 Cash: ₹${cashTotal.toFixed(
      2
    )}

📱 UPI: ₹${upiTotal.toFixed(
      2
    )}

🏦 Bank Transfer: ₹${bankTotal.toFixed(
      2
    )}

━━━━━━━━━━━━━━━━

🙏 आपल्या सहकार्याबद्दल धन्यवाद 🙏

🚩 *गणपती बाप्पा मोरया!* 🚩`;

    try {
      await navigator.clipboard.writeText(
        message
      );

      alert(
        "📊 History Summary copy झाला आहे.\n\nWhatsApp मध्ये Paste करून Send करा."
      );
    } catch (error) {
      console.error(
        "History WhatsApp Error:",
        error
      );

      alert(
        "History Summary तयार करताना error आला."
      );
    }
  };

  // =====================================================
  // SAVE / UPDATE RECEIPT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanMobile = String(
      form.mobile
    ).replace(/\D/g, "");

    if (!/^[0-9]{10}$/.test(cleanMobile)) {
      alert(
        "कृपया 10 अंकी Mobile Number टाका."
      );

      return;
    }

    if (
      !form.donor_name ||
      !form.donor_name.trim()
    ) {
      alert(
        "कृपया देणगीदाराचे नाव टाका."
      );

      return;
    }

    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      alert(
        "कृपया योग्य रक्कम टाका."
      );

      return;
    }

    setLoading(true);

    try {
      // =================================================
      // UPDATE
      // =================================================

      if (editingId) {
        const response = await fetch(
          `${API_URL}/${editingId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              donor_name:
                form.donor_name.trim(),

              mobile:
                cleanMobile,

              amount:
                Number(form.amount),

              payment_mode:
                form.payment_mode,
            }),
          }
        );

        const data =
          await response.json();

        if (response.ok) {
          alert(
            "Receipt successfully updated 🚩"
          );

          setReceipt(
            data.receipt
          );

          setReceiptFile(null);

          setEditingId(null);

          setForm(emptyForm);

          await fetchReceipts();
        } else {
          alert(
            data.message ||
              "Receipt update failed."
          );
        }

        return;
      }

      // =================================================
      // CREATE
      // =================================================

      const response = await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            donor_name:
              form.donor_name.trim(),

            mobile:
              cleanMobile,

            amount:
              Number(form.amount),

            payment_mode:
              form.payment_mode,
          }),
        }
      );

      const data =
        await response.json();

      if (response.ok) {
        setReceipt(
          data.receipt
        );

        setReceiptFile(null);

        setForm(emptyForm);

        await fetchReceipts();
      } else {
        alert(
          data.message ||
            "Receipt save failed."
        );
      }
    } catch (error) {
      console.error(
        "Submit Error:",
        error
      );

      alert(
        "Backend server is not running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // TOTAL COLLECTION
  // =====================================================

  const totalCollection =
    receipts.reduce(
      (total, item) =>
        total +
        Number(item.amount || 0),
      0
    );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="app">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="mandal-header">

        <img
          src="/images/mandal-logo.png"
          alt="गणपती मंडळ Logo"
          className="mandal-logo"
        />

        <div className="header-text">

          <div className="bappa-title">
            🙏 गणपती बाप्पा मोरया 🙏
          </div>

          <h1>
            क्रांती युवक गणेश मंडळ, कालवडे
          </h1>

          <p className="established">
            स्थापना : 1992
          </p>

          <span className="festival">
            सार्वजनिक गणेशोत्सव २०२६
          </span>

        </div>

        <img
          src="/images/kranti-logo.png"
          alt="क्रांती Logo"
          className="kranti-logo"
        />

      </header>

      {/* =================================================
          FORM
      ================================================= */}

      <main className="main-grid">

        <section
          className="card"
          style={{
            gridColumn: "1 / -1",
            maxWidth: "850px",
            width: "100%",
            margin: "0 auto",
          }}
        >

          <h2>
            {editingId
              ? "✏️ Edit Receipt"
              : "🧾 New Donation Receipt"}
          </h2>

          <form
            onSubmit={
              handleSubmit
            }
          >

            {/* DONOR NAME */}

            <label htmlFor="donor_name">

              <span>
                Donor Name
              </span>

              <small>
                देणगीदाराचे नाव
              </small>

            </label>

            <input
              id="donor_name"
              type="text"
              name="donor_name"
              value={
                form.donor_name
              }
              onChange={
                handleChange
              }
              autoComplete="name"
              placeholder="Enter donor name"
              required
            />

            {/* MOBILE */}

            <label htmlFor="mobile">

              <span>
                Mobile Number
              </span>

              <small>
                मोबाईल नंबर
              </small>

            </label>

            <input
              id="mobile"
              type="tel"
              name="mobile"
              value={
                form.mobile
              }
              onChange={
                handleChange
              }
              inputMode="numeric"
              maxLength="10"
              pattern="[0-9]{10}"
              autoComplete="tel"
              placeholder="Enter 10 digit mobile number"
              required
            />

            {/* AMOUNT */}

            <label htmlFor="amount">

              <span>
                Donation Amount
              </span>

              <small>
                देणगीची रक्कम
              </small>

            </label>

            <input
              id="amount"
              type="number"
              name="amount"
              value={
                form.amount
              }
              onChange={
                handleChange
              }
              inputMode="decimal"
              min="1"
              placeholder="Enter amount"
              required
            />

            {/* PAYMENT MODE */}

            <label htmlFor="payment_mode">

              <span>
                Payment Mode
              </span>

              <small>
                पेमेंट पद्धत
              </small>

            </label>

            <select
              id="payment_mode"
              name="payment_mode"
              value={
                form.payment_mode
              }
              onChange={
                handleChange
              }
            >

              <option value="Cash">
                Cash
              </option>

              <option value="UPI">
                UPI
              </option>

              <option value="Bank Transfer">
                Bank Transfer
              </option>

            </select>

            {/* SAVE BUTTON */}

            <button
              type="submit"
              disabled={loading}
            >

              {loading
                ? editingId
                  ? "Updating..."
                  : "Saving..."
                : editingId
                ? "💾 Update Receipt"
                : "🧾 Save Receipt"}

            </button>

            {/* CANCEL */}

            {editingId && (
              <button
                type="button"
                onClick={
                  handleCancelEdit
                }
                style={{
                  marginTop:
                    "10px",
                  background:
                    "#777",
                }}
              >
                ❌ Cancel Edit
              </button>
            )}

          </form>

        </section>

      </main>

      {/* =================================================
          RECEIPT
      ================================================= */}

      {receipt && (

        <section
          ref={receiptRef}
          className="receipt-card"
        >

          <div className="receipt-header">

            <img
              src="/images/mandal-logo.png"
              alt="मंडळ Logo"
              className="receipt-logo"
            />

            <div>

              <h2>
                क्रांती युवक गणेश मंडळ, कालवडे
              </h2>

              <p>
                सार्वजनिक गणेशोत्सव २०२६
              </p>

            </div>

          </div>

          <div className="success">
            ✅ Receipt Saved Successfully
          </div>

          <div className="receipt-info">

            <div className="receipt-row">

              <strong>
                Receipt No:
              </strong>

              <span>
                {receipt.receipt_no}
              </span>

            </div>

            <div className="receipt-row">

              <strong>
                Donor Name:
              </strong>

              <span>
                {receipt.donor_name}
              </span>

            </div>

            <div className="receipt-row">

              <strong>
                Mobile:
              </strong>

              <span>
                {receipt.mobile}
              </span>

            </div>

            <div className="receipt-row amount-row">

              <strong>
                Amount:
              </strong>

              <span>
                ₹{receipt.amount}
              </span>

            </div>

            <div className="receipt-row">

              <strong>
                Payment:
              </strong>

              <span>
                {receipt.payment_mode}
              </span>

            </div>

          </div>

          {/* =================================================
              WHATSAPP BUTTONS
          ================================================= */}

          <div
            data-html2canvas-ignore="true"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "20px",
            }}
          >

            {/* DONOR */}

            <button
              type="button"
              onClick={
                handleDonorWhatsApp
              }
              disabled={preparingImage}
              style={{
                background:
                  "#25D366",
                color: "#fff",
                border: "none",
                padding:
                  "14px 22px",
                borderRadius:
                  "8px",
                cursor:
                  preparingImage
                    ? "not-allowed"
                    : "pointer",
                fontWeight:
                  "700",
                fontSize:
                  "16px",
                opacity:
                  preparingImage
                    ? 0.6
                    : 1,
              }}
            >
              {preparingImage
                ? "⏳ Preparing..."
                : "📱 Donor WhatsApp"}
            </button>

            {/* MANDAL GROUP */}

            <button
              type="button"
              onClick={
                handleMandalWhatsApp
              }
              disabled={preparingImage}
              style={{
                background:
                  "#128C7E",
                color: "#fff",
                border: "none",
                padding:
                  "14px 22px",
                borderRadius:
                  "8px",
                cursor:
                  preparingImage
                    ? "not-allowed"
                    : "pointer",
                fontWeight:
                  "700",
                fontSize:
                  "16px",
                opacity:
                  preparingImage
                    ? 0.6
                    : 1,
              }}
            >
              {preparingImage
                ? "⏳ Preparing..."
                : "👥 Mandal WhatsApp Group"}
            </button>

          </div>

          <div className="receipt-footer">

            🙏 आपल्या सहकार्याबद्दल धन्यवाद 🙏

            <br />

            गणपती बाप्पा मोरया! 🚩

          </div>

        </section>

      )}

      {/* =================================================
          HISTORY
      ================================================= */}

      <section className="history-section">

        <div className="history-header">

          <h2>
            📋 Receipt History
          </h2>

          <button
            type="button"
            onClick={
              fetchReceipts
            }
            disabled={
              historyLoading
            }
          >
            🔄 Refresh
          </button>

        </div>

        {/* SUMMARY */}

        <div className="history-summary">

          <div className="summary-card">

            <h3>
              Total Receipts
            </h3>

            <strong>
              {receipts.length}
            </strong>

          </div>

          <div className="summary-card">

            <h3>
              Total Collection
            </h3>

            <strong>
              ₹
              {totalCollection.toFixed(
                2
              )}
            </strong>

          </div>

        </div>

        {/* HISTORY SUMMARY */}

        <div
          data-html2canvas-ignore="true"
          style={{
            display: "flex",
            justifyContent:
              "center",
            margin: "20px 0",
          }}
        >

          <button
            type="button"
            onClick={
              handleHistoryWhatsApp
            }
            disabled={
              receipts.length ===
              0
            }
            style={{
              background:
                "#128C7E",
              color: "#fff",
              border: "none",
              padding:
                "13px 22px",
              borderRadius:
                "8px",
              cursor:
                "pointer",
              fontWeight:
                "700",
              fontSize:
                "16px",
              opacity:
                receipts.length ===
                0
                  ? 0.6
                  : 1,
            }}
          >
            📊 Copy History Summary
          </button>

        </div>

        {/* TABLE */}

        {historyLoading ? (

          <p className="history-message">
            Loading receipt history...
          </p>

        ) : receipts.length ===
          0 ? (

          <p className="history-message">
            अजून कोणतीही receipt उपलब्ध नाही.
          </p>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>
                    Receipt No
                  </th>

                  <th>
                    Donor Name
                  </th>

                  <th>
                    Mobile
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Payment
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {receipts.map(
                  (item) => (

                    <tr
                      key={
                        item.id
                      }
                    >

                      <td>
                        {
                          item.receipt_no
                        }
                      </td>

                      <td>
                        {
                          item.donor_name
                        }
                      </td>

                      <td>
                        {
                          item.mobile
                        }
                      </td>

                      <td>
                        ₹
                        {
                          item.amount
                        }
                      </td>

                      <td>
                        {
                          item.payment_mode
                        }
                      </td>

                      <td>

                        <div
                          style={{
                            display:
                              "flex",
                            gap:
                              "8px",
                            justifyContent:
                              "center",
                            flexWrap:
                              "wrap",
                          }}
                        >

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                item
                              )
                            }
                            style={{
                              background:
                                "#f59e0b",
                              padding:
                                "7px 12px",
                              borderRadius:
                                "6px",
                              border:
                                "none",
                              cursor:
                                "pointer",
                              color:
                                "#fff",
                              fontWeight:
                                "600",
                            }}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                item.id,
                                item.receipt_no
                              )
                            }
                            style={{
                              background:
                                "#dc2626",
                              padding:
                                "7px 12px",
                              borderRadius:
                                "6px",
                              border:
                                "none",
                              cursor:
                                "pointer",
                              color:
                                "#fff",
                              fontWeight:
                                "600",
                            }}
                          >
                            🗑️ Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>

        <strong>
          © 2026 क्रांती युवक गणेश मंडळ, कालवडे
        </strong>

        <br />

        गणपती बाप्पा मोरया 🚩

      </footer>

    </div>
  );
}

export default App;