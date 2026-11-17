const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 8011;

app.use(express.json());

const pending_pairs = new Map();

const nolib_frontend_path = path.join(path.dirname(require.resolve('nolib/package.json')), 'frontend');
app.use('/nolib', express.static(nolib_frontend_path));

app.use(express.static('public'));

app.post('/api/pair', (req, res) => {
	const token = req.body.token;
	const user_id = req.body.user_id;
	if (!token || !user_id) return res.status(400).json({ error: 'Missing token or user_id' });
	pending_pairs.set(token, { user_id, created_at: Date.now() });
	res.json({ success: true });
});

app.get('/api/pair/:token', (req, res) => {
	const token = req.params.token;
	const pair_data = pending_pairs.get(token);
	if (!pair_data) return res.json({ user_id: null });
	pending_pairs.delete(token);
	res.json({ user_id: pair_data.user_id });
});

app.get('/id', (req, res) => {
	res.sendFile(path.resolve(__dirname, 'public', 'id.html'));
});

app.get('/api/data/:id', (req, res) => {
	const file_path = path.resolve(__dirname, 'data', `${req.params.id}.json`);
	if (!fs.existsSync(file_path)) return res.json({});
	res.sendFile(file_path);
});

app.post('/api/data/:id', (req, res) => {
	const data_dir = path.resolve(__dirname, 'data');
	if (!fs.existsSync(data_dir)) fs.mkdirSync(data_dir, { recursive: true });
	const file_path = path.resolve(data_dir, `${req.params.id}.json`);
	fs.writeFileSync(file_path, JSON.stringify(req.body, null, 2));
	res.json({ success: true });
});

app.get('/{*splat}', (req, res, next) => {
	if (req.path.includes('.')) return next();
	res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
