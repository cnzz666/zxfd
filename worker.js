// ======================================================================================= 
// 原作者开源地址:https://github.com/1234567Yang/cf-proxy-ex/
// 本项目基于原作者进行优化修改，开源地址:https://github.com/cnzz666/zxfd
// 第一部分：事件监听和全局变量定义
// 功能：设置fetch事件监听器，初始化代理服务器URL变量
// =======================================================================================

addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  thisProxyServerUrlHttps = `${url.protocol}//${url.hostname}/`;
  thisProxyServerUrl_hostOnly = url.host;
  event.respondWith(handleRequest(event.request))
})

// =======================================================================================
// 第二部分：常量定义
// 功能：定义项目中使用的所有常量和配置变量
// =======================================================================================

const str = "/";
const lastVisitProxyCookie = "__PROXY_VISITEDSITE__";
const passwordCookieName = "__PROXY_PWD__";
const proxyHintCookieName = "__PROXY_HINT__";
const password = "";
const showPasswordPage = true;
const replaceUrlObj = "__location__yproxy__";
const cookieInjectionDataName = "__PROXY_COOKIE_INJECTION__";
const noHintCookieName = "__PROXY_NO_HINT__";
const adBlockDataName = "__PROXY_ADBLOCK__";
const requestModDataName = "__PROXY_REQUEST_MOD__";
const resourceSnifferDataName = "__PROXY_RESOURCE_SNIFFER__";
const imageBlockDataName = "__PROXY_IMAGE_BLOCK__";
const websiteCookiesDataName = "__PROXY_WEBSITE_COOKIES__";

var thisProxyServerUrlHttps;
var thisProxyServerUrl_hostOnly;

// =======================================================================================
// 第三部分：代理提示注入脚本
// 功能：在代理页面显示使用警告提示（修改为玻璃样式弹窗）
// =======================================================================================

const proxyHintInjection = `
function toEntities(str) {
return str.split("").map(ch => \`&#\${ch.charCodeAt(0)};\`).join("");
}

//---***========================================***---提示使用代理---***========================================***---

window.addEventListener('load', () => {
  setTimeout(() => {
    if(document.getElementById('__PROXY_HINT_MODAL__')) return;
    
    var hint = \`
Warning: You are currently using a web proxy, so do not log in to any website. For further details, please visit the link below.
警告：您当前正在使用网络代理，请勿登录任何网站。详情请见以下链接。
\`;

    document.body.insertAdjacentHTML(
      'afterbegin', 
      \`<div id="__PROXY_HINT_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:99999999999999999999999;user-select:none;opacity:0;transition:opacity 0.5s ease;">
        <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:500px;width:90%;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.5s ease;">
          <div style="text-align:center;color:#2d3748;">
            <h3 style="color:#c53030;margin-bottom:15px;">安全警告 Security Warning</h3>
            <p style="margin-bottom:20px;line-height:1.6;">\${toEntities(hint)}</p>
            <a href="https://github.com/1234567Yang/cf-proxy-ex/" target="_blank" style="color:#2c5282;display:block;margin-bottom:20px;">https://github.com/1234567Yang/cf-proxy-ex/</a>
            <div style="display:flex;justify-content:center;gap:10px;">
              <button onclick="closeHint(false)" style="padding:8px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭 Close</button>
              <button onclick="closeHint(true)" style="padding:8px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">不再显示 Don't show again</button>
            </div>
          </div>
        </div>
      </div>
    \`);

    setTimeout(() => {
      const modal = document.getElementById('__PROXY_HINT_MODAL__');
      const content = modal.querySelector('div > div');
      modal.style.opacity = '1';
      content.style.transform = 'scale(1)';
    }, 100);
  }, 500);
});

function closeHint(dontShowAgain) {
const modal = document.getElementById('__PROXY_HINT_MODAL__');
modal.style.opacity = '0';
setTimeout(() => {
  modal.remove();
  if(dontShowAgain) {
    // 设置不再显示的cookie
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30天
    document.cookie = "${noHintCookieName}=1; expires=" + expiryDate.toUTCString() + "; path=/";
  }
}, 500);
}
`;

// =======================================================================================
// 第四部分：工具栏注入脚本
// 功能：在代理页面右下角显示工具栏
// =======================================================================================

const toolbarInjection = `
// 工具栏功能
function initToolbar() {
  // 创建工具栏容器
  const toolbar = document.createElement('div');
  toolbar.id = '__PROXY_TOOLBAR__';
  toolbar.style.position = 'fixed';
  toolbar.style.bottom = '20px';
  toolbar.style.right = '20px';
  toolbar.style.zIndex = '999998';
  toolbar.style.display = 'flex';
  toolbar.style.flexDirection = 'column';
  toolbar.style.gap = '10px';
  toolbar.style.alignItems = 'end';
  
  // 创建主工具按钮
  const mainToolBtn = document.createElement('button');
  mainToolBtn.innerHTML = '🛠️';
  mainToolBtn.title = '代理工具';
  mainToolBtn.style.width = '50px';
  mainToolBtn.style.height = '50px';
  mainToolBtn.style.background = 'linear-gradient(45deg, #90cdf4, #b7e4f4)';
  mainToolBtn.style.border = 'none';
  mainToolBtn.style.borderRadius = '50%';
  mainToolBtn.style.color = '#2d3748';
  mainToolBtn.style.cursor = 'pointer';
  mainToolBtn.style.boxShadow = '0 4px 15px rgba(160,174,192,0.3)';
  mainToolBtn.style.fontSize = '20px';
  mainToolBtn.style.transition = 'all 0.3s ease';
  
  mainToolBtn.onmouseenter = () => {
    mainToolBtn.style.transform = 'scale(1.1)';
    mainToolBtn.style.boxShadow = '0 6px 20px rgba(160,174,192,0.5)';
  };
  
  mainToolBtn.onmouseleave = () => {
    mainToolBtn.style.transform = 'scale(1)';
    mainToolBtn.style.boxShadow = '0 4px 15px rgba(160,174,192,0.3)';
  };
  
  // 创建功能按钮容器
  const toolsContainer = document.createElement('div');
  toolsContainer.id = '__PROXY_TOOLS_CONTAINER__';
  toolsContainer.style.display = 'none';
  toolsContainer.style.flexDirection = 'column';
  toolsContainer.style.gap = '10px';
  toolsContainer.style.alignItems = 'end';
  
  // Cookie注入按钮
  const cookieBtn = createToolButton('🍪', 'Cookie管理', showCookieModal);
  
  // 广告拦截按钮
  const adBlockBtn = createToolButton('🚫', '广告拦截', showAdBlockModal);
  
  // 资源嗅探按钮
  const snifferBtn = createToolButton('🔍', '资源嗅探', showSnifferModal);
  
  // 请求修改按钮
  const requestModBtn = createToolButton('🔧', '请求修改', showRequestModModal);
  
  // 无图模式按钮
  const imageBlockBtn = createToolButton('🖼️', '无图模式', toggleImageBlock);
  
  // 网站Cookie记录按钮
  const websiteCookiesBtn = createToolButton('📝', '网站Cookie记录', showWebsiteCookiesModal);
  
  // 功能检查按钮
  const checkBtn = createToolButton('✅', '功能检查', checkAllFunctions);
  
  // 添加按钮到容器
  toolsContainer.appendChild(cookieBtn);
  toolsContainer.appendChild(adBlockBtn);
  toolsContainer.appendChild(snifferBtn);
  toolsContainer.appendChild(requestModBtn);
  toolsContainer.appendChild(imageBlockBtn);
  toolsContainer.appendChild(websiteCookiesBtn);
  toolsContainer.appendChild(checkBtn);
  
  // 主按钮点击事件
  let toolsVisible = false;
  mainToolBtn.onclick = (e) => {
    e.stopPropagation();
    toolsVisible = !toolsVisible;
    if (toolsVisible) {
      toolsContainer.style.display = 'flex';
      // 加载各功能状态
      loadImageBlockState();
    } else {
      toolsContainer.style.display = 'none';
    }
  };
  
  toolbar.appendChild(toolsContainer);
  toolbar.appendChild(mainToolBtn);
  document.body.appendChild(toolbar);
  
  // 添加通知容器
  const notificationContainer = document.createElement('div');
  notificationContainer.id = '__PROXY_NOTIFICATIONS__';
  notificationContainer.style.position = 'fixed';
  notificationContainer.style.top = '20px';
  notificationContainer.style.right = '20px';
  notificationContainer.style.zIndex = '1000001';
  notificationContainer.style.display = 'flex';
  notificationContainer.style.flexDirection = 'column';
  notificationContainer.style.gap = '10px';
  document.body.appendChild(notificationContainer);
}

function createToolButton(emoji, title, onClick) {
  const btn = document.createElement('button');
  btn.innerHTML = emoji;
  btn.title = title;
  btn.style.width = '40px';
  btn.style.height = '40px';
  btn.style.background = 'linear-gradient(45deg, #90cdf4, #b7e4f4)';
  btn.style.border = 'none';
  btn.style.borderRadius = '50%';
  btn.style.color = '#2d3748';
  btn.style.cursor = 'pointer';
  btn.style.boxShadow = '0 3px 10px rgba(160,174,192,0.3)';
  btn.style.fontSize = '16px';
  btn.style.transition = 'all 0.3s ease';
  
  btn.onmouseenter = (e) => {
    e.stopPropagation();
    btn.style.transform = 'scale(1.1)';
    btn.style.boxShadow = '0 5px 15px rgba(160,174,192,0.4)';
  };
  
  btn.onmouseleave = (e) => {
    e.stopPropagation();
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 3px 10px rgba(160,174,192,0.3)';
  };
  
  btn.onclick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onClick();
  };
  
  return btn;
}

// 通知功能
function showNotification(message, type = 'info', duration = 5000) {
  const notification = document.createElement('div');
  notification.style.padding = '15px 20px';
  notification.style.background = type === 'success' ? 'rgba(72,187,120,0.9)' : 
                                type === 'error' ? 'rgba(245,101,101,0.9)' : 
                                'rgba(66,153,225,0.9)';
  notification.style.color = 'white';
  notification.style.borderRadius = '10px';
  notification.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
  notification.style.backdropFilter = 'blur(10px)';
  notification.style.transform = 'translateX(100%)';
  notification.style.transition = 'transform 0.3s ease';
  notification.style.maxWidth = '300px';
  notification.style.wordBreak = 'break-word';
  notification.textContent = message;
  
  const container = document.getElementById('__PROXY_NOTIFICATIONS__');
  container.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, duration);
}

// 功能检查
function checkAllFunctions() {
  const checks = [];
  
  // 检查Cookie注入
  try {
    const cookieSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    const currentSite = window.location.href;
    if (cookieSettings[currentSite]) {
      checks.push({name: 'Cookie注入', status: 'active', message: '已为当前网站配置Cookie注入'});
    } else {
      checks.push({name: 'Cookie注入', status: 'inactive', message: '当前网站未配置Cookie注入'});
    }
  } catch(e) {
    checks.push({name: 'Cookie注入', status: 'error', message: '检查失败: ' + e.message});
  }
  
  // 检查广告拦截
  try {
    const adSettings = JSON.parse(localStorage.getItem('${adBlockDataName}') || '{}');
    if (adSettings.enabled) {
      checks.push({name: '广告拦截', status: 'active', message: '广告拦截已启用'});
    } else {
      checks.push({name: '广告拦截', status: 'inactive', message: '广告拦截未启用'});
    }
  } catch(e) {
    checks.push({name: '广告拦截', status: 'error', message: '检查失败: ' + e.message});
  }
  
  // 检查无图模式
  try {
    const imageSettings = JSON.parse(localStorage.getItem('${imageBlockDataName}') || '{}');
    if (imageSettings.enabled) {
      checks.push({name: '无图模式', status: 'active', message: '无图模式已启用'});
    } else {
      checks.push({name: '无图模式', status: 'inactive', message: '无图模式未启用'});
    }
  } catch(e) {
    checks.push({name: '无图模式', status: 'error', message: '检查失败: ' + e.message});
  }
  
  // 显示检查结果
  showCheckResults(checks);
}

function showCheckResults(checks) {
  if(document.getElementById('__CHECK_RESULTS_MODAL__')) return;
  
  let resultsHTML = '';
  checks.forEach(check => {
    const icon = check.status === 'active' ? '✅' : check.status === 'inactive' ? '⚪' : '❌';
    const color = check.status === 'active' ? '#38a169' : check.status === 'inactive' ? '#a0aec0' : '#e53e3e';
    resultsHTML += \`
      <div style="display:flex;align-items:center;padding:10px;margin:5px 0;background:rgba(255,255,255,0.2);border-radius:8px;">
        <span style="font-size:20px;margin-right:10px;">\${icon}</span>
        <div>
          <div style="font-weight:bold;color:\${color};">\${check.name}</div>
          <div style="font-size:12px;color:#666;">\${check.message}</div>
        </div>
      </div>
    \`;
  });
  
  const modalHTML = \`
  <div id="__CHECK_RESULTS_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">✅ 功能检查结果</h3>
        <div style="text-align:left;">
          \${resultsHTML}
        </div>
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="closeCheckResults()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭</button>
        </div>
      </div>
    </div>
  </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  setTimeout(() => {
    const modal = document.getElementById('__CHECK_RESULTS_MODAL__');
    const content = modal.querySelector('div > div');
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
  }, 100);
}

function closeCheckResults() {
  const modal = document.getElementById('__CHECK_RESULTS_MODAL__');
  if(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// 初始化工具栏
setTimeout(initToolbar, 1000);
`;

// =======================================================================================
// 第五部分：Cookie注入功能脚本（增强版）
// 功能：提供cookie注入界面和功能，添加管理功能
// =======================================================================================

const cookieInjectionScript = `
// Cookie注入功能
let separateCookies = [];

function showCookieModal() {
  // 检查是否已存在弹窗
  if(document.getElementById('__COOKIE_INJECTION_MODAL__')) return;
  
  // 获取当前网站信息
  const currentSite = window.location.href;
  const domain = new URL(currentSite).hostname;
  
  const modalHTML = \`
  <div id="__COOKIE_INJECTION_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:900px;width:95%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="color:#2d3748;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h3 style="color:#2c5282;margin:0;">🍪 Cookie管理</h3>
          <button onclick="showCookieManagement()" style="padding:8px 16px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:12px;color:#2d3748;cursor:pointer;font-size:12px;">管理所有Cookie</button>
        </div>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
          <div>
            <h4 style="color:#2c5282;margin-bottom:15px;">注入新Cookie</h4>
            
            <div style="margin-bottom:15px;">
              <label style="display:block;margin-bottom:8px;font-weight:bold;">目标网站:</label>
              <input type="text" id="targetSite" value="\${currentSite}" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.3);color:#666;">
            </div>
            
            <div style="margin-bottom:15px;">
              <label style="display:block;margin-bottom:8px;font-weight:bold;">输入方式:</label>
              <select id="inputType" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
                <option value="combined">合成Cookie输入</option>
                <option value="separate">分别输入</option>
              </select>
            </div>
            
            <div id="combinedInput" style="margin-bottom:15px;">
              <label style="display:block;margin-bottom:8px;font-weight:bold;">Cookie字符串:</label>
              <textarea id="combinedCookie" placeholder="例如: name=value; name2=value2; path=/; domain=.\${domain}" style="width:100%;height:120px;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);resize:vertical;"></textarea>
              <div style="font-size:12px;color:#666;margin-top:5px;">提示：可以包含path、domain等属性</div>
            </div>
            
            <div id="separateInput" style="display:none;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
                <div>
                  <label style="display:block;margin-bottom:5px;font-size:12px;">名称:</label>
                  <input type="text" id="cookieName" style="width:100%;padding:6px;border-radius:6px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
                </div>
                <div>
                  <label style="display:block;margin-bottom:5px;font-size:12px;">值:</label>
                  <input type="text" id="cookieValue" style="width:100%;padding:6px;border-radius:6px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
                <div>
                  <label style="display:block;margin-bottom:5px;font-size:12px;">域名:</label>
                  <input type="text" id="cookieDomain" placeholder="\${domain}" style="width:100%;padding:6px;border-radius:6px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
                </div>
                <div>
                  <label style="display:block;margin-bottom:5px;font-size:12px;">路径:</label>
                  <input type="text" id="cookiePath" value="/" style="width:100%;padding:6px;border-radius:6px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
                </div>
              </div>
              <button onclick="addSeparateCookie()" style="padding:6px 12px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:12px;color:#2d3748;cursor:pointer;font-size:12px;">添加Cookie</button>
              <div id="cookieList" style="margin-top:10px;max-height:150px;overflow-y:auto;border:1px solid rgba(160,174,192,0.3);border-radius:8px;padding:10px;background:rgba(255,255,255,0.2);"></div>
            </div>
            
            <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
              <button onclick="saveCookieSettings()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;font-weight:bold;">保存并刷新</button>
              <button onclick="testCookieInjection()" style="padding:10px 20px;background:linear-gradient(45deg,#f6e05e,#faf089);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">测试注入</button>
              <button onclick="closeCookieModal()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">取消</button>
            </div>
          </div>
          
          <div>
            <h4 style="color:#2c5282;margin-bottom:15px;">当前网站Cookie</h4>
            <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:15px;max-height:300px;overflow-y:auto;">
              <div id="currentCookiesList"></div>
            </div>
            <div style="display:flex;gap:10px;margin-top:15px;">
              <button onclick="refreshCurrentCookies()" style="padding:8px 16px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:12px;color:#2d3748;cursor:pointer;font-size:12px;">刷新</button>
              <button onclick="exportCurrentCookies()" style="padding:8px 16px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:12px;color:#2d3748;cursor:pointer;font-size:12px;">导出</button>
              <button onclick="clearAllCookies()" style="padding:8px 16px;background:linear-gradient(45deg,#f56565,#fc8181);border:none;border-radius:12px;color:white;cursor:pointer;font-size:12px;">清空</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // 初始化事件监听
  setTimeout(() => {
    const modal = document.getElementById('__COOKIE_INJECTION_MODAL__');
    const content = modal.querySelector('div > div');
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
    
    // 绑定事件
    document.getElementById('inputType').addEventListener('change', toggleInputType);
    
    // 加载已保存的设置和当前Cookie
    loadCookieSettings();
    loadCurrentCookies();
  }, 100);
}

function showCookieManagement() {
  if(document.getElementById('__COOKIE_MANAGEMENT_MODAL__')) return;
  
  const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
  let sitesHTML = '';
  
  Object.keys(allSettings).forEach(site => {
    const settings = allSettings[site];
    const cookieCount = settings.cookies ? settings.cookies.length : 0;
    
    sitesHTML += \`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;margin:5px 0;background:rgba(255,255,255,0.2);border-radius:8px;">
        <div style="flex:1;">
          <div style="font-weight:bold;word-break:break-all;">\${site}</div>
          <div style="font-size:12px;color:#666;">\${cookieCount} 个Cookie</div>
        </div>
        <div style="display:flex;gap:5px;">
          <button onclick="editSiteCookies('\${site}')" style="padding:4px 8px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:6px;color:#2d3748;cursor:pointer;font-size:10px;">编辑</button>
          <button onclick="deleteSiteCookies('\${site}')" style="padding:4px 8px;background:linear-gradient(45deg,#f56565,#fc8181);border:none;border-radius:6px;color:white;cursor:pointer;font-size:10px;">删除</button>
        </div>
      </div>
    \`;
  });
  
  if(!sitesHTML) {
    sitesHTML = '<div style="text-align:center;padding:20px;color:#666;">暂无保存的Cookie配置</div>';
  }
  
  const modalHTML = \`
  <div id="__COOKIE_MANAGEMENT_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000001;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:800px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🍪 Cookie配置管理</h3>
        <div style="text-align:left;max-height:400px;overflow-y:auto;">
          \${sitesHTML}
        </div>
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="closeCookieManagement()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭</button>
        </div>
      </div>
    </div>
  </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  setTimeout(() => {
    const modal = document.getElementById('__COOKIE_MANAGEMENT_MODAL__');
    const content = modal.querySelector('div > div');
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
  }, 100);
}

function editSiteCookies(site) {
  closeCookieManagement();
  setTimeout(() => {
    showCookieModal();
    document.getElementById('targetSite').value = site;
    loadCookieSettings();
  }, 300);
}

function deleteSiteCookies(site) {
  if(confirm('确定要删除该网站的Cookie配置吗？')) {
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    delete allSettings[site];
    localStorage.setItem('${cookieInjectionDataName}', JSON.stringify(allSettings));
    showCookieManagement();
    showNotification('Cookie配置已删除', 'success');
  }
}

function closeCookieManagement() {
  const modal = document.getElementById('__COOKIE_MANAGEMENT_MODAL__');
  if(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

function toggleInputType() {
  const type = document.getElementById('inputType').value;
  document.getElementById('combinedInput').style.display = type === 'combined' ? 'block' : 'none';
  document.getElementById('separateInput').style.display = type === 'separate' ? 'block' : 'none';
}

function addSeparateCookie() {
  const name = document.getElementById('cookieName').value.trim();
  const value = document.getElementById('cookieValue').value.trim();
  const domain = document.getElementById('cookieDomain').value.trim();
  const path = document.getElementById('cookiePath').value.trim() || '/';
  
  if(!name || !value) {
    showNotification('请填写Cookie名称和值', 'error');
    return;
  }
  
  const cookie = { name, value, domain, path };
  separateCookies.push(cookie);
  updateCookieList();
  
  // 清空输入框
  document.getElementById('cookieName').value = '';
  document.getElementById('cookieValue').value = '';
  document.getElementById('cookieDomain').value = '';
  document.getElementById('cookiePath').value = '/';
}

function updateCookieList() {
  const list = document.getElementById('cookieList');
  list.innerHTML = '';
  
  if(separateCookies.length === 0) {
    list.innerHTML = '<div style="text-align:center;color:#666;padding:10px;">暂无Cookie</div>';
    return;
  }
  
  separateCookies.forEach((cookie, index) => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.style.padding = '8px';
    item.style.marginBottom = '5px';
    item.style.background = 'rgba(255,255,255,0.2)';
    item.style.borderRadius = '6px';
    item.style.fontSize = '12px';
    
    item.innerHTML = \`
      <div style="flex:1;">
        <strong>\${cookie.name}</strong>=\${cookie.value}<br>
        <small style="color:#666;">\${cookie.domain || '当前域名'} | \${cookie.path}</small>
      </div>
      <button onclick="removeCookie(\${index})" style="background:none;border:none;color:#c53030;cursor:pointer;font-size:16px;padding:0 5px;">×</button>
    \`;
    
    list.appendChild(item);
  });
}

function removeCookie(index) {
  separateCookies.splice(index, 1);
  updateCookieList();
}

function saveCookieSettings() {
  const targetSite = document.getElementById('targetSite').value;
  const inputType = document.getElementById('inputType').value;
  
  let cookies = [];
  
  if(inputType === 'combined') {
    const cookieStr = document.getElementById('combinedCookie').value.trim();
    if(cookieStr) {
      // 解析合成Cookie字符串
      const cookiePairs = cookieStr.split(';').map(pair => pair.trim()).filter(pair => pair);
      cookiePairs.forEach(pair => {
        const [name, ...valueParts] = pair.split('=');
        if(name && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          cookies.push({
            name: name.trim(),
            value: value,
            domain: '',
            path: '/'
          });
        }
      });
    }
  } else {
    cookies = separateCookies;
  }
  
  const settings = {
    inputType,
    cookies,
    lastModified: new Date().toISOString()
  };
  
  // 保存到localStorage
  try {
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    allSettings[targetSite] = settings;
    localStorage.setItem('${cookieInjectionDataName}', JSON.stringify(allSettings));
    
    // 实际注入Cookie
    injectCookies(cookies);
    
    showNotification('Cookie设置已保存！页面将刷新以应用更改。', 'success');
    setTimeout(() => {
      location.reload();
    }, 1000);
  } catch(e) {
    showNotification('保存失败: ' + e.message, 'error');
  }
}

function testCookieInjection() {
  const targetSite = document.getElementById('targetSite').value;
  const inputType = document.getElementById('inputType').value;
  
  let cookies = [];
  
  if(inputType === 'combined') {
    const cookieStr = document.getElementById('combinedCookie').value.trim();
    if(cookieStr) {
      const cookiePairs = cookieStr.split(';').map(pair => pair.trim()).filter(pair => pair);
      cookiePairs.forEach(pair => {
        const [name, ...valueParts] = pair.split('=');
        if(name && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          cookies.push({
            name: name.trim(),
            value: value,
            domain: '',
            path: '/'
          });
        }
      });
    }
  } else {
    cookies = separateCookies;
  }
  
  if(cookies.length === 0) {
    showNotification('没有要测试的Cookie', 'error');
    return;
  }
  
  // 注入Cookie但不保存设置
  injectCookies(cookies);
  
  // 检查注入结果
  let successCount = 0;
  cookies.forEach(cookie => {
    const injected = getCookie(cookie.name);
    if(injected === cookie.value) {
      successCount++;
    }
  });
  
  if(successCount === cookies.length) {
    showNotification(\`Cookie注入测试成功！所有 \${cookies.length} 个Cookie均已正确注入。\`, 'success');
  } else {
    showNotification(\`Cookie注入测试完成！\${successCount}/\${cookies.length} 个Cookie注入成功。\`, 
                    successCount > 0 ? 'info' : 'error');
  }
}

function injectCookies(cookies) {
  cookies.forEach(cookie => {
    let cookieStr = \`\${cookie.name}=\${cookie.value}\`;
    if(cookie.domain) cookieStr += \`; domain=\${cookie.domain}\`;
    if(cookie.path) cookieStr += \`; path=\${cookie.path}\`;
    cookieStr += '; samesite=lax';
    
    document.cookie = cookieStr;
  });
}

function getCookie(name) {
  const value = \`; \${document.cookie}\`;
  const parts = value.split(\`; \${name}=\`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function loadCookieSettings() {
  try {
    const targetSite = document.getElementById('targetSite').value;
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    const settings = allSettings[targetSite];
    
    if(settings) {
      document.getElementById('inputType').value = settings.inputType || 'combined';
      
      toggleInputType();
      
      if(settings.cookies && settings.cookies.length > 0) {
        if(settings.inputType === 'combined') {
          const cookieStr = settings.cookies.map(c => \`\${c.name}=\${c.value}\`).join('; ');
          document.getElementById('combinedCookie').value = cookieStr;
        } else {
          separateCookies = settings.cookies;
          updateCookieList();
        }
      }
    }
  } catch(e) {
    console.log('加载Cookie设置失败:', e);
  }
}

function loadCurrentCookies() {
  const cookies = document.cookie.split(';').map(c => c.trim()).filter(c => c);
  const list = document.getElementById('currentCookiesList');
  
  if(cookies.length === 0) {
    list.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">暂无Cookie</div>';
    return;
  }
  
  list.innerHTML = cookies.map(cookie => {
    const [name, ...valueParts] = cookie.split('=');
    const value = valueParts.join('=');
    return \`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;margin:5px 0;background:rgba(255,255,255,0.1);border-radius:6px;font-size:12px;">
        <div style="flex:1;">
          <strong>\${name}</strong>=\${value}
        </div>
        <button onclick="copyCookieValue('\${name}')" style="padding:2px 6px;background:rgba(160,174,192,0.3);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;">复制</button>
      </div>
    \`;
  }).join('');
}

function copyCookieValue(name) {
  const value = getCookie(name);
  if(value) {
    navigator.clipboard.writeText(value).then(() => {
      showNotification(\`已复制 \${name} 的值\`, 'success');
    });
  }
}

function refreshCurrentCookies() {
  loadCurrentCookies();
  showNotification('Cookie列表已刷新', 'info');
}

function exportCurrentCookies() {
  const cookies = document.cookie.split(';').map(c => c.trim()).filter(c => c);
  const cookieObj = {};
  
  cookies.forEach(cookie => {
    const [name, ...valueParts] = cookie.split('=');
    cookieObj[name] = valueParts.join('=');
  });
  
  const data = JSON.stringify(cookieObj, null, 2);
  const blob = new Blob([data], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cookies_' + new URL(window.location.href).hostname + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showNotification('Cookie已导出', 'success');
}

function clearAllCookies() {
  if(confirm('确定要清空当前网站的所有Cookie吗？此操作不可逆！')) {
    const cookies = document.cookie.split(';');
    const domain = window.location.hostname;
    
    cookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = \`\${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=\${domain}\`;
    });
    
    showNotification('所有Cookie已清空', 'success');
    setTimeout(() => {
      location.reload();
    }, 1000);
  }
}

function closeCookieModal() {
  const modal = document.getElementById('__COOKIE_INJECTION_MODAL__');
  if(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}
`;

// =======================================================================================
// 第六部分：广告拦截功能脚本（增强版）
// 功能：实现广告拦截和元素标记，添加订阅规则支持
// =======================================================================================

const adBlockScript = `
// 广告拦截功能
let adBlockEnabled = false;
let adBlockRules = [];
let elementPickerActive = false;
let selectedElements = new Set();

// 广告规则订阅
const ruleSubscriptions = {
  'Anti-Adblock': 'https://easylist-downloads.adblockplus.org/antiadblockfilters.txt',
  'EasyPrivacy': 'https://easylist-downloads.adblockplus.org/easyprivacy.txt',
  'CJX Annoyance': 'https://fastly.jsdelivr.net/gh/cjx82630/cjxlist/cjx-annoyance.txt',
  'EasyList China': 'https://easylist-downloads.adblockplus.org/easylistchina.txt'
};

function showAdBlockModal() {
  if(document.getElementById('__ADBLOCK_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__ADBLOCK_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:95%;width:1200px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;text-align:center;">🚫 广告拦截设置</h3>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:30px;">
          <!-- 左侧：控制面板 -->
          <div>
            <h4 style="color:#2c5282;margin-bottom:15px;">控制面板</h4>
            
            <div style="display:flex;gap:15px;margin-bottom:20px;flex-wrap:wrap;">
              <button id="toggleAdBlock" onclick="toggleAdBlock()" style="padding:12px 24px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;font-weight:bold;flex:1;">启用广告拦截</button>
              <button onclick="startElementPicker()" style="padding:12px 24px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;flex:1;">标记广告元素</button>
            </div>
            
            <div style="margin-bottom:20px;">
              <label style="display:block;margin-bottom:8px;font-weight:bold;">规则订阅:</label>
              <div style="display:grid;grid-template-columns:1fr auto;gap:10px;">
                <select id="ruleSubscription" style="padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
                  <option value="">选择规则订阅...</option>
                  \${Object.keys(ruleSubscriptions).map(name => \`
                    <option value="\${name}">\${name}</option>
                  \`).join('')}
                </select>
                <button onclick="downloadSubscription()" style="padding:8px 16px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:12px;color:#2d3748;cursor:pointer;">下载</button>
              </div>
            </div>
            
            <div style="margin-bottom:20px;">
              <label style="display:block;margin-bottom:8px;font-weight:bold;">网站特定规则:</label>
              <input type="text" id="siteSpecific" placeholder="例如: example.com" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
              <div style="font-size:12px;color:#666;margin-top:5px;">为空则应用全局规则</div>
            </div>
            
            <div style="display:flex;gap:10px;margin-top:20px;">
              <button onclick="loadDefaultRules()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;flex:1;">加载默认规则</button>
              <button onclick="clearAllRules()" style="padding:10px 20px;background:linear-gradient(45deg,#f56565,#fc8181);border:none;border-radius:20px;color:white;cursor:pointer;flex:1;">清空规则</button>
            </div>
          </div>
          
          <!-- 右侧：规则管理 -->
          <div>
            <h4 style="color:#2c5282;margin-bottom:15px;">规则管理</h4>
            
            <div style="margin-bottom:15px;">
              <label style="display:block;margin-bottom:8px;font-weight:bold;">自定义规则 (每行一条):</label>
              <textarea id="customRules" placeholder="例如: ||ads.example.com^
##.ad-container
##a[href*=\\"ads\\"]" style="width:100%;height:250px;padding:12px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);resize:vertical;font-family:monospace;font-size:12px;"></textarea>
            </div>
            
            <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:15px;margin-bottom:15px;">
              <div style="font-weight:bold;margin-bottom:10px;">规则统计</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px;">
                <div>总规则数: <span id="ruleCount">0</span></div>
                <div>域名规则: <span id="domainRuleCount">0</span></div>
                <div>元素规则: <span id="elementRuleCount">0</span></div>
                <div>订阅规则: <span id="subscriptionRuleCount">0</span></div>
              </div>
            </div>
          </div>
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;margin-top:30px;">
          <button onclick="saveAdBlockRules()" style="padding:12px 30px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;font-weight:bold;">保存规则</button>
          <button onclick="testAdBlockRules()" style="padding:12px 30px;background:linear-gradient(45deg,#f6e05e,#faf089);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">测试规则</button>
          <button onclick="closeAdBlockModal()" style="padding:12px 30px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭</button>
        </div>
      </div>
    </div>
  </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  setTimeout(() => {
    const modal = document.getElementById('__ADBLOCK_MODAL__');
    const content = modal.querySelector('div > div');
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
    
    loadAdBlockSettings();
    updateRuleStats();
  }, 100);
}

function toggleAdBlock() {
  adBlockEnabled = !adBlockEnabled;
  const button = document.getElementById('toggleAdBlock');
  if(adBlockEnabled) {
    button.textContent = '禁用广告拦截';
    button.style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
    applyAdBlockRules();
    showNotification('广告拦截已启用', 'success');
  } else {
    button.textContent = '启用广告拦截';
    button.style.background = 'rgba(160,174,192,0.3)';
    removeAdBlockRules();
    showNotification('广告拦截已禁用', 'info');
  }
  saveAdBlockSettings();
}

async function downloadSubscription() {
  const select = document.getElementById('ruleSubscription');
  const subscriptionName = select.value;
  
  if(!subscriptionName) {
    showNotification('请选择规则订阅', 'error');
    return;
  }
  
  const url = ruleSubscriptions[subscriptionName];
  
  try {
    showNotification('正在下载规则...', 'info');
    const response = await fetch(url);
    const rulesText = await response.text();
    
    // 解析规则
    const rules = rulesText.split('\\n')
      .map(rule => rule.trim())
      .filter(rule => rule && !rule.startsWith('!'));
    
    // 添加到现有规则
    const existingRules = document.getElementById('customRules').value.split('\\n').filter(r => r.trim());
    const newRules = [...new Set([...existingRules, ...rules])];
    document.getElementById('customRules').value = newRules.join('\\n');
    
    updateRuleStats();
    showNotification(\`成功下载 \${rules.length} 条规则\`, 'success');
  } catch(e) {
    showNotification('下载规则失败: ' + e.message, 'error');
  }
}

function startElementPicker() {
  elementPickerActive = true;
  closeAdBlockModal();
  
  // 添加元素选择模式样式
  const style = document.createElement('style');
  style.id = '__ELEMENT_PICKER_STYLE__';
  style.textContent = \`
    * { cursor: crosshair !important; }
    .__adblock_hover__ { 
      outline: 2px solid #4299e1 !important; 
      background: rgba(66, 153, 225, 0.1) !important; 
    }
    .__adblock_selected__ { 
      outline: 3px solid #c53030 !important; 
      background: rgba(197, 48, 48, 0.2) !important; 
    }
    #__PROXY_TOOLBAR__ *,
    #__ELEMENT_PICKER_PANEL__ * {
      cursor: default !important;
      outline: none !important;
      background: transparent !important;
    }
  \`;
  document.head.appendChild(style);
  
  // 创建确认面板
  const panel = document.createElement('div');
  panel.id = '__ELEMENT_PICKER_PANEL__';
  panel.style.position = 'fixed';
  panel.style.bottom = '20px';
  panel.style.left = '50%';
  panel.style.transform = 'translateX(-50%)';
  panel.style.background = 'rgba(255,255,255,0.9)';
  panel.style.backdropFilter = 'blur(10px)';
  panel.style.padding = '15px 20px';
  panel.style.borderRadius = '10px';
  panel.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
  panel.style.zIndex = '1000001';
  panel.style.display = 'flex';
  panel.style.gap = '15px';
  panel.style.alignItems = 'center';
  panel.style.fontFamily = 'Arial, sans-serif';
  
  panel.innerHTML = \`
    <span style="color:#2d3748;font-weight:bold;white-space:nowrap;">选择要拦截的元素 (已选择: <span id="selectedCount">0</span>)</span>
    <button onclick="confirmBlockElements()" style="padding:8px 16px;background:#c53030;border:none;border-radius:15px;color:white;cursor:pointer;font-weight:bold;">确认拦截</button>
    <button onclick="cancelElementPicker()" style="padding:8px 16px;background:rgba(160,174,192,0.3);border:none;border-radius:15px;color:#2d3748;cursor:pointer;">取消</button>
    <button onclick="clearSelectedElements()" style="padding:8px 16px;background:rgba(160,174,192,0.3);border:none;border-radius:15px;color:#2d3748;cursor:pointer;">清空选择</button>
  \`;
  
  document.body.appendChild(panel);
  updateSelectedCount();
  
  // 添加鼠标移动事件监听
  document.addEventListener('mouseover', handleElementHover, true);
  document.addEventListener('click', handleElementClick, true);
}

function handleElementHover(e) {
  if(!elementPickerActive) return;
  
  // 跳过工具栏元素
  if (e.target.closest('#__PROXY_TOOLBAR__') || e.target.closest('#__ELEMENT_PICKER_PANEL__')) {
    return;
  }
  
  e.stopPropagation();
  e.preventDefault();
  
  // 移除之前的高亮
  const previous = document.querySelector('.__adblock_hover__');
  if(previous && !selectedElements.has(previous)) {
    previous.classList.remove('__adblock_hover__');
  }
  
  // 高亮当前元素（如果未被选择）
  if(!selectedElements.has(e.target)) {
    e.target.classList.add('__adblock_hover__');
  }
}

function handleElementClick(e) {
  if(!elementPickerActive) return;
  
  // 跳过工具栏元素
  if (e.target.closest('#__PROXY_TOOLBAR__') || e.target.closest('#__ELEMENT_PICKER_PANEL__')) {
    return;
  }
  
  e.stopPropagation();
  e.preventDefault();
  
  const element = e.target;
  
  if(selectedElements.has(element)) {
    // 取消选择
    selectedElements.delete(element);
    element.classList.remove('__adblock_selected__');
    if(!element.classList.contains('__adblock_hover__')) {
      element.classList.add('__adblock_hover__');
    }
  } else {
    // 选择元素
    selectedElements.add(element);
    element.classList.remove('__adblock_hover__');
    element.classList.add('__adblock_selected__');
  }
  
  updateSelectedCount();
}

function updateSelectedCount() {
  const countElement = document.getElementById('selectedCount');
  if(countElement) {
    countElement.textContent = selectedElements.size;
  }
}

function clearSelectedElements() {
  selectedElements.forEach(element => {
    element.classList.remove('__adblock_selected__');
  });
  selectedElements.clear();
  updateSelectedCount();
}

function confirmBlockElements() {
  if(selectedElements.size === 0) {
    showNotification('请先选择要拦截的元素', 'error');
    return;
  }
  
  const siteSpecific = document.getElementById('siteSpecific')?.value || new URL(window.location.href).hostname;
  let newRules = [];
  
  selectedElements.forEach(element => {
    const selector = generateCSSSelector(element);
    if(selector) {
      const rule = siteSpecific ? \`\${siteSpecific}##\${selector}\` : \`##\${selector}\`;
      newRules.push(rule);
    }
  });
  
  if(newRules.length > 0) {
    const textarea = document.getElementById('customRules');
    const currentRules = textarea.value.split('\\n').filter(r => r.trim());
    const allRules = [...new Set([...currentRules, ...newRules])];
    textarea.value = allRules.join('\\n');
    
    updateRuleStats();
    showNotification(\`已添加 \${newRules.length} 条拦截规则\`, 'success');
  }
  
  cancelElementPicker();
}

function cancelElementPicker() {
  elementPickerActive = false;
  
  // 移除样式
  const style = document.getElementById('__ELEMENT_PICKER_STYLE__');
  if(style) style.remove();
  
  // 移除面板
  const panel = document.getElementById('__ELEMENT_PICKER_PANEL__');
  if(panel) panel.remove();
  
  // 移除事件监听
  document.removeEventListener('mouseover', handleElementHover, true);
  document.removeEventListener('click', handleElementClick, true);
  
  // 移除高亮
  document.querySelectorAll('.__adblock_hover__, .__adblock_selected__').forEach(el => {
    el.classList.remove('__adblock_hover__', '__adblock_selected__');
  });
  
  selectedElements.clear();
}

function generateCSSSelector(element) {
  if(element.id) {
    return '#' + CSS.escape(element.id);
  }
  
  let selector = element.tagName.toLowerCase();
  
  if(element.className && typeof element.className === 'string') {
    const classes = element.className.split(' ').filter(c => c.trim());
    if(classes.length > 0) {
      selector += '.' + classes.map(c => CSS.escape(c)).join('.');
    }
  }
  
  // 添加属性选择器以提高特异性
  if(element.src) {
    selector += '[src]';
  } else if(element.href) {
    selector += '[href]';
  }
  
  return selector;
}

function loadDefaultRules() {
  const defaultRules = \`
##.ad
##.ads
##.advertisement
##[class*="ad-"]
##[id*="ad-"]
##iframe[src*="ads"]
##iframe[src*="doubleclick"]
##div[class*="banner"]
##.google-ad
##.ad-container
##.ad-wrapper
##.adbox
##.ad-unit
##.ad-placeholder
##[data-ad]
##[data-adunit]
##.popup
##.modal[class*="ad"]
##[onclick*="ad"]
\`.trim();
  
  document.getElementById('customRules').value = defaultRules;
  updateRuleStats();
  showNotification('已加载默认规则', 'success');
}

function clearAllRules() {
  if(confirm('确定要清空所有规则吗？此操作不可逆！')) {
    document.getElementById('customRules').value = '';
    updateRuleStats();
    showNotification('所有规则已清空', 'success');
  }
}

function updateRuleStats() {
  const rulesText = document.getElementById('customRules').value;
  const rules = rulesText.split('\\n').filter(rule => rule.trim());
  
  const domainRules = rules.filter(rule => rule.includes('##'));
  const elementRules = rules.filter(rule => rule.startsWith('##'));
  const subscriptionRules = rules.filter(rule => rule.includes('^'));
  
  document.getElementById('ruleCount').textContent = rules.length;
  document.getElementById('domainRuleCount').textContent = domainRules.length;
  document.getElementById('elementRuleCount').textContent = elementRules.length;
  document.getElementById('subscriptionRuleCount').textContent = subscriptionRules.length;
}

function saveAdBlockRules() {
  const customRules = document.getElementById('customRules').value;
  const siteSpecific = document.getElementById('siteSpecific')?.value || '';
  const rules = customRules.split('\\n').filter(rule => rule.trim());
  
  adBlockRules = rules;
  
  const settings = {
    enabled: adBlockEnabled,
    rules: adBlockRules,
    siteSpecific: siteSpecific,
    lastUpdated: new Date().toISOString()
  };
  
  try {
    localStorage.setItem('${adBlockDataName}', JSON.stringify(settings));
    
    if(adBlockEnabled) {
      applyAdBlockRules();
    }
    
    showNotification('广告规则已保存！', 'success');
  } catch(e) {
    showNotification('保存失败: ' + e.message, 'error');
  }
}

function testAdBlockRules() {
  if(adBlockEnabled) {
    showNotification('广告拦截正在运行，规则已生效', 'success');
  } else {
    showNotification('请先启用广告拦截', 'error');
  }
}

function loadAdBlockSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem('${adBlockDataName}') || '{}');
    adBlockEnabled = settings.enabled || false;
    adBlockRules = settings.rules || [];
    
    const button = document.getElementById('toggleAdBlock');
    if(adBlockEnabled) {
      button.textContent = '禁用广告拦截';
      button.style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
      applyAdBlockRules();
    }
    
    if(document.getElementById('customRules')) {
      document.getElementById('customRules').value = adBlockRules.join('\\n');
    }
    
    if(document.getElementById('siteSpecific') && settings.siteSpecific) {
      document.getElementById('siteSpecific').value = settings.siteSpecific;
    }
    
    updateRuleStats();
  } catch(e) {
    console.log('加载广告拦截设置失败:', e);
  }
}

function applyAdBlockRules() {
  // 创建样式来隐藏广告元素
  let cssRules = '';
  
  adBlockRules.forEach(rule => {
    if(rule.startsWith('##')) {
      // 元素选择器规则
      const selector = rule.substring(2);
      cssRules += \`\${selector} { display: none !important; }\\n\`;
    } else if(rule.includes('##')) {
      // 域名特定规则
      const [domain, selector] = rule.split('##');
      if(domain === window.location.hostname || !domain) {
        cssRules += \`\${selector} { display: none !important; }\\n\`;
      }
    }
  });
  
  // 移除旧的样式
  const oldStyle = document.getElementById('__ADBLOCK_STYLE__');
  if(oldStyle) oldStyle.remove();
  
  // 添加新的样式
  if(cssRules) {
    const style = document.createElement('style');
    style.id = '__ADBLOCK_STYLE__';
    style.textContent = cssRules;
    document.head.appendChild(style);
  }
}

function removeAdBlockRules() {
  const style = document.getElementById('__ADBLOCK_STYLE__');
  if(style) style.remove();
}

// 初始化广告拦截
setTimeout(loadAdBlockSettings, 2000);

function closeAdBlockModal() {
  const modal = document.getElementById('__ADBLOCK_MODAL__');
  if(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}
`;

// =======================================================================================
// 第七部分：资源嗅探功能脚本（重构版）
// 功能：拦截和显示网络请求，添加抓包功能
// =======================================================================================

const resourceSnifferScript = `
// 资源嗅探功能
let snifferEnabled = false;
let capturedRequests = [];
let requestInterceptor = null;
let responseInterceptor = null;

// 存储原始方法
const originalFetch = window.fetch;
const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;
const originalXHRSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

function showSnifferModal() {
  if(document.getElementById('__SNIFFER_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__SNIFFER_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:98%;width:1400px;max-height:95vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;text-align:center;">🔍 资源嗅探器</h3>
        
        <div style="display:flex;gap:15px;margin-bottom:20px;justify-content:center;flex-wrap:wrap;">
          <button id="toggleSniffer" onclick="toggleSniffer()" style="padding:12px 24px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;font-weight:bold;">启动嗅探</button>
          <button onclick="clearSnifferData()" style="padding:12px 24px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">清空记录</button>
          <button onclick="exportSnifferData()" style="padding:12px 24px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">导出数据</button>
          <button onclick="toggleAutoStart()" style="padding:12px 24px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">自动启动: <span id="autoStartStatus">关</span></button>
        </div>
        
        <div style="display:grid;grid-template-columns:300px 1fr;gap:20px;height:500px;">
          <!-- 请求列表 -->
          <div style="background:rgba(255,255,255,0.5);border-radius:8px;padding:15px;overflow-y:auto;">
            <div style="font-weight:bold;margin-bottom:10px;color:#2c5282;">请求列表</div>
            <div id="requestList" style="height:450px;overflow-y:auto;">
              <div style="text-align:center;color:#666;padding:20px;">暂无数据</div>
            </div>
          </div>
          
          <!-- 请求详情 -->
          <div style="background:rgba(255,255,255,0.5);border-radius:8px;padding:15px;overflow-y:auto;">
            <div style="font-weight:bold;margin-bottom:10px;color:#2c5282;">请求详情</div>
            <div id="requestDetails" style="height:450px;overflow-y:auto;">
              <div style="text-align:center;color:#666;padding:20px;">选择请求查看详情</div>
            </div>
          </div>
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="closeSnifferModal()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭</button>
        </div>
      </div>
    </div>
  </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  setTimeout(() => {
    const modal = document.getElementById('__SNIFFER_MODAL__');
    const content = modal.querySelector('div > div');
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
    
    updateRequestList();
    loadSnifferSettings();
  }, 100);
}

function toggleSniffer() {
  snifferEnabled = !snifferEnabled;
  const button = document.getElementById('toggleSniffer');
  
  if(snifferEnabled) {
    button.textContent = '停止嗅探';
    button.style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
    startSniffer();
    showNotification('资源嗅探已启动', 'success');
  } else {
    button.textContent = '启动嗅探';
    button.style.background = 'rgba(160,174,192,0.3)';
    stopSniffer();
    showNotification('资源嗅探已停止', 'info');
  }
  
  saveSnifferSettings();
}

function toggleAutoStart() {
  const settings = JSON.parse(localStorage.getItem('${resourceSnifferDataName}') || '{}');
  settings.autoStart = !settings.autoStart;
  localStorage.setItem('${resourceSnifferDataName}', JSON.stringify(settings));
  
  const statusElement = document.getElementById('autoStartStatus');
  statusElement.textContent = settings.autoStart ? '开' : '关';
  showNotification(\`自动启动已\${settings.autoStart ? '开启' : '关闭'}\`, 'success');
}

function startSniffer() {
  // 拦截fetch请求
  window.fetch = async function(...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0].url;
    const method = args[1]?.method || 'GET';
    
    const requestInfo = {
      id: Date.now() + Math.random(),
      method: method,
      url: url,
      type: getResourceType(url),
      timestamp: new Date().toLocaleTimeString(),
      status: 'pending',
      size: '0 B',
      headers: args[1]?.headers || {},
      requestBody: args[1]?.body,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      responseHeaders: {},
      responseBody: null
    };
    
    capturedRequests.unshift(requestInfo);
    updateRequestList();
    
    try {
      const response = await originalFetch.apply(this, args);
      
      // 克隆响应以读取内容
      const responseClone = response.clone();
      const blob = await responseClone.blob();
      const size = blob.size;
      
      requestInfo.status = response.status;
      requestInfo.size = formatBytes(size);
      requestInfo.endTime = Date.now();
      requestInfo.duration = requestInfo.endTime - requestInfo.startTime;
      requestInfo.responseHeaders = Object.fromEntries(response.headers.entries());
      
      // 对于文本内容，保存响应体
      if (size < 1024 * 1024) { // 限制1MB
        if (blob.type.includes('text') || blob.type.includes('json') || blob.type.includes('javascript')) {
          requestInfo.responseBody = await blob.text();
        } else if (blob.type.includes('image')) {
          requestInfo.responseBody = URL.createObjectURL(blob);
        }
      }
      
      updateRequestList();
      return response;
    } catch(error) {
      requestInfo.status = 'error';
      requestInfo.size = '0 B';
      requestInfo.endTime = Date.now();
      requestInfo.duration = requestInfo.endTime - requestInfo.startTime;
      updateRequestList();
      throw error;
    }
  };
  
  // 拦截XMLHttpRequest
  XMLHttpRequest.prototype.open = function(method, url, async = true) {
    this._snifferInfo = {
      id: Date.now() + Math.random(),
      method: method,
      url: url,
      type: getResourceType(url),
      timestamp: new Date().toLocaleTimeString(),
      status: 'pending',
      size: '0 B',
      headers: {},
      requestBody: null,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      responseHeaders: {},
      responseBody: null
    };
    
    capturedRequests.unshift(this._snifferInfo);
    updateRequestList();
    
    return originalXHROpen.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
    if (this._snifferInfo) {
      this._snifferInfo.headers[name] = value;
    }
    return originalXHRSetRequestHeader.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.send = function(body) {
    if (this._snifferInfo && body) {
      this._snifferInfo.requestBody = body;
    }
    
    this.addEventListener('load', function() {
      if (this._snifferInfo) {
        this._snifferInfo.status = this.status;
        this._snifferInfo.size = formatBytes(this.response ? new Blob([this.response]).size : 0);
        this._snifferInfo.endTime = Date.now();
        this._snifferInfo.duration = this._snifferInfo.endTime - this._snifferInfo.startTime;
        
        // 获取响应头
        const headers = this.getAllResponseHeaders();
        if (headers) {
          const headerArray = headers.trim().split(/[\\r\\n]+/);
          this._snifferInfo.responseHeaders = {};
          headerArray.forEach(line => {
            const parts = line.split(': ');
            const header = parts.shift();
            const value = parts.join(': ');
            this._snifferInfo.responseHeaders[header] = value;
          });
        }
        
        // 保存响应体
        if (this.response && this.response instanceof Blob) {
          if (this.response.size < 1024 * 1024) {
            if (this.response.type.includes('text') || this.response.type.includes('json')) {
              const reader = new FileReader();
              reader.onload = () => {
                this._snifferInfo.responseBody = reader.result;
                updateRequestList();
              };
              reader.readAsText(this.response);
            } else if (this.response.type.includes('image')) {
              this._snifferInfo.responseBody = URL.createObjectURL(this.response);
            }
          }
        } else if (this.responseText && this.responseText.length < 1024 * 1024) {
          this._snifferInfo.responseBody = this.responseText;
        }
        
        updateRequestList();
      }
    });
    
    this.addEventListener('error', function() {
      if (this._snifferInfo) {
        this._snifferInfo.status = 'error';
        this._snifferInfo.endTime = Date.now();
        this._snifferInfo.duration = this._snifferInfo.endTime - this._snifferInfo.startTime;
        updateRequestList();
      }
    });
    
    return originalXHRSend.apply(this, arguments);
  };
}

function stopSniffer() {
  // 恢复原始方法
  window.fetch = originalFetch;
  XMLHttpRequest.prototype.open = originalXHROpen;
  XMLHttpRequest.prototype.send = originalXHRSend;
  XMLHttpRequest.prototype.setRequestHeader = originalXHRSetRequestHeader;
}

function getResourceType(url) {
  const ext = url.split('.').pop().toLowerCase().split('?')[0];
  const types = {
    'js': 'JavaScript',
    'css': 'CSS',
    'png': 'Image',
    'jpg': 'Image',
    'jpeg': 'Image',
    'gif': 'Image',
    'svg': 'Image',
    'webp': 'Image',
    'ico': 'Icon',
    'html': 'HTML',
    'json': 'JSON',
    'xml': 'XML',
    'mp4': 'Video',
    'webm': 'Video',
    'avi': 'Video',
    'mov': 'Video',
    'mp3': 'Audio',
    'wav': 'Audio',
    'ogg': 'Audio',
    'woff': 'Font',
    'woff2': 'Font',
    'ttf': 'Font',
    'eot': 'Font'
  };
  return types[ext] || 'Other';
}

function formatBytes(bytes) {
  if(bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateRequestList() {
  const list = document.getElementById('requestList');
  if(!list) return;
  
  if(capturedRequests.length === 0) {
    list.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">暂无数据</div>';
    return;
  }
  
  list.innerHTML = capturedRequests.map(req => \`
    <div class="request-item" data-id="\${req.id}" style="padding:10px;margin:5px 0;background:rgba(255,255,255,0.3);border-radius:6px;cursor:pointer;border-left:4px solid \${getStatusColor(req.status)};font-size:12px;">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:5px;">
        <span style="font-weight:bold;color:\${getMethodColor(req.method)};">\${req.method}</span>
        <span style="padding:2px 6px;border-radius:4px;background:\${getStatusColor(req.status)};color:white;font-size:10px;">
          \${req.status}
        </span>
      </div>
      <div style="color:#666;margin-bottom:3px;font-size:10px;">\${req.type}</div>
      <div style="color:#666;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="\${req.url}">\${req.url}</div>
      <div style="display:flex;justify-content:space-between;margin-top:5px;font-size:10px;color:#999;">
        <span>\${req.size}</span>
        <span>\${req.duration ? req.duration + 'ms' : ''}</span>
      </div>
    </div>
  \`).join('');
  
  // 添加点击事件
  document.querySelectorAll('.request-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      showRequestDetails(id);
    });
  });
}

function showRequestDetails(id) {
  const request = capturedRequests.find(req => req.id === id);
  if(!request) return;
  
  const details = document.getElementById('requestDetails');
  
  let headersHTML = '';
  Object.entries(request.headers).forEach(([key, value]) => {
    headersHTML += \`<div style="margin-bottom:5px;"><strong>\${key}:</strong> \${value}</div>\`;
  });
  
  let responseHeadersHTML = '';
  Object.entries(request.responseHeaders).forEach(([key, value]) => {
    responseHeadersHTML += \`<div style="margin-bottom:5px;"><strong>\${key}:</strong> \${value}</div>\`;
  });
  
  let responseBodyHTML = '';
  if (request.responseBody) {
    if (typeof request.responseBody === 'string' && request.responseBody.startsWith('blob:')) {
      responseBodyHTML = \`<img src="\${request.responseBody}" style="max-width:100%;max-height:200px;" onerror="this.style.display='none'">\`;
    } else if (request.type === 'JSON' || (request.responseBody && request.responseBody.trim().startsWith('{'))) {
      try {
        const formatted = JSON.stringify(JSON.parse(request.responseBody), null, 2);
        responseBodyHTML = \`<pre style="background:rgba(0,0,0,0.1);padding:10px;border-radius:5px;max-height:200px;overflow:auto;font-size:10px;">\${formatted}</pre>\`;
      } catch {
        responseBodyHTML = \`<pre style="background:rgba(0,0,0,0.1);padding:10px;border-radius:5px;max-height:200px;overflow:auto;font-size:10px;">\${request.responseBody}</pre>\`;
      }
    } else {
      responseBodyHTML = \`<pre style="background:rgba(0,0,0,0.1);padding:10px;border-radius:5px;max-height:200px;overflow:auto;font-size:10px;">\${request.responseBody}</pre>\`;
    }
  }
  
  details.innerHTML = \`
    <div style="margin-bottom:15px;">
      <h4 style="color:#2c5282;margin-bottom:10px;">基本信息</h4>
      <div style="background:rgba(255,255,255,0.2);padding:10px;border-radius:5px;">
        <div><strong>URL:</strong> \${request.url}</div>
        <div><strong>方法:</strong> \${request.method}</div>
        <div><strong>类型:</strong> \${request.type}</div>
        <div><strong>状态:</strong> <span style="color:\${getStatusColor(request.status)}">\${request.status}</span></div>
        <div><strong>大小:</strong> \${request.size}</div>
        <div><strong>耗时:</strong> \${request.duration ? request.duration + 'ms' : 'N/A'}</div>
        <div><strong>时间:</strong> \${request.timestamp}</div>
      </div>
    </div>
    
    <div style="margin-bottom:15px;">
      <h4 style="color:#2c5282;margin-bottom:10px;">请求头</h4>
      <div style="background:rgba(255,255,255,0.2);padding:10px;border-radius:5px;max-height:150px;overflow-y:auto;">
        \${headersHTML || '<div style="color:#666;">无请求头</div>'}
      </div>
    </div>
    
    <div style="margin-bottom:15px;">
      <h4 style="color:#2c5282;margin-bottom:10px;">响应头</h4>
      <div style="background:rgba(255,255,255,0.2);padding:10px;border-radius:5px;max-height:150px;overflow-y:auto;">
        \${responseHeadersHTML || '<div style="color:#666;">无响应头</div>'}
      </div>
    </div>
    
    <div style="margin-bottom:15px;">
      <h4 style="color:#2c5282;margin-bottom:10px;">响应体</h4>
      <div style="background:rgba(255,255,255,0.2);padding:10px;border-radius:5px;">
        \${responseBodyHTML || '<div style="color:#666;">无响应体或响应体过大</div>'}
      </div>
    </div>
    
    <div style="display:flex;gap:10px;">
      <button onclick="replayRequest('\${id}')" style="padding:8px 16px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:12px;color:#2d3748;cursor:pointer;font-size:12px;">重放请求</button>
      <button onclick="blockRequest('\${id}')" style="padding:8px 16px;background:linear-gradient(45deg,#f56565,#fc8181);border:none;border-radius:12px;color:white;cursor:pointer;font-size:12px;">拦截请求</button>
      <button onclick="copyRequestDetails('\${id}')" style="padding:8px 16px;background:rgba(160,174,192,0.3);border:none;border-radius:12px;color:#2d3748;cursor:pointer;font-size:12px;">复制详情</button>
    </div>
  \`;
}

function getStatusColor(status) {
  if(status === 200 || status === 'pending') return '#38a169';
  if(status >= 400 || status === 'error') return '#e53e3e';
  return '#d69e2e';
}

function getMethodColor(method) {
  const colors = {
    'GET': '#38a169',
    'POST': '#d69e2e',
    'PUT': '#3182ce',
    'DELETE': '#e53e3e',
    'PATCH': '#805ad5'
  };
  return colors[method] || '#718096';
}

function replayRequest(id) {
  const request = capturedRequests.find(req => req.id === id);
  if(!request) return;
  
  showNotification('正在重放请求...', 'info');
  
  fetch(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.requestBody
  }).then(response => {
    showNotification('请求重放成功', 'success');
  }).catch(error => {
    showNotification('请求重放失败: ' + error.message, 'error');
  });
}

function blockRequest(id) {
  const request = capturedRequests.find(req => req.id === id);
  if(!request) return;
  
  // 这里可以添加请求拦截逻辑
  showNotification(\`已拦截请求: \${request.url}\`, 'success');
}

function copyRequestDetails(id) {
  const request = capturedRequests.find(req => req.id === id);
  if(!request) return;
  
  const details = \`
URL: \${request.url}
方法: \${request.method}
状态: \${request.status}
类型: \${request.type}
大小: \${request.size}
耗时: \${request.duration ? request.duration + 'ms' : 'N/A'}
时间: \${request.timestamp}
  \`.trim();
  
  navigator.clipboard.writeText(details).then(() => {
    showNotification('请求详情已复制到剪贴板', 'success');
  });
}

function clearSnifferData() {
  if(confirm('确定要清空所有嗅探数据吗？')) {
    capturedRequests = [];
    updateRequestList();
    document.getElementById('requestDetails').innerHTML = '<div style="text-align:center;color:#666;padding:20px;">选择请求查看详情</div>';
    showNotification('嗅探数据已清空', 'success');
  }
}

function exportSnifferData() {
  const data = JSON.stringify(capturedRequests, null, 2);
  const blob = new Blob([data], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sniffer_data_' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showNotification('数据已导出', 'success');
}

function saveSnifferSettings() {
  const settings = {
    enabled: snifferEnabled,
    autoStart: document.getElementById('autoStartStatus')?.textContent === '开'
  };
  try {
    localStorage.setItem('${resourceSnifferDataName}', JSON.stringify(settings));
  } catch(e) {
    console.log('保存嗅探设置失败:', e);
  }
}

function loadSnifferSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem('${resourceSnifferDataName}') || '{}');
    snifferEnabled = settings.enabled || false;
    
    const button = document.getElementById('toggleSniffer');
    if(button) {
      if(snifferEnabled) {
        button.textContent = '停止嗅探';
        button.style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
        startSniffer();
      }
    }
    
    const statusElement = document.getElementById('autoStartStatus');
    if(statusElement) {
      statusElement.textContent = settings.autoStart ? '开' : '关';
    }
  } catch(e) {
    console.log('加载嗅探设置失败:', e);
  }
}

function closeSnifferModal() {
  const modal = document.getElementById('__SNIFFER_MODAL__');
  if(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// 自动启动嗅探
setTimeout(() => {
  const settings = JSON.parse(localStorage.getItem('${resourceSnifferDataName}') || '{}');
  if(settings.autoStart) {
    snifferEnabled = true;
    startSniffer();
  }
}, 2000);
`;

// =======================================================================================
// 第八部分：请求修改功能脚本（增强版）
// 功能：修改请求头和浏览器标识，实际生效
// =======================================================================================

const requestModScript = `
// 请求修改功能
let requestModEnabled = false;
let customHeaders = [];
let userAgents = {
  'chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'firefox': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'safari': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'edge': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
};
let languages = {
  'zh-CN': '中文(简体)',
  'zh-TW': '中文(繁体)',
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
  'ja-JP': '日本語',
  'ko-KR': '한국어',
  'fr-FR': 'Français',
  'de-DE': 'Deutsch',
  'es-ES': 'Español',
  'ru-RU': 'Русский'
};

// 存储原始方法
const originalFetch = window.fetch;
const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

function showRequestModModal() {
  if(document.getElementById('__REQUEST_MOD_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__REQUEST_MOD_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:900px;width:95%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;text-align:center;">🔧 请求修改设置</h3>
        
        <div style="display:flex;gap:15px;margin-bottom:20px;justify-content:center;">
          <button id="toggleRequestMod" onclick="toggleRequestMod()" style="padding:12px 24px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;font-weight:bold;">启用修改</button>
          <button onclick="testRequestMod()" style="padding:12px 24px;background:linear-gradient(45deg,#f6e05e,#faf089);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">测试修改</button>
        </div>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
          <div>
            <h4 style="color:#2c5282;margin-bottom:15px;">用户代理设置</h4>
            
            <div style="margin-bottom:15px;">
              <label style="display:block;margin-bottom:8px;font-weight:bold;">用户代理 (User Agent):</label>
              <select id="userAgent" style="width:100%;padding:10px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
                <option value="">保持原样</option>
                \${Object.entries(userAgents).map(([key, value]) => \`
                  <option value="\${value}">\${key.charAt(0).toUpperCase() + key.slice(1)}</option>
                \`).join('')}
              </select>
            </div>
            
            <div style="margin-bottom:15px;">
              <label style="display:block;margin-bottom:8px;font-weight:bold;">自定义User Agent:</label>
              <textarea id="customUserAgent" placeholder="输入自定义User Agent" style="width:100%;height:80px;padding:10px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);resize:vertical;display:none;"></textarea>
              <button onclick="toggleCustomUA()" style="padding:6px 12px;background:rgba(160,174,192,0.3);border:none;border-radius:8px;color:#2d3748;cursor:pointer;font-size:12px;margin-top:5px;">使用自定义UA</button>
            </div>
          </div>
          
          <div>
            <h4 style="color:#2c5282;margin-bottom:15px;">语言和区域设置</h4>
            
            <div style="margin-bottom:15px;">
              <label style="display:block;margin-bottom:8px;font-weight:bold;">接受语言 (Accept-Language):</label>
              <select id="acceptLanguage" style="width:100%;padding:10px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
                <option value="">保持原样</option>
                \${Object.entries(languages).map(([code, name]) => \`
                  <option value="\${code}">\${name}</option>
                \`).join('')}
              </select>
            </div>
            
            <div style="margin-bottom:15px;">
              <label style="display:block;margin-bottom:8px;font-weight:bold;">自定义语言:</label>
              <input type="text" id="customLanguage" placeholder="输入自定义语言代码" style="width:100%;padding:10px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);display:none;">
              <button onclick="toggleCustomLang()" style="padding:6px 12px;background:rgba(160,174,192,0.3);border:none;border-radius:8px;color:#2d3748;cursor:pointer;font-size:12px;margin-top:5px;">使用自定义语言</button>
            </div>
          </div>
        </div>
        
        <div>
          <h4 style="color:#2c5282;margin-bottom:15px;">自定义请求头</h4>
          
          <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:10px;margin-bottom:15px;">
            <input type="text" id="headerName" placeholder="Header名称 (如: X-Custom-Header)" style="padding:10px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
            <input type="text" id="headerValue" placeholder="Header值" style="padding:10px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
            <button onclick="addCustomHeader()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:12px;color:#2d3748;cursor:pointer;">添加</button>
          </div>
          
          <div id="headerList" style="margin-top:10px;max-height:200px;overflow-y:auto;border:1px solid rgba(160,174,192,0.3);border-radius:8px;padding:15px;background:rgba(255,255,255,0.2);"></div>
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;margin-top:30px;">
          <button onclick="saveRequestModSettings()" style="padding:12px 30px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;font-weight:bold;">保存设置</button>
          <button onclick="closeRequestModModal()" style="padding:12px 30px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭</button>
        </div>
      </div>
    </div>
  </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  setTimeout(() => {
    const modal = document.getElementById('__REQUEST_MOD_MODAL__');
    const content = modal.querySelector('div > div');
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
    
    loadRequestModSettings();
  }, 100);
}

function toggleRequestMod() {
  requestModEnabled = !requestModEnabled;
  const button = document.getElementById('toggleRequestMod');
  if(requestModEnabled) {
    button.textContent = '禁用修改';
    button.style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
    applyRequestModifications();
    showNotification('请求修改已启用', 'success');
  } else {
    button.textContent = '启用修改';
    button.style.background = 'rgba(160,174,192,0.3)';
    removeRequestModifications();
    showNotification('请求修改已禁用', 'info');
  }
}

function testRequestMod() {
  // 发送测试请求来验证修改是否生效
  const testUrl = 'https://httpbin.org/get';
  
  fetch(testUrl)
    .then(response => response.json())
    .then(data => {
      showNotification('请求修改测试成功！检查控制台查看详情。', 'success');
      console.log('请求修改测试结果:', data);
    })
    .catch(error => {
      showNotification('测试请求失败: ' + error.message, 'error');
    });
}

function toggleCustomUA() {
  const customUA = document.getElementById('customUserAgent');
  const selectUA = document.getElementById('userAgent');
  
  if(customUA.style.display === 'none') {
    customUA.style.display = 'block';
    selectUA.style.display = 'none';
    customUA.focus();
  } else {
    customUA.style.display = 'none';
    selectUA.style.display = 'block';
  }
}

function toggleCustomLang() {
  const customLang = document.getElementById('customLanguage');
  const selectLang = document.getElementById('acceptLanguage');
  
  if(customLang.style.display === 'none') {
    customLang.style.display = 'block';
    selectLang.style.display = 'none';
    customLang.focus();
  } else {
    customLang.style.display = 'none';
    selectLang.style.display = 'block';
  }
}

function addCustomHeader() {
  const name = document.getElementById('headerName').value.trim();
  const value = document.getElementById('headerValue').value.trim();
  
  if(!name || !value) {
    showNotification('请填写Header名称和值', 'error');
    return;
  }
  
  // 检查是否已存在同名的Header
  const exists = customHeaders.some(header => header.name.toLowerCase() === name.toLowerCase());
  if(exists) {
    showNotification('已存在同名的Header', 'error');
    return;
  }
  
  customHeaders.push({ name, value });
  updateHeaderList();
  
  // 清空输入框
  document.getElementById('headerName').value = '';
  document.getElementById('headerValue').value = '';
  
  showNotification('自定义Header已添加', 'success');
}

function updateHeaderList() {
  const list = document.getElementById('headerList');
  list.innerHTML = '';
  
  if(customHeaders.length === 0) {
    list.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">暂无自定义Header</div>';
    return;
  }
  
  customHeaders.forEach((header, index) => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.style.padding = '10px';
    item.style.marginBottom = '8px';
    item.style.background = 'rgba(255,255,255,0.2)';
    item.style.borderRadius = '6px';
    item.style.fontSize = '14px';
    
    item.innerHTML = \`
      <div style="flex:1;">
        <strong style="color:#2c5282;">\${header.name}</strong>: \${header.value}
      </div>
      <button onclick="removeCustomHeader(\${index})" style="background:none;border:none;color:#c53030;cursor:pointer;font-size:18px;padding:0 8px;">×</button>
    \`;
    
    list.appendChild(item);
  });
}

function removeCustomHeader(index) {
  customHeaders.splice(index, 1);
  updateHeaderList();
  showNotification('自定义Header已删除', 'info');
}

function saveRequestModSettings() {
  const userAgentSelect = document.getElementById('userAgent');
  const customUserAgent = document.getElementById('customUserAgent');
  const acceptLanguageSelect = document.getElementById('acceptLanguage');
  const customLanguage = document.getElementById('customLanguage');
  
  const userAgent = customUserAgent.style.display !== 'none' ? customUserAgent.value : userAgentSelect.value;
  const acceptLanguage = customLanguage.style.display !== 'none' ? customLanguage.value : acceptLanguageSelect.value;
  
  const settings = {
    enabled: requestModEnabled,
    userAgent: userAgent,
    acceptLanguage: acceptLanguage,
    customHeaders: customHeaders,
    lastModified: new Date().toISOString()
  };
  
  try {
    localStorage.setItem('${requestModDataName}', JSON.stringify(settings));
    
    if(requestModEnabled) {
      applyRequestModifications();
    }
    
    showNotification('请求修改设置已保存！', 'success');
  } catch(e) {
    showNotification('保存失败: ' + e.message, 'error');
  }
}

function loadRequestModSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem('${requestModDataName}') || '{}');
    requestModEnabled = settings.enabled || false;
    customHeaders = settings.customHeaders || [];
    
    const button = document.getElementById('toggleRequestMod');
    if(button) {
      if(requestModEnabled) {
        button.textContent = '禁用修改';
        button.style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
      }
    }
    
    // 加载用户代理设置
    if(settings.userAgent) {
      const isCustom = !Object.values(userAgents).includes(settings.userAgent);
      if(isCustom) {
        document.getElementById('customUserAgent').value = settings.userAgent;
        toggleCustomUA();
      } else {
        document.getElementById('userAgent').value = settings.userAgent;
      }
    }
    
    // 加载语言设置
    if(settings.acceptLanguage) {
      const isCustom = !Object.keys(languages).includes(settings.acceptLanguage);
      if(isCustom) {
        document.getElementById('customLanguage').value = settings.acceptLanguage;
        toggleCustomLang();
      } else {
        document.getElementById('acceptLanguage').value = settings.acceptLanguage;
      }
    }
    
    updateHeaderList();
  } catch(e) {
    console.log('加载请求修改设置失败:', e);
  }
}

function applyRequestModifications() {
  const settings = JSON.parse(localStorage.getItem('${requestModDataName}') || '{}');
  
  // 拦截fetch请求
  window.fetch = function(input, init = {}) {
    const modifiedInit = { ...init };
    
    // 修改headers
    if(!modifiedInit.headers) {
      modifiedInit.headers = new Headers();
    } else if(!(modifiedInit.headers instanceof Headers)) {
      modifiedInit.headers = new Headers(modifiedInit.headers);
    }
    
    // 应用自定义headers
    settings.customHeaders?.forEach(header => {
      modifiedInit.headers.set(header.name, header.value);
    });
    
    // 应用User-Agent
    if(settings.userAgent) {
      modifiedInit.headers.set('User-Agent', settings.userAgent);
    }
    
    // 应用Accept-Language
    if(settings.acceptLanguage) {
      modifiedInit.headers.set('Accept-Language', settings.acceptLanguage);
    }
    
    return originalFetch(input, modifiedInit);
  };
  
  // 拦截XMLHttpRequest
  XMLHttpRequest.prototype.open = function(method, url, async = true) {
    this._requestMod = {
      method,
      url,
      async
    };
    return originalXHROpen.call(this, method, url, async);
  };
  
  XMLHttpRequest.prototype.send = function(data) {
    // 在发送前修改headers
    if(settings.userAgent) {
      this.setRequestHeader('User-Agent', settings.userAgent);
    }
    if(settings.acceptLanguage) {
      this.setRequestHeader('Accept-Language', settings.acceptLanguage);
    }
    
    settings.customHeaders?.forEach(header => {
      this.setRequestHeader(header.name, header.value);
    });
    
    return originalXHRSend.call(this, data);
  };
}

function removeRequestModifications() {
  // 恢复原始方法
  window.fetch = originalFetch;
  XMLHttpRequest.prototype.open = originalXHROpen;
  XMLHttpRequest.prototype.send = originalXHRSend;
}

function closeRequestModModal() {
  const modal = document.getElementById('__REQUEST_MOD_MODAL__');
  if(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// 初始化请求修改
setTimeout(() => {
  const settings = JSON.parse(localStorage.getItem('${requestModDataName}') || '{}');
  if(settings.enabled) {
    requestModEnabled = true;
    applyRequestModifications();
  }
}, 2000);
`;

// =======================================================================================
// 第九部分：无图模式功能脚本（增强版）
// 功能：控制图片和视频加载
// =======================================================================================

const imageBlockScript = `
// 无图模式功能
let imageBlockEnabled = false;
let videoBlockEnabled = false;

function toggleImageBlock() {
  const settings = JSON.parse(localStorage.getItem('${imageBlockDataName}') || '{}');
  
  if(!settings.enabled && !settings.videoEnabled) {
    // 第一次启用，显示选项
    showImageBlockOptions();
    return;
  }
  
  imageBlockEnabled = !settings.enabled;
  videoBlockEnabled = settings.videoEnabled;
  
  if(imageBlockEnabled || videoBlockEnabled) {
    blockMedia();
  } else {
    unblockMedia();
  }
  
  saveImageBlockSettings();
  updateImageBlockButton();
}

function showImageBlockOptions() {
  if(document.getElementById('__IMAGE_BLOCK_OPTIONS__')) return;
  
  const modalHTML = \`
  <div id="__IMAGE_BLOCK_OPTIONS__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:500px;width:90%;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🖼️ 媒体拦截设置</h3>
        
        <div style="text-align:left;margin-bottom:25px;">
          <label style="display:flex;align-items:center;margin-bottom:15px;cursor:pointer;">
            <input type="checkbox" id="blockImages" style="margin-right:10px;" checked>
            <span>拦截图片 (jpg, png, gif, webp, svg)</span>
          </label>
          
          <label style="display:flex;align-items:center;margin-bottom:15px;cursor:pointer;">
            <input type="checkbox" id="blockVideos" style="margin-right:10px;">
            <span>拦截视频 (mp4, webm, avi, mov)</span>
          </label>
          
          <label style="display:flex;align-items:center;cursor:pointer;">
            <input type="checkbox" id="blockBackground" style="margin-right:10px;">
            <span>拦截背景图片</span>
          </label>
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;">
          <button onclick="applyImageBlockSettings()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;font-weight:bold;">应用设置</button>
          <button onclick="closeImageBlockOptions()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">取消</button>
        </div>
      </div>
    </div>
  </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  setTimeout(() => {
    const modal = document.getElementById('__IMAGE_BLOCK_OPTIONS__');
    const content = modal.querySelector('div > div');
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
  }, 100);
}

function applyImageBlockSettings() {
  imageBlockEnabled = document.getElementById('blockImages').checked;
  videoBlockEnabled = document.getElementById('blockVideos').checked;
  const blockBackground = document.getElementById('blockBackground').checked;
  
  if(imageBlockEnabled || videoBlockEnabled) {
    blockMedia(blockBackground);
    showNotification('媒体拦截已启用', 'success');
  } else {
    unblockMedia();
    showNotification('媒体拦截已禁用', 'info');
  }
  
  saveImageBlockSettings();
  updateImageBlockButton();
  closeImageBlockOptions();
}

function closeImageBlockOptions() {
  const modal = document.getElementById('__IMAGE_BLOCK_OPTIONS__');
  if(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

function blockMedia(blockBackground = false) {
  // 图片拦截
  if(imageBlockEnabled) {
    const images = document.querySelectorAll('img, picture, source[type^="image"], [style*="background-image"]');
    images.forEach(element => {
      if(element.tagName === 'IMG') {
        element.setAttribute('data-original-src', element.src || '');
        element.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
        element.style.filter = 'blur(2px) grayscale(100%)';
        element.style.opacity = '0.6';
      } else if(blockBackground && element.style.backgroundImage) {
        element.setAttribute('data-original-bg', element.style.backgroundImage);
        element.style.backgroundImage = 'none';
      }
    });
  }
  
  // 视频拦截
  if(videoBlockEnabled) {
    const videos = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"], source[type^="video"]');
    videos.forEach(video => {
      if(video.tagName === 'VIDEO') {
        video.setAttribute('data-original-src', video.src || '');
        video.pause();
        video.style.filter = 'blur(5px) grayscale(100%)';
        video.style.opacity = '0.3';
      } else if(video.tagName === 'IFRAME') {
        video.style.filter = 'blur(5px) grayscale(100%)';
        video.style.opacity = '0.3';
      }
    });
  }
  
  // 阻止新的媒体加载
  if(!window.imageBlockObserver) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if(node.nodeType === 1) {
            if(imageBlockEnabled) {
              // 处理图片
              if(node.tagName === 'IMG') {
                node.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
                node.style.filter = 'blur(2px) grayscale(100%)';
                node.style.opacity = '0.6';
              }
              const newImages = node.querySelectorAll && node.querySelectorAll('img');
              if(newImages) {
                newImages.forEach(img => {
                  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
                  img.style.filter = 'blur(2px) grayscale(100%)';
                  img.style.opacity = '0.6';
                });
              }
            }
            
            if(videoBlockEnabled) {
              // 处理视频
              if(node.tagName === 'VIDEO') {
                node.style.filter = 'blur(5px) grayscale(100%)';
                node.style.opacity = '0.3';
              }
              const newVideos = node.querySelectorAll && node.querySelectorAll('video');
              if(newVideos) {
                newVideos.forEach(video => {
                  video.style.filter = 'blur(5px) grayscale(100%)';
                  video.style.opacity = '0.3';
                });
              }
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    window.imageBlockObserver = observer;
  }
}

function unblockMedia() {
  // 恢复图片
  const images = document.querySelectorAll('img, picture, source[type^="image"], [style*="background-image"]');
  images.forEach(element => {
    if(element.tagName === 'IMG') {
      const originalSrc = element.getAttribute('data-original-src');
      if(originalSrc) {
        element.src = originalSrc;
      }
      element.style.filter = '';
      element.style.opacity = '';
      element.removeAttribute('data-original-src');
    } else {
      const originalBg = element.getAttribute('data-original-bg');
      if(originalBg) {
        element.style.backgroundImage = originalBg;
        element.removeAttribute('data-original-bg');
      }
    }
  });
  
  // 恢复视频
  const videos = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"], source[type^="video"]');
  videos.forEach(video => {
    if(video.tagName === 'VIDEO') {
      const originalSrc = video.getAttribute('data-original-src');
      if(originalSrc) {
        video.src = originalSrc;
      }
      video.style.filter = '';
      video.style.opacity = '';
      video.removeAttribute('data-original-src');
    } else if(video.tagName === 'IFRAME') {
      video.style.filter = '';
      video.style.opacity = '';
    }
  });
  
  // 停止观察
  if(window.imageBlockObserver) {
    window.imageBlockObserver.disconnect();
    window.imageBlockObserver = null;
  }
}

function updateImageBlockButton() {
  const settings = JSON.parse(localStorage.getItem('${imageBlockDataName}') || '{}');
  if(settings.enabled || settings.videoEnabled) {
    showNotification(\`无图模式: \${settings.enabled ? '图片拦截' : ''}\${settings.enabled && settings.videoEnabled ? '+' : ''}\${settings.videoEnabled ? '视频拦截' : ''}\`, 'info');
  }
}

function saveImageBlockSettings() {
  const settings = {
    enabled: imageBlockEnabled,
    videoEnabled: videoBlockEnabled,
    lastModified: new Date().toISOString()
  };
  try {
    localStorage.setItem('${imageBlockDataName}', JSON.stringify(settings));
  } catch(e) {
    console.log('保存无图模式设置失败:', e);
  }
}

function loadImageBlockState() {
  try {
    const settings = JSON.parse(localStorage.getItem('${imageBlockDataName}') || '{}');
    imageBlockEnabled = settings.enabled || false;
    videoBlockEnabled = settings.videoEnabled || false;
    
    if(imageBlockEnabled || videoBlockEnabled) {
      blockMedia();
    }
  } catch(e) {
    console.log('加载无图模式设置失败:', e);
  }
}
`;

// =======================================================================================
// 第十部分：网站Cookie记录功能
// 功能：记录和显示访问过的网站Cookie
// =======================================================================================

const websiteCookiesScript = `
// 网站Cookie记录功能
function showWebsiteCookiesModal() {
  if(document.getElementById('__WEBSITE_COOKIES_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__WEBSITE_COOKIES_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:95%;width:1200px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="color:#2d3748;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h3 style="color:#2c5282;margin:0;">📝 网站Cookie记录</h3>
          <div style="display:flex;gap:10px;">
            <button onclick="recordCurrentCookies()" style="padding:8px 16px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:12px;color:#2d3748;cursor:pointer;font-size:12px;">记录当前</button>
            <button onclick="exportAllCookies()" style="padding:8px 16px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:12px;color:#2d3748;cursor:pointer;font-size:12px;">导出全部</button>
            <button onclick="clearAllWebsiteCookies()" style="padding:8px 16px;background:linear-gradient(45deg,#f56565,#fc8181);border:none;border-radius:12px;color:white;cursor:pointer;font-size:12px;">清空记录</button>
          </div>
        </div>
        
        <div style="background:rgba(255,255,255,0.5);border-radius:8px;padding:20px;max-height:500px;overflow-y:auto;">
          <div id="websiteCookiesList"></div>
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="closeWebsiteCookiesModal()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭</button>
        </div>
      </div>
    </div>
  </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  setTimeout(() => {
    const modal = document.getElementById('__WEBSITE_COOKIES_MODAL__');
    const content = modal.querySelector('div > div');
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
    
    loadWebsiteCookies();
  }, 100);
}

function recordCurrentCookies() {
  const currentUrl = window.location.href;
  const domain = new URL(currentUrl).hostname;
  const cookies = document.cookie.split(';').map(c => c.trim()).filter(c => c);
  
  if(cookies.length === 0) {
    showNotification('当前网站没有Cookie可记录', 'info');
    return;
  }
  
  const cookieData = {
    domain: domain,
    url: currentUrl,
    cookies: cookies,
    recordedAt: new Date().toISOString(),
    cookieCount: cookies.length
  };
  
  try {
    const allCookies = JSON.parse(localStorage.getItem('${websiteCookiesDataName}') || '{}');
    allCookies[domain] = cookieData;
    localStorage.setItem('${websiteCookiesDataName}', JSON.stringify(allCookies));
    
    showNotification(\`已记录 \${cookies.length} 个Cookie\`, 'success');
    loadWebsiteCookies();
  } catch(e) {
    showNotification('记录失败: ' + e.message, 'error');
  }
}

function loadWebsiteCookies() {
  const list = document.getElementById('websiteCookiesList');
  const allCookies = JSON.parse(localStorage.getItem('${websiteCookiesDataName}') || '{}');
  const websites = Object.values(allCookies);
  
  if(websites.length === 0) {
    list.innerHTML = '<div style="text-align:center;color:#666;padding:40px;">暂无网站Cookie记录</div>';
    return;
  }
  
  // 按记录时间排序
  websites.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
  
  list.innerHTML = websites.map(site => \`
    <div style="background:rgba(255,255,255,0.3);border-radius:8px;padding:15px;margin-bottom:15px;">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
        <div style="flex:1;">
          <div style="font-weight:bold;color:#2c5282;margin-bottom:5px;">\${site.domain}</div>
          <div style="font-size:12px;color:#666;margin-bottom:5px;">\${site.url}</div>
          <div style="font-size:11px;color:#999;">记录时间: \${new Date(site.recordedAt).toLocaleString()}</div>
        </div>
        <div style="display:flex;gap:5px;flex-shrink:0;">
          <button onclick="injectWebsiteCookies('\${site.domain}')" style="padding:6px 12px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:8px;color:#2d3748;cursor:pointer;font-size:11px;">注入</button>
          <button onclick="viewWebsiteCookies('\${site.domain}')" style="padding:6px 12px;background:rgba(160,174,192,0.3);border:none;border-radius:8px;color:#2d3748;cursor:pointer;font-size:11px;">查看</button>
          <button onclick="deleteWebsiteCookies('\${site.domain}')" style="padding:6px 12px;background:linear-gradient(45deg,#f56565,#fc8181);border:none;border-radius:8px;color:white;cursor:pointer;font-size:11px;">删除</button>
        </div>
      </div>
      <div style="font-size:12px;color:#666;">
        \${site.cookieCount} 个Cookie
      </div>
    </div>
  \`).join('');
}

function viewWebsiteCookies(domain) {
  const allCookies = JSON.parse(localStorage.getItem('${websiteCookiesDataName}') || '{}');
  const siteData = allCookies[domain];
  
  if(!siteData) {
    showNotification('未找到该网站的Cookie记录', 'error');
    return;
  }
  
  let cookiesHTML = siteData.cookies.map(cookie => {
    const [name, ...valueParts] = cookie.split('=');
    const value = valueParts.join('=');
    return \`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;margin:5px 0;background:rgba(255,255,255,0.2);border-radius:6px;font-size:12px;">
        <div style="flex:1;">
          <strong>\${name}</strong>=\${value}
        </div>
        <button onclick="copyCookieValue('\${name}', '\${value}')" style="padding:2px 6px;background:rgba(160,174,192,0.3);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;">复制</button>
      </div>
    \`;
  }).join('');
  
  const modalHTML = \`
  <div id="__VIEW_COOKIES_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000001;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="color:#2d3748;">
        <h4 style="color:#2c5282;margin-bottom:15px;">\${domain} 的Cookie</h4>
        <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:15px;max-height:400px;overflow-y:auto;">
          \${cookiesHTML}
        </div>
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="closeViewCookiesModal()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭</button>
        </div>
      </div>
    </div>
  </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  setTimeout(() => {
    const modal = document.getElementById('__VIEW_COOKIES_MODAL__');
    const content = modal.querySelector('div > div');
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
  }, 100);
}

function injectWebsiteCookies(domain) {
  const allCookies = JSON.parse(localStorage.getItem('${websiteCookiesDataName}') || '{}');
  const siteData = allCookies[domain];
  
  if(!siteData) {
    showNotification('未找到该网站的Cookie记录', 'error');
    return;
  }
  
  // 注入Cookie
  siteData.cookies.forEach(cookieStr => {
    document.cookie = cookieStr + '; samesite=lax';
  });
  
  showNotification(\`已注入 \${siteData.cookieCount} 个Cookie\`, 'success');
  setTimeout(() => {
    location.reload();
  }, 1000);
}

function copyCookieValue(name, value) {
  navigator.clipboard.writeText(value).then(() => {
    showNotification(\`已复制 \${name} 的值\`, 'success');
  });
}

function deleteWebsiteCookies(domain) {
  if(confirm(\`确定要删除 \${domain} 的Cookie记录吗？\`)) {
    const allCookies = JSON.parse(localStorage.getItem('${websiteCookiesDataName}') || '{}');
    delete allCookies[domain];
    localStorage.setItem('${websiteCookiesDataName}', JSON.stringify(allCookies));
    showNotification('Cookie记录已删除', 'success');
    loadWebsiteCookies();
  }
}

function exportAllCookies() {
  const allCookies = JSON.parse(localStorage.getItem('${websiteCookiesDataName}') || '{}');
  const data = JSON.stringify(allCookies, null, 2);
  const blob = new Blob([data], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'website_cookies_backup.json';
  a.click();
  URL.revokeObjectURL(url);
  showNotification('所有Cookie记录已导出', 'success');
}

function clearAllWebsiteCookies() {
  if(confirm('确定要清空所有网站Cookie记录吗？此操作不可逆！')) {
    localStorage.removeItem('${websiteCookiesDataName}');
    showNotification('所有Cookie记录已清空', 'success');
    loadWebsiteCookies();
  }
}

function closeViewCookiesModal() {
  const modal = document.getElementById('__VIEW_COOKIES_MODAL__');
  if(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

function closeWebsiteCookiesModal() {
  const modal = document.getElementById('__WEBSITE_COOKIES_MODAL__');
  if(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}
`;

// =======================================================================================
// 第十一部分：HTTP请求注入脚本（核心功能）
// 功能：注入各种JavaScript hook来重写URL和处理代理逻辑
// =======================================================================================

const httpRequestInjection = `

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

// 把relativePath去除掉当前代理的地址 https://proxy.com/ ， relative path成为 被代理的（相对）地址，比如 https://example.com/1?q#1

// 如果relativePath是以 / 开头的，那么它就是一个绝对路径，我们需要把它变成完整的URL
if(relativePath.startsWith("/")){
var fullURL = new URL(original_website_host_with_schema.substring(0, original_website_host_with_schema.length - 1) + relativePath);
return pathAfterAdd + proxy_host_with_schema + fullURL.href;
}

if(relativePath.startsWith("#")) return relativePath;

// 如果relativePath是完整的URL，那么直接返回代理后的URL
if(relativePath.indexOf("://") != -1){
var fullURL = new URL(relativePath);
return pathAfterAdd + proxy_host_with_schema + fullURL.href;
}

// 如果relativePath是相对路径，那么我们需要把它变成完整的URL
var fullURL = new URL(original_website_url_str);
var pathArray = fullURL.pathname.split("/");
pathArray.pop();
var path = pathArray.join("/");
if(!path.startsWith("/")) path = "/" + path;
if(!path.endsWith("/")) path = path + "/";
fullURL = new URL(path + relativePath, original_website_url_str);
return pathAfterAdd + proxy_host_with_schema + fullURL.href;

}catch(e){
console.log("Change URL Error **************************************:");
console.log(relativePath);
console.log(e);
return relativePath;
}

}

//---***========================================***---Location---***========================================***---

function changeLocation(){
const location = window.location;
const handler = {
get(target, prop) {
if (prop === 'href') {
return target[prop];
} else if (prop === 'assign') {
return function(url) {
window.location.href = changeURL(url);
};
} else if (prop === 'replace') {
return function(url) {
window.location.href = changeURL(url);
};
} else if (prop === 'reload') {
return target[prop];
} else if (typeof target[prop] === 'function') {
return target[prop].bind(target);
}
return target[prop];
},
set(target, prop, value) {
if (prop === 'href') {
window.location.href = changeURL(value);
return true;
}
return Reflect.set(target, prop, value);
}
};
window.location = new Proxy(location, handler);
}

//---***========================================***---History---***========================================***---

function changeHistory(){
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function(state, title, url) {
if (url && typeof url === 'string') {
url = changeURL(url);
}
return originalPushState.call(this, state, title, url);
};

history.replaceState = function(state, title, url) {
if (url && typeof url === 'string') {
url = changeURL(url);
}
return originalReplaceState.call(this, state, title, url);
};
}

//---***========================================***---Fetch---***========================================***---

function changeFetch(){
const originalFetch = window.fetch;
window.fetch = function(input, init) {
if (typeof input === 'string') {
input = changeURL(input);
} else if (input instanceof Request) {
input = new Request(changeURL(input.url), input);
}
return originalFetch.call(this, input, init);
};
}

//---***========================================***---XHR---***========================================***---

function changeXHR(){
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
arguments[1] = changeURL(url);
return originalOpen.apply(this, arguments);
};
}

//---***========================================***---DOM---***========================================***---

function changeDOM(){
const originalSetAttribute = Element.prototype.setAttribute;
Element.prototype.setAttribute = function(name, value) {
if (name === 'src' || name === 'href' || name === 'action' || name === 'data' || name === 'poster' || name === 'srcset') {
arguments[1] = changeURL(value);
}
return originalSetAttribute.apply(this, arguments);
};

// MutationObserver to handle dynamically added elements
const observer = new MutationObserver(function(mutations) {
mutations.forEach(function(mutation) {
mutation.addedNodes.forEach(function(node) {
if (node.nodeType === 1) { // Element node
// Handle attributes
['src', 'href', 'action', 'data', 'poster'].forEach(function(attr) {
if (node.hasAttribute(attr)) {
node.setAttribute(attr, changeURL(node.getAttribute(attr)));
}
});

// Handle srcset
if (node.hasAttribute('srcset')) {
var srcset = node.getAttribute('srcset');
var srcsetArray = srcset.split(',');
var newSrcsetArray = srcsetArray.map(function(src) {
var parts = src.trim().split(' ');
parts[0] = changeURL(parts[0]);
return parts.join(' ');
});
node.setAttribute('srcset', newSrcsetArray.join(', '));
}

// Handle child elements
if (node.querySelectorAll) {
['src', 'href', 'action', 'data', 'poster'].forEach(function(attr) {
node.querySelectorAll('[' + attr + ']').forEach(function(el) {
el.setAttribute(attr, changeURL(el.getAttribute(attr)));
});
});

// Handle srcset in child elements
node.querySelectorAll('[srcset]').forEach(function(el) {
var srcset = el.getAttribute('srcset');
var srcsetArray = srcset.split(',');
var newSrcsetArray = srcsetArray.map(function(src) {
var parts = src.trim().split(' ');
parts[0] = changeURL(parts[0]);
return parts.join(' ');
});
el.setAttribute('srcset', newSrcsetArray.join(', '));
});
}
}
});
});
});

observer.observe(document, {
childList: true,
subtree: true
});
}

//---***========================================***---Cookie---***========================================***---

function changeCookie(){
// 拦截document.cookie
const originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
Object.defineProperty(document, 'cookie', {
get: function() {
return originalCookieDescriptor.get.call(this);
},
set: function(value) {
// 修改cookie的domain和path
var parts = value.split(';');
var cookieName = parts[0].split('=')[0].trim();
var cookieValue = parts[0].split('=')[1];
var newCookie = cookieName + '=' + cookieValue;

for (var i = 1; i < parts.length; i++) {
var part = parts[i].trim();
if (part.toLowerCase().startsWith('domain=')) {
// 移除domain设置，让cookie使用当前域
continue;
}
if (part.toLowerCase().startsWith('path=')) {
newCookie += '; ' + part;
} else if (part.toLowerCase().startsWith('secure')) {
newCookie += '; Secure';
} else if (part.toLowerCase().startsWith('samesite=')) {
newCookie += '; ' + part;
} else if (part.toLowerCase().startsWith('expires=')) {
newCookie += '; ' + part;
} else if (part.toLowerCase().startsWith('max-age=')) {
newCookie += '; ' + part;
}
}

// 添加SameSite=Lax以避免某些限制
if (!newCookie.toLowerCase().includes('samesite=')) {
newCookie += '; SameSite=Lax';
}

return originalCookieDescriptor.set.call(this, newCookie);
}
});
}

//---***========================================***---执行---***========================================***---

changeLocation();
changeHistory();
changeFetch();
changeXHR();
changeDOM();
changeCookie();

//---***========================================***---移除script integrity---***========================================***---

document.addEventListener('DOMContentLoaded', function() {
var scripts = document.querySelectorAll('script');
scripts.forEach(function(script) {
script.removeAttribute('integrity');
});
});

//---***========================================***---监听URL变化---***========================================***---

let currentURL = window.location.href;
setInterval(function() {
if (window.location.href !== currentURL) {
currentURL = window.location.href;
// URL changed, reload the page
window.location.reload();
}
}, 100);
`;

// =======================================================================================
// 第十二部分：主请求处理函数
// 功能：处理所有传入的HTTP请求，包括代理页面和API请求
// =======================================================================================

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 处理静态资源
  if (path.startsWith('/assets/') || path.endsWith('.css') || path.endsWith('.js') || path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.ico')) {
    return fetch(request);
  }
  
  // 处理主页
  if (path === '/' || path === '') {
    return handleIndexPage(request);
  }
  
  // 处理代理请求
  return handleProxyRequest(request);
}

// =======================================================================================
// 第十三部分：主页处理函数
// 功能：显示代理服务的主页界面
// =======================================================================================

async function handleIndexPage(request) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web Proxy</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 500px;
            width: 100%;
            text-align: center;
        }
        
        .logo {
            font-size: 3em;
            margin-bottom: 20px;
            color: white;
        }
        
        h1 {
            color: white;
            margin-bottom: 10px;
            font-size: 2.5em;
            font-weight: 300;
        }
        
        .subtitle {
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 30px;
            font-size: 1.1em;
        }
        
        .input-group {
            margin-bottom: 20px;
        }
        
        input[type="url"] {
            width: 100%;
            padding: 15px 20px;
            border: none;
            border-radius: 50px;
            background: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            outline: none;
            transition: all 0.3s ease;
        }
        
        input[type="url"]:focus {
            background: white;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }
        
        button {
            width: 100%;
            padding: 15px 20px;
            border: none;
            border-radius: 50px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        
        .features {
            margin-top: 30px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .feature {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 15px;
            color: white;
            font-size: 14px;
        }
        
        @media (max-width: 600px) {
            .container {
                padding: 30px 20px;
            }
            
            h1 {
                font-size: 2em;
            }
            
            .features {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🌐</div>
        <h1>Web Proxy</h1>
        <div class="subtitle">安全、快速、功能丰富的网页代理服务</div>
        
        <form id="proxyForm">
            <div class="input-group">
                <input type="url" id="urlInput" placeholder="输入要访问的网址 (例如: https://example.com)" required>
            </div>
            <button type="submit">开始浏览</button>
        </form>
        
        <div class="features">
            <div class="feature">🔒 安全加密</div>
            <div class="feature">🚀 快速加载</div>
            <div class="feature">🛠️ 丰富工具</div>
            <div class="feature">📱 响应式设计</div>
        </div>
    </div>

    <script>
        document.getElementById('proxyForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const url = document.getElementById('urlInput').value.trim();
            if (url) {
                // 确保URL以http://或https://开头
                let targetUrl = url;
                if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                    targetUrl = 'https://' + targetUrl;
                }
                // 跳转到代理页面
                window.location.href = '${thisProxyServerUrlHttps}' + encodeURIComponent(targetUrl);
            }
        });
        
        // 自动聚焦输入框
        document.getElementById('urlInput').focus();
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

// =======================================================================================
// 第十四部分：代理请求处理函数
// 功能：处理所有代理请求，重写页面内容和注入脚本
// =======================================================================================

async function handleProxyRequest(request) {
  const url = new URL(request.url);
  const targetUrl = decodeURIComponent(url.pathname.substring(1));
  
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    return new Response('Invalid URL', { status: 400 });
  }
  
  try {
    // 获取目标网站内容
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    
    const contentType = response.headers.get('Content-Type') || '';
    
    // 如果不是HTML内容，直接返回
    if (!contentType.includes('text/html')) {
      return response;
    }
    
    // 读取HTML内容
    let html = await response.text();
    
    // 重写HTML中的URL
    html = rewriteHTML(html, targetUrl);
    
    // 注入脚本
    html = injectScripts(html);
    
    // 返回修改后的HTML
    return new Response(html, {
      status: response.status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        ...Object.fromEntries(
          [...response.headers.entries()].filter(([key]) => 
            !key.toLowerCase().includes('content-security-policy')
          )
        ),
      },
    });
    
  } catch (error) {
    return new Response('Error fetching URL: ' + error.message, { status: 500 });
  }
}

// =======================================================================================
// 第十五部分：HTML重写函数
// 功能：重写HTML中的所有URL为代理URL
// =======================================================================================

function rewriteHTML(html, baseUrl) {
  // 重写各种URL属性
  const urlAttributes = ['href', 'src', 'action', 'data', 'poster', 'srcset'];
  
  urlAttributes.forEach(attr => {
    const regex = new RegExp(\`\${attr}=["']([^"']*)["']\`, 'gi');
    html = html.replace(regex, (match, url) => {
      if (url.startsWith('data:') || url.startsWith('mailto:') || url.startsWith('javascript:') || url.startsWith('#')) {
        return match;
      }
      const newUrl = changeURLForServer(url, baseUrl);
      return \`\${attr}="\${newUrl}"\`;
    });
  });
  
  // 处理srcset属性
  const srcsetRegex = /srcset="([^"]*)"/gi;
  html = html.replace(srcsetRegex, (match, srcset) => {
    const newSrcset = srcset.split(',').map(src => {
      const parts = src.trim().split(' ');
      if (parts[0] && !parts[0].startsWith('data:')) {
        parts[0] = changeURLForServer(parts[0], baseUrl);
      }
      return parts.join(' ');
    }).join(', ');
    return \`srcset="\${newSrcset}"\`;
  });
  
  // 处理CSS中的URL
  const cssUrlRegex = /url\(['"]?([^'")]*)['"]?\)/gi;
  html = html.replace(cssUrlRegex, (match, url) => {
    if (url.startsWith('data:')) {
      return match;
    }
    const newUrl = changeURLForServer(url, baseUrl);
    return \`url("\${newUrl}")\`;
  });
  
  return html;
}

// =======================================================================================
// 第十六部分：URL转换函数（服务端）
// 功能：将URL转换为代理URL
// =======================================================================================

function changeURLForServer(relativePath, baseUrl) {
  if (!relativePath) return relativePath;
  
  try {
    // 跳过data URL和其他特殊协议
    if (relativePath.startsWith("data:") || relativePath.startsWith("mailto:") || relativePath.startsWith("javascript:") || relativePath.startsWith("chrome") || relativePath.startsWith("edge")) {
      return relativePath;
    }
    
    const base = new URL(baseUrl);
    
    // 如果已经是代理URL，直接返回
    if (relativePath.startsWith(thisProxyServerUrlHttps)) {
      return relativePath;
    }
    
    // 处理绝对路径
    if (relativePath.startsWith('/')) {
      const fullUrl = new URL(relativePath, base.origin);
      return \`\${thisProxyServerUrlHttps}\${encodeURIComponent(fullUrl.href)}\`;
    }
    
    // 处理完整URL
    if (relativePath.includes('://')) {
      return \`\${thisProxyServerUrlHttps}\${encodeURIComponent(relativePath)}\`;
    }
    
    // 处理相对路径
    const fullUrl = new URL(relativePath, base);
    return \`\${thisProxyServerUrlHttps}\${encodeURIComponent(fullUrl.href)}\`;
    
  } catch (error) {
    console.log('URL转换错误:', error);
    return relativePath;
  }
}

// =======================================================================================
// 第十七部分：脚本注入函数
// 功能：向HTML中注入各种功能脚本
// =======================================================================================

function injectScripts(html) {
  // 在head结束前注入样式
  const styleInjection = \`
  <style>
    /* 工具栏样式 */
    #__PROXY_TOOLBAR__ {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    /* 模态框样式 */
    #__COOKIE_INJECTION_MODAL__,
    #__ADBLOCK_MODAL__,
    #__SNIFFER_MODAL__,
    #__REQUEST_MOD_MODAL__,
    #__CHECK_RESULTS_MODAL__,
    #__COOKIE_MANAGEMENT_MODAL__,
    #__WEBSITE_COOKIES_MODAL__,
    #__VIEW_COOKIES_MODAL__,
    #__IMAGE_BLOCK_OPTIONS__,
    #__PROXY_HINT_MODAL__ {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    /* 通知样式 */
    #__PROXY_NOTIFICATIONS__ {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  </style>
  \`;
  
  // 在body结束前注入所有脚本
  const scriptInjection = \`
  \${styleInjection}
  <script>
    // 设置代理服务器URL
    window.proxyServerUrl = '\${thisProxyServerUrlHttps}';
    window.proxyHost = '\${thisProxyServerUrl_hostOnly}';
    
    // 注入各个功能模块
    \${toolbarInjection}
    \${cookieInjectionScript}
    \${adBlockScript}
    \${resourceSnifferScript}
    \${requestModScript}
    \${imageBlockScript}
    \${websiteCookiesScript}
    \${proxyHintInjection}
    \${httpRequestInjection}
  </script>
  \`;
  
  // 将脚本注入到body结束前
  if (html.includes('</body>')) {
    html = html.replace('</body>', \`\${scriptInjection}</body>\`);
  } else {
    html += scriptInjection;
  }
  
  return html;
}