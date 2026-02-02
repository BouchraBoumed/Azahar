const express = require('express');
const path = require('path');
const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname, 'front-end')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'front-end', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Azahar website running at http://localhost:${PORT}`);
    console.log(`📂 Serving files from: ${path.join(__dirname, 'front-end')}`);
    console.log('\nAvailable pages:');
    console.log(`   Home:         http://localhost:${PORT}/index.html`);
    console.log(`   Services:     http://localhost:${PORT}/services.html`);
    console.log(`   Reservations: http://localhost:${PORT}/reservations.html`);
    console.log(`   Account:      http://localhost:${PORT}/account.html`);
});
