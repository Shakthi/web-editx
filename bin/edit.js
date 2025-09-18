#!/usr/bin/env node
import express from "express";
import open from "open";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const targetDir = path.resolve(process.argv[2] || process.cwd());

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// List files
app.get("/api/files", async (req, res) => {
  const files = await fs.readdir(targetDir, { withFileTypes: true });
  res.json(files.map(f => ({ name: f.name, isDir: f.isDirectory() })));
});

// Read file
app.get("/api/file", async (req, res) => {
  const filePath = path.join(targetDir, req.query.name);
  const content = await fs.readFile(filePath, "utf8");
  res.json({ content });
});

// Save file
app.post("/api/file", async (req, res) => {
  const filePath = path.join(targetDir, req.body.name);
  await fs.writeFile(filePath, req.body.content, "utf8");
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`📂 WebEditX running at http://localhost:${PORT}`);
  open(`http://localhost:${PORT}`);
});
