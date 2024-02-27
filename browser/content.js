// isso é apenas o script do bootstrap

if (typeof browser === "undefined") {
	var browser = chrome;
}

var script = document.createElement("script");

script.src = browser.runtime.getURL("dist/Deimos.js");

// documentelement porque é para ser carregado antes do body/head estiverem prontos
document.documentElement.appendChild(script);