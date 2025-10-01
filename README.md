# Web-EditX

> Edit any file from your terminal in a **browser-based editor** (no more struggling with `vi` or `nano`!).

---

## 🚀 Install & Run

You don’t need to install globally — just run with **npx**:

```bash
npx web-editx myfile.txt
```

➡️ This will:  
1. Start a local web server (default: `http://localhost:3000`)  
2. Open the file in your default browser with a Monaco (VS Code-like) editor  
3. Save changes back directly to the file  
4. (Optional) expose the session remotely with `--localtunnel`

---

## ✨ Features

- 🖥️ **Browser editor** — edit in a familiar GUI instead of terminal editors  
- 📂 **Full-path file focus** — works like `nano filename.txt`, but with the complete path surfaced in the toolbar  
- 💾 **Save back to disk** — no copy/paste or manual upload required  
- 🌐 **Optional remote tunnel** — share the editor over the internet with `--localtunnel`  
- 🔒 **Local-first** — runs only on your machine unless you opt in to tunneling  
- 🎨 **Syntax highlighting** (planned) — auto-detect based on file extension  


## 📦 Example Usage

Edit a config file:

```bash
npx web-editx /etc/nginx/nginx.conf
```

Edit a script:

```bash
npx web-editx server.js
```

Share a file securely with a teammate using a temporary tunnel:

```bash
npx web-editx notes.md --localtunnel
```

---

## ⚙️ Options

- `PORT=4000 npx web-editx file.txt` → start on custom port  
- `npx web-editx file.txt --localtunnel` → create a temporary [localtunnel](https://github.com/localtunnel/localtunnel) URL (prompts once for the tunnel password)

When the tunnel flag is provided, the CLI fetches the current localtunnel password from `https://loca.lt/mytunnelpassword` and prints it alongside the generated URL. You’ll need to share both with anyone connecting.

## 🔐 Security Notes

- The tunnel feature routes traffic through localtunnel’s infrastructure — treat it as temporary and low-trust.  
- The app intentionally surfaces a prominent warning in the browser when it detects a non-localhost host.  
- Avoid tunnelling highly sensitive files; there is no end-to-end encryption beyond HTTPS provided by localtunnel.  
- Revoke access by stopping the CLI process; this immediately tears down the temporary URL.

---

## 🛠️ Development

Clone the repo:

```bash
git clone https://github.com/shakthi/web-editx.git
cd web-editx
npm install
npm link
```

Run locally:

```bash
npx web-editx test.txt
```

---

## 📝 Change Notes

### v1.4.0 (unreleased)

**Changed**  
- Refreshed the browser UI with a slimmer toolbar and denser layout so the Monaco editor gets nearly the full viewport 
- Reworked status feedback: toast notifications now show saving/unsaved/success states 
- Security warning dialog is clearer and, once accepted, the consent is remembered via  localtunnel cookie 

---

## 📜 License

MIT © 2025 Shakthi Prasad GS
