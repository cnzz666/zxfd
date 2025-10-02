// =======================================================================================
// 第一部分：事件监听和全局变量定义
// 功能：设置fetch事件监听器，初始化代理服务器URL变量
// =======================================================================================

addEventListener('fetch', event => {
  try {
    const url = new URL(event.request.url);
    thisProxyServerUrlHttps = `${url.protocol}//${url.hostname}/`;
    thisProxyServerUrl_hostOnly = url.host;
    event.respondWith(handleRequest(event.request));
  } catch (e) {
    event.respondWith(getHTMLResponse(`错误: ${e.message}`));
  }
});

// =======================================================================================
// 第二部分：常量定义
// 功能：定义项目中使用的所有常量和配置变量
// =======================================================================================

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
const cookieInjectionDataName = "__PROXY_COOKIE_INJECTION__";
const adBlockStatsCookieName = "__PROXY_ADBLOCK_STATS__";
const resourceSnifferCookieName = "__PROXY_RESOURCE_SNIFFER__";
const imageModeCookieName = "__PROXY_IMAGE_MODE__";

const password = ""; // 设置密码，若为空则不启用
const showPasswordPage = true;
const replaceUrlObj = "__location_yproxy__";
const injectedJsId = "__yproxy_injected_js_id__";

let thisProxyServerUrlHttps;
let thisProxyServerUrl_hostOnly;

// =======================================================================================
// 第三部分：配置数据
// 功能：定义支持的语言、设备、广告拦截规则等
// =======================================================================================

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
  mobile: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  android: "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  androidTablet: "Mozilla/5.0 (Linux; Android 10; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  windowsIE: "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko",
  macos: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  ipad: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  symbian: "Mozilla/5.0 (Symbian/3; Series60/5.2 NokiaN8-00/012.002; Profile/MIDP-2.1 Configuration/CLDC-1.1 ) AppleWebKit/533.4 (KHTML, like Gecko) NokiaBrowser/7.3.0 Mobile Safari/533.4"
};

const deviceLayouts = {
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 375, height: 667 },
  android: { width: 360, height: 740 },
  androidTablet: { width: 1024, height: 600 },
  windowsIE: { width: 1920, height: 1080 },
  macos: { width: 1440, height: 900 },
  ipad: { width: 768, height: 1024 },
  symbian: { width: 360, height: 640 }
};

// 广告拦截关键词
const adBlockKeywords = [
  "ads.", "ad.", "advert", "banner", "sponsor", "doubleclick", "googlead", "adserver", "popunder", "interstitial",
  "googlesyndication.com", "adsense.google.com", "admob.com", "adclick.g.doubleclick.net"
];

// 广告拦截规则订阅
const adBlockSubscriptions = [
  { name: "EasyList", url: "https://easylist-downloads.adblockplus.org/easylist.txt" },
  { name: "EasyList China", url: "https://easylist-downloads.adblockplus.org/easylistchina.txt" },
  { name: "CJX Annoyance", url: "https://fastly.jsdelivr.net/gh/cjx82630/cjxlist/cjx-annoyance.txt" },
  { name: "EasyPrivacy", url: "https://easylist-downloads.adblockplus.org/easyprivacy.txt" },
  { name: "Anti-Adblock", url: "https://easylist-downloads.adblockplus.org/antiadblockfilters.txt" }
];

// =======================================================================================
// 第四部分：注入脚本
// 功能：各种客户端注入脚本
// =======================================================================================

// 代理提示注入
const proxyHintInjection = `
setTimeout(() => {
  if (document.cookie.includes("${proxyHintCookieName}=agreed")) return;
  
  const hintModal = document.createElement('div');
  hintModal.id = "__PROXY_HINT_MODAL__";
  hintModal.style.cssText = \`
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999999999;
    user-select: none;
    opacity: 0;
    transition: opacity 0.5s ease;
  \`;
  
  hintModal.innerHTML = \`
    <div style="
      background: rgba(255,255,255,0.3);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(79,195,247,0.3);
      border: 1px solid rgba(79,195,247,0.3);
      transform: scale(0.8);
      transition: transform 0.5s ease;
      text-align: center;
    ">
      <h3 style="color: #c53030; margin-bottom: 15px;">⚠️ 安全警告 Security Warning</h3>
      <p style="margin-bottom: 20px; line-height: 1.6; color: #333;">
        警告：您当前正在使用网络代理，请勿登录任何网站。详情请见以下链接。
        <br><br>
        Warning: You are currently using a web proxy, so do not log in to any website. 
        For further details, please visit the link below.
      </p>
      <a href="https://github.com/1234567Yang/cf-proxy-ex/" target="_blank" 
         style="color: #0277bd; display: block; margin-bottom: 20px;">
        https://github.com/1234567Yang/cf-proxy-ex/
      </a>
      <div style="display: flex; justify-content: center; gap: 10px;">
        <button onclick="closeHint(false)" style="
          padding: 10px 20px;
          background: linear-gradient(45deg, #4fc3f7, #81d4fa);
          border: none;
          border-radius: 20px;
          color: #333;
          cursor: pointer;
        ">关闭 Close</button>
        <button onclick="closeHint(true)" style="
          padding: 10px 20px;
          background: rgba(255,255,255,0.3);
          border: 1px solid rgba(79,195,247,0.5);
          border-radius: 20px;
          color: #333;
          cursor: pointer;
        ">不再显示 Don't show again</button>
      </div>
    </div>
  \`;
  
  document.body.appendChild(hintModal);
  
  setTimeout(() => {
    hintModal.style.opacity = '1';
    hintModal.querySelector('div').style.transform = 'scale(1)';
  }, 100);
  
  function closeHint(dontShowAgain) {
    hintModal.style.opacity = '0';
    setTimeout(() => {
      hintModal.remove();
      if(dontShowAgain) {
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (30 * 24 * 60 * 60 * 1000));
        document.cookie = "${proxyHintCookieName}=agreed; expires=" + expiryDate.toUTCString() + "; path=/";
      }
    }, 500);
  }
  
  window.closeHint = closeHint;
}, 1000);
`;

// 工具栏注入
const toolbarInjection = `
// 工具栏功能
function initToolbar() {
  const toolbar = document.createElement('div');
  toolbar.id = '__PROXY_TOOLBAR__';
  toolbar.style.cssText = \`
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999998;
    display: flex;
    flex-direction: column;
    gap: 10px;
  \`;
  
  // 主工具按钮
  const mainBtn = document.createElement('button');
  mainBtn.innerHTML = '🛠️';
  mainBtn.title = '代理工具';
  mainBtn.style.cssText = \`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(45deg, #4fc3f7, #81d4fa);
    border: none;
    color: #333;
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(79,195,247,0.3);
    transition: all 0.3s ease;
  \`;
  
  // 功能按钮容器
  const toolsContainer = document.createElement('div');
  toolsContainer.id = '__PROXY_TOOLS_CONTAINER__';
  toolsContainer.style.cssText = \`
    display: none;
    flex-direction: column;
    gap: 10px;
  \`;
  
  // Cookie注入按钮
  const cookieBtn = createToolButton('🍪', 'Cookie注入', showCookieModal);
  // 广告拦截按钮
  const adblockBtn = createToolButton('🛡️', '广告拦截', showAdBlockModal);
  // 资源嗅探按钮
  const snifferBtn = createToolButton('🔍', '资源嗅探', showSnifferModal);
  // 设置按钮
  const settingsBtn = createToolButton('⚙️', '设置', showSettingsModal);
  
  toolsContainer.appendChild(cookieBtn);
  toolsContainer.appendChild(adblockBtn);
  toolsContainer.appendChild(snifferBtn);
  toolsContainer.appendChild(settingsBtn);
  
  toolbar.appendChild(toolsContainer);
  toolbar.appendChild(mainBtn);
  document.body.appendChild(toolbar);
  
  // 点击主按钮切换工具显示
  mainBtn.addEventListener('click', () => {
    const isVisible = toolsContainer.style.display === 'flex';
    toolsContainer.style.display = isVisible ? 'none' : 'flex';
    mainBtn.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(45deg)';
  });
  
  // 点击其他地方关闭工具
  document.addEventListener('click', (e) => {
    if (!toolbar.contains(e.target)) {
      toolsContainer.style.display = 'none';
      mainBtn.style.transform = 'rotate(0deg)';
    }
  });
}

function createToolButton(emoji, title, onClick) {
  const btn = document.createElement('button');
  btn.innerHTML = emoji;
  btn.title = title;
  btn.style.cssText = \`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(79,195,247,0.5);
    color: #333;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
  \`;
  
  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.1)';
    btn.style.background = 'linear-gradient(45deg, #4fc3f7, #81d4fa)';
  });
  
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)';
    btn.style.background = 'rgba(255,255,255,0.3)';
  });
  
  btn.addEventListener('click', onClick);
  
  return btn;
}

// Cookie注入功能
function showCookieModal() {
  if (document.getElementById('__COOKIE_MODAL__')) return;
  
  const currentUrl = window.location.href;
  const originalUrl = currentUrl.replace(/^[^]+?\\/\\/[^\\/]+\\//, '');
  const domain = new URL(originalUrl).hostname;
  
  const modal = document.createElement('div');
  modal.id = '__COOKIE_MODAL__';
  modal.style.cssText = \`
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999999;
    opacity: 0;
    transition: opacity 0.3s ease;
  \`;
  
  modal.innerHTML = \`
    <div style="
      background: rgba(255,255,255,0.3);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 30px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(79,195,247,0.3);
      border: 1px solid rgba(79,195,247,0.3);
      transform: scale(0.8);
      transition: transform 0.3s ease;
    ">
      <h3 style="color: #0277bd; margin-bottom: 20px; text-align: center;">🍪 Cookie注入</h3>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">注入地址:</label>
        <input type="text" value="\${domain}" readonly style="
          width: 100%;
          padding: 8px;
          border-radius: 8px;
          border: 1px solid rgba(79,195,247,0.5);
          background: rgba(255,255,255,0.5);
          color: #666;
        ">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">输入方式:</label>
        <select id="cookieInputType" style="
          width: 100%;
          padding: 8px;
          border-radius: 8px;
          border: 1px solid rgba(79,195,247,0.5);
          background: rgba(255,255,255,0.5);
        ">
          <option value="combined">合成Cookie输入</option>
          <option value="separate">分别输入</option>
        </select>
      </div>
      
      <div id="combinedCookieInput" style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Cookie字符串:</label>
        <textarea id="combinedCookie" placeholder="例如: name=value; name2=value2" style="
          width: 100%;
          height: 80px;
          padding: 8px;
          border-radius: 8px;
          border: 1px solid rgba(79,195,247,0.5);
          background: rgba(255,255,255,0.5);
          resize: vertical;
        "></textarea>
      </div>
      
      <div id="separateCookieInput" style="display: none; margin-bottom: 15px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 12px;">名称:</label>
            <input type="text" id="cookieName" style="
              width: 100%;
              padding: 6px;
              border-radius: 6px;
              border: 1px solid rgba(79,195,247,0.5);
              background: rgba(255,255,255,0.5);
            ">
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 12px;">值:</label>
            <input type="text" id="cookieValue" style="
              width: 100%;
              padding: 6px;
              border-radius: 6px;
              border: 1px solid rgba(79,195,247,0.5);
              background: rgba(255,255,255,0.5);
            ">
          </div>
        </div>
        <button onclick="addSeparateCookie()" style="
          padding: 6px 12px;
          background: rgba(255,255,255,0.3);
          border: 1px solid rgba(79,195,247,0.5);
          border-radius: 12px;
          color: #333;
          cursor: pointer;
          font-size: 12px;
        ">添加Cookie</button>
        <div id="cookieList" style="
          margin-top: 10px;
          max-height: 100px;
          overflow-y: auto;
          background: rgba(255,255,255,0.2);
          border-radius: 8px;
          padding: 10px;
        "></div>
      </div>
      
      <div style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">
        <button onclick="saveCookieSettings('\${domain}')" style="
          padding: 10px 20px;
          background: linear-gradient(45deg, #4fc3f7, #81d4fa);
          border: none;
          border-radius: 20px;
          color: #333;
          cursor: pointer;
          font-weight: bold;
        ">保存并刷新</button>
        <button onclick="closeModal('__COOKIE_MODAL__')" style="
          padding: 10px 20px;
          background: rgba(255,255,255,0.3);
          border: 1px solid rgba(79,195,247,0.5);
          border-radius: 20px;
          color: #333;
          cursor: pointer;
        ">取消</button>
      </div>
    </div>
  \`;
  
  document.body.appendChild(modal);
  
  setTimeout(() => {
    modal.style.opacity = '1';
    modal.querySelector('div').style.transform = 'scale(1)';
    
    // 加载已保存的设置
    loadCookieSettings(domain);
    
    // 绑定事件
    document.getElementById('cookieInputType').addEventListener('change', function() {
      const type = this.value;
      document.getElementById('combinedCookieInput').style.display = type === 'combined' ? 'block' : 'none';
      document.getElementById('separateCookieInput').style.display = type === 'separate' ? 'block' : 'none';
    });
  }, 100);
}

let separateCookies = [];

function addSeparateCookie() {
  const name = document.getElementById('cookieName').value.trim();
  const value = document.getElementById('cookieValue').value.trim();
  
  if (!name || !value) {
    alert('请填写Cookie名称和值');
    return;
  }
  
  const cookie = { name, value };
  separateCookies.push(cookie);
  updateCookieList();
  
  // 清空输入框
  document.getElementById('cookieName').value = '';
  document.getElementById('cookieValue').value = '';
}

function updateCookieList() {
  const list = document.getElementById('cookieList');
  list.innerHTML = '';
  
  separateCookies.forEach((cookie, index) => {
    const item = document.createElement('div');
    item.style.cssText = \`
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px;
      margin-bottom: 5px;
      background: rgba(255,255,255,0.2);
      border-radius: 5px;
      font-size: 12px;
    \`;
    
    item.innerHTML = \`
      <span>\${cookie.name}=\${cookie.value}</span>
      <button onclick="removeCookie(\${index})" style="
        background: none;
        border: none;
        color: #c53030;
        cursor: pointer;
        font-size: 14px;
      ">×</button>
    \`;
    
    list.appendChild(item);
  });
}

function removeCookie(index) {
  separateCookies.splice(index, 1);
  updateCookieList();
}

function saveCookieSettings(domain) {
  const inputType = document.getElementById('cookieInputType').value;
  let cookies = [];
  
  if (inputType === 'combined') {
    const cookieStr = document.getElementById('combinedCookie').value.trim();
    if (cookieStr) {
      cookieStr.split(';').forEach(pair => {
        const [name, value] = pair.split('=').map(s => s.trim());
        if (name && value) {
          cookies.push({ name, value });
        }
      });
    }
  } else {
    cookies = separateCookies;
  }
  
  const settings = {
    domain,
    inputType,
    cookies,
    timestamp: Date.now()
  };
  
  // 保存到localStorage
  try {
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    allSettings[domain] = settings;
    localStorage.setItem('${cookieInjectionDataName}', JSON.stringify(allSettings));
    
    // 应用Cookie并刷新
    applyCookies(domain, cookies);
    setTimeout(() => location.reload(), 500);
  } catch(e) {
    alert('保存失败: ' + e.message);
  }
}

function loadCookieSettings(domain) {
  try {
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    const settings = allSettings[domain];
    
    if (settings) {
      document.getElementById('cookieInputType').value = settings.inputType || 'combined';
      document.getElementById('cookieInputType').dispatchEvent(new Event('change'));
      
      if (settings.inputType === 'combined' && settings.cookies) {
        const cookieStr = settings.cookies.map(c => \`\${c.name}=\${c.value}\`).join('; ');
        document.getElementById('combinedCookie').value = cookieStr;
      } else if (settings.inputType === 'separate' && settings.cookies) {
        separateCookies = settings.cookies;
        updateCookieList();
      }
    }
  } catch(e) {
    console.log('加载Cookie设置失败:', e);
  }
}

function applyCookies(domain, cookies) {
  cookies.forEach(cookie => {
    document.cookie = \`\${cookie.name}=\${cookie.value}; domain=\${domain}; path=/\`;
  });
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// 广告拦截功能
function showAdBlockModal() {
  // 实现广告拦截弹窗
  console.log('打开广告拦截设置');
}

// 资源嗅探功能
function showSnifferModal() {
  // 实现资源嗅探弹窗
  console.log('打开资源嗅探');
}

// 设置功能
function showSettingsModal() {
  // 实现设置弹窗
  console.log('打开设置');
}

// 初始化工具栏
setTimeout(initToolbar, 2000);
`;

// 伪装注入（绕过检测）
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
  const originalPathname = oriUrl.pathname;
  const originalSearch = oriUrl.search;
  const originalHash = oriUrl.hash;
  const originalHref = oriUrl.href;

  // 修改 document.location 和 window.location
  Object.defineProperty(document, 'location', {
    value: {
      href: originalHref,
      protocol: oriUrl.protocol,
      host: originalHost,
      hostname: oriUrl.hostname,
      port: oriUrl.port,
      pathname: originalPathname,
      search: originalSearch,
      hash: originalHash,
      origin: originalOrigin,
      assign: function(url) { window.location.assign(proxyPrefix + url); },
      reload: function() { window.location.reload(); },
      replace: function(url) { window.location.replace(proxyPrefix + url); },
      toString: function() { return originalHref; }
    },
    writable: false
  });

  Object.defineProperty(window, 'location', {
    value: {
      href: originalHref,
      protocol: oriUrl.protocol,
      host: originalHost,
      hostname: oriUrl.hostname,
      port: oriUrl.port,
      pathname: originalPathname,
      search: originalSearch,
      hash: originalHash,
      origin: originalOrigin,
      assign: function(url) { window.location.assign(proxyPrefix + url); },
      reload: function() { window.location.reload(); },
      replace: function(url) { window.location.replace(proxyPrefix + url); },
      toString: function() { return originalHref; }
    },
    writable: false
  });

  // 修改 document.domain
  Object.defineProperty(document, 'domain', {
    get: () => originalHost,
    set: value => value
  });

  // 修改 window.origin
  Object.defineProperty(window, 'origin', {
    get: () => originalOrigin
  });

  // 修改 document.referrer
  Object.defineProperty(document, 'referrer', {
    get: () => {
      const actualReferrer = document.referrer || '';
      return actualReferrer.startsWith(proxyPrefix) ? actualReferrer.replace(proxyPrefix, '') : actualReferrer;
    }
  });

  // 修改 navigator.userAgentData
  if (navigator.userAgentData) {
    Object.defineProperty(navigator, 'userAgentData', {
      get: () => ({ brands: [{ brand: "Chromium", version: "90" }], mobile: false, platform: "Windows" })
    });
  }

  // 设置语言
  const languageCookie = document.cookie.split('; ').find(row => row.startsWith('${languageCookieName}='));
  const selectedLanguage = languageCookie ? languageCookie.split('=')[1] : 'zh-CN';
  Object.defineProperty(navigator, 'language', { get: () => selectedLanguage });
  Object.defineProperty(navigator, 'languages', { get: () => [selectedLanguage] });

  // 设备模拟
  const deviceCookie = document.cookie.split('; ').find(row => row.startsWith('${deviceCookieName}='));
  const deviceType = deviceCookie ? deviceCookie.split('=')[1] : 'none';
  if (deviceType !== 'none') {
    const layouts = ${JSON.stringify(deviceLayouts)};
    const agents = ${JSON.stringify(deviceUserAgents)};
    const layout = layouts[deviceType] || layouts.desktop;
    const userAgent = agents[deviceType] || agents.desktop;
    
    Object.defineProperty(window, 'innerWidth', { get: () => layout.width });
    Object.defineProperty(window, 'innerHeight', { get: () => layout.height });
    Object.defineProperty(navigator, 'userAgent', { get: () => userAgent });
    
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=' + layout.width + ', initial-scale=1.0';
    document.head.appendChild(meta);
  }
})();
`;

// HTTP请求注入（核心代理功能）
const httpRequestInjection = `
(function() {
  ${disguiseInjection}
  ${toolbarInjection}
})();
`;

// =======================================================================================
// 第五部分：主页面HTML
// 功能：代理服务的主页面
// =======================================================================================

const mainPage = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>网站在线代理</title>
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
      background-image: url('https://www.loliapi.com/acg/');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      position: relative;
      overflow: hidden;
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
      background-position: center;
      filter: blur(8px);
      z-index: -2;
    }
    body::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, rgba(79, 195, 247, 0.2), rgba(176, 196, 222, 0.2));
      z-index: -1;
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
    @media (min-resolution: 2dppx) {
      body {
        background-size: cover;
      }
    }
  </style>
</head>
<body>
  <div class="content">
    <h1>网站在线代理</h1>
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
        ${Object.keys(deviceUserAgents).map(device => `<option value="${device}">${device}</option>`).join('')}
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
      <p id="urlPlaceholder">请输入目标地址（例如：baike.baidu.com）</p>
      <input type="text" id="targetUrl" placeholder="">
      <button onclick="redirectTo()">跳转</button>
      <button class="config-button" onclick="closeUrlModal()">取消</button>
    </div>
  </div>
  <div id="blockExtensionsModal" class="modal">
    <div class="modal-content">
      <h3>配置拦截器</h3>
      <p id="blockExtensionsPlaceholder">请输入需要拦截的文件扩展名（例如：jpg, gif），以逗号分隔符</p>
      <input type="text" id="blockExtensionsInput" placeholder="">
      <button onclick="saveBlockExtensions()">保存</button>
      <button class="config-button" onclick="closeBlockExtensionsModal()">取消</button>
    </div>
  </div>
  <div id="blockElementsModal" class="modal">
    <div class="modal-content">
      <h3>屏蔽元素</h3>
      <p id="blockElementsPlaceholder">请输入需要屏蔽的 CSS 选择器（例如：.ad, #banner），以逗号分隔符</p>
      <input type="text" id="blockElementsInput" placeholder="">
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
      <p>输入自定义 HTTP 头，格式为 key:value，每行一个</p>
      <textarea id="customHeadersInput" placeholder="X-Custom-Header: Value\nAnother-Header: AnotherValue"></textarea>
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
      const updatePlaceholder = (inputId, placeholderId) => {
        const input = document.getElementById(inputId);
        const placeholder = document.getElementById(placeholderId);
        if (input && placeholder) {
          input.addEventListener('input', () => {
            placeholder.style.display = input.value ? 'none' : 'block';
          });
          placeholder.style.display = input.value ? 'none' : 'block';
        }
      };
      updatePlaceholder('blockExtensionsInput', 'blockExtensionsPlaceholder');
      updatePlaceholder('blockElementsInput', 'blockElementsPlaceholder');
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
      const language = document.getElementById('languageSelect').value;
      const currentOrigin = window.location.origin;
      if (targetUrl) {
        let finalUrl = currentOrigin + '/' + (targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl);
        if (language) finalUrl += finalUrl.includes('?') ? '&lang=' + language : '?lang=' + language;
        window.open(finalUrl, '_blank');
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

// =======================================================================================
// 第六部分：密码页面
// 功能：密码验证页面
// =======================================================================================

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

// =======================================================================================
// 第七部分：错误页面
// 功能：重定向错误显示页面
// =======================================================================================

const redirectError = `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head><body><h2>重定向错误：目标网站可能包含错误的跳转信息，无法解析</h2></body></html>
`;

// =======================================================================================
// 第八部分：主请求处理函数
// 功能：处理所有传入的HTTP请求，实现代理逻辑
// =======================================================================================

async function handleRequest(request) {
  try {
    // 防止爬虫
    const userAgent = request.headers.get('User-Agent') || '';
    if (userAgent.includes("Bytespider")) {
      return getHTMLResponse("爬虫被禁止使用代理。");
    }

    // 检查代理提示 cookie
    const siteCookie = request.headers.get('Cookie') || '';
    if (!siteCookie.includes(`${proxyHintCookieName}=agreed`)) {
      return getHTMLResponse(mainPage.replace('<div id="proxyHintModal" class="modal">', '<div id="proxyHintModal" class="modal" style="display: flex;">'));
    }

    // 检查密码
    if (password) {
      const pwd = getCook(siteCookie, passwordCookieName);
      if (!pwd || pwd !== password) return handleWrongPwd();
    }

    // 处理 favicon 和 robots.txt
    const url = new URL(request.url);
    if (url.pathname.endsWith("favicon.ico")) return getRedirect("https://www.baidu.com/favicon.ico");
    if (url.pathname.endsWith("robots.txt")) {
      return new Response(`User-Agent: *\nDisallow: /`, { headers: { "Content-Type": "text/plain" } });
    }

    // 显示主页面
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
    if (blockAds) {
      const urlLower = actualUrlStr.toLowerCase();
      if (adBlockKeywords.some(keyword => urlLower.includes(keyword))) return new Response(null, { status: 204 });
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
      return getHTMLResponse("无效的 URL 或无法获取上次访问的站点。");
    }

    // 处理没有协议的 URL
    if (!actualUrlStr.startsWith("http") && !actualUrlStr.includes("://")) {
      return getRedirect(thisProxyServerUrlHttps + "https://" + actualUrlStr);
    }

    const actualUrl = new URL(actualUrlStr);

    // 检查主机大小写
    if (actualUrlStr !== actualUrl.href) return getRedirect(thisProxyServerUrlHttps + actualUrl.href);

    // 获取语言和设备设置
    let selectedLanguage = getCook(siteCookie, languageCookieName) || url.searchParams.get('lang') || 'zh-CN';
    if (!supportedLanguages.some(lang => lang.code === selectedLanguage)) selectedLanguage = 'zh-CN';
    const deviceType = getCook(siteCookie, deviceCookieName) || 'none';

    // 处理 WebSocket
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
      let newValue = value.replace(thisProxyServerUrlHttps, actualUrlStr).replace(thisProxyServerUrl_hostOnly, actualUrl.host);
      if (key.toLowerCase() === 'origin') newValue = actualUrl.origin;
      if (key.toLowerCase() === 'referer') newValue = newValue.replace(thisProxyServerUrlHttps, actualUrl.origin + '/');
      if (key.toLowerCase() === 'accept-language') newValue = selectedLanguage;
      if (key.toLowerCase() === 'user-agent' && deviceType !== 'none') newValue = deviceUserAgents[deviceType];
      clientHeaderWithChange.set(key, newValue);
    }
    if (!clientHeaderWithChange.has('Origin')) clientHeaderWithChange.set('Origin', actualUrl.origin);
    if (!clientHeaderWithChange.has('Accept-Language')) clientHeaderWithChange.set('Accept-Language', selectedLanguage);

    // 添加自定义头
    const customHeaders = getCook(siteCookie, customHeadersCookieName) || '';
    if (customHeaders) {
      customHeaders.split('\n').forEach(header => {
        const [key, value] = header.split(':').map(s => s.trim());
        if (key && value) clientHeaderWithChange.set(key, value);
      });
    }

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
      body: request.body ? clientRequestBodyWithChange : request.body,
      redirect: "manual"
    });

    // 发送请求
    const response = await fetch(modifiedRequest);
    if (response.status.toString().startsWith("3") && response.headers.get("Location")) {
      try {
        const redirectUrl = new URL(response.headers.get("Location"), actualUrl).href;
        if (redirectUrl === 'about:blank') throw new Error('Invalid redirect to about:blank');
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

    // 缓存静态内容
    const contentType = response.headers.get('Content-Type') || '';
    const isStatic = contentType.includes('image/') || contentType.includes('text/css') || contentType.includes('application/javascript');
    if (isStatic && response.status === 200) {
      const cache = caches.default;
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

    // 处理响应头
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

    // 设置 cookie 和头
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

// =======================================================================================
// 第九部分：工具函数
// 功能：各种工具函数，支持主逻辑运行
// =======================================================================================

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