# 0676967.xyz

我的個人網站，以純 HTML / CSS / JavaScript 製作，沒有框架、不需要建置，部署在 GitHub Pages。

## 本機預覽

直接用瀏覽器開啟 `index.html`，或在專案資料夾執行：

```
python -m http.server 8000
```

然後前往 http://localhost:8000。

## 結構

- `index.html`：首頁（繁體中文）
- `css/style.css`：樣式與淺色／深色主題
- `js/theme.js`：深色／淺色主題切換
- `js/main.js`：台北時間、問候語、捲動動畫
- `js/bad-apple.js`：首頁自動播放的 ASCII Bad Apple!!
- `media/bad-apple.gz.txt`：文字影格（gzip + base64），來源與授權見 `THIRD-PARTY-NOTICES.txt`
- `favicon.svg`：網站圖示
- `CNAME`：自訂網域
