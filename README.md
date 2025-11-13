# Web-EditX

> A **simple browser-based file editor** for developers and sysadmins who just want to edit files without fighting `vi` or `nano`.

---

## 💡 Why Web-EditX

If you’ve ever SSH’ed into a remote server and struggled with unfamiliar key bindings or broken terminals — this tool is for you.  
Run a single command, open a browser, and edit files with a clean, familiar interface powered by Monaco (VS Code editor).

No setup, no dependencies, no frustration.

---

## ⚡ Quick Start

```bash
npx web-editx /path/to/file.txt
```

That’s it.  
Web-EditX will:

1. Start a lightweight local web editor (default: `http://localhost:3000`)
2. Load your file directly into the editor
3. Save changes back to disk instantly  
4. Optionally make the editor accessible remotely with `--localtunnel`

---

## 🧰 Typical Use Cases

- Quickly fix config files on a remote machine via SSH  
- Edit log files or `.env` files with full text visibility  
- Update scripts or JSON/YAML files without `vim` gymnastics  
- Hand off a file to a teammate securely with a temporary tunnel

---

## 🪄 Examples

Edit a server config:

```bash
npx web-editx /etc/nginx/nginx.conf
```

Fix a startup script:

```bash
npx web-editx startup.sh
```

Open access for a teammate (temporary, password-protected):

```bash
npx web-editx /var/www/html/index.html --localtunnel
```

---

## ⚙️ Options

| Command | Description |
|----------|--------------|
| `PORT=4000 npx web-editx file.txt` | Start on a specific port |
| `npx web-editx file.txt --localtunnel` | Create a temporary public tunnel via [localtunnel](https://github.com/localtunnel/localtunnel) |

When using `--localtunnel`, the CLI retrieves a random tunnel password from `https://loca.lt/mytunnelpassword` and displays it with the public URL.  
Share both only with people you trust.

---

## 🔒 Security

- Local-first by default — nothing leaves your machine unless you enable tunneling.  
- The browser clearly warns if it detects a non-localhost session.  
- HTTPS is handled by localtunnel; no extra encryption layer is added.  
- To revoke access, simply stop the CLI — the tunnel closes immediately.

---

## 🧑‍💻 Development Setup

```bash
git clone https://github.com/shakthi/web-editx.git
cd web-editx
npm install
npm link
```

Then test locally:

```bash
npx web-editx test.txt
```

---

## 🧾 Version Highlights

### v1.5.0

**Minor changes**
- Prompt to create missing target files, so you can bootstrap new files without leaving the CLI.
- Pre-flight port availability checks with clearer fallback messaging when the chosen port is busy.
- Localtunnel runs on a random high port by default for more reliable remote editing sessions.

### v1.4.0

**Improved**
- Compact, responsive toolbar for maximum editing area  
- Clearer save status indicators (saving / unsaved / success)  
- Persistent consent for tunnel security warnings  
- Reloading a page no longer terminates the editing session  

---

## 📄 License

MIT © 2025 Shakthi Prasad G S
