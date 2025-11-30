import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDb } from './db.js';

const app = express();
const port = 3000;
const SECRET_KEY = 'super-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// Initialize DB and Seed Admin
getDb().then(async (db) => {
    console.log('Database initialized');
    const admin = await db.get('SELECT * FROM users WHERE username = ?', ['admin']);
    if (!admin) {
        const hashedPassword = await bcrypt.hash('admin', 10);
        await db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hashedPassword, 'admin']);
        console.log('Default admin user created');
    }
});

// Helper to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware: Authenticate Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Helper: Audit Log
const logAudit = async (db, userId, action, entity, entityId, details) => {
    try {
        await db.run(
            'INSERT INTO audit_logs (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [userId, action, entity, entityId, JSON.stringify(details)]
        );
    } catch (e) {
        console.error('Audit Log Error:', e);
    }
};

// --- Routes ---

// Auth
app.post('/api/auth/login', asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role, permissions: user.permissions }, SECRET_KEY, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, permissions: user.permissions } });
}));

// Audit Logs
app.get('/api/audit-logs', authenticateToken, asyncHandler(async (req, res) => {
    const db = await getDb();
    const logs = await db.all(`
        SELECT al.*, u.username 
        FROM audit_logs al 
        LEFT JOIN users u ON al.user_id = u.id 
        ORDER BY al.timestamp DESC
    `);
    res.json(logs);
}));

// Users
app.get('/api/users', authenticateToken, asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const db = await getDb();
    const users = await db.all('SELECT id, username, role, permissions FROM users');
    res.json(users);
}));

app.post('/api/users', authenticateToken, asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { username, password, role, permissions } = req.body;
    const db = await getDb();
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(
        'INSERT INTO users (username, password, role, permissions) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, role, JSON.stringify(permissions)]
    );
    await logAudit(db, req.user.id, 'CREATE', 'users', result.lastID, { username, role, permissions });
    res.status(201).json({ id: result.lastID, username, role, permissions });
}));

app.put('/api/users/:id', authenticateToken, asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { id } = req.params;
    const { username, role, permissions, password } = req.body;
    const db = await getDb();

    let query = 'UPDATE users SET username = ?, role = ?, permissions = ?';
    let params = [username, role, JSON.stringify(permissions)];

    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        query += ', password = ?';
        params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await db.run(query, params);
    await logAudit(db, req.user.id, 'UPDATE', 'users', id, { username, role, permissions });
    res.json({ id, username, role, permissions });
}));

app.delete('/api/users/:id', authenticateToken, asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM users WHERE id = ?', [id]);
    await logAudit(db, req.user.id, 'DELETE', 'users', id, null);
    res.status(204).send();
}));

app.put('/api/users/password', authenticateToken, asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const db = await getDb();
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    await logAudit(db, req.user.id, 'UPDATE_PASSWORD', 'users', req.user.id, null);
    res.json({ success: true });
}));

// Companies
app.get('/api/companies', authenticateToken, asyncHandler(async (req, res) => {
    const db = await getDb();
    const companies = await db.all('SELECT * FROM companies');
    res.json(companies);
}));

app.post('/api/companies', authenticateToken, asyncHandler(async (req, res) => {
    const { name, cnpj, address, phone, email } = req.body;
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO companies (name, cnpj, address, phone, email) VALUES (?, ?, ?, ?, ?)',
        [name, cnpj, address, phone, email]
    );
    await logAudit(db, req.user.id, 'CREATE', 'companies', result.lastID, req.body);
    res.status(201).json({ id: result.lastID, ...req.body });
}));

app.put('/api/companies/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, cnpj, address, phone, email } = req.body;
    const db = await getDb();
    await db.run(
        'UPDATE companies SET name = ?, cnpj = ?, address = ?, phone = ?, email = ? WHERE id = ?',
        [name, cnpj, address, phone, email, id]
    );
    await logAudit(db, req.user.id, 'UPDATE', 'companies', id, req.body);
    res.json({ id, ...req.body });
}));

app.delete('/api/companies/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM companies WHERE id = ?', [id]);
    await logAudit(db, req.user.id, 'DELETE', 'companies', id, null);
    res.status(204).send();
}));

// Clients
app.get('/api/clients', authenticateToken, asyncHandler(async (req, res) => {
    const db = await getDb();
    const clients = await db.all('SELECT * FROM clients');
    const clientsWithPosts = clients.map(c => ({
        ...c,
        posts: c.posts ? JSON.parse(c.posts) : []
    }));
    res.json(clientsWithPosts);
}));

app.post('/api/clients', authenticateToken, asyncHandler(async (req, res) => {
    const { name, cnpj, address, phone, email, posts } = req.body;
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO clients (name, cnpj, address, phone, email, posts) VALUES (?, ?, ?, ?, ?, ?)',
        [name, cnpj, address, phone, email, JSON.stringify(posts || [])]
    );
    await logAudit(db, req.user.id, 'CREATE', 'clients', result.lastID, req.body);
    res.status(201).json({ id: result.lastID, ...req.body, posts: posts || [] });
}));

app.put('/api/clients/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, cnpj, address, phone, email, posts } = req.body;
    const db = await getDb();
    await db.run(
        'UPDATE clients SET name = ?, cnpj = ?, address = ?, phone = ?, email = ?, posts = ? WHERE id = ?',
        [name, cnpj, address, phone, email, JSON.stringify(posts || []), id]
    );
    await logAudit(db, req.user.id, 'UPDATE', 'clients', id, req.body);
    res.json({ id, ...req.body, posts: posts || [] });
}));

app.delete('/api/clients/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM clients WHERE id = ?', [id]);
    await logAudit(db, req.user.id, 'DELETE', 'clients', id, null);
    res.status(204).send();
}));

// Employees
app.get('/api/employees', authenticateToken, asyncHandler(async (req, res) => {
    const db = await getDb();
    const employees = await db.all('SELECT * FROM employees');
    res.json(employees);
}));

app.post('/api/employees', authenticateToken, asyncHandler(async (req, res) => {
    const { name, cpf, role, phone, email, re } = req.body;
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO employees (name, cpf, role, phone, email, re) VALUES (?, ?, ?, ?, ?, ?)',
        [name, cpf, role, phone, email, re]
    );
    await logAudit(db, req.user.id, 'CREATE', 'employees', result.lastID, req.body);
    res.status(201).json({ id: result.lastID, ...req.body });
}));

app.put('/api/employees/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, cpf, role, phone, email, re } = req.body;
    const db = await getDb();
    await db.run(
        'UPDATE employees SET name = ?, cpf = ?, role = ?, phone = ?, email = ?, re = ? WHERE id = ?',
        [name, cpf, role, phone, email, re, id]
    );
    await logAudit(db, req.user.id, 'UPDATE', 'employees', id, req.body);
    res.json({ id, ...req.body });
}));

app.delete('/api/employees/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM employees WHERE id = ?', [id]);
    await logAudit(db, req.user.id, 'DELETE', 'employees', id, null);
    res.status(204).send();
}));

// Services
app.get('/api/services', authenticateToken, asyncHandler(async (req, res) => {
    const db = await getDb();
    const services = await db.all('SELECT * FROM services');
    res.json(services);
}));

app.post('/api/services', authenticateToken, asyncHandler(async (req, res) => {
    const { name, description, default_value } = req.body;
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO services (name, description, default_value) VALUES (?, ?, ?)',
        [name, description, default_value]
    );
    await logAudit(db, req.user.id, 'CREATE', 'services', result.lastID, req.body);
    res.status(201).json({ id: result.lastID, ...req.body });
}));

app.put('/api/services/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, default_value } = req.body;
    const db = await getDb();
    await db.run(
        'UPDATE services SET name = ?, description = ?, default_value = ? WHERE id = ?',
        [name, description, default_value, id]
    );
    await logAudit(db, req.user.id, 'UPDATE', 'services', id, req.body);
    res.json({ id, ...req.body });
}));

app.delete('/api/services/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM services WHERE id = ?', [id]);
    await logAudit(db, req.user.id, 'DELETE', 'services', id, null);
    res.status(204).send();
}));

// Coverage Reasons
app.get('/api/coverage-reasons', authenticateToken, asyncHandler(async (req, res) => {
    const db = await getDb();
    const reasons = await db.all('SELECT * FROM coverage_reasons');
    res.json(reasons);
}));

app.post('/api/coverage-reasons', authenticateToken, asyncHandler(async (req, res) => {
    const { name } = req.body;
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO coverage_reasons (name) VALUES (?)',
        [name]
    );
    await logAudit(db, req.user.id, 'CREATE', 'coverage_reasons', result.lastID, req.body);
    res.status(201).json({ id: result.lastID, ...req.body });
}));

app.put('/api/coverage-reasons/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const db = await getDb();
    await db.run(
        'UPDATE coverage_reasons SET name = ? WHERE id = ?',
        [name, id]
    );
    await logAudit(db, req.user.id, 'UPDATE', 'coverage_reasons', id, req.body);
    res.json({ id, ...req.body });
}));

app.delete('/api/coverage-reasons/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM coverage_reasons WHERE id = ?', [id]);
    await logAudit(db, req.user.id, 'DELETE', 'coverage_reasons', id, null);
    res.status(204).send();
}));

// Work Logs
app.get('/api/work-logs', authenticateToken, asyncHandler(async (req, res) => {
    const db = await getDb();
    const logs = await db.all(`
    SELECT 
      wl.*, 
      c.name as company_name, 
      cl.name as client_name, 
      e.name as employee_name, 
      s.name as service_name,
      ocl.name as origin_client_name,
      cr.name as coverage_reason_name
    FROM work_logs wl
    LEFT JOIN companies c ON wl.company_id = c.id
    LEFT JOIN clients cl ON wl.client_id = cl.id
    LEFT JOIN employees e ON wl.employee_id = e.id
    LEFT JOIN services s ON wl.service_id = s.id
    LEFT JOIN clients ocl ON wl.origin_client_id = ocl.id
    LEFT JOIN coverage_reasons cr ON wl.coverage_reason_id = cr.id
    ORDER BY wl.date DESC
  `);
    res.json(logs);
}));

app.post('/api/work-logs', authenticateToken, asyncHandler(async (req, res) => {
    const { date, company_id, client_id, employee_id, service_id, value, description, post_name, status, origin_client_id, origin_post_name, coverage_reason_id } = req.body;
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO work_logs (date, company_id, client_id, employee_id, service_id, value, description, post_name, status, origin_client_id, origin_post_name, coverage_reason_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [date, company_id, client_id, employee_id, service_id, value, description, post_name, status || 'pending', origin_client_id, origin_post_name, coverage_reason_id]
    );
    await logAudit(db, req.user.id, 'CREATE', 'work_logs', result.lastID, req.body);
    res.status(201).json({ id: result.lastID, ...req.body });
}));

app.put('/api/work-logs/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { date, company_id, client_id, employee_id, service_id, value, description, post_name, status, origin_client_id, origin_post_name, coverage_reason_id } = req.body;
    const db = await getDb();
    await db.run(
        `UPDATE work_logs SET 
            date = COALESCE(?, date), 
            company_id = COALESCE(?, company_id), 
            client_id = COALESCE(?, client_id), 
            employee_id = COALESCE(?, employee_id), 
            service_id = COALESCE(?, service_id), 
            value = COALESCE(?, value), 
            description = COALESCE(?, description),
            post_name = COALESCE(?, post_name),
            status = COALESCE(?, status),
            origin_client_id = COALESCE(?, origin_client_id),
            origin_post_name = COALESCE(?, origin_post_name),
            coverage_reason_id = COALESCE(?, coverage_reason_id)
        WHERE id = ?`,
        [date, company_id, client_id, employee_id, service_id, value, description, post_name, status, origin_client_id, origin_post_name, coverage_reason_id, id]
    );
    await logAudit(db, req.user.id, 'UPDATE', 'work_logs', id, req.body);
    res.json({ id, ...req.body });
}));

app.delete('/api/work-logs/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM work_logs WHERE id = ?', [id]);
    await logAudit(db, req.user.id, 'DELETE', 'work_logs', id, null);
    res.status(204).send();
}));

// Error handling middleware
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
