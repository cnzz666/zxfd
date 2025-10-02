// worker.js - 完整功能代理服务
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

// 全局变量
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
const noHintCookieName = "__PROXY_NO_HINT__";
const adBlockRulesCookieName = "__PROXY_ADBLOCK_RULES__";
const requestModificationCookieName = "__PROXY_REQUEST_MOD__";
const imageModeCookieName = "__PROXY_IMAGE_MODE__";
const password = ""; // 设置密码，若为空则不启用
const showPasswordPage = true;
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
  mobile: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  android: "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  android_tablet: "Mozilla/5.0 (Linux; Android 10; SM-T860) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  windows_ie: "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko",
  macos: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  ipad: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  symbian: "Mozilla/5.0 (Symbian/3; Series60/5.2 NokiaN8-00/012.002; Profile/MIDP-2.1 Configuration/CLDC-1.1 ) AppleWebKit/533.4 (KHTML, like Gecko) NokiaBrowser/7.3.0 Mobile Safari/533.4"
};

const deviceLayouts = {
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 375, height: 667 },
  android: { width: 360, height: 740 },
  android_tablet: { width: 1024, height: 600 },
  windows_ie: { width: 1920, height: 1080 },
  macos: { width: 1440, height: 900 },
  iphone: { width: 375, height: 667 },
  ipad: { width: 768, height: 1024 },
  symbian: { width: 360, height: 640 }
};

// 广告拦截规则订阅
const adBlockSubscriptions = [
  { name: "EasyList", url: "https://easylist-downloads.adblockplus.org/easylist.txt" },
  { name: "EasyList China", url: "https://easylist-downloads.adblockplus.org/easylistchina.txt" },
  { name: "CJX's Annoyance List", url: "https://fastly.jsdelivr.net/gh/cjx82630/cjxlist/cjx-annoyance.txt" },
  { name: "EasyPrivacy", url: "https://easylist-downloads.adblockplus.org/easyprivacy.txt" },
  { name: "Anti-Adblock Killer", url: "https://easylist-downloads.adblockplus.org/antiadblockfilters.txt" }
];

// 广告拦截关键词
const adBlockKeywords = [
  "ads.", "ad.", "advert", "banner", "sponsor", "doubleclick", "googlead", "adserver", "popunder", "interstitial",
  "googlesyndication.com", "adsense.google.com", "admob.com", "adclick.g.doubleclick.net"
];

// 代理提示注入 - 改进版
const proxyHintInjection = `
// 改进的代理提示
function showProxyHint() {
  if (document.cookie.includes("${proxyHintCookieName}=agreed") || document.cookie.includes("${noHintCookieName}=1")) {
    return;
  }
  
  const hintHTML = \`
    <div id="__PROXY_HINT_MODAL__" class="proxy-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>⚠️ 代理使用协议</h3>
        </div>
        <div class="modal-body">
          <p>警告：您当前正在使用网络代理，请勿登录任何网站。单击关闭此提示。详情请见 <a href="https://github.com/1234567Yang/cf-proxy-ex/" target="_blank">https://github.com/1234567Yang/cf-proxy-ex/</a>。</p>
          <p>Warning: You are currently using a web proxy, so do not log in to any website. For details, please visit the link above.</p>
        </div>
        <div class="modal-footer">
          <div class="checkbox-container">
            <input type="checkbox" id="dontShowAgain">
            <label for="dontShowAgain">不再显示</label>
          </div>
          <button onclick="closeProxyHint(true)" class="btn-primary">同意并关闭</button>
          <button onclick="closeProxyHint(false)" class="btn-secondary">仅关闭</button>
        </div>
      </div>
    </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', hintHTML);
  
  // 添加样式
  const style = document.createElement('style');
  style.textContent = \`
    .proxy-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999999999;
      backdrop-filter: blur(5px);
      opacity: 0;
      animation: modalFadeIn 0.5s ease forwards;
    }
    @keyframes modalFadeIn {
      to { opacity: 1; }
    }
    .proxy-modal .modal-content {
      background: rgba(255,255,255,0.95);
      border-radius: 15px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.3);
      transform: scale(0.8);
      animation: modalScaleIn 0.5s ease 0.2s forwards;
    }
    @keyframes modalScaleIn {
      to { transform: scale(1); }
    }
    .modal-header h3 {
      color: #c53030;
      margin: 0 0 15px 0;
      text-align: center;
    }
    .modal-body p {
      margin: 10px 0;
      line-height: 1.5;
      color: #333;
    }
    .modal-body a {
      color: #0277bd;
      text-decoration: none;
    }
    .modal-body a:hover {
      text-decoration: underline;
    }
    .modal-footer {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .btn-primary, .btn-secondary {
      padding: 12px 20px;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s ease;
    }
    .btn-primary {
      background: linear-gradient(45deg, #4fc3f7, #81d4fa);
      color: #333;
    }
    .btn-secondary {
      background: rgba(160,174,192,0.3);
      color: #333;
    }
    .btn-primary:hover, .btn-secondary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
  \`;
  document.head.appendChild(style);
}

function closeProxyHint(agree) {
  const modal = document.getElementById('__PROXY_HINT_MODAL__');
  if (modal) {
    modal.style.animation = 'modalFadeOut 0.3s ease forwards';
    setTimeout(() => modal.remove(), 300);
  }
  
  if (agree) {
    const dontShow = document.getElementById('dontShowAgain');
    if (dontShow && dontShow.checked) {
      const expiryDate = new Date();
      expiryDate.setTime(expiryDate.getTime() + (30 * 24 * 60 * 60 * 1000));
      document.cookie = "${noHintCookieName}=1; expires=" + expiryDate.toUTCString() + "; path=/";
    } else {
      const expiryDate = new Date();
      expiryDate.setTime(expiryDate.getTime() + (24 * 60 * 60 * 1000));
      document.cookie = "${proxyHintCookieName}=agreed; expires=" + expiryDate.toUTCString() + "; path=/";
    }
  }
}

// 页面加载完成后显示提示
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', showProxyHint);
} else {
  setTimeout(showProxyHint, 1000);
}
`;

// Cookie注入功能 - 改进版
const cookieInjectionScript = `
// Cookie注入功能 - 改进版
let cookieInjectionData = {};

function loadCookieInjectionData() {
  try {
    const saved = localStorage.getItem('${cookieInjectionDataName}');
    if (saved) {
      cookieInjectionData = JSON.parse(saved);
    }
  } catch (e) {
    console.log('加载Cookie注入数据失败:', e);
  }
}

function initToolbar() {
  // 创建工具栏
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
    border: none;
    background: linear-gradient(45deg, #4fc3f7, #81d4fa);
    color: white;
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
  \`;
  mainBtn.onmouseenter = () => {
    mainBtn.style.transform = 'scale(1.1)';
    mainBtn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
  };
  mainBtn.onmouseleave = () => {
    mainBtn.style.transform = 'scale(1)';
    mainBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
  };
  mainBtn.onclick = showToolPanel;
  
  toolbar.appendChild(mainBtn);
  document.body.appendChild(toolbar);
}

function showToolPanel() {
  // 移除现有面板
  const existingPanel = document.getElementById('__PROXY_TOOL_PANEL__');
  if (existingPanel) {
    existingPanel.remove();
    return;
  }
  
  const currentUrl = window.location.href.replace(window.location.origin + '/', '');
  const currentHost = new URL(currentUrl).hostname;
  
  const panelHTML = \`
    <div id="__PROXY_TOOL_PANEL__" class="tool-panel">
      <div class="panel-header">
        <h4>代理工具</h4>
        <button onclick="closeToolPanel()" class="close-btn">×</button>
      </div>
      <div class="panel-content">
        <div class="tool-section">
          <h5>Cookie注入</h5>
          <button onclick="showCookieModal()" class="tool-btn">🍪 Cookie注入</button>
        </div>
        <div class="tool-section">
          <h5>广告拦截</h5>
          <button onclick="showAdBlockModal()" class="tool-btn">🛡️ 广告拦截</button>
        </div>
        <div class="tool-section">
          <h5>资源嗅探</h5>
          <button onclick="showResourceSniffer()" class="tool-btn">🔍 资源嗅探</button>
        </div>
        <div class="tool-section">
          <h5>请求修改</h5>
          <button onclick="showRequestModModal()" class="tool-btn">✏️ 请求修改</button>
        </div>
        <div class="tool-section">
          <h5>图片模式</h5>
          <select id="imageModeSelect" onchange="changeImageMode(this.value)" class="tool-select">
            <option value="all">有图模式</option>
            <option value="none">无图模式</option>
            <option value="webp">仅WebP</option>
          </select>
        </div>
      </div>
    </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', panelHTML);
  
  // 加载设置
  loadToolSettings();
}

function closeToolPanel() {
  const panel = document.getElementById('__PROXY_TOOL_PANEL__');
  if (panel) panel.remove();
}

function loadToolSettings() {
  // 加载图片模式设置
  try {
    const imageMode = localStorage.getItem('${imageModeCookieName}') || 'all';
    document.getElementById('imageModeSelect').value = imageMode;
  } catch (e) {}
}

function changeImageMode(mode) {
  localStorage.setItem('${imageModeCookieName}', mode);
  // 刷新页面应用设置
  window.location.reload();
}

// Cookie注入模态框
function showCookieModal() {
  const currentUrl = window.location.href.replace(window.location.origin + '/', '');
  const currentHost = new URL(currentUrl).hostname;
  
  const currentCookies = cookieInjectionData[currentHost] || {};
  
  const modalHTML = \`
    <div id="__COOKIE_MODAL__" class="proxy-modal">
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h3>🍪 Cookie注入</h3>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>目标网站:</label>
            <input type="text" id="cookieTarget" value="\${currentHost}" readonly class="form-input">
          </div>
          <div class="form-group">
            <label>输入方式:</label>
            <select id="cookieInputType" onchange="toggleCookieInputType()" class="form-select">
              <option value="combined"\${currentCookies.inputType === 'combined' ? ' selected' : ''}>合成Cookie</option>
              <option value="separate"\${currentCookies.inputType === 'separate' ? ' selected' : ''}>分段输入</option>
            </select>
          </div>
          
          <div id="combinedCookieSection" class="cookie-section">
            <label>Cookie字符串:</label>
            <textarea id="combinedCookie" class="form-textarea" placeholder="name=value; name2=value2">\${currentCookies.combined || ''}</textarea>
          </div>
          
          <div id="separateCookieSection" class="cookie-section" style="display: none;">
            <div class="cookie-pair">
              <input type="text" id="cookieName" placeholder="名称" class="form-input">
              <input type="text" id="cookieValue" placeholder="值" class="form-input">
              <button onclick="addCookiePair()" class="btn-small">添加</button>
            </div>
            <div id="cookieList" class="cookie-list">
              \${renderCookieList(currentCookies.pairs || [])}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button onclick="saveCookieSettings()" class="btn-primary">保存并注入</button>
          <button onclick="closeCookieModal()" class="btn-secondary">取消</button>
        </div>
      </div>
    </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  toggleCookieInputType();
}

function toggleCookieInputType() {
  const type = document.getElementById('cookieInputType').value;
  document.getElementById('combinedCookieSection').style.display = type === 'combined' ? 'block' : 'none';
  document.getElementById('separateCookieSection').style.display = type === 'separate' ? 'block' : 'none';
}

function renderCookieList(pairs) {
  return pairs.map(pair => \`
    <div class="cookie-item">
      <span>\${pair.name}=\${pair.value}</span>
      <button onclick="removeCookiePair('\${pair.name}')" class="btn-remove">×</button>
    </div>
  \`).join('');
}

let cookiePairs = [];

function addCookiePair() {
  const name = document.getElementById('cookieName').value.trim();
  const value = document.getElementById('cookieValue').value.trim();
  
  if (name && value) {
    cookiePairs.push({ name, value });
    updateCookieList();
    document.getElementById('cookieName').value = '';
    document.getElementById('cookieValue').value = '';
  }
}

function removeCookiePair(name) {
  cookiePairs = cookiePairs.filter(pair => pair.name !== name);
  updateCookieList();
}

function updateCookieList() {
  document.getElementById('cookieList').innerHTML = renderCookieList(cookiePairs);
}

function saveCookieSettings() {
  const target = document.getElementById('cookieTarget').value;
  const inputType = document.getElementById('cookieInputType').value;
  
  let cookieData = {};
  
  if (inputType === 'combined') {
    const combined = document.getElementById('combinedCookie').value.trim();
    cookieData = { inputType, combined };
  } else {
    cookieData = { inputType, pairs: cookiePairs };
  }
  
  cookieInjectionData[target] = cookieData;
  
  try {
    localStorage.setItem('${cookieInjectionDataName}', JSON.stringify(cookieInjectionData));
    
    // 注入Cookie
    injectCookies(target, cookieData);
    
    alert('Cookie设置已保存并注入！页面将刷新以应用更改。');
    setTimeout(() => window.location.reload(), 1000);
    
  } catch (e) {
    alert('保存失败: ' + e.message);
  }
}

function injectCookies(target, cookieData) {
  if (cookieData.inputType === 'combined') {
    // 解析合成Cookie字符串
    cookieData.combined.split(';').forEach(pair => {
      const [name, value] = pair.split('=').map(s => s.trim());
      if (name && value) {
        document.cookie = \`\${name}=\${value}; path=/; domain=\${target}\`;
      }
    });
  } else {
    // 注入分段Cookie
    cookieData.pairs.forEach(pair => {
      document.cookie = \`\${pair.name}=\${pair.value}; path=/; domain=\${target}\`;
    });
  }
}

function closeCookieModal() {
  const modal = document.getElementById('__COOKIE_MODAL__');
  if (modal) modal.remove();
}

// 初始化
setTimeout(() => {
  loadCookieInjectionData();
  initToolbar();
}, 2000);
`;

// 广告拦截功能
const adBlockScript = `
// 广告拦截功能
let adBlockRules = [];
let adBlockEnabled = false;

function loadAdBlockSettings() {
  try {
    const saved = localStorage.getItem('${adBlockRulesCookieName}');
    if (saved) {
      const settings = JSON.parse(saved);
      adBlockRules = settings.rules || [];
      adBlockEnabled = settings.enabled || false;
    }
    
    // 加载内置规则
    loadBuiltinRules();
  } catch (e) {
    console.log('加载广告拦截设置失败:', e);
  }
}

async function loadBuiltinRules() {
  // 这里可以加载订阅规则
  // 由于在Worker环境中无法直接fetch，规则在服务端处理
}

function showAdBlockModal() {
  const modalHTML = \`
    <div id="__ADBLOCK_MODAL__" class="proxy-modal">
      <div class="modal-content" style="max-width: 800px;">
        <div class="modal-header">
          <h3>🛡️ 广告拦截</h3>
        </div>
        <div class="modal-body">
          <div class="adblock-stats">
            <p>已拦截 <strong id="blockedCount">0</strong> 个广告</p>
          </div>
          
          <div class="adblock-section">
            <h5>拦截开关</h5>
            <label class="switch">
              <input type="checkbox" id="adBlockToggle" \${adBlockEnabled ? 'checked' : ''} onchange="toggleAdBlock()">
              <span class="slider"></span>
            </label>
            <span>启用广告拦截</span>
          </div>
          
          <div class="adblock-section">
            <h5>规则订阅</h5>
            <div class="subscription-list">
              <div class="subscription-item">
                <span>EasyList (主要规则)</span>
                <button class="btn-small" onclick="enableSubscription('easylist')">启用</button>
              </div>
              <div class="subscription-item">
                <span>EasyList China (中文规则)</span>
                <button class="btn-small" onclick="enableSubscription('easylist_china')">启用</button>
              </div>
              <div class="subscription-item">
                <span>EasyPrivacy (隐私保护)</span>
                <button class="btn-small" onclick="enableSubscription('easyprivacy')">启用</button>
              </div>
            </div>
          </div>
          
          <div class="adblock-section">
            <h5>自定义规则</h5>
            <textarea id="customRules" class="form-textarea" placeholder="添加自定义规则，每行一条" style="height: 100px;">\${adBlockRules.join('\\\\n')}</textarea>
            <button onclick="saveCustomRules()" class="btn-small">保存规则</button>
          </div>
          
          <div class="adblock-section">
            <h5>元素标记</h5>
            <button onclick="startElementMarking()" class="btn-primary">开始标记广告元素</button>
            <p class="help-text">点击此按钮后，再点击页面上的广告元素进行标记</p>
          </div>
        </div>
        <div class="modal-footer">
          <button onclick="saveAdBlockSettings()" class="btn-primary">保存设置</button>
          <button onclick="closeAdBlockModal()" class="btn-secondary">关闭</button>
        </div>
      </div>
    </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function toggleAdBlock() {
  adBlockEnabled = document.getElementById('adBlockToggle').checked;
}

function enableSubscription(type) {
  alert('订阅功能需要在服务端实现');
}

function saveCustomRules() {
  const rulesText = document.getElementById('customRules').value;
  adBlockRules = rulesText.split('\\\\n').filter(rule => rule.trim());
}

function startElementMarking() {
  closeAdBlockModal();
  
  // 进入标记模式
  document.body.style.cursor = 'crosshair';
  const elements = document.querySelectorAll('*');
  
  elements.forEach(el => {
    el.addEventListener('mouseover', handleElementHover);
    el.addEventListener('mouseout', handleElementOut);
    el.addEventListener('click', handleElementClick);
  });
  
  // 添加标记模式提示
  const hint = document.createElement('div');
  hint.id = '__MARKING_HINT__';
  hint.style.cssText = \`
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #ffeb3b;
    color: #333;
    padding: 10px 20px;
    border-radius: 25px;
    z-index: 999999;
    font-weight: bold;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  \`;
  hint.textContent = '标记模式：点击要屏蔽的广告元素，按ESC退出';
  document.body.appendChild(hint);
  
  // ESC键退出
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      exitMarkingMode();
    }
  });
}

function handleElementHover(e) {
  e.target.style.outline = '2px solid #ff0000';
  e.stopPropagation();
}

function handleElementOut(e) {
  e.target.style.outline = '';
  e.stopPropagation();
}

function handleElementClick(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const selector = generateSelector(e.target);
  if (selector && confirm('是否屏蔽此元素？选择器: ' + selector)) {
    adBlockRules.push(selector);
    e.target.style.display = 'none';
    alert('元素已标记为广告');
  }
  
  return false;
}

function generateSelector(element) {
  if (element.id) {
    return '#' + element.id;
  }
  
  if (element.className && typeof element.className === 'string') {
    return '.' + element.className.split(' ')[0];
  }
  
  return element.tagName.toLowerCase();
}

function exitMarkingMode() {
  document.body.style.cursor = '';
  const elements = document.querySelectorAll('*');
  
  elements.forEach(el => {
    el.removeEventListener('mouseover', handleElementHover);
    el.removeEventListener('mouseout', handleElementOut);
    el.removeEventListener('click', handleElementClick);
    el.style.outline = '';
  });
  
  const hint = document.getElementById('__MARKING_HINT__');
  if (hint) hint.remove();
  
  // 重新打开广告拦截面板
  setTimeout(showAdBlockModal, 500);
}

function saveAdBlockSettings() {
  try {
    const settings = {
      enabled: adBlockEnabled,
      rules: adBlockRules
    };
    localStorage.setItem('${adBlockRulesCookieName}', JSON.stringify(settings));
    alert('广告拦截设置已保存！页面将刷新以应用更改。');
    setTimeout(() => window.location.reload(), 1000);
  } catch (e) {
    alert('保存失败: ' + e.message);
  }
}

function closeAdBlockModal() {
  const modal = document.getElementById('__ADBLOCK_MODAL__');
  if (modal) modal.remove();
}

// 广告拦截执行函数
function executeAdBlock() {
  if (!adBlockEnabled) return;
  
  adBlockRules.forEach(rule => {
    try {
      document.querySelectorAll(rule).forEach(el => {
        el.style.display = 'none';
      });
    } catch (e) {
      console.log('广告拦截规则错误:', rule, e);
    }
  });
  
  // 拦截广告请求
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && isAdUrl(url)) {
      return Promise.reject(new Error('广告请求被拦截'));
    }
    return originalFetch.apply(this, args);
  };
}

function isAdUrl(url) {
  const adKeywords = ['ads.', 'ad.', 'doubleclick', 'googlead', 'adserver'];
  return adKeywords.some(keyword => url.includes(keyword));
}

// 初始化广告拦截
loadAdBlockSettings();
if (adBlockEnabled) {
  setTimeout(executeAdBlock, 1000);
}
`;

// 资源嗅探功能
const resourceSnifferScript = `
// 资源嗅探功能
let capturedRequests = [];

function showResourceSniffer() {
  const modalHTML = \`
    <div id="__SNIFFER_MODAL__" class="proxy-modal">
      <div class="modal-content" style="max-width: 900px; height: 80vh;">
        <div class="modal-header">
          <h3>🔍 资源嗅探</h3>
          <div class="sniffer-controls">
            <button onclick="clearCapturedRequests()" class="btn-small">清空</button>
            <button onclick="startSniffing()" class="btn-small">开始嗅探</button>
            <button onclick="stopSniffing()" class="btn-small">停止嗅探</button>
          </div>
        </div>
        <div class="modal-body" style="overflow-y: auto;">
          <div class="request-list">
            <div class="request-header">
              <span>方法</span>
              <span>URL</span>
              <span>状态</span>
              <span>类型</span>
              <span>大小</span>
              <span>操作</span>
            </div>
            <div id="requestList" class="request-items">
              \${renderRequestList()}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button onclick="closeSnifferModal()" class="btn-secondary">关闭</button>
        </div>
      </div>
    </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function renderRequestList() {
  return capturedRequests.map((req, index) => \`
    <div class="request-item \${req.type}">
      <span class="method \${req.method.toLowerCase()}">\${req.method}</span>
      <span class="url" title="\${req.url}">\${req.url}</span>
      <span class="status">\${req.status || '-'}</span>
      <span class="type">\${req.type}</span>
      <span class="size">\${formatSize(req.size)}</span>
      <span class="actions">
        <button onclick="inspectRequest(\${index})" title="查看详情">🔍</button>
        <button onclick="blockRequest(\${index})" title="拦截请求">🚫</button>
      </span>
    </div>
  \`).join('');
}

function formatSize(bytes) {
  if (!bytes) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function startSniffing() {
  // 拦截XMLHttpRequest
  const originalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    
    let method, url;
    
    xhr.open = function(...args) {
      method = args[0];
      url = args[1];
      return originalOpen.apply(this, args);
    };
    
    xhr.send = function(...args) {
      const startTime = Date.now();
      
      xhr.addEventListener('load', function() {
        const request = {
          method: method,
          url: url,
          status: xhr.status,
          type: 'xhr',
          size: xhr.responseText.length,
          timestamp: new Date().toLocaleTimeString()
        };
        capturedRequests.push(request);
        updateRequestList();
      });
      
      return originalSend.apply(this, args);
    };
    
    return xhr;
  };
  
  // 拦截fetch
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const startTime = Date.now();
    const url = typeof args[0] === 'string' ? args[0] : args[0].url;
    
    return originalFetch.apply(this, args).then(response => {
      const request = {
        method: 'GET',
        url: url,
        status: response.status,
        type: 'fetch',
        size: 0,
        timestamp: new Date().toLocaleTimeString()
      };
      capturedRequests.push(request);
      updateRequestList();
      return response;
    });
  };
  
  alert('资源嗅探已开始');
}

function stopSniffing() {
  // 恢复原始方法（简化实现）
  alert('资源嗅探已停止');
}

function clearCapturedRequests() {
  capturedRequests = [];
  updateRequestList();
}

function updateRequestList() {
  const list = document.getElementById('requestList');
  if (list) {
    list.innerHTML = renderRequestList();
  }
}

function inspectRequest(index) {
  const request = capturedRequests[index];
  alert(\`请求详情:
方法: \${request.method}
URL: \${request.url}
状态: \${request.status}
类型: \${request.type}
大小: \${formatSize(request.size)}
时间: \${request.timestamp}\`);
}

function blockRequest(index) {
  const request = capturedRequests[index];
  if (confirm(\`确定要拦截此请求吗？\\\\n\${request.url}\`)) {
    // 在实际实现中，这里需要修改请求拦截逻辑
    alert('请求拦截功能需要在服务端实现');
  }
}

function closeSnifferModal() {
  const modal = document.getElementById('__SNIFFER_MODAL__');
  if (modal) modal.remove();
}
`;

// 请求修改功能
const requestModificationScript = `
// 请求修改功能
let requestModifications = [];

function showRequestModModal() {
  const modalHTML = \`
    <div id="__REQUEST_MOD_MODAL__" class="proxy-modal">
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h3>✏️ 请求修改</h3>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>URL匹配模式:</label>
            <input type="text" id="modUrlPattern" placeholder="例如: *google.com*" class="form-input">
          </div>
          
          <div class="form-group">
            <label>修改类型:</label>
            <select id="modType" class="form-select">
              <option value="header">修改请求头</option>
              <option value="redirect">重定向请求</option>
              <option value="block">拦截请求</option>
            </select>
          </div>
          
          <div id="headerModSection">
            <div class="form-group">
              <label>请求头操作:</label>
              <select id="headerAction" class="form-select">
                <option value="add">添加/修改</option>
                <option value="remove">删除</option>
              </select>
            </div>
            <div class="form-group">
              <label>头名称:</label>
              <input type="text" id="headerName" class="form-input" placeholder="Header名称">
            </div>
            <div class="form-group">
              <label>头值:</label>
              <input type="text" id="headerValue" class="form-input" placeholder="Header值">
            </div>
          </div>
          
          <div id="redirectModSection" style="display: none;">
            <div class="form-group">
              <label>重定向到:</label>
              <input type="text" id="redirectUrl" class="form-input" placeholder="新的URL">
            </div>
          </div>
          
          <button onclick="addModification()" class="btn-primary">添加规则</button>
          
          <div class="modification-list">
            <h5>现有规则:</h5>
            <div id="modList">
              \${renderModificationList()}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button onclick="saveModifications()" class="btn-primary">保存</button>
          <button onclick="closeRequestModModal()" class="btn-secondary">取消</button>
        </div>
      </div>
    </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // 显示/隐藏相关部分
  document.getElementById('modType').addEventListener('change', function() {
    const type = this.value;
    document.getElementById('headerModSection').style.display = type === 'header' ? 'block' : 'none';
    document.getElementById('redirectModSection').style.display = type === 'redirect' ? 'block' : 'none';
  });
}

function renderModificationList() {
  return requestModifications.map((mod, index) => \`
    <div class="mod-item">
      <span class="mod-pattern">\${mod.pattern}</span>
      <span class="mod-type">\${mod.type}</span>
      <span class="mod-details">\${getModDetails(mod)}</span>
      <button onclick="removeModification(\${index})" class="btn-remove">×</button>
    </div>
  \`).join('');
}

function getModDetails(mod) {
  switch (mod.type) {
    case 'header':
      return \`\${mod.headerAction} \${mod.headerName}\${mod.headerValue ? ': ' + mod.headerValue : ''}\`;
    case 'redirect':
      return \`→ \${mod.redirectUrl}\`;
    case 'block':
      return '拦截请求';
    default:
      return '';
  }
}

function addModification() {
  const pattern = document.getElementById('modUrlPattern').value.trim();
  const type = document.getElementById('modType').value;
  
  if (!pattern) {
    alert('请输入URL匹配模式');
    return;
  }
  
  const modification = { pattern, type };
  
  if (type === 'header') {
    modification.headerAction = document.getElementById('headerAction').value;
    modification.headerName = document.getElementById('headerName').value.trim();
    modification.headerValue = document.getElementById('headerValue').value.trim();
    
    if (!modification.headerName) {
      alert('请输入头名称');
      return;
    }
  } else if (type === 'redirect') {
    modification.redirectUrl = document.getElementById('redirectUrl').value.trim();
    if (!modification.redirectUrl) {
      alert('请输入重定向URL');
      return;
    }
  }
  
  requestModifications.push(modification);
  updateModificationList();
  
  // 清空表单
  document.getElementById('modUrlPattern').value = '';
  document.getElementById('headerName').value = '';
  document.getElementById('headerValue').value = '';
  document.getElementById('redirectUrl').value = '';
}

function removeModification(index) {
  requestModifications.splice(index, 1);
  updateModificationList();
}

function updateModificationList() {
  const list = document.getElementById('modList');
  if (list) {
    list.innerHTML = renderModificationList();
  }
}

function saveModifications() {
  try {
    localStorage.setItem('${requestModificationCookieName}', JSON.stringify(requestModifications));
    alert('请求修改规则已保存！');
  } catch (e) {
    alert('保存失败: ' + e.message);
  }
}

function closeRequestModModal() {
  const modal = document.getElementById('__REQUEST_MOD_MODAL__');
  if (modal) modal.remove();
}

// 加载保存的修改规则
function loadModifications() {
  try {
    const saved = localStorage.getItem('${requestModificationCookieName}');
    if (saved) {
      requestModifications = JSON.parse(saved);
    }
  } catch (e) {
    console.log('加载请求修改规则失败:', e);
  }
}

// 初始化
loadModifications();
`;

// 主注入脚本 - 整合所有功能
const mainInjectionScript = `
// 主注入脚本
(function() {
  ${proxyHintInjection}
  
  // 工具函数
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${'${'}'()}|[\]\\]/g, '\\\\$&');
  }
  
  // URL处理函数
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
  
  // 图片模式处理
  function handleImageMode() {
    try {
      const imageMode = localStorage.getItem('${imageModeCookieName}') || 'all';
      if (imageMode === 'none') {
        // 无图模式
        document.querySelectorAll('img').forEach(img => {
          img.style.display = 'none';
        });
      } else if (imageMode === 'webp') {
        // 仅WebP模式 - 这里可以添加更复杂的逻辑
        document.querySelectorAll('img').forEach(img => {
          if (!img.src.includes('.webp')) {
            img.style.display = 'none';
          }
        });
      }
    } catch (e) {
      console.log('图片模式处理失败:', e);
    }
  }
  
  // 初始化所有功能
  function initAllFeatures() {
    // 添加通用样式
    const style = document.createElement('style');
    style.textContent = \`
      .proxy-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999999999;
        backdrop-filter: blur(5px);
        opacity: 0;
        animation: modalFadeIn 0.5s ease forwards;
      }
      @keyframes modalFadeIn {
        to { opacity: 1; }
      }
      .proxy-modal .modal-content {
        background: rgba(255,255,255,0.95);
        border-radius: 15px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.3);
        transform: scale(0.8);
        animation: modalScaleIn 0.5s ease 0.2s forwards;
      }
      @keyframes modalScaleIn {
        to { transform: scale(1); }
      }
      .modal-header {
        margin-bottom: 20px;
        border-bottom: 1px solid #eee;
        padding-bottom: 15px;
      }
      .modal-header h3 {
        margin: 0;
        color: #2c5282;
      }
      .modal-body {
        margin-bottom: 20px;
      }
      .modal-footer {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
      .form-group {
        margin-bottom: 15px;
      }
      .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
        color: #333;
      }
      .form-input, .form-select, .form-textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: rgba(255,255,255,0.8);
      }
      .form-textarea {
        resize: vertical;
        min-height: 80px;
      }
      .btn-primary, .btn-secondary {
        padding: 12px 20px;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
      }
      .btn-primary {
        background: linear-gradient(45deg, #4fc3f7, #81d4fa);
        color: #333;
      }
      .btn-secondary {
        background: rgba(160,174,192,0.3);
        color: #333;
      }
      .btn-primary:hover, .btn-secondary:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      }
      .btn-small {
        padding: 6px 12px;
        border: none;
        border-radius: 15px;
        background: #4fc3f7;
        color: white;
        cursor: pointer;
        font-size: 12px;
      }
      .btn-remove {
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        cursor: pointer;
      }
      .tool-panel {
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: rgba(255,255,255,0.95);
        border-radius: 15px;
        padding: 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.3);
        z-index: 999997;
        min-width: 200px;
      }
      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      .panel-header h4 {
        margin: 0;
        color: #2c5282;
      }
      .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #666;
      }
      .tool-section {
        margin-bottom: 15px;
      }
      .tool-section h5 {
        margin: 0 0 8px 0;
        color: #333;
        font-size: 14px;
      }
      .tool-btn, .tool-select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: rgba(255,255,255,0.8);
        cursor: pointer;
      }
      .cookie-section {
        margin-top: 10px;
      }
      .cookie-pair {
        display: flex;
        gap: 5px;
        margin-bottom: 10px;
      }
      .cookie-list {
        max-height: 150px;
        overflow-y: auto;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 10px;
      }
      .cookie-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px;
        border-bottom: 1px solid #eee;
      }
      .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
        margin-right: 10px;
      }
      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 24px;
      }
      .slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
      input:checked + .slider {
        background-color: #4fc3f7;
      }
      input:checked + .slider:before {
        transform: translateX(26px);
      }
      .adblock-section {
        margin-bottom: 20px;
        padding: 15px;
        background: rgba(255,255,255,0.5);
        border-radius: 8px;
      }
      .subscription-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #eee;
      }
      .help-text {
        font-size: 12px;
        color: #666;
        margin-top: 5px;
      }
      .request-list {
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
      }
      .request-header, .request-item {
        display: grid;
        grid-template-columns: 80px 1fr 80px 100px 80px 100px;
        gap: 10px;
        padding: 10px;
        border-bottom: 1px solid #eee;
      }
      .request-header {
        background: #f5f5f5;
        font-weight: bold;
      }
      .method.get { color: #28a745; }
      .method.post { color: #007bff; }
      .url { 
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .mod-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 8px;
        margin-bottom: 5px;
      }
      .mod-pattern { font-weight: bold; }
      .mod-type { color: #666; font-size: 12px; }
      .mod-details { flex: 1; margin: 0 10px; }
    \`;
    document.head.appendChild(style);
    
    // 初始化各个功能
    setTimeout(() => {
      ${cookieInjectionScript}
      ${adBlockScript}
      ${resourceSnifferScript}
      ${requestModificationScript}
      handleImageMode();
    }, 1000);
  }
  
  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllFeatures);
  } else {
    setTimeout(initAllFeatures, 500);
  }
})();
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

// 屏蔽元素注入
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

// 主页面 HTML - 改进版
const mainPage = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>网站在线代理 - 完整功能版</title>
  <style>
    /* 基础样式 */
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
    
    /* 主要内容区域 */
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
    
    /* 标题和文本 */
    h1 {
      font-size: 2.5rem;
      margin-bottom: 20px;
      color: #0277bd;
      text-shadow: 0 0 5px rgba(79, 195, 247, 0.3);
    }
    p {
      margin: 12px 0;
      font-size: 14px;
      opacity: 0.9;
    }
    
    /* 按钮和表单元素 */
    button, select, input {
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
    
    /* 链接 */
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
    
    /* 配置区域 */
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
    
    /* 复选框 */
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
    
    /* 模态框 */
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
    
    /* 暗黑模式 */
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
    
    /* 响应式设计 */
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
    <h1>网站在线代理 - 完整功能版</h1>
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
        <option value="android">Android手机</option>
        <option value="android_tablet">Android平板</option>
        <option value="windows_ie">Windows IE</option>
        <option value="macos">macOS</option>
        <option value="iphone">iPhone</option>
        <option value="ipad">iPad</option>
        <option value="symbian">塞班</option>
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
    <p>项目开源地址：<a href="https://github.com/1234567Yang/cf-proxy-ex/" target="_blank">https://github.com/1234567Yang/cf-proxy-ex/</a></p>
  </div>
  
  <!-- 模态框区域 -->
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

  <script>
    // 页面加载动画
    document.addEventListener('DOMContentLoaded', () => {
      const content = document.querySelector('.content');
      setTimeout(() => content.classList.add('loaded'), 100);
      
      // 加载保存的设置
      loadCookies();
      
      // 初始化占位符功能
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
      
      // 范围选择事件
      document.getElementById('blockElementsScope').addEventListener('change', function() {
        document.getElementById('blockElementsScopeUrl').style.display = this.value === 'specific' ? 'block' : 'none';
      });
      
      // 暗黑模式切换
      document.getElementById('darkMode').addEventListener('change', function() {
        document.body.classList.toggle('dark-mode', this.checked);
        setCookie('darkMode', this.checked);
      });
    });
    
    // Cookie操作函数
    function setCookie(name, value) {
      const cookieDomain = window.location.hostname;
      const oneWeekLater = new Date();
      oneWeekLater.setTime(oneWeekLater.getTime() + (7 * 24 * 60 * 60 * 1000));
      document.cookie = \`\${name}=\${value}; expires=\${oneWeekLater.toUTCString()}; path=/; domain=\${cookieDomain}\`;
    }
    
    function loadCookies() {
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
      
      // 监听设置变化
      document.getElementById('languageSelect').addEventListener('change', function() { setCookie('${languageCookieName}', this.value); });
      document.getElementById('deviceSelect').addEventListener('change', function() { setCookie('${deviceCookieName}', this.value); });
      document.getElementById('blockAds').addEventListener('change', function() { setCookie('${blockAdsCookieName}', this.checked); });
    }
    
    // 界面控制函数
    function toggleAdvancedOptions() {
      const advancedOptions = document.getElementById('advancedOptions');
      const button = document.querySelector('button[onclick="toggleAdvancedOptions()"]');
      advancedOptions.classList.toggle('active');
      button.textContent = advancedOptions.classList.contains('active') ? '隐藏高级功能' : '高级选项';
    }
    
    // 模态框控制
    function showUrlModal() { document.getElementById('urlModal').style.display = 'flex'; }
    function closeUrlModal() { document.getElementById('urlModal').style.display = 'none'; }
    function showBlockExtensionsModal() { document.getElementById('blockExtensionsModal').style.display = 'flex'; }
    function closeBlockExtensionsModal() { document.getElementById('blockExtensionsModal').style.display = 'none'; }
    function showBlockElementsModal() { document.getElementById('blockElementsModal').style.display = 'flex'; }
    function closeBlockElementsModal() { document.getElementById('blockElementsModal').style.display = 'none'; }
    function showCustomHeadersModal() { document.getElementById('customHeadersModal').style.display = 'flex'; }
    function closeCustomHeadersModal() { document.getElementById('customHeadersModal').style.display = 'none'; }
    
    // 功能函数
    function redirectTo() {
      const targetUrl = document.getElementById('targetUrl').value.trim();
      const language = document.getElementById('languageSelect').value;
      const device = document.getElementById('deviceSelect').value;
      const currentOrigin = window.location.origin;
      
      if (targetUrl) {
        let finalUrl = currentOrigin + '/' + (targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl);
        let params = [];
        if (language) params.push('lang=' + language);
        if (device && device !== 'none') params.push('device=' + device);
        
        if (params.length > 0) {
          finalUrl += (finalUrl.includes('?') ? '&' : '?') + params.join('&');
        }
        
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

// 密码页面
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

// 重定向错误页面
const redirectError = `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head><body><h2>重定向错误：目标网站可能包含错误的跳转信息，无法解析</h2></body></html>
`;

// 主要请求处理函数
async function handleRequest(request) {
  try {
    // 防止爬虫
    const userAgent = request.headers.get('User-Agent') || '';
    if (userAgent.includes("Bytespider")) {
      return getHTMLResponse("爬虫被禁止使用代理。");
    }

    // 检查代理提示 cookie
    const siteCookie = request.headers.get('Cookie') || '';
    const hasNoHintCookie = siteCookie.includes(`${noHintCookieName}=1`);
    const hasProxyHintCookie = siteCookie.includes(`${proxyHintCookieName}=agreed`);

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
    const deviceType = getCook(siteCookie, deviceCookieName) || url.searchParams.get('device') || 'none';

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
      if (key.toLowerCase() === 'user-agent' && deviceType !== 'none') newValue = deviceUserAgents[deviceType] || deviceUserAgents.desktop;
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
          
          // 注入主要功能脚本
          const inject = `
          <!DOCTYPE html>
          <script id="${injectedJsId}">
          ${mainInjectionScript}
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
      
      if (!hasProxyHintCookie && !hasNoHintCookie) {
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

    if (!hasProxyHintCookie && !hasNoHintCookie) {
      modifiedResponse.headers.set("Cache-Control", "max-age=0");
    }

    return modifiedResponse;
  } catch (e) {
    return getHTMLResponse(`请求处理失败: ${e.message}`);
  }
}

// 工具函数
function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${'${'}'()}|[\]\\]/g, '\\$&');
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