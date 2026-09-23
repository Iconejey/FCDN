const express = require('express');
const path = require('path');
const app = express();
const port = 8032;

const nolib_frontend_path = path.join(path.dirname(require.resolve('nolib/package.json')), 'frontend');
app.use('/nolib', express.static(nolib_frontend_path));

app.use(express.static('public'));
app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
