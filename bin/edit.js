#!/usr/bin/env node
import express from "express";
import open from "open";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import localtunnel from 'localtunnel'


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Get target file from CLI args
const targetFile = path.resolve(process.argv[2] || process.cwd());
const isLocaltunnel = process.argv[3] === "--localtunnel";

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

async function getPassword() {
  try {
    const res = await fetch("https://loca.lt/mytunnelpassword", { redirect: "follow", cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const text = await res.text(); // probably plain text password
    return text.trim();
  } catch (err) {
    console.error("Failed to fetch password:", err);
    throw err;
  }
}

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

    if(!isLocaltunnel){
      console.log(`➡️  Open http://localhost:${PORT} to edit in browser`);
      open(`http://localhost:${PORT}`);

      console.log(`\nNot able to access http://localhost:${PORT} ?`);
      console.log(`Try this  tunnel with localtunnel: npx web-editx ${process.argv[2] } --localtunnel`); 
    }

  if (isLocaltunnel) {

    (async () => {
      const tunnel = await localtunnel( PORT );

      // fetch tunnel password
      //curl https://loca.lt/mytunnelpassword
      let password = await getPassword();

      console.log(`\n➡️  Open ${tunnel.url} to edit in browser`);
      console.log(`🔑 Local tunnel password: ${password}`);

      tunnel.on('close', () => {
        // tunnels are closed
      });
    })();
  }


    

}).on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        //Generate random 4 digit 3000+ port
        const NEWPORT = Math.floor(Math.random() * 9000) + 3000;
        console.error(`❌ Port ${PORT} already in use. Try another: PORT=${NEWPORT} npx web-editx ${process.argv[2]} ${process.argv[3]??""}`);
        process.exit(1);
    } else {
        throw err;
    }
});