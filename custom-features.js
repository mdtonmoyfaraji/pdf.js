(() => {
    "use strict";

    const TAB_ID_KEY = "pdfjs-tab-id";
    const STORAGE_PREFIX = "pdfjs-last-url:";

    function getOrCreateTabId() {
        let tabId = sessionStorage.getItem(TAB_ID_KEY);

        if (tabId) return tabId;

        tabId = self.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        sessionStorage.setItem(TAB_ID_KEY, tabId);

        return tabId;
    }

    const storageKey = `${STORAGE_PREFIX}${getOrCreateTabId()}`;

    function getCurrentFile() {
        const params = new URLSearchParams(location.search);
        return params.get("file");
    }

    function saveCurrentFile(file = getCurrentFile()) {
        if (!file) return;

        try {
            localStorage.setItem(storageKey, file);
        } catch {
            // Ignore storage failures (e.g. private mode restrictions).
        }
    }

    function restoreCurrentFile() {
        const file = getCurrentFile();

        if (file) {
            saveCurrentFile();
            return;
        }

        let remembered = null;

        try {
            remembered = localStorage.getItem(storageKey);
        } catch {
            // Ignore storage failures (e.g. private mode restrictions).
        }

        if (!remembered) return;

        const url = new URL(location.href);

        url.searchParams.set("file", remembered);

        location.replace(url.toString());
    }

    restoreCurrentFile();

    let previous = getCurrentFile();

    setInterval(() => {
        const current = getCurrentFile();

        if (current !== previous) {
            previous = current;
            saveCurrentFile();
        }
    }, 500);
})();
