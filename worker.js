// 监听 fetch 事件，处理所有传入的 HTTP 请求
addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  thisProxyServerUrlHttps = `${url.protocol}//${url.hostname}/`; // 代理服务器的 HTTPS URL
  thisProxyServerUrl_hostOnly = url.host; // 代理服务器的主机名
  event.respondWith(handleRequest(event.request));
});

// 全局变量定义
const str = "/"; // URL 分隔符
const lastVisitProxyCookie = "__PROXY_VISITEDSITE__"; // 记录最后访问的网站
const passwordCookieName = "__PROXY_PWD__"; // 密码 Cookie 名称
const proxyHintCookieName = "__PROXY_HINT_ACK__"; // 代理提示 Cookie
const languageCookieName = "__PROXY_LANGUAGE__"; // 语言选择 Cookie
const deviceCookieName = "__PROXY_DEVICE__"; // 设备模拟 Cookie
const blockExtensionsCookieName = "__PROXY_BLOCK_EXTENSIONS__"; // 拦截文件扩展名 Cookie
const blockAdsCookieName = "__PROXY_BLOCK_ADS__"; // 拦截广告 Cookie
const blockElementsCookieName = "__PROXY_BLOCK_ELEMENTS__"; // 屏蔽元素 Cookie
const blockElementsScopeCookieName = "__PROXY_BLOCK_ELEMENTS_SCOPE__"; // 屏蔽元素范围 Cookie
const tripleProxyCookieName = "__PROXY_TRIPLE__"; // 三级代理开关 Cookie
const password = ""; // 代理密码（空表示无密码）
const showPasswordPage = true; // 是否显示密码页面
const replaceUrlObj = "__location_yproxy__"; // 替换 window.location 的对象名
const injectedJsId = "__yproxy_injected_js_id__"; // 注入脚本的 ID
var thisProxyServerUrlHttps; // 代理服务器 HTTPS URL
var thisProxyServerUrl_hostOnly; // 代理服务器主机名

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

// 设备模拟的 User-Agent 和布局
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

// 代理提示页面
const proxyHintPage = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proxy Usage Agreement</title>
  <style>
    body {
      height: 100vh;
      margin: 0;
      background-color: #e0f7fa;
      font-family: 'Roboto', Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      background-image: url('https://www.loliapi.com/acg/');
      background-size: cover;
      background-position: center;
      position: relative;
    }
    body::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: inherit;
      background-size: cover;
      filter: blur(8px);
      z-index: -1;
    }
    .hint-container {
      text-align: center;
      max-width: 80%;
      padding: 30px;
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 15px;
      box-shadow: 0 8px 32px rgba(79, 195, 247, 0.3);
      transform: scale(0.8);
      opacity: 0;
      transition: transform 0.5s ease-out, opacity 0.5s ease-out;
    }
    .hint-container.loaded {
      transform: scale(1);
      opacity: 1;
    }
    h3 {
      font-size: 2rem;
      color: #0277bd;
      margin-bottom: 20px;
    }
    p {
      font-size: 16px;
      color: #333;
      margin: 15px 0;
    }
    a {
      color: #0277bd;
      text-decoration: none;
      font-weight: bold;
    }
    a:hover {
      color: #01579b;
    }
    .checkbox-container {
      margin: 20px 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .checkbox-wrapper input {
      margin-right: 10px;
    }
    button {
      background: linear-gradient(45deg, #4fc3f7, #81d4fa);
      color: #333;
      padding: 12px 20px;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 15px;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    button:hover:not(:disabled) {
      background: linear-gradient(45deg, #29b6f6, #4fc3f7);
      box-shadow: 0 5px 15px rgba(79, 195, 247, 0.4);
    }
  </style>
</head>
<body>
  <div class="hint-container">
    <h3>⚠️ 代理使用协议</h3>
    <p>警告：您即将使用网络代理。为确保安全，请勿通过代理登录任何网站。详情请参阅 <a href="https://github.com/1234567Yang/cf-proxy-ex/">使用条款</a>。</p>
    <div class="checkbox-container">
      <input type="checkbox" id="agreeCheckbox">
      <label for="agreeCheckbox">我已阅读并同意遵守代理服务的使用规则，理解使用代理可能存在的风险，并自行承担因此产生的一切后果。</label>
    </div>
    <button id="confirmButton" disabled>同意</button>
  </div>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const container = document.querySelector('.hint-container');
      const checkbox = document.getElementById('agreeCheckbox');
      const button = document.getElementById('confirmButton');
      setTimeout(() => container.classList.add('loaded'), 100);
      checkbox.addEventListener('change', () => button.disabled = !checkbox.checked);
      button.addEventListener('click', () => {
        if (!button.disabled) {
          document.cookie = "${proxyHintCookieName}=agreed; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/; domain=${thisProxyServerUrl_hostOnly}";
          window.location.reload();
        }
      });
    });
  </script>
</body>
</html>
`;

// IP 信息弹窗（仅在三级代理启用时显示）
const ipInfoPopup = `
<div id="ipInfoPopup" style="position: fixed; top: 20px; right: 20px; background: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); z-index: 9999; max-width: 300px; font-family: Arial, sans-serif;">
  <h3 style="margin: 0 0 10px; font-size: 16px; color: #0277bd;">代理 IP 信息</h3>
  <div id="ipInfoContent">加载中...</div>
  <button onclick="document.getElementById('ipInfoPopup').remove()" style="margin-top: 10px; padding: 8px; background: #4fc3f7; color: #fff; border: none; border-radius: 5px; cursor: pointer;">关闭</button>
</div>
<script>
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('https://ipinfo.io/json');
      const data = await response.json();
      const ipInfoContent = document.getElementById('ipInfoContent');
      ipInfoContent.innerHTML = \`
        <p><strong>IP 地址:</strong> \${data.ip}</p>
        <p><strong>地区:</strong> \${data.city}, \${data.region}, \${data.country}</p>
      \`;
    } catch (e) {
      document.getElementById('ipInfoContent').innerHTML = '无法获取 IP 信息';
    }
  });
</script>
`;

// 代理提示注入代码
const proxyHintInjection = `
setTimeout(() => {
  if (document.cookie.includes("${proxyHintCookieName}=agreed")) return;
  const hint = "警告：您当前正在使用网络代理，请勿登录任何网站。单击关闭此提示。详情请见 <a href='https://github.com/1234567Yang/cf-proxy-ex/' style='color:rgb(250,250,180);'>https://github.com/1234567Yang/cf-proxy-ex/</a>。";
  document.body.insertAdjacentHTML(
    'afterbegin',
    \`<div style="position:fixed;left:0px;top:0px;width:100%;margin:0px;padding:0px;display:block;z-index:99999999999999999999999;user-select:none;cursor:pointer;" id="__PROXY_HINT_DIV__" onclick="document.getElementById('__PROXY_HINT_DIV__').remove();">
      <span style="position:absolute;width:calc(100% - 20px);min-height:30px;font-size:18px;color:yellow;background:rgb(180,0,0);text-align:center;border-radius:5px;padding:10px;">
        \${hint}
      </span>
    </div>\`
  );
}, 5000);
`;

// 伪装注入代码
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

  Object.defineProperty(document, 'domain', { get: () => originalHost });
  Object.defineProperty(window, 'origin', { get: () => originalOrigin });
  Object.defineProperty(document, 'referrer', {
    get: () => {
      const actualReferrer = document.referrer || '';
      return actualReferrer.startsWith(proxyPrefix) ? actualReferrer.replace(proxyPrefix, '') : actualReferrer;
    }
  });

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

// 元素屏蔽注入代码
const blockElementsInjection = `
(function() {
  const blockElements = document.cookie.split('; ').find(row => row.startsWith('${blockElementsCookieName}='));
  const blockElementsScope = document.cookie.split('; ').find(row => row.startsWith('${blockElementsScopeCookieName}='));
  const selectors = blockElements ? blockElements.split('=')[1].split(',').map(s => s.trim()) : [];
  const scope = blockElementsScope ? blockElementsScope.split('=')[1] : 'global';
  const currentUrl = window.location.href;

  if (scope === 'global' || (scope !== 'global' && currentUrl.includes(scope))) {
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

// HTTP 请求注入代码
const httpRequestInjection = `
(function() {
  const nowURL = new URL(window.location.href);
  const proxy_host = nowURL.host;
  const proxy_protocol = nowURL.protocol;
  const proxy_host_with_schema = proxy_protocol + "//" + proxy_host + "/";
  let original_website_url_str = window.location.href.substring(proxy_host_with_schema.length);
  let original_website_url = new URL(original_website_url_str);

  let original_website_href = nowURL.pathname.substring(1);
  if (!original_website_href.startsWith("http")) original_website_href = "https://" + original_website_href;

  let original_website_host = original_website_url_str.substring(original_website_url_str.indexOf("://") + "://".length);
  original_website_host = original_website_host.split('/')[0];
  let original_website_host_with_schema = original_website_url_str.substring(0, original_website_url_str.indexOf("://")) + "://" + original_website_host + "/";

  function changeURL(relativePath) {
    if (!relativePath || relativePath === 'about:blank') return null;
    try {
      if (relativePath.startsWith("data:") || relativePath.startsWith("mailto:") || relativePath.startsWith("javascript:") || relativePath.startsWith("chrome") || relativePath.startsWith("edge")) return relativePath;
      if (relativePath.startsWith(proxy_host_with_schema)) relativePath = relativePath.substring(proxy_host_with_schema.length);
      if (relativePath.startsWith(proxy_host + "/")) relativePath = relativePath.substring(proxy_host.length + 1);
      if (relativePath.startsWith(proxy_host)) relativePath = relativePath.substring(proxy_host.length);

      let absolutePath = new URL(relativePath, original_website_url_str).href;
      absolutePath = absolutePath.replace(window.location.href, original_website_href)
        .replace(encodeURI(window.location.href), encodeURI(original_website_href))
        .replace(encodeURIComponent(window.location.href), encodeURIComponent(original_website_href))
        .replace(proxy_host, original_website_host)
        .replace(encodeURI(proxy_host), encodeURI(original_website_host))
        .replace(encodeURIComponent(proxy_host), encodeURIComponent(original_website_host));
      return proxy_host_with_schema + absolutePath;
    } catch (e) {
      console.log("URL 转换错误: " + e.message);
      return null;
    }
  }

  function getOriginalUrl(url) {
    if (!url) return null;
    return url.startsWith(proxy_host_with_schema) ? url.substring(proxy_host_with_schema.length) : url;
  }

  function networkInject() {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalFetch = window.fetch;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      url = changeURL(url);
      if (!url) return;
      return originalOpen.apply(this, arguments);
    };
    window.fetch = function(input, init) {
      let url = typeof input === 'string' ? input : input instanceof Request ? input.url : input;
      url = changeURL(url);
      if (!url) return Promise.reject(new Error('Invalid URL'));
      return originalFetch(typeof input === 'string' ? url : new Request(url, input), init);
    };
  }

  function windowOpenInject() {
    const originalOpen = window.open;
    window.open = function(url, name, specs) {
      const modifiedUrl = changeURL(url);
      if (!modifiedUrl) return null;
      return originalOpen.call(window, modifiedUrl, name, specs);
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
      get: () => getOriginalUrl(descriptor.get.call(this)),
      set: val => descriptor.set.call(this, changeURL(val))
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
      if (url.startsWith("/" + original_website_url.href)) url = url.substring(("/" + original_website_url.href).length);
      if (url.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1))) url = url.substring(("/" + original_website_url.href).length - 1);
      if (url.startsWith("/" + original_website_url.href.replace("://", ":/"))) url = url.substring(("/" + original_website_url.href.replace("://", ":/")).length);
      if (url.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1).replace("://", ":/"))) url = url.substring(("/" + original_website_url.href).replace("://", ":/").length - 1);
      const u = changeURL(url);
      if (!u) return;
      return originalPushState.apply(this, [state, title, u]);
    };
    History.prototype.replaceState = function(state, title, url) {
      if (!url) return;
      if (url.startsWith("/" + original_website_url.href)) url = url.substring(("/" + original_website_url.href).length);
      if (url.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1))) url = url.substring(("/" + original_website_url.href).length - 1);
      if (url.startsWith("/" + original_website_url.href.replace("://", ":/"))) url = url.substring(("/" + original_website_url.href.replace("://", ":/")).length);
      if (url.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1).replace("://", ":/"))) url = url.substring(("/" + original_website_url.href).replace("://", ":/").length - 1);
      const u = changeURL(url);
      if (!u) return;
      return originalReplaceState.apply(this, [state, title, u]);
    };
  }

  function obsPage() {
    const yProxyObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => traverseAndConvert(mutation));
    });
    yProxyObserver.observe(document.body, { attributes: true, childList: true, subtree: true });
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
    if (element.hasAttribute("href")) {
      relativePath = element.getAttribute("href");
      setAttr = "href";
    } else if (element.hasAttribute("src")) {
      relativePath = element.getAttribute("src");
      setAttr = "src";
    }
    if (setAttr && relativePath.indexOf(proxy_host_with_schema) !== 0 && !relativePath.includes("*")) {
      try {
        const absolutePath = changeURL(relativePath);
        if (absolutePath) element.setAttribute(setAttr, absolutePath);
      } catch (e) {}
    }
  }

  function removeIntegrityAttributesFromElement(element) {
    if (element.hasAttribute('integrity')) element.removeAttribute('integrity');
  }

  function loopAndConvertToAbs() {
    document.querySelectorAll('*').forEach(ele => {
      removeIntegrityAttributesFromElement(ele);
      covToAbs(ele);
    });
  }

  function covScript() {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) covToAbs(scripts[i]);
    setTimeout(covScript, 3000);
  }

  networkInject();
  windowOpenInject();
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

// 主页 HTML
const mainPage = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Web Online Proxy</title>
  <style>
    body {
      height: 100vh;
      margin: 0;
      background-color: #e0f7fa;
      font-family: 'Roboto', Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      background-image: url('https://www.loliapi.com/acg/');
      background-size: cover;
      background-position: center;
      position: relative;
    }
    body::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: inherit;
      background-size: cover;
      filter: blur(8px);
      z-index: -1;
    }
    .content {
      text-align: center;
      max-width: 80%;
      padding: 30px;
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 15px;
      box-shadow: 0 8px 32px rgba(79, 195, 247, 0.3);
      transform: scale(0.8);
      opacity: 0;
      transition: transform 0.5s ease-out, opacity 0.5s ease-out;
    }
    .content.loaded {
      transform: scale(1);
      opacity: 1;
    }
    h1 {
      font-size: 2.5rem;
      color: #0277bd;
      margin-bottom: 20px;
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
    }
    select {
      background-color: rgba(255, 255, 255, 0.5);
      border: 1px solid rgba(79, 195, 247, 0.5);
      color: #333;
    }
    button {
      background: linear-gradient(45deg, #4fc3f7, #81d4fa);
      border: none;
      color: #333;
      cursor: pointer;
      font-weight: bold;
    }
    button:hover {
      background: linear-gradient(45deg, #29b6f6, #4fc3f7);
      box-shadow: 0 5px 15px rgba(79, 195, 247, 0.4);
    }
    .config-button {
      background: linear-gradient(45deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.5));
      border: 1px solid rgba(79, 195, 247, 0.5);
    }
    a {
      color: #0277bd;
      text-decoration: none;
      font-weight: bold;
    }
    p {
      margin: 12px 0;
      font-size: 14px;
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
    }
    .modal-content {
      background-color: rgba(255, 255, 255, 0.9);
      padding: 20px;
      border-radius: 15px;
      max-width: 80%;
      text-align: center;
    }
    .modal-content input, .modal-content select {
      width: 90%;
      margin: 10px auto;
      padding: 10px;
      border-radius: 25px;
      border: 1px solid rgba(79, 195, 247, 0.5);
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
      <label><input type="checkbox" id="blockAds"> 拦截广告</label>
      <label><input type="checkbox" id="tripleProxy"> 启用三级代理</label>
      <button class="config-button" onclick="showBlockExtensionsModal()">配置拦截器</button>
      <button class="config-button" onclick="showBlockElementsModal()">屏蔽元素</button>
    </div>
    <p>声明：本工具仅用于学术研究和文献查阅，请严格遵守相关法律法规。</p>
    <p>By Sak 2025</p>
    <p>开源地址：<a href="https://github.com/1234567Yang/cf-proxy-ex/">GitHub</a></p>
  </div>
  <div id="urlModal" class="modal">
    <div class="modal-content">
      <h3>输入目标网址</h3>
      <input type="text" id="targetUrl" placeholder="请输入目标地址">
      <button onclick="redirectTo()">跳转</button>
      <button class="config-button" onclick="closeUrlModal()">取消</button>
    </div>
  </div>
  <div id="blockExtensionsModal" class="modal">
    <div class="modal-content">
      <h3>配置拦截器</h3>
      <input type="text" id="blockExtensionsInput" placeholder="请输入扩展名（例：jpg, gif）">
      <button onclick="saveBlockExtensions()">保存</button>
      <button class="config-button" onclick="closeBlockExtensionsModal()">取消</button>
    </div>
  </div>
  <div id="blockElementsModal" class="modal">
    <div class="modal-content">
      <h3>屏蔽元素</h3>
      <input type="text" id="blockElementsInput" placeholder="请输入 CSS 选择器（例：.ad, #banner）">
      <label>注入范围</label>
      <select id="blockElementsScope">
        <option value="global">全局</option>
        <option value="specific">指定链接</option>
      </select>
      <input type="text" id="blockElementsScopeUrl" placeholder="请输入目标域名" style="display: none;">
      <button onclick="saveBlockElements()">保存</button>
      <button class="config-button" onclick="closeBlockElementsModal()">取消</button>
    </div>
  </div>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelector('.content').classList.add('loaded');
      const cookies = document.cookie.split('; ').reduce((acc, c) => {
        const [k, v] = c.split('=');
        acc[k] = v;
        return acc;
      }, {});
      document.getElementById('languageSelect').value = cookies['${languageCookieName}'] || 'zh-CN';
      document.getElementById('deviceSelect').value = cookies['${deviceCookieName}'] || 'none';
      document.getElementById('blockAds').checked = cookies['${blockAdsCookieName}'] === 'true';
      document.getElementById('tripleProxy').checked = cookies['${tripleProxyCookieName}'] === 'true';
      document.getElementById('blockExtensionsInput').value = cookies['${blockExtensionsCookieName}'] || '';
      document.getElementById('blockElementsInput').value = cookies['${blockElementsCookieName}'] || '';
      const scope = cookies['${blockElementsScopeCookieName}'] || 'global';
      document.getElementById('blockElementsScope').value = scope;
      document.getElementById('blockElementsScopeUrl').style.display = scope === 'specific' ? 'block' : 'none';
      if (scope === 'specific') document.getElementById('blockElementsScopeUrl').value = cookies['${blockElementsScopeCookieName}_URL'] || '';
    });

    function toggleAdvancedOptions() { document.getElementById('advancedOptions').classList.toggle('active'); }
    function showUrlModal() { document.getElementById('urlModal').style.display = 'flex'; }
    function closeUrlModal() { document.getElementById('urlModal').style.display = 'none'; }
    function showBlockExtensionsModal() { document.getElementById('blockExtensionsModal').style.display = 'flex'; }
    function closeBlockExtensionsModal() { document.getElementById('blockExtensionsModal').style.display = 'none'; }
    function showBlockElementsModal() { document.getElementById('blockElementsModal').style.display = 'flex'; }
    function closeBlockElementsModal() { document.getElementById('blockElementsModal').style.display = 'none'; }

    function redirectTo() {
      const targetUrl = document.getElementById('targetUrl').value.trim();
      const language = document.getElementById('languageSelect').value;
      const tripleProxy = document.getElementById('tripleProxy').checked;
      if (targetUrl) {
        let finalUrl = window.location.origin + '/' + (targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl);
        if (language) finalUrl += '?lang=' + language;
        if (tripleProxy) finalUrl += (language ? '&' : '?') + 'triple=true';
        window.open(finalUrl, '_blank');
      }
      closeUrlModal();
    }

    function saveBlockExtensions() {
      setCookie('${blockExtensionsCookieName}', document.getElementById('blockExtensionsInput').value.trim());
      closeBlockExtensionsModal();
    }

    function saveBlockElements() {
      const elements = document.getElementById('blockElementsInput').value.trim();
      const scope = document.getElementById('blockElementsScope').value;
      const scopeUrl = document.getElementById('blockElementsScopeUrl').value.trim();
      setCookie('${blockElementsCookieName}', elements);
      setCookie('${blockElementsScopeCookieName}', scope);
      setCookie('${blockElementsScopeCookieName}_URL', scope === 'specific' ? scopeUrl : '');
      closeBlockElementsModal();
    }

    function setCookie(name, value) {
      const oneWeekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      document.cookie = \`${name}=\${value}; expires=\${oneWeekLater.toUTCString()}; path=/; domain=${thisProxyServerUrl_hostOnly}\`;
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
      const password = document.getElementById('password').value;
      const oneWeekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      document.cookie = "${passwordCookieName}=\${password}; expires=\${oneWeekLater.toUTCString()}; path=/; domain=${thisProxyServerUrl_hostOnly}";
      location.reload();
    }
  </script>
</head>
<body>
  <div>
    <input id="password" type="password" placeholder="请输入密码">
    <button onclick="setPassword()">提交</button>
  </div>
</body>
</html>
`;

// 重定向错误页面
const redirectError = `
<html><head></head><body><h2>重定向错误：目标网站可能包含错误的跳转信息，无法解析</h2></body></html>
`;

// 主处理函数，处理所有 HTTP 请求
async function handleRequest(request, proxyLevel = 0) {
  const url = new URL(request.url);
  const cache = caches.default;
  const contentType = request.headers.get('Content-Type') || '';
  const isStatic = contentType.includes('image/') || contentType.includes('text/css') || contentType.includes('application/javascript');

  // 检查缓存（仅对静态内容）
  if (isStatic) {
    const cacheKey = new Request(url.toString(), { method: 'GET' });
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) return cachedResponse;
  }

  // 防止爬虫（如 Bytespider）滥用代理
  const userAgent = request.headers.get('User-Agent');
  if (userAgent.includes("Bytespider")) {
    return getHTMLResponse("禁止爬虫访问，Bytespider 请遵守 robots.txt。");
  }

  // 检查代理提示 Cookie
  const siteCookie = request.headers.get('Cookie') || '';
  const agreed = getCook(siteCookie, proxyHintCookieName);
  if (!agreed || agreed !== "agreed") {
    return getHTMLResponse(proxyHintPage);
  }

  // 检查密码
  if (password) {
    const pwd = getCook(siteCookie, passwordCookieName);
    if (!pwd || pwd !== password) return handleWrongPwd();
  }

  // 处理 favicon 和 robots.txt 请求
  if (url.pathname.endsWith("favicon.ico")) return getRedirect("https://www.baidu.com/favicon.ico");
  if (url.pathname.endsWith("robots.txt")) {
    return new Response(`User-Agent: *\nDisallow: /`, { headers: { "Content-Type": "text/plain" } });
  }

  // 显示主页
  const actualUrlStr = url.pathname.substring(url.pathname.indexOf(str) + str.length) + url.search + url.hash;
  if (!actualUrlStr) return getHTMLResponse(mainPage);

  // 检查文件扩展名拦截
  const blockExtensions = getCook(siteCookie, blockExtensionsCookieName) || "";
  const blockAds = getCook(siteCookie, blockAdsCookieName) === "true";
  const extensions = blockExtensions.split(',').map(ext => ext.trim().toLowerCase()).filter(ext => ext);
  if (extensions.length > 0) {
    const fileExt = actualUrlStr.split('.').pop().toLowerCase();
    if (extensions.includes(fileExt)) return new Response(null, { status: 204 });
  }

  // 检查广告拦截
  if (blockAds && adBlockKeywords.some(keyword => actualUrlStr.toLowerCase().includes(keyword))) {
    return new Response(null, { status: 204 });
  }

  // 验证目标 URL
  let test = actualUrlStr;
  if (!test.startsWith("http")) test = "https://" + test;
  try {
    const u = new URL(test);
    if (!u.host.includes(".")) throw new Error();
  } catch {
    const lastVisit = getCook(siteCookie, lastVisitProxyCookie);
    if (lastVisit) return getRedirect(thisProxyServerUrlHttps + lastVisit + "/" + actualUrlStr);
    return getHTMLResponse("获取 Cookie 出错：<br> siteCookie: " + siteCookie + "<br> lastSite: " + lastVisit);
  }

  // 处理不带协议的 URL
  if (!actualUrlStr.startsWith("http") && !actualUrlStr.includes("://")) {
    return getRedirect(thisProxyServerUrlHttps + "https://" + actualUrlStr);
  }

  const actualUrl = new URL(actualUrlStr);

  // 检查主机名大小写
  if (actualUrlStr !== actualUrl.href) return getRedirect(thisProxyServerUrlHttps + actualUrl.href);

  // 检查是否启用三级代理
  const tripleProxy = getCook(siteCookie, tripleProxyCookieName) === "true" || url.searchParams.get('triple') === 'true';
  let ipInfo = [];
  if (tripleProxy && proxyLevel < 3) {
    // 获取当前级别的 IP 信息
    try {
      const ipResponse = await fetch('https://ipinfo.io/json');
      const ipData = await ipResponse.json();
      ipInfo.push({ level: proxyLevel + 1, ip: ipData.ip, region: `${ipData.city}, ${ipData.region}, ${ipData.country}` });
    } catch (e) {}
    // 递归调用实现三级代理
    const newRequest = new Request(thisProxyServerUrlHttps + actualUrlStr, {
      headers: request.headers,
      method: request.method,
      body: request.body,
      redirect: "manual"
    });
    const response = await handleRequest(newRequest, proxyLevel + 1);
    // 将子级 IP 信息合并
    const subIpInfo = response.headers.get('X-Proxy-IP-Info') ? JSON.parse(response.headers.get('X-Proxy-IP-Info')) : [];
    ipInfo = [...ipInfo, ...subIpInfo];
    response.headers.set('X-Proxy-IP-Info', JSON.stringify(ipInfo));
    return response;
  }

  // 获取当前级别的 IP 信息
  try {
    const ipResponse = await fetch('https://ipinfo.io/json');
    const ipData = await ipResponse.json();
    ipInfo.push({ level: proxyLevel + 1, ip: ipData.ip, region: `${ipData.city}, ${ipData.region}, ${ipData.country}` });
  } catch (e) {}

  // 获取语言和设备设置
  let selectedLanguage = getCook(siteCookie, languageCookieName) || url.searchParams.get('lang') || 'zh-CN';
  if (!supportedLanguages.some(lang => lang.code === selectedLanguage)) selectedLanguage = 'zh-CN';
  const deviceType = getCook(siteCookie, deviceCookieName) || 'none';

  // 修改请求头
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

  // 修改请求体
  let clientRequestBodyWithChange;
  if (request.body) {
    clientRequestBodyWithChange = await request.text();
    clientRequestBodyWithChange = clientRequestBodyWithChange
      .replace(thisProxyServerUrlHttps, actualUrlStr)
      .replace(thisProxyServerUrl_hostOnly, actualUrl.host);
  }

  // 创建修改后的请求
  const modifiedRequest = new Request(actualUrl, {
    headers: clientHeaderWithChange,
    method: request.method,
    body: request.body ? clientRequestBodyWithChange : null,
    redirect: "manual"
  });

  // 发送请求
  const response = await fetch(modifiedRequest);
  if (response.status.toString().startsWith("3") && response.headers.get("Location")) {
    try {
      const redirectUrl = new URL(response.headers.get("Location"), actualUrlStr).href;
      if (redirectUrl === 'about:blank') throw new Error('Invalid redirect');
      return getRedirect(thisProxyServerUrlHttps + redirectUrl);
    } catch {
      return getHTMLResponse(redirectError + "<br>Redirect URL: " + response.headers.get("Location"));
    }
  }

  // 处理响应
  let modifiedResponse;
  let bd;
  const responseContentType = response.headers.get("Content-Type") || '';
  const hasProxyHintCook = getCook(siteCookie, proxyHintCookieName) === "agreed";
  if (response.body) {
    if (responseContentType.startsWith("text/")) {
      bd = await response.text();
      const regex = new RegExp(`(?<!src="|href=")(https?:\\/\\/[^\\s'"]+)`, 'g');
      bd = bd.replace(regex, match => match.includes("http") ? thisProxyServerUrlHttps + match : thisProxyServerUrl_hostOnly + "/" + match);
      if (responseContentType.includes("html") || responseContentType.includes("javascript")) {
        bd = bd.replace(/window\.location/g, "window." + replaceUrlObj)
               .replace(/document\.location/g, "document." + replaceUrlObj);
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
          ${tripleProxy ? ipInfoPopup : ""}
          ${httpRequestInjection}
          setTimeout(() => document.getElementById("${injectedJsId}").remove(), 1);
        </script>
        `;
        bd = (hasBom ? "\uFEFF" : "") + inject + bd;
      }
      modifiedResponse = new Response(bd, response);
    } else {
      modifiedResponse = new Response(response.body, response);
    }
  } else {
    modifiedResponse = new Response(null, response);
  }

  // 缓存静态内容
  if (isStatic && response.status === 200) {
    const cacheKey = new Request(url.toString(), { method: 'GET' });
    const cacheResponse = new Response(modifiedResponse.body, {
      status: modifiedResponse.status,
      headers: { ...modifiedResponse.headers, 'Cache-Control': 'public, max-age=86400' }
    });
    await cache.put(cacheKey, cacheResponse.clone());
  }

  // 处理响应头中的 Cookie
  const headers = new Headers(modifiedResponse.headers);
  const cookieHeaders = [];
  for (const [key, value] of headers.entries()) {
    if (key.toLowerCase() === 'set-cookie') cookieHeaders.push({ headerName: key, headerValue: value });
  }
  if (cookieHeaders.length > 0) {
    cookieHeaders.forEach(cookieHeader => {
      const cookies = cookieHeader.headerValue.split(',').map(cookie => cookie.trim());
      for (let i = 0; i < cookies.length; i++) {
        const parts = cookies[i].split(';').map(part => part.trim());
        const pathIndex = parts.findIndex(part => part.toLowerCase().startsWith('path='));
        let originalPath = pathIndex !== -1 ? parts[pathIndex].substring("path=".length) : '';
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

  // 设置 Cookie 和响应头
  if (responseContentType.includes("text/html") && response.status === 200 && bd.includes("<html")) {
    headers.append("Set-Cookie", `${lastVisitProxyCookie}=${actualUrl.origin}; Path=/; Domain=${thisProxyServerUrl_hostOnly}`);
    headers.append("Set-Cookie", `${languageCookieName}=${selectedLanguage}; Path=/; Domain=${thisProxyServerUrl_hostOnly}`);
    if (!hasProxyHintCook) {
      const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      headers.append("Set-Cookie", `${proxyHintCookieName}=agreed; expires=${expiryDate.toUTCString()}; path=/; domain=${thisProxyServerUrl_hostOnly}`);
    }
  }

  for (const [key, value] of headers.entries()) {
    if (key.toLowerCase() === 'access-control-allow-origin') headers.set(key, actualUrl.origin);
    else if (key.toLowerCase().includes('content-security-policy')) {
      headers.set(key, value.replace(thisProxyServerUrl_hostOnly, actualUrl.host));
    }
  }

  headers.set('Access-Control-Allow-Origin', actualUrl.origin);
  headers.set("X-Frame-Options", "ALLOWALL");
  const headersToDelete = ["Content-Length", "Content-Security-Policy", "Permissions-Policy", "Cross-Origin-Embedder-Policy", "Cross-Origin-Resource-Policy"];
  headersToDelete.forEach(header => {
    headers.delete(header);
    headers.delete(header + "-Report-Only");
  });

  if (!hasProxyHintCook) headers.set("Cache-Control", "max-age=0");

  // 添加 IP 信息到响应头
  headers.set('X-Proxy-IP-Info', JSON.stringify(ipInfo));

  return new Response(modifiedResponse.body, { status: modifiedResponse.status, headers });
}

// 工具函数：转义正则表达式
function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

// 获取指定 Cookie 值
function getCook(cookies, cookiename) {
  const cookiestring = RegExp(escapeRegExp(cookiename) + "=[^;]+").exec(cookies);
  return decodeURIComponent(cookiestring ? cookiestring.toString().replace(/^[^=]+./, "") : "");
}

// 将相对路径转换为绝对路径
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
        if (!strReplace.includes(thisProxyServerUrl_hostOnly) && !isPosEmbed(body, replace.index)) {
          const relativePath = strReplace.substring(match[1].length, strReplace.length - 1);
          if (!relativePath.startsWith("data:") && !relativePath.startsWith("mailto:") && !relativePath.startsWith("javascript:") && !relativePath.startsWith("chrome") && !relativePath.startsWith("edge")) {
            try {
              const absolutePath = thisProxyServerUrlHttps + new URL(relativePath, requestPathNow).href;
              original.push(strReplace);
              target.push(match[1] + absolutePath + `"`);
            } catch {}
          }
        }
      }
    }
  }
  for (let i = 0; i < original.length; i++) body = body.replace(original[i], target[i]);
  return body;
}

// 移除 integrity 属性
function removeIntegrityAttributes(body) {
  return body.replace(/integrity=("|')([^"']*)("|')/g, '');
}

// 判断是否在嵌入内容中
function isPosEmbed(html, pos) {
  if (pos > html.length || pos < 0) return false;
  const start = html.lastIndexOf('<', pos) || 0;
  const end = html.indexOf('>', pos) || html.length;
  const content = html.slice(start + 1, end);
  return content.includes(">") || content.includes("<");
}

// 处理密码错误
function handleWrongPwd() {
  return showPasswordPage ? getHTMLResponse(pwdPage) : getHTMLResponse("<h1>403 Forbidden</h1><br>您无权访问此网页。");
}

// 返回 HTML 响应
function getHTMLResponse(html) {
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

// 返回重定向响应
function getRedirect(url) {
  return Response.redirect(url, 301);
}

// 查找字符串中第 n 次出现的位置
function nthIndex(str, pat, n) {
  let i = -1;
  while (n-- && i++ < str.length) {
    i = str.indexOf(pat, i);
    if (i < 0) break;
  }
  return i;
}