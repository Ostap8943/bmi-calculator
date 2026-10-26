const express = require('express');
const path = require('node:path');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '4kb' }));
app.get('/vendor/react.production.min.js', (req, res) => {
    res.sendFile(require.resolve('react/umd/react.production.min.js'));
});
app.get('/vendor/react-dom.production.min.js', (req, res) => {
    res.sendFile(require.resolve('react-dom/umd/react-dom.production.min.js'));
});
app.use(express.static(path.join(__dirname, 'static')));

app.post('/calculate-bmi', (req, res) => {
    const { weight, height } = req.body || {};
    // Both the form and API use kilograms and centimetres.
    if (!Number.isFinite(weight) || !Number.isFinite(height) ||
        weight <= 0 || weight > 500 || height < 50 || height > 250) {
        return res.status(400).json({
            error: 'Enter a weight above 0 and up to 500 kg, and a height from 50 to 250 cm.',
        });
    }
    return res.json({ bmi: weight / ((height / 100) ** 2) });
});

app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Request body must be valid JSON.' });
    }
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ error: 'Request body is too large.' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Unexpected server error.' });
});

module.exports = app;
