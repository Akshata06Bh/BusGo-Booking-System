const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to read form data and JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve the BusGo website files
app.use(express.static(__dirname));

// Handle journey search and validate data on the server
app.post('/search', (req, res) => {
    const { source, destination, travelDate } = req.body;

    // Check that all fields are provided
    if (!source || !destination || !travelDate) {
        return res.status(400).json({
            success: false,
            message: 'Please fill in all journey details.'
        });
    }

    // Check that source and destination are different
    if (source.trim().toLowerCase() === destination.trim().toLowerCase()) {
        return res.status(400).json({
            success: false,
            message: 'Source and destination cannot be the same.'
        });
    }

    // Check that the travel date is valid and not in the past
    const selectedDate = new Date(`${travelDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
        return res.status(400).json({
            success: false,
            message: 'Please select a valid travel date that is not in the past.'
        });
    }

    // All server-side validation checks passed
    return res.status(200).json({
        success: true,
        message: 'Journey details validated successfully!',
        journey: {
            source: source.trim(),
            destination: destination.trim(),
            travelDate
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`BusGo server running at http://localhost:${PORT}`);
});
