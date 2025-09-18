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

---

## ✨ Features

- 🖥️ **Browser editor** — edit in a familiar GUI instead of terminal editors  
- 📂 **Single file focus** — works like `nano filename.txt`, but in browser  
- 💾 **Save back to disk** — no copy/paste or manual upload required  
- 🎨 **Syntax highlighting** (planned) — auto-detect based on file extension  
- 🔒 **Local-first** — runs only on your machine, no cloud needed  

---

## 📦 Example Usage

Edit a config file:

```bash
npx web-editx /etc/nginx/nginx.conf
```

Edit a script:

```bash
npx web-editx server.js
```

---

## ⚙️ Options

Environment variables:

- `PORT=4000 npx web-editx file.txt` → start on custom port  

---

## 🛠️ Development

Clone the repo:

```bash
git clone https://github.com/yourusername/web-editx.git
cd web-editx
npm install
npm link
```

Run locally:

```bash
web-editx test.txt
```

---

## 📌 Roadmap

- [ ] Syntax highlighting based on file extension  
- [ ] Support for multiple files / folder browsing  
- [ ] Optional authentication for remote usage  
- [ ] TLS/HTTPS support  

---

## 📜 License

MIT © 2025 Shakthi Prasad GS
