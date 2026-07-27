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
        siteEl.textContent = 'Error loading tab info';
    }
}
init();

// Handler pentru butonul "Open in Tab"
const openTabBtn = document.getElementById('openTabBtn');
if (openTabBtn) {
    openTabBtn.addEventListener('click', () => {
        browser.tabs.create({ url: browser.runtime.getURL('popup.html') });
    });
}

// Handler Export Site
const exportSiteBtn = document.getElementById('exportSite');
if (exportSiteBtn) {
    exportSiteBtn.addEventListener('click', async() => {
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
}

// Handler Export All
const exportAllBtn = document.getElementById('exportAll');
if (exportAllBtn) {
    exportAllBtn.addEventListener('click', async() => {
        try {
            const cookies = await browser.cookies.getAll({});
            downloadJSON('cookies_all_sites.json', cookies);
            setStatus(`Exported ${cookies.length} cookie(s) across all sites.`, 'ok');
        } catch (e) {
            setStatus('Export failed: ' + e.message, 'error');
        }
    });
}

// Handler Import
const importBtn = document.getElementById('importBtn');
if (importBtn) {
    importBtn.addEventListener('click', async() => {
        const fileInput = document.getElementById('importFile');
        const file = fileInput ? fileInput.files[0] : null;
        if (!file) {
            setStatus('Choose a JSON file first.', 'error');
            return;
        }
        try {
            const text = await file.text();
            const cookies = JSON.parse(text);
            if (!Array.isArray(cookies)) throw new Error('File is not a cookie export array.');

            let success = 0;
            let failed = 0;

            for (const c of cookies) {
                const domain = c.domain.startsWith('.') ? c.domain.slice(1) : c.domain;
                const protocol = c.secure ? 'https://' : 'http://';
                const url = protocol + domain + (c.path || '/');

                const setDetails = {
                    url,
                    name: c.name,
                    value: c.value,
                    domain: c.hostOnly ? undefined : c.domain,
                    path: c.path,
                    secure: c.secure,
                    httpOnly: c.httpOnly,
                    sameSite: c.sameSite,
                    expirationDate: c.session ? undefined : c.expirationDate
                };

                try {
                    const result = await browser.cookies.set(setDetails);
                    if (result) success++;
                    else failed++;
                } catch (err) {
                    failed++;
                }
            }

            setStatus(`Import done: ${success} set, ${failed} failed.`, failed ? 'error' : 'ok');
        } catch (e) {
            setStatus('Import failed: ' + e.message, 'error');
        }
    });
}

// Handler Refresh Site
const refreshBtn = document.getElementById('refreshBtn');
if (refreshBtn) {
    refreshBtn.addEventListener('click', async() => {
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
}

// Selector File
const fileInput = document.getElementById('importFile');
const selectFileBtn = document.getElementById('selectFileBtn');

if (selectFileBtn && fileInput) {
    selectFileBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const nameEl = document.getElementById('fileName');
        if (nameEl) {
            nameEl.textContent = file ? file.name : 'No file chosen';
        }
    });
}

// Tema Dark / Light
const ICON_DARK = 'icons/dark.png';
const ICON_LIGHT = 'icons/light.png';
const TAB_ICON_DARK = 'icons/open-tab-dark.png';
const TAB_ICON_LIGHT = 'icons/open-tab-light.png';

const themeToggleBtn = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const openTabIcon = document.getElementById('openTabIcon');

browser.storage.local.get(['theme']).then((result) => {
    if (result && result.theme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeIcon) themeIcon.src = ICON_LIGHT;
        if (openTabIcon) openTabIcon.src = TAB_ICON_LIGHT;
    }
});

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', async() => {
        const isDark = document.body.classList.toggle('dark-theme');

        if (isDark) {
            if (themeIcon) themeIcon.src = ICON_LIGHT;
            if (openTabIcon) openTabIcon.src = TAB_ICON_LIGHT;
            await browser.storage.local.set({ theme: 'dark' });
        } else {
            if (themeIcon) themeIcon.src = ICON_DARK;
            if (openTabIcon) openTabIcon.src = TAB_ICON_DARK;
            await browser.storage.local.set({ theme: 'light' });
        }
    });
}