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

    function getCurrentFileParam() {
        const params = new URLSearchParams(location.search);
        return params.get("file");
    }

    function isRestorableFileUrl(file) {
        if (!file) return false;

        try {
            const url = new URL(file, location.href);
            return url.protocol !== "blob:" && url.protocol !== "data:";
        } catch {
            return !file.startsWith("blob:") && !file.startsWith("data:");
        }
    }

    function saveCurrentFile(file = getCurrentFileParam()) {
        if (!isRestorableFileUrl(file)) return;

        try {
            localStorage.setItem(storageKey, file);
        } catch {
            // Ignore storage failures (e.g. private mode restrictions).
        }
    }

    function setCurrentFileParam(file) {
        if (!isRestorableFileUrl(file)) return;

        const url = new URL(location.href);

        if (url.searchParams.get("file") === file) return;

        url.searchParams.set("file", file);
        history.replaceState(history.state, "", url.toString());
    }

    function restoreCurrentFile() {
        const file = getCurrentFileParam();

        if (isRestorableFileUrl(file)) {
            saveCurrentFile();
            return;
        }

        let remembered = null;

        try {
            remembered = localStorage.getItem(storageKey);
        } catch {
            // Ignore storage failures (e.g. private mode restrictions).
        }

        if (!isRestorableFileUrl(remembered)) return;

        const url = new URL(location.href);

        url.searchParams.set("file", remembered);
        location.replace(url.toString());
    }

    restoreCurrentFile();

    let previous = getCurrentFileParam();

    function getViewerFile() {
        return self.PDFViewerApplication?.url ?? null;
    }

    function syncCurrentFile() {
        const queryFile = getCurrentFileParam();

        if (isRestorableFileUrl(queryFile)) {
            if (queryFile !== previous) {
                previous = queryFile;
                saveCurrentFile(queryFile);
            }
            return;
        }

        const viewerFile = getViewerFile();

        if (!isRestorableFileUrl(viewerFile)) return;
        if (viewerFile === previous) return;

        previous = viewerFile;
        setCurrentFileParam(viewerFile);
        saveCurrentFile(viewerFile);
    }

    setInterval(() => {
        syncCurrentFile();
    }, 500);
})();
