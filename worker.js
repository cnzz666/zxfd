/**
 * Welcome to Cloudflare Workers!
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// 监听 fetch 事件，这是 Cloudflare Worker 的入口点
addEventListener('fetch', event => {
  try {
    const url = new URL(event.request.url);
    // 设置全局变量，方便后续使用
    thisProxyServerUrlHttps = `${url.protocol}//${url.hostname}/`;
    thisProxyServerUrl_hostOnly = url.host;
    event.respondWith(handleRequest(event.request));
  } catch (e) {
    event.respondWith(getHTMLResponse(`Error: ${e.message}`));
  }
});

// 全局常量定义
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
const cookieInjectionCookieName = "__PROXY_COOKIE_INJECTIONS__";
const password = ""; // 代理密码，留空则无需密码
const showPasswordPage = true; // 是否显示密码输入页
const replaceUrlObj = "__location_yproxy__";
const injectedJsId = "__yproxy_injected_js_id__";
let thisProxyServerUrlHttps;
let thisProxyServerUrl_hostOnly;

// 支持的语言列表
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

// 设备模拟的用户代理和布局信息
const deviceUserAgents = {
  desktop: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  mobile: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
};
const deviceLayouts = {
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 375, height: 667 }
};

// 广告拦截关键词
const adBlockKeywords = [
  "ads.", "ad.", "advert", "banner", "sponsor", "doubleclick", "googlead", "adserver", "popunder", "interstitial",
  "googlesyndication.com", "adsense.google.com", "admob.com", "adclick.g.doubleclick.net"
];

// 代理提示注入脚本：用于在首次访问时提醒用户正在使用代理
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

// 伪装注入脚本：用于模拟设备、语言等，并修正 document.domain, window.origin 等属性
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

// 元素屏蔽注入脚本：根据用户设置的CSS选择器屏蔽页面元素
const blockElementsInjection = `
(function() {
  const blockElements = document.cookie.split('; ').find(row => row.startsWith('${blockElementsCookieName}='));
  const blockElementsScope = document.cookie.split('; ').find(row => row.startsWith('${blockElementsScopeCookieName}='));
  const selectors = blockElements ? decodeURIComponent(blockElements.split('=')[1]).split(',').map(s => s.trim()).filter(s => s) : [];
  const scopeCookie = document.cookie.split('; ').find(row => row.startsWith('${blockElementsScopeCookieName}='));
  const scope = scopeCookie ? scopeCookie.split('=')[1] : 'global';
  const currentUrl = window.location.href;
  const scopeUrlCookie = document.cookie.split('; ').find(row => row.startsWith('${blockElementsScopeCookieName}_URL='));
  const scopeUrl = scopeUrlCookie ? decodeURIComponent(scopeUrlCookie.split('=')[1]) : '';

  const shouldBlock = () => {
    if (scope === 'global') return true;
    if (scope === 'specific' && scopeUrl && currentUrl.includes(scopeUrl)) return true;
    return false;
  };

  if (selectors.length > 0 && shouldBlock()) {
    const removeElements = () => {
        selectors.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(el => el.remove());
            } catch (e) { console.error('Error removing element with selector:', selector, e); }
        });
    };

    // Initial removal
    if (document.body) {
        removeElements();
    } else {
        document.addEventListener('DOMContentLoaded', removeElements);
    }
    
    // Observe DOM changes to remove dynamically added elements
    const observer = new MutationObserver(removeElements);
    const observeBody = () => {
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        } else {
            setTimeout(observeBody, 100);
        }
    };
    observeBody();
  }
})();
`;


// HTTP请求注入脚本：劫持页面中的 XMLHttpRequest 和 fetch 等请求，将其重写以通过代理
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
      if(relativePath.startsWith("data:") || relativePath.startsWith("mailto:") || relativePath.startsWith("javascript:") || relativePath.startsWith("chrome") || relativePath.startsWith("edge") || relativePath.startsWith("blob:")) return relativePath; 
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
    set protocol(value) { original_website_url.protocol = value; window.location.href = proxy_host_with_schema + original_website_url.href; }
    get host() { return original_website_url.host; }
    set host(value) { original_website_url.host = value; window.location.href = proxy_host_with_schema + original_website_url.href; }
    get hostname() { return original_website_url.hostname; }
    set hostname(value) { original_website_url.hostname = value; window.location.href = proxy_host_with_schema + original_website_url.href; }
    get port() { return original_website_url.port; }
    set port(value) { original_website_url.port = value; window.location.href = proxy_host_with_schema + original_website_url.href; }
    get pathname() { return original_website_url.pathname; }
    set pathname(value) { original_website_url.pathname = value; window.location.href = proxy_host_with_schema + original_website_url.href; }
    get search() { return original_website_url.search; }
    set search(value) { original_website_url.search = value; window.location.href = proxy_host_with_schema + original_website_url.href; }
    get hash() { return original_website_url.hash; }
    set hash(value) { original_website_url.hash = value; window.location.href = proxy_host_with_schema + original_website_url.href; }
  }
  
  function documentLocationInject() {
    window.document.__defineGetter__("location", function() {
      return new ProxyLocation(window.location);
    });
  }
  
  function historyInject() {
    const originalPushState = History.prototype.pushState;
    const originalReplaceState = History.prototype.replaceState;
    History.prototype.pushState = function (state, title, url) {
      if (!url) return; 
      if(url.startsWith("/" + original_website_url.href)) url = url.substring(("/" + original_website_url.href).length);
      if(url.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1))) url = url.substring(("/" + original_website_url.href).length - 1);
      if(url.startsWith("/" + original_website_url.href.replace("://", ":/"))) url = url.substring(("/" + original_website_url.href.replace("://", ":/")).length);
      if(url.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1).replace("://", ":/"))) url = url.substring(("/" + original_website_url.href).replace("://", ":/").length - 1);
      var u = changeURL(url);
      return originalPushState.apply(this, [state, title, u]);
    };
    History.prototype.replaceState = function (state, title, url) {
      if(!url) return;
      if(url.startsWith("/" + original_website_url.href)) url = url.substring(("/" + original_website_url.href).length);
      if(url.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1))) url = url.substring(("/" + original_website_url.href).length - 1);
      if(url.startsWith("/" + original_website_url.href.replace("://", ":/"))) url = url.substring(("/" + original_website_url.href.replace("://", ":/")).length);
      if(url.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1).replace("://", ":/"))) url = url.substring(("/" + original_website_url.href).replace("://", ":/").length - 1);
      var u = changeURL(url);
      return originalReplaceState.apply(this, [state, title, u]);
    };
  }
  
  function elementObserverInject() {
    var yProxyObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        traverseAndConvert(mutation);
      });
    });
    var config = { attributes: true, childList: true, subtree: true, attributeFilter: ['href', 'src'] };
    const observeBody = () => {
        if(document.body) {
            yProxyObserver.observe(document.body, config);
        } else {
            setTimeout(observeBody, 100);
        }
    };
    observeBody();
  }
  
  function traverseAndConvert(node) {
    if (node instanceof HTMLElement) {
      removeIntegrityAttributesFromElement(node);
      covToAbs(node);
      node.querySelectorAll('*').forEach(function(child) {
        removeIntegrityAttributesFromElement(child);
        covToAbs(child);
      });
    }
  }
  
  function covToAbs(element) {
    var relativePath = "";
    var setAttr = "";
    if (element instanceof HTMLElement && element.hasAttribute("href")) {
      relativePath = element.getAttribute("href");
      setAttr = "href";
    }
    if (element instanceof HTMLElement && element.hasAttribute("src")) {
      relativePath = element.getAttribute("src");
      setAttr = "src";
    }
    if (setAttr !== "" && relativePath.indexOf(proxy_host_with_schema) != 0) {
      if (!relativePath.includes("*")) {
        try {
          var absolutePath = changeURL(relativePath);
          element.setAttribute(setAttr, absolutePath);
        } catch (e) {}
      }
    }
  }
  
  function removeIntegrityAttributesFromElement(element){
    if (element.hasAttribute('integrity')) {
      element.removeAttribute('integrity');
    }
  }
  
  networkInject();
  windowOpenInject();
  appendChildInject();
  elementPropertyInject();
  documentLocationInject();
  historyInject();
  elementObserverInject();
})();
`;

// 主页面HTML (根据您的要求，直接使用您提供的版本)
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
      <button class="config-button" onclick="showBlockExtensionsModal()">配置拦截器</button>
      <button class="config-button" onclick="showBlockElementsModal()">屏蔽元素</button>
      <button class="config-button" onclick="showCustomHeadersModal()">自定义头</button>
      <button class="config-button" onclick="showCookieInjectionModal()">Cookie注入</button>
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
      <input type="text" id="blockElementsScopeUrl" placeholder="请输入目标域名（如 example.com）" style="display: none;">
      <button onclick="saveBlockElements()">保存</button>
      <button class="config-button" onclick="closeBlockElementsModal()">取消</button>
    </div>
  </div>
  <div id="customHeadersModal" class="modal">
    <div class="modal-content">
      <h3>自定义 HTTP 头</h3>
      <textarea id="customHeadersInput" placeholder="X-Custom-Header: Value\\nAnother-Header: AnotherValue" rows="4"></textarea>
      <button onclick="saveCustomHeaders()">保存</button>
      <button class="config-button" onclick="closeCustomHeadersModal()">取消</button>
    </div>
  </div>
  <div id="cookieInjectionModal" class="modal">
    <div class="modal-content">
      <h3>Cookie注入设置</h3>
      <div id="cookieInjectionList"></div>
      <button onclick="addCookieInjection()">添加新规则</button>
      <button class="config-button" onclick="closeCookieInjectionModal()">完成</button>
    </div>
  </div>
  <div id="cookieInjectionEditModal" class="modal">
    <div class="modal-content">
      <h3>编辑Cookie注入规则</h3>
      <input type="text" id="cookieInjectionUrl" placeholder="目标网站（如：example.com，留空为全局）">
      <textarea id="cookieInjectionValue" placeholder="Cookie内容（如：key=value; key2=value2）" rows="4"></textarea>
      <button onclick="saveCookieInjection()">保存</button>
      <button class="config-button" onclick="closeCookieInjectionEditModal()">取消</button>
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
          acc[key.trim()] = value;
          return acc;
        }, {});
        
        const getCookieValue = (name) => cookies[name] ? decodeURIComponent(cookies[name]) : '';

        document.getElementById('languageSelect').value = getCookieValue('${languageCookieName}') || 'zh-CN';
        document.getElementById('deviceSelect').value = getCookieValue('${deviceCookieName}') || 'none';
        document.getElementById('blockAds').checked = getCookieValue('${blockAdsCookieName}') === 'true';
        document.getElementById('blockExtensionsInput').value = getCookieValue('${blockExtensionsCookieName}');
        document.getElementById('blockElementsInput').value = getCookieValue('${blockElementsCookieName}');
        
        const scope = getCookieValue('${blockElementsScopeCookieName}');
        if (scope) {
            document.getElementById('blockElementsScope').value = scope;
            const scopeUrlInput = document.getElementById('blockElementsScopeUrl');
            if (scope === 'specific') {
                scopeUrlInput.style.display = 'block';
                scopeUrlInput.value = getCookieValue('${blockElementsScopeCookieName}_URL');
            } else {
                scopeUrlInput.style.display = 'none';
            }
        }
        
        document.getElementById('customHeadersInput').value = getCookieValue('${customHeadersCookieName}');
        const cookieInjections = getCookieValue('${cookieInjectionCookieName}');
        if (cookieInjections) loadCookieInjections(cookieInjections);
      };
      
      const loadCookieInjections = (cookieData) => {
        try {
          const injections = JSON.parse(cookieData);
          const listContainer = document.getElementById('cookieInjectionList');
          listContainer.innerHTML = '';
          
          injections.forEach((injection, index) => {
            const injectionItem = document.createElement('div');
            injectionItem.className = 'cookie-injection-item';
            injectionItem.innerHTML = \`
              <p><strong>\${injection.url || '全局'}</strong>: \${injection.cookies.substring(0, 50)}\${injection.cookies.length > 50 ? '...' : ''}</p>
              <button onclick="editCookieInjection(\${index})">编辑</button>
              <button onclick="deleteCookieInjection(\${index})">删除</button>
            \`;
            listContainer.appendChild(injectionItem);
          });
        } catch (e) { console.error('Failed to load cookie injections:', e); }
      };
      
      window.editCookieInjection = (index) => {
        const cookieData = document.cookie.split('; ').find(row => row.startsWith('${cookieInjectionCookieName}='));
        if (cookieData) {
          try {
            const injections = JSON.parse(decodeURIComponent(cookieData.split('=')[1]));
            if (injections[index]) {
              document.getElementById('cookieInjectionUrl').value = injections[index].url || '';
              document.getElementById('cookieInjectionValue').value = injections[index].cookies;
              window.currentCookieInjectionIndex = index;
              document.getElementById('cookieInjectionEditModal').style.display = 'flex';
            }
          } catch (e) { console.error('Error editing cookie injection:', e); }
        }
      };
      
      window.deleteCookieInjection = (index) => {
        const cookieData = document.cookie.split('; ').find(row => row.startsWith('${cookieInjectionCookieName}='));
        if (cookieData) {
          try {
            let injections = JSON.parse(decodeURIComponent(cookieData.split('=')[1]));
            injections.splice(index, 1);
            saveCookieInjections(injections);
            loadCookieInjections(JSON.stringify(injections));
          } catch (e) { console.error('Error deleting cookie injection:', e); }
        }
      };
      
      window.saveCookieInjections = (injections) => {
        setCookie('${cookieInjectionCookieName}', JSON.stringify(injections));
      };
      
      loadCookies();

      document.getElementById('blockElementsScope').addEventListener('change', function() {
        document.getElementById('blockElementsScopeUrl').style.display = this.value === 'specific' ? 'block' : 'none';
      });
      
      const setCookie = (name, value, days = 7) => {
        const cookieDomain = window.location.hostname;
        const d = new Date();
        d.setTime(d.getTime() + (days*24*60*60*1000));
        const expires = "expires="+ d.toUTCString();
        document.cookie = \`\${name}=\${encodeURIComponent(value)};\${expires};path=/;domain=\${cookieDomain};Secure;SameSite=Lax\`;
      };

      const setRawCookie = (name, value, days = 7) => {
        const cookieDomain = window.location.hostname;
        const d = new Date();
        d.setTime(d.getTime() + (days*24*60*60*1000));
        const expires = "expires="+ d.toUTCString();
        document.cookie = \`\${name}=\${value};\${expires};path=/;domain=\${cookieDomain};Secure;SameSite=Lax\`;
      };
      
      document.getElementById('languageSelect').addEventListener('change', function() { setRawCookie('${languageCookieName}', this.value); });
      document.getElementById('deviceSelect').addEventListener('change', function() { setRawCookie('${deviceCookieName}', this.value); });
      document.getElementById('blockAds').addEventListener('change', function() { setRawCookie('${blockAdsCookieName}', this.checked); });
      
      const checkbox = document.getElementById('agreeCheckbox');
      const button = document.getElementById('confirmButton');
      if (checkbox && button) {
        checkbox.addEventListener('change', () => { button.disabled = !checkbox.checked; });
        button.addEventListener('click', () => {
          if (!button.disabled) {
            setRawCookie("${proxyHintCookieName}", "agreed", 365);
            window.location.reload();
          }
        });
      }
    });
    
    function toggleAdvancedOptions() {
      const advancedOptions = document.getElementById('advancedOptions');
      const button = document.querySelector('button[onclick="toggleAdvancedOptions()"]');
      advancedOptions.classList.toggle('active');
      button.textContent = advancedOptions.classList.contains('active') ? '隐藏高级选项' : '高级选项';
    }

    function showUrlModal() { document.getElementById('urlModal').style.display = 'flex'; }
    function closeUrlModal() { document.getElementById('urlModal').style.display = 'none'; }
    function showBlockExtensionsModal() { document.getElementById('blockExtensionsModal').style.display = 'flex'; }
    function closeBlockExtensionsModal() { document.getElementById('blockExtensionsModal').style.display = 'none'; }
    function showBlockElementsModal() { document.getElementById('blockElementsModal').style.display = 'flex'; }
    function closeBlockElementsModal() { document.getElementById('blockElementsModal').style.display = 'none'; }
    function showCustomHeadersModal() { document.getElementById('customHeadersModal').style.display = 'flex'; }
    function closeCustomHeadersModal() { document.getElementById('customHeadersModal').style.display = 'none'; }
    function showCookieInjectionModal() { document.getElementById('cookieInjectionModal').style.display = 'flex'; }
    function closeCookieInjectionModal() { document.getElementById('cookieInjectionModal').style.display = 'none'; }
    function showCookieInjectionEditModal() { document.getElementById('cookieInjectionEditModal').style.display = 'flex'; }
    function closeCookieInjectionEditModal() { document.getElementById('cookieInjectionEditModal').style.display = 'none'; }
    function closeProxyHintModal() { document.getElementById('proxyHintModal').style.display = 'none'; }
    
    function redirectTo() {
      const targetUrl = document.getElementById('targetUrl').value.trim();
      if (targetUrl) {
        let finalUrl = window.location.origin + '/' + (targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl);
        window.location.href = finalUrl;
      }
      closeUrlModal();
    }

    function setCookie(name, value, days = 7) {
        const cookieDomain = window.location.hostname;
        const d = new Date();
        d.setTime(d.getTime() + (days*24*60*60*1000));
        const expires = "expires="+ d.toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;domain=${cookieDomain};Secure;SameSite=Lax`;
    }
    
    function saveBlockExtensions() {
      const extensions = document.getElementById('blockExtensionsInput').value.trim();
      setCookie("${blockExtensionsCookieName}", extensions);
      closeBlockExtensionsModal();
    }
    
    function saveBlockElements() {
      const elements = document.getElementById('blockElementsInput').value.trim();
      const scope = document.getElementById('blockElementsScope').value;
      const scopeUrl = document.getElementById('blockElementsScopeUrl').value.trim();
      
      setCookie("${blockElementsCookieName}", elements);
      setCookie("${blockElementsScopeCookieName}", scope);
      if (scope === 'specific' && scopeUrl) {
        setCookie("${blockElementsScopeCookieName}_URL", scopeUrl);
      } else {
        // Clear the specific URL cookie if scope is not 'specific'
        document.cookie = "${blockElementsScopeCookieName}_URL=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
      closeBlockElementsModal();
    }
    
    function saveCustomHeaders() {
      const headers = document.getElementById('customHeadersInput').value.trim();
      setCookie("${customHeadersCookieName}", headers);
      closeCustomHeadersModal();
    }
    
    function addCookieInjection() {
      document.getElementById('cookieInjectionUrl').value = '';
      document.getElementById('cookieInjectionValue').value = '';
      window.currentCookieInjectionIndex = -1; // -1 indicates a new rule
      showCookieInjectionEditModal();
    }
    
    function saveCookieInjection() {
      const url = document.getElementById('cookieInjectionUrl').value.trim();
      const cookies = document.getElementById('cookieInjectionValue').value.trim();
      if (!cookies) {
        alert('请填写Cookie内容');
        return;
      }
      
      const cookieData = document.cookie.split('; ').find(row => row.startsWith('${cookieInjectionCookieName}='));
      let injections = [];
      if (cookieData) {
        try { injections = JSON.parse(decodeURIComponent(cookieData.split('=')[1])); } 
        catch (e) { console.error('Error parsing cookie injections:', e); }
      }
      
      const injection = { url: url || '', cookies: cookies };
      
      if (window.currentCookieInjectionIndex >= 0 && injections[window.currentCookieInjectionIndex]) {
        injections[window.currentCookieInjectionIndex] = injection;
      } else {
        injections.push(injection);
      }
      
      setCookie('${cookieInjectionCookieName}', JSON.stringify(injections));
      loadCookieInjections(JSON.stringify(injections)); // Refresh the list in the UI
      closeCookieInjectionEditModal();
    }
  </script>
</body>
</html>
`;

// 密码页面
const pwdPage = `
<!DOCTYPE html>
<html>
<head>
    <script>
        function setPassword() {
            try {
                var cookieDomain = window.location.hostname;
                var password = document.getElementById('password').value;
                var oneWeekLater = new Date();
                oneWeekLater.setTime(oneWeekLater.getTime() + (7 * 24 * 60 * 60 * 1000));
                document.cookie = "${passwordCookieName}" + "=" + encodeURIComponent(password) + "; expires=" + oneWeekLater.toUTCString() + "; path=/; domain=" + cookieDomain + "; Secure; SameSite=Lax";
                location.reload();
            } catch(e) {
                alert(e.message);
            }
        }
    </script>
</head>
<body>
    <div>
        <input id="password" type="password" placeholder="Password" onkeydown="if(event.keyCode==13){setPassword()}">
        <button onclick="setPassword()">
            Submit
        </button>
    </div>
</body>
</html>
`;

// 核心请求处理函数
async function handleRequest(request) {
  try {
    const siteCookie = request.headers.get('Cookie') || "";
    // 密码保护
    if (password !== "") {
      const pwd = getCook(siteCookie, passwordCookieName);
      if (!pwd || pwd !== password) {
        return handleWrongPwd();
      }
    }
    
    const url = new URL(request.url);
    
    if (url.pathname === "/favicon.ico") {
      return getRedirect("https://www.baidu.com/favicon.ico");
    }
    if (url.pathname === "/robots.txt") {
      return new Response(`User-Agent: *\\nDisallow: /`, { headers: { "Content-Type": "text/plain" }});
    }
    
    const actualUrlStr = url.pathname.substring(1) + url.search + url.hash;
    
    if (actualUrlStr === "" || url.pathname === "/") {
      return getHTMLResponse(mainPage);
    }
    
    try {
      let test = actualUrlStr;
      if (!test.startsWith("http")) test = "https://" + test;
      new URL(test);
    } catch {
      return getHTMLResponse(`无效的 URL: ${actualUrlStr}`);
    }
    
    const actualUrl = new URL(actualUrlStr.startsWith("http") ? actualUrlStr : "https://" + actualUrlStr);

    // 功能: 文件扩展名拦截
    const blockExtensions = getCook(siteCookie, blockExtensionsCookieName) || "";
    const extensions = blockExtensions.split(',').map(ext => ext.trim().toLowerCase()).filter(Boolean);
    if (extensions.some(ext => actualUrl.pathname.toLowerCase().endsWith("." + ext))) {
      return new Response(null, { status: 404 });
    }
    
    // 功能: 广告拦截
    const blockAds = getCook(siteCookie, blockAdsCookieName) === "true";
    if (blockAds && adBlockKeywords.some(keyword => actualUrl.href.toLowerCase().includes(keyword))) {
        return new Response(null, { status: 404 });
    }

    // WebSocket直通
    if (request.headers.get('Upgrade')?.toLowerCase() === 'websocket') {
      return fetch(actualUrl.toString(), request);
    }

    const clientHeaderWithChange = new Headers(request.headers);
    clientHeaderWithChange.set('Origin', actualUrl.origin);
    clientHeaderWithChange.set('Referer', actualUrl.href);

    // 功能: 语言和设备模拟
    let selectedLanguage = getCook(siteCookie, languageCookieName) || 'zh-CN';
    const deviceType = getCook(siteCookie, deviceCookieName) || 'none';
    clientHeaderWithChange.set('Accept-Language', selectedLanguage);
    if (deviceType !== 'none') {
        clientHeaderWithChange.set('User-Agent', deviceUserAgents[deviceType]);
    }
    
    // 功能: Cookie注入
    const cookieInjectionData = getCook(siteCookie, cookieInjectionCookieName);
    if (cookieInjectionData) {
      try {
        const injections = JSON.parse(cookieInjectionData);
        let combinedCookies = [];
        injections.filter(inj => !inj.url || actualUrl.host.includes(inj.url)).forEach(inj => {
          combinedCookies.push(inj.cookies);
        });
        if (combinedCookies.length > 0) {
          const existingCookie = clientHeaderWithChange.get('Cookie') || '';
          clientHeaderWithChange.set('Cookie', existingCookie + (existingCookie ? '; ' : '') + combinedCookies.join('; '));
        }
      } catch (e) { /* silent fail */ }
    }
    
    // 功能: 自定义头
    const customHeaders = getCook(siteCookie, customHeadersCookieName) || '';
    if (customHeaders) {
      try {
          customHeaders.split('\\n').forEach(header => {
            const [key, ...vals] = header.split(':');
            const val = vals.join(':').trim();
            if (key && val) clientHeaderWithChange.set(key.trim(), val);
          });
      } catch(e) { /* silent fail */ }
    }

    const modifiedRequest = new Request(actualUrl, {
      headers: clientHeaderWithChange,
      method: request.method,
      body: request.body,
      redirect: "manual"
    });

    const response = await fetch(modifiedRequest);
    
    // 处理重定向
    if (response.status >= 300 && response.status < 400 && response.headers.has("Location")) {
        let locationHeader = response.headers.get("Location");
        let finalRedirectUrl;
        try {
            finalRedirectUrl = new URL(locationHeader, actualUrl.href).href;
        } catch {
            finalRedirectUrl = actualUrl.origin + locationHeader;
        }
        return getRedirect(thisProxyServerUrlHttps + finalRedirectUrl);
    }

    // ★★★ 核心改進：智能區分內容類型，以支援影片播放 ★★★
    let finalResponse = new Response(response.body, response);
    let headers = new Headers(finalResponse.headers);
    
    const responseContentType = headers.get("Content-Type") || '';
    
    // 定義可安全修改的文本類型，包括HLS/DASH影片播放清單
    const modifiableTextTypes = [
      'text/html', 'text/css', 'text/javascript', 'application/javascript', 
      'application/x-javascript', 'application/json', 'application/xml', 'text/xml', 
      'application/vnd.apple.mpegurl', 'application/x-mpegURL', 'application/dash+xml'
    ];
    
    const shouldModify = response.body && modifiableTextTypes.some(type => responseContentType.includes(type));

    if (shouldModify) {
      let bd = await response.text();
      
      // 僅在HTML文件中注入核心JS和執行URL替換
      if (responseContentType.includes("text/html")) {
        bd = bd.replace(/window\.location/g, "window." + replaceUrlObj)
               .replace(/document\.location/g, "document." + replaceUrlObj);

        bd = covToAbs(bd, actualUrl.href);
        bd = removeIntegrityAttributes(bd); 

        if (bd.charCodeAt(0) === 0xFEFF) { bd = bd.substring(1); }

        const hasProxyHintCook = getCook(siteCookie, proxyHintCookieName) === "agreed";
        const inject = `
        <script id="${injectedJsId}">
        ${(!hasProxyHintCook ? proxyHintInjection : "")}
        ${disguiseInjection}
        ${blockElementsInjection}
        ${httpRequestInjection}
        </script>
        `;
        bd = inject + bd;
      }
      
      finalResponse = new Response(bd, finalResponse);
      headers = new Headers(finalResponse.headers); // 更新headers
      headers.delete('Content-Length'); // 內容已修改，長度失效，需刪除
    }

    // --- 對所有響應進行通用的標頭處理 ---
    
    // 功能: Cookie持久化 (重寫Set-Cookie)
    if (headers.has('set-cookie')) {
        const originalCookies = headers.getAll('set-cookie');
        headers.delete('set-cookie');
        originalCookies.forEach(cookieHeader => {
            let cookies = cookieHeader.split(',').map(c => c.trim());
            cookies.forEach(cookieStr => {
                let parts = cookieStr.split(';').map(p => p.trim());
                let newCookie = [];
                let domainSet = false;

                parts.forEach(part => {
                    const [key, ...value] = part.split('=');
                    const keyLower = key.toLowerCase();
                    
                    if (keyLower === 'domain') {
                        newCookie.push(`domain=${thisProxyServerUrl_hostOnly}`);
                        domainSet = true;
                    } else if (keyLower === 'path') {
                        // 路径保持相对或根据需要重写，此处简单化处理
                        newCookie.push(part);
                    } else {
                        newCookie.push(part);
                    }
                });

                if (!domainSet) {
                    newCookie.push(`domain=${thisProxyServerUrl_hostOnly}`);
                }
                
                // 确保安全属性
                if (!newCookie.some(p => p.toLowerCase().startsWith('samesite'))) newCookie.push('SameSite=Lax');
                if (!newCookie.some(p => p.toLowerCase() === 'secure')) newCookie.push('Secure');
                
                headers.append('set-cookie', newCookie.join('; '));
            });
        });
    }
    
    // 添加代理自身的Cookie
    if (responseContentType.includes("text/html") && response.status === 200) {
      headers.append("Set-Cookie", `${lastVisitProxyCookie}=${actualUrl.origin}; Path=/; Domain=${thisProxyServerUrl_hostOnly}; Secure; SameSite=Lax`);
    }
    
    // 移除有害的安全性標頭
    const forbiddenHeaders = ["Content-Security-Policy", "Permissions-Policy", "Cross-Origin-Embedder-Policy", "Cross-Origin-Opener-Policy", "Cross-Origin-Resource-Policy", "X-Content-Security-Policy", "X-WebKit-CSP", "X-Permitted-Cross-Domain-Policies"];
    forbiddenHeaders.forEach(hdr => {
      headers.delete(hdr);
      headers.delete(hdr + "-Report-Only");
    });
    
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set("X-Frame-Options", "ALLOWALL");

    // 创建最终的响应
    return new Response(finalResponse.body, {
        status: finalResponse.status,
        statusText: finalResponse.statusText,
        headers: headers
    });

  } catch (e) {
    return getHTMLResponse(`请求处理失败: ${e.message}<br><pre>${e.stack}</pre>`);
  }
}

// --- 工具函数 ---

// ★★★ 已修正为您提供的版本 ★★★
function escapeRegExp(string) {
  return string.replace(/[-.*+?^${}()|[\]\\]/g, '\\$&');
}

function getCook(cookies, cookiename) {
  const cookiestring = RegExp(escapeRegExp(cookiename) + "=[^;]+").exec(cookies);
  return decodeURIComponent(cookiestring ? cookiestring.toString().replace(/^[^=]+./, "") : "");
}

function covToAbs(body, requestPathNow) {
  const urlAttributes = ['href', 'src', 'action', 'data-src'];
  urlAttributes.forEach(attr => {
      const regex = new RegExp(`(${attr}=["'])(?!data:|mailto:|javascript:|#)([^"']*)(["'])`, 'g');
      body = body.replace(regex, (match, p1, p2, p3) => {
          if (p2) {
              try {
                  const absolutePath = new URL(p2, requestPathNow).href;
                  return p1 + thisProxyServerUrlHttps + absolutePath + p3;
              } catch (e) {
                  return match; // If URL parsing fails, return original
              }
          }
          return match;
      });
  });
  return body;
}

function removeIntegrityAttributes(body) {
  let modifiedBody = body.replace(/\s*integrity=["'][^"']*["']/gi, '');
  modifiedBody = modifiedBody.replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '');
  return modifiedBody;
}

function handleWrongPwd() {
  return showPasswordPage ? getHTMLResponse(pwdPage) : getHTMLResponse("<h1>403 Forbidden</h1><br>您无权访问此网页。");
}

function getHTMLResponse(html) {
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function getRedirect(url) {
  return new Response(null, { status: 302, headers: { 'Location': url } });
}