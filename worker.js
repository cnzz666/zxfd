// worker.js
addEventListener('fetch', event => {
  try {
    const url = new URL(event.request.url);
    thisProxyServerUrlHttps = `${url.protocol}//${url.hostname}/`;
    thisProxyServerUrl_hostOnly = url.host;
    event.respondWith(handleRequest(event.request));
  } catch (e) {
    event.respondWith(getHTMLResponse(`Error: ${e.message}`));
  }
});

// Global Variables
const str = "/";
const lastVisitProxyCookie = "__PROXY_VISITEDSITE__";
const passwordCookieName = "__PROXY_PWD__";
const proxyHintCookieName = "__PROXY_HINT_ACK__";
const languageCookieName = "__PROXY_LANGUAGE__";
const deviceCookieName = "__PROXY_DEVICE__";
const blockExtensionsCookieName = "__PROXY_BLOCK_EXTENSIONS__";
const blockAdsCookieName = "__PROXY_BLOCK_ADS__";
const blockElementsCookieName = "__PROXY_BLOCK_ELEMENTS__";
const blockElementsScopeCookieName = "__PROXY_BLOCK_ELEMENTS_SCOPE__";
const customHeadersCookieName = "__PROXY_CUSTOM_HEADERS__";
const password = "";
const showPasswordPage = true;
const replaceUrlObj = "__location_yproxy__";
const injectedJsId = "__yproxy_injected_js_id__";
let thisProxyServerUrlHttps;
let thisProxyServerUrl_hostOnly;

// Supported Languages
const supportedLanguages = [
  { code: "zh-CN", name: "中文 (简体)" },
  { code: "en-US", name: "English (US)" },
  { code: "es-ES", name: "Español" },
  { code: "hi-IN", name: "हिन्दी" },
  { code: "ar-SA", name: "العربية" },
  { code: "pt-BR", name: "Português (Brasil)" },
  { code: "ru-RU", name: "Русский" },
  { code: "fr-FR", name: "Français" },
  { code: "de-DE", name: "Deutsch" },
  { code: "ja-JP", name: "日本語" }
];

// Device Simulation
const deviceUserAgents = {
  desktop: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  mobile: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
};

const deviceLayouts = {
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 375, height: 667 }
};

// Ad Blocking Keywords
const adBlockKeywords = [
  "ads.", "ad.", "advert", "banner", "sponsor", "doubleclick", "googlead", "adserver", "popunder", "interstitial",
  "googlesyndication.com", "adsense.google.com", "admob.com", "adclick.g.doubleclick.net"
];

// Proxy Hint Injection
const proxyHintInjection = `
setTimeout(() => {
  if (document.cookie.includes("${proxyHintCookieName}=agreed")) return;
  const hint = "警告：您当前正在使用网络代理，请勿登录任何网站。单击关闭此提示。详情请见 <a href='https://github.com/1234567Yang/cf-proxy-ex/' style='color: #ffd700;'>https://github.com/1234567Yang/cf-proxy-ex/</a>。";
  const div = document.createElement('div');
  div.id = "__PROXY_HINT_DIV__";
  div.style = "position: fixed; left: 0; top: 0; width: 100%; margin: 0; padding: 0; display: block; z-index: 99999999999999999999999; user-select: none; cursor: pointer;";
  div.innerHTML = \`<span style="position: absolute; width: calc(100% - 20px); min-height: 30px; font-size: 18px; color: yellow; background: rgba(180, 0, 0, 0.9); text-align: center; border-radius: 5px; padding: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">\${hint}</span>\`;
  div.onclick = () => div.remove();
  const appendHint = () => document.body.insertAdjacentElement('afterbegin', div);
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    appendHint();
  } else {
    document.addEventListener('DOMContentLoaded', appendHint);
  }
}, 5000);
`;

// Disguise Injection
const disguiseInjection = `
(function() {
  const now = new URL(window.location.href);
  const proxyBase = now.host;
  const proxyProtocol = now.protocol;
  const proxyPrefix = proxyProtocol + "//" + proxyBase + "/";
  const oriUrlStr = window.location.href.substring(proxyPrefix.length);
  const oriUrl = new URL(oriUrlStr);
  const originalHost = oriUrl.host;
  const originalOrigin = oriUrl.origin;
  Object.defineProperty(document, 'domain', { get: () => originalHost, set: value => value });
  Object.defineProperty(window, 'origin', { get: () => originalOrigin });
  Object.defineProperty(document, 'referrer', {
    get: () => {
      const actualReferrer = document.referrer || '';
      return actualReferrer.startsWith(proxyPrefix) ? actualReferrer.replace(proxyPrefix, '') : actualReferrer;
    }
  });
  if (navigator.userAgentData) {
    Object.defineProperty(navigator, 'userAgentData', {
      get: () => ({ brands: [{ brand: "Chromium", version: "90" }], mobile: false, platform: "Windows" })
    });
  }
  const languageCookie = document.cookie.split('; ').find(row => row.startsWith('${languageCookieName}='));
  const selectedLanguage = languageCookie ? languageCookie.split('=')[1] : 'zh-CN';
  Object.defineProperty(navigator, 'language', { get: () => selectedLanguage });
  Object.defineProperty(navigator, 'languages', { get: () => [selectedLanguage] });
  const deviceCookie = document.cookie.split('; ').find(row => row.startsWith('${deviceCookieName}='));
  const deviceType = deviceCookie ? deviceCookie.split('=')[1] : 'none';
  if (deviceType !== 'none') {
    const layouts = ${JSON.stringify(deviceLayouts)};
    const layout = layouts[deviceType] || layouts.desktop;
    Object.defineProperty(window, 'innerWidth', { get: () => layout.width });
    Object.defineProperty(window, 'innerHeight', { get: () => layout.height });
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=' + layout.width + ', initial-scale=1.0';
    document.head.appendChild(meta);
  }
})();
`;

// Block Elements Injection
const blockElementsInjection = `
(function() {
  const blockElements = document.cookie.split('; ').find(row => row.startsWith('${blockElementsCookieName}='));
  const blockElementsScope = document.cookie.split('; ').find(row => row.startsWith('${blockElementsScopeCookieName}='));
  const selectors = blockElements ? blockElements.split('=')[1].split(',').map(s => s.trim()).filter(s => s) : [];
  const scope = blockElementsScope ? blockElementsScope.split('=')[1] : 'global';
  const currentUrl = window.location.href;
  if (scope === 'global' || (scope === 'specific' && currentUrl.includes(scope))) {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        selectors.forEach(selector => {
          try {
            document.querySelectorAll(selector).forEach(el => el.remove());
          } catch (e) {}
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    selectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => el.remove());
      } catch (e) {}
    });
    const adSelectors = ${JSON.stringify(adBlockKeywords.map(keyword => `[class*="${keyword}"], [id*="${keyword}"]`))};
    adSelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => el.remove());
      } catch (e) {}
    });
  }
})();
`;

// HTTP Request Injection
const httpRequestInjection = `
(function() {
  var nowURL = new URL(window.location.href);
  var proxy_host = nowURL.host;
  var proxy_protocol = nowURL.protocol;
  var proxy_host_with_schema = proxy_protocol + "//" + proxy_host + "/";
  var original_website_url_str = window.location.href.substring(proxy_host_with_schema.length);
  var original_website_url = new URL(original_website_url_str);
  var original_website_href = nowURL.pathname.substring(1);
  if(!original_website_href.startsWith("http")) original_website_href = "https://" + original_website_href;
  var original_website_host = original_website_url_str.substring(original_website_url_str.indexOf("://") + "://".length);
  original_website_host = original_website_host.split('/')[0];
  var original_website_host_with_schema = original_website_url_str.substring(0, original_website_url_str.indexOf("://")) + "://" + original_website_host + "/";
  function changeURL(relativePath) {
    if(relativePath == null) return null;
    try {
      if(relativePath.startsWith("data:") || relativePath.startsWith("mailto:") || relativePath.startsWith("javascript:") || relativePath.startsWith("chrome") || relativePath.startsWith("edge")) return relativePath;
    } catch {}
    try {
      if(relativePath && relativePath.startsWith(proxy_host_with_schema)) relativePath = relativePath.substring(proxy_host_with_schema.length);
      if(relativePath && relativePath.startsWith(proxy_host + "/")) relativePath = relativePath.substring(proxy_host.length + 1);
      if(relativePath && relativePath.startsWith(proxy_host)) relativePath = relativePath.substring(proxy_host.length);
    } catch {}
    try {
      var absolutePath = new URL(relativePath, original_website_url_str).href;
      absolutePath = absolutePath.replace(window.location.href, original_website_href);
      absolutePath = absolutePath.replace(encodeURI(window.location.href), encodeURI(original_website_href));
      absolutePath = absolutePath.replace(encodeURIComponent(window.location.href), encodeURIComponent(original_website_href));
      absolutePath = absolutePath.replace(proxy_host, original_website_host);
      absolutePath = absolutePath.replace(encodeURI(proxy_host), encodeURI(original_website_host));
      absolutePath = absolutePath.replace(encodeURIComponent(proxy_host), encodeURIComponent(original_website_host));
      absolutePath = proxy_host_with_schema + absolutePath;
      return absolutePath;
    } catch {
      return null;
    }
  }
  function getOriginalUrl(url) {
    if(url == null) return null;
    if(url.startsWith(proxy_host_with_schema)) return url.substring(proxy_host_with_schema.length);
    return url;
  }
  function networkInject() {
    var originalOpen = XMLHttpRequest.prototype.open;
    var originalFetch = window.fetch;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      url = changeURL(url);
      if (!url) return;
      return originalOpen.apply(this, arguments);
    };
    window.fetch = function(input, init) {
      var url;
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof Request) {
        url = input.url;
      } else {
        url = input;
      }
      url = changeURL(url);
      if (!url) return Promise.reject(new Error('Invalid URL'));
      if (typeof input === 'string') {
        return originalFetch(url, init);
      } else {
        const newRequest = new Request(url, input);
        return originalFetch(newRequest, init);
      }
    };
  }
  function windowOpenInject() {
    const originalOpen = window.open;
    window.open = function(url, name, specs) {
      let modifiedUrl = changeURL(url);
      if (!modifiedUrl) return null;
      return originalOpen.call(window, modifiedUrl, name, specs);
    };
  }
  function appendChildInject() {
    const originalAppendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function(child) {
      try {
        if(child.src) child.src = changeURL(child.src);
        if(child.href) child.href = changeURL(child.href);
      } catch {}
      return originalAppendChild.call(this, child);
    };
  }
  function elementPropertyInject() {
    const originalSetAttribute = HTMLElement.prototype.setAttribute;
    HTMLElement.prototype.setAttribute = function(name, value) {
      if (name === "src" || name === "href") value = changeURL(value) || value;
      originalSetAttribute.call(this, name, value);
    };
    const originalGetAttribute = HTMLElement.prototype.getAttribute;
    HTMLElement.prototype.getAttribute = function(name) {
      const val = originalGetAttribute.call(this, name);
      if (name === "href" || name === "src") return getOriginalUrl(val);
      return val;
    };
    const descriptor = Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, 'href');
    Object.defineProperty(HTMLAnchorElement.prototype, 'href', {
      get: function() {
        const real = descriptor.get.call(this);
        return getOriginalUrl(real);
      },
      set: function(val) {
        descriptor.set.call(this, changeURL(val));
      },
      configurable: true
    });
  }
  class ProxyLocation {
    constructor(originalLocation) { this.originalLocation = originalLocation; }
    getStrNPosition(string, subString, index) {
      return string.split(subString, index).join(subString).length;
    }
    getOriginalHref() {
      return window.location.href.substring(this.getStrNPosition(window.location.href, "/", 3) + 1);
    }
    reload(forcedReload) { this.originalLocation.reload(forcedReload); }
    replace(url) { this.originalLocation.replace(changeURL(url) || url); }
    assign(url) { this.originalLocation.assign(changeURL(url) || url); }
    get href() { return this.getOriginalHref(); }
    set href(url) { this.originalLocation.href = changeURL(url) || url; }
    get protocol() { return original_website_url.protocol; }
    set protocol(value) {
      original_website_url.protocol = value;
      window.location.href = proxy_host_with_schema + original_website_url.href;
    }
    get host() { return original_website_url.host; }
    set host(value) {
      original_website_url.host = value;
      window.location.href = proxy_host_with_schema + original_website_url.href;
    }
    get hostname() { return original_website_url.hostname; }
    set hostname(value) {
      original_website_url.hostname = value;
      window.location.href = proxy_host_with_schema + original_website_url.href;
    }
    get port() { return original_website_url.port; }
    set port(value) {
      original_website_url.port = value;
      window.location.href = proxy_host_with_schema + original_website_url.href;
    }
    get pathname() { return original_website_url.pathname; }
    set pathname(value) {
      original_website_url.pathname = value;
      window.location.href = proxy_host_with_schema + original_website_url.href;
    }
    get search() { return original_website_url.search; }
    set search(value) {
      original_website_url.search = value;
      window.location.href = proxy_host_with_schema + original_website_url.href;
    }
    get hash() { return original_website_url.hash; }
    set hash(value) {
      original_website_url.hash = value;
      window.location.href = proxy_host_with_schema + original_website_url.href;
    }
    get origin() { return original_website_url.origin; }
  }
  function documentLocationInject() {
    Object.defineProperty(document, 'URL', {
      get: () => original_website_url_str,
      set: url => document.URL = changeURL(url) || url
    });
    Object.defineProperty(document, '${replaceUrlObj}', {
      get: () => new ProxyLocation(window.location),
      set: url => window.location.href = changeURL(url) || url
    });
  }
  function windowLocationInject() {
    Object.defineProperty(window, '${replaceUrlObj}', {
      get: () => new ProxyLocation(window.location),
      set: url => window.location.href = changeURL(url) || url
    });
  }
  function historyInject() {
    const originalPushState = History.prototype.pushState;
    const originalReplaceState = History.prototype.replaceState;
    History.prototype.pushState = function(state, title, url) {
      if (!url) return;
      if(url.startsWith("/" + original_website_url.href)) url = url.substring(("/" + original_website_url.href).length);
      if(url.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1))) url = url.substring(("/" + original_website_url.href).length - 1);
      if(url.startsWith("/" + original_website_url.href.replace("://", ":/"))) url = url.substring(("/" + original_website_url.href.replace("://", ":/")).length);
      if(url.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1).replace("://", ":/"))) url = url.substring(("/" + original_website_url.href).replace("://", ":/").length - 1);
      const u = changeURL(url);
      if (!u) return;
      return originalPushState.apply(this, [state, title, u]);
    };
    History.prototype.replaceState = function(state, title, url) {
      if (!url) return;
      if(url.startsWith("/" + original_website_url.href)) url = url.substring(("/" + original_website_url.href).length);
      if(url.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1))) url = url.substring(("/" + original_website_url.href).length - 1);
      if(url.startsWith("/" + original_website_url.href.replace("://", ":/"))) url = url.substring(("/" + original_website_url.href.replace("://", ":/")).length);
      if(url.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1).replace("://", ":/"))) url = url.substring(("/" + original_website_url.href).replace("://", ":/").length - 1);
      const u = changeURL(url);
      if (!u) return;
      return originalReplaceState.apply(this, [state, title, u]);
    };
  }
  function obsPage() {
    const yProxyObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => traverseAndConvert(mutation));
    });
    const config = { attributes: true, childList: true, subtree: true };
    yProxyObserver.observe(document.body, config);
  }
  function traverseAndConvert(node) {
    if (node instanceof HTMLElement) {
      removeIntegrityAttributesFromElement(node);
      covToAbs(node);
      node.querySelectorAll('*').forEach(child => {
        removeIntegrityAttributesFromElement(child);
        covToAbs(child);
      });
    }
  }
  function covToAbs(element) {
    let relativePath = "";
    let setAttr = "";
    if (element instanceof HTMLElement && element.hasAttribute("href")) {
      relativePath = element.getAttribute("href");
      setAttr = "href";
    }
    if (element instanceof HTMLElement && element.hasAttribute("src")) {
      relativePath = element.getAttribute("src");
      setAttr = "src";
    }
    if (setAttr !== "" && relativePath.indexOf(proxy_host_with_schema) !== 0) {
      if (!relativePath.includes("*")) {
        try {
          const absolutePath = changeURL(relativePath);
          if (absolutePath) element.setAttribute(setAttr, absolutePath);
        } catch {}
      }
    }
  }
  function removeIntegrityAttributesFromElement(element) {
    if (element.hasAttribute('integrity')) element.removeAttribute('integrity');
  }
  function loopAndConvertToAbs() {
    for (const ele of document.querySelectorAll('*')) {
      removeIntegrityAttributesFromElement(ele);
      covToAbs(ele);
    }
  }
  function covScript() {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) covToAbs(scripts[i]);
    setTimeout(covScript, 3000);
  }
  networkInject();
  windowOpenInject();
  appendChildInject();
  elementPropertyInject();
  documentLocationInject();
  windowLocationInject();
  historyInject();
  window.addEventListener('load', () => {
    loopAndConvertToAbs();
    obsPage();
    covScript();
  });
  window.addEventListener('error', event => {
    const element = event.target || event.srcElement;
    if (element.tagName === 'SCRIPT') {
      if (element.alreadyChanged) return;
      removeIntegrityAttributesFromElement(element);
      covToAbs(element);
      const newScript = document.createElement("script");
      newScript.src = element.src;
      newScript.async = element.async;
      newScript.defer = element.defer;
      newScript.alreadyChanged = true;
      document.head.appendChild(newScript);
    }
  }, true);
  ${disguiseInjection}
  ${blockElementsInjection}
})();
`;

// Main Page HTML
const mainPage = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Web Online Proxy</title>
  <style>
    html, body {
      height: 100%;
      margin: 0;
      overflow: auto;
      background-color: #e0f7fa;
      font-family: 'Roboto', Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #333333;
      background: linear-gradient(135deg, #4fc3f7, #29b6f6);
      position: relative;
      overflow: hidden;
    }
    .content {
      text-align: center;
      max-width: 80%;
      padding: 30px;
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 15px;
      box-shadow: 0 8px 32px rgba(79, 195, 247, 0.3), 0 0 10px rgba(176, 196, 222, 0.2);
      backdrop-filter: blur(5px);
      border: 1px solid rgba(79, 195, 247, 0.3);
      transform: scale(0.5);
      opacity: 0.5;
      filter: blur(10px);
      transition: transform 1s ease-out, opacity 1s ease-out, filter 1s ease-out;
      position: relative;
      z-index: 1;
    }
    .content.loaded {
      transform: scale(1);
      opacity: 1;
      filter: blur(0);
    }
    .content:hover {
      transform: scale(1.03);
      box-shadow: 0 12px 40px rgba(79, 195, 247, 0.5), 0 0 20px rgba(176, 196, 222, 0.3);
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 20px;
      color: #0277bd;
      text-shadow: 0 0 5px rgba(79, 195, 247, 0.3);
    }
    button, select {
      margin: 10px auto;
      padding: 10px 15px;
      font-size: 14px;
      border-radius: 25px;
      outline: none;
      display: block;
      width: 60%;
      max-width: 200px;
      transition: all 0.3s ease;
    }
    select {
      background-color: rgba(255, 255, 255, 0.5);
      border: 1px solid rgba(79, 195, 247, 0.5);
      color: #333333;
      text-align: center;
    }
    select:focus {
      background-color: rgba(255, 255, 255, 0.7);
      border-color: #0277bd;
      box-shadow: 0 0 10px rgba(79, 195, 247, 0.3);
    }
    button {
      background: linear-gradient(45deg, #4fc3f7, #81d4fa);
      border: none;
      color: #333333;
      cursor: pointer;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    button:hover {
      background: linear-gradient(45deg, #29b6f6, #4fc3f7);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(79, 195, 247, 0.4);
    }
    .config-button {
      background: linear-gradient(45deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.5));
      border: 1px solid rgba(79, 195, 247, 0.5);
    }
    .config-button:hover {
      background: linear-gradient(45deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.7));
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(79, 195, 247, 0.4);
    }
    a {
      color: #0277bd;
      text-decoration: none;
      font-weight: bold;
      transition: color 0.3s ease, transform 0.3s ease;
      display: block;
      margin: 15px 0;
    }
    a:hover {
      color: #01579b;
      transform: scale(1.05);
      text-shadow: 0 0 5px rgba(79, 195, 247, 0.3);
    }
    p {
      margin: 12px 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .config-section {
      margin: 20px 0;
      display: none;
      flex-direction: column;
      align-items: center;
    }
    .config-section.active {
      display: flex;
    }
    .config-section label {
      font-size: 14px;
      margin-bottom: 10px;
      color: #333333;
    }
    .checkbox-container {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      margin: 10px 0;
    }
    .checkbox-wrapper {
      position: relative;
      display: inline-block;
      width: 20px;
      height: 20px;
      margin-right: 10px;
    }
    .checkbox-wrapper input {
      opacity: 0;
      width: 100%;
      height: 100%;
      position: absolute;
      cursor: pointer;
      z-index: 2;
    }
    .checkbox-custom {
      position: absolute;
      top: 0;
      left: 0;
      width: 20px;
      height: 20px;
      background-color: rgba(255, 255, 255, 0.5);
      border: 2px solid #0277bd;
      border-radius: 4px;
      transition: all 0.3s ease;
    }
    .checkbox-wrapper input:checked + .checkbox-custom {
      background-color: #0277bd;
      border-color: #0277bd;
    }
    .checkbox-custom::after {
      content: '';
      position: absolute;
      display: none;
      left: 5px;
      top: 3px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    .checkbox-wrapper input:checked + .checkbox-custom::after {
      display: block;
    }
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      z-index: 9999;
      justify-content: center;
      align-items: center;
      overflow-y: auto;
    }
    .modal-content {
      background-color: rgba(255, 255, 255, 0.9);
      padding: 20px;
      border-radius: 15px;
      max-width: 80%;
      max-height: 80vh;
      overflow-y: auto;
      text-align: center;
      box-shadow: 0 8px 32px rgba(79, 195, 247, 0.3);
    }
    .modal-content input, .modal-content select, .modal-content textarea {
      width: 90%;
      margin: 10px auto;
      padding: 10px;
      border-radius: 25px;
      border: 1px solid rgba(79, 195, 247, 0.5);
      background-color: rgba(255, 255, 255, 0.5);
      text-align: center;
    }
    .modal-content p {
      font-size: 12px;
      color: #666;
      display: block;
    }
    .modal-content button {
      width: 45%;
      margin: 5px;
    }
    .modal-content .config-button {
      background: linear-gradient(45deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.5));
      border: 1px solid rgba(79, 195, 247, 0.5);
    }
    .modal-content .config-button:hover {
      background: linear-gradient(45deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.7));
    }
    .dark-mode {
      background-color: #1a1a1a;
      color: #ffffff;
    }
    .dark-mode .content, .dark-mode .modal-content {
      background-color: rgba(40, 40, 40, 0.9);
      color: #ffffff;
    }
    .dark-mode button {
      background: linear-gradient(45deg, #0288d1, #4fc3f7);
      color: #ffffff;
    }
    .dark-mode select, .dark-mode input, .dark-mode textarea {
      background-color: rgba(60, 60, 60, 0.5);
      color: #ffffff;
      border-color: #0288d1;
    }
    @media (max-width: 768px) {
      .content {
        max-width: 90%;
        padding: 20px;
      }
      h1 {
        font-size: 1.8rem;
      }
      button, select, input, textarea {
        width: 90%;
        font-size: 12px;
        padding: 8px;
      }
      .modal-content {
        width: 90%;
      }
    }
  </style>
</head>
<body>
  <div class="content">
    <h1>Website Online Proxy</h1>
    <p>请输入学术网站地址进行访问（如：baike.baidu.com）</p>
    <button onclick="showUrlModal()">访问网站</button>
    <button onclick="toggleAdvancedOptions()">高级选项</button>
    <div class="config-section" id="advancedOptions">
      <label>选择语言</label>
      <select id="languageSelect">
        ${supportedLanguages.map(lang => `<option value="${lang.code}" ${lang.code === 'zh-CN' ? 'selected' : ''}>${lang.name}</option>`).join('')}
      </select>
      <label>模拟设备</label>
      <select id="deviceSelect">
        <option value="none" selected>不模拟</option>
        <option value="desktop">电脑</option>
        <option value="mobile">手机</option>
      </select>
      <div class="checkbox-container">
        <div class="checkbox-wrapper">
          <input type="checkbox" id="blockAds">
          <span class="checkbox-custom"></span>
        </div>
        <label for="blockAds">拦截广告</label>
      </div>
      <div class="checkbox-container">
        <div class="checkbox-wrapper">
          <input type="checkbox" id="darkMode">
          <span class="checkbox-custom"></span>
        </div>
        <label for="darkMode">启用暗黑模式</label>
      </div>
      <button class="config-button" onclick="showBlockExtensionsModal()">配置拦截器</button>
      <button class="config-button" onclick="showBlockElementsModal()">屏蔽元素</button>
      <button class="config-button" onclick="showCustomHeadersModal()">自定义头</button>
    </div>
    <p>声明：本工具仅用于学术研究和文献查阅，请严格遵守相关法律法规。</p>
    <p>By Sak 2025</p>
    <p>项目开源地址：<a href="https://github.com/1234567Yang/cf-proxy-ex/">https://github.com/1234567Yang/cf-proxy-ex/</a></p>
  </div>
  <div id="urlModal" class="modal">
    <div class="modal-content">
      <h3>输入目标网址</h3>
      <input type="text" id="targetUrl" placeholder="请输入目标地址（例如：baike.baidu.com）">
      <button onclick="redirectTo()">跳转</button>
      <button class="config-button" onclick="closeUrlModal()">取消</button>
    </div>
  </div>
  <div id="blockExtensionsModal" class="modal">
    <div class="modal-content">
      <h3>配置拦截器</h3>
      <input type="text" id="blockExtensionsInput" placeholder="请输入需要拦截的文件扩展名（例如：jpg, gif）">
      <button onclick="saveBlockExtensions()">保存</button>
      <button class="config-button" onclick="closeBlockExtensionsModal()">取消</button>
    </div>
  </div>
  <div id="blockElementsModal" class="modal">
    <div class="modal-content">
      <h3>屏蔽元素</h3>
      <input type="text" id="blockElementsInput" placeholder="请输入需要屏蔽的 CSS 选择器（例如：.ad, #banner）">
      <label>注入范围</label>
      <select id="blockElementsScope">
        <option value="global">全局</option>
        <option value="specific">指定链接</option>
      </select>
      <input type="text" id="blockElementsScopeUrl" placeholder="请输入目标域名（如 http://example.com）" style="display: none;">
      <button onclick="saveBlockElements()">保存</button>
      <button class="config-button" onclick="closeBlockElementsModal()">取消</button>
    </div>
  </div>
  <div id="customHeadersModal" class="modal">
    <div class="modal-content">
      <h3>自定义 HTTP 头</h3>
      <textarea id="customHeadersInput" placeholder="X-Custom-Header: Value\nAnother-Header: AnotherValue" rows="4"></textarea>
      <button onclick="saveCustomHeaders()">保存</button>
      <button class="config-button" onclick="closeCustomHeadersModal()">取消</button>
    </div>
  </div>
  <div id="proxyHintModal" class="modal">
    <div class="modal-content">
      <h3>⚠️ 代理使用协议</h3>
      <p>警告：您即将使用网络代理。为确保安全，请勿通过代理登录任何网站。详情请参阅 <a href="https://github.com/1234567Yang/cf-proxy-ex/">使用条款</a>。</p>
      <div class="checkbox-container">
        <div class="checkbox-wrapper">
          <input type="checkbox" id="agreeCheckbox">
          <span class="checkbox-custom"></span>
        </div>
        <label for="agreeCheckbox">我已阅读并同意遵守代理服务的使用规则，理解使用代理可能存在的风险，并自行承担因此产生的一切后果。</label>
      </div>
      <button id="confirmButton" disabled>同意</button>
      <button class="config-button" onclick="closeProxyHintModal()">取消</button>
    </div>
  </div>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const content = document.querySelector('.content');
      setTimeout(() => content.classList.add('loaded'), 100);
      const loadCookies = () => {
        const cookies = document.cookie.split('; ').reduce((acc, row) => {
          const [key, value] = row.split('=');
          acc[key] = value;
          return acc;
        }, {});
        if (cookies['${languageCookieName}']) document.getElementById('languageSelect').value = cookies['${languageCookieName}'];
        if (cookies['${deviceCookieName}']) document.getElementById('deviceSelect').value = cookies['${deviceCookieName}'];
        document.getElementById('blockAds').checked = cookies['${blockAdsCookieName}'] === 'true';
        document.getElementById('darkMode').checked = cookies['darkMode'] === 'true';
        if (cookies['darkMode'] === 'true') document.body.classList.add('dark-mode');
        if (cookies['${blockExtensionsCookieName}']) document.getElementById('blockExtensionsInput').value = cookies['${blockExtensionsCookieName}'];
        if (cookies['${blockElementsCookieName}']) document.getElementById('blockElementsInput').value = cookies['${blockElementsCookieName}'];
        if (cookies['${blockElementsScopeCookieName}']) {
          document.getElementById('blockElementsScope').value = cookies['${blockElementsScopeCookieName}'];
          document.getElementById('blockElementsScopeUrl').style.display = cookies['${blockElementsScopeCookieName}'] === 'specific' ? 'block' : 'none';
          if (cookies['${blockElementsScopeCookieName}'] === 'specific' && cookies['${blockElementsScopeCookieName}_URL']) {
            document.getElementById('blockElementsScopeUrl').value = cookies['${blockElementsScopeCookieName}_URL'];
          }
        }
        if (cookies['${customHeadersCookieName}']) document.getElementById('customHeadersInput').value = cookies['${customHeadersCookieName}'];
      };
      loadCookies();
      document.getElementById('blockElementsScope').addEventListener('change', function() {
        document.getElementById('blockElementsScopeUrl').style.display = this.value === 'specific' ? 'block' : 'none';
      });
      document.getElementById('darkMode').addEventListener('change', function() {
        document.body.classList.toggle('dark-mode', this.checked);
        setCookie('darkMode', this.checked);
      });
      const setCookie = (name, value) => {
        const cookieDomain = window.location.hostname;
        const oneWeekLater = new Date();
        oneWeekLater.setTime(oneWeekLater.getTime() + (7 * 24 * 60 * 60 * 1000));
        document.cookie = \`\${name}=\${value}; expires=\${oneWeekLater.toUTCString()}; path=/; domain=\${cookieDomain}\`;
      };
      document.getElementById('languageSelect').addEventListener('change', function() { setCookie('${languageCookieName}', this.value); });
      document.getElementById('deviceSelect').addEventListener('change', function() { setCookie('${deviceCookieName}', this.value); });
      document.getElementById('blockAds').addEventListener('change', function() { setCookie('${blockAdsCookieName}', this.checked); });
      const checkbox = document.getElementById('agreeCheckbox');
      const button = document.getElementById('confirmButton');
      if (checkbox && button) {
        checkbox.addEventListener('change', () => {
          button.disabled = !checkbox.checked;
        });
        button.addEventListener('click', () => {
          if (!button.disabled) {
            const cookieDomain = window.location.hostname;
            document.cookie = "${proxyHintCookieName}=agreed; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/; domain=" + cookieDomain;
            window.location.reload();
          }
        });
      }
    });
    function toggleAdvancedOptions() {
      const advancedOptions = document.getElementById('advancedOptions');
      const button = document.querySelector('button[onclick="toggleAdvancedOptions()"]');
      advancedOptions.classList.toggle('active');
      button.textContent = advancedOptions.classList.contains('active') ? '隐藏高级功能' : '高级选项';
    }
    function showUrlModal() { document.getElementById('urlModal').style.display = 'flex'; }
    function closeUrlModal() { document.getElementById('urlModal').style.display = 'none'; }
    function showBlockExtensionsModal() { document.getElementById('blockExtensionsModal').style.display = 'flex'; }
    function closeBlockExtensionsModal() { document.getElementById('blockExtensionsModal').style.display = 'none'; }
    function showBlockElementsModal() { document.getElementById('blockElementsModal').style.display = 'flex'; }
    function closeBlockElementsModal() { document.getElementById('blockElementsModal').style.display = 'none'; }
    function showCustomHeadersModal() { document.getElementById('customHeadersModal').style.display = 'flex'; }
    function closeCustomHeadersModal() { document.getElementById('customHeadersModal').style.display = 'none'; }
    function closeProxyHintModal() { document.getElementById('proxyHintModal').style.display = 'none'; }
    function redirectTo() {
      const targetUrl = document.getElementById('targetUrl').value.trim();
      const currentOrigin = window.location.origin;
      if (targetUrl) {
        let finalUrl = currentOrigin + '/' + (targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl);
        window.location.href = finalUrl;
      }
      closeUrlModal();
    }
    function saveBlockExtensions() {
      const extensions = document.getElementById('blockExtensionsInput').value.trim();
      const cookieDomain = window.location.hostname;
      const oneWeekLater = new Date();
      oneWeekLater.setTime(oneWeekLater.getTime() + (7 * 24 * 60 * 60 * 1000));
      document.cookie = "${blockExtensionsCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + cookieDomain;
      document.cookie = "${blockExtensionsCookieName}=" + extensions + "; expires=" + oneWeekLater.toUTCString() + "; path=/; domain=" + cookieDomain;
      closeBlockExtensionsModal();
    }
    function saveBlockElements() {
      const elements = document.getElementById('blockElementsInput').value.trim();
      const scope = document.getElementById('blockElementsScope').value;
      const scopeUrl = document.getElementById('blockElementsScopeUrl').value.trim();
      const cookieDomain = window.location.hostname;
      const oneWeekLater = new Date();
      oneWeekLater.setTime(oneWeekLater.getTime() + (7 * 24 * 60 * 60 * 1000));
      document.cookie = "${blockElementsCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + cookieDomain;
      document.cookie = "${blockElementsCookieName}=" + elements + "; expires=" + oneWeekLater.toUTCString() + "; path=/; domain=" + cookieDomain;
      document.cookie = "${blockElementsScopeCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + cookieDomain;
      document.cookie = "${blockElementsScopeCookieName}=" + scope + "; expires=" + oneWeekLater.toUTCString() + "; path=/; domain=" + cookieDomain;
      document.cookie = "${blockElementsScopeCookieName}_URL=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + cookieDomain;
      if (scope === 'specific' && scopeUrl) {
        document.cookie = "${blockElementsScopeCookieName}_URL=" + scopeUrl + "; expires=" + oneWeekLater.toUTCString() + "; path=/; domain=" + cookieDomain;
      }
      closeBlockElementsModal();
    }
    function saveCustomHeaders() {
      const headers = document.getElementById('customHeadersInput').value.trim();
      const cookieDomain = window.location.hostname;
      const oneWeekLater = new Date();
      oneWeekLater.setTime(oneWeekLater.getTime() + (7 * 24 * 60 * 60 * 1000));
      document.cookie = "${customHeadersCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + cookieDomain;
      document.cookie = "${customHeadersCookieName}=" + encodeURIComponent(headers) + "; expires=" + oneWeekLater.toUTCString() + "; path=/; domain=" + cookieDomain;
      closeCustomHeadersModal();
    }
  </script>
</body>
</html>
`;

// Password Page
const pwdPage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>请输入密码</title>
  <style>
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1e3c72, #2a5298);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .container {
      background: rgba(255, 255, 255, 0.95);
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      text-align: center;
      color: #333;
    }
    input {
      padding: 0.8rem;
      margin-bottom: 1rem;
      border: 1px solid #2a5298;
      border-radius: 25px;
      width: 200px;
      font-size: 1rem;
    }
    button {
      background: linear-gradient(90deg, #2a5298, #1e3c72);
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      font-size: 1rem;
    }
    button:hover {
      background: linear-gradient(90deg, #1e3c72, #2a5298);
      transform: translateY(-2px);
    }
  </style>
  <script>
    function setPassword() {
      try {
        const cookieDomain = window.location.hostname;
        const password = document.getElementById('password').value;
        const oneWeekLater = new Date();
        oneWeekLater.setTime(oneWeekLater.getTime() + (7 * 24 * 60 * 60 * 1000));
        document.cookie = "${passwordCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + cookieDomain;
        document.cookie = "${passwordCookieName}=" + password + "; expires=" + oneWeekLater.toUTCString() + "; path=/; domain=" + cookieDomain;
        location.reload();
      } catch (e) {
        alert('设置密码失败: ' + e.message);
      }
    }
  </script>
</head>
<body>
  <div class="container">
    <input id="password" type="password" placeholder="请输入密码">
    <button onclick="setPassword()">提交</button>
  </div>
</body>
</html>
`;

// Redirect Error Page
const redirectError = `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head><body><h2>重定向错误：目标网站可能包含错误的跳转信息，无法解析</h2></body></html>
`;

// Main Request Handler
async function handleRequest(request) {
  try {
    const url = new URL(request.url);
    const cache = caches.default;
    const contentType = request.headers.get('Content-Type') || '';
    const isStatic = contentType.includes('image/') || contentType.includes('text/css') || contentType.includes('application/javascript');

    // Check Cache
    if (isStatic) {
      const cacheKey = new Request(url.toString(), { method: 'GET' });
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) return cachedResponse;
    }

    // Prevent Crawlers
    const userAgent = request.headers.get('User-Agent') || '';
    if (userAgent.includes("Bytespider")) {
      return getHTMLResponse("爬虫被禁止使用代理。");
    }

    // Check Proxy Hint Cookie
    const siteCookie = request.headers.get('Cookie') || '';
    if (!siteCookie.includes(`${proxyHintCookieName}=agreed`)) {
      return getHTMLResponse(mainPage.replace('<div id="proxyHintModal" class="modal">', '<div id="proxyHintModal" class="modal" style="display: flex;">'));
    }

    // Check Password
    if (password) {
      const pwd = getCook(siteCookie, passwordCookieName);
      if (!pwd || pwd !== password) return handleWrongPwd();
    }

    // Handle Favicon and Robots.txt
    if (url.pathname.endsWith("favicon.ico")) return getRedirect("https://www.baidu.com/favicon.ico");
    if (url.pathname.endsWith("robots.txt")) {
      return new Response(`User-Agent: *\nDisallow: /`, { headers: { "Content-Type": "text/plain" } });
    }

    // Show Main Page
    const actualUrlStr = url.pathname.substring(url.pathname.indexOf(str) + str.length) + url.search + url.hash;
    if (!actualUrlStr) return getHTMLResponse(mainPage);

    // Check File Extension Blocking
    const blockExtensions = getCook(siteCookie, blockExtensionsCookieName) || "";
    const blockAds = getCook(siteCookie, blockAdsCookieName) === "true";
    const extensions = blockExtensions.split(',').map(ext => ext.trim().toLowerCase()).filter(ext => ext);
    if (extensions.length > 0) {
      const fileExt = actualUrlStr.split('.').pop().toLowerCase();
      if (extensions.includes(fileExt)) return new Response(null, { status: 204 });
    }

    // Check Ad Blocking
    if (blockAds) {
      const urlLower = actualUrlStr.toLowerCase();
      if (adBlockKeywords.some(keyword => urlLower.includes(keyword))) return new Response(null, { status: 204 });
    }

    // Validate Target URL
    let test = actualUrlStr;
    if (!test.startsWith("http")) test = "https://" + test;
    try {
      const u = new URL(test);
      if (!u.host.includes(".")) throw new Error();
    } catch {
      const lastVisit = getCook(siteCookie, lastVisitProxyCookie);
      if (lastVisit) return getRedirect(thisProxyServerUrlHttps + lastVisit + "/" + actualUrlStr);
      return getHTMLResponse("无效的 URL 或无法获取上次访问的站点。");
    }

    // Handle URLs without Protocol
    if (!actualUrlStr.startsWith("http") && !actualUrlStr.includes("://")) {
      return getRedirect(thisProxyServerUrlHttps + "https://" + actualUrlStr);
    }

    const actualUrl = new URL(actualUrlStr);

    // Check Host Case
    if (actualUrlStr !== actualUrl.href) return getRedirect(thisProxyServerUrlHttps + actualUrl.href);

    // Get Language and Device Settings
    let selectedLanguage = getCook(siteCookie, languageCookieName) || url.searchParams.get('lang') || 'zh-CN';
    if (!supportedLanguages.some(lang => lang.code === selectedLanguage)) selectedLanguage = 'zh-CN';
    const deviceType = getCook(siteCookie, deviceCookieName) || 'none';

    // Handle WebSocket
    if (request.headers.get('Upgrade') === 'websocket') {
      const wsRequest = new Request(actualUrl, {
        headers: request.headers,
        method: request.method
      });
      return fetch(wsRequest);
    }

    // Modify Request Headers
    const clientHeaderWithChange = new Headers();
    for (const [key, value] of request.headers.entries()) {
      let newValue = value.replace(thisProxyServerUrlHttps, actualUrlStr).replace(thisProxyServerUrl_hostOnly, actualUrl.host);
      if (key.toLowerCase() === 'origin') newValue = actualUrl.origin;
      if (key.toLowerCase() === 'referer') newValue = newValue.replace(thisProxyServerUrlHttps, actualUrl.origin + '/');
      if (key.toLowerCase() === 'accept-language') newValue = selectedLanguage;
      if (key.toLowerCase() === 'user-agent' && deviceType !== 'none') newValue = deviceUserAgents[deviceType];
      clientHeaderWithChange.set(key, newValue);
    }
    if (!clientHeaderWithChange.has('Origin')) clientHeaderWithChange.set('Origin', actualUrl.origin);
    if (!clientHeaderWithChange.has('Accept-Language')) clientHeaderWithChange.set('Accept-Language', selectedLanguage);

    // Add Custom Headers
    const customHeaders = getCook(siteCookie, customHeadersCookieName) || '';
    if (customHeaders) {
      customHeaders.split('\n').forEach(header => {
        const [key, value] = header.split(':').map(s => s.trim());
        if (key && value) clientHeaderWithChange.set(key, value);
      });
    }

    // Modify Request Body
    let clientRequestBodyWithChange;
    if (request.body) {
      clientRequestBodyWithChange = await request.text();
      clientRequestBodyWithChange = clientRequestBodyWithChange
        .replace(thisProxyServerUrlHttps, actualUrlStr)
        .replace(thisProxyServerUrl_hostOnly, actualUrl.host);
    }

    // Create Modified Request
    const modifiedRequest = new Request(actualUrl, {
      headers: clientHeaderWithChange,
      method: request.method,
      body: request.body ? clientRequestBodyWithChange : request.body,
      redirect: "manual"
    });

    // Send Request
    const response = await fetch(modifiedRequest);
    if (response.status.toString().startsWith("3") && response.headers.get("Location")) {
      try {
        const redirectUrl = new URL(response.headers.get("Location"), actualUrlStr).href;
        if (redirectUrl === 'about:blank') throw new Error('Invalid redirect to about:blank');
        return getRedirect(thisProxyServerUrlHttps + redirectUrl);
      } catch {
        return getHTMLResponse(redirectError + "<br>Redirect URL: " + response.headers.get("Location"));
      }
    }

    // Process Response
    let modifiedResponse;
    let bd;
    const responseContentType = response.headers.get("Content-Type") || '';
    const hasProxyHintCook = getCook(siteCookie, proxyHintCookieName) === "agreed";
    if (response.body) {
      if (responseContentType.startsWith("text/")) {
        bd = await response.text();
        let regex = new RegExp(`(?<!src="|href=")(https?:\\/\\/[^\\s'"]+)`, 'g');
        bd = bd.replace(regex, match => match.includes("http") ? thisProxyServerUrlHttps + match : thisProxyServerUrl_hostOnly + "/" + match);
        if (responseContentType.includes("html") || responseContentType.includes("javascript")) {
          bd = bd.replace(/window\.location/g, "window." + replaceUrlObj);
          bd = bd.replace(/document\.location/g, "document." + replaceUrlObj);
        }
        if (responseContentType.includes("text/html") && bd.includes("<html")) {
          bd = covToAbs(bd, actualUrlStr);
          bd = removeIntegrityAttributes(bd);
          const hasBom = bd.charCodeAt(0) === 0xFEFF;
          if (hasBom) bd = bd.substring(1);
          const inject = `
          <!DOCTYPE html>
          <script id="${injectedJsId}">
          ${hasProxyHintCook ? "" : proxyHintInjection}
          ${httpRequestInjection}
          setTimeout(() => { document.getElementById("${injectedJsId}").remove(); }, 1);
          </script>
          `;
          bd = (hasBom ? "\uFEFF" : "") + inject + bd;
        }
        modifiedResponse = new Response(bd, response);
      } else {
        modifiedResponse = new Response(response.body, response);
      }
    } else {
      modifiedResponse = new Response(response.body, response);
    }

    // Cache Static Content
    if (isStatic && response.status === 200) {
      const cacheKey = new Request(url.toString(), { method: 'GET' });
      const cacheResponse = new Response(modifiedResponse.body, {
        status: modifiedResponse.status,
        headers: {
          ...modifiedResponse.headers,
          'Cache-Control': 'public, max-age=86400'
        }
      });
      await cache.put(cacheKey, cacheResponse.clone());
    }

    // Process Response Headers
    const headers = modifiedResponse.headers;
    const cookieHeaders = [];
    for (const [key, value] of headers.entries()) {
      if (key.toLowerCase() === 'set-cookie') cookieHeaders.push({ headerName: key, headerValue: value });
    }
    if (cookieHeaders.length > 0) {
      cookieHeaders.forEach(cookieHeader => {
        let cookies = cookieHeader.headerValue.split(',').map(cookie => cookie.trim());
        for (let i = 0; i < cookies.length; i++) {
          let parts = cookies[i].split(';').map(part => part.trim());
          const pathIndex = parts.findIndex(part => part.toLowerCase().startsWith('path='));
          let originalPath;
          if (pathIndex !== -1) originalPath = parts[pathIndex].substring("path=".length);
          const absolutePath = "/" + new URL(originalPath || '/', actualUrlStr).href;
          if (pathIndex !== -1) parts[pathIndex] = `Path=${absolutePath}`;
          else parts.push(`Path=${absolutePath}`);
          const domainIndex = parts.findIndex(part => part.toLowerCase().startsWith('domain='));
          if (domainIndex !== -1) parts[domainIndex] = `domain=${thisProxyServerUrl_hostOnly}`;
          else parts.push(`domain=${thisProxyServerUrl_hostOnly}`);
          cookies[i] = parts.join('; ');
        }
        headers.set(cookieHeader.headerName, cookies.join(', '));
      });
    }

    // Set Cookies and Headers
    if (responseContentType.includes("text/html") && response.status === 200 && bd.includes("<html")) {
      headers.append("Set-Cookie", `${lastVisitProxyCookie}=${actualUrl.origin}; Path=/; Domain=${thisProxyServerUrl_hostOnly}`);
      headers.append("Set-Cookie", `${languageCookieName}=${selectedLanguage}; Path=/; Domain=${thisProxyServerUrl_hostOnly}`);
      if (!hasProxyHintCook) {
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + 24 * 60 * 60 * 1000);
        headers.append("Set-Cookie", `${proxyHintCookieName}=agreed; expires=${expiryDate.toUTCString()}; path=/; domain=${thisProxyServerUrl_hostOnly}`);
      }
    }

    for (const [key, value] of headers.entries()) {
      if (key.toLowerCase() === 'access-control-allow-origin') headers.set(key, actualUrl.origin);
      else if (key.toLowerCase() === 'content-security-policy' || key.toLowerCase() === 'content-security-policy-report-only') {
        headers.set(key, value.replace(thisProxyServerUrl_hostOnly, actualUrl.host));
      }
    }

    modifiedResponse.headers.set('Access-Control-Allow-Origin', actualUrl.origin);
    modifiedResponse.headers.set("X-Frame-Options", "ALLOWALL");
    const listHeaderDel = ["Content-Length", "Content-Security-Policy", "Permissions-Policy", "Cross-Origin-Embedder-Policy", "Cross-Origin-Resource-Policy"];
    listHeaderDel.forEach(element => {
      modifiedResponse.headers.delete(element);
      modifiedResponse.headers.delete(element + "-Report-Only");
    });

    if (!hasProxyHintCook) {
      modifiedResponse.headers.set("Cache-Control", "max-age=0");
    }

    return modifiedResponse;
  } catch (e) {
    return getHTMLResponse(`请求处理失败: ${e.message}`);
  }
}

// Utility Functions
function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

function getCook(cookies, cookiename) {
  const cookiestring = RegExp(escapeRegExp(cookiename) + "=[^;]+").exec(cookies);
  return decodeURIComponent(cookiestring ? cookiestring.toString().replace(/^[^=]+./, "") : "");
}

const matchList = [[/href=("|')([^"']*)("|')/g, `href="`], [/src=("|')([^"']*)("|')/g, `src="`]];
function covToAbs(body, requestPathNow) {
  const original = [];
  const target = [];
  for (const match of matchList) {
    const setAttr = body.matchAll(match[0]);
    if (setAttr) {
      for (const replace of setAttr) {
        if (!replace.length) continue;
        const strReplace = replace[0];
        if (!strReplace.includes(thisProxyServerUrl_hostOnly)) {
          if (!isPosEmbed(body, replace.index)) {
            const relativePath = strReplace.substring(match[1].toString().length, strReplace.length - 1);
            if (!relativePath.startsWith("data:") && !relativePath.startsWith("mailto:") && !relativePath.startsWith("javascript:") && !relativePath.startsWith("chrome") && !relativePath.startsWith("edge")) {
              try {
                const absolutePath = thisProxyServerUrlHttps + new URL(relativePath, requestPathNow).href;
                original.push(strReplace);
                target.push(match[1].toString() + absolutePath + `"`);
              } catch {}
            }
          }
        }
      }
    }
  }
  for (let i = 0; i < original.length; i++) {
    body = body.replace(original[i], target[i]);
  }
  return body;
}

function removeIntegrityAttributes(body) {
  return body.replace(/integrity=("|')([^"']*)("|')/g, '');
}

function isPosEmbed(html, pos) {
  if (pos > html.length || pos < 0) return false;
  const start = html.lastIndexOf('<', pos);
  const end = html.indexOf('>', pos);
  const content = html.slice(start + 1, end === -1 ? html.length : end);
  return content.includes(">") || content.includes("<");
}

function handleWrongPwd() {
  return showPasswordPage ? getHTMLResponse(pwdPage) : getHTMLResponse("<h1>403 Forbidden</h1><br>您无权访问此网页。");
}

function getHTMLResponse(html) {
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function getRedirect(url) {
  return Response.redirect(url, 301);
}