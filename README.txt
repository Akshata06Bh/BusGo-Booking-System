# BusGo - Assignment 1: JavaScript Capabilities

## Features added
- Validates source city, destination city, and journey date before saving.
- Rejects empty fields, identical source/destination cities, and past dates.
- Stores valid journey searches as objects in a JavaScript Array.
- Converts the Array to JSON with `JSON.stringify()` and saves it in `localStorage`.
- Loads JSON with `JSON.parse()` when the page is opened again.
- Displays the last five saved searches.
- Displays success/error messages and allows the user to clear saved search history.

## Run locally
Open `index.html` in a browser. For best results, use VS Code Live Server.

## Important
This assignment stores data in the current browser only. It does not use a server or database. Assignment 2 will add Node.js server-side validation separately.
