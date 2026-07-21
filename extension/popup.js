const statusEl = document.getElementById('status');
const siteEl = document.getElementById('currentSite');

function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = kind || '';
}

function downloadJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download ?
        chrome.downloads.download({ url, filename, saveAs: true }) :
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
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && /^https?:/.test(tab.url)) {
        currentUrl = tab.url;
        const { hostname } = new URL(tab.url);
        siteEl.textContent = hostname;
    } else {
        siteEl.textContent = 'No accessible site in this tab';
    }
}
init();

document.getElementById('exportSite').addEventListener('click', async() => {
    if (!currentUrl) {
        setStatus('No valid site to export cookies from.', 'error');
        return;
    }
    try {
        const cookies = await chrome.cookies.getAll({ url: currentUrl });
        const hostname = new URL(currentUrl).hostname;
        downloadJSON(`cookies_${hostname}.json`, cookies);
        setStatus(`Exported ${cookies.length} cookie(s) for ${hostname}.`, 'ok');
    } catch (e) {
        setStatus('Export failed: ' + e.message, 'error');
    }
});

document.getElementById('exportAll').addEventListener('click', async() => {
    try {
        const cookies = await chrome.cookies.getAll({});
        downloadJSON('cookies_all_sites.json', cookies);
        setStatus(`Exported ${cookies.length} cookie(s) across all sites.`, 'ok');
    } catch (e) {
        setStatus('Export failed: ' + e.message, 'error');
    }
});

document.getElementById('importBtn').addEventListener('click', async() => {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
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
            // Rebuild the URL chrome.cookies.set requires
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
                expirationDate: c.session ? undefined : c.expirationDate,
                storeId: undefined
            };

            try {
                const result = await chrome.cookies.set(setDetails);
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

document.getElementById('refreshBtn').addEventListener('click', async() => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
            await chrome.tabs.reload(tab.id);
            setStatus('Site refreshed.', 'ok');
        } else {
            setStatus('No active tab to refresh.', 'error');
        }
    } catch (e) {
        setStatus('Refresh failed: ' + e.message, 'error');
    }
});