const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. Get All Clients
app.get('/api/clients', async (req, res) => {
  try {
    const allClients = await pool.query('SELECT * FROM clients ORDER BY name ASC');
    res.json(allClients.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. Create a Transaction (The Ledger Save)
app.post('/api/transactions', async (req, res) => {
  const { client_id, total_amount, items, date } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start Transaction

    // Insert the main Transaction record
    const transRes = await client.query(
      'INSERT INTO transactions (client_id, total_amount, transaction_date) VALUES ($1, $2, $3) RETURNING id',
      [client_id, total_amount, date || new Date()]
    );
    const transactionId = transRes.rows[0].id;

    // Update Client Balance
    await client.query(
        'UPDATE clients SET current_balance = COALESCE(current_balance, 0) + $1 WHERE id = $2',
        [total_amount, client_id]
    );
    console.log("💰 Balance Updated for Client:", client_id);

    // Insert all line items
    for (let item of items) {
      await client.query(
        'INSERT INTO transaction_items (transaction_id, product_name, weight, price_per_kg, total_cost) VALUES ($1, $2, $3, $4, $5)',
        [transactionId, item.name, item.weight, item.price, item.total]
      );
    }

    await client.query('COMMIT'); // Commit Transaction
    res.json({ message: "Transaction Saved", id: transactionId });

  } catch (err) {
    await client.query('ROLLBACK'); // Undo if error
    console.error(err.message);
    res.status(500).send("Server Error");
  } finally {
    client.release();
  }
});

// 3. Get Recent Global Transactions (For Dashboard/History)
app.get('/api/transactions/recent', async (req, res) => {
  try {
    const query = `
      SELECT t.id, t.transaction_date, t.total_amount, c.name as client_name
      FROM transactions t
      JOIN clients c ON t.client_id = c.id
      ORDER BY t.transaction_date DESC, t.id DESC
      LIMIT 10
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 4. Get Single Transaction Details (For "View Bill" Modal)
app.get('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get the main transaction info
    const transQuery = `
      SELECT t.*, c.name as client_name
      FROM transactions t
      JOIN clients c ON t.client_id = c.id
      WHERE t.id = $1
    `;
    const transRes = await pool.query(transQuery, [id]);

    // Get the items
    const itemsQuery = `SELECT * FROM transaction_items WHERE transaction_id = $1`;
    const itemsRes = await pool.query(itemsQuery, [id]);

    if(transRes.rows.length === 0) return res.status(404).json({error: "Transaction not found"});

    res.json({ ...transRes.rows[0], items: itemsRes.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 5. Get all Products (The Menu)
app.get('/api/products', async (req, res) => {
  try {
    const products = await pool.query('SELECT * FROM products ORDER BY name ASC');
    res.json(products.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 6. Get History for a specific Client
app.get('/api/clients/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const history = await pool.query(
      `SELECT t.id, t.transaction_date, t.total_amount, count(ti.id) as item_count
       FROM transactions t
       LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
       WHERE t.client_id = $1
       GROUP BY t.id
       ORDER BY t.transaction_date DESC
       LIMIT 5`,
      [id]
    );
    res.json(history.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 7. Add a New Client
app.post('/api/clients', async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const newClient = await pool.query(
      'INSERT INTO clients (name, phone, address) VALUES ($1, $2, $3) RETURNING *',
      [name, phone, address]
    );
    res.json(newClient.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 8. Update an existing Client
app.put('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;

    await pool.query(
      'UPDATE clients SET name = $1, phone = $2 WHERE id = $3',
      [name, phone, id]
    );

    res.json({ message: "Client updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Start Server
app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port 5000");
});