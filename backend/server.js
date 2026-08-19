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
// CREATE RECEIPTS TABLE
// =====================================================

const createReceiptTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS receipts (
                id SERIAL PRIMARY KEY,
                receipt_no VARCHAR(50) UNIQUE NOT NULL,
                donor_name VARCHAR(255) NOT NULL,
                mobile VARCHAR(20) NOT NULL,
                amount NUMERIC(12,2) NOT NULL,
                payment_mode VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Receipts table ready 🚩");

    } catch (error) {
        console.error(
            "Receipt Table Error:",
            error.message
        );
    }
};


// =====================================================
// CREATE EXPENSE TABLE
// =====================================================

const createExpenseTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS expenses (
                id SERIAL PRIMARY KEY,
                item_name VARCHAR(255) NOT NULL,
                amount NUMERIC(12,2) NOT NULL,
                expense_date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Expenses table ready 🚩");

    } catch (error) {
        console.error(
            "Expense Table Error:",
            error.message
        );
    }
};


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

        // Generate next receipt number
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
            Number(receiptNoResult.rows[0].next_number);

        const receiptNo =
            `GR-${String(nextNumber).padStart(4, "0")}`;

        // Save receipt
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

        const whatsappNumber =
            `91${cleanMobile}`;

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
// CREATE EXPENSE
// =====================================================

app.post("/api/expenses", async (req, res) => {
    try {
        const {
            item_name,
            item,
            expense_name,
            amount,
            expense_date,
            date,
        } = req.body;

        const finalItemName =
            item_name ||
            item ||
            expense_name;

        const finalDate =
            expense_date ||
            date;

        if (
            !finalItemName ||
            !amount ||
            !finalDate
        ) {
            return res.status(400).json({
                message:
                    "Item name, amount and date are required",
            });
        }

        if (Number(amount) <= 0) {
            return res.status(400).json({
                message:
                    "Amount must be greater than 0",
            });
        }

        const result = await pool.query(
            `
            INSERT INTO expenses
            (
                item_name,
                amount,
                expense_date
            )
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [
                finalItemName.trim(),
                Number(amount),
                finalDate,
            ]
        );

        res.status(201).json({
            message:
                "Expense added successfully 🚩",

            expense:
                result.rows[0],
        });

    } catch (error) {
        console.error(
            "Expense Create Error:",
            error
        );

        res.status(500).json({
            message:
                "Expense creation failed",

            error:
                error.message,
        });
    }
});


// =====================================================
// GET ALL EXPENSES
// =====================================================

app.get("/api/expenses", async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT *
            FROM expenses
            ORDER BY expense_date DESC, created_at DESC
            `
        );

        const totalExpenses =
            result.rows.reduce(
                (total, expense) =>
                    total + Number(expense.amount),
                0
            );

        res.json({
            message:
                "Expenses fetched successfully 🚩",

            total_expenses:
                totalExpenses,

            expenses:
                result.rows,
        });

    } catch (error) {
        console.error(
            "Expense History Error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch expenses",

            error:
                error.message,
        });
    }
});


// =====================================================
// GET SINGLE EXPENSE
// =====================================================

app.get("/api/expenses/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT *
            FROM expenses
            WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message:
                    "Expense not found",
            });
        }

        res.json({
            message:
                "Expense fetched successfully 🚩",

            expense:
                result.rows[0],
        });

    } catch (error) {
        console.error(
            "Single Expense Error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch expense",

            error:
                error.message,
        });
    }
});


// =====================================================
// UPDATE EXPENSE
// =====================================================

app.put("/api/expenses/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            item_name,
            item,
            expense_name,
            amount,
            expense_date,
            date,
        } = req.body;

        const finalItemName =
            item_name ||
            item ||
            expense_name;

        const finalDate =
            expense_date ||
            date;

        if (
            !finalItemName ||
            !amount ||
            !finalDate
        ) {
            return res.status(400).json({
                message:
                    "Item name, amount and date are required",
            });
        }

        if (Number(amount) <= 0) {
            return res.status(400).json({
                message:
                    "Amount must be greater than 0",
            });
        }

        const result = await pool.query(
            `
            UPDATE expenses
            SET
                item_name = $1,
                amount = $2,
                expense_date = $3
            WHERE id = $4
            RETURNING *
            `,
            [
                finalItemName.trim(),
                Number(amount),
                finalDate,
                id,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message:
                    "Expense not found",
            });
        }

        res.json({
            message:
                "Expense updated successfully 🚩",

            expense:
                result.rows[0],
        });

    } catch (error) {
        console.error(
            "Expense Update Error:",
            error
        );

        res.status(500).json({
            message:
                "Expense update failed",

            error:
                error.message,
        });
    }
});


// =====================================================
// DELETE EXPENSE
// =====================================================

app.delete("/api/expenses/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            DELETE FROM expenses
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message:
                    "Expense not found",
            });
        }

        res.json({
            message:
                "Expense deleted successfully 🗑️",

            expense:
                result.rows[0],
        });

    } catch (error) {
        console.error(
            "Expense Delete Error:",
            error
        );

        res.status(500).json({
            message:
                "Expense deletion failed",

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
    async () => {

        console.log(
            `Server running on port ${PORT}`
        );

        // Create both tables automatically
        await createReceiptTable();
        await createExpenseTable();
    }
);