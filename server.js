const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 8011;

app.use(express.json());

const nolib_frontend_path = path.join(path.dirname(require.resolve('nolib/package.json')), 'frontend');
app.use('/nolib', express.static(nolib_frontend_path));

app.use(express.static('public'));

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
