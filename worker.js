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
  
  // 添加按钮到容器
  toolsContainer.appendChild(cookieBtn);
  toolsContainer.appendChild(adBlockBtn);
  toolsContainer.appendChild(snifferBtn);
  toolsContainer.appendChild(requestModBtn);
  toolsContainer.appendChild(imageBlockBtn);
  
  // 主按钮点击事件
  let toolsVisible = false;
  mainToolBtn.onclick = () => {
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
  
  btn.onmouseenter = () => {
    btn.style.transform = 'scale(1.1)';
    btn.style.boxShadow = '0 5px 15px rgba(160,174,192,0.4)';
  };
  
  btn.onmouseleave = () => {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 3px 10px rgba(160,174,192,0.3)';
  };
  
  btn.onclick = onClick;
  return btn;
}

// 初始化工具栏
setTimeout(initToolbar, 1000);
`;

// =======================================================================================
// 第五部分：Cookie注入功能脚本 - 增强版
// 功能：提供cookie注入界面和管理功能
// =======================================================================================

const cookieInjectionScript = `
// Cookie注入功能
let cookieManagerEnabled = false;

function showCookieModal() {
  if(document.getElementById('__COOKIE_MANAGER_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__COOKIE_MANAGER_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:95%;width:1200px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🍪 Cookie管理工具</h3>
        
        <div style="display:flex;gap:15px;margin-bottom:20px;justify-content:center;">
          <button onclick="showCookieInjectionPanel()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">注入新Cookie</button>
          <button onclick="showCookieManagementPanel()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">管理已保存</button>
          <button onclick="showCurrentCookies()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">查看当前网站Cookie</button>
        </div>
        
        <div id="cookieManagerContent">
          <!-- 内容区域将通过JavaScript动态加载 -->
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="closeCookieModal()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭</button>
        </div>
      </div>
    </div>
  </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  setTimeout(() => {
    const modal = document.getElementById('__COOKIE_MANAGER_MODAL__');
    const content = modal.querySelector('div > div');
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
    
    // 默认显示注入面板
    showCookieInjectionPanel();
  }, 100);
}

function showCookieInjectionPanel() {
  const currentSite = window.location.href;
  const content = document.getElementById('cookieManagerContent');
  
  content.innerHTML = \`
    <div style="text-align:left;">
      <div style="margin-bottom:20px;">
        <label style="display:block;margin-bottom:8px;font-weight:bold;">目标网站:</label>
        <input type="text" id="targetSite" value="\${currentSite}" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
      </div>
      
      <div style="margin-bottom:20px;">
        <label style="display:block;margin-bottom:8px;font-weight:bold;">输入方式:</label>
        <select id="inputType" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
          <option value="combined">合成Cookie输入</option>
          <option value="separate">分别输入</option>
        </select>
      </div>
      
      <div id="combinedInput" style="margin-bottom:20px;">
        <label style="display:block;margin-bottom:8px;font-weight:bold;">Cookie字符串:</label>
        <textarea id="combinedCookie" placeholder="例如: name=value; name2=value2; path=/; domain=.example.com" style="width:100%;height:120px;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);resize:vertical;"></textarea>
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
            <input type="text" id="cookieDomain" style="width:100%;padding:6px;border-radius:6px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
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
        <button onclick="saveCookieSettings()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;font-weight:bold;">保存设置</button>
        <button onclick="injectAndReload()" style="padding:10px 20px;background:linear-gradient(45deg,#38a169,#48bb78);border:none;border-radius:20px;color:white;cursor:pointer;font-weight:bold;">注入并刷新</button>
      </div>
    </div>
  \`;
  
  // 初始化事件
  document.getElementById('inputType').addEventListener('change', toggleInputType);
  loadCookieSettingsForCurrentSite();
}

function showCookieManagementPanel() {
  const content = document.getElementById('cookieManagerContent');
  
  content.innerHTML = \`
    <div style="text-align:left;">
      <h4 style="color:#2c5282;margin-bottom:15px;">已保存的Cookie设置</h4>
      <div id="savedCookiesList" style="max-height:400px;overflow-y:auto;border:1px solid rgba(160,174,192,0.3);border-radius:8px;padding:15px;background:rgba(255,255,255,0.2);">
        <!-- 保存的Cookie设置将在这里显示 -->
      </div>
    </div>
  \`;
  
  loadSavedCookies();
}

function showCurrentCookies() {
  const currentCookies = document.cookie;
  const content = document.getElementById('cookieManagerContent');
  
  let cookiesHTML = '<div style="text-align:left;">';
  cookiesHTML += '<h4 style="color:#2c5282;margin-bottom:15px;">当前网站Cookie</h4>';
  
  if (!currentCookies) {
    cookiesHTML += '<p style="color:#666;text-align:center;">暂无Cookie</p>';
  } else {
    const cookieArray = currentCookies.split(';');
    cookiesHTML += '<div style="max-height:400px;overflow-y:auto;">';
    cookieArray.forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      cookiesHTML += \`
        <div style="padding:10px;margin-bottom:8px;background:rgba(255,255,255,0.2);border-radius:6px;border-left:4px solid #90cdf4;">
          <strong>\${name}</strong>: \${value}
        </div>
      \`;
    });
    cookiesHTML += '</div>';
  }
  
  cookiesHTML += '</div>';
  content.innerHTML = cookiesHTML;
}

let separateCookies = [];

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
    alert('请填写Cookie名称和值');
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
      <button onclick="removeSeparateCookie(\${index})" style="background:none;border:none;color:#c53030;cursor:pointer;font-size:16px;padding:0 5px;">×</button>
    \`;
    
    list.appendChild(item);
  });
}

function removeSeparateCookie(index) {
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
    timestamp: new Date().toISOString()
  };
  
  // 保存到localStorage
  try {
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    allSettings[targetSite] = settings;
    localStorage.setItem('${cookieInjectionDataName}', JSON.stringify(allSettings));
    
    alert('Cookie设置已保存！');
  } catch(e) {
    alert('保存失败: ' + e.message);
  }
}

function injectAndReload() {
  saveCookieSettings();
  const targetSite = document.getElementById('targetSite').value;
  const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
  const settings = allSettings[targetSite];
  
  if(settings && settings.cookies) {
    injectCookies(settings.cookies);
    alert('Cookie已注入！页面将刷新以应用更改。');
    setTimeout(() => {
      location.reload();
    }, 1000);
  } else {
    alert('没有找到可注入的Cookie设置');
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

function loadCookieSettingsForCurrentSite() {
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

function loadSavedCookies() {
  try {
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    const list = document.getElementById('savedCookiesList');
    
    if(Object.keys(allSettings).length === 0) {
      list.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">暂无保存的Cookie设置</div>';
      return;
    }
    
    list.innerHTML = '';
    
    Object.entries(allSettings).forEach(([site, settings]) => {
      const item = document.createElement('div');
      item.style.padding = '15px';
      item.style.marginBottom = '10px';
      item.style.background = 'rgba(255,255,255,0.2)';
      item.style.borderRadius = '8px';
      item.style.borderLeft = '4px solid #90cdf4';
      
      const cookiesCount = settings.cookies ? settings.cookies.length : 0;
      const timestamp = new Date(settings.timestamp).toLocaleString();
      
      item.innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
          <div style="flex:1;">
            <strong style="color:#2c5282;word-break:break-all;">\${site}</strong>
            <div style="font-size:12px;color:#666;margin-top:5px;">
              包含 \${cookiesCount} 个Cookie · 保存于 \${timestamp}
            </div>
          </div>
          <div style="display:flex;gap:5px;">
            <button onclick="editCookieSettings('\${site}')" style="padding:4px 8px;background:rgba(160,174,192,0.3);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:11px;">编辑</button>
            <button onclick="deleteCookieSettings('\${site}')" style="padding:4px 8px;background:#e53e3e;border:none;border-radius:4px;color:white;cursor:pointer;font-size:11px;">删除</button>
            <button onclick="applyCookieSettings('\${site}')" style="padding:4px 8px;background:#38a169;border:none;border-radius:4px;color:white;cursor:pointer;font-size:11px;">应用</button>
          </div>
        </div>
        \${settings.cookies ? \`
          <div style="font-size:12px;max-height:100px;overflow-y:auto;">
            \${settings.cookies.map(cookie => \`
              <div style="padding:2px 0;border-bottom:1px solid rgba(160,174,192,0.1);">
                <strong>\${cookie.name}</strong>=\${cookie.value}
              </div>
            \`).join('')}
          </div>
        \` : ''}
      \`;
      
      list.appendChild(item);
    });
  } catch(e) {
    console.log('加载保存的Cookie失败:', e);
  }
}

function editCookieSettings(site) {
  const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
  const settings = allSettings[site];
  
  if(settings) {
    document.getElementById('targetSite').value = site;
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
    
    showCookieInjectionPanel();
  }
}

function deleteCookieSettings(site) {
  if(confirm('确定要删除该网站的Cookie设置吗？')) {
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    delete allSettings[site];
    localStorage.setItem('${cookieInjectionDataName}', JSON.stringify(allSettings));
    loadSavedCookies();
  }
}

function applyCookieSettings(site) {
  const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
  const settings = allSettings[site];
  
  if(settings && settings.cookies) {
    injectCookies(settings.cookies);
    alert('Cookie已应用！');
  }
}

function closeCookieModal() {
  const modal = document.getElementById('__COOKIE_MANAGER_MODAL__');
  if(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}
`;

// =======================================================================================
// 第六部分：广告拦截功能脚本 - 增强版
// 功能：实现广告拦截和元素标记，支持订阅规则
// =======================================================================================

const adBlockScript = `
// 广告拦截功能
let adBlockEnabled = false;
let adBlockRules = [];
let elementPickerActive = false;
let selectedElements = new Set();
let ruleSubscriptions = [];

// 预定义规则订阅
const defaultSubscriptions = [
  {
    name: "EasyList China",
    url: "https://easylist-downloads.adblockplus.org/easylistchina.txt",
    enabled: true
  },
  {
    name: "EasyPrivacy",
    url: "https://easylist-downloads.adblockplus.org/easyprivacy.txt", 
    enabled: true
  },
  {
    name: "Anti-Adblock",
    url: "https://easylist-downloads.adblockplus.org/antiadblockfilters.txt",
    enabled: true
  },
  {
    name: "CJX Annoyance",
    url: "https://fastly.jsdelivr.net/gh/cjx82630/cjxlist/cjx-annoyance.txt",
    enabled: true
  }
];

function showAdBlockModal() {
  if(document.getElementById('__ADBLOCK_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__ADBLOCK_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:95%;width:1200px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🚫 广告拦截设置</h3>
        
        <div style="display:flex;gap:10px;margin-bottom:20px;justify-content:center;flex-wrap:wrap;">
          <button id="toggleAdBlock" onclick="toggleAdBlock()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">启用广告拦截</button>
          <button onclick="startElementPicker()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">标记广告元素</button>
          <button onclick="loadDefaultRules()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">加载默认规则</button>
          <button onclick="showSubscriptionPanel()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">规则订阅</button>
        </div>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;text-align:left;">
          <div>
            <label style="display:block;margin-bottom:8px;font-weight:bold;">自定义规则 (每行一条):</label>
            <textarea id="customRules" placeholder="例如: ||ads.example.com^
##.ad-container
##a[href*=\\"ads\\"]" style="width:100%;height:300px;padding:12px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);resize:vertical;font-family:monospace;"></textarea>
          </div>
          
          <div>
            <label style="display:block;margin-bottom:8px;font-weight:bold;">规则统计:</label>
            <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:15px;margin-bottom:15px;">
              <div>总规则数: <span id="totalRules">0</span></div>
              <div>自定义规则: <span id="customRulesCount">0</span></div>
              <div>订阅规则: <span id="subscriptionRulesCount">0</span></div>
              <div>已拦截元素: <span id="blockedElements">0</span></div>
            </div>
            
            <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:15px;">
              <h4 style="margin-bottom:10px;color:#2c5282;">订阅管理</h4>
              <div id="subscriptionList" style="max-height:150px;overflow-y:auto;">
                <!-- 订阅列表将在这里显示 -->
              </div>
              <button onclick="updateAllSubscriptions()" style="padding:8px 16px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:12px;color:#2d3748;cursor:pointer;margin-top:10px;width:100%;">更新所有订阅</button>
            </div>
          </div>
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="saveAdBlockRules()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;font-weight:bold;">保存规则</button>
          <button onclick="closeAdBlockModal()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭</button>
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
    loadSubscriptionList();
  }, 100);
}

function showSubscriptionPanel() {
  const modal = document.getElementById('__ADBLOCK_MODAL__');
  if(modal) modal.remove();
  
  const subscriptionHTML = \`
  <div id="__SUBSCRIPTION_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:800px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">📋 规则订阅管理</h3>
        
        <div style="text-align:left;margin-bottom:20px;">
          <label style="display:block;margin-bottom:8px;font-weight:bold;">添加新订阅:</label>
          <div style="display:grid;grid-template-columns:1fr 2fr 1fr;gap:10px;margin-bottom:10px;">
            <input type="text" id="subscriptionName" placeholder="订阅名称" style="padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
            <input type="text" id="subscriptionUrl" placeholder="订阅URL" style="padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
            <button onclick="addSubscription()" style="padding:8px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:8px;color:#2d3748;cursor:pointer;">添加</button>
          </div>
        </div>
        
        <div style="text-align:left;margin-bottom:20px;">
          <label style="display:block;margin-bottom:8px;font-weight:bold;">预设订阅:</label>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:15px;">
            \${defaultSubscriptions.map(sub => \`
              <button onclick="addDefaultSubscription('\${sub.name}', '\${sub.url}')" style="padding:8px 12px;background:rgba(160,174,192,0.3);border:none;border-radius:12px;color:#2d3748;cursor:pointer;font-size:12px;">\${sub.name}</button>
            \`).join('')}
          </div>
        </div>
        
        <div style="text-align:left;">
          <label style="display:block;margin-bottom:8px;font-weight:bold;">当前订阅:</label>
          <div id="currentSubscriptions" style="max-height:300px;overflow-y:auto;border:1px solid rgba(160,174,192,0.3);border-radius:8px;padding:15px;background:rgba(255,255,255,0.2);">
            <!-- 当前订阅列表 -->
          </div>
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="closeSubscriptionModal()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">返回</button>
        </div>
      </div>
    </div>
  </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', subscriptionHTML);
  
  setTimeout(() => {
    const modal = document.getElementById('__SUBSCRIPTION_MODAL__');
    const content = modal.querySelector('div > div');
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
    
    loadCurrentSubscriptions();
  }, 100);
}

function loadCurrentSubscriptions() {
  const container = document.getElementById('currentSubscriptions');
  const subscriptions = JSON.parse(localStorage.getItem('adBlockSubscriptions') || '[]');
  
  if(subscriptions.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">暂无订阅</div>';
    return;
  }
  
  container.innerHTML = subscriptions.map((sub, index) => \`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;margin-bottom:8px;background:rgba(255,255,255,0.2);border-radius:6px;">
      <div style="flex:1;">
        <strong>\${sub.name}</strong>
        <div style="font-size:12px;color:#666;word-break:break-all;">\${sub.url}</div>
        <div style="font-size:11px;color:#999;">规则数: \${sub.ruleCount || 0} · 更新: \${sub.lastUpdate || '从未'}</div>
      </div>
      <div style="display:flex;gap:5px;">
        <input type="checkbox" \${sub.enabled ? 'checked' : ''} onchange="toggleSubscription(\${index}, this.checked)" style="margin-right:5px;">
        <button onclick="updateSubscription(\${index})" style="padding:4px 8px;background:rgba(160,174,192,0.3);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:11px;">更新</button>
        <button onclick="removeSubscription(\${index})" style="padding:4px 8px;background:#e53e3e;border:none;border-radius:4px;color:white;cursor:pointer;font-size:11px;">删除</button>
      </div>
    </div>
  \`).join('');
}

function addSubscription() {
  const name = document.getElementById('subscriptionName').value.trim();
  const url = document.getElementById('subscriptionUrl').value.trim();
  
  if(!name || !url) {
    alert('请填写订阅名称和URL');
    return;
  }
  
  const subscriptions = JSON.parse(localStorage.getItem('adBlockSubscriptions') || '[]');
  subscriptions.push({
    name,
    url,
    enabled: true,
    lastUpdate: '从未',
    ruleCount: 0
  });
  
  localStorage.setItem('adBlockSubscriptions', JSON.stringify(subscriptions));
  
  // 清空输入框
  document.getElementById('subscriptionName').value = '';
  document.getElementById('subscriptionUrl').value = '';
  
  loadCurrentSubscriptions();
  updateSubscriptionRules();
}

function addDefaultSubscription(name, url) {
  document.getElementById('subscriptionName').value = name;
  document.getElementById('subscriptionUrl').value = url;
  addSubscription();
}

function toggleSubscription(index, enabled) {
  const subscriptions = JSON.parse(localStorage.getItem('adBlockSubscriptions') || '[]');
  if(subscriptions[index]) {
    subscriptions[index].enabled = enabled;
    localStorage.setItem('adBlockSubscriptions', JSON.stringify(subscriptions));
    updateSubscriptionRules();
  }
}

async function updateSubscription(index) {
  const subscriptions = JSON.parse(localStorage.getItem('adBlockSubscriptions') || '[]');
  const subscription = subscriptions[index];
  
  if(!subscription) return;
  
  try {
    const response = await fetch(subscription.url);
    const rulesText = await response.text();
    const rules = rulesText.split('\\n').filter(line => 
      line.trim() && !line.startsWith('!') && !line.startsWith('#')
    );
    
    subscription.ruleCount = rules.length;
    subscription.lastUpdate = new Date().toLocaleString();
    subscription.rules = rules;
    
    localStorage.setItem('adBlockSubscriptions', JSON.stringify(subscriptions));
    loadCurrentSubscriptions();
    updateSubscriptionRules();
    
    alert(\`成功更新订阅 "\${subscription.name}"，获取 \${rules.length} 条规则\`);
  } catch(e) {
    alert(\`更新订阅失败: \${e.message}\`);
  }
}

async function updateAllSubscriptions() {
  const subscriptions = JSON.parse(localStorage.getItem('adBlockSubscriptions') || '[]');
  const enabledSubscriptions = subscriptions.filter(sub => sub.enabled);
  
  if(enabledSubscriptions.length === 0) {
    alert('没有启用的订阅');
    return;
  }
  
  let updatedCount = 0;
  let totalRules = 0;
  
  for(const subscription of enabledSubscriptions) {
    try {
      const response = await fetch(subscription.url);
      const rulesText = await response.text();
      const rules = rulesText.split('\\n').filter(line => 
        line.trim() && !line.startsWith('!') && !line.startsWith('#')
      );
      
      subscription.ruleCount = rules.length;
      subscription.lastUpdate = new Date().toLocaleString();
      subscription.rules = rules;
      updatedCount++;
      totalRules += rules.length;
    } catch(e) {
      console.log(\`更新订阅 "\${subscription.name}" 失败:\`, e);
    }
  }
  
  localStorage.setItem('adBlockSubscriptions', JSON.stringify(subscriptions));
  loadCurrentSubscriptions();
  updateSubscriptionRules();
  updateRuleStats();
  
  alert(\`成功更新 \${updatedCount} 个订阅，共 \${totalRules} 条规则\`);
}

function removeSubscription(index) {
  if(confirm('确定要删除这个订阅吗？')) {
    const subscriptions = JSON.parse(localStorage.getItem('adBlockSubscriptions') || '[]');
    subscriptions.splice(index, 1);
    localStorage.setItem('adBlockSubscriptions', JSON.stringify(subscriptions));
    loadCurrentSubscriptions();
    updateSubscriptionRules();
  }
}

function updateSubscriptionRules() {
  const subscriptions = JSON.parse(localStorage.getItem('adBlockSubscriptions') || '[]');
  const enabledSubscriptions = subscriptions.filter(sub => sub.enabled);
  
  let subscriptionRules = [];
  enabledSubscriptions.forEach(sub => {
    if(sub.rules) {
      subscriptionRules = subscriptionRules.concat(sub.rules);
    }
  });
  
  // 合并到总规则中
  const customRules = document.getElementById('customRules') ? 
    document.getElementById('customRules').value.split('\\n').filter(rule => rule.trim()) : [];
  
  adBlockRules = [...new Set([...customRules, ...subscriptionRules])];
  updateRuleStats();
}

function loadSubscriptionList() {
  const container = document.getElementById('subscriptionList');
  const subscriptions = JSON.parse(localStorage.getItem('adBlockSubscriptions') || '[]');
  const enabledSubscriptions = subscriptions.filter(sub => sub.enabled);
  
  if(enabledSubscriptions.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#666;padding:10px;">暂无启用的订阅</div>';
    return;
  }
  
  container.innerHTML = enabledSubscriptions.map(sub => \`
    <div style="padding:5px;border-bottom:1px solid rgba(160,174,192,0.1);font-size:12px;">
      <strong>\${sub.name}</strong> (\${sub.ruleCount || 0} 条规则)
    </div>
  \`).join('');
}

function updateRuleStats() {
  const customRules = document.getElementById('customRules') ? 
    document.getElementById('customRules').value.split('\\n').filter(rule => rule.trim()).length : 0;
  
  const subscriptions = JSON.parse(localStorage.getItem('adBlockSubscriptions') || '[]');
  const subscriptionRulesCount = subscriptions
    .filter(sub => sub.enabled)
    .reduce((total, sub) => total + (sub.ruleCount || 0), 0);
  
  const totalRules = customRules + subscriptionRulesCount;
  
  if(document.getElementById('totalRules')) {
    document.getElementById('totalRules').textContent = totalRules;
    document.getElementById('customRulesCount').textContent = customRules;
    document.getElementById('subscriptionRulesCount').textContent = subscriptionRulesCount;
  }
}

function toggleAdBlock() {
  adBlockEnabled = !adBlockEnabled;
  const button = document.getElementById('toggleAdBlock');
  if(adBlockEnabled) {
    button.textContent = '禁用广告拦截';
    button.style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
    applyAdBlockRules();
  } else {
    button.textContent = '启用广告拦截';
    button.style.background = 'rgba(160,174,192,0.3)';
    removeAdBlockRules();
  }
  saveAdBlockSettings();
}

function startElementPicker() {
  elementPickerActive = true;
  closeAdBlockModal();
  selectedElements.clear();
  
  // 添加元素选择模式样式
  const style = document.createElement('style');
  style.id = '__ELEMENT_PICKER_STYLE__';
  style.textContent = \`
    * { cursor: crosshair !important; }
    .__proxy_toolbar__, .__proxy_toolbar__ * { cursor: default !important; }
    .__adblock_hover__ { outline: 2px solid #c53030 !important; background: rgba(197, 48, 48, 0.1) !important; }
    .__adblock_selected__ { outline: 3px solid #c53030 !important; background: rgba(197, 48, 48, 0.2) !important; }
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
  panel.style.padding = '15px';
  panel.style.borderRadius = '10px';
  panel.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
  panel.style.zIndex = '1000001';
  panel.style.display = 'flex';
  panel.style.gap = '10px';
  panel.style.alignItems = 'center';
  panel.style.flexWrap = 'wrap';
  panel.style.maxWidth = '90%';
  
  panel.innerHTML = \`
    <span style="color:#2d3748;font-weight:bold;">选择要拦截的元素 (已选择: <span id="selectedCount">0</span>)</span>
    <button onclick="confirmBlockElements()" style="padding:8px 16px;background:#c53030;border:none;border-radius:15px;color:white;cursor:pointer;">确认拦截</button>
    <button onclick="cancelElementPicker()" style="padding:8px 16px;background:rgba(160,174,192,0.3);border:none;border-radius:15px;color:#2d3748;cursor:pointer;">取消</button>
    <button onclick="clearSelections()" style="padding:8px 16px;background:rgba(160,174,192,0.3);border:none;border-radius:15px;color:#2d3748;cursor:pointer;">清空选择</button>
  \`;
  
  document.body.appendChild(panel);
  
  // 添加鼠标移动事件监听
  document.addEventListener('mouseover', handleElementHover, true);
  document.addEventListener('click', handleElementClick, true);
}

function handleElementHover(e) {
  if(!elementPickerActive) return;
  
  // 跳过工具栏元素
  if(e.target.closest('.__proxy_toolbar__')) {
    const previous = document.querySelector('.__adblock_hover__');
    if(previous) previous.classList.remove('__adblock_hover__');
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
  if(e.target.closest('.__proxy_toolbar__')) return;
  
  e.stopPropagation();
  e.preventDefault();
  
  const element = e.target;
  
  if(selectedElements.has(element)) {
    // 取消选择
    selectedElements.delete(element);
    element.classList.remove('__adblock_selected__');
    element.classList.add('__adblock_hover__');
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

function clearSelections() {
  selectedElements.forEach(element => {
    element.classList.remove('__adblock_selected__', '__adblock_hover__');
  });
  selectedElements.clear();
  updateSelectedCount();
}

function confirmBlockElements() {
  if(selectedElements.size === 0) {
    alert('请先选择要拦截的元素');
    return;
  }
  
  const newRules = [];
  selectedElements.forEach(element => {
    let selector = generateCSSSelector(element);
    if(selector && !selector.includes('__proxy_')) {
      newRules.push(\`##\${selector}\`);
    }
  });
  
  if(newRules.length > 0) {
    const textarea = document.getElementById('customRules');
    const currentRules = textarea ? textarea.value.split('\\n').filter(rule => rule.trim()) : [];
    const allRules = [...new Set([...currentRules, ...newRules])];
    
    if(textarea) {
      textarea.value = allRules.join('\\n');
    }
    
    // 保存并应用
    saveAdBlockRules();
    alert(\`已添加 \${newRules.length} 条规则\`);
  }
  
  cancelElementPicker();
}

function cancelElementPicker() {
  elementPickerActive = false;
  selectedElements.clear();
  
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
}

function generateCSSSelector(element) {
  // 跳过工具栏元素
  if(element.closest('.__proxy_toolbar__')) return null;
  
  if(element.id) {
    return '#' + element.id;
  }
  
  let selector = element.tagName.toLowerCase();
  if(element.className && typeof element.className === 'string') {
    const classes = element.className.split(' ').filter(cls => 
      cls && !cls.includes('__proxy_') && !cls.includes('__adblock_')
    );
    if(classes.length > 0) {
      selector += '.' + classes.join('.');
    }
  }
  
  // 如果选择器太通用，添加父级信息
  if(selector === element.tagName.toLowerCase()) {
    const parent = element.parentElement;
    if(parent) {
      const parentSelector = generateCSSSelector(parent);
      if(parentSelector) {
        selector = parentSelector + ' > ' + selector;
      }
    }
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
\`.trim();
  
  if(document.getElementById('customRules')) {
    document.getElementById('customRules').value = defaultRules;
    updateRuleStats();
  }
}

function saveAdBlockRules() {
  const customRules = document.getElementById('customRules').value;
  const rules = customRules.split('\\n').filter(rule => rule.trim());
  
  adBlockRules = rules;
  
  const settings = {
    enabled: adBlockEnabled,
    rules: adBlockRules,
    subscriptions: JSON.parse(localStorage.getItem('adBlockSubscriptions') || '[]')
  };
  
  try {
    localStorage.setItem('${adBlockDataName}', JSON.stringify(settings));
    
    if(adBlockEnabled) {
      applyAdBlockRules();
    }
    
    updateSubscriptionRules();
    alert('广告规则已保存！');
  } catch(e) {
    alert('保存失败: ' + e.message);
  }
}

function loadAdBlockSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem('${adBlockDataName}') || '{}');
    adBlockEnabled = settings.enabled || false;
    adBlockRules = settings.rules || [];
    
    // 加载订阅
    if(settings.subscriptions) {
      localStorage.setItem('adBlockSubscriptions', JSON.stringify(settings.subscriptions));
    }
    
    const button = document.getElementById('toggleAdBlock');
    if(adBlockEnabled) {
      button.textContent = '禁用广告拦截';
      button.style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
      applyAdBlockRules();
    }
    
    if(document.getElementById('customRules')) {
      document.getElementById('customRules').value = adBlockRules.join('\\n');
    }
  } catch(e) {
    console.log('加载广告拦截设置失败:', e);
  }
}

function applyAdBlockRules() {
  console.log('应用广告拦截规则:', adBlockRules);
  // 实际广告拦截逻辑需要更复杂的实现
  // 这里可以添加元素隐藏、请求拦截等逻辑
}

function removeAdBlockRules() {
  console.log('移除广告拦截规则');
  // 移除广告拦截逻辑
}

function closeAdBlockModal() {
  const modal = document.getElementById('__ADBLOCK_MODAL__');
  if(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

function closeSubscriptionModal() {
  const modal = document.getElementById('__SUBSCRIPTION_MODAL__');
  if(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
      showAdBlockModal();
    }, 300);
  }
}

// 初始化广告拦截
setTimeout(loadAdBlockSettings, 2000);
`;

// =======================================================================================
// 第七部分：资源嗅探功能脚本 - 增强版
// 功能：拦截和显示网络请求，支持请求修改和重发
// =======================================================================================

const resourceSnifferScript = `
// 资源嗅探功能
let snifferEnabled = false;
let capturedRequests = [];
let requestInterceptor = null;
let responseInterceptor = null;
let autoStartSniffer = false;

function showSnifferModal() {
  if(document.getElementById('__SNIFFER_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__SNIFFER_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:95%;width:1200px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🔍 资源嗅探器</h3>
        
        <div style="display:flex;gap:10px;margin-bottom:20px;justify-content:center;flex-wrap:wrap;">
          <button id="toggleSniffer" onclick="toggleSniffer()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">启动嗅探</button>
          <button onclick="clearSnifferData()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">清空记录</button>
          <button onclick="exportSnifferData()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">导出数据</button>
          <button onclick="showSnifferSettings()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">设置</button>
        </div>
        
        <div style="display:flex;gap:10px;margin-bottom:15px;justify-content:center;">
          <input type="text" id="snifferFilter" placeholder="过滤请求..." style="padding:8px 12px;border-radius:20px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);width:300px;">
          <select id="snifferTypeFilter" style="padding:8px 12px;border-radius:20px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
            <option value="">所有类型</option>
            <option value="JavaScript">JavaScript</option>
            <option value="CSS">CSS</option>
            <option value="Image">图片</option>
            <option value="HTML">HTML</option>
            <option value="JSON">JSON</option>
            <option value="Other">其他</option>
          </select>
        </div>
        
        <div style="text-align:left;margin-bottom:20px;">
          <div style="background:rgba(255,255,255,0.5);border-radius:8px;padding:15px;max-height:400px;overflow-y:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
              <thead>
                <tr style="background:rgba(160,174,192,0.2);">
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);width:60px;">方法</th>
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);">URL</th>
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);width:80px;">类型</th>
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);width:70px;">状态</th>
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);width:80px;">大小</th>
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);width:180px;">操作</th>
                </tr>
              </thead>
              <tbody id="snifferTableBody">
                <tr><td colspan="6" style="padding:20px;text-align:center;color:#666;">暂无数据</td></tr>
              </tbody>
            </table>
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
    
    updateSnifferTable();
    setupSnifferFilters();
    
    // 如果设置了自动启动，则启动嗅探
    if(autoStartSniffer && !snifferEnabled) {
      toggleSniffer();
    }
  }, 100);
}

function showSnifferSettings() {
  const modal = document.getElementById('__SNIFFER_MODAL__');
  if(modal) modal.remove();
  
  const settingsHTML = \`
  <div id="__SNIFFER_SETTINGS_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">⚙️ 嗅探器设置</h3>
        
        <div style="text-align:left;margin-bottom:20px;">
          <label style="display:flex;align-items:center;margin-bottom:15px;cursor:pointer;">
            <input type="checkbox" id="autoStartSniffer" \${autoStartSniffer ? 'checked' : ''} style="margin-right:10px;">
            <span>自动启动嗅探器</span>
          </label>
          
          <label style="display:flex;align-items:center;margin-bottom:15px;cursor:pointer;">
            <input type="checkbox" id="interceptRequests" style="margin-right:10px;">
            <span>拦截请求 (实验性)</span>
          </label>
          
          <label style="display:flex;align-items:center;margin-bottom:15px;cursor:pointer;">
            <input type="checkbox" id="interceptResponses" style="margin-right:10px;">
            <span>拦截响应 (实验性)</span>
          </label>
          
          <div style="margin-bottom:15px;">
            <label style="display:block;margin-bottom:8px;font-weight:bold;">最大记录数:</label>
            <input type="number" id="maxRecords" value="1000" min="100" max="10000" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
          </div>
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="saveSnifferSettings()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;font-weight:bold;">保存设置</button>
          <button onclick="closeSnifferSettings()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">返回</button>
        </div>
      </div>
    </div>
  </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', settingsHTML);
  
  setTimeout(() => {
    const modal = document.getElementById('__SNIFFER_SETTINGS_MODAL__');
    const content = modal.querySelector('div > div');
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
    
    loadSnifferSettingsToForm();
  }, 100);
}

function setupSnifferFilters() {
  const filterInput = document.getElementById('snifferFilter');
  const typeFilter = document.getElementById('snifferTypeFilter');
  
  if(filterInput) {
    filterInput.addEventListener('input', updateSnifferTable);
  }
  
  if(typeFilter) {
    typeFilter.addEventListener('change', updateSnifferTable);
  }
}

function toggleSniffer() {
  snifferEnabled = !snifferEnabled;
  const button = document.getElementById('toggleSniffer');
  
  if(snifferEnabled) {
    button.textContent = '停止嗅探';
    button.style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
    startSniffer();
  } else {
    button.textContent = '启动嗅探';
    button.style.background = 'rgba(160,174,192,0.3)';
    stopSniffer();
  }
  
  saveSnifferSettings();
}

function startSniffer() {
  // 保存原始方法
  if(!window.originalFetch) {
    window.originalFetch = window.fetch;
  }
  if(!window.originalXHROpen) {
    window.originalXHROpen = XMLHttpRequest.prototype.open;
  }
  if(!window.originalXHRSend) {
    window.originalXHRSend = XMLHttpRequest.prototype.send;
  }

  // 拦截fetch请求
  window.fetch = function(...args) {
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
      duration: null
    };
    
    capturedRequests.unshift(requestInfo);
    
    // 限制记录数量
    if(capturedRequests.length > 1000) {
      capturedRequests = capturedRequests.slice(0, 1000);
    }
    
    updateSnifferTable();
    
    return window.originalFetch.apply(this, args).then(response => {
      requestInfo.status = response.status;
      requestInfo.size = formatBytes(response.headers.get('content-length') || 0);
      requestInfo.endTime = Date.now();
      requestInfo.duration = requestInfo.endTime - requestInfo.startTime;
      requestInfo.responseHeaders = Object.fromEntries(response.headers.entries());
      
      // 克隆响应以便读取内容
      response.clone().text().then(text => {
        requestInfo.responseBody = text;
      }).catch(() => {
        requestInfo.responseBody = '[二进制内容]';
      });
      
      updateSnifferTable();
      return response;
    }).catch(error => {
      requestInfo.status = 'error';
      requestInfo.size = '0 B';
      requestInfo.endTime = Date.now();
      requestInfo.duration = requestInfo.endTime - requestInfo.startTime;
      requestInfo.error = error.message;
      updateSnifferTable();
      throw error;
    });
  };
  
  // 拦截XMLHttpRequest
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    this._snifferInfo = {
      id: Date.now() + Math.random(),
      method: method,
      url: url,
      type: getResourceType(url),
      timestamp: new Date().toLocaleTimeString(),
      status: 'pending',
      size: '0 B',
      startTime: Date.now(),
      endTime: null,
      duration: null
    };
    
    capturedRequests.unshift(this._snifferInfo);
    updateSnifferTable();
    
    return window.originalXHROpen.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.send = function(data) {
    if(this._snifferInfo) {
      this._snifferInfo.requestBody = data;
    }
    
    this.addEventListener('load', function() {
      if(this._snifferInfo) {
        this._snifferInfo.status = this.status;
        this._snifferInfo.size = formatBytes(this.response ? new Blob([this.response]).size : 0);
        this._snifferInfo.endTime = Date.now();
        this._snifferInfo.duration = this._snifferInfo.endTime - this._snifferInfo.startTime;
        this._snifferInfo.responseHeaders = this.getAllResponseHeaders();
        
        try {
          this._snifferInfo.responseBody = this.responseText;
        } catch(e) {
          this._snifferInfo.responseBody = '[无法读取响应内容]';
        }
        
        updateSnifferTable();
      }
    });
    
    this.addEventListener('error', function() {
      if(this._snifferInfo) {
        this._snifferInfo.status = 'error';
        this._snifferInfo.endTime = Date.now();
        this._snifferInfo.duration = this._snifferInfo.endTime - this._snifferInfo.startTime;
        updateSnifferTable();
      }
    });
    
    return window.originalXHRSend.apply(this, arguments);
  };
}

function stopSniffer() {
  // 恢复原始方法
  if(window.originalFetch) {
    window.fetch = window.originalFetch;
  }
  if(window.originalXHROpen) {
    XMLHttpRequest.prototype.open = window.originalXHROpen;
  }
  if(window.originalXHRSend) {
    XMLHttpRequest.prototype.send = window.originalXHRSend;
  }
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
    'ico': 'Image',
    'html': 'HTML',
    'htm': 'HTML',
    'json': 'JSON',
    'xml': 'XML',
    'woff': 'Font',
    'woff2': 'Font',
    'ttf': 'Font',
    'eot': 'Font'
  };
  return types[ext] || 'Other';
}

function formatBytes(bytes) {
  if(typeof bytes !== 'number' || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateSnifferTable() {
  const tbody = document.getElementById('snifferTableBody');
  if(!tbody) return;
  
  const filterText = document.getElementById('snifferFilter') ? document.getElementById('snifferFilter').value.toLowerCase() : '';
  const typeFilter = document.getElementById('snifferTypeFilter') ? document.getElementById('snifferTypeFilter').value : '';
  
  const filteredRequests = capturedRequests.filter(req => {
    const matchesText = req.url.toLowerCase().includes(filterText) || 
                       req.method.toLowerCase().includes(filterText);
    const matchesType = !typeFilter || req.type === typeFilter;
    return matchesText && matchesType;
  });
  
  if(filteredRequests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="padding:20px;text-align:center;color:#666;">暂无数据</td></tr>';
    return;
  }
  
  tbody.innerHTML = filteredRequests.map(req => \`
    <tr style="border-bottom:1px solid rgba(160,174,192,0.1);">
      <td style="padding:8px;"><code>\${req.method}</code></td>
      <td style="padding:8px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="\${req.url}">\${req.url}</td>
      <td style="padding:8px;">\${req.type}</td>
      <td style="padding:8px;">
        <span style="padding:2px 6px;border-radius:4px;background:\${getStatusColor(req.status)};color:white;font-size:10px;">
          \${req.status}
        </span>
      </td>
      <td style="padding:8px;">\${req.size}</td>
      <td style="padding:8px;">
        <button onclick="inspectRequest('\${req.id}')" style="padding:4px 8px;background:rgba(160,174,192,0.3);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;margin-right:5px;">详情</button>
        <button onclick="interceptRequest('\${req.id}')" style="padding:4px 8px;background:#d69e2e;border:none;border-radius:4px;color:white;cursor:pointer;font-size:10px;margin-right:5px;">拦截</button>
        <button onclick="replayRequest('\${req.id}')" style="padding:4px 8px;background:#38a169;border:none;border-radius:4px;color:white;cursor:pointer;font-size:10px;">重放</button>
      </td>
    </tr>
  \`).join('');
}

function getStatusColor(status) {
  if(status === 200 || status === 'pending') return '#38a169';
  if(status >= 400 || status === 'error') return '#e53e3e';
  return '#d69e2e';
}

function inspectRequest(id) {
  const request = capturedRequests.find(req => req.id === id);
  if(request) {
    showRequestDetail(request);
  }
}

function showRequestDetail(request) {
  const detailHTML = \`
  <div id="__REQUEST_DETAIL_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000001;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:95%;width:1200px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">请求详情</h3>
        
        <div style="text-align:left;margin-bottom:20px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
            <div>
              <h4 style="color:#2c5282;margin-bottom:10px;">基本信息</h4>
              <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:15px;">
                <div><strong>URL:</strong> <span style="word-break:break-all;">\${request.url}</span></div>
                <div><strong>方法:</strong> \${request.method}</div>
                <div><strong>类型:</strong> \${request.type}</div>
                <div><strong>状态:</strong> \${request.status}</div>
                <div><strong>大小:</strong> \${request.size}</div>
                <div><strong>耗时:</strong> \${request.duration ? request.duration + 'ms' : 'N/A'}</div>
                <div><strong>时间:</strong> \${request.timestamp}</div>
              </div>
            </div>
            
            <div>
              <h4 style="color:#2c5282;margin-bottom:10px;">请求头</h4>
              <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:15px;max-height:200px;overflow-y:auto;font-family:monospace;font-size:12px;">
                \${Object.entries(request.headers || {}).map(([key, value]) => \`
                  <div><strong>\${key}:</strong> \${value}</div>
                \`).join('')}
              </div>
            </div>
          </div>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div>
              <h4 style="color:#2c5282;margin-bottom:10px;">请求体</h4>
              <textarea style="width:100%;height:150px;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);resize:vertical;font-family:monospace;font-size:12px;" readonly>\${request.requestBody || '无'}</textarea>
            </div>
            
            <div>
              <h4 style="color:#2c5282;margin-bottom:10px;">响应体</h4>
              <textarea style="width:100%;height:150px;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);resize:vertical;font-family:monospace;font-size:12px;" readonly>\${request.responseBody || '无'}</textarea>
            </div>
          </div>
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="closeRequestDetail()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭</button>
        </div>
      </div>
    </div>
  </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', detailHTML);
  
  setTimeout(() => {
    const modal = document.getElementById('__REQUEST_DETAIL_MODAL__');
    const content = modal.querySelector('div > div');
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
  }, 100);
}

function closeRequestDetail() {
  const modal = document.getElementById('__REQUEST_DETAIL_MODAL__');
  if(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

function interceptRequest(id) {
  const request = capturedRequests.find(req => req.id === id);
  if(request) {
    alert('请求拦截功能开发中...\\nURL: ' + request.url);
    // 这里可以实现请求拦截逻辑
  }
}

function replayRequest(id) {
  const request = capturedRequests.find(req => req.id === id);
  if(request) {
    // 重新发送请求
    fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.requestBody
    }).then(response => {
      alert('请求重放完成，状态: ' + response.status);
    }).catch(error => {
      alert('请求重放失败: ' + error.message);
    });
  }
}

function clearSnifferData() {
  capturedRequests = [];
  updateSnifferTable();
}

function exportSnifferData() {
  const data = {
    timestamp: new Date().toISOString(),
    requests: capturedRequests.map(req => ({
      ...req,
      // 移除可能包含循环引用的属性
      requestBody: typeof req.requestBody === 'string' ? req.requestBody : '[二进制数据]',
      responseBody: typeof req.responseBody === 'string' ? req.responseBody : '[二进制数据]'
    }))
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sniffer_data_' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function loadSnifferSettingsToForm() {
  const settings = JSON.parse(localStorage.getItem('${resourceSnifferDataName}') || '{}');
  
  if(document.getElementById('autoStartSniffer')) {
    document.getElementById('autoStartSniffer').checked = settings.autoStart || false;
  }
  if(document.getElementById('maxRecords')) {
    document.getElementById('maxRecords').value = settings.maxRecords || 1000;
  }
}

function saveSnifferSettings() {
  const settings = {
    enabled: snifferEnabled,
    autoStart: document.getElementById('autoStartSniffer').checked,
    maxRecords: parseInt(document.getElementById('maxRecords').value) || 1000
  };
  
  try {
    localStorage.setItem('${resourceSnifferDataName}', JSON.stringify(settings));
    autoStartSniffer = settings.autoStart;
    alert('设置已保存！');
  } catch(e) {
    alert('保存失败: ' + e.message);
  }
}

function closeSnifferSettings() {
  const modal = document.getElementById('__SNIFFER_SETTINGS_MODAL__');
  if(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
      showSnifferModal();
    }, 300);
  }
}

function loadSnifferSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem('${resourceSnifferDataName}') || '{}');
    snifferEnabled = settings.enabled || false;
    autoStartSniffer = settings.autoStart || false;
    
    if(snifferEnabled) {
      startSniffer();
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

// 初始化资源嗅探
setTimeout(loadSnifferSettings, 2000);
`;

// =======================================================================================
// 第八部分：请求修改功能脚本 - 增强版
// 功能：修改请求头和浏览器标识，支持实际生效
// =======================================================================================

const requestModScript = `
// 请求修改功能
let requestModEnabled = false;
let customHeaders = [];
let userAgents = {
  'chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'firefox': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'safari': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
  'edge': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'iphone': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
  'android': 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
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

// 保存原始方法
let originalFetch = window.fetch;
let originalXHROpen = XMLHttpRequest.prototype.open;
let originalXHRSend = XMLHttpRequest.prototype.send;

function showRequestModModal() {
  if(document.getElementById('__REQUEST_MOD_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__REQUEST_MOD_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:900px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🔧 请求修改设置</h3>
        
        <div style="display:flex;gap:15px;margin-bottom:20px;justify-content:center;">
          <button id="toggleRequestMod" onclick="toggleRequestMod()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">启用修改</button>
        </div>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;text-align:left;">
          <div>
            <label style="display:block;margin-bottom:8px;font-weight:bold;">用户代理 (User Agent):</label>
            <select id="userAgent" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
              <option value="">保持原样</option>
              \${Object.entries(userAgents).map(([key, value]) => \`
                <option value="\${value}">\${key.charAt(0).toUpperCase() + key.slice(1)}</option>
              \`).join('')}
            </select>
            <textarea id="customUserAgent" placeholder="或输入自定义User Agent" style="width:100%;height:60px;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);resize:vertical;margin-top:8px;display:none;"></textarea>
            <button onclick="toggleCustomUA()" style="padding:4px 8px;background:rgba(160,174,192,0.3);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;margin-top:5px;">自定义UA</button>
          </div>
          
          <div>
            <label style="display:block;margin-bottom:8px;font-weight:bold;">接受语言 (Accept-Language):</label>
            <select id="acceptLanguage" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
              <option value="">保持原样</option>
              \${Object.entries(languages).map(([code, name]) => \`
                <option value="\${code}">\${name}</option>
              \`).join('')}
            </select>
            <input type="text" id="customLanguage" placeholder="或输入自定义语言" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);margin-top:8px;display:none;">
            <button onclick="toggleCustomLang()" style="padding:4px 8px;background:rgba(160,174,192,0.3);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;margin-top:5px;">自定义语言</button>
          </div>
        </div>
        
        <div style="text-align:left;margin-bottom:20px;">
          <label style="display:block;margin-bottom:8px;font-weight:bold;">自定义请求头:</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
            <input type="text" id="headerName" placeholder="Header名称" style="padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
            <input type="text" id="headerValue" placeholder="Header值" style="padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
          </div>
          <button onclick="addCustomHeader()" style="padding:8px 16px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:12px;color:#2d3748;cursor:pointer;">添加Header</button>
          <div id="headerList" style="margin-top:10px;max-height:150px;overflow-y:auto;border:1px solid rgba(160,174,192,0.3);border-radius:8px;padding:10px;background:rgba(255,255,255,0.2);"></div>
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="saveRequestModSettings()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;font-weight:bold;">保存设置</button>
          <button onclick="applyRequestModifications()" style="padding:10px 20px;background:linear-gradient(45deg,#38a169,#48bb78);border:none;border-radius:20px;color:white;cursor:pointer;font-weight:bold;">立即应用</button>
          <button onclick="closeRequestModModal()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭</button>
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
    enableRequestModifications();
  } else {
    button.textContent = '启用修改';
    button.style.background = 'rgba(160,174,192,0.3)';
    disableRequestModifications();
  }
}

function enableRequestModifications() {
  // 拦截fetch请求
  window.fetch = function(input, init) {
    const config = init || {};
    
    // 应用自定义headers
    if(customHeaders.length > 0) {
      config.headers = config.headers || {};
      customHeaders.forEach(header => {
        config.headers[header.name] = header.value;
      });
    }
    
    // 应用User-Agent
    const userAgent = getCurrentUserAgent();
    if(userAgent) {
      config.headers = config.headers || {};
      config.headers['User-Agent'] = userAgent;
    }
    
    // 应用Accept-Language
    const acceptLanguage = getCurrentAcceptLanguage();
    if(acceptLanguage) {
      config.headers = config.headers || {};
      config.headers['Accept-Language'] = acceptLanguage;
    }
    
    return originalFetch(input, config);
  };
  
  // 拦截XMLHttpRequest
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    this._requestMod = {
      method,
      url,
      headers: {}
    };
    
    // 应用自定义headers
    customHeaders.forEach(header => {
      this._requestMod.headers[header.name] = header.value;
    });
    
    // 应用User-Agent
    const userAgent = getCurrentUserAgent();
    if(userAgent) {
      this._requestMod.headers['User-Agent'] = userAgent;
    }
    
    // 应用Accept-Language
    const acceptLanguage = getCurrentAcceptLanguage();
    if(acceptLanguage) {
      this._requestMod.headers['Accept-Language'] = acceptLanguage;
    }
    
    return originalXHROpen.call(this, method, url, async, user, password);
  };
  
  XMLHttpRequest.prototype.send = function(data) {
    // 在发送前设置headers
    if(this._requestMod && this._requestMod.headers) {
      Object.entries(this._requestMod.headers).forEach(([key, value]) => {
        this.setRequestHeader(key, value);
      });
    }
    
    return originalXHRSend.call(this, data);
  };
}

function disableRequestModifications() {
  // 恢复原始方法
  window.fetch = originalFetch;
  XMLHttpRequest.prototype.open = originalXHROpen;
  XMLHttpRequest.prototype.send = originalXHRSend;
}

function getCurrentUserAgent() {
  const userAgentSelect = document.getElementById('userAgent');
  const customUserAgent = document.getElementById('customUserAgent');
  
  if(customUserAgent.style.display !== 'none' && customUserAgent.value) {
    return customUserAgent.value;
  } else if(userAgentSelect.value) {
    return userAgentSelect.value;
  }
  return null;
}

function getCurrentAcceptLanguage() {
  const acceptLanguageSelect = document.getElementById('acceptLanguage');
  const customLanguage = document.getElementById('customLanguage');
  
  if(customLanguage.style.display !== 'none' && customLanguage.value) {
    return customLanguage.value;
  } else if(acceptLanguageSelect.value) {
    return acceptLanguageSelect.value;
  }
  return null;
}

function toggleCustomUA() {
  const customUA = document.getElementById('customUserAgent');
  const selectUA = document.getElementById('userAgent');
  
  if(customUA.style.display === 'none') {
    customUA.style.display = 'block';
    selectUA.style.display = 'none';
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
  } else {
    customLang.style.display = 'none';
    selectLang.style.display = 'block';
  }
}

function addCustomHeader() {
  const name = document.getElementById('headerName').value.trim();
  const value = document.getElementById('headerValue').value.trim();
  
  if(!name || !value) {
    alert('请填写Header名称和值');
    return;
  }
  
  customHeaders.push({ name, value });
  updateHeaderList();
  
  // 清空输入框
  document.getElementById('headerName').value = '';
  document.getElementById('headerValue').value = '';
}

function updateHeaderList() {
  const list = document.getElementById('headerList');
  list.innerHTML = '';
  
  if(customHeaders.length === 0) {
    list.innerHTML = '<div style="text-align:center;color:#666;padding:10px;">暂无自定义Header</div>';
    return;
  }
  
  customHeaders.forEach((header, index) => {
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
        <strong>\${header.name}</strong>: \${header.value}
      </div>
      <button onclick="removeCustomHeader(\${index})" style="background:none;border:none;color:#c53030;cursor:pointer;font-size:16px;padding:0 5px;">×</button>
    \`;
    
    list.appendChild(item);
  });
}

function removeCustomHeader(index) {
  customHeaders.splice(index, 1);
  updateHeaderList();
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
    customHeaders: customHeaders
  };
  
  try {
    localStorage.setItem('${requestModDataName}', JSON.stringify(settings));
    alert('请求修改设置已保存！');
  } catch(e) {
    alert('保存失败: ' + e.message);
  }
}

function applyRequestModifications() {
  saveRequestModSettings();
  
  if(requestModEnabled) {
    enableRequestModifications();
    alert('请求修改已立即应用！');
  } else {
    alert('请先启用请求修改功能');
  }
}

function loadRequestModSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem('${requestModDataName}') || '{}');
    requestModEnabled = settings.enabled || false;
    customHeaders = settings.customHeaders || [];
    
    const button = document.getElementById('toggleRequestMod');
    if(requestModEnabled) {
      button.textContent = '禁用修改';
      button.style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
      enableRequestModifications();
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
setTimeout(loadRequestModSettings, 2000);
`;

// =======================================================================================
// 第九部分：无图模式功能脚本 - 增强版
// 功能：控制图片和视频加载
// =======================================================================================

const imageBlockScript = `
// 无图模式功能
let imageBlockEnabled = false;
let videoBlockEnabled = false;

function toggleImageBlock() {
  imageBlockEnabled = !imageBlockEnabled;
  videoBlockEnabled = imageBlockEnabled; // 同时控制视频
  
  if(imageBlockEnabled) {
    blockMediaContent();
  } else {
    unblockMediaContent();
  }
  
  saveImageBlockSettings();
  updateImageBlockButton();
  
  // 刷新页面以立即生效
  if(confirm('无图模式已' + (imageBlockEnabled ? '开启' : '关闭') + '，是否立即刷新页面？')) {
    location.reload();
  }
}

function blockMediaContent() {
  // 阻止图片加载
  const images = document.querySelectorAll('img, picture, source[type^="image"], [style*="background-image"]');
  images.forEach(img => {
    img.style.filter = 'blur(5px) grayscale(100%)';
    img.style.opacity = '0.3';
    img.setAttribute('data-original-src', img.src || '');
    img.setAttribute('data-original-style', img.style.cssText || '');
    
    if(img.tagName === 'IMG') {
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
    }
    
    if(img.style.backgroundImage) {
      img.setAttribute('data-original-bg', img.style.backgroundImage);
      img.style.backgroundImage = 'none';
    }
  });
  
  // 阻止视频加载
  if(videoBlockEnabled) {
    const videos = document.querySelectorAll('video, audio, iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="dailymotion"]');
    videos.forEach(video => {
      video.style.filter = 'blur(5px) grayscale(100%)';
      video.style.opacity = '0.3';
      video.setAttribute('data-original-src', video.src || '');
      video.setAttribute('data-original-poster', video.poster || '');
      video.setAttribute('data-original-style', video.style.cssText || '');
      
      if(video.tagName === 'VIDEO' || video.tagName === 'AUDIO') {
        video.poster = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
        video.src = '';
      }
      
      // 暂停播放
      if(!video.paused) {
        video.pause();
      }
    });
  }
  
  // 阻止新的媒体内容加载
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if(node.nodeType === 1) {
          // 处理图片
          if(node.tagName === 'IMG') {
            node.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
          }
          
          // 处理视频
          if(videoBlockEnabled && (node.tagName === 'VIDEO' || node.tagName === 'AUDIO')) {
            node.poster = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
            node.src = '';
          }
          
          // 处理子元素中的媒体
          const images = node.querySelectorAll && node.querySelectorAll('img');
          if(images) {
            images.forEach(img => {
              img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
            });
          }
          
          if(videoBlockEnabled) {
            const videos = node.querySelectorAll && node.querySelectorAll('video, audio');
            if(videos) {
              videos.forEach(video => {
                video.poster = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
                video.src = '';
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

function unblockMediaContent() {
  // 恢复图片加载
  const images = document.querySelectorAll('img, picture, source[type^="image"], [style*="background-image"]');
  images.forEach(img => {
    img.style.filter = '';
    img.style.opacity = '';
    
    const originalSrc = img.getAttribute('data-original-src');
    const originalStyle = img.getAttribute('data-original-style');
    const originalBg = img.getAttribute('data-original-bg');
    
    if(originalSrc && img.tagName === 'IMG') {
      img.src = originalSrc;
    }
    
    if(originalStyle) {
      img.style.cssText = originalStyle;
    }
    
    if(originalBg) {
      img.style.backgroundImage = originalBg;
    }
    
    img.removeAttribute('data-original-src');
    img.removeAttribute('data-original-style');
    img.removeAttribute('data-original-bg');
  });
  
  // 恢复视频加载
  const videos = document.querySelectorAll('video, audio, iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="dailymotion"]');
  videos.forEach(video => {
    video.style.filter = '';
    video.style.opacity = '';
    
    const originalSrc = video.getAttribute('data-original-src');
    const originalPoster = video.getAttribute('data-original-poster');
    const originalStyle = video.getAttribute('data-original-style');
    
    if(originalSrc && (video.tagName === 'VIDEO' || video.tagName === 'AUDIO')) {
      video.src = originalSrc;
    }
    
    if(originalPoster && video.tagName === 'VIDEO') {
      video.poster = originalPoster;
    }
    
    if(originalStyle) {
      video.style.cssText = originalStyle;
    }
    
    video.removeAttribute('data-original-src');
    video.removeAttribute('data-original-poster');
    video.removeAttribute('data-original-style');
  });
  
  // 停止观察
  if(window.imageBlockObserver) {
    window.imageBlockObserver.disconnect();
  }
}

function updateImageBlockButton() {
  // 在实际界面中更新按钮状态
  console.log('无图模式:', imageBlockEnabled ? '开启' : '关闭');
}

function saveImageBlockSettings() {
  const settings = {
    enabled: imageBlockEnabled,
    videoBlock: videoBlockEnabled
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
    videoBlockEnabled = settings.videoBlock !== undefined ? settings.videoBlock : imageBlockEnabled;
    
    if(imageBlockEnabled) {
      blockMediaContent();
    }
  } catch(e) {
    console.log('加载无图模式设置失败:', e);
  }
}
`;

// =======================================================================================
// 第十部分：HTTP请求注入脚本（核心功能）
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

// 把relativePath去除掉当前代理的地址 https://proxy.com/ ， relative path成为 被代理的（相对）地址，target_website.com/path

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

  // Override window.open function
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


  //ChatGPT + personal modify
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

    // console.log(Object.prototype.toString.call(url)); // [object URL] or string


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

  History.prototype.back = function () {
    return originalBack.apply(this);
  };

  History.prototype.forward = function () {
    return originalForward.apply(this);
  };

  History.prototype.go = function (delta) {
    return originalGo.apply(this, [delta]);
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
  try{
    if(node.nodeType === Node.ELEMENT_NODE){
      // 处理属性
      if(node.hasAttributes()){
        var attributes = node.attributes;
        for (var i = 0; i < attributes.length; i++) {
          var attr = attributes[i];
          if (attr.name === 'src' || attr.name === 'href' || attr.name === 'action' || attr.name === 'data' || attr.name === 'poster' || attr.name === 'srcset' || attr.name === 'background' || attr.name === 'content') {
            if (attr.value && !attr.value.startsWith("javascript:") && !attr.value.startsWith("data:")) {
              node.setAttribute(attr.name, changeURL(attr.value));
            }
          }
        }
      }

      // 处理子节点
      if (node.hasChildNodes()) {
        var children = node.childNodes;
        for (var i = 0; i < children.length; i++) {
          traverseAndConvert(children[i]);
        }
      }
    }
  }catch{
    //ignore
  }
}

//---***========================================***---运行---***========================================***---
networkInject();
windowOpenInject();
appendChildInject();
elementPropertyInject();
windowLocationInject();
documentLocationInject();
historyInject();
obsPage();

//---***========================================***---运行---***========================================***---
`;

// =======================================================================================
// 第十一部分：主请求处理函数
// 功能：处理所有传入的HTTP请求并应用相应的代理逻辑
// =======================================================================================

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const host = url.hostname;

  // 处理根路径重定向
  if (path === str) {
    return Response.redirect(`${url.protocol}//${host}/https://www.google.com`, 302);
  }

  // 处理密码保护页面
  if (showPasswordPage && path === str + "password") {
    return handlePasswordPage(request);
  }

  // 处理密码验证
  if (path === str + "checkPassword") {
    return handlePasswordCheck(request);
  }

  // 处理静态资源
  if (path.startsWith(str + "static/")) {
    return handleStaticResource(request);
  }

  // 处理外部链接
  if (path.startsWith(str + "http")) {
    return handleExternalLink(request, path.substring(1));
  }

  // 处理主代理逻辑
  return handleProxyRequest(request, path.substring(1));
}

// =======================================================================================
// 第十二部分：密码保护功能
// 功能：提供密码验证页面和检查
// =======================================================================================

async function handlePasswordPage(request) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Password Required</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
            input, button { padding: 10px; margin: 5px; }
        </style>
    </head>
    <body>
        <h2>Password Required</h2>
        <form action="/checkPassword" method="post">
            <input type="password" name="password" placeholder="Enter password" required>
            <button type="submit">Submit</button>
        </form>
    </body>
    </html>
  `;
  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}

async function handlePasswordCheck(request) {
  const formData = await request.formData();
  const inputPassword = formData.get('password');
  
  if (inputPassword === password) {
    const headers = new Headers();
    headers.append('Set-Cookie', `${passwordCookieName}=${inputPassword}; HttpOnly; Path=/; Max-Age=86400`);
    return new Response('Password correct! Redirecting...', {
      status: 302,
      headers: { ...headers, 'Location': '/' }
    });
  } else {
    return new Response('Invalid password', { status: 401 });
  }
}

// =======================================================================================
// 第十三部分：静态资源处理
// 功能：处理CSS、JS等静态资源
// =======================================================================================

async function handleStaticResource(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 这里可以添加静态资源处理逻辑
  // 例如：返回CSS文件、JavaScript文件等
  
  return new Response('Static resource', { status: 404 });
}

// =======================================================================================
// 第十四部分：外部链接处理
// 功能：处理外部网站的代理请求
// =======================================================================================

async function handleExternalLink(request, externalUrl) {
  try {
    const targetUrl = decodeURIComponent(externalUrl);
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
    
    return await processResponse(response, targetUrl, request);
  } catch (error) {
    return new Response(`Error fetching external link: ${error.message}`, { status: 500 });
  }
}

// =======================================================================================
// 第十五部分：代理请求处理
// 功能：处理所有代理请求并注入相应脚本
// =======================================================================================

async function handleProxyRequest(request, targetUrl) {
  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
    
    return await processResponse(response, targetUrl, request);
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

// =======================================================================================
// 第十六部分：响应处理
// 功能：处理代理响应并注入必要的脚本
// =======================================================================================

async function processResponse(response, targetUrl, originalRequest) {
  const contentType = response.headers.get('content-type') || '';
  
  // 只处理HTML内容
  if (contentType.includes('text/html')) {
    const html = await response.text();
    
    // 注入所有功能脚本
    const modifiedHtml = injectScripts(html, targetUrl);
    
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Content-Type', 'text/html; charset=utf-8');
    
    return new Response(modifiedHtml, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
  
  // 对于其他类型的内容，直接返回
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}

// =======================================================================================
// 第十七部分：脚本注入
// 功能：将所有功能脚本注入到HTML页面中
// =======================================================================================

function injectScripts(html, targetUrl) {
  const scripts = [
    httpRequestInjection,
    proxyHintInjection,
    toolbarInjection,
    cookieInjectionScript,
    adBlockScript,
    resourceSnifferScript,
    requestModScript,
    imageBlockScript
  ];
  
  const allScripts = scripts.map(script => `<script>${script}</script>`).join('\n');
  
  // 在head标签结束前注入脚本
  if (html.includes('</head>')) {
    return html.replace('</head>', `${allScripts}</head>`);
  }
  
  // 如果没有head标签，在body开始后注入
  if (html.includes('<body>')) {
    return html.replace('<body>', `<body>${allScripts}`);
  }
  
  // 如果都没有，直接附加到末尾
  return html + allScripts;
}

// =======================================================================================
// 第十八部分：初始化
// 功能：确保所有功能在页面加载时正确初始化
// =======================================================================================

// 页面加载完成后初始化所有功能
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllFeatures);
} else {
  initAllFeatures();
}

function initAllFeatures() {
  // 初始化各功能模块
  setTimeout(() => {
    loadImageBlockState();
    loadAdBlockSettings();
    loadSnifferSettings();
    loadRequestModSettings();
  }, 1000);
}