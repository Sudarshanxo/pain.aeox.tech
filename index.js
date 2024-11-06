const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const PASSWORD = 'iloveit';

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Function to get the current time in Indian Standard Time (IST)
function getIndianTime() {
    const now = new Date();
    const indianTimeOffset = 5.5 * 60 * 60 * 1000;
    const indianTime = new Date(now.getTime() + indianTimeOffset);
    return indianTime.toISOString().replace('T', ' ').split('.')[0];
}

// Endpoint to receive and log visitor data
app.post('/log-visitor', (req, res) => {
    const logEntry = {
        timestamp: getIndianTime(),
        ip: req.body.ip,
        location: req.body.location,
        userAgent: req.body.userAgent,
        language: req.body.language,
        timeZone: req.body.timeZone,
        localTime: req.body.localTime,
        platform: req.body.platform,
        screen: req.body.screen,
        storage: req.body.storage,
        battery: req.body.battery
    };

    // Append the log entry as a JSON object to log.txt
    fs.appendFile('log.txt', JSON.stringify(logEntry, null, 2) + ',\n', (err) => {
        if (err) {
            console.error('Error logging data:', err);
            res.status(500).send('Error logging data');
        } else {
            console.log('Visitor data logged successfully');
            res.status(200).send('Data logged');
        }
    });
});

// Route for the password-protected page to view log.txt
app.get('/vadmin', (req, res) => {
    if (req.query.auth !== PASSWORD) {
        return res.send(`
            <form method="POST" action="/vadmin">
                <label for="password">Enter Password:</label>
                <input type="password" name="password" id="password" required>
                <button type="submit">Login</button>
            </form>
        `);
    }

    const logFilePath = path.join(__dirname, 'log.txt');
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.send('Log file not found.');
        }
        res.send(`<h1>User Visits Log</h1><pre>${data}</pre>`);
    });
});

// Handle password submission
app.post('/vadmin', (req, res) => {
    if (req.body.password === PASSWORD) {
        res.redirect(`/vadmin?auth=${PASSWORD}`);
    } else {
        res.send('Incorrect password.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});