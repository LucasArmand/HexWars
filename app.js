const express = require('express');
const path = require('path');  // to handle file paths

const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'three_panel.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});