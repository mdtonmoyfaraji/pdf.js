(() => {
    "use strict";

    const STORAGE_KEY = "pdfjs-last-url";

    function getCurrentFile() {
        const params = new URLSearchParams(location.search);
        return params.get("file");
    }

    function saveCurrentFile() {
        const file = getCurrentFile();

        if (!file) return;

        sessionStorage.setItem(STORAGE_KEY, file);
    }

    function restoreCurrentFile() {
        const file = getCurrentFile();

        if (file) {
            saveCurrentFile();
            return;
        }

        const remembered = sessionStorage.getItem(STORAGE_KEY);

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
