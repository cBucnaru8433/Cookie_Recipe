window.browser = window.browser || window.chrome;

const statusEl = document.getElementById('status');
const fileInput = document.getElementById('importFile');
const nameEl = document.getElementById('fileName');
const dropZone = document.getElementById('dropZone');

function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = kind || '';
}

// Drag & Drop & Selector
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    nameEl.textContent = file ? file.name : 'No file chosen';
});

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
    }, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
});

dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
        fileInput.files = files;
        nameEl.textContent = files[0].name;
    }
});

document.getElementById('importBtn').addEventListener('click', async() => {
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