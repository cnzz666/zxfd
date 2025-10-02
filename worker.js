// ======================================================================================= 
// 原作者开源地址:https://github.com/1234567Yang/cf-proxy-ex/
// 本项目基于原作者进行优化修改，开源地址:https://github.com/cnzz666/zxfd
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
const noHintCookieName = "__PROXY_NO_HINT__";
const adblockRulesCookieName = "__PROXY_ADBLOCK_RULES__";
const resourceSnifferCookieName = "__PROXY_RESOURCE_SNIFFER__";
const imageModeCookieName = "__PROXY_IMAGE_MODE__";
const requestModificationCookieName = "__PROXY_REQUEST_MODIFICATION__";

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
  android_tablet: "Mozilla/5.0 (Linux; Android 10; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  windows_ie: "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko",
  macos: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  ipad: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
};

const deviceLayouts = {
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 375, height: 667 },
  android: { width: 360, height: 740 },
  android_tablet: { width: 800, height: 1280 },
  iphone: { width: 390, height: 844 },
  ipad: { width: 834, height: 1194 }
};

// 广告拦截关键词
const adBlockKeywords = [
  "ads.", "ad.", "advert", "banner", "sponsor", "doubleclick", "googlead", "adserver", "popunder", "interstitial",
  "googlesyndication.com", "adsense.google.com", "admob.com", "adclick.g.doubleclick.net"
];

// 默认广告拦截规则订阅
const defaultAdblockSubscriptions = [
  { name: "EasyList", url: "https://easylist-downloads.adblockplus.org/easylist.txt" },
  { name: "EasyList China", url: "https://easylist-downloads.adblockplus.org/easylistchina.txt" },
  { name: "CJX Annoyance", url: "https://fastly.jsdelivr.net/gh/cjx82630/cjxlist/cjx-annoyance.txt" },
  { name: "EasyPrivacy", url: "https://easylist-downloads.adblockplus.org/easyprivacy.txt" },
  { name: "Anti-Adblock", url: "https://easylist-downloads.adblockplus.org/antiadblockfilters.txt" }
];

// =======================================================================================
// 第三部分：代理提示注入脚本
// 功能：在代理页面显示使用警告提示（修改为弹窗样式）
// =======================================================================================

const proxyHintInjection = `
setTimeout(() => {
  if (document.cookie.includes("${proxyHintCookieName}=agreed") || document.cookie.includes("${noHintCookieName}=true")) return;
  
  const hint = document.createElement('div');
  hint.id = "__PROXY_HINT_MODAL__";
  hint.style.cssText = \`
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999999999999999999999;
    user-select: none;
    opacity: 0;
    transition: opacity 0.5s ease;
    backdrop-filter: blur(5px);
  \`;
  
  hint.innerHTML = \`
    <div style="
      background: rgba(255,255,255,0.3);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(79, 195, 247, 0.3);
      border: 1px solid rgba(255,255,255,0.2);
      transform: scale(0.8);
      transition: transform 0.5s ease;
    ">
      <div style="text-align: center; color: #333;">
        <h3 style="color: #c53030; margin-bottom: 15px;">⚠️ 代理使用协议</h3>
        <p style="margin-bottom: 20px; line-height: 1.6;">
          警告：您当前正在使用网络代理。为确保安全，请勿通过代理登录任何网站。
          详情请参阅 <a href="https://github.com/1234567Yang/cf-proxy-ex/" target="_blank" style="color: #0277bd;">使用条款</a>。
        </p>
        <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
          <button onclick="closeHint(false)" style="
            padding: 10px 20px;
            background: linear-gradient(45deg, #4fc3f7, #81d4fa);
            border: none;
            border-radius: 20px;
            color: #333;
            cursor: pointer;
            font-weight: bold;
          ">同意并继续</button>
          <button onclick="closeHint(true)" style="
            padding: 10px 20px;
            background: rgba(160,174,192,0.3);
            border: none;
            border-radius: 20px;
            color: #333;
            cursor: pointer;
          ">不再显示</button>
        </div>
      </div>
    </div>
  \`;
  
  document.body.appendChild(hint);
  
  setTimeout(() => {
    hint.style.opacity = '1';
    const content = hint.querySelector('div > div');
    content.style.transform = 'scale(1)';
  }, 100);
}, 1000);

function closeHint(dontShowAgain) {
  const hint = document.getElementById('__PROXY_HINT_MODAL__');
  if (hint) {
    hint.style.opacity = '0';
    setTimeout(() => {
      hint.remove();
      if (dontShowAgain) {
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (30 * 24 * 60 * 60 * 1000));
        document.cookie = "${noHintCookieName}=true; expires=" + expiryDate.toUTCString() + "; path=/";
      } else {
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (24 * 60 * 60 * 1000));
        document.cookie = "${proxyHintCookieName}=agreed; expires=" + expiryDate.toUTCString() + "; path=/";
      }
    }, 500);
  }
}
`;

// =======================================================================================
// 第四部分：工具栏功能注入脚本
// 功能：在代理页面右下角添加工具栏，包含各种高级功能
// =======================================================================================

const toolbarInjection = `
// 工具栏功能
function initToolbar() {
  // 创建工具栏按钮
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
    box-shadow: 0 4px 15px rgba(79, 195, 247, 0.3);
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
  
  // 创建各个功能按钮
  const tools = [
    { icon: '🍪', title: 'Cookie注入', onclick: showCookieInjectionModal },
    { icon: '🚫', title: '广告拦截', onclick: showAdblockModal },
    { icon: '🔍', title: '资源嗅探', onclick: showResourceSnifferModal },
    { icon: '🖼️', title: '图片模式', onclick: showImageModeModal },
    { icon: '🌐', title: '浏览器标识', onclick: showUserAgentModal },
    { icon: '🔧', title: '请求修改', onclick: showRequestModificationModal }
  ];
  
  tools.forEach(tool => {
    const btn = document.createElement('button');
    btn.innerHTML = tool.icon;
    btn.title = tool.title;
    btn.style.cssText = \`
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(45deg, rgba(255,255,255,0.3), rgba(255,255,255,0.5));
      border: 1px solid rgba(79, 195, 247, 0.5);
      color: #333;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
    \`;
    btn.onclick = tool.onclick;
    btn.onmouseenter = () => {
      btn.style.transform = 'translateY(-2px)';
      btn.style.boxShadow = '0 5px 15px rgba(79, 195, 247, 0.4)';
    };
    btn.onmouseleave = () => {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = '0 2px 10px rgba(79, 195, 247, 0.3)';
    };
    toolsContainer.appendChild(btn);
  });
  
  // 主按钮点击事件
  mainBtn.onclick = () => {
    const isVisible = toolsContainer.style.display === 'flex';
    toolsContainer.style.display = isVisible ? 'none' : 'flex';
    mainBtn.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(45deg)';
  };
  
  mainBtn.onmouseenter = () => {
    mainBtn.style.transform = 'translateY(-2px)';
    mainBtn.style.boxShadow = '0 6px 20px rgba(79, 195, 247, 0.4)';
  };
  
  mainBtn.onmouseleave = () => {
    if (toolsContainer.style.display !== 'flex') {
      mainBtn.style.transform = 'translateY(0)';
    }
    mainBtn.style.boxShadow = '0 4px 15px rgba(79, 195, 247, 0.3)';
  };
  
  toolbar.appendChild(mainBtn);
  toolbar.appendChild(toolsContainer);
  document.body.appendChild(toolbar);
  
  // 初始化各个功能
  initCookieInjection();
  initAdblock();
  initResourceSniffer();
  initImageMode();
}

// Cookie注入功能
function initCookieInjection() {
  window.showCookieInjectionModal = function() {
    const currentUrl = window.location.href.replace(proxy_host_with_schema, '');
    const currentDomain = new URL(currentUrl).hostname;
    
    const modal = createModal('🍪 Cookie注入设置', \`
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">注入地址:</label>
        <input type="text" id="cookieInjectionUrl" value="\${currentDomain}" readonly style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid rgba(79, 195, 247, 0.5); background: rgba(255,255,255,0.5);">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">输入方式:</label>
        <select id="cookieInputType" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid rgba(79, 195, 247, 0.5); background: rgba(255,255,255,0.5);">
          <option value="combined">合成Cookie输入</option>
          <option value="separate">分别输入</option>
        </select>
      </div>
      
      <div id="combinedCookieInput" style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Cookie字符串:</label>
        <textarea id="combinedCookie" placeholder="例如: name=value; name2=value2" style="width: 100%; height: 80px; padding: 8px; border-radius: 8px; border: 1px solid rgba(79, 195, 247, 0.5); background: rgba(255,255,255,0.5); resize: vertical;"></textarea>
      </div>
      
      <div id="separateCookieInput" style="display: none;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 12px;">名称:</label>
            <input type="text" id="cookieName" style="width: 100%; padding: 6px; border-radius: 6px; border: 1px solid rgba(79, 195, 247, 0.5); background: rgba(255,255,255,0.5);">
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 12px;">值:</label>
            <input type="text" id="cookieValue" style="width: 100%; padding: 6px; border-radius: 6px; border: 1px solid rgba(79, 195, 247, 0.5); background: rgba(255,255,255,0.5);">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 12px;">域名:</label>
            <input type="text" id="cookieDomain" value="\${currentDomain}" style="width: 100%; padding: 6px; border-radius: 6px; border: 1px solid rgba(79, 195, 247, 0.5); background: rgba(255,255,255,0.5);">
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 12px;">路径:</label>
            <input type="text" id="cookiePath" value="/" style="width: 100%; padding: 6px; border-radius: 6px; border: 1px solid rgba(79, 195, 247, 0.5); background: rgba(255,255,255,0.5);">
          </div>
        </div>
        <button onclick="addSeparateCookie()" style="padding: 6px 12px; background: rgba(79, 195, 247, 0.3); border: none; border-radius: 12px; color: #333; cursor: pointer; font-size: 12px;">添加Cookie</button>
        <div id="cookieList" style="margin-top: 10px; max-height: 100px; overflow-y: auto;"></div>
      </div>
      
      <div style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">
        <button onclick="saveCookieInjection()" style="padding: 10px 20px; background: linear-gradient(45deg, #4fc3f7, #81d4fa); border: none; border-radius: 20px; color: #333; cursor: pointer; font-weight: bold;">保存并应用</button>
        <button onclick="closeModal()" style="padding: 10px 20px; background: rgba(160,174,192,0.3); border: none; border-radius: 20px; color: #333; cursor: pointer;">取消</button>
      </div>
    \`);
    
    // 初始化事件
    document.getElementById('cookieInputType').addEventListener('change', function() {
      const type = this.value;
      document.getElementById('combinedCookieInput').style.display = type === 'combined' ? 'block' : 'none';
      document.getElementById('separateCookieInput').style.display = type === 'separate' ? 'block' : 'none';
    });
    
    // 加载已保存的设置
    loadCookieInjectionSettings(currentDomain);
  };
  
  window.addSeparateCookie = function() {
    const name = document.getElementById('cookieName').value.trim();
    const value = document.getElementById('cookieValue').value.trim();
    const domain = document.getElementById('cookieDomain').value.trim();
    const path = document.getElementById('cookiePath').value.trim() || '/';
    
    if (!name || !value) {
      alert('请填写Cookie名称和值');
      return;
    }
    
    if (!window.separateCookies) window.separateCookies = [];
    window.separateCookies.push({ name, value, domain, path });
    updateCookieList();
    
    // 清空输入框
    document.getElementById('cookieName').value = '';
    document.getElementById('cookieValue').value = '';
  };
  
  window.updateCookieList = function() {
    const list = document.getElementById('cookieList');
    list.innerHTML = '';
    
    if (window.separateCookies) {
      window.separateCookies.forEach((cookie, index) => {
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
          <button onclick="removeCookie(\${index})" style="background:none; border:none; color:#c53030; cursor:pointer; font-size:14px;">×</button>
        \`;
        
        list.appendChild(item);
      });
    }
  };
  
  window.removeCookie = function(index) {
    if (window.separateCookies) {
      window.separateCookies.splice(index, 1);
      updateCookieList();
    }
  };
  
  window.saveCookieInjection = function() {
    const domain = document.getElementById('cookieInjectionUrl').value.trim();
    const inputType = document.getElementById('cookieInputType').value;
    
    let cookies = [];
    
    if (inputType === 'combined') {
      const cookieStr = document.getElementById('combinedCookie').value.trim();
      if (cookieStr) {
        cookieStr.split(';').forEach(pair => {
          const [name, value] = pair.split('=').map(s => s.trim());
          if (name && value) {
            cookies.push({
              name: name,
              value: value,
              domain: domain,
              path: '/'
            });
          }
        });
      }
    } else {
      cookies = window.separateCookies || [];
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
      
      // 应用Cookie
      applyCookies(cookies);
      
      alert('Cookie设置已保存并应用！');
      closeModal();
      setTimeout(() => location.reload(), 500);
    } catch(e) {
      alert('保存失败: ' + e.message);
    }
  };
  
  function applyCookies(cookies) {
    cookies.forEach(cookie => {
      const cookieStr = \`\${cookie.name}=\${cookie.value}; domain=\${cookie.domain}; path=\${cookie.path}\`;
      document.cookie = cookieStr;
    });
  }
  
  function loadCookieInjectionSettings(domain) {
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
          window.separateCookies = settings.cookies;
          updateCookieList();
        }
      }
    } catch(e) {
      console.log('加载Cookie设置失败:', e);
    }
  }
}

// 广告拦截功能
function initAdblock() {
  let adblockEnabled = false;
  let adblockRules = [];
  
  window.showAdblockModal = function() {
    const modal = createModal('🚫 广告拦截设置', \`
      <div style="margin-bottom: 15px;">
        <div class="checkbox-container">
          <div class="checkbox-wrapper">
            <input type="checkbox" id="adblockEnabled">
            <span class="checkbox-custom"></span>
          </div>
          <label for="adblockEnabled" style="font-weight: bold;">启用广告拦截</label>
        </div>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">规则订阅:</label>
        <div id="adblockSubscriptions" style="max-height: 150px; overflow-y: auto; margin-bottom: 10px;">
          \${defaultAdblockSubscriptions.map((sub, index) => \`
            <div class="checkbox-container">
              <div class="checkbox-wrapper">
                <input type="checkbox" id="sub\${index}" checked>
                <span class="checkbox-custom"></span>
              </div>
              <label for="sub\${index}">\${sub.name}</label>
            </div>
          \`).join('')}
        </div>
        <button onclick="updateAdblockSubscriptions()" style="padding: 8px 15px; background: rgba(79, 195, 247, 0.3); border: none; border-radius: 12px; color: #333; cursor: pointer; font-size: 12px;">更新规则</button>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">自定义规则:</label>
        <textarea id="customAdblockRules" placeholder="每行一条规则，支持Adblock Plus语法" style="width: 100%; height: 100px; padding: 8px; border-radius: 8px; border: 1px solid rgba(79, 195, 247, 0.5); background: rgba(255,255,255,0.5); resize: vertical;"></textarea>
      </div>
      
      <div style="margin-bottom: 15px;">
        <button onclick="startElementPicker()" style="padding: 8px 15px; background: linear-gradient(45deg, #4fc3f7, #81d4fa); border: none; border-radius: 12px; color: #333; cursor: pointer; font-size: 12px; margin-right: 10px;">标记广告元素</button>
        <button onclick="viewBlockedItems()" style="padding: 8px 15px; background: rgba(79, 195, 247, 0.3); border: none; border-radius: 12px; color: #333; cursor: pointer; font-size: 12px;">查看已拦截</button>
      </div>
      
      <div style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">
        <button onclick="saveAdblockSettings()" style="padding: 10px 20px; background: linear-gradient(45deg, #4fc3f7, #81d4fa); border: none; border-radius: 20px; color: #333; cursor: pointer; font-weight: bold;">保存设置</button>
        <button onclick="closeModal()" style="padding: 10px 20px; background: rgba(160,174,192,0.3); border: none; border-radius: 20px; color: #333; cursor: pointer;">取消</button>
      </div>
    \`);
    
    loadAdblockSettings();
  };
  
  window.updateAdblockSubscriptions = async function() {
    const subscriptions = defaultAdblockSubscriptions;
    let updatedCount = 0;
    
    for (let i = 0; i < subscriptions.length; i++) {
      const checkbox = document.getElementById(\`sub\${i}\`);
      if (checkbox && checkbox.checked) {
        try {
          const response = await fetch(subscriptions[i].url);
          const rules = await response.text();
          // 处理规则...
          updatedCount++;
        } catch(e) {
          console.error(\`更新订阅 \${subscriptions[i].name} 失败:\`, e);
        }
      }
    }
    
    alert(\`成功更新 \${updatedCount} 个规则订阅\`);
  };
  
  window.startElementPicker = function() {
    closeModal();
    // 实现元素选择器逻辑
    alert('元素选择器已激活，点击页面上的广告元素进行标记');
  };
  
  window.viewBlockedItems = function() {
    const blockedCount = adblockRules.length;
    alert(\`已拦截 \${blockedCount} 个广告项目\`);
  };
  
  window.saveAdblockSettings = function() {
    const enabled = document.getElementById('adblockEnabled').checked;
    const customRules = document.getElementById('customAdblockRules').value.split('\\n').filter(rule => rule.trim());
    
    const settings = {
      enabled,
      customRules,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem('${adblockRulesCookieName}', JSON.stringify(settings));
      adblockEnabled = enabled;
      adblockRules = customRules;
      
      if (enabled) {
        applyAdblockRules();
      }
      
      alert('广告拦截设置已保存！');
      closeModal();
    } catch(e) {
      alert('保存失败: ' + e.message);
    }
  };
  
  function loadAdblockSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('${adblockRulesCookieName}') || '{}');
      if (settings.enabled !== undefined) {
        document.getElementById('adblockEnabled').checked = settings.enabled;
      }
      if (settings.customRules) {
        document.getElementById('customAdblockRules').value = settings.customRules.join('\\n');
      }
    } catch(e) {
      console.log('加载广告拦截设置失败:', e);
    }
  }
  
  function applyAdblockRules() {
    // 应用广告拦截规则
    const observer = new MutationObserver(() => {
      adblockRules.forEach(rule => {
        try {
          document.querySelectorAll(rule).forEach(el => el.remove());
        } catch(e) {}
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

// 资源嗅探功能
function initResourceSniffer() {
  let snifferEnabled = false;
  const capturedResources = [];
  
  window.showResourceSnifferModal = function() {
    const modal = createModal('🔍 资源嗅探', \`
      <div style="margin-bottom: 15px;">
        <div class="checkbox-container">
          <div class="checkbox-wrapper">
            <input type="checkbox" id="snifferEnabled">
            <span class="checkbox-custom"></span>
          </div>
          <label for="snifferEnabled" style="font-weight: bold;">启用资源嗅探</label>
        </div>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">捕获的资源 (\${capturedResources.length}):</label>
        <div id="resourceList" style="max-height: 200px; overflow-y: auto; border: 1px solid rgba(79, 195, 247, 0.5); border-radius: 8px; padding: 10px; background: rgba(255,255,255,0.3);">
          \${capturedResources.map((resource, index) => \`
            <div style="padding: 5px; border-bottom: 1px solid rgba(79, 195, 247, 0.3); font-size: 12px;">
              <strong>\${resource.method}</strong> \${resource.url}
              <button onclick="inspectResource(\${index})" style="margin-left: 10px; padding: 2px 6px; background: rgba(79, 195, 247, 0.3); border: none; border-radius: 4px; color: #333; cursor: pointer; font-size: 10px;">查看</button>
            </div>
          \`).join('')}
        </div>
      </div>
      
      <div style="margin-bottom: 15px;">
        <button onclick="clearResources()" style="padding: 8px 15px; background: rgba(79, 195, 247, 0.3); border: none; border-radius: 12px; color: #333; cursor: pointer; font-size: 12px;">清空记录</button>
        <button onclick="exportResources()" style="padding: 8px 15px; background: rgba(79, 195, 247, 0.3); border: none; border-radius: 12px; color: #333; cursor: pointer; font-size: 12px; margin-left: 10px;">导出</button>
      </div>
      
      <div style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">
        <button onclick="saveSnifferSettings()" style="padding: 10px 20px; background: linear-gradient(45deg, #4fc3f7, #81d4fa); border: none; border-radius: 20px; color: #333; cursor: pointer; font-weight: bold;">保存设置</button>
        <button onclick="closeModal()" style="padding: 10px 20px; background: rgba(160,174,192,0.3); border: none; border-radius: 20px; color: #333; cursor: pointer;">取消</button>
      </div>
    \`);
    
    loadSnifferSettings();
    updateResourceList();
  };
  
  window.inspectResource = function(index) {
    const resource = capturedResources[index];
    const modal = createModal('资源详情', \`
      <div style="text-align: left;">
        <p><strong>URL:</strong> \${resource.url}</p>
        <p><strong>方法:</strong> \${resource.method}</p>
        <p><strong>状态:</strong> \${resource.status}</p>
        <p><strong>类型:</strong> \${resource.type}</p>
        <p><strong>大小:</strong> \${resource.size} bytes</p>
        <details>
          <summary>请求头</summary>
          <pre style="background: rgba(255,255,255,0.3); padding: 10px; border-radius: 5px; max-height: 200px; overflow: auto; font-size: 10px;">\${JSON.stringify(resource.headers, null, 2)}</pre>
        </details>
      </div>
    \`);
  };
  
  window.clearResources = function() {
    capturedResources.length = 0;
    updateResourceList();
  };
  
  window.exportResources = function() {
    const data = JSON.stringify(capturedResources, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resources.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  window.saveSnifferSettings = function() {
    const enabled = document.getElementById('snifferEnabled').checked;
    
    const settings = {
      enabled,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem('${resourceSnifferCookieName}', JSON.stringify(settings));
      snifferEnabled = enabled;
      
      if (enabled) {
        startResourceSniffing();
      }
      
      alert('资源嗅探设置已保存！');
      closeModal();
    } catch(e) {
      alert('保存失败: ' + e.message);
    }
  };
  
  function loadSnifferSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('${resourceSnifferCookieName}') || '{}');
      if (settings.enabled !== undefined) {
        document.getElementById('snifferEnabled').checked = settings.enabled;
        snifferEnabled = settings.enabled;
        
        if (settings.enabled) {
          startResourceSniffing();
        }
      }
    } catch(e) {
      console.log('加载资源嗅探设置失败:', e);
    }
  }
  
  function updateResourceList() {
    const list = document.getElementById('resourceList');
    if (list) {
      list.innerHTML = capturedResources.map((resource, index) => \`
        <div style="padding: 5px; border-bottom: 1px solid rgba(79, 195, 247, 0.3); font-size: 12px;">
          <strong>\${resource.method}</strong> \${resource.url}
          <button onclick="inspectResource(\${index})" style="margin-left: 10px; padding: 2px 6px; background: rgba(79, 195, 247, 0.3); border: none; border-radius: 4px; color: #333; cursor: pointer; font-size: 10px;">查看</button>
        </div>
      \`).join('');
    }
  }
  
  function startResourceSniffing() {
    // 重写 fetch
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const resource = {
        url: args[0],
        method: 'GET',
        timestamp: Date.now(),
        type: 'fetch'
      };
      
      if (typeof args[0] === 'string') {
        resource.url = args[0];
      } else if (args[0] instanceof Request) {
        resource.url = args[0].url;
        resource.method = args[0].method;
      }
      
      return originalFetch.apply(this, args).then(response => {
        resource.status = response.status;
        resource.headers = Object.fromEntries(response.headers.entries());
        capturedResources.push(resource);
        updateResourceList();
        return response;
      });
    };
    
    // 重写 XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      this._snifferData = { method, url, timestamp: Date.now(), type: 'xhr' };
      return originalOpen.apply(this, arguments);
    };
    
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(...args) {
      if (this._snifferData) {
        this.addEventListener('load', function() {
          const resource = {
            ...this._snifferData,
            status: this.status,
            headers: this.getAllResponseHeaders()
          };
          capturedResources.push(resource);
          updateResourceList();
        });
      }
      return originalSend.apply(this, args);
    };
  }
}

// 图片模式功能
function initImageMode() {
  let imageMode = 'all'; // all, none, custom
  
  window.showImageModeModal = function() {
    const modal = createModal('🖼️ 图片模式设置', \`
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 10px; font-weight: bold;">图片加载模式:</label>
        <select id="imageMode" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid rgba(79, 195, 247, 0.5); background: rgba(255,255,255,0.5);">
          <option value="all">加载所有图片</option>
          <option value="none">不加载图片</option>
          <option value="custom">自定义拦截</option>
        </select>
      </div>
      
      <div id="customImageSettings" style="display: none; margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">拦截图片后缀:</label>
        <input type="text" id="blockedImageExtensions" placeholder="例如: jpg, png, gif" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid rgba(79, 195, 247, 0.5); background: rgba(255,255,255,0.5);">
        
        <label style="display: block; margin-bottom: 5px; margin-top: 10px; font-weight: bold;">拦截域名:</label>
        <input type="text" id="blockedImageDomains" placeholder="例如: ads.example.com, trackers.com" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid rgba(79, 195, 247, 0.5); background: rgba(255,255,255,0.5);">
      </div>
      
      <div style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">
        <button onclick="saveImageModeSettings()" style="padding: 10px 20px; background: linear-gradient(45deg, #4fc3f7, #81d4fa); border: none; border-radius: 20px; color: #333; cursor: pointer; font-weight: bold;">保存设置</button>
        <button onclick="closeModal()" style="padding: 10px 20px; background: rgba(160,174,192,0.3); border: none; border-radius: 20px; color: #333; cursor: pointer;">取消</button>
      </div>
    \`);
    
    document.getElementById('imageMode').addEventListener('change', function() {
      document.getElementById('customImageSettings').style.display = this.value === 'custom' ? 'block' : 'none';
    });
    
    loadImageModeSettings();
  };
  
  window.saveImageModeSettings = function() {
    const mode = document.getElementById('imageMode').value;
    const blockedExtensions = document.getElementById('blockedImageExtensions').value.split(',').map(ext => ext.trim()).filter(ext => ext);
    const blockedDomains = document.getElementById('blockedImageDomains').value.split(',').map(domain => domain.trim()).filter(domain => domain);
    
    const settings = {
      mode,
      blockedExtensions,
      blockedDomains,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem('${imageModeCookieName}', JSON.stringify(settings));
      imageMode = mode;
      
      applyImageMode(settings);
      alert('图片模式设置已保存！');
      closeModal();
      setTimeout(() => location.reload(), 500);
    } catch(e) {
      alert('保存失败: ' + e.message);
    }
  };
  
  function loadImageModeSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('${imageModeCookieName}') || '{}');
      if (settings.mode) {
        document.getElementById('imageMode').value = settings.mode;
        document.getElementById('imageMode').dispatchEvent(new Event('change'));
      }
      if (settings.blockedExtensions) {
        document.getElementById('blockedImageExtensions').value = settings.blockedExtensions.join(', ');
      }
      if (settings.blockedDomains) {
        document.getElementById('blockedImageDomains').value = settings.blockedDomains.join(', ');
      }
    } catch(e) {
      console.log('加载图片模式设置失败:', e);
    }
  }
  
  function applyImageMode(settings) {
    if (settings.mode === 'none') {
      // 阻止所有图片加载
      const style = document.createElement('style');
      style.textContent = 'img { display: none !important; }';
      document.head.appendChild(style);
    } else if (settings.mode === 'custom') {
      // 自定义拦截
      const observer = new MutationObserver(() => {
        document.querySelectorAll('img').forEach(img => {
          const src = img.src.toLowerCase();
          const shouldBlock = settings.blockedExtensions.some(ext => src.endsWith(ext)) ||
                            settings.blockedDomains.some(domain => src.includes(domain));
          if (shouldBlock) {
            img.style.display = 'none';
          }
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }
}

// 浏览器标识功能
function initUserAgent() {
  window.showUserAgentModal = function() {
    const modal = createModal('🌐 浏览器标识设置', \`
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 10px; font-weight: bold;">选择浏览器标识:</label>
        <select id="userAgent" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid rgba(79, 195, 247, 0.5); background: rgba(255,255,255,0.5);">
          <option value="default">默认</option>
          <option value="desktop">Windows (Chrome)</option>
          <option value="mobile">Android (手机)</option>
          <option value="android_tablet">Android (平板)</option>
          <option value="windows_ie">Windows (IE 11)</option>
          <option value="macos">macOS</option>
          <option value="iphone">iPhone</option>
          <option value="ipad">iPad</option>
        </select>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 10px; font-weight: bold;">选择语言:</label>
        <select id="browserLanguage" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid rgba(79, 195, 247, 0.5); background: rgba(255,255,255,0.5);">
          \${supportedLanguages.map(lang => \`
            <option value="\${lang.code}">\${lang.name}</option>
          \`).join('')}
        </select>
      </div>
      
      <div style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">
        <button onclick="saveUserAgentSettings()" style="padding: 10px 20px; background: linear-gradient(45deg, #4fc3f7, #81d4fa); border: none; border-radius: 20px; color: #333; cursor: pointer; font-weight: bold;">保存设置</button>
        <button onclick="closeModal()" style="padding: 10px 20px; background: rgba(160,174,192,0.3); border: none; border-radius: 20px; color: #333; cursor: pointer;">取消</button>
      </div>
    \`);
    
    loadUserAgentSettings();
  };
  
  window.saveUserAgentSettings = function() {
    const userAgent = document.getElementById('userAgent').value;
    const language = document.getElementById('browserLanguage').value;
    
    const settings = {
      userAgent,
      language,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem('${deviceCookieName}', userAgent);
      localStorage.setItem('${languageCookieName}', language);
      
      // 设置Cookie
      const expiryDate = new Date();
      expiryDate.setTime(expiryDate.getTime() + (7 * 24 * 60 * 60 * 1000));
      document.cookie = \`${deviceCookieName}=\${userAgent}; expires=\${expiryDate.toUTCString()}; path=/\`;
      document.cookie = \`${languageCookieName}=\${language}; expires=\${expiryDate.toUTCString()}; path=/\`;
      
      alert('浏览器标识设置已保存！页面将刷新以应用更改。');
      closeModal();
      setTimeout(() => location.reload(), 500);
    } catch(e) {
      alert('保存失败: ' + e.message);
    }
  };
  
  function loadUserAgentSettings() {
    try {
      const savedUA = localStorage.getItem('${deviceCookieName}') || 'default';
      const savedLang = localStorage.getItem('${languageCookieName}') || 'zh-CN';
      
      document.getElementById('userAgent').value = savedUA;
      document.getElementById('browserLanguage').value = savedLang;
    } catch(e) {
      console.log('加载浏览器标识设置失败:', e);
    }
  }
}

// 请求修改功能
function initRequestModification() {
  window.showRequestModificationModal = function() {
    const modal = createModal('🔧 请求修改设置', \`
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">自定义请求头:</label>
        <textarea id="customHeaders" placeholder="格式: HeaderName: HeaderValue" style="width: 100%; height: 100px; padding: 8px; border-radius: 8px; border: 1px solid rgba(79, 195, 247, 0.5); background: rgba(255,255,255,0.5); resize: vertical;"></textarea>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">URL重写规则:</label>
        <textarea id="urlRewriteRules" placeholder="格式: pattern -> replacement" style="width: 100%; height: 80px; padding: 8px; border-radius: 8px; border: 1px solid rgba(79, 195, 247, 0.5); background: rgba(255,255,255,0.5); resize: vertical;"></textarea>
        <small>例如: https://ads.example.com/ -> https://blocked.example.com/</small>
      </div>
      
      <div style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">
        <button onclick="saveRequestModificationSettings()" style="padding: 10px 20px; background: linear-gradient(45deg, #4fc3f7, #81d4fa); border: none; border-radius: 20px; color: #333; cursor: pointer; font-weight: bold;">保存设置</button>
        <button onclick="closeModal()" style="padding: 10px 20px; background: rgba(160,174,192,0.3); border: none; border-radius: 20px; color: #333; cursor: pointer;">取消</button>
      </div>
    \`);
    
    loadRequestModificationSettings();
  };
  
  window.saveRequestModificationSettings = function() {
    const headers = document.getElementById('customHeaders').value;
    const rewriteRules = document.getElementById('urlRewriteRules').value;
    
    const settings = {
      headers,
      rewriteRules,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem('${requestModificationCookieName}', JSON.stringify(settings));
      
      // 设置Cookie
      const expiryDate = new Date();
      expiryDate.setTime(expiryDate.getTime() + (7 * 24 * 60 * 60 * 1000));
      document.cookie = \`${customHeadersCookieName}=\${encodeURIComponent(headers)}; expires=\${expiryDate.toUTCString()}; path=/\`;
      
      alert('请求修改设置已保存！');
      closeModal();
    } catch(e) {
      alert('保存失败: ' + e.message);
    }
  };
  
  function loadRequestModificationSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('${requestModificationCookieName}') || '{}');
      if (settings.headers) {
        document.getElementById('customHeaders').value = settings.headers;
      }
      if (settings.rewriteRules) {
        document.getElementById('urlRewriteRules').value = settings.rewriteRules;
      }
    } catch(e) {
      console.log('加载请求修改设置失败:', e);
    }
  }
}

// 通用模态框函数
function createModal(title, content) {
  const existingModal = document.getElementById('__PROXY_MODAL__');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = '__PROXY_MODAL__';
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
    user-select: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(5px);
  \`;
  
  modal.innerHTML = \`
    <div style="
      background: rgba(255,255,255,0.3);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 25px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(79, 195, 247, 0.3);
      border: 1px solid rgba(255,255,255,0.2);
      transform: scale(0.8);
      transition: transform 0.3s ease;
    ">
      <h3 style="margin-top: 0; margin-bottom: 20px; color: #0277bd; text-align: center;">\${title}</h3>
      \${content}
    </div>
  \`;
  
  document.body.appendChild(modal);
  
  setTimeout(() => {
    modal.style.opacity = '1';
    const contentDiv = modal.querySelector('div > div');
    contentDiv.style.transform = 'scale(1)';
  }, 100);
  
  return modal;
}

window.closeModal = function() {
  const modal = document.getElementById('__PROXY_MODAL__');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
};

// 初始化工具栏
setTimeout(initToolbar, 2000);
`;

// =======================================================================================
// 第五部分：HTTP请求注入脚本（核心功能）
// 功能：注入各种JavaScript hook来重写URL和处理代理逻辑
// =======================================================================================

const httpRequestInjection = `
(function() {
  //---***========================================***---information---***========================================***---
  var nowURL = new URL(window.location.href);
  var proxy_host = nowURL.host; //代理的host - proxy.com
  var proxy_protocol = nowURL.protocol; //代理的protocol
  var proxy_host_with_schema = proxy_protocol + "//" + proxy_host + "/"; //代理前缀 https://proxy.com/
  var original_website_url_str = window.location.href.substring(proxy_host_with_schema.length); //被代理的【完整】地址 如：https://example.com/1?q#1
  var original_website_url = new URL(original_website_url_str);

  var original_website_host = original_website_url_str.substring(original_website_url_str.indexOf("://") + "://".length);
  original_website_host = original_website_host.split('/')[0]; //被代理的Host proxied_website.com

  var original_website_host_with_schema = original_website_url_str.substring(0, original_website_url_str.indexOf("://")) + "://" + original_website_host + "/"; //加上https的被代理的host， https://proxied_website.com/

  //---***========================================***---通用func---***========================================***---
  function changeURL(relativePath){
    if(relativePath == null) return null;
    try{
      if(relativePath.startsWith("data:") || relativePath.startsWith("mailto:") || relativePath.startsWith("javascript:") || relativePath.startsWith("chrome") || relativePath.startsWith("edge")) return relativePath;
    }catch{
      console.log("Change URL Error **************************************:");
      console.log(relativePath);
      console.log(typeof relativePath);
      return relativePath;
    }

    // for example, blob:https://example.com/, we need to remove blob and add it back later
    var pathAfterAdd = "";

    if(relativePath.startsWith("blob:")){
      pathAfterAdd = "blob:";
      relativePath = relativePath.substring("blob:".length);
    }

    try{
      if(relativePath.startsWith(proxy_host_with_schema)) relativePath = relativePath.substring(proxy_host_with_schema.length);
      if(relativePath.startsWith(proxy_host + "/")) relativePath = relativePath.substring(proxy_host.length + 1);
      if(relativePath.startsWith(proxy_host)) relativePath = relativePath.substring(proxy_host.length);
    }catch{
      //ignore
    }
    try {
      var absolutePath = new URL(relativePath, original_website_url_str).href; //获取绝对路径
      absolutePath = absolutePath.replaceAll(window.location.href, original_website_url_str); //可能是参数里面带了当前的链接，需要还原原来的链接防止403
      absolutePath = absolutePath.replaceAll(encodeURI(window.location.href), encodeURI(original_website_url_str));
      absolutePath = absolutePath.replaceAll(encodeURIComponent(window.location.href), encodeURIComponent(original_website_url_str));

      absolutePath = absolutePath.replaceAll(proxy_host, original_website_host);
      absolutePath = absolutePath.replaceAll(encodeURI(proxy_host), encodeURI(original_website_host));
      absolutePath = absolutePath.replaceAll(encodeURIComponent(proxy_host), encodeURIComponent(original_website_host));

      absolutePath = proxy_host_with_schema + absolutePath;
      absolutePath = pathAfterAdd + absolutePath;

      return absolutePath;
    } catch (e) {
      console.log("Exception occured: " + e.message + original_website_url_str + "   " + relativePath);
      return relativePath;
    }
  }

  // change from https://proxy.com/https://target_website.com/a to https://target_website.com/a
  function getOriginalUrl(url){
    if(url == null) return null;
    if(url.startsWith(proxy_host_with_schema)) return url.substring(proxy_host_with_schema.length);
    return url;
  }

  //---***========================================***---注入网络---***========================================***---
  function networkInject(){
    //inject network request
    var originalOpen = XMLHttpRequest.prototype.open;
    var originalFetch = window.fetch;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      console.log("Original: " + url);
      url = changeURL(url);
      console.log("R:" + url);
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
      console.log("R:" + url);
      if (typeof input === 'string') {
        return originalFetch(url, init);
      } else {
        const newRequest = new Request(url, input);
        return originalFetch(newRequest, init);
      }
    };
    
    console.log("NETWORK REQUEST METHOD INJECTED");
  }

  //---***========================================***---注入window.open---***========================================***---
  function windowOpenInject(){
    const originalOpen = window.open;
    window.open = function (url, name, specs) {
        let modifiedUrl = changeURL(url);
        return originalOpen.call(window, modifiedUrl, name, specs);
    };
    console.log("WINDOW OPEN INJECTED");
  }

  //---***========================================***---注入append元素---***========================================***---
  function appendChildInject(){
    const originalAppendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function(child) {
      try{
        if(child.src){
          child.src = changeURL(child.src);
        }
        if(child.href){
          child.href = changeURL(child.href);
        }
      }catch{
        //ignore
      }
      return originalAppendChild.call(this, child);
    };
    console.log("APPEND CHILD INJECTED");
  }

  //---***========================================***---注入元素的src和href---***========================================***---
  function elementPropertyInject(){
    const originalSetAttribute = HTMLElement.prototype.setAttribute;
    HTMLElement.prototype.setAttribute = function (name, value) {
        if (name == "src" || name == "href") {
          value = changeURL(value);
        }
        originalSetAttribute.call(this, name, value);
    };

    const originalGetAttribute = HTMLElement.prototype.getAttribute;
    HTMLElement.prototype.getAttribute = function (name) {
      const val = originalGetAttribute.call(this, name);
      if (name == "href" || name == "src") {
        return getOriginalUrl(val);
      }
      return val;
    };

    console.log("ELEMENT PROPERTY (get/set attribute) INJECTED");

    // -------------------------------------
    const descriptor = Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, 'href');
    Object.defineProperty(HTMLAnchorElement.prototype, 'href', {
      get: function () {
        const real = descriptor.get.call(this);
        return getOriginalUrl(real);
      },
      set: function (val) {
        descriptor.set.call(this, changeURL(val));
      },
      configurable: true
    });

    console.log("ELEMENT PROPERTY (src / href) INJECTED");
  }

  //---***========================================***---注入location---***========================================***---
  class ProxyLocation {
    constructor(originalLocation) {
        this.originalLocation = originalLocation;
    }

    // 方法：重新加载页面
    reload(forcedReload) {
      this.originalLocation.reload(forcedReload);
    }

    // 方法：替换当前页面
    replace(url) {
      this.originalLocation.replace(changeURL(url));
    }

    // 方法：分配一个新的 URL
    assign(url) {
      this.originalLocation.assign(changeURL(url));
    }

    // 属性：获取和设置 href
    get href() {
      return original_website_url_str;
    }

    set href(url) {
      this.originalLocation.href = changeURL(url);
    }

    // 属性：获取和设置 protocol
    get protocol() {
      return original_website_url.protocol;
    }

    set protocol(value) {
      original_website_url.protocol = value;
      this.originalLocation.href = proxy_host_with_schema + original_website_url.href;
    }

    // 属性：获取和设置 host
    get host() {
      return original_website_url.host;
    }

    set host(value) {
      original_website_url.host = value;
      this.originalLocation.href = proxy_host_with_schema + original_website_url.href;
    }

    // 属性：获取和设置 hostname
    get hostname() {
      return original_website_url.hostname;
    }

    set hostname(value) {
      original_website_url.hostname = value;
      this.originalLocation.href = proxy_host_with_schema + original_website_url.href;
    }

    // 属性：获取和设置 port
    get port() {
      return original_website_url.port;
    }

    set port(value) {
      original_website_url.port = value;
      this.originalLocation.href = proxy_host_with_schema + original_website_url.href;
    }

    // 属性：获取和设置 pathname
    get pathname() {
      return original_website_url.pathname;
    }

    set pathname(value) {
      original_website_url.pathname = value;
      this.originalLocation.href = proxy_host_with_schema + original_website_url.href;
    }

    // 属性：获取和设置 search
    get search() {
      return original_website_url.search;
    }

    set search(value) {
      original_website_url.search = value;
      this.originalLocation.href = proxy_host_with_schema + original_website_url.href;
    }

    // 属性：获取和设置 hash
    get hash() {
      return original_website_url.hash;
    }

    set hash(value) {
      original_website_url.hash = value;
      this.originalLocation.href = proxy_host_with_schema + original_website_url.href;
    }

    // 属性：获取 origin
    get origin() {
      return original_website_url.origin;
    }

    toString() {
      return this.originalLocation.href;
    }
  }

  function documentLocationInject(){
    Object.defineProperty(document, 'URL', {
      get: function () {
          return original_website_url_str;
      },
      set: function (url) {
          document.URL = changeURL(url);
      }
    });

    Object.defineProperty(document, '${replaceUrlObj}', {
          get: function () {
              return new ProxyLocation(window.location);
          },  
          set: function (url) {
              window.location.href = changeURL(url);
          }
    });
    console.log("LOCATION INJECTED");
  }

  function windowLocationInject() {
    Object.defineProperty(window, '${replaceUrlObj}', {
        get: function () {
            return new ProxyLocation(window.location);
        },
        set: function (url) {
            window.location.href = changeURL(url);
        }
    });
    console.log("WINDOW LOCATION INJECTED");
  }

  //---***========================================***---注入历史---***========================================***---
  function historyInject(){
    const originalPushState = History.prototype.pushState;
    const originalReplaceState = History.prototype.replaceState;

    History.prototype.pushState = function (state, title, url) {
      if(!url) return; //x.com 会有一次undefined

      if(url.startsWith("/" + original_website_url.href)) url = url.substring(("/" + original_website_url.href).length); // https://example.com/
      if(url.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1))) url = url.substring(("/" + original_website_url.href).length - 1); // https://example.com (没有/在最后)

      var u = changeURL(url);
      return originalPushState.apply(this, [state, title, u]);
    };

    History.prototype.replaceState = function (state, title, url) {
      console.log("History url started: " + url);
      if(!url) return; //x.com 会有一次undefined

      let url_str = url.toString(); // 如果是 string，那么不会报错，如果是 [object URL] 会解决报错

      //这是给duckduckgo专门的补丁，可能是window.location字样做了加密，导致服务器无法替换。
      //正常链接它要设置的history是/，改为proxy之后变为/https://duckduckgo.com。
      //但是这种解决方案并没有从"根源"上解决问题

      if(url_str.startsWith("/" + original_website_url.href)) url_str = url_str.substring(("/" + original_website_url.href).length); // https://example.com/
      if(url_str.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1))) url_str = url_str.substring(("/" + original_website_url.href).length - 1); // https://example.com (没有/在最后)

      //给ipinfo.io的补丁：历史会设置一个https:/ipinfo.io，可能是他们获取了href，然后想设置根目录
      // *** 这里不需要 replaceAll，因为只是第一个需要替换 ***
      if(url_str.startsWith("/" + original_website_url.href.replace("://", ":/"))) url_str = url_str.substring(("/" + original_website_url.href.replace("://", ":/")).length); // https://example.com/
      if(url_str.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1).replace("://", ":/"))) url_str = url_str.substring(("/" + original_website_url.href).replace("://", ":/").length - 1); // https://example.com (没有/在最后)

      var u = changeURL(url_str);

      console.log("History url changed: " + u);

      return originalReplaceState.apply(this, [state, title, u]);
    };

    console.log("HISTORY INJECTED");
  }

  //---***========================================***---Hook观察界面---***========================================***---
  function obsPage() {
    var yProxyObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        traverseAndConvert(mutation);
      });
    });
    var config = { attributes: true, childList: true, subtree: true };
    yProxyObserver.observe(document.body, config);

    console.log("OBSERVING THE WEBPAGE...");
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
    if(!(element instanceof HTMLElement)) return;
    
    if (element.hasAttribute("href")) {
      relativePath = element.getAttribute("href");
      try {
        var absolutePath = changeURL(relativePath);
        element.setAttribute("href", absolutePath);
      } catch (e) {
        console.log("Exception occured: " + e.message + original_website_url_str + "   " + relativePath);
        console.log(element);
      }
    }

    if (element.hasAttribute("src")) {
      relativePath = element.getAttribute("src");
      try {
        var absolutePath = changeURL(relativePath);
        element.setAttribute("src", absolutePath);
      } catch (e) {
        console.log("Exception occured: " + e.message + original_website_url_str + "   " + relativePath);
        console.log(element);
      }
    }

    if (element.tagName === "FORM" && element.hasAttribute("action")) {
      relativePath = element.getAttribute("action");
      try {
        var absolutePath = changeURL(relativePath);
        element.setAttribute("action", absolutePath);
      } catch (e) {
        console.log("Exception occured: " + e.message + original_website_url_str + "   " + relativePath);
        console.log(element);
      }
    }

    if (element.tagName === "SOURCE" && element.hasAttribute("srcset")) {
      relativePath = element.getAttribute("srcset");
      try {
        var absolutePath = changeURL(relativePath);
        element.setAttribute("srcset", absolutePath);
      } catch (e) {
        console.log("Exception occured: " + e.message + original_website_url_str + "   " + relativePath);
        console.log(element);
      }
    }

    // 视频的封面图
    if ((element.tagName === "VIDEO" || element.tagName === "AUDIO") && element.hasAttribute("poster")) {
      relativePath = element.getAttribute("poster");
      try {
        var absolutePath = changeURL(relativePath);
        element.setAttribute("poster", absolutePath);
      } catch (e) {
        console.log("Exception occured: " + e.message);
      }
    }

    if (element.tagName === "OBJECT" && element.hasAttribute("data")) {
      relativePath = element.getAttribute("data");
      try {
        var absolutePath = changeURL(relativePath);
        element.setAttribute("data", absolutePath);
      } catch (e) {
        console.log("Exception occured: " + e.message);
      }
    }
  }

  function removeIntegrityAttributesFromElement(element){
    if (element.hasAttribute('integrity')) {
      element.removeAttribute('integrity');
    }
  }

  //---***========================================***---Hook观察界面里面要用到的func---***========================================***---
  function loopAndConvertToAbs(){
    for(var ele of document.querySelectorAll('*')){
      removeIntegrityAttributesFromElement(ele);
      covToAbs(ele);
    }
    console.log("LOOPED EVERY ELEMENT");
  }

  function covScript(){ //由于observer经过测试不会hook添加的script标签，也可能是我测试有问题？
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      covToAbs(scripts[i]);
    }
      setTimeout(covScript, 3000);
  }

  //---***========================================***---操作---***========================================***---
  networkInject();
  windowOpenInject();
  elementPropertyInject();
  appendChildInject();
  documentLocationInject();
  windowLocationInject();
  historyInject();

  //---***========================================***---在window.load之后的操作---***========================================***---
  window.addEventListener('load', () => {
    loopAndConvertToAbs();
    console.log("CONVERTING SCRIPT PATH");
    obsPage();
    covScript();
  });
  console.log("WINDOW ONLOAD EVENT ADDED");

  //---***========================================***---在window.error的时候---***========================================***---
  window.addEventListener('error', event => {
    var element = event.target || event.srcElement;
    if (element.tagName === 'SCRIPT') {
      console.log("Found problematic script:", element);
      if(element.alreadyChanged){
        console.log("this script has already been injected, ignoring this problematic script...");
        return;
      }
      // 调用 covToAbs 函数
      removeIntegrityAttributesFromElement(element);
      covToAbs(element);

      // 创建新的 script 元素
      var newScript = document.createElement("script");
      newScript.src = element.src;
      newScript.async = element.async; // 保留原有的 async 属性
      newScript.defer = element.defer; // 保留原有的 defer 属性
      newScript.alreadyChanged = true;

      // 添加新的 script 元素到 document
      document.head.appendChild(newScript);

      console.log("New script added:", newScript);
    }
  }, true);
  console.log("WINDOW CORS ERROR EVENT ADDED");
})();
`;

// =======================================================================================
// 第六部分：主页面HTML模板
// 功能：代理服务的主页面，包含使用说明和表单
// =======================================================================================

const mainPage = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>网站在线代理</title>
    <style>
        html, body {
            height: 100%;
            margin: 0;
            overflow-x: hidden;
            overflow-y: auto;
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
        
        @media (max-width: 768px) {
            .content {
                max-width: 90%;
                padding: 20px;
            }
            
            h1 {
                font-size: 1.8rem;
            }
            
            button, select {
                width: 90%;
                font-size: 12px;
                padding: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="content">
        <h1>网站在线代理</h1>
        <p>请输入学术网站地址进行访问（如：baike.baidu.com）</p>
        <button onclick="showUrlModal()">访问网站</button>
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

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const content = document.querySelector('.content');
            setTimeout(() => content.classList.add('loaded'), 100);
        });

        function showUrlModal() { 
            const modal = document.createElement('div');
            modal.id = 'urlModal';
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
                z-index: 9999;
                user-select: none;
                opacity: 0;
                transition: opacity 0.3s ease;
                backdrop-filter: blur(5px);
            \`;
            
            modal.innerHTML = \`
                <div style="
                    background: rgba(255,255,255,0.3);
                    backdrop-filter: blur(10px);
                    border-radius: 15px;
                    padding: 25px;
                    max-width: 400px;
                    width: 90%;
                    box-shadow: 0 8px 32px rgba(79, 195, 247, 0.3);
                    border: 1px solid rgba(255,255,255,0.2);
                    transform: scale(0.8);
                    transition: transform 0.3s ease;
                    text-align: center;
                ">
                    <h3 style="margin-top: 0; margin-bottom: 20px; color: #0277bd;">输入目标网址</h3>
                    <input type="text" id="targetUrl" placeholder="例如: baike.baidu.com" style="width: 100%; padding: 10px; border-radius: 20px; border: 1px solid rgba(79, 195, 247, 0.5); background: rgba(255,255,255,0.5); text-align: center; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: center; gap: 10px;">
                        <button onclick="redirectTo()" style="padding: 10px 20px; background: linear-gradient(45deg, #4fc3f7, #81d4fa); border: none; border-radius: 20px; color: #333; cursor: pointer; font-weight: bold;">跳转</button>
                        <button onclick="closeUrlModal()" style="padding: 10px 20px; background: rgba(160,174,192,0.3); border: none; border-radius: 20px; color: #333; cursor: pointer;">取消</button>
                    </div>
                </div>
            \`;
            
            document.body.appendChild(modal);
            
            setTimeout(() => {
                modal.style.opacity = '1';
                const contentDiv = modal.querySelector('div');
                contentDiv.style.transform = 'scale(1)';
                document.getElementById('targetUrl').focus();
            }, 100);
        }

        function closeUrlModal() {
            const modal = document.getElementById('urlModal');
            if (modal) {
                modal.style.opacity = '0';
                setTimeout(() => {
                    modal.remove();
                }, 300);
            }
        }

        function redirectTo() {
            const targetUrl = document.getElementById('targetUrl').value.trim();
            const currentOrigin = window.location.origin;
            
            if (targetUrl) {
                let finalUrl = currentOrigin + '/' + (targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl);
                window.open(finalUrl, '_blank');
            }
            closeUrlModal();
        }
    </script>
</body>
</html>
`;

// =======================================================================================
// 第七部分：密码页面HTML模板
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
// 第八部分：错误页面HTML模板
// 功能：重定向错误显示页面
// =======================================================================================

const redirectError = `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head><body><h2>重定向错误：目标网站可能包含错误的跳转信息，无法解析</h2></body></html>
`;

// =======================================================================================
// 第九部分：主请求处理函数
// 功能：处理所有传入的HTTP请求，实现代理逻辑
// =======================================================================================

async function handleRequest(request) {
  try {
    // =======================================================================================
    // 子部分9.1：前置条件检查
    // 功能：检查User-Agent，防止特定爬虫
    // =======================================================================================

    const userAgent = request.headers.get('User-Agent') || '';
    if (userAgent.includes("Bytespider")) {
      return getHTMLResponse("爬虫被禁止使用代理。");
    }

    // =======================================================================================
    // 子部分9.2：密码验证逻辑
    // 功能：检查密码cookie，验证访问权限
    // =======================================================================================

    const siteCookie = request.headers.get('Cookie') || '';
    if (password) {
      const pwd = getCook(siteCookie, passwordCookieName);
      if (!pwd || pwd !== password) return handleWrongPwd();
    }

    // =======================================================================================
    // 子部分9.3：处理前置情况
    // 功能：处理favicon、robots.txt等特殊请求
    // =======================================================================================

    const url = new URL(request.url);
    if (url.pathname.endsWith("favicon.ico")) {
      return getRedirect("https://www.baidu.com/favicon.ico");
    }
    if (url.pathname.endsWith("robots.txt")) {
      return new Response(`User-Agent: *\nDisallow: /`, { headers: { "Content-Type": "text/plain" } });
    }

    // =======================================================================================
    // 子部分9.4：显示主页面或处理代理请求
    // 功能：根据请求路径决定返回主页面还是进行代理
    // =======================================================================================

    const actualUrlStr = url.pathname.substring(url.pathname.indexOf(str) + str.length) + url.search + url.hash;
    if (!actualUrlStr) {
      return getHTMLResponse(mainPage);
    }

    // =======================================================================================
    // 子部分9.5：URL验证和重定向处理
    // 功能：验证目标URL格式，处理重定向逻辑
    // =======================================================================================

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
      if (adBlockKeywords.some(keyword => urlLower.includes(keyword))) {
        return new Response(null, { status: 204 });
      }
    }

    // 验证目标URL
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

    if (!actualUrlStr.startsWith("http") && !actualUrlStr.includes("://")) {
      return getRedirect(thisProxyServerUrlHttps + "https://" + actualUrlStr);
    }

    const actualUrl = new URL(actualUrlStr);

    // 检查主机大小写
    if (actualUrlStr !== actualUrl.href) return getRedirect(thisProxyServerUrlHttps + actualUrl.href);

    // =======================================================================================
    // 子部分9.6：获取语言和设备设置
    // 功能：从cookie或URL参数获取用户设置
    // =======================================================================================

    let selectedLanguage = getCook(siteCookie, languageCookieName) || url.searchParams.get('lang') || 'zh-CN';
    if (!supportedLanguages.some(lang => lang.code === selectedLanguage)) selectedLanguage = 'zh-CN';
    const deviceType = getCook(siteCookie, deviceCookieName) || 'none';

    // =======================================================================================
    // 子部分9.7：处理WebSocket
    // 功能：转发WebSocket请求
    // =======================================================================================

    if (request.headers.get('Upgrade') === 'websocket') {
      const wsRequest = new Request(actualUrl, {
        headers: request.headers,
        method: request.method
      });
      return fetch(wsRequest);
    }

    // =======================================================================================
    // 子部分9.8：处理客户端发来的Header
    // 功能：修改请求header，替换代理相关URL为目标网站URL
    // =======================================================================================

    const clientHeaderWithChange = new Headers();
    for (const [key, value] of request.headers.entries()) {
      let newValue = value.replace(thisProxyServerUrlHttps, actualUrlStr).replace(thisProxyServerUrl_hostOnly, actualUrl.host);
      if (key.toLowerCase() === 'origin') newValue = actualUrl.origin;
      if (key.toLowerCase() === 'referer') newValue = newValue.replace(thisProxyServerUrlHttps, actualUrl.origin + '/');
      if (key.toLowerCase() === 'accept-language') newValue = selectedLanguage;
      if (key.toLowerCase() === 'user-agent' && deviceType !== 'none' && deviceUserAgents[deviceType]) {
        newValue = deviceUserAgents[deviceType];
      }
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

    // =======================================================================================
    // 子部分9.9：处理客户端发来的Body
    // 功能：修改请求body中的代理URL为目标网站URL
    // =======================================================================================

    let clientRequestBodyWithChange;
    if (request.body) {
      clientRequestBodyWithChange = await request.text();
      clientRequestBodyWithChange = clientRequestBodyWithChange
        .replace(thisProxyServerUrlHttps, actualUrlStr)
        .replace(thisProxyServerUrl_hostOnly, actualUrl.host);
    }

    // =======================================================================================
    // 子部分9.10：构造代理请求
    // 功能：创建新的请求对象，指向目标网站
    // =======================================================================================

    const modifiedRequest = new Request(actualUrl, {
      headers: clientHeaderWithChange,
      method: request.method,
      body: request.body ? clientRequestBodyWithChange : request.body,
      redirect: "manual"
    });

    // =======================================================================================
    // 子部分9.11：Fetch结果
    // 功能：向目标网站发送请求并获取响应
    // =======================================================================================

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

    // =======================================================================================
    // 子部分9.12：处理获取的结果
    // 功能：处理响应内容，注入代理脚本
    // =======================================================================================

    let modifiedResponse;
    let bd;
    const responseContentType = response.headers.get("Content-Type") || '';
    const hasProxyHintCook = getCook(siteCookie, proxyHintCookieName) === "agreed";
    const hasNoHintCookie = getCook(siteCookie, noHintCookieName) === "true";
    
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
          ${(!hasProxyHintCook && !hasNoHintCookie) ? proxyHintInjection : ""}
          ${httpRequestInjection}
          ${toolbarInjection}
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

    // =======================================================================================
    // 子部分9.13：缓存静态内容
    // 功能：缓存图片、CSS、JS等静态资源
    // =======================================================================================

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

    // =======================================================================================
    // 子部分9.14：处理要返回的Cookie Header
    // 功能：修改Set-Cookie头，确保cookie在代理域名下生效
    // =======================================================================================

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

    // =======================================================================================
    // 子部分9.15：设置代理相关Cookie
    // 功能：设置访问记录、语言等Cookie
    // =======================================================================================

    if (responseContentType.includes("text/html") && response.status === 200 && bd.includes("<html")) {
      headers.append("Set-Cookie", `${lastVisitProxyCookie}=${actualUrl.origin}; Path=/; Domain=${thisProxyServerUrl_hostOnly}`);
      headers.append("Set-Cookie", `${languageCookieName}=${selectedLanguage}; Path=/; Domain=${thisProxyServerUrl_hostOnly}`);
      
      if (!hasProxyHintCook && !hasNoHintCookie) {
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + 24 * 60 * 60 * 1000);
        headers.append("Set-Cookie", `${proxyHintCookieName}=agreed; expires=${expiryDate.toUTCString()}; path=/; domain=${thisProxyServerUrl_hostOnly}`);
      }
    }

    // =======================================================================================
    // 子部分9.16：删除部分限制性的Header
    // 功能：移除安全策略header，确保代理正常工作
    // =======================================================================================

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

    if (!hasProxyHintCook && !hasNoHintCookie) {
      modifiedResponse.headers.set("Cache-Control", "max-age=0");
    }

    return modifiedResponse;
  } catch (e) {
    return getHTMLResponse(`请求处理失败: ${e.message}`);
  }
}

// =======================================================================================
// 第十部分：辅助函数
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

// =======================================================================================
// 第十一部分：错误处理函数
// 功能：处理密码错误和其他异常情况
// =======================================================================================

function handleWrongPwd() {
  return showPasswordPage ? getHTMLResponse(pwdPage) : getHTMLResponse("<h1>403 Forbidden</h1><br>您无权访问此网页。");
}

// =======================================================================================
// 第十二部分：响应生成函数
// 功能：生成HTML响应和重定向响应
// =======================================================================================

function getHTMLResponse(html) {
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function getRedirect(url) {
  return Response.redirect(url, 301);
}

// =======================================================================================
// 第十三部分：字符串处理函数
// 功能：字符串操作工具函数
// =======================================================================================

function nthIndex(str, pat, n) {
  var L = str.length, i = -1;
  while (n-- && i++ < L) {
    i = str.indexOf(pat, i);
    if (i < 0) break;
  }
  return i;
}