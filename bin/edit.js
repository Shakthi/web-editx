#!/usr/bin/env node
import express from "express";
import open from "open";
import path from "path";
import fs from "fs/promises";
import readline from "readline";
import net from "net";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import localtunnel from 'localtunnel'
import os from "os";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const SECURITY_COOKIE_NAME = "webeditxSecurityAccepted";
const SECURITY_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Get target file from CLI args
const targetFile = path.resolve(process.argv[2] || process.cwd());
const isLocaltunnel = process.argv[3] === "--localtunnel";
const PORT = resolvePort(isLocaltunnel);
let activeSessionId = null;

app.set("trust proxy", true);

function getLocalIpAddresses() {
  const networks = os.networkInterfaces();
  const ips = [];

  for (const iface of Object.values(networks)) {
    if (!iface) continue;

    for (const address of iface) {
      if (address.family === "IPv4" && !address.internal) {
        ips.push(address.address);
      }
    }
  }

  return ips;
}

function resolveSecurityCookieOptions(req) {
  const hostHeader = req.headers.host || "";
  const hostname = req.hostname || hostHeader.split(":")[0] || "";
  const options = {
    path: "/",
    maxAge: SECURITY_COOKIE_MAX_AGE_MS,
    httpOnly: false,
  };

  const isHttps = req.secure || req.protocol === "https";

  if (hostname.endsWith(".loca.lt")) {
    options.domain = ".loca.lt";
    options.secure = true;
    options.sameSite = "None";
  } else {
    options.secure = isHttps;
    options.sameSite = "Lax";
  }

  return options;
}

function promptCreateFile(filePath) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return Promise.resolve(false);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = `Target file "${filePath}" does not exist. Create it? (y/N): `;

  return new Promise((resolve) => {
    rl.question(question, (answer = "") => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

function handlePortError(err) {
  if (err.code === "EADDRINUSE") {
    const NEWPORT = Math.floor(Math.random() * 9000) + 3000;
    console.error(`❌ Port ${PORT} already in use. Try another: PORT=${NEWPORT} npx web-editx ${process.argv[2]} ${process.argv[3] ?? ""}`);
    process.exit(1);
  }

  throw err;
}

function randomLocaltunnelPort(min = 30000, max = 60000) {
  const upperBound = Math.max(min + 1, max);
  return Math.floor(Math.random() * (upperBound - min)) + min;
}

function resolvePort(isLocaltunnelFlag) {
  const envPort = Number(process.env.PORT);
  if (Number.isInteger(envPort) && envPort > 0) {
    return envPort;
  }

  if (isLocaltunnelFlag) {
    return randomLocaltunnelPort();
  }

  return 3000;
}

function ensurePortAvailable(port) {
  return new Promise((resolve, reject) => {
    const tester = net.createServer();

    tester.once("error", (err) => {
      if (tester.listening) {
        tester.close(() => reject(err));
      } else {
        reject(err);
      }
    });

    tester.once("listening", () => {
      tester.close(() => resolve(true));
    });

    tester.listen(port);
  });
}

async function ensureTargetFile(filePath) {
  try {
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      console.error("Target is not a file:", filePath);
      process.exit(1);
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      if (await promptCreateFile(filePath)) {
        try {
          await fs.mkdir(path.dirname(filePath), { recursive: true });
          await fs.writeFile(filePath, "", "utf8");
          console.log("✅ Created new file:", filePath);
          return;
        } catch (createErr) {
          console.error("Failed to create file:", createErr.message);
        }
      } else {
        console.error("Target file does not exist:", filePath);
      }
    } else {
      console.error("Unable to access target file:", err.message);
    }
    process.exit(1);
  }
}

try {
  await ensurePortAvailable(PORT);
} catch (err) {
  handlePortError(err);
}

await ensureTargetFile(targetFile);
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// API: read file
app.get("/api/file", async (req, res) => {
  try {
    if (activeSessionId != null && activeSessionId !== req.query.sessionId) {
      throw new Error("Session already exists");
    }

    const sessionId = randomUUID();
    activeSessionId = sessionId;

    const content = await fs.readFile(targetFile, "utf8");
    res.json({
      name: path.basename(targetFile),
      fullPath: targetFile,
      content,
      sessionId,
    });
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

app.post("/api/security-consent", (req, res) => {
  try {
    res.cookie(SECURITY_COOKIE_NAME, "true", resolveSecurityCookieOptions(req));
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to persist security consent cookie:", err);
    res.status(500).json({ error: "Could not persist security consent" });
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

app.post("/api/close-session", async (req, res) => {
  try {
    const { sessionId } = req.body || {};

    if (!sessionId) {
      res.status(400).json({ error: "Missing sessionId" });
      return;
    }

    if (sessionId !== activeSessionId) {
      console.log(`Ignoring close-session for inactive session: ${sessionId}`);
      res.json({ success: false, ignored: true });
      return;
    }

    activeSessionId = null;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Could not close session", details: err.message });
    return;
  }

  setTimeout(() => {
    
    if(activeSessionId) {
      console.log("Ignoring close-session request for possibly page refresh, Session still active...");
      return;
    }
      
    console.log("Received close-session request, Closing session...");
    process.exit();
  },1000);
  
});

app.listen(PORT, () => {
    console.log(`📝 Editing ${targetFile}`);

    if(!isLocaltunnel){
      console.log(`➡️  Open http://localhost:${PORT} to edit in browser`);
      open(`http://localhost:${PORT}`);
      const localIps = getLocalIpAddresses();
      if (localIps.length > 0) {
        console.log("\n📡 Local network access:");
        localIps.forEach((ip) => console.log(`➡️  http://${ip}:${PORT}`));
      }

      console.log(`\nNot able to access http://localhost:${PORT} ?`);
      console.log(`Try tunneling this with localtunnel: npx web-editx ${process.argv[2] } --localtunnel`); 
    }

  if (isLocaltunnel) {

    (async () => {
      const tunnel = await localtunnel({ port: PORT });

      // fetch tunnel password
      //curl https://loca.lt/mytunnelpassword
      let password = await getPassword();

      console.log(`\n➡️  Open ${tunnel.url} to edit in browser`);
      console.log(`🔑 Local tunnel password: ${password}`);

      tunnel.on('close', () => {
        console.log('Tunnel closed');
        app.exit();
      });
    })();
  }


    

}).on("error", handlePortError);
