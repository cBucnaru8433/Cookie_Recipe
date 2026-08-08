window.browser = window.browser || window.chrome;

const statusEl = document.getElementById('status');
const siteEl = document.getElementById('currentSite');

function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = kind || '';
}

function downloadJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    browser.downloads.download ?
        browser.downloads.download({ url, filename, saveAs: true }) :
        (() => {
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
        })();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
}

let currentUrl = null;

async function init() {
    try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && /^https?:/.test(tab.url)) {
            currentUrl = tab.url;
            const { hostname } = new URL(tab.url);
            siteEl.textContent = hostname;
        } else {
            siteEl.textContent = 'No accessible site in this tab';
        }
    } catch (e) {
        siteEl.textContent = 'Error reading active tab';
    }
}
init();

document.getElementById('openImportBtn').addEventListener('click', () => {
    browser.tabs.create({ url: browser.runtime.getURL('import.html') });
});

document.getElementById('exportSite').addEventListener('click', async() => {
    if (!currentUrl) {
        setStatus('No valid site to export cookies from.', 'error');
        return;
    }
    try {
        const cookies = await browser.cookies.getAll({ url: currentUrl });
        const hostname = new URL(currentUrl).hostname;
        downloadJSON(`cookies_${hostname}.json`, cookies);
        setStatus(`Exported ${cookies.length} cookie(s) for ${hostname}.`, 'ok');
    } catch (e) {
        setStatus('Export failed: ' + e.message, 'error');
    }
});

document.getElementById('exportAll').addEventListener('click', async() => {
    try {
        const cookies = await browser.cookies.getAll({});
        downloadJSON('cookies_all_sites.json', cookies);
        setStatus(`Exported ${cookies.length} cookie(s) across all sites.`, 'ok');
    } catch (e) {
        setStatus('Export failed: ' + e.message, 'error');
    }
});

document.getElementById('refreshBtn').addEventListener('click', async() => {
    try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
            await browser.tabs.reload(tab.id);
            setStatus('Site refreshed.', 'ok');
        } else {
            setStatus('No active tab to refresh.', 'error');
        }
    } catch (e) {
        setStatus('Refresh failed: ' + e.message, 'error');
    }
});

const themeToggleBtn = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const ICON_DARK = 'icons/dark.png';
const ICON_LIGHT = 'icons/light.png';

browser.storage.local.get(['theme']).then((result) => {
    if (result && result.theme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeIcon) themeIcon.src = ICON_LIGHT;
    }
});

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', async() => {
        const isDark = document.body.classList.toggle('dark-theme');
        if (isDark) {
            if (themeIcon) themeIcon.src = ICON_LIGHT;
            await browser.storage.local.set({ theme: 'dark' });
        } else {
            if (themeIcon) themeIcon.src = ICON_DARK;
            await browser.storage.local.set({ theme: 'light' });
        }
    });
}