// 事件监听器，处理所有传入的 fetch 请求
addEventListener('fetch', event => {
  try {
    const url = new URL(event.request.url);
    thisProxyServerUrl = `${url.protocol}//${url.hostname}/`;
    thisProxyServerHost = url.host;
    event.respondWith(handleRequest(event.request));
  } catch (e) {
    event.respondWith(getErrorResponse(`请求处理错误: ${e.message}`, 500));
  }
});

// 全局变量定义
const PROXY_PREFIX = "/";
const LAST_VISIT_COOKIE = "__PROXY_LAST_VISIT__";
const PASSWORD_COOKIE = "__PROXY_PASSWORD__";
const HINT_COOKIE = "__PROXY_HINT_ACK__";
const LANGUAGE_COOKIE = "__PROXY_LANGUAGE__";
const DEVICE_COOKIE = "__PROXY_DEVICE__";
const BLOCK_EXT_COOKIE = "__PROXY_BLOCK_EXTENSIONS__";
const BLOCK_ADS_COOKIE = "__PROXY_BLOCK_ADS__";
const BLOCK_ELEMENTS_COOKIE = "__PROXY_BLOCK_ELEMENTS__";
const BLOCK_SCOPE_COOKIE = "__PROXY_BLOCK_SCOPE__";
const CUSTOM_COOKIE = "__PROXY_CUSTOM_COOKIE__";
const PROXY_PASSWORD = ""; // 可配置的密码，空字符串表示无密码
const SHOW_PASSWORD_PAGE = true; // 是否显示密码页面
const INJECTED_JS_ID = "__proxy_injected_js__";
let thisProxyServerUrl;
let thisProxyServerHost;

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

// 设备模拟配置
const deviceUserAgents = {
  desktop: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  mobile: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
};
const deviceLayouts = {
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 375, height: 667 }
};

// 广告屏蔽关键字
const adBlockKeywords = [
  "ads.", "ad.", "advert", "banner", "sponsor", "doubleclick", "googlead", "adserver", "popunder", "interstitial",
  "googlesyndication.com", "adsense.google.com", "admob.com", "adclick.g.doubleclick.net"
];

// 默认屏蔽的扩展名
const defaultBlockedExtensions = [
  ".exe", ".zip", ".rar", ".7z", ".torrent", ".apk", ".dmg", ".iso"
];

// 主页面 HTML（保持与原文档一致）
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
        <option value="none">无</option>
        <option value="desktop">桌面设备</option>
        <option value="mobile">移动设备</option>
      </select>
      <label>屏蔽文件扩展名</label>
      <input type="text" id="blockExtensions" placeholder="输入扩展名，逗号分隔（如 .exe,.zip）">
      <div class="checkbox-container">
        <div class="checkbox-wrapper">
          <input type="checkbox" id="blockAds" checked>
          <div class="checkbox-custom"></div>
        </div>
        <label for="blockAds">屏蔽广告</label>
      </div>
      <label>屏蔽元素选择器</label>
      <input type="text" id="blockElements" placeholder="输入CSS选择器，逗号分隔">
      <label>屏蔽范围</label>
      <select id="blockScope">
        <option value="global">全局</option>
        <option value="specific">特定网站</option>
      </select>
      <label>自定义Cookie注入</label>
      <textarea id="customCookies" placeholder="输入JSON格式的Cookie配置，如：[{&quot;url&quot;:&quot;example.com&quot;,&quot;cookies&quot;:{&quot;key&quot;:&quot;value&quot;}}]"></textarea>
      <button onclick="saveConfig()">保存配置</button>
    </div>
    <a href="https://github.com/1234567Yang/cf-proxy-ex/" target="_blank">查看项目详情</a>
  </div>
  <div class="modal" id="urlModal">
    <div class="modal-content">
      <h2>输入网站地址</h2>
      <input type="text" id="urlInput" placeholder="请输入网站地址（如：baike.baidu.com）">
      <p>请输入有效的网站地址</p>
      <button onclick="visitWebsite()">访问</button>
      <button class="config-button" onclick="closeModal()">取消</button>
    </div>
  </div>
  <div class="modal" id="passwordModal">
    <div class="modal-content">
      <h2>输入密码</h2>
      <input type="password" id="passwordInput" placeholder="请输入密码">
      <p>请输入正确的密码以继续</p>
      <button onclick="verifyPassword()">提交</button>
      <button class="config-button" onclick="closeModal()">取消</button>
    </div>
  </div>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelector('.content').classList.add('loaded');
    });
    function showUrlModal() {
      document.getElementById('urlModal').style.display = 'flex';
    }
    function toggleAdvancedOptions() {
      const section = document.getElementById('advancedOptions');
      section.classList.toggle('active');
    }
    function closeModal() {
      document.getElementById('urlModal').style.display = 'none';
      document.getElementById('passwordModal').style.display = 'none';
    }
    function visitWebsite() {
      const urlInput = document.getElementById('urlInput').value.trim();
      if (!urlInput) {
        alert('请输入有效的网站地址');
        return;
      }
      let formattedUrl = urlInput;
      if (!formattedUrl.match(/^[a-zA-Z]+:\/\//)) {
        formattedUrl = 'https://' + formattedUrl;
      }
      try {
        new URL(formattedUrl);
        window.location.href = window.location.origin + '/' + encodeURIComponent(formattedUrl);
      } catch (e) {
        alert('无效的URL格式');
      }
    }
    function verifyPassword() {
      const password = document.getElementById('passwordInput').value;
      fetch('/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      }).then(response => response.json()).then(data => {
        if (data.success) {
          closeModal();
          const urlInput = document.getElementById('urlInput').value.trim();
          if (urlInput) visitWebsite();
        } else {
          alert('密码错误');
        }
      }).catch(() => alert('密码验证失败'));
    }
    function saveConfig() {
      const config = {
        language: document.getElementById('languageSelect').value,
        device: document.getElementById('deviceSelect').value,
        blockExtensions: document.getElementById('blockExtensions').value,
        blockAds: document.getElementById('blockAds').checked,
        blockElements: document.getElementById('blockElements').value,
        blockScope: document.getElementById('blockScope').value,
        customCookies: document.getElementById('customCookies').value
      };
      fetch('/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      }).then(() => alert('配置已保存')).catch(() => alert('保存配置失败'));
    }
  </script>
</body>
</html>
`;

// 代理提示注入
const proxyHintInjection = `
setTimeout(() => {
  if (document.cookie.includes("${HINT_COOKIE}=agreed")) return;
  const hint = "警告：您当前正在使用网络代理，请勿登录任何网站。单击关闭此提示。详情请见 <a href='https://github.com/1234567Yang/cf-proxy-ex/' style='color: #ffd700;'>https://github.com/1234567Yang/cf-proxy-ex/</a>。";
  const div = document.createElement('div');
  div.id = "__PROXY_HINT_DIV__";
  div.style = "position: fixed; left: 0; top: 0; width: 100%; margin: 0; padding: 0; display: block; z-index: 99999999999999999999999; user-select: none; cursor: pointer;";
  div.innerHTML = \`<span style="position: absolute; width: calc(100% - 20px); min-height: 30px; font-size: 18px; color: yellow; background: rgba(180, 0, 0, 0.9); text-align: center; border-radius: 5px; padding: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">\${hint}</span>\`;
  div.onclick = () => {
    document.cookie = "${HINT_COOKIE}=agreed; path=/; max-age=31536000";
    div.remove();
  };
  const appendHint = () => document.body.insertAdjacentElement('afterbegin', div);
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    appendHint();
  } else {
    document.addEventListener('DOMContentLoaded', appendHint);
  }
}, 5000);
`;

// 伪装注入
const disguiseInjection = `
(function() {
  const now = new URL(window.location.href);
  const proxyBase = now.host;
  const proxyProtocol = now.protocol;
  const proxyPrefix = proxyProtocol + "//" + proxyBase + "/";
  let oriUrlStr = window.location.href.substring(proxyPrefix.length);
  try {
    oriUrlStr = decodeURIComponent(oriUrlStr);
  } catch {}
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
      get: () => ({ brands: [{ brand: "Chromium", version: "120" }], mobile: false, platform: "Windows" })
    });
  }
  const languageCookie = document.cookie.split('; ').find(row => row.startsWith('${LANGUAGE_COOKIE}='));
  const selectedLanguage = languageCookie ? languageCookie.split('=')[1] : 'zh-CN';
  Object.defineProperty(navigator, 'language', { get: () => selectedLanguage });
  Object.defineProperty(navigator, 'languages', { get: () => [selectedLanguage] });
  const deviceCookie = document.cookie.split('; ').find(row => row.startsWith('${DEVICE_COOKIE}='));
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
  const blockElements = document.cookie.split('; ').find(row => row.startsWith('${BLOCK_ELEMENTS_COOKIE}='));
  const blockScope = document.cookie.split('; ').find(row => row.startsWith('${BLOCK_SCOPE_COOKIE}='));
  const selectors = blockElements ? blockElements.split('=')[1].split(',').map(s => s.trim()).filter(s => s) : [];
  const scope = blockScope ? blockScope.split('=')[1] : 'global';
  const currentUrl = window.location.href;
  if (scope === 'global' || (scope === 'specific' && currentUrl.includes(scope))) {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        selectors.forEach(selector => {
          try {
            document.querySelectorAll(selector).forEach(el => el.remove());
          } catch (e) {}
        });
        ${adBlockKeywords.map(keyword => `
          try {
            document.querySelectorAll('[class*="${keyword}"], [id*="${keyword}"]').forEach(el => el.remove());
          } catch (e) {}
        `).join('\n')}
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    selectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => el.remove());
      } catch (e) {}
    });
    ${adBlockKeywords.map(keyword => `
      try {
        document.querySelectorAll('[class*="${keyword}"], [id*="${keyword}"]').forEach(el => el.remove());
      } catch (e) {}
    `).join('\n')}
  }
})();
`;

// 自定义 Cookie 注入
const customCookieInjection = `
(function() {
  const customCookie = document.cookie.split('; ').find(row => row.startsWith('${CUSTOM_COOKIE}='));
  if (!customCookie) return;
  try {
    const cookieConfig = JSON.parse(decodeURIComponent(customCookie.split('=')[1]));
    const currentHost = new URL(window.location.href).host;
    cookieConfig.forEach(config => {
      if (currentHost.includes(config.url)) {
        Object.entries(config.cookies).forEach(([key, value]) => {
          document.cookie = \`\${key}=\${value}; path=/; max-age=31536000\`;
        });
      }
    });
  } catch (e) {
    console.error('自定义Cookie注入失败:', e.message);
  }
})();
`;

// HTTP 请求注入
const httpRequestInjection = `
(function() {
  const nowURL = new URL(window.location.href);
  const proxyHost = nowURL.host;
  const proxyProtocol = nowURL.protocol;
  const proxyPrefix = proxyProtocol + "//" + proxyHost + "/";
  let originalUrlStr = window.location.href.substring(proxyPrefix.length);
  try {
    originalUrlStr = decodeURIComponent(originalUrlStr);
  } catch {}
  const originalUrl = new URL(originalUrlStr);
  const originalHost = originalUrl.host;
  const originalOrigin = originalUrl.origin;
  function changeURL(url) {
    if (!url) return null;
    try {
      if (url.startsWith('data:') || url.startsWith('mailto:') || url.startsWith('javascript:') || url.startsWith('chrome:') || url.startsWith('edge:')) return url;
      if (url.startsWith(proxyPrefix)) url = url.substring(proxyPrefix.length);
      if (url.startsWith(proxyHost + '/')) url = url.substring(proxyHost.length + 1);
      if (url.startsWith(proxyHost)) url = url.substring(proxyHost.length);
      let absoluteUrl = new URL(url, originalUrlStr).href;
      absoluteUrl = absoluteUrl.replace(proxyPrefix, '');
      absoluteUrl = absoluteUrl.replace(encodeURI(proxyPrefix), '');
      absoluteUrl = absoluteUrl.replace(encodeURIComponent(proxyPrefix), '');
      absoluteUrl = absoluteUrl.replace(proxyHost, originalHost);
      absoluteUrl = absoluteUrl.replace(encodeURI(proxyHost), encodeURI(originalHost));
      absoluteUrl = absoluteUrl.replace(encodeURIComponent(proxyHost), encodeURIComponent(originalHost));
      return proxyPrefix + absoluteUrl;
    } catch (e) {
      return null;
    }
  }
  function getOriginalUrl(url) {
    if (!url) return null;
    if (url.startsWith(proxyPrefix)) return url.substring(proxyPrefix.length);
    return url;
  }
  function networkInject() {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalFetch = window.fetch;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      const modifiedUrl = changeURL(url);
      if (!modifiedUrl) return;
      return originalOpen.apply(this, [method, modifiedUrl, async, user, password]);
    };
    window.fetch = function(input, init) {
      let url;
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof Request) {
        url = input.url;
      } else {
        url = input;
      }
      const modifiedUrl = changeURL(url);
      if (!modifiedUrl) return Promise.reject(new Error('无效的URL'));
      if (typeof input === 'string') {
        return originalFetch(modifiedUrl, init);
      } else {
        const newRequest = new Request(modifiedUrl, input);
        return originalFetch(newRequest, init);
      }
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
  function appendChildInject() {
    const originalAppendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function(child) {
      try {
        if (child.src) child.src = changeURL(child.src) || child.src;
        if (child.href) child.href = changeURL(child.href) || child.href;
      } catch {}
      return originalAppendChild.call(this, child);
    };
  }
  function elementPropertyInject() {
    const originalSetAttribute = HTMLElement.prototype.setAttribute;
    HTMLElement.prototype.setAttribute = function(name, value) {
      if (name === 'src' || name === 'href') value = changeURL(value) || value;
      originalSetAttribute.call(this, name, value);
    };
    const originalGetAttribute = HTMLElement.prototype.getAttribute;
    HTMLElement.prototype.getAttribute = function(name) {
      const val = originalGetAttribute.call(this, name);
      if (name === 'href' || name === 'src') return getOriginalUrl(val);
      return val;
    };
    const descriptor = Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, 'href');
    Object.defineProperty(HTMLAnchorElement.prototype, 'href', {
      get: function() {
        const real = descriptor.get.call(this);
        return getOriginalUrl(real);
      },
      set: function(val) {
        descriptor.set.call(this, changeURL(val) || val);
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
      return window.location.href.substring(this.getStrNPosition(window.location.href, '/', 3) + 1);
    }
    reload(forcedReload) { this.originalLocation.reload(forcedReload); }
    replace(url) { this.originalLocation.replace(changeURL(url) || url); }
    assign(url) { this.originalLocation.assign(changeURL(url) || url); }
    get href() { return this.getOriginalHref(); }
    set href(url) { this.originalLocation.href = changeURL(url) || url; }
    get protocol() { return originalUrl.protocol; }
    set protocol(value) {
      originalUrl.protocol = value;
      window.location.href = proxyPrefix + originalUrl.href;
    }
    get host() { return originalUrl.host; }
    set host(value) {
      originalUrl.host = value;
      window.location.href = proxyPrefix + originalUrl.href;
    }
    get hostname() { return originalUrl.hostname; }
    set hostname(value) {
      originalUrl.hostname = value;
      window.location.href = proxyPrefix + originalUrl.href;
    }
    get port() { return originalUrl.port; }
    set port(value) {
      originalUrl.port = value;
      window.location.href = proxyPrefix + originalUrl.href;
    }
    get pathname() { return originalUrl.pathname; }
    set pathname(value) {
      originalUrl.pathname = value;
      window.location.href = proxyPrefix + originalUrl.href;
    }
    get search() { return originalUrl.search; }
    set search(value) {
      originalUrl.search = value;
      window.location.href = proxyPrefix + originalUrl.href;
    }
    get hash() { return originalUrl.hash; }
    set hash(value) {
      originalUrl.hash = value;
      window.location.href = proxyPrefix + originalUrl.href;
    }
  }
  function documentLocationInject() {
    window.document.__defineGetter__('location', function() {
      return new ProxyLocation(window.location);
    });
  }
  function historyInject() {
    const originalPushState = History.prototype.pushState;
    const originalReplaceState = History.prototype.replaceState;
    History.prototype.pushState = function(state, title, url) {
      if (!url) return;
      let modifiedUrl = url;
      if (url.startsWith('/' + originalUrl.href)) modifiedUrl = url.substring(('/' + originalUrl.href).length);
      if (url.startsWith('/' + originalUrl.href.substring(0, originalUrl.href.length - 1))) modifiedUrl = url.substring(('/' + originalUrl.href).length - 1);
      modifiedUrl = changeURL(modifiedUrl) || modifiedUrl;
      return originalPushState.apply(this, [state, title, modifiedUrl]);
    };
    History.prototype.replaceState = function(state, title, url) {
      if (!url) return;
      let modifiedUrl = url;
      if (url.startsWith('/' + originalUrl.href)) modifiedUrl = url.substring(('/' + originalUrl.href).length);
      if (url.startsWith('/' + originalUrl.href.substring(0, originalUrl.href.length - 1))) modifiedUrl = url.substring(('/' + originalUrl.href).length - 1);
      modifiedUrl = changeURL(modifiedUrl) || modifiedUrl;
      return originalReplaceState.apply(this, [state, title, modifiedUrl]);
    };
  }
  function elementObserverInject() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => traverseAndConvert(node));
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  function traverseAndConvert(node) {
    if (!(node instanceof HTMLElement)) return;
    removeIntegrityAttributes(node);
    convertToAbsolute(node);
    node.querySelectorAll('*').forEach(child => {
      removeIntegrityAttributes(child);
      convertToAbsolute(child);
    });
  }
  function convertToAbsolute(element) {
    let attribute = '';
    let value = '';
    if (element.hasAttribute('href')) {
      attribute = 'href';
      value = element.getAttribute('href');
    } else if (element.hasAttribute('src')) {
      attribute = 'src';
      value = element.getAttribute('src');
    }
    if (attribute && value && !value.includes('*') && !value.startsWith(proxyPrefix)) {
      try {
        const absoluteUrl = changeURL(value);
        if (absoluteUrl) element.setAttribute(attribute, absoluteUrl);
      } catch (e) {}
    }
  }
  function removeIntegrityAttributes(element) {
    if (element.hasAttribute('integrity')) {
      element.removeAttribute('integrity');
    }
    if (element.hasAttribute('nonce')) {
      element.removeAttribute('nonce');
    }
  }
  networkInject();
  windowOpenInject();
  appendChildInject();
  elementPropertyInject();
  documentLocationInject();
  historyInject();
  elementObserverInject();
  function loopAndConvert() {
    document.querySelectorAll('*').forEach(element => {
      removeIntegrityAttributes(element);
      convertToAbsolute(element);
    });
  }
  function convertScripts() {
    document.getElementsByTagName('script').forEach(script => {
      removeIntegrityAttributes(script);
      convertToAbsolute(script);
    });
    setTimeout(convertScripts, 3000);
  }
  loopAndConvert();
  convertScripts();
  window.addEventListener('load', () => {
    loopAndConvert();
    elementObserverInject();
    convertScripts();
  });
  window.addEventListener('error', event => {
    const element = event.target || event.srcElement;
    if (element.tagName === 'SCRIPT' && !element.alreadyChanged) {
      removeIntegrityAttributes(element);
      convertToAbsolute(element);
      const newScript = document.createElement('script');
      newScript.src = element.src;
      newScript.async = element.async;
      newScript.defer = element.defer;
      newScript.alreadyChanged = true;
      document.head.appendChild(newScript);
    }
  });
  convertToAbsolute(document.head);
  convertToAbsolute(document.body);
})();
`;

// 错误响应生成
function getErrorResponse(message, status = 500) {
  return new Response(message, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

// HTML 响应生成
function getHTMLResponse(content, headers = {}) {
  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...headers
    }
  });
}

// 获取 Cookie 值
function getCookie(request, name) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = cookieHeader.split('; ').reduce((acc, cookie) => {
    const [key, value] = cookie.split('=');
    acc[key] = value;
    return acc;
  }, {});
  return cookies[name] || '';
}

// 设置 Cookie
function setCookie(headers, name, value, options = {}) {
  const cookie = `${name}=${encodeURIComponent(value)}; Path=/; ${options.maxAge ? `Max-Age=${options.maxAge}; ` : ''}${options.secure ? 'Secure; ' : ''}SameSite=Strict`;
  headers.append('Set-Cookie', cookie);
}

// URL 是否有效
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// 处理请求
async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const originalUrlStr = decodeURIComponent(url.pathname.slice(1) + url.search + url.hash);

  // 处理根路径
  if (path === '/' || path === '') {
    const lastVisit = getCookie(request, LAST_VISIT_COOKIE);
    if (lastVisit && isValidUrl(lastVisit)) {
      return Response.redirect(thisProxyServerUrl + encodeURIComponent(lastVisit), 302);
    }
    return getHTMLResponse(mainPage);
  }

  // 处理密码验证
  if (request.method === 'POST' && path === '/verify-password') {
    try {
      const body = await request.json();
      const inputPassword = body.password || '';
      const isValid = PROXY_PASSWORD === '' || inputPassword === PROXY_PASSWORD;
      return new Response(JSON.stringify({ success: isValid }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch {
      return new Response(JSON.stringify({ success: false }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 处理配置保存
  if (request.method === 'POST' && path === '/save-config') {
    try {
      const body = await request.json();
      const headers = new Headers();
      if (body.language) setCookie(headers, LANGUAGE_COOKIE, body.language, { maxAge: 31536000 });
      if (body.device) setCookie(headers, DEVICE_COOKIE, body.device, { maxAge: 31536000 });
      if (body.blockExtensions) setCookie(headers, BLOCK_EXT_COOKIE, body.blockExtensions, { maxAge: 31536000 });
      setCookie(headers, BLOCK_ADS_COOKIE, body.blockAds ? 'true' : 'false', { maxAge: 31536000 });
      if (body.blockElements) setCookie(headers, BLOCK_ELEMENTS_COOKIE, body.blockElements, { maxAge: 31536000 });
      if (body.blockScope) setCookie(headers, BLOCK_SCOPE_COOKIE, body.blockScope, { maxAge: 31536000 });
      if (body.customCookies) setCookie(headers, CUSTOM_COOKIE, body.customCookies, { maxAge: 31536000 });
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...headers }
      });
    } catch {
      return new Response(JSON.stringify({ success: false }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 检查密码
  if (SHOW_PASSWORD_PAGE && PROXY_PASSWORD && getCookie(request, PASSWORD_COOKIE) !== PROXY_PASSWORD) {
    return getHTMLResponse(mainPage);
  }

  // 验证目标 URL
  if (!isValidUrl(originalUrlStr)) {
    return getErrorResponse('无效的目标URL', 400);
  }

  const originalUrl = new URL(originalUrlStr);
  const headers = new Headers(request.headers);

  // 设置设备模拟
  const deviceType = getCookie(request, DEVICE_COOKIE);
  if (deviceType && deviceUserAgents[deviceType]) {
    headers.set('User-Agent', deviceUserAgents[deviceType]);
  }

  // 检查屏蔽扩展名
  const blockExtensions = getCookie(request, BLOCK_EXT_COOKIE) || defaultBlockedExtensions.join(',');
  const extensions = blockExtensions.split(',').map(ext => ext.trim().toLowerCase());
  const pathLower = originalUrl.pathname.toLowerCase();
  if (extensions.some(ext => pathLower.endsWith(ext))) {
    return getErrorResponse('请求的文件类型被屏蔽', 403);
  }

  // 设置自定义 Cookie
  const customCookie = getCookie(request, CUSTOM_COOKIE);
  if (customCookie) {
    try {
      const cookieConfig = JSON.parse(decodeURIComponent(customCookie));
      cookieConfig.forEach(config => {
        if (originalUrl.host.includes(config.url)) {
          Object.entries(config.cookies).forEach(([key, value]) => {
            setCookie(headers, key, value, { maxAge: 31536000 });
          });
        }
      });
    } catch (e) {
      console.error('自定义Cookie解析失败:', e.message);
    }
  }

  // 设置上次访问的 Cookie
  const responseHeaders = new Headers();
  setCookie(responseHeaders, LAST_VISIT_COOKIE, originalUrlStr, { maxAge: 31536000 });

  // 发起代理请求
  try {
    const response = await fetch(originalUrl, {
      method: request.method,
      headers,
      body: request.body,
      redirect: 'follow'
    });

    const contentType = response.headers.get('Content-Type') || '';
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    newHeaders.delete('Content-Security-Policy');
    newHeaders.delete('Content-Security-Policy-Report-Only');

    // 处理二进制内容（如视频）
    if (contentType.includes('video') || contentType.includes('audio') || contentType.includes('image')) {
      return new Response(response.body, {
        status: response.status,
        headers: newHeaders
      });
    }

    // 处理 HTML 内容
    if (contentType.includes('html')) {
      let body = await response.text();
      body = body.replace(/(src|href)="\/([^"]*)"/g, `$1="${thisProxyServerUrl}$2"`);
      body = body.replace(/(src|href)="([^"]*)"/g, (match, attr, value) => {
        if (value.startsWith('http') || value.startsWith('data:') || value.startsWith('mailto:') || value.startsWith('javascript:')) {
          return match;
        }
        try {
          const absoluteUrl = new URL(value, originalUrl).href;
          return `${attr}="${thisProxyServerUrl}${encodeURIComponent(absoluteUrl)}"`;
        } catch {
          return match;
        }
      });

      // 注入脚本
      const scripts = [
        proxyHintInjection,
        disguiseInjection,
        blockElementsInjection,
        customCookieInjection,
        httpRequestInjection
      ].map(script => `<script id="${INJECTED_JS_ID}">${script}</script>`).join('\n');
      body = body.replace('</head>', `${scripts}</head>`);

      return new Response(body, {
        status: response.status,
        headers: { ...newHeaders, ...responseHeaders }
      });
    }

    // 处理其他文本内容
    if (contentType.includes('text') || contentType.includes('javascript') || contentType.includes('css')) {
      let body = await response.text();
      if (contentType.includes('javascript')) {
        body = body.replace(/(['"])\/([^'"]*?)['"]/g, `$1${thisProxyServerUrl}$2$1`);
      } else if (contentType.includes('css')) {
        body = body.replace(/url\((['"]?)(\/[^)]*?)\1\)/g, `url($1${thisProxyServerUrl}$2$1)`);
      }
      return new Response(body, {
        status: response.status,
        headers: { ...newHeaders, ...responseHeaders }
      });
    }

    // 默认处理
    return new Response(response.body, {
      status: response.status,
      headers: { ...newHeaders, ...responseHeaders }
    });
  } catch (e) {
    return getErrorResponse(`代理请求失败: ${e.message}`, 502);
  }
}