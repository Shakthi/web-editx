#!/usr/bin/env node
import express from "express";
import open from "open";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Get target file from CLI args
const targetFile = path.resolve(process.argv[2] || process.cwd());

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// API: read file
app.get("/api/file", async (req, res) => {
  try {
    const content = await fs.readFile(targetFile, "utf8");
    res.json({ name: path.basename(targetFile), content });
  } catch (err) {
    res.status(500).json({ error: "Could not read file", details: err.message });
  }
});

// API: save file
app.post("/api/file", async (req, res) => {
  try {
    await fs.writeFile(targetFile, req.body.content, "utf8");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Could not save file", details: err.message });
  }
});

app.listen(PORT, () => {
    console.log(`📝 Editing ${targetFile}`);
    console.log(`➡️  Open http://localhost:${PORT} to edit in browser`);
    open(`http://localhost:${PORT}`);
}).on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        //Generate random 4 digit 3000+ port
        const NEWPORT = Math.floor(Math.random() * 9000) + 3000;
        console.error(`❌ Port ${PORT} already in use. Try another: PORT=${NEWPORT} npx web-editx ${process.argv[2]}`);
        process.exit(1);
    } else {
        throw err;
    }
});