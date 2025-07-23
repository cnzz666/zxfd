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

// 全局常量
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

// 支持的语言
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

// 设备模拟
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

// 伪装注入
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

// 元素屏蔽注入
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

// HTTP请求注入
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
      // 增加 blob: 协议跳过，因为 blob URLs 是浏览器内部资源，不应被代理
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
    History.prototype.back = function () {
      return originalBack.apply(this);
    };
    History.prototype.forward = function () {
      return originalForward.apply(this);
    };
    History.prototype.go = function (delta) {
      return originalGo.apply(this, [delta]);
    };
  }
  
  function elementObserverInject() {
    var yProxyObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        traverseAndConvert(mutation);
      });
    });
    var config = { attributes: true, childList: true, subtree: true };
    yProxyObserver.observe(document.body, config);
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
  loopAndConvert = function() {
    for(var ele of document.querySelectorAll('*')){
      removeIntegrityAttributesFromElement(ele);
      covToAbs(ele);
    }
  };
  covScript = function() {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      removeIntegrityAttributesFromElement(scripts[i]);
      covToAbs(scripts[i]);
    }
    setTimeout(covScript, 3000);
  };
  loopAndConvert();
  covScript();
  window.addEventListener('load', () => {
    loopAndConvert();
    elementObserverInject();
    covScript();
  });
  window.addEventListener('error', event => {
    var element = event.target || event.srcElement;
    if (element.tagName === 'SCRIPT') {
      if(element.alreadyChanged) return;
      removeIntegrityAttributesFromElement(element);
      covToAbs(element);
      var newScript = document.createElement("script");
      newScript.src = element.src;
      newScript.async = element.async;
      newScript.defer = element.defer;
      newScript.alreadyChanged = true;
      document.head.appendChild(newScript);
    }
  });
  covToAbs(document.head);
  covToAbs(document.body);
})();
`;

// 主页面HTML - 更新后的简洁设计
const mainPage = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Web Online Proxy</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    body {
      background: linear-gradient(135deg, #1a2a6c, #b21f1f, #1a2a6c);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      color: #fff;
    }
    
    .container {
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    h1 {
      font-size: 28px;
      margin-bottom: 10px;
      color: #4fc3f7;
    }
    
    .description {
      font-size: 16px;
      opacity: 0.8;
      margin-bottom: 25px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    input, select {
      width: 100%;
      padding: 12px 15px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: white;
      font-size: 16px;
    }
    
    input:focus, select:focus {
      outline: none;
      border-color: #4fc3f7;
      box-shadow: 0 0 0 2px rgba(79, 195, 247, 0.3);
    }
    
    button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(to right, #4fc3f7, #2196f3);
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 10px;
    }
    
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(33, 150, 243, 0.4);
    }
    
    .checkbox-group {
      display: flex;
      align-items: center;
      margin: 15px 0;
    }
    
    .checkbox-group input {
      width: auto;
      margin-right: 10px;
    }
    
    .advanced-btn {
      background: rgba(255, 255, 255, 0.1);
      margin-top: 20px;
    }
    
    .advanced-section {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.5s ease;
    }
    
    .advanced-section.active {
      max-height: 1000px;
    }
    
    .footer {
      margin-top: 25px;
      text-align: center;
      font-size: 14px;
      opacity: 0.7;
      line-height: 1.6;
    }
    
    .footer a {
      color: #4fc3f7;
      text-decoration: none;
    }
    
    .footer a:hover {
      text-decoration: underline;
    }
    
    .config-btn {
      background: rgba(255, 255, 255, 0.1);
      margin-top: 10px;
    }
    
    /* 响应式设计 */
    @media (max-width: 600px) {
      .container {
        padding: 20px;
      }
      
      h1 {
        font-size: 24px;
      }
      
      button {
        padding: 12px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Website Online Proxy</h1>
      <p class="description">请输入学术网站地址进行访问</p>
    </header>
    
    <div class="form-group">
      <label for="targetUrl">目标网址</label>
      <input type="text" id="targetUrl" placeholder="例如: baike.baidu.com">
    </div>
    
    <button id="visitBtn">访问网站</button>
    
    <button class="advanced-btn" id="toggleAdvanced">高级选项</button>
    
    <div class="advanced-section" id="advancedOptions">
      <div class="form-group">
        <label for="languageSelect">语言</label>
        <select id="languageSelect">
          ${supportedLanguages.map(lang => `<option value="${lang.code}" ${lang.code === 'zh-CN' ? 'selected' : ''}>${lang.name}</option>`).join('')}
        </select>
      </div>
      
      <div class="form-group">
        <label for="deviceSelect">设备模拟</label>
        <select id="deviceSelect">
          <option value="none" selected>不模拟</option>
          <option value="desktop">电脑</option>
          <option value="mobile">手机</option>
        </select>
      </div>
      
      <div class="checkbox-group">
        <input type="checkbox" id="blockAds">
        <label for="blockAds">拦截广告</label>
      </div>
      
      <button class="config-btn" id="blockExtensionsBtn">配置拦截器</button>
      <button class="config-btn" id="blockElementsBtn">屏蔽元素</button>
      <button class="config-btn" id="customHeadersBtn">自定义头</button>
      <button class="config-btn" id="cookieInjectionBtn">Cookie注入</button>
    </div>
    
    <div class="footer">
      <p>声明：本工具仅用于学术研究和文献查阅，请严格遵守相关法律法规。</p>
      <p>By Sak 2025 | <a href="https://github.com/1234567Yang/cf-proxy-ex/">项目开源地址</a></p>
    </div>
  </div>
  
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      // 加载保存的配置
      const loadCookies = () => {
        const cookies = document.cookie.split('; ').reduce((acc, row) => {
          const [key, value] = row.split('=');
          acc[key] = value;
          return acc;
        }, {});
        
        if (cookies['${languageCookieName}']) {
          document.getElementById('languageSelect').value = cookies['${languageCookieName}'];
        }
        if (cookies['${deviceCookieName}']) {
          document.getElementById('deviceSelect').value = cookies['${deviceCookieName}'];
        }
        if (cookies['${blockAdsCookieName}']) {
          document.getElementById('blockAds').checked = cookies['${blockAdsCookieName}'] === 'true';
        }
      };
      
      // 保存配置到Cookie
      const saveCookie = (name, value) => {
        const cookieDomain = window.location.hostname;
        const oneYearLater = new Date();
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
        document.cookie = \`\${name}=\${value}; expires=\${oneYearLater.toUTCString()}; path=/; domain=\${cookieDomain}; Secure; SameSite=Lax\`;
      };
      
      // 初始化
      loadCookies();
      
      // 高级选项切换
      const advancedBtn = document.getElementById('toggleAdvanced');
      const advancedSection = document.getElementById('advancedOptions');
      
      advancedBtn.addEventListener('click', () => {
        advancedSection.classList.toggle('active');
        advancedBtn.textContent = advancedSection.classList.contains('active') ? 
          '隐藏高级选项' : '高级选项';
      });
      
      // 配置变更保存
      document.getElementById('languageSelect').addEventListener('change', function() {
        saveCookie('${languageCookieName}', this.value);
      });
      
      document.getElementById('deviceSelect').addEventListener('change', function() {
        saveCookie('${deviceCookieName}', this.value);
      });
      
      document.getElementById('blockAds').addEventListener('change', function() {
        saveCookie('${blockAdsCookieName}', this.checked);
      });
      
      // 访问按钮
      document.getElementById('visitBtn').addEventListener('click', () => {
        const targetUrl = document.getElementById('targetUrl').value.trim();
        const currentOrigin = window.location.origin;
        
        if (!targetUrl) {
          alert('请输入目标网址');
          return;
        }
        
        const finalUrl = currentOrigin + '/' + 
          (targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl);
        
        window.location.href = finalUrl;
      });
      
      // 配置按钮事件
      const showConfigModal = (title, fields) => {
        // 简化的配置实现
        let configStr = title + "\\n\\n";
        fields.forEach(field => {
          const value = prompt(field.prompt);
          if (value !== null) {
            saveCookie(field.cookieName, value);
          }
        });
      };
      
      document.getElementById('blockExtensionsBtn').addEventListener('click', () => {
        showConfigModal('配置拦截器', [{
          prompt: '请输入需要拦截的文件扩展名（例如：jpg, gif）',
          cookieName: '${blockExtensionsCookieName}'
        }]);
      });
      
      document.getElementById('blockElementsBtn').addEventListener('click', () => {
        showConfigModal('屏蔽元素', [{
          prompt: '请输入需要屏蔽的 CSS 选择器（例如：.ad, #banner）',
          cookieName: '${blockElementsCookieName}'
        }]);
      });
      
      document.getElementById('customHeadersBtn').addEventListener('click', () => {
        showConfigModal('自定义 HTTP 头', [{
          prompt: '请输入自定义头（格式：Header-Name: value）',
          cookieName: '${customHeadersCookieName}'
        }]);
      });
      
      document.getElementById('cookieInjectionBtn').addEventListener('click', () => {
        showConfigModal('Cookie注入', [{
          prompt: '请输入目标网站（例如：example.com）',
          cookieName: '${cookieInjectionCookieName}_URL'
        }, {
          prompt: '请输入Cookie内容（例如：key=value; key2=value2）',
          cookieName: '${cookieInjectionCookieName}_VALUE'
        }]);
      });
    });
  </script>
</body>
</html>
`;

// 密码页面
const pwdPage = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      background: linear-gradient(135deg, #1a2a6c, #b21f1f);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    
    .password-box {
      background: rgba(0, 0, 0, 0.7);
      padding: 30px;
      border-radius: 12px;
      width: 100%;
      max-width: 400px;
      text-align: center;
    }
    
    h2 {
      color: #fff;
      margin-bottom: 20px;
    }
    
    input {
      width: 100%;
      padding: 12px;
      margin-bottom: 15px;
      border: none;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    button {
      width: 100%;
      padding: 12px;
      background: #4fc3f7;
      border: none;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="password-box">
    <h2>需要密码访问</h2>
    <input id="password" type="password" placeholder="输入密码">
    <button onclick="setPassword()">提交</button>
  </div>
  
  <script>
    function setPassword() {
      try {
        const password = document.getElementById('password').value;
        const cookieDomain = window.location.hostname;
        const oneYearLater = new Date();
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
        document.cookie = \`${passwordCookieName}=\${password}; expires=\${oneYearLater.toUTCString()}; path=/; domain=\${cookieDomain}; Secure; SameSite=Lax\`;
      } catch(e) {
        alert(e.message);
      }
      location.reload();
    }
  </script>
</body>
</html>
`;

// 重定向错误页面
const redirectError = `
<html>
<head>
  <style>
    body {
      background: #1a2a6c;
      color: white;
      font-family: sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      text-align: center;
    }
    
    .error-box {
      background: rgba(0, 0, 0, 0.7);
      padding: 30px;
      border-radius: 12px;
      max-width: 600px;
    }
  </style>
</head>
<body>
  <div class="error-box">
    <h2>重定向错误</h2>
    <p>无法处理重定向：您尝试访问的网站可能包含错误的重定向信息。</p>
  </div>
</body>
</html>
`;

async function handleRequest(request) {
  try {
    const siteCookie = request.headers.get('Cookie') || "";
    // 密码保护
    if (password !== "") {
      if (siteCookie) {
        const pwd = getCook(siteCookie, passwordCookieName);
        if (!pwd || pwd !== password) {
          return handleWrongPwd();
        }
      } else {
        return handleWrongPwd();
      }
    }
    
    const url = new URL(request.url);
    
    // 处理favicon和robots.txt
    if (request.url.endsWith("favicon.ico")) {
      return getRedirect("https://www.baidu.com/favicon.ico");
    }
    if (request.url.endsWith("robots.txt")) {
      return new Response(`User-Agent: *\\nDisallow: /`, { headers: { "Content-Type": "text/plain" }});
    }
    
    const actualUrlStr = url.pathname.substring(url.pathname.indexOf(str) + str.length) + url.search + url.hash;
    
    // 返回主页面如果没有目标URL
    if (actualUrlStr === "") {
      return getHTMLResponse(mainPage);
    }
    
    // 验证URL格式
    try {
      let test = actualUrlStr;
      if (!test.startsWith("http")) test = "https://" + test;
      const u = new URL(test);
      if (!u.host.includes(".")) throw new Error();
    } catch {
      // 尝试使用上次访问的站点
      if (siteCookie) {
        const lastVisit = getCook(siteCookie, lastVisitProxyCookie);
        if (lastVisit) {
          return getRedirect(thisProxyServerUrlHttps + lastVisit + "/" + actualUrlStr);
        }
      }
      return getHTMLResponse("无效的 URL 或无法获取上次访问的站点。");
    }
    
    // 添加协议前缀如果必要
    if (!actualUrlStr.startsWith("http") && !actualUrlStr.includes("://")) {
      return getRedirect(thisProxyServerUrlHttps + "https://" + actualUrlStr);
    }
    
    const actualUrl = new URL(actualUrlStr);

    // 文件扩展名拦截
    const blockExtensions = getCook(siteCookie, blockExtensionsCookieName) || "";
    const extensions = blockExtensions.split(',').map(ext => ext.trim().toLowerCase());
    if (extensions.some(ext => actualUrl.pathname.toLowerCase().endsWith("." + ext))) {
      return new Response(null, { status: 204 });
    }
    
    // 广告拦截
    const blockAds = getCook(siteCookie, blockAdsCookieName) === "true";
    if (blockAds) {
      const urlLower = actualUrlStr.toLowerCase();
      if (adBlockKeywords.some(keyword => urlLower.includes(keyword))) {
        return new Response(null, { status: 204 });
      }
    }

    // 语言和设备设置
    let selectedLanguage = getCook(siteCookie, languageCookieName) || url.searchParams.get('lang') || 'zh-CN';
    if (!supportedLanguages.some(lang => lang.code === selectedLanguage)) selectedLanguage = 'zh-CN';
    const deviceType = getCook(siteCookie, deviceCookieName) || 'none';

    // WebSocket直通
    if (request.headers.get('Upgrade') === 'websocket') {
      const wsRequest = new Request(actualUrl, {
        headers: request.headers,
        method: request.method
      });
      return fetch(wsRequest);
    }

    // 修改请求头
    const clientHeaderWithChange = new Headers();
    for (const [key, value] of request.headers.entries()) {
      let newValue = value.replace(thisProxyServerUrlHttps, actualUrl.origin + '/').replace(thisProxyServerUrl_hostOnly, actualUrl.host);
      if (key.toLowerCase() === 'origin') newValue = actualUrl.origin;
      if (key.toLowerCase() === 'referer') newValue = newValue.replace(thisProxyServerUrlHttps, actualUrl.origin + '/');
      if (key.toLowerCase() === 'accept-language') newValue = selectedLanguage;
      if (key.toLowerCase() === 'user-agent' && deviceType !== 'none') newValue = deviceUserAgents[deviceType];
      clientHeaderWithChange.set(key, newValue);
    }
    if (!clientHeaderWithChange.has('Origin')) clientHeaderWithChange.set('Origin', actualUrl.origin);
    if (!clientHeaderWithChange.has('Accept-Language')) clientHeaderWithChange.set('Accept-Language', selectedLanguage);
    
    // Cookie注入功能
    const cookieInjectionUrl = getCook(siteCookie, `${cookieInjectionCookieName}_URL`);
    const cookieInjectionValue = getCook(siteCookie, `${cookieInjectionCookieName}_VALUE`);
    
    if (cookieInjectionUrl && cookieInjectionValue) {
      const existingCookie = clientHeaderWithChange.get('Cookie') || '';
      clientHeaderWithChange.set('Cookie', existingCookie + (existingCookie ? '; ' : '') + cookieInjectionValue);
    }
    
    // 自定义头部
    const customHeaders = getCook(siteCookie, customHeadersCookieName) || '';
    if (customHeaders) {
      customHeaders.split('\\n').forEach(header => {
        const [key, val] = header.split(':').map(s => s.trim());
        if (key && val) clientHeaderWithChange.set(key, val);
      });
    }

    // 修改请求体
    let clientRequestBodyWithChange;
    if (request.body) {
      const text = await request.text();
      clientRequestBodyWithChange = text
        .replaceAll(thisProxyServerUrlHttps, actualUrl.origin + '/')
        .replaceAll(thisProxyServerUrl_hostOnly, actualUrl.host);
    }

    const modifiedRequest = new Request(actualUrl, {
      headers: clientHeaderWithChange,
      method: request.method,
      body: request.body ? clientRequestBodyWithChange : request.body,
      redirect: "manual" // 不自动跟踪重定向
    });

    const response = await fetch(modifiedRequest);
    
    // 处理重定向
    if (response.status.toString().startsWith("3") && response.headers.get("Location")) {
      try {
        let locationHeader = response.headers.get("Location");
        let finalRedirectUrl;

        if (locationHeader.startsWith(thisProxyServerUrlHttps)) {
          finalRedirectUrl = locationHeader;
        } else {
          let resolvedOriginalUrl = new URL(locationHeader, actualUrlStr).href;
          finalRedirectUrl = thisProxyServerUrlHttps + resolvedOriginalUrl;
        }

        // 避免重定向到无效的 about:blank
        if (finalRedirectUrl.includes('about:blank')) {
          throw new Error('无效的重定向目标: about:blank');
        }

        return getRedirect(finalRedirectUrl);

      } catch (e) {
        return getHTMLResponse(`处理重定向时出错: ${e.message}<br>原始Location头: ${response.headers.get("Location")}`);
      }
    }

    // 处理响应
    let modifiedResponse;
    let bd;
    const responseContentType = response.headers.get("Content-Type") || '';
    const hasProxyHintCook = getCook(siteCookie, proxyHintCookieName) === "agreed";
    
    if (response.body && responseContentType.startsWith("text/")) {
      bd = await response.text();
      
      // 重写绝对链接
      let regex = new RegExp(`(?<!src="|href=")(https?:\\/\\/[^\\s'"]+)`, 'g');
      bd = bd.replace(regex, match => {
        return match.includes("http") ? thisProxyServerUrlHttps + match : thisProxyServerUrl_hostOnly + "/" + match;
      });
      
      if (responseContentType.includes("html") || responseContentType.includes("javascript")) {
        bd = bd.replace(/window\\.location/g, "window." + replaceUrlObj);
        bd = bd.replace(/document\\.location/g, "document." + replaceUrlObj);
      }
      
      if (responseContentType.includes("text/html") && bd.includes("<html")) {
        bd = covToAbs(bd, actualUrlStr);
        bd = removeIntegrityAttributes(bd);
        if (bd.charCodeAt(0) === 0xFEFF) {
          bd = bd.substring(1);
        }
        const inject = `
        <!DOCTYPE html>
        <script id="${injectedJsId}">
        ${disguiseInjection}
        ${blockElementsInjection}
        ${httpRequestInjection}
        </script>
        `;
        bd = inject + bd;
      }
      modifiedResponse = new Response(bd, response);
    } else {
      modifiedResponse = new Response(response.body, response);
    }

    // 处理响应中的cookie
    let headers = modifiedResponse.headers;
    let cookieHeaders = [];
    for (let [key, value] of headers.entries()) {
      if (key.toLowerCase() === 'set-cookie') {
        cookieHeaders.push({ headerName: key, headerValue: value });
      }
    }
    
    if (cookieHeaders.length > 0) {
      cookieHeaders.forEach(cookieHeader => {
        let cookies = cookieHeader.headerValue.split(',').map(cookie => cookie.trim());
        for (let i = 0; i < cookies.length; i++) {
          let parts = cookies[i].split(';').map(part => part.trim());
          // 修改路径
          let pathIndex = parts.findIndex(part => part.toLowerCase().startsWith('path='));
          let originalPath = pathIndex !== -1 ? parts[pathIndex].substring("path=".length) : null;
          let absolutePath = "/" + new URL(originalPath || '/', actualUrlStr).href;
          if (pathIndex !== -1) parts[pathIndex] = `Path=${absolutePath}`;
          else parts.push(`Path=${absolutePath}`);
          // 修改域名
          let domainIndex = parts.findIndex(part => part.toLowerCase().startsWith('domain='));
          if (domainIndex !== -1) parts[domainIndex] = `domain=${thisProxyServerUrl_hostOnly}`;
          else parts.push(`domain=${thisProxyServerUrl_hostOnly}`);
          
          // 确保添加 Secure 和 SameSite=Lax
          if (!parts.some(p => p.toLowerCase().startsWith('secure'))) parts.push('Secure');
          if (!parts.some(p => p.toLowerCase().startsWith('samesite='))) parts.push('SameSite=Lax');

          cookies[i] = parts.join('; ');
        }
        headers.set(cookieHeader.headerName, cookies.join(', '));
      });
    }
    
    // 添加上次访问和语言cookie
    if (responseContentType.includes("text/html") && response.status === 200 && bd && bd.includes("<html")) {
      headers.append("Set-Cookie", `${lastVisitProxyCookie}=${actualUrl.origin}; Path=/; Domain=${thisProxyServerUrl_hostOnly}; Secure; SameSite=Lax`);
      headers.append("Set-Cookie", `${languageCookieName}=${selectedLanguage}; Path=/; Domain=${thisProxyServerUrl_hostOnly}; Secure; SameSite=Lax`);
    }
    
    // 设置CORS和安全性头
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    modifiedResponse.headers.set("X-Frame-Options", "ALLOWALL");
    // 移除可能导致问题的安全性头部
    const forbiddenHeaders = ["Content-Length", "Content-Security-Policy", "Permissions-Policy", "Cross-Origin-Embedder-Policy", "Cross-Origin-Resource-Policy", "X-Content-Security-Policy", "X-WebKit-CSP", "X-Permitted-Cross-Domain-Policies"];
    forbiddenHeaders.forEach(hdr => {
      modifiedResponse.headers.delete(hdr);
      modifiedResponse.headers.delete(hdr + "-Report-Only");
    });
    
    return modifiedResponse;
  } catch (e) {
    return getHTMLResponse(`请求处理失败: ${e.message}`);
  }
}

// 工具函数
function escapeRegExp(string) {
  return string.replace(/[.*+\\-?^${}()|[\]\\]/g, '\\$&');
}

function getCook(cookies, cookiename) {
  const cookiestring = RegExp(escapeRegExp(cookiename) + "=[^;]+").exec(cookies);
  return decodeURIComponent(cookiestring ? cookiestring.toString().replace(/^[^=]+./, "") : "");
}

function covToAbs(body, requestPathNow) {
  const matchList = [[/href=("|')([^"']*)("|')/g, `href="`], [/src=("|')([^"']*)("|')/g, `src="`]];
  let original = [], target = [];
  for (const match of matchList) {
    const iterator = body.matchAll(match[0]);
    if (iterator) {
      for (const replace of iterator) {
        if (!replace.length) continue;
        const strReplace = replace[0];
        if (!strReplace.includes(thisProxyServerUrl_hostOnly)) {
          if (!isPosEmbed(body, replace.index)) {
            const relativePath = strReplace.substring(match[1].toString().length, strReplace.length - 1);
            // 增加 blob: 协议跳过
            if (!relativePath.startsWith("data:") && !relativePath.startsWith("mailto:") && !relativePath.startsWith("javascript:") && !relativePath.startsWith("chrome") && !relativePath.startsWith("edge") && !relativePath.startsWith("blob:")) {
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
  let modifiedBody = body.replace(/integrity=("|')([^"']*)("|')/g, '');
  // 移除 HTML 中的 Content-Security-Policy meta 标签
  modifiedBody = modifiedBody.replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '');
  return modifiedBody;
}

function isPosEmbed(html, pos) {
  if (pos > html.length || pos < 0) return false;
  let start = html.lastIndexOf('<', pos);
  if (start === -1) start = 0;
  let end = html.indexOf('>', pos);
  if (end === -1) end = html.length;
  const content = html.slice(start + 1, end);
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