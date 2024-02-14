document.addEventListener("DOMContentLoaded", async () => {
    const style = document.createElement("style");

    document.head.appendChild(style);

    DeimosNative.handleQuickCssUpdate((css: string) => style.innerText = css);

    style.innerText = await DeimosNative.getQuickCss();
});