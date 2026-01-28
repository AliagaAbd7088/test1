const fs = require('fs');
const path = require('path');
const cleanIPs = require('./ips.js');

const subLinks = [
    "https://raw.githubusercontent.com/freefq/free/master/v2",
    "https://raw.githubusercontent.com/Pawdroid/Free-servers/main/sub",
    "https://raw.githubusercontent.com/aiboboxx/v2rayfree/main/v2",
    "https://raw.githubusercontent.com/AzadNetCH/Clash/main/V2Ray.txt"
];

const cnfLinks = [
    "https://raw.githubusercontent.com/mahdibland/ShadowsocksAggregator/master/sub/sub_merge.txt",
    "https://raw.githubusercontent.com/awesome-vpn/awesome-vpn/master/all"
];

// ایجاد پوشه configs اگر وجود نداشته باشد
const configDir = path.join(__dirname, '../configs');
if (!fs.existsSync(configDir)) fs.mkdirSync(configDir);

function decodeVmess(conf) {
    try { return JSON.parse(Buffer.from(conf.replace("vmess://", ""), 'base64').toString('utf-8')); } catch { return null; }
}

function encodeVmess(conf) {
    try { return "vmess://" + Buffer.from(JSON.stringify(conf)).toString('base64'); } catch { return null; }
}

async function start() {
    let allConfigs = [];
    for (const link of [...subLinks, ...cnfLinks]) {
        try {
            const res = await fetch(link);
            const text = await res.text();
            let decodedText = text.includes("://") ? text : Buffer.from(text, 'base64').toString('utf-8');
            allConfigs.push(...decodedText.split("\n"));
        } catch (e) {}
    }

    const processedVmess = allConfigs.filter(cnf => cnf.startsWith("vmess://")).map(cnf => {
        let obj = decodeVmess(cnf);
        if (obj && obj.add) {
            obj.add = cleanIPs[Math.floor(Math.random() * cleanIPs.length)];
            obj.ps = (obj.ps || "Config") + "-GitHub";
            obj.port = 443;
            obj.tls = "tls";
            obj.sni = "google.com"; // SNI پیش‌فرض
            return encodeVmess(obj);
        }
        return null;
    }).filter(Boolean);

    const sizes = [50, 100, 200, 300, 500, 700, 1000];
    sizes.forEach(size => {
        const sliced = processedVmess.slice(0, size);
        fs.writeFileSync(path.join(configDir, `sub_${size}.txt`), Buffer.from(sliced.join("\n")).toString('base64'));
        fs.writeFileSync(path.join(configDir, `sub_${size}.json`), JSON.stringify(sliced.map(decodeVmess), null, 2));
    });

    // تولید فایل index.html در ریشه اصلی ریپازیتوری
    const htmlContent = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscription Manager</title>
    <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
    <style>
        :root { --bg: #f0f2f5; --card: #ffffff; --text: #1c1e21; --primary: #007bff; --accent: #28a745; }
        .dark { --bg: #18191a; --card: #242526; --text: #e4e6eb; --primary: #2d8cf0; }
        body { background: var(--bg); color: var(--text); font-family: 'Segoe UI', Tahoma, sans-serif; transition: 0.3s; margin: 0; padding: 15px; }
        .container { max-width: 900px; margin: auto; }
        .header { text-align: center; padding: 40px 0; background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); color: white; border-radius: 20px; margin-bottom: 30px; }
        .card { background: var(--card); padding: 20px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 20px; border: 1px solid rgba(128,128,128,0.1); }
        .flex { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
        .btn-group { display: flex; gap: 8px; flex-wrap: wrap; }
        button, .btn { cursor: pointer; padding: 10px 18px; border-radius: 10px; border: none; background: var(--primary); color: white; font-weight: bold; font-size: 14px; transition: 0.3s; text-decoration: none; }
        .btn-success { background: var(--accent); }
        button:hover { transform: translateY(-2px); filter: brightness(1.1); }
        .qr-box { display: none; margin-top: 15px; text-align: center; background: white; padding: 15px; border-radius: 12px; border: 2px dashed var(--primary); }
        .controls { position: fixed; top: 15px; left: 15px; display: flex; gap: 10px; z-index: 1000; }
        .footer { text-align: center; font-size: 14px; margin-top: 40px; opacity: 0.7; }
    </style>
</head>
<body>
    <div class="controls">
        <button onclick="document.body.classList.toggle('dark')">🌓</button>
        <button onclick="toggleLang()">🌐 EN/FA</button>
    </div>
    <div class="container">
        <div class="header">
            <h1 id="title">پنل مدیریت ساب‌سکریپشن</h1>
            <p id="credit">توسعه یافته توسط: Me</p>
        </div>
        ${sizes.map(size => `
        <div class="card">
            <div class="flex">
                <div>
                    <strong style="font-size: 18px;">Subscription ${size} Configs</strong>
                    <div style="font-size: 12px; opacity: 0.6; margin-top: 5px;">Format: Base64 / JSON</div>
                </div>
                <div class="btn-group">
                    <button onclick="copy('configs/sub_${size}.txt')">Copy Link</button>
                    <button class="btn-success" onclick="showQR('configs/sub_${size}.txt', 'qr-${size}')">QR Code</button>
                    <a href="configs/sub_${size}.json" class="btn" download>Download JSON</a>
                </div>
            </div>
            <div id="qr-${size}" class="qr-box"></div>
        </div>`).join('')}
        <div class="footer">
            <p>© 2024 Created by Me | All rights reserved</p>
        </div>
    </div>
    <script>
        function copy(path) {
            const fullUrl = window.location.origin + window.location.pathname.replace('index.html', '') + path;
            navigator.clipboard.writeText(fullUrl);
            alert('لینک با موفقیت کپی شد!');
        }
        function showQR(path, id) {
            const el = document.getElementById(id);
            if(el.style.display === 'block') { el.style.display = 'none'; return; }
            const fullUrl = window.location.origin + window.location.pathname.replace('index.html', '') + path;
            el.innerHTML = '';
            const qr = qrcode(0, 'M');
            qr.addData(fullUrl);
            qr.make();
            el.innerHTML = qr.createImgTag(6);
            el.style.display = 'block';
        }
        function toggleLang() {
            const t = document.getElementById('title');
            const isFa = t.innerText === 'پنل مدیریت ساب‌سکریپشن';
            t.innerText = isFa ? 'Subscription Control Panel' : 'پنل مدیریت ساب‌سکریپشن';
            document.getElementById('credit').innerText = isFa ? 'Developed by: Me' : 'توسعه یافته توسط: Me';
            document.body.dir = isFa ? 'ltr' : 'rtl';
        }
    </script>
</body>
</html>`;
    fs.writeFileSync(path.join(__dirname, '../index.html'), htmlContent);
    console.log("All tasks completed!");
}
start();
