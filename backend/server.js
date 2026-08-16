require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(
    express.json({
        limit: "10mb",
    })
);


// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {
    res.json({
        message: "Ganpati Receipt API is running 🚩",
    });
});


// =====================================================
// CREATE RECEIPT
// =====================================================

app.post("/api/receipts", async (req, res) => {
    try {
        const {
            donor_name,
            mobile,
            amount,
            payment_mode,
        } = req.body;

        // =================================================
        // VALIDATION
        // =================================================

        if (
            !donor_name ||
            !mobile ||
            !amount ||
            !payment_mode
        ) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const cleanMobile = String(mobile).replace(
            /\D/g,
            ""
        );

        if (!/^[0-9]{10}$/.test(cleanMobile)) {
            return res.status(400).json({
                message: "Mobile number must be 10 digits",
            });
        }

        if (Number(amount) <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than 0",
            });
        }

        // =================================================
        // GENERATE RECEIPT NUMBER
        // =================================================

        const receiptNoResult = await pool.query(
            `
            SELECT
                COALESCE(
                    MAX(
                        CAST(
                            SUBSTRING(receipt_no FROM '[0-9]+$')
                            AS INTEGER
                        )
                    ),
                    0
                ) + 1 AS next_number
            FROM receipts
            WHERE receipt_no LIKE 'GR-%'
            `
        );

        const nextNumber =
            receiptNoResult.rows[0].next_number;

        const receiptNo =
            `GR-${String(nextNumber).padStart(4, "0")}`;

        // =================================================
        // INSERT RECEIPT
        // =================================================

        const result = await pool.query(
            `
            INSERT INTO receipts
            (
                receipt_no,
                donor_name,
                mobile,
                amount,
                payment_mode
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [
                receiptNo,
                donor_name.trim(),
                cleanMobile,
                Number(amount),
                payment_mode,
            ]
        );

        const receipt = result.rows[0];

        // =================================================
        // WHATSAPP NUMBER
        // =================================================

        const whatsappNumber =
            `91${cleanMobile}`;

        // =================================================
        // RESPONSE
        // =================================================

        res.status(201).json({
            message:
                "Receipt created successfully 🚩",

            receipt,

            whatsapp: {
                number: whatsappNumber,

                displayNumber:
                    `+91 ${cleanMobile}`,

                link:
                    `https://wa.me/${whatsappNumber}`,
            },
        });

    } catch (error) {
        console.error(
            "Receipt Error:",
            error
        );

        res.status(500).json({
            message:
                "Receipt creation failed",

            error:
                error.message,
        });
    }
});


// =====================================================
// GET ALL RECEIPTS
// =====================================================

app.get("/api/receipts", async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT *
            FROM receipts
            ORDER BY created_at DESC
            `
        );

        res.json({
            message:
                "Receipts fetched successfully 🚩",

            total_receipts:
                result.rows.length,

            receipts:
                result.rows,
        });

    } catch (error) {
        console.error(
            "History Error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch receipt history",

            error:
                error.message,
        });
    }
});


// =====================================================
// GET SINGLE RECEIPT
// =====================================================

app.get("/api/receipts/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT *
            FROM receipts
            WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message:
                    "Receipt not found",
            });
        }

        const receipt =
            result.rows[0];

        const cleanMobile =
            String(
                receipt.mobile
            ).replace(/\D/g, "");

        res.json({
            message:
                "Receipt fetched successfully 🚩",

            receipt,

            whatsapp: {
                number:
                    `91${cleanMobile}`,

                displayNumber:
                    `+91 ${cleanMobile}`,

                link:
                    `https://wa.me/91${cleanMobile}`,
            },
        });

    } catch (error) {
        console.error(
            "Single Receipt Error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch receipt",

            error:
                error.message,
        });
    }
});


// =====================================================
// UPDATE RECEIPT
// =====================================================

app.put("/api/receipts/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            donor_name,
            mobile,
            amount,
            payment_mode,
        } = req.body;

        // =================================================
        // VALIDATION
        // =================================================

        if (
            !donor_name ||
            !mobile ||
            !amount ||
            !payment_mode
        ) {
            return res.status(400).json({
                message:
                    "All fields are required",
            });
        }

        const cleanMobile =
            String(mobile).replace(
                /\D/g,
                ""
            );

        if (
            !/^[0-9]{10}$/.test(
                cleanMobile
            )
        ) {
            return res.status(400).json({
                message:
                    "Mobile number must be 10 digits",
            });
        }

        if (
            Number(amount) <= 0
        ) {
            return res.status(400).json({
                message:
                    "Amount must be greater than 0",
            });
        }

        // =================================================
        // UPDATE
        // =================================================

        const result =
            await pool.query(
                `
                UPDATE receipts
                SET
                    donor_name = $1,
                    mobile = $2,
                    amount = $3,
                    payment_mode = $4
                WHERE id = $5
                RETURNING *
                `,
                [
                    donor_name.trim(),
                    cleanMobile,
                    Number(amount),
                    payment_mode,
                    id,
                ]
            );

        if (
            result.rows.length === 0
        ) {
            return res.status(404).json({
                message:
                    "Receipt not found",
            });
        }

        const receipt =
            result.rows[0];

        // =================================================
        // WHATSAPP
        // =================================================

        res.json({
            message:
                "Receipt updated successfully 🚩",

            receipt,

            whatsapp: {
                number:
                    `91${cleanMobile}`,

                displayNumber:
                    `+91 ${cleanMobile}`,

                link:
                    `https://wa.me/91${cleanMobile}`,
            },
        });

    } catch (error) {
        console.error(
            "Update Error:",
            error
        );

        res.status(500).json({
            message:
                "Receipt update failed",

            error:
                error.message,
        });
    }
});


// =====================================================
// DELETE RECEIPT
// =====================================================

app.delete("/api/receipts/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result =
            await pool.query(
                `
                DELETE FROM receipts
                WHERE id = $1
                RETURNING *
                `,
                [id]
            );

        if (
            result.rows.length === 0
        ) {
            return res.status(404).json({
                message:
                    "Receipt not found",
            });
        }

        res.json({
            message:
                "Receipt deleted successfully 🗑️",

            receipt:
                result.rows[0],
        });

    } catch (error) {
        console.error(
            "Delete Error:",
            error
        );

        res.status(500).json({
            message:
                "Receipt deletion failed",

            error:
                error.message,
        });
    }
});


// =====================================================
// DATABASE TEST
// =====================================================

app.get("/db-test", async (req, res) => {
    try {
        const result =
            await pool.query(
                "SELECT NOW()"
            );

        res.json({
            message:
                "Database connected successfully 🚩",

            time:
                result.rows[0].now,
        });

    } catch (error) {
        console.error(
            "Database Error:",
            error
        );

        res.status(500).json({
            message:
                "Database connection failed ❌",

            error:
                error.message,
        });
    }
});


// =====================================================
// 404
// =====================================================

app.use((req, res) => {
    res.status(404).json({
        message:
            "API endpoint not found",
    });
});


// =====================================================
// SERVER
// =====================================================

const PORT =
    process.env.PORT || 5000;

app.listen(
    PORT,
    "0.0.0.0",
    () => {
        console.log(
            `Server running on port ${PORT}`
        );
    }
);