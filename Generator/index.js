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

const configDir = path.join(__dirname, '../Configs');
if (!fs.existsSync(configDir)) fs.mkdirSync(configDir);

const toFa = (n) => n.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

async function start() {
    let allConfigs = [];
    const now = new Date();
    const lastUpdateFa = now.toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' });
    const lastUpdateEn = now.toLocaleString('en-US', { timeZone: 'Asia/Tehran' });

    for (const link of [...subLinks, ...cnfLinks]) {
        try {
            const res = await fetch(link);
            if (!res.ok) continue;
            const text = await res.text();
            let decoded = text.includes("://") ? text : Buffer.from(text, 'base64').toString('utf-8');
            allConfigs.push(...decoded.split("\n"));
        } catch (e) { console.log("Fetch Error"); }
    }

    const processed = allConfigs.map(line => {
        line = line.trim();
        if (!line) return null;
        let cleanIp = cleanIPs[Math.floor(Math.random() * cleanIPs.length)];

        if (line.startsWith("vmess://")) {
            try {
                let obj = JSON.parse(Buffer.from(line.replace("vmess://", ""), 'base64').toString('utf-8'));
                obj.add = cleanIp;
                // حفظ پورت اصلی یا ست کردن 443
                obj.port = obj.port && obj.port !== 0 ? obj.port : 443;
                // اصلاح نام: قرار دادن برند شما در ابتدا بدون آی‌پی
                obj.ps = "༻Ali™༺ " + (obj.ps || "Config");
                return "vmess://" + Buffer.from(JSON.stringify(obj)).toString('base64');
            } catch { return null; }
        } 
        
        if (line.startsWith("vless://") || line.startsWith("trojan://") || line.startsWith("ss://")) {
            try {
                let url = new URL(line);
                url.hostname = cleanIp;
                if (!url.port || url.port === "0") url.port = "443";
                // اصلاح نام در بخش Hash
                let originalName = decodeURIComponent(url.hash || "#Config").replace("#", "");
                url.hash = encodeURIComponent("༻Ali™༺ " + originalName);
                return url.toString();
            } catch { return null; }
        }
        return null;
    }).filter(Boolean);

    const sizes = [50, 100, 200, 300, 500, 700, 1000];
    sizes.forEach(size => {
        const sliced = processed.slice(0, size);
        fs.writeFileSync(path.join(configDir, `sub_${size}.txt`), Buffer.from(sliced.join("\n")).toString('base64'));
        fs.writeFileSync(path.join(configDir, `sub_${size}.json`), JSON.stringify(sliced, null, 2));
    });

    const htmlContent = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Config Generator</title>
    <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root { --bg: #f8fafc; --card: #ffffff; --text: #0f172a; --primary: #2563eb; }
        .dark { --bg: #030712; --card: #111827; --text: #f9fafb; --primary: #3b82f6; }
        body { background: var(--bg); color: var(--text); font-family: Tahoma, sans-serif; margin: 0; padding: 20px; transition: 0.3s; line-height: 1.6; }
        .container { max-width: 850px; margin: auto; }
        .header { text-align: center; padding: 35px 25px; background: linear-gradient(135deg, #1e3a8a, #2563eb); color: white; border-radius: 24px; margin-bottom: 25px; box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4); }
        .info-text { background: rgba(255, 255, 255, 0.15); padding: 15px; border-radius: 15px; font-size: 0.95em; margin: 15px 0; border: 1px solid rgba(255,255,255,0.2); text-align: justify; }
        .client-tag { background: #ffd700; color: #000; padding: 2px 8px; border-radius: 5px; font-weight: bold; font-size: 0.85em; }
        .update-time { font-size: 0.85em; background: rgba(0,0,0,0.3); padding: 6px 16px; border-radius: 50px; display: inline-block; }
        .accordion { background: var(--card); border-radius: 16px; margin-bottom: 12px; border: 1px solid rgba(128,128,128,0.1); overflow: hidden; }
        .acc-header { padding: 18px 25px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
        .acc-content { display: none; padding: 20px; background: rgba(128,128,128,0.03); border-top: 1px solid rgba(128,128,128,0.05); }
        .btn-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
        button, .btn { padding: 12px; border-radius: 10px; border: 1.5px solid var(--primary); background: transparent; color: var(--primary); cursor: pointer; font-size: 13px; font-weight: bold; text-decoration: none; text-align: center; transition: 0.2s; }
        button:hover { background: var(--primary); color: white; }
        .footer { text-align: center; margin-top: 40px; padding: 25px; font-size: 16px; border-top: 1px solid rgba(128,128,128,0.1); font-weight: bold; }
        .footer a { color: inherit; text-decoration: none; margin-top: 10px; display: inline-block; }
        .qr-box { display: none; text-align: center; margin-top: 15px; background: white; padding: 15px; border-radius: 12px; }
        .controls { position: fixed; top: 20px; left: 20px; display: flex; gap: 10px; z-index: 1000; }
    </style>
</head>
<body>
    <div class="controls">
        <button onclick="document.body.classList.toggle('dark')">🌓</button>
        <button onclick="toggleLang()">🌐 EN/FA</button>
    </div>
    <div class="container">
        <div class="header">
            <h1 id="title">تولید کننده کانفیگ</h1>
            <div class="info-text" id="info">
                آیپی های تمیز این پنل هر 24 ساعت آپدیت می شود. این پنل هر نیم ساعت آی‌پی‌های تمیز را وارد کانفیگ‌های جمع‌آوری شده از سطح اینترنت می‌کند که می‌تواند باعث بهبود کیفیت اتصال برای شما شود. کلاینت پیشنهادی: <span class="client-tag">V2RayN</span> <span class="client-tag">V2RayNG</span> <span class="client-tag">Hiddify</span>
            </div>
            <div class="update-time" id="utime">آخرین بروزرسانی: ${lastUpdateFa}</div>
        </div>
        ${sizes.map(size => `
        <div class="accordion">
            <div class="acc-header" onclick="this.parentElement.querySelector('.acc-content').style.display = this.parentElement.querySelector('.acc-content').style.display === 'block' ? 'none' : 'block'">
                <span class="acc-title" data-size="${size}">ساب‌سکریپشن ${toFa(size)} کانفیگ</span>
                <span>▼</span>
            </div>
            <div class="acc-content">
                <div class="btn-grid">
                    <button class="b-copy" onclick="copy('Configs/sub_${size}.txt')">کپی لینک ساب‌سکریپشن</button>
                    <button class="b-qr" onclick="showQR('Configs/sub_${size}.txt', 'qr-${size}')">نمایش QR Code</button>
                    <a href="Configs/sub_${size}.json" class="btn b-dl" download>دانلود JSON</a>
                </div>
                <div id="qr-${size}" class="qr-box"></div>
            </div>
        </div>`).join('')}
        <div class="footer" id="footer">
            توسعه یافته با ❤️ توسط ༺Ali™ Linux CS༻ <br>
            <a href="https://github.com/YOUR_GITHUB_ID" target="_blank">
                <i class="fab fa-github"></i> GitHub Profile
            </a>
        </div>
    </div>
    <script>
        let currentLang = 'fa';
        const data = {
            en: { 
                title: "Config Generator", 
                utime: "Last Update: ${lastUpdateEn}", 
                info: "This panel clean IPs update every 24 hours. Every 30 minutes, it injects these IPs into configs collected from the web, improving connection quality. Recommended Clients: <span class='client-tag'>V2RayN</span> <span class='client-tag'>V2RayNG</span> <span class='client-tag'>Hiddify</span>",
                footer: "Developed with ❤️ by ༺Ali™ Linux CS༻ <br> <a href='https://github.com/YOUR_GITHUB_ID' target='_blank'><i class='fab fa-github'></i> GitHub Profile</a>", 
                copy: "Copy Sub Link", qr: "Show QR", dl: "Download JSON", sub: "Subscription" 
            },
            fa: { 
                title: "تولید کننده کانفیگ", 
                utime: "آخرین بروزرسانی: ${lastUpdateFa}", 
                info: "آیپی های تمیز این پنل هر 24 ساعت آپدیت می شود. این پنل هر نیم ساعت آی‌پی‌های تمیز را وارد کانفیگ‌های جمع‌آوری شده از سطح اینترنت می‌کند که می‌تواند باعث بهبود کیفیت اتصال برای شما شود. کلاینت پیشنهادی: <span class='client-tag'>V2RayN</span> <span class='client-tag'>V2RayNG</span> <span class='client-tag'>Hiddify</span>",
                footer: "توسعه یافته با ❤️ توسط ༺Ali™ Linux CS༻ <br> <a href='https://github.com/YOUR_GITHUB_ID' target='_blank'><i class='fab fa-github'></i> GitHub Profile</a>", 
                copy: "کپی لینک ساب‌سکریپشن", qr: "نمایش QR Code", dl: "دانلود JSON", sub: "ساب‌سکریپشن" 
            }
        };
        const toFa = (n) => n.toString().replace(/\\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
        function toggleLang() {
            currentLang = currentLang === 'fa' ? 'en' : 'fa';
            document.body.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
            document.getElementById('title').innerText = data[currentLang].title;
            document.getElementById('info').innerHTML = data[currentLang].info;
            document.getElementById('utime').innerText = data[currentLang].utime;
            document.getElementById('footer').innerHTML = data[currentLang].footer;
            document.querySelectorAll('.b-copy').forEach(b => b.innerText = data[currentLang].copy);
            document.querySelectorAll('.b-qr').forEach(b => b.innerText = data[currentLang].qr);
            document.querySelectorAll('.b-dl').forEach(b => b.innerText = data[currentLang].dl);
            document.querySelectorAll('.acc-title').forEach(t => {
                const s = t.getAttribute('data-size');
                t.innerText = currentLang === 'fa' ? data.fa.sub + ' ' + toFa(s) + ' کانفیگ' : data.en.sub + ' ' + s + ' Configs';
            });
        }
        function copy(path) {
            const url = window.location.origin + window.location.pathname.replace('index.html', '') + path;
            navigator.clipboard.writeText(url); alert(currentLang === 'fa' ? 'لینک کپی شد!' : 'Link Copied!');
        }
        function showQR(path, id) {
            const el = document.getElementById(id);
            if(el.style.display === 'block') { el.style.display = 'none'; return; }
            const url = window.location.origin + window.location.pathname.replace('index.html', '') + path;
            el.innerHTML = ''; const qr = qrcode(0, 'M'); qr.addData(url); qr.make();
            el.innerHTML = qr.createImgTag(5); el.style.display = 'block';
        }
    </script>
</body>
</html>`;
    fs.writeFileSync(path.join(__dirname, '../index.html'), htmlContent);
}
start();
