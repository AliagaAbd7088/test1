const fs = require('fs');
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
            obj.ps = (obj.ps || "Config") + "-Edge";
            obj.port = 443;
            obj.tls = "tls";
            return encodeVmess(obj);
        }
        return null;
    }).filter(Boolean);

    const sizes = [50, 100, 200, 300, 500, 700, 1000];
    sizes.forEach(size => {
        const sliced = processedVmess.slice(0, size);
        fs.writeFileSync(`sub_${size}.txt`, Buffer.from(sliced.join("\n")).toString('base64'));
        fs.writeFileSync(`sub_${size}.json`, JSON.stringify(sliced.map(decodeVmess), null, 2));
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscription Manager</title>
    <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
    <style>
        :root { --bg: #f4f7f6; --card: #ffffff; --text: #333; --primary: #2563eb; }
        .dark { --bg: #1a202c; --card: #2d3748; --text: #f7fafc; --primary: #63b3ed; }
        body { background: var(--bg); color: var(--text); font-family: Tahoma, sans-serif; transition: 0.3s; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .card { background: var(--card); padding: 20px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .flex { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
        button { cursor: pointer; padding: 8px 15px; border-radius: 8px; border: none; background: var(--primary); color: white; transition: 0.2s; }
        button:hover { opacity: 0.8; }
        .qr-box { display: none; margin-top: 10px; text-align: center; background: white; padding: 10px; border-radius: 10px; }
        .lang-switch, .theme-switch { position: fixed; top: 10px; background: #ddd; color: #000; z-index: 100; }
        .theme-switch { left: 10px; } .lang-switch { left: 100px; }
    </style>
</head>
<body>
    <button class="theme-switch" onclick="document.body.classList.toggle('dark')">Day/Night</button>
    <button class="lang-switch" onclick="toggleLang()">EN/FA</button>
    <div class="container">
        <div class="header">
            <h1 id="title">مدیریت ساب‌سکریپشن</h1>
            <p id="credit">Created by Me</p>
        </div>
        ${sizes.map(size => `
        <div class="card">
            <div class="flex">
                <span>Subscription ${size} Configs</span>
                <div class="flex">
                    <button onclick="copy('https://your-raw-url/sub_${size}.txt')">Copy Link</button>
                    <button onclick="showQR('https://your-raw-url/sub_${size}.txt', 'qr-${size}')">QR Code</button>
                    <a href="sub_${size}.json" download><button>JSON</button></a>
                </div>
            </div>
            <div id="qr-${size}" class="qr-box"></div>
        </div>`).join('')}
    </div>
    <script>
        function copy(text) { navigator.clipboard.writeText(text); alert('Copied!'); }
        function showQR(text, id) {
            const el = document.getElementById(id);
            if(el.style.display === 'block') { el.style.display = 'none'; return; }
            el.innerHTML = '';
            const qr = qrcode(0, 'M');
            qr.addData(text);
            qr.make();
            el.innerHTML = qr.createImgTag(5);
            el.style.display = 'block';
        }
        function toggleLang() {
            const t = document.getElementById('title');
            const isFa = t.innerText === 'مدیریت ساب‌سکریپشن';
            t.innerText = isFa ? 'Subscription Manager' : 'مدیریت ساب‌سکریپشن';
            document.body.dir = isFa ? 'ltr' : 'rtl';
        }
    </script>
</body>
</html>`;
    fs.writeFileSync('index.html', htmlContent);
}
start();