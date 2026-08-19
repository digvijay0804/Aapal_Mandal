import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import "./App.css";

const API_URL = "https://aapal-mandal-backend.onrender.com/api/receipts";
const EXPENSE_API_URL = "https://aapal-mandal-backend.onrender.com/api/expenses";

const MANDAL_GROUP_URL =
  "https://chat.whatsapp.com/JXTUsGhwPNSCLoFC3O0y37";

function App() {
  const emptyForm = {
    donor_name: "",
    mobile: "",
    amount: "",
    payment_mode: "Cash",
  };

  const getToday = () => new Date().toISOString().split("T")[0];

  const emptyExpenseForm = {
    item_name: "",
    amount: "",
    date: getToday(),
  };

  // =========================
  // PAGE
  // =========================

  const [page, setPage] = useState("donations");

  // =========================
  // DONATION
  // =========================

  const [form, setForm] = useState(emptyForm);
  const [receipt, setReceipt] = useState(null);
  const [receipts, setReceipts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [preparingImage, setPreparingImage] = useState(false);
  const [preparingDonationReport, setPreparingDonationReport] =
    useState(false);

  const [receiptFile, setReceiptFile] = useState(null);

  // =========================
  // EXPENSE
  // =========================

  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm);
  const [expenses, setExpenses] = useState([]);

  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseHistoryLoading, setExpenseHistoryLoading] =
    useState(false);

  const [editingExpenseId, setEditingExpenseId] = useState(null);

  // =========================
  // REPORT
  // =========================

  const [preparingReport, setPreparingReport] = useState(false);

  // =========================
  // REFS
  // =========================

  const receiptRef = useRef(null);
  const donationHistoryRef = useRef(null);
  const reportRef = useRef(null);

  // =========================
  // FETCH DONATIONS
  // =========================

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

  // =========================
  // FETCH EXPENSES
  // =========================

  const fetchExpenses = async () => {
    setExpenseHistoryLoading(true);

    try {
      const response = await fetch(EXPENSE_API_URL);
      const data = await response.json();

      if (response.ok) {
        setExpenses(data.expenses || []);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error("Fetch Expense Error:", error);
      setExpenses([]);
    } finally {
      setExpenseHistoryLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchReceipts();
    fetchExpenses();
  }, []);

  // =========================
  // DONATION INPUT
  // =========================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // EXPENSE INPUT
  // =========================

  const handleExpenseChange = (e) => {
    setExpenseForm({
      ...expenseForm,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // EDIT DONATION
  // =========================

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

    setPage("donations");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // CANCEL DONATION EDIT
  // =========================

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setReceipt(null);
    setReceiptFile(null);
  };

  // =========================
  // DELETE DONATION
  // =========================

  const handleDelete = async (id, receiptNo) => {
    const confirmed = window.confirm(
      `Receipt ${receiptNo} delete करायची आहे का?\n\nही action undo करता येणार नाही.`
    );

    if (!confirmed) return;

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

  // =========================
  // MOBILE CHECK
  // =========================

  const isMobileDevice = () => {
    return /Android|iPhone|iPad|iPod|Windows Phone/i.test(
      navigator.userAgent
    );
  };

  const canUseMobileFileShare = (file) => {
    try {
      return (
        isMobileDevice() &&
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({
          files: [file],
        })
      );
    } catch (error) {
      return false;
    }
  };

  // =========================
  // CREATE RECEIPT IMAGE
  // =========================

  const createReceiptImage = async () => {
    if (!receiptRef.current) {
      throw new Error("Receipt element not found.");
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

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
        (result) => resolve(result),
        "image/png",
        1
      );
    });

    if (!blob) {
      throw new Error("Receipt image could not be created.");
    }

    return blob;
  };

  // =========================
  // PREPARE RECEIPT IMAGE
  // =========================

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

        if (cancelled) return;

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

  // =========================
  // GET RECEIPT FILE
  // =========================

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

  // =========================
  // DOWNLOAD FILE
  // =========================

  const downloadFile = (file) => {
    const url = URL.createObjectURL(file);

    const link = document.createElement("a");

    link.href = url;
    link.download = file.name;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 2000);
  };

  // =========================
  // DONOR WHATSAPP
  // =========================

  const getDonorWhatsAppUrl = (mobile) => {
    const cleanMobile = String(mobile || "").replace(/\D/g, "");

    if (!/^[0-9]{10}$/.test(cleanMobile)) {
      throw new Error("Donor mobile number is invalid.");
    }

    return `https://wa.me/91${cleanMobile}`;
  };

  const handleDonorWhatsApp = async () => {
    if (!receipt) {
      alert("Receipt is not available.");
      return;
    }

    try {
      const file = await getReceiptFile();

      if (canUseMobileFileShare(file)) {
        await navigator.share({
          files: [file],
          title: `Receipt ${receipt.receipt_no}`,
        });

        return;
      }

      downloadFile(file);

      const whatsappUrl = getDonorWhatsAppUrl(
        receipt.mobile
      );

      setTimeout(() => {
        window.open(
          whatsappUrl,
          "_blank",
          "noopener,noreferrer"
        );
      }, 700);
    } catch (error) {
      console.error("Donor WhatsApp Error:", error);

      if (error?.name === "AbortError") return;

      alert(
        "Receipt share करता आली नाही.\n\n" +
          (error?.message || "Unknown error")
      );
    }
  };

  // =========================
  // MANDAL GROUP
  // =========================

  const openMandalGroup = () => {
    const newWindow = window.open(
      MANDAL_GROUP_URL,
      "_blank",
      "noopener,noreferrer"
    );

    if (!newWindow) {
      window.location.href = MANDAL_GROUP_URL;
    }
  };

  // =========================
  // SEND RECEIPT TO GROUP
  // =========================

  const handleMandalWhatsApp = async () => {
    if (!receipt) {
      alert("Receipt is not available.");
      return;
    }

    try {
      const file = await getReceiptFile();

      if (canUseMobileFileShare(file)) {
        await navigator.share({
          files: [file],
          title: `Donation Receipt ${receipt.receipt_no}`,
        });

        return;
      }

      downloadFile(file);

      setTimeout(() => {
        openMandalGroup();
      }, 700);
    } catch (error) {
      console.error("Mandal WhatsApp Error:", error);

      if (error?.name === "AbortError") return;

      alert(
        "Receipt Group ला पाठवता आली नाही.\n\n" +
          (error?.message || "Unknown error")
      );
    }
  };

  // =========================
  // DONATION SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanMobile = String(form.mobile || "").replace(
      /\D/g,
      ""
    );

    if (!form.donor_name.trim()) {
      alert("कृपया देणगीदाराचे नाव टाका.");
      return;
    }

    if (!/^[0-9]{10}$/.test(cleanMobile)) {
      alert("कृपया 10 अंकी Mobile Number टाका.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      alert("कृपया योग्य रक्कम टाका.");
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        donor_name: form.donor_name.trim(),
        mobile: cleanMobile,
        amount: Number(form.amount),
        payment_mode: form.payment_mode,
      };

      // UPDATE
      if (editingId) {
        const response = await fetch(
          `${API_URL}/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );

        const data = await response.json();

        if (response.ok) {
          alert("Receipt successfully updated 🚩");

          setReceipt(data.receipt);
          setReceiptFile(null);
          setEditingId(null);
          setForm(emptyForm);

          await fetchReceipts();
        } else {
          alert(
            data.message || "Receipt update failed."
          );
        }

        return;
      }

      // CREATE
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setReceipt(data.receipt);
        setReceiptFile(null);
        setForm(emptyForm);

        await fetchReceipts();
      } else {
        alert(data.message || "Receipt save failed.");
      }
    } catch (error) {
      console.error("Submit Error:", error);

      alert(
        "Backend server is not running किंवा API error आहे."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EXPENSE SUBMIT
  // =========================

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();

    if (!expenseForm.item_name.trim()) {
      alert("कृपया वस्तूचे नाव टाका.");
      return;
    }

    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
      alert("कृपया योग्य Amount टाका.");
      return;
    }

    if (!expenseForm.date) {
      alert("कृपया Date निवडा.");
      return;
    }

    setExpenseLoading(true);

    try {
      const url = editingExpenseId
        ? `${EXPENSE_API_URL}/${editingExpenseId}`
        : EXPENSE_API_URL;

      const response = await fetch(url, {
        method: editingExpenseId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_name: expenseForm.item_name.trim(),
          amount: Number(expenseForm.amount),
          date: expenseForm.date,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          editingExpenseId
            ? "Expense successfully updated."
            : "Expense successfully saved."
        );

        setExpenseForm(emptyExpenseForm);
        setEditingExpenseId(null);

        await fetchExpenses();
      } else {
        alert(
          data.message || "Expense save failed."
        );
      }
    } catch (error) {
      console.error("Expense Submit Error:", error);

      alert(
        "Expense API उपलब्ध नाही. Backend मध्ये Expense API add करावी लागेल."
      );
    } finally {
      setExpenseLoading(false);
    }
  };

  // =========================
  // EDIT EXPENSE
  // =========================

  const handleExpenseEdit = (item) => {
    setEditingExpenseId(item.id);

    setExpenseForm({
      item_name: item.item_name || "",
      amount: item.amount || "",
      date: item.date
        ? String(item.date).substring(0, 10)
        : getToday(),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // CANCEL EXPENSE
  // =========================

  const handleCancelExpenseEdit = () => {
    setEditingExpenseId(null);
    setExpenseForm(emptyExpenseForm);
  };

  // =========================
  // DELETE EXPENSE
  // =========================

  const handleExpenseDelete = async (id) => {
    const confirmed = window.confirm(
      "हा expense delete करायचा आहे का?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${EXPENSE_API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Expense deleted successfully 🗑️");
        await fetchExpenses();
      } else {
        alert(
          data.message || "Expense delete failed."
        );
      }
    } catch (error) {
      console.error("Expense Delete Error:", error);
      alert("Expense API उपलब्ध नाही.");
    }
  };

  // =========================
  // TOTALS
  // =========================

  const totalCollection = receipts.reduce(
    (total, item) =>
      total + Number(item.amount || 0),
    0
  );

  const totalExpenses = expenses.reduce(
    (total, item) =>
      total + Number(item.amount || 0),
    0
  );

  const remainingAmount =
    totalCollection - totalExpenses;

  // =========================
  // DONATION HISTORY IMAGE
  // =========================

  const createDonationHistoryImage = async () => {
    if (!donationHistoryRef.current) {
      throw new Error(
        "Donation history element not found."
      );
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 700)
    );

    const canvas = await html2canvas(
      donationHistoryRef.current,
      {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
        scrollX: 0,
        scrollY: 0,
        windowWidth:
          donationHistoryRef.current.scrollWidth,
        windowHeight:
          donationHistoryRef.current.scrollHeight,
      }
    );

    const blob = await new Promise((resolve) => {
      canvas.toBlob(
        (result) => resolve(result),
        "image/png",
        1
      );
    });

    if (!blob) {
      throw new Error(
        "Donation history image could not be created."
      );
    }

    return new File(
      [blob],
      "Donation-Total-Report-2026.png",
      {
        type: "image/png",
      }
    );
  };

  // =========================
  // DONATION REPORT
  // =========================

  const handleDonationTotalWhatsApp = async () => {
    if (receipts.length === 0) {
      alert(
        "Donation History मध्ये कोणतीही receipt उपलब्ध नाही."
      );
      return;
    }

    try {
      setPreparingDonationReport(true);

      const file =
        await createDonationHistoryImage();

      if (canUseMobileFileShare(file)) {
        await navigator.share({
          files: [file],
          title: "Donation Total Report 2026",
        });

        return;
      }

      downloadFile(file);

      setTimeout(() => {
        openMandalGroup();
      }, 700);
    } catch (error) {
      console.error(
        "Donation Total Report Error:",
        error
      );

      if (error?.name === "AbortError") return;

      alert(
        "Donation Total Report image तयार करता आली नाही.\n\n" +
          error.message
      );
    } finally {
      setPreparingDonationReport(false);
    }
  };

  // =========================
  // FINAL REPORT IMAGE
  // =========================

  const waitForReportImages = async () => {
    if (!reportRef.current) {
      throw new Error("Report element not found.");
    }

    const images = Array.from(
      reportRef.current.querySelectorAll("img")
    );

    await Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) {
              resolve();
              return;
            }

            img.onload = resolve;
            img.onerror = resolve;
          })
      )
    );

    await new Promise((resolve) =>
      setTimeout(resolve, 700)
    );
  };

  const createFinalReportImage = async () => {
    if (!reportRef.current) {
      throw new Error("Report element not found.");
    }

    await waitForReportImages();

    const canvas = await html2canvas(
      reportRef.current,
      {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
        scrollX: 0,
        scrollY: 0,
        windowWidth: reportRef.current.scrollWidth,
        windowHeight: reportRef.current.scrollHeight,
      }
    );

    const blob = await new Promise((resolve) => {
      canvas.toBlob(
        (result) => resolve(result),
        "image/png",
        1
      );
    });

    if (!blob) {
      throw new Error(
        "Report image could not be created."
      );
    }

    return new File(
      [blob],
      "Aapal-Mandal-Final-Report.png",
      {
        type: "image/png",
      }
    );
  };

  // =========================
  // FINAL REPORT SHARE
  // =========================

  const handleShareFinalReport = async () => {
    try {
      setPreparingReport(true);

      const file =
        await createFinalReportImage();

      if (canUseMobileFileShare(file)) {
        await navigator.share({
          files: [file],
          title: "Aapal Mandal Final Report",
        });

        return;
      }

      downloadFile(file);

      setTimeout(() => {
        openMandalGroup();
      }, 700);
    } catch (error) {
      console.error(
        "Final Report Error:",
        error
      );

      if (error?.name === "AbortError") return;

      alert(
        "Final report image तयार करता आली नाही.\n\n" +
          error.message
      );
    } finally {
      setPreparingReport(false);
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="app">

      {/* HEADER */}

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

      {/* NAVIGATION */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          flexWrap: "wrap",
          margin: "25px auto",
          maxWidth: "900px",
        }}
      >

        <button
          type="button"
          onClick={() => setPage("donations")}
          style={{
            padding: "12px 22px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "16px",
            background:
              page === "donations"
                ? "#dc2626"
                : "#777",
            color: "#fff",
          }}
        >
          🧾 Donations
        </button>

        <button
          type="button"
          onClick={() => setPage("expenses")}
          style={{
            padding: "12px 22px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "16px",
            background:
              page === "expenses"
                ? "#dc2626"
                : "#777",
            color: "#fff",
          }}
        >
          🧾 Expenses
        </button>

        <button
          type="button"
          onClick={() => setPage("report")}
          style={{
            padding: "12px 22px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "16px",
            background:
              page === "report"
                ? "#dc2626"
                : "#777",
            color: "#fff",
          }}
        >
          📊 Final Report
        </button>

      </div>

      {/* ======================================================
          DONATIONS PAGE
      ====================================================== */}

      {page === "donations" && (
        <>

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

              <form onSubmit={handleSubmit}>

                <label htmlFor="donor_name">
                  <span>Donor Name</span>
                  <small>
                    देणगीदाराचे नाव
                  </small>
                </label>

                <input
                  id="donor_name"
                  type="text"
                  name="donor_name"
                  value={form.donor_name}
                  onChange={handleChange}
                  autoComplete="name"
                  placeholder="Enter donor name"
                  required
                />

                <label htmlFor="mobile">
                  <span>Mobile Number</span>
                  <small>
                    मोबाईल नंबर
                  </small>
                </label>

                <input
                  id="mobile"
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  inputMode="numeric"
                  maxLength="10"
                  pattern="[0-9]{10}"
                  autoComplete="tel"
                  placeholder="Enter 10 digit mobile number"
                  required
                />

                <label htmlFor="amount">
                  <span>Donation Amount</span>
                  <small>
                    देणगीची रक्कम
                  </small>
                </label>

                <input
                  id="amount"
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  inputMode="decimal"
                  min="1"
                  placeholder="Enter amount"
                  required
                />

                <label htmlFor="payment_mode">
                  <span>Payment Mode</span>
                  <small>
                    पेमेंटचा प्रकार
                  </small>
                </label>

                <select
                  id="payment_mode"
                  name="payment_mode"
                  value={form.payment_mode}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontSize: "16px",
                    marginBottom: "15px",
                    background: "#fff",
                  }}
                >
                  <option value="Cash">
                    Cash / रोख
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="Bank Transfer">
                    Bank Transfer / बँक ट्रान्सफर
                  </option>
                </select>

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

                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    style={{
                      marginTop: "10px",
                      background: "#777",
                    }}
                  >
                    ❌ Cancel Edit
                  </button>
                )}

              </form>

            </section>

          </main>

          {/* RECEIPT */}

          {receipt && (
            <section
              ref={receiptRef}
              className="receipt-card"
              style={{
                background: "#ffffff",
              }}
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
                  <strong>Receipt No:</strong>
                  <span>
                    {receipt.receipt_no}
                  </span>
                </div>

                <div className="receipt-row">
                  <strong>Donor Name:</strong>
                  <span>
                    {receipt.donor_name}
                  </span>
                </div>

                <div className="receipt-row">
                  <strong>Mobile:</strong>
                  <span>
                    {receipt.mobile}
                  </span>
                </div>

                <div className="receipt-row">
                  <strong>Payment Mode:</strong>
                  <span>
                    {receipt.payment_mode || "-"}
                  </span>
                </div>

                <div className="receipt-row amount-row">
                  <strong>Amount:</strong>
                  <span>
                    ₹{receipt.amount}
                  </span>
                </div>

              </div>

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

                <button
                  type="button"
                  onClick={handleDonorWhatsApp}
                  disabled={preparingImage}
                  style={{
                    background: "#25D366",
                    color: "#fff",
                    border: "none",
                    padding: "14px 22px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "16px",
                  }}
                >
                  📱 Donor WhatsApp
                </button>

                <button
                  type="button"
                  onClick={handleMandalWhatsApp}
                  disabled={preparingImage}
                  style={{
                    background: "#128C7E",
                    color: "#fff",
                    border: "none",
                    padding: "14px 22px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "16px",
                  }}
                >
                  👥 Send Receipt to Group
                </button>

              </div>

              <div className="receipt-footer">
                🙏 आपल्या सहकार्याबद्दल धन्यवाद 🙏
                <br />
                गणपती बाप्पा मोरया! 🚩
              </div>

            </section>
          )}

          {/* ======================================================
              DONATION HISTORY
          ====================================================== */}

          <section
            ref={donationHistoryRef}
            className="history-section"
            style={{
              background: "#ffffff",
              padding: "28px 30px",
              overflow: "hidden",
            }}
          >

            <div
              style={{
                textAlign: "center",
                marginBottom: "24px",
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >

                <img
                  src="/images/mandal-logo.png"
                  alt="Mandal Logo"
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "contain",
                  }}
                />

                <img
                  src="/images/kranti-logo.png"
                  alt="Kranti Logo"
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "contain",
                  }}
                />

              </div>

              <h1
                style={{
                  margin: "8px 0",
                  color: "#8b0000",
                  fontSize: "26px",
                  lineHeight: "1.3",
                }}
              >
                क्रांती युवक गणेश मंडळ, कालवडे
              </h1>

              <p
                style={{
                  margin: "6px 0",
                  color: "#555",
                  fontSize: "17px",
                }}
              >
                सार्वजनिक गणेशोत्सव २०२६
              </p>

              <h2
                style={{
                  margin: "14px 0 0",
                  color: "#8b0000",
                  fontSize: "22px",
                }}
              >
                📊 देणगी संकलन अहवाल
              </h2>

              <p
                style={{
                  marginTop: "6px",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                Date:{" "}
                {new Date().toLocaleDateString(
                  "en-IN"
                )}
              </p>

            </div>

            {/* SUMMARY */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "14px",
                marginBottom: "24px",
              }}
            >

              <div
                style={{
                  textAlign: "center",
                  padding: "16px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  background: "#f5f5f5",
                }}
              >
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#555",
                  }}
                >
                  🧾 Total Receipts
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#8b0000",
                  }}
                >
                  {receipts.length}
                </div>
              </div>

              <div
                style={{
                  textAlign: "center",
                  padding: "16px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  background: "#f5f5f5",
                }}
              >
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#555",
                  }}
                >
                  💰 Total Collection
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#087f23",
                  }}
                >
                  ₹{totalCollection.toFixed(2)}
                </div>
              </div>

            </div>

            {/* TABLE */}

            {historyLoading ? (
              <p className="history-message">
                Loading receipt history...
              </p>
            ) : receipts.length === 0 ? (
              <p className="history-message">
                अजून कोणतीही receipt उपलब्ध नाही.
              </p>
            ) : (

              <div
                className="table-container"
                style={{
                  width: "100%",
                  overflowX: "auto",
                }}
              >

                <table
                  style={{
                    width: "100%",
                    minWidth: "850px",
                    borderCollapse: "collapse",
                    fontSize: "15px",
                  }}
                >

                  <thead>

                    <tr>

                      <th>Receipt No</th>
                      <th>Donor Name</th>
                      <th>Mobile</th>
                      <th>Payment</th>
                      <th>Amount</th>

                      {/* NEW ACTION COLUMN */}
                      <th
                        data-html2canvas-ignore="true"
                        style={{
                          textAlign: "center",
                        }}
                      >
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {receipts.map((item) => (

                      <tr key={item.id}>

                        <td>
                          {item.receipt_no}
                        </td>

                        <td>
                          {item.donor_name}
                        </td>

                        <td>
                          {item.mobile}
                        </td>

                        <td>
                          {item.payment_mode || "-"}
                        </td>

                        <td
                          style={{
                            fontWeight: "700",
                          }}
                        >
                          ₹{item.amount}
                        </td>

                        {/* =====================================
                            EDIT + DELETE BUTTONS
                        ====================================== */}

                        <td
                          data-html2canvas-ignore="true"
                          style={{
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              justifyContent:
                                "center",
                              flexWrap: "wrap",
                            }}
                          >

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(item)
                              }
                              style={{
                                background:
                                  "#f59e0b",
                                color: "#fff",
                                border: "none",
                                padding:
                                  "7px 12px",
                                borderRadius:
                                  "6px",
                                cursor:
                                  "pointer",
                                fontWeight:
                                  "700",
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
                                color: "#fff",
                                border: "none",
                                padding:
                                  "7px 12px",
                                borderRadius:
                                  "6px",
                                cursor:
                                  "pointer",
                                fontWeight:
                                  "700",
                              }}
                            >
                              🗑️ Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

            {/* TOTAL */}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
                fontSize: "20px",
                fontWeight: "800",
                color: "#087f23",
              }}
            >
              Total Collection: ₹
              {totalCollection.toFixed(2)}
            </div>

            <div
              style={{
                textAlign: "center",
                marginTop: "24px",
                paddingTop: "14px",
                borderTop: "1px solid #ddd",
                fontWeight: "700",
                fontSize: "15px",
                lineHeight: "1.8",
              }}
            >
              🙏 आपल्या सहकार्याबद्दल धन्यवाद 🙏
              <br />
              गणपती बाप्पा मोरया! 🚩
            </div>

          </section>

          {/* DONATION REPORT BUTTON */}

          <div
            data-html2canvas-ignore="true"
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "20px auto",
              maxWidth: "850px",
              padding: "0 15px",
            }}
          >

            <button
              type="button"
              onClick={
                handleDonationTotalWhatsApp
              }
              disabled={
                preparingDonationReport ||
                receipts.length === 0
              }
              style={{
                width: "100%",
                padding: "15px",
                border: "none",
                borderRadius: "8px",
                background:
                  preparingDonationReport
                    ? "#777"
                    : "#128C7E",
                color: "#fff",
                fontWeight: "700",
                fontSize: "17px",
                cursor: "pointer",
              }}
            >
              {preparingDonationReport
                ? "⏳ Report तयार होत आहे..."
                : "📲 Send Total Donation Report to WhatsApp Group"}
            </button>

          </div>

        </>
      )}

      {/* ======================================================
          EXPENSE PAGE
      ====================================================== */}

      {page === "expenses" && (
        <>

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
                {editingExpenseId
                  ? "✏️ Edit Expense"
                  : "🧾 Add Expense"}
              </h2>

              <form
                onSubmit={handleExpenseSubmit}
              >

                <label htmlFor="item_name">
                  <span>
                    Item / Vastu Name
                  </span>

                  <small>
                    वस्तूचे नाव
                  </small>
                </label>

                <input
                  id="item_name"
                  type="text"
                  name="item_name"
                  value={expenseForm.item_name}
                  onChange={handleExpenseChange}
                  placeholder="उदा. मंडपासाठी लाईट"
                  required
                />

                <label htmlFor="expense_amount">
                  <span>Amount</span>

                  <small>
                    खर्चाची रक्कम
                  </small>
                </label>

                <input
                  id="expense_amount"
                  type="number"
                  name="amount"
                  value={expenseForm.amount}
                  onChange={handleExpenseChange}
                  min="1"
                  inputMode="decimal"
                  placeholder="Enter amount"
                  required
                />

                <label htmlFor="expense_date">
                  <span>Date</span>

                  <small>
                    तारीख
                  </small>
                </label>

                <input
                  id="expense_date"
                  type="date"
                  name="date"
                  value={expenseForm.date}
                  onChange={handleExpenseChange}
                  required
                />

                <button
                  type="submit"
                  disabled={expenseLoading}
                >
                  {expenseLoading
                    ? "Saving..."
                    : editingExpenseId
                    ? "💾 Update Expense"
                    : "🧾 Save Expense"}
                </button>

                {editingExpenseId && (
                  <button
                    type="button"
                    onClick={
                      handleCancelExpenseEdit
                    }
                    style={{
                      marginTop: "10px",
                      background: "#777",
                    }}
                  >
                    ❌ Cancel Edit
                  </button>
                )}

              </form>

            </section>

          </main>

          <section className="history-section">

            <div className="history-header">

              <h2>
                📋 All Expenses
              </h2>

              <button
                type="button"
                onClick={fetchExpenses}
                disabled={
                  expenseHistoryLoading
                }
              >
                🔄 Refresh
              </button>

            </div>

            <div className="history-summary">

              <div className="summary-card">

                <h3>
                  Total Expenses
                </h3>

                <strong>
                  {expenses.length}
                </strong>

              </div>

              <div className="summary-card">

                <h3>
                  Total Expense Amount
                </h3>

                <strong>
                  ₹{totalExpenses.toFixed(2)}
                </strong>

              </div>

            </div>

            {expenseHistoryLoading ? (

              <p className="history-message">
                Loading expenses...
              </p>

            ) : expenses.length === 0 ? (

              <p className="history-message">
                अजून कोणताही expense उपलब्ध नाही.
              </p>

            ) : (

              <div className="table-container">

                <table>

                  <thead>

                    <tr>
                      <th>वस्तू</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>

                  </thead>

                  <tbody>

                    {expenses.map((item) => (

                      <tr key={item.id}>

                        <td>
                          {item.item_name}
                        </td>

                        <td>
                          ₹{item.amount}
                        </td>

                        <td>
                          {item.date
                            ? new Date(
                                item.date
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </td>

                        <td>

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              justifyContent:
                                "center",
                              flexWrap: "wrap",
                            }}
                          >

                            <button
                              type="button"
                              onClick={() =>
                                handleExpenseEdit(
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
                                border: "none",
                                cursor:
                                  "pointer",
                                color: "#fff",
                                fontWeight:
                                  "600",
                              }}
                            >
                              ✏️ Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleExpenseDelete(
                                  item.id
                                )
                              }
                              style={{
                                background:
                                  "#dc2626",
                                padding:
                                  "7px 12px",
                                borderRadius:
                                  "6px",
                                border: "none",
                                cursor:
                                  "pointer",
                                color: "#fff",
                                fontWeight:
                                  "600",
                              }}
                            >
                              🗑️ Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </section>

        </>
      )}

      {/* ======================================================
          FINAL REPORT
      ====================================================== */}

      {page === "report" && (

        <section
          style={{
            maxWidth: "850px",
            margin: "25px auto",
            padding: "0 15px",
          }}
        >

          <div
            ref={reportRef}
            style={{
              background: "#ffffff",
              padding: "30px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              boxShadow:
                "0 3px 12px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >

              <img
                src="/images/mandal-logo.png"
                alt="Mandal Logo"
                style={{
                  width: "75px",
                  height: "75px",
                  objectFit: "contain",
                }}
              />

              <img
                src="/images/kranti-logo.png"
                alt="Kranti Logo"
                style={{
                  width: "75px",
                  height: "75px",
                  objectFit: "contain",
                }}
              />

            </div>

            <div
              style={{
                textAlign: "center",
                marginBottom: "22px",
              }}
            >

              <h1
                style={{
                  margin: "5px 0",
                  fontSize: "27px",
                  color: "#8b0000",
                }}
              >
                क्रांती युवक गणेश मंडळ, कालवडे
              </h1>

              <p
                style={{
                  margin: "6px 0",
                  fontSize: "17px",
                  color: "#555",
                }}
              >
                सार्वजनिक गणेशोत्सव २०२६
              </p>

              <h2
                style={{
                  margin: "10px 0 0",
                  fontSize: "21px",
                  color: "#8b0000",
                }}
              >
                📊 अंतिम आर्थिक अहवाल
              </h2>

            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
                gap: "14px",
                marginBottom: "24px",
              }}
            >

              <div
                style={{
                  textAlign: "center",
                  padding: "16px 10px",
                  borderRadius: "8px",
                  background: "#f5f5f5",
                  border: "1px solid #ddd",
                }}
              >

                <div
                  style={{
                    fontWeight: "700",
                  }}
                >
                  💰 Total Donations
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "22px",
                    fontWeight: "800",
                    color: "#087f23",
                  }}
                >
                  ₹{totalCollection.toFixed(2)}
                </div>

              </div>

              <div
                style={{
                  textAlign: "center",
                  padding: "16px 10px",
                  borderRadius: "8px",
                  background: "#f5f5f5",
                  border: "1px solid #ddd",
                }}
              >

                <div
                  style={{
                    fontWeight: "700",
                  }}
                >
                  🧾 Total Expenses
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "22px",
                    fontWeight: "800",
                    color: "#c62828",
                  }}
                >
                  ₹{totalExpenses.toFixed(2)}
                </div>

              </div>

              <div
                style={{
                  textAlign: "center",
                  padding: "16px 10px",
                  borderRadius: "8px",
                  background: "#f5f5f5",
                  border: "1px solid #ddd",
                }}
              >

                <div
                  style={{
                    fontWeight: "700",
                  }}
                >
                  💵 Remaining
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "22px",
                    fontWeight: "800",
                    color:
                      remainingAmount >= 0
                        ? "#087f23"
                        : "#c62828",
                  }}
                >
                  ₹{remainingAmount.toFixed(2)}
                </div>

              </div>

            </div>

            <h2
              style={{
                fontSize: "20px",
                color: "#8b0000",
                margin: "12px 0 10px",
                borderBottom: "2px solid #ddd",
                paddingBottom: "8px",
              }}
            >
              🧾 खर्चाचा तपशील
            </h2>

            {expenses.length === 0 ? (

              <p
                style={{
                  textAlign: "center",
                  margin: "18px 0",
                  color: "#666",
                }}
              >
                कोणताही expense उपलब्ध नाही.
              </p>

            ) : (

              <div
                style={{
                  width: "100%",
                  overflow: "hidden",
                }}
              >

                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    tableLayout: "fixed",
                    fontSize: "15px",
                  }}
                >

                  <thead>

                    <tr>

                      <th
                        style={{
                          border: "1px solid #ccc",
                          padding: "11px 10px",
                          background: "#f1f1f1",
                          textAlign: "left",
                        }}
                      >
                        वस्तू
                      </th>

                      <th
                        style={{
                          border: "1px solid #ccc",
                          padding: "11px 10px",
                          background: "#f1f1f1",
                          textAlign: "right",
                        }}
                      >
                        Amount
                      </th>

                      <th
                        style={{
                          border: "1px solid #ccc",
                          padding: "11px 10px",
                          background: "#f1f1f1",
                          textAlign: "center",
                        }}
                      >
                        Date
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {expenses.map((item) => (

                      <tr key={item.id}>

                        <td
                          style={{
                            border: "1px solid #ccc",
                            padding: "11px 10px",
                            wordBreak: "break-word",
                          }}
                        >
                          {item.item_name}
                        </td>

                        <td
                          style={{
                            border: "1px solid #ccc",
                            padding: "11px 10px",
                            textAlign: "right",
                            fontWeight: "700",
                          }}
                        >
                          ₹{item.amount}
                        </td>

                        <td
                          style={{
                            border: "1px solid #ccc",
                            padding: "11px 10px",
                            textAlign: "center",
                          }}
                        >
                          {item.date
                            ? new Date(
                                item.date
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "18px",
                fontSize: "18px",
                fontWeight: "800",
              }}
            >
              Total Expense: ₹
              {totalExpenses.toFixed(2)}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "9px",
                fontSize: "20px",
                fontWeight: "800",
              }}
            >
              Remaining Amount: ₹
              {remainingAmount.toFixed(2)}
            </div>

            <div
              style={{
                textAlign: "center",
                marginTop: "22px",
                paddingTop: "14px",
                borderTop: "1px solid #ddd",
                fontWeight: "700",
                fontSize: "15px",
                lineHeight: "1.8",
              }}
            >
              🙏 आपल्या सहकार्याबद्दल धन्यवाद 🙏
              <br />
              गणपती बाप्पा मोरया! 🚩
            </div>

          </div>

          <div
            data-html2canvas-ignore="true"
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "18px",
            }}
          >

            <button
              type="button"
              onClick={handleShareFinalReport}
              disabled={preparingReport}
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: "8px",
                background:
                  preparingReport
                    ? "#777"
                    : "#128C7E",
                color: "#fff",
                fontWeight: "700",
                fontSize: "17px",
                cursor: "pointer",
              }}
            >
              {preparingReport
                ? "⏳ Report तयार होत आहे..."
                : "📲 Send Final Report to WhatsApp Group"}
            </button>

          </div>

        </section>

      )}

      {/* FOOTER */}

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