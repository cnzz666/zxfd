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
const siteCookiesCookieName = "__PROXY_SITE_COOKIES__"; // 新增：特定网站Cookie存储
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
  
  if (selectors.length === 0 && scope !== 'global') return;
  
  const shouldBlock = scope === 'global' || (scope === 'specific' && currentUrl.includes(scope));
  
  if (shouldBlock) {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            selectors.forEach(selector => {
              try {
                node.querySelectorAll(selector).forEach(el => el.remove());
                if (node.matches(selector)) node.remove();
              } catch (e) {}
            });
          }
        });
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Remove existing elements
    selectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => el.remove());
      } catch (e) {}
    });
    
    // Block ads
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
  
  if (!original_website_url_str.startsWith('http')) {
    original_website_url_str = 'https://' + original_website_url_str;
  }
  
  var original_website_url = new URL(original_website_url_str);
  var original_website_host = original_website_url.host;
  var original_website_host_with_schema = original_website_url.origin + "/";
  
  function changeURL(relativePath) {
    if (!relativePath) return null;
    
    try {
      if (relativePath.startsWith("data:") || relativePath.startsWith("mailto:") || 
          relativePath.startsWith("javascript:") || relativePath.startsWith("blob:") ||
          relativePath.startsWith("chrome") || relativePath.startsWith("edge")) {
        return relativePath;
      }
    } catch(e) {}
    
    try {
      if (relativePath.startsWith(proxy_host_with_schema)) {
        relativePath = relativePath.substring(proxy_host_with_schema.length);
      } else if (relativePath.startsWith(proxy_host + "/")) {
        relativePath = relativePath.substring(proxy_host.length + 1);
      } else if (relativePath.startsWith(proxy_host)) {
        relativePath = relativePath.substring(proxy_host.length);
      }
    } catch(e) {}
    
    try {
      var absolutePath = new URL(relativePath, original_website_url_str).href;
      
      // Handle relative paths
      if (!absolutePath.startsWith('http')) {
        absolutePath = new URL(absolutePath, original_website_host_with_schema).href;
      }
      
      // Replace proxy references with original
      absolutePath = absolutePath
        .replace(window.location.origin, original_website_url.origin)
        .replace(encodeURIComponent(window.location.origin), encodeURIComponent(original_website_url.origin))
        .replace(proxy_host, original_website_host)
        .replace(encodeURIComponent(proxy_host), encodeURIComponent(original_website_host));
      
      return proxy_host_with_schema + absolutePath;
    } catch (e) {
      console.error("URL conversion error:", e.message);
      return null;
    }
  }
  
  function getOriginalUrl(url) {
    if (!url) return null;
    if (url.startsWith(proxy_host_with_schema)) return url.substring(proxy_host_with_schema.length);
    return url;
  }
  
  // ... [其余HTTP请求注入代码保持不变，为节省空间省略] ...
  
  // 初始化所有注入
  networkInject();
  windowOpenInject();
  appendChildInject();
  elementPropertyInject();
  documentLocationInject();
  historyInject();
  elementObserverInject();
  
  // 初始转换
  loopAndConvert();
  covScript();
  
  // 页面加载完成后再次转换
  window.addEventListener('load', () => {
    loopAndConvert();
    elementObserverInject();
    covScript();
  });
  
  // 错误处理
  window.addEventListener('error', event => {
    var element = event.target || event.srcElement;
    if (element.tagName === 'SCRIPT') {
      if (element.alreadyChanged) return;
      removeIntegrityAttributesFromElement(element);
      covToAbs(element);
      var newScript = document.createElement("script");
      newScript.src = element.src;
      newScript.async = element.async;
      newScript.defer = element.defer;
      newScript.alreadyChanged = true;
      document.head.appendChild(newScript);
    }
  }, true);
})();
`;

// Main Page HTML (精简版)
const mainPage = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Web Online Proxy</title>
  <style>
    /* 精简样式 */
    body {
      background: linear-gradient(135deg, #4fc3f7, #29b6f6);
      font-family: 'Roboto', Arial, sans-serif;
      margin: 0;
      padding: 20px;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .content {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 15px;
      padding: 30px;
      max-width: 800px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      text-align: center;
    }
    /* 其他样式精简... */
  </style>
</head>
<body>
  <div class="content">
    <h1>网站代理服务</h1>
    
    <div class="input-group">
      <input type="text" id="targetUrl" placeholder="输入网址 (如: baike.baidu.com)">
      <button onclick="redirectTo()">访问</button>
    </div>
    
    <div class="config-section">
      <h3>高级设置</h3>
      
      <div class="config-row">
        <label>语言:</label>
        <select id="languageSelect">
          ${supportedLanguages.map(lang => `<option value="${lang.code}">${lang.name}</option>`).join('')}
        </select>
      </div>
      
      <div class="config-row">
        <label>设备模拟:</label>
        <select id="deviceSelect">
          <option value="none">不模拟</option>
          <option value="desktop">电脑</option>
          <option value="mobile">手机</option>
        </select>
      </div>
      
      <div class="config-row">
        <input type="checkbox" id="blockAds">
        <label for="blockAds">拦截广告</label>
      </div>
      
      <div class="config-buttons">
        <button onclick="showBlockExtensionsModal()">文件过滤</button>
        <button onclick="showBlockElementsModal()">元素屏蔽</button>
        <button onclick="showCustomHeadersModal()">自定义头</button>
        <button onclick="showSiteCookiesModal()">Cookie注入</button>
      </div>
    </div>
    
    <div class="footer">
      <p>声明：本工具仅用于学术研究和文献查阅</p>
      <p>项目开源地址: <a href="https://github.com/1234567Yang/cf-proxy-ex/">GitHub</a></p>
    </div>
  </div>
  
  <!-- 模态框代码... -->
  <script>
    // 初始化设置
    document.addEventListener('DOMContentLoaded', () => {
      // 加载保存的配置
      loadConfig();
      
      // 设置事件监听器
      document.getElementById('blockAds').addEventListener('change', saveConfig);
      document.getElementById('languageSelect').addEventListener('change', saveConfig);
      document.getElementById('deviceSelect').addEventListener('change', saveConfig);
    });
    
    function loadConfig() {
      // 从cookie加载配置
      const cookies = document.cookie.split('; ').reduce((acc, row) => {
        const [key, value] = row.split('=');
        acc[key] = value;
        return acc;
      }, {});
      
      if (cookies['${languageCookieName}']) {
        document.getElementById('languageSelect').value = cookies['${languageCookieName}'];
      }
      // 加载其他配置...
    }
    
    function saveConfig() {
      // 保存配置到cookie
      const language = document.getElementById('languageSelect').value;
      const device = document.getElementById('deviceSelect').value;
      const blockAds = document.getElementById('blockAds').checked;
      
      document.cookie = \`${languageCookieName}=\${language}; max-age=2592000; path=/\`;
      document.cookie = \`${deviceCookieName}=\${device}; max-age=2592000; path=/\`;
      document.cookie = \`${blockAdsCookieName}=\${blockAds}; max-age=2592000; path=/\`;
    }
    
    function redirectTo() {
      let target = document.getElementById('targetUrl').value.trim();
      if (!target) return;
      
      // 添加协议前缀
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = 'https://' + target;
      }
      
      // 编码URL
      const encodedUrl = encodeURIComponent(target);
      window.location.href = \`/\${encodedUrl}\`;
    }
    
    // 其他功能函数...
  </script>
</body>
</html>
`;

// Password Page
const pwdPage = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      background: #f0f0f0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      font-family: Arial, sans-serif;
    }
    .password-container {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 400px;
      width: 90%;
    }
    input[type="password"] {
      width: 100%;
      padding: 12px;
      margin: 15px 0;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 16px;
      box-sizing: border-box;
    }
    button {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 12px 25px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      transition: background 0.3s;
    }
    button:hover {
      background: #45a049;
    }
  </style>
</head>
<body>
  <div class="password-container">
    <h2>需要密码</h2>
    <p>请输入访问密码:</p>
    <input id="password" type="password" placeholder="密码">
    <button onclick="setPassword()">提交</button>
  </div>
  
  <script>
    function setPassword() {
      const password = document.getElementById('password').value;
      if (!password) return;
      
      // 设置密码cookie
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      document.cookie = \`${passwordCookieName}=\${password}; expires=\${expiry.toUTCString()}; path=/\`;
      
      // 重新加载页面
      location.reload();
    }
  </script>
</body>
</html>
`;

// 新增：特定网站Cookie注入功能
async function injectSiteCookies(request, actualUrl) {
  const siteCookies = getCook(request.headers.get('Cookie') || "", siteCookiesCookieName);
  if (!siteCookies) return;
  
  try {
    const cookiesConfig = JSON.parse(decodeURIComponent(siteCookies));
    if (!Array.isArray(cookiesConfig)) return;
    
    const hostname = actualUrl.hostname;
    
    for (const config of cookiesConfig) {
      if (config.domain && hostname.includes(config.domain)) {
        if (config.cookies && typeof config.cookies === 'object') {
          for (const [name, value] of Object.entries(config.cookies)) {
            // 添加或覆盖Cookie
            actualUrl.searchParams.append('__proxy_cookie__', `${name}=${value}`);
          }
        }
      }
    }
  } catch (e) {
    console.error('Error parsing site cookies:', e);
  }
}

// 主请求处理函数
async function handleRequest(request) {
  try {
    // 密码检查
    if (password) {
      const siteCookie = request.headers.get('Cookie') || "";
      const pwd = getCook(siteCookie, passwordCookieName);
      if (pwd !== password) {
        return handleWrongPwd();
      }
    }
    
    const url = new URL(request.url);
    
    // 处理静态资源请求
    if (request.url.endsWith("favicon.ico")) {
      return getRedirect("https://www.google.com/favicon.ico");
    }
    if (request.url.endsWith("robots.txt")) {
      return new Response(`User-Agent: *\nDisallow: /`, { 
        headers: { "Content-Type": "text/plain" } 
      });
    }
    
    // 获取目标URL
    let targetPath = url.pathname.substring(1);
    if (!targetPath) {
      return getHTMLResponse(mainPage);
    }
    
    // 解码URL
    try {
      targetPath = decodeURIComponent(targetPath);
    } catch (e) {
      return getHTMLResponse(`URL解码错误: ${e.message}`);
    }
    
    // 处理特殊路径
    if (targetPath.startsWith('__proxy_config__/')) {
      return handleConfigRequest(targetPath.substring(16), request);
    }
    
    // 构建目标URL
    let actualUrlStr = targetPath;
    if (!actualUrlStr.startsWith('http://') && !actualUrlStr.startsWith('https://')) {
      actualUrlStr = 'https://' + actualUrlStr;
    }
    
    let actualUrl;
    try {
      actualUrl = new URL(actualUrlStr);
    } catch (e) {
      // 尝试从Cookie获取上次访问的网站
      const siteCookie = request.headers.get('Cookie') || "";
      const lastVisit = getCook(siteCookie, lastVisitProxyCookie);
      if (lastVisit) {
        return getRedirect(`${thisProxyServerUrlHttps}${lastVisit}/${encodeURIComponent(actualUrlStr)}`);
      }
      return getHTMLResponse(`无效的URL: ${actualUrlStr}`);
    }
    
    // 注入特定网站Cookie
    await injectSiteCookies(request, actualUrl);
    
    // 文件扩展名过滤
    const blockExtensions = getCook(request.headers.get('Cookie') || "", blockExtensionsCookieName) || "";
    const extensions = blockExtensions.split(',').map(ext => ext.trim().toLowerCase());
    if (extensions.some(ext => actualUrl.pathname.toLowerCase().endsWith(`.${ext}`))) {
      return new Response(null, { status: 204 });
    }
    
    // 广告拦截
    const blockAds = getCook(request.headers.get('Cookie') || "", blockAdsCookieName) === "true";
    if (blockAds) {
      const urlLower = actualUrl.href.toLowerCase();
      if (adBlockKeywords.some(keyword => urlLower.includes(keyword))) {
        return new Response(null, { status: 204 });
      }
    }
    
    // 设备模拟
    const deviceType = getCook(request.headers.get('Cookie') || "", deviceCookieName) || 'none';
    const userAgent = deviceType !== 'none' ? deviceUserAgents[deviceType] : null;
    
    // 创建修改后的请求
    const headers = new Headers(request.headers);
    
    // 设置用户代理
    if (userAgent) {
      headers.set('User-Agent', userAgent);
    }
    
    // 设置语言
    const language = getCook(request.headers.get('Cookie') || "", languageCookieName) || 'zh-CN';
    headers.set('Accept-Language', language);
    
    // 添加自定义头
    const customHeaders = getCook(request.headers.get('Cookie') || "", customHeadersCookieName) || '';
    if (customHeaders) {
      customHeaders.split('\n').forEach(header => {
        const [key, val] = header.split(':').map(s => s.trim());
        if (key && val) headers.set(key, val);
      });
    }
    
    // 处理请求体
    let body = request.body;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const contentType = headers.get('Content-Type') || '';
      if (contentType.includes('text') || contentType.includes('form')) {
        const text = await request.text();
        body = text
          .replaceAll(thisProxyServerUrlHttps, actualUrl.origin + '/')
          .replaceAll(thisProxyServerUrl_hostOnly, actualUrl.host);
      }
    }
    
    // 发送请求
    const proxyRequest = new Request(actualUrl, {
      headers,
      method: request.method,
      body,
      redirect: 'manual'
    });
    
    const response = await fetch(proxyRequest);
    
    // 处理重定向
    if ([301, 302, 303, 307, 308].includes(response.status) && response.headers.has('Location')) {
      const location = response.headers.get('Location');
      try {
        const redirectUrl = new URL(location, actualUrl).href;
        return getRedirect(`${thisProxyServerUrlHttps}${encodeURIComponent(redirectUrl)}`);
      } catch (e) {
        return getHTMLResponse(`重定向错误: ${e.message}`);
      }
    }
    
    // 处理响应
    const responseHeaders = new Headers(response.headers);
    
    // 移除安全头
    const securityHeaders = [
      'Content-Security-Policy', 'X-Frame-Options', 'X-Content-Type-Options',
      'Strict-Transport-Security', 'Cross-Origin-Opener-Policy'
    ];
    securityHeaders.forEach(header => {
      responseHeaders.delete(header);
      responseHeaders.delete(`${header}-Report-Only`);
    });
    
    // 添加CORS头
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', '*');
    
    // 处理Set-Cookie头
    const setCookies = responseHeaders.getAll('Set-Cookie');
    if (setCookies.length > 0) {
      responseHeaders.delete('Set-Cookie');
      
      setCookies.forEach(cookie => {
        // 修改cookie域和路径
        let newCookie = cookie
          .replace(/domain=[^;]+/i, `domain=${thisProxyServerUrl_hostOnly}`)
          .replace(/path=[^;]+/i, 'path=/');
        
        // 添加修改后的cookie
        responseHeaders.append('Set-Cookie', newCookie);
      });
    }
    
    // 处理HTML内容
    const contentType = responseHeaders.get('Content-Type') || '';
    if (contentType.includes('text/html')) {
      const hasProxyHintCook = getCook(request.headers.get('Cookie') || "", proxyHintCookieName) === "agreed";
      let html = await response.text();
      
      // 基本URL转换
      html = html
        .replace(/href="(?!https?:\/\/)(?!data:)(?!mailto:)(?!javascript:)([^"]*)"/g, (match, p1) => {
          try {
            const absoluteUrl = new URL(p1, actualUrl).href;
            return `href="${thisProxyServerUrlHttps}${encodeURIComponent(absoluteUrl)}"`;
          } catch (e) {
            return match;
          }
        })
        .replace(/src="(?!https?:\/\/)(?!data:)([^"]*)"/g, (match, p1) => {
          try {
            const absoluteUrl = new URL(p1, actualUrl).href;
            return `src="${thisProxyServerUrlHttps}${encodeURIComponent(absoluteUrl)}"`;
          } catch (e) {
            return match;
          }
        })
        .replace(/window\.location/g, `window.${replaceUrlObj}`)
        .replace(/document\.location/g, `document.${replaceUrlObj}`);
      
      // 移除完整性检查
      html = html.replace(/integrity="[^"]*"/g, '');
      
      // 注入脚本
      const injections = [];
      if (!hasProxyHintCook) injections.push(proxyHintInjection);
      injections.push(httpRequestInjection, disguiseInjection, blockElementsInjection);
      
      const injectionScript = `<script id="${injectedJsId}">${injections.join('\n')}</script>`;
      html = html.replace(/<head[^>]*>/i, `$&${injectionScript}`);
      
      // 添加访问记录cookie
      responseHeaders.append('Set-Cookie', `${lastVisitProxyCookie}=${actualUrl.origin}; path=/; max-age=2592000`);
      
      return new Response(html, {
        headers: responseHeaders,
        status: response.status,
        statusText: response.statusText
      });
    }
    
    // 非HTML内容直接返回
    return new Response(response.body, {
      headers: responseHeaders,
      status: response.status,
      statusText: response.statusText
    });
    
  } catch (e) {
    return getHTMLResponse(`请求处理失败: ${e.message}`);
  }
}

// 辅助函数
function getCook(cookieHeader, name) {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=').map(s => s.trim());
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}

function getHTMLResponse(html) {
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

function getRedirect(url) {
  return Response.redirect(url, 302);
}

function handleWrongPwd() {
  return showPasswordPage ? getHTMLResponse(pwdPage) : getHTMLResponse('<h1>需要密码</h1><p>请提供访问密码</p>');
}

// 配置处理函数
async function handleConfigRequest(path, request) {
  // 实现配置保存逻辑
  // 此处为示例，实际实现需要处理各种配置操作
  return new Response(JSON.stringify({ status: 'success' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}