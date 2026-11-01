
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// GitHub-Pages-Adresse deiner Startseite
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

// CORS
app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (
        ALLOWED_ORIGIN === "*" ||
        origin === ALLOWED_ORIGIN
    ) {
        res.setHeader(
            "Access-Control-Allow-Origin",
            ALLOWED_ORIGIN === "*" ? "*" : origin
        );
    }

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, HEAD, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

// Statische Spieldateien
app.use(express.static(__dirname));

// Health-Check für die Startseite
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        game: "OUTLAND",
        server: "online"
    });
});

// Spielseite
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "game.html"));
});

// Server starten
app.listen(PORT, "0.0.0.0", () => {
    console.log("================================");
    console.log("       OUTLAND SERVER");
    console.log("================================");
    console.log("Server läuft auf Port:", PORT);
});
