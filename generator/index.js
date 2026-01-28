const fs = require('fs');
const path = require('path');
const cleanIPs = require('./ips.js');

const subLinks = ["https://raw.githubusercontent.com/freefq/free/master/v2","https://raw.githubusercontent.com/Pawdroid/Free-servers/main/sub","https://raw.githubusercontent.com/aiboboxx/v2rayfree/main/v2","https://raw.githubusercontent.com/AzadNetCH/Clash/main/V2Ray.txt"];
const cnfLinks = ["https://raw.githubusercontent.com/mahdibland/ShadowsocksAggregator/master/sub/sub_merge.txt","https://raw.githubusercontent.com/awesome-vpn/awesome-vpn/master/all"];

const configDir = path.join(__dirname, '../configs');
if (!fs.existsSync(configDir)) fs.mkdirSync(configDir);

function decodeVmess(conf) {
    try { return JSON.parse(Buffer.from(conf.replace("vmess://", ""), 'base64').toString('utf-8')); } catch { return null; }
}

function encodeVmess(conf) {
    try { return "vmess://" + Buffer.from(JSON.stringify(conf)).toString('base64'); } catch { return null; }
}

function isIp(str) { return /^(\d{1,3}\.){3}\d{1,3}$/.test(str); }

async function start() {
    let allConfigs = [];
    const lastUpdate = new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' });

    for (const link of [...subLinks, ...cnfLinks]) {
        try {
            const res = await fetch(link);
            const text = await res.text();
            let decodedText = text.includes("://") ? text : Buffer.from(text, 'base64').toString('utf-8');
            allConfigs.push(...decodedText.split("\n"));
        } catch (e) {}
    }

    const processedVmess = allConfigs.filter(cnf => cnf.startsWith("vmess://")).map(cnf => {
        let conf = decodeVmess(cnf);
        if (!conf || conf.tls !== "tls") return null;
        let addr = conf.sni || (!isIp(conf.add) ? conf.add : (conf.host && !isIp(conf.host) ? conf.host : null));
        if (!addr) return conf;
        conf.ps = (conf.ps || "Config") + "-Edge";
        conf.path = "/" + addr + ":" + conf.port + "/" + (conf.path || "").replace(/^\//g, "");
        conf.add = cleanIPs[Math.floor(Math.random() * cleanIPs.length)];
        conf.port = 443;
        return encodeVmess(conf);
    }).filter(Boolean);

    const sizes = [50, 100, 200, 300, 500, 700, 1000];
    sizes.forEach(size => {
        const sliced = processedVmess.slice(0, size);
        fs.writeFileSync(path.join(configDir, `sub_${size}.txt`), Buffer.from(sliced.join("\n")).toString('base64'));
        fs.writeFileSync(path.join(configDir, `sub_${size}.json`), JSON.stringify(sliced.map(decodeVmess), null, 2));
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edge Panel</title>
    <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
    <style>
        :root { --bg: #f8fafc; --card: #ffffff; --text: #0f172a; --primary: #2563eb; }
        .dark { --bg: #0f172a; --card: #1e293b; --text: #f8fafc; --primary: #3b82f6; }
        body { background: var(--bg); color: var(--text); font-family: Tahoma, sans-serif; margin: 0; padding: 20px; transition: 0.3s; }
        .container { max-width: 800px; margin: auto; }
        .header { text-align: center; padding: 30px; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; border-radius: 20px; margin-bottom: 20px; }
        .update-time { font-size: 0.9em; background: rgba(0,0,0,0.2); padding: 5px 15px; border-radius: 50px; display: inline-block; margin-top: 10px; }
        .accordion { background: var(--card); border-radius: 12px; margin-bottom: 10px; border: 1px solid rgba(0,0,0,0.1); }
        .acc-header { padding: 15px 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
        .acc-content { display: none; padding: 20px; border-top: 1px solid rgba(0,0,0,0.05); background: var(--bg); }
        .btn-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; }
        button, .btn { padding: 10px; border-radius: 8px; border: 1px solid var(--primary); background: transparent; color: var(--primary); cursor: pointer; font-size: 12px; font-weight: 600; text-decoration: none; text-align: center; }
        button:hover { background: var(--primary); color: white; }
        .qr-box { display: none; text-align: center; margin-top: 15px; padding: 10px; background: white; border-radius: 10px; }
        .controls { position: fixed; bottom: 20px; left: 20px; display: flex; gap: 10px; }
    </style>
</head>
<body>
    <div class="controls"><button onclick="document.body.classList.toggle('dark')">🌓</button><button onclick="toggleLang()">🌐 EN/FA</button></div>
    <div class="container">
        <div class="header">
            <h1 id="title">پنل مدیریت ساب‌سکریپشن</h1>
            <div class="update-time">آخرین آپدیت: ${lastUpdate} (ایران)</div>
            <p id="credit" style="margin-top:10px; opacity:0.8;">توسعه یافته توسط: Me</p>
        </div>
        ${sizes.map(size => `
        <div class="accordion">
            <div class="acc-header" onclick="this.parentElement.querySelector('.acc-content').style.display = this.parentElement.querySelector('.acc-content').style.display === 'block' ? 'none' : 'block'">
                <span>Subscription - ${size} Configs</span>
                <span>▼</span>
            </div>
            <div class="acc-content">
                <div class="btn-grid">
                    <button onclick="copy('configs/sub_${size}.txt')">Copy Xray</button>
                    <button onclick="copy('configs/sub_${size}.txt')">Copy Sing-Box</button>
                    <button onclick="showQR('configs/sub_${size}.txt', 'qr-${size}')">QR Code</button>
                    <a href="configs/sub_${size}.json" class="btn" download>JSON File</a>
                </div>
                <div id="qr-${size}" class="qr-box"></div>
            </div>
        </div>`).join('')}
    </div>
    <script>
        function copy(path) {
            const url = window.location.origin + window.location.pathname.replace('index.html', '') + path;
            navigator.clipboard.writeText(url); alert('کپی شد!');
        }
        function showQR(path, id) {
            const el = document.getElementById(id);
            if(el.style.display === 'block') { el.style.display = 'none'; return; }
            const url = window.location.origin + window.location.pathname.replace('index.html', '') + path;
            el.innerHTML = ''; const qr = qrcode(0, 'M'); qr.addData(url); qr.make();
            el.innerHTML = qr.createImgTag(5); el.style.display = 'block';
        }
        function toggleLang() {
            const t = document.getElementById('title');
            const isFa = t.innerText === 'پنل مدیریت ساب‌سکریپشن';
            t.innerText = isFa ? 'Subscription Manager' : 'پنل مدیریت ساب‌سکریپشن';
            document.body.dir = isFa ? 'ltr' : 'rtl';
        }
    </script>
</body>
</html>`;
    fs.writeFileSync(path.join(__dirname, '../index.html'), htmlContent);
}
start();
