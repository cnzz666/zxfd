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
const cookieRecordDataName = "__PROXY_COOKIE_RECORDS__";
const adBlockSubscriptionsDataName = "__PROXY_ADBLOCK_SUBSCRIPTIONS__";

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
  const cookieBtn = createToolButton('🍪', 'Cookie注入', showCookieModal);
  
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
  mainToolBtn.onclick = (e) => {
    e.stopPropagation();
    e.preventDefault();
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
  
  btn.onclick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onClick();
  };
  return btn;
}

// 初始化工具栏
setTimeout(initToolbar, 1000);
`;

// =======================================================================================
// 第五部分：Cookie注入功能脚本 - 增强版
// 功能：提供cookie注入界面和功能，添加管理界面和网站Cookie记录
// =======================================================================================

const cookieInjectionScript = `
// Cookie注入功能
let cookieManagementData = {};

function showCookieModal() {
  // 检查是否已存在弹窗
  if(document.getElementById('__COOKIE_INJECTION_MODAL__')) return;
  
  // 获取当前网站信息
  const currentSite = window.location.href;
  const currentDomain = new URL(currentSite).hostname;
  
  const modalHTML = \`
  <div id="__COOKIE_INJECTION_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:900px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🍪 Cookie管理</h3>
        
        <!-- 选项卡 -->
        <div style="display:flex;gap:10px;margin-bottom:20px;justify-content:center;">
          <button id="tabInject" class="cookie-tab active" onclick="switchCookieTab('inject')" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">注入Cookie</button>
          <button id="tabManage" class="cookie-tab" onclick="switchCookieTab('manage')" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">管理注入</button>
          <button id="tabRecords" class="cookie-tab" onclick="switchCookieTab('records')" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">网站记录</button>
        </div>
        
        <!-- 注入Cookie面板 -->
        <div id="injectPanel" class="cookie-panel">
          <div style="margin-bottom:20px;text-align:left;">
            <label style="display:block;margin-bottom:8px;font-weight:bold;">注入网站:</label>
            <input type="text" id="targetSite" value="\${currentSite}" readonly style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.3);color:#666;">
          </div>
          
          <div style="margin-bottom:20px;text-align:left;">
            <label style="display:block;margin-bottom:8px;font-weight:bold;">输入方式:</label>
            <select id="inputType" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
              <option value="combined">合成Cookie输入</option>
              <option value="separate">分别输入</option>
            </select>
          </div>
          
          <div id="combinedInput" style="margin-bottom:20px;text-align:left;">
            <label style="display:block;margin-bottom:8px;font-weight:bold;">Cookie字符串:</label>
            <textarea id="combinedCookie" placeholder="例如: name=value; name2=value2; path=/; domain=.example.com" style="width:100%;height:120px;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);resize:vertical;"></textarea>
            <div style="font-size:12px;color:#666;margin-top:5px;">提示：可以包含path、domain等属性</div>
          </div>
          
          <div id="separateInput" style="display:none;text-align:left;">
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
            <button onclick="saveCookieSettings()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;font-weight:bold;">保存并刷新</button>
            <button onclick="closeCookieModal()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">取消</button>
          </div>
        </div>
        
        <!-- 管理注入面板 -->
        <div id="managePanel" class="cookie-panel" style="display:none;">
          <div style="text-align:left;margin-bottom:20px;">
            <h4 style="color:#2c5282;margin-bottom:15px;">已注入的Cookie设置</h4>
            <div id="injectedSitesList" style="max-height:300px;overflow-y:auto;border:1px solid rgba(160,174,192,0.3);border-radius:8px;padding:15px;background:rgba(255,255,255,0.2);">
              <div style="text-align:center;color:#666;padding:20px;">加载中...</div>
            </div>
          </div>
        </div>
        
        <!-- 网站记录面板 -->
        <div id="recordsPanel" class="cookie-panel" style="display:none;">
          <div style="text-align:left;margin-bottom:20px;">
            <h4 style="color:#2c5282;margin-bottom:15px;">当前网站Cookie记录</h4>
            <div style="display:flex;gap:10px;margin-bottom:15px;">
              <button onclick="refreshSiteCookies()" style="padding:8px 16px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:12px;color:#2d3748;cursor:pointer;font-size:12px;">刷新记录</button>
              <button onclick="exportSiteCookies()" style="padding:8px 16px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:12px;color:#2d3748;cursor:pointer;font-size:12px;">导出Cookie</button>
              <button onclick="clearSiteCookies()" style="padding:8px 16px;background:linear-gradient(45deg,#feb2b2,#fc8181);border:none;border-radius:12px;color:#2d3748;cursor:pointer;font-size:12px;">清空Cookie</button>
            </div>
            <div id="siteCookiesList" style="max-height:300px;overflow-y:auto;border:1px solid rgba(160,174,192,0.3);border-radius:8px;padding:15px;background:rgba(255,255,255,0.2);">
              <div style="text-align:center;color:#666;padding:20px;">加载中...</div>
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
    
    // 加载已保存的设置
    loadCookieSettings();
    
    // 加载管理数据
    loadCookieManagementData();
    
    // 加载网站Cookie记录
    loadSiteCookies();
  }, 100);
}

function switchCookieTab(tab) {
  // 更新选项卡状态
  document.querySelectorAll('.cookie-tab').forEach(btn => {
    btn.style.background = 'rgba(160,174,192,0.3)';
  });
  document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
  
  // 显示对应面板
  document.querySelectorAll('.cookie-panel').forEach(panel => {
    panel.style.display = 'none';
  });
  document.getElementById(tab + 'Panel').style.display = 'block';
}

function loadCookieManagementData() {
  try {
    cookieManagementData = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    updateInjectedSitesList();
  } catch(e) {
    console.log('加载Cookie管理数据失败:', e);
  }
}

function updateInjectedSitesList() {
  const container = document.getElementById('injectedSitesList');
  if (!container) return;
  
  const sites = Object.keys(cookieManagementData);
  
  if (sites.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">暂无注入的Cookie设置</div>';
    return;
  }
  
  container.innerHTML = sites.map(site => {
    const settings = cookieManagementData[site];
    const cookieCount = settings.cookies ? settings.cookies.length : 0;
    
    return \`
      <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:15px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <strong style="color:#2c5282;font-size:14px;" title="\${site}">\${site.substring(0, 50)}\${site.length > 50 ? '...' : ''}</strong>
          <div style="display:flex;gap:5px;">
            <button onclick="editInjectedSite('\${site}')" style="padding:4px 8px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;">编辑</button>
            <button onclick="deleteInjectedSite('\${site}')" style="padding:4px 8px;background:linear-gradient(45deg,#feb2b2,#fc8181);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;">删除</button>
          </div>
        </div>
        <div style="font-size:12px;color:#666;">
          <div>输入方式: \${settings.inputType === 'combined' ? '合成输入' : '分别输入'}</div>
          <div>Cookie数量: \${cookieCount}</div>
        </div>
      </div>
    \`;
  }).join('');
}

function editInjectedSite(site) {
  // 切换到注入面板并加载数据
  switchCookieTab('inject');
  document.getElementById('targetSite').value = site;
  
  const settings = cookieManagementData[site];
  if (settings) {
    document.getElementById('inputType').value = settings.inputType || 'combined';
    toggleInputType();
    
    if (settings.cookies && settings.cookies.length > 0) {
      if (settings.inputType === 'combined') {
        const cookieStr = settings.cookies.map(c => \`\${c.name}=\${c.value}\`).join('; ');
        document.getElementById('combinedCookie').value = cookieStr;
      } else {
        separateCookies = settings.cookies;
        updateCookieList();
      }
    }
  }
}

function deleteInjectedSite(site) {
  if (confirm('确定要删除该网站的Cookie注入设置吗？')) {
    delete cookieManagementData[site];
    localStorage.setItem('${cookieInjectionDataName}', JSON.stringify(cookieManagementData));
    updateInjectedSitesList();
    showNotification('Cookie设置已删除', 'success');
  }
}

function loadSiteCookies() {
  const container = document.getElementById('siteCookiesList');
  if (!container) return;
  
  const cookies = document.cookie.split(';').map(c => c.trim()).filter(c => c);
  
  if (cookies.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">当前网站没有Cookie</div>';
    return;
  }
  
  container.innerHTML = cookies.map(cookie => {
    const [name, ...valueParts] = cookie.split('=');
    const value = valueParts.join('=');
    
    return \`
      <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:12px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <div style="flex:1;">
            <strong style="color:#2c5282;font-size:13px;">\${name}</strong>
            <div style="font-size:11px;color:#666;word-break:break-all;">\${value}</div>
          </div>
          <div style="display:flex;gap:3px;flex-shrink:0;">
            <button onclick="copyCookieValue('\${name}')" style="padding:3px 6px;background:rgba(160,174,192,0.3);border:none;border-radius:3px;color:#2d3748;cursor:pointer;font-size:9px;">复制</button>
            <button onclick="deleteSiteCookie('\${name}')" style="padding:3px 6px;background:linear-gradient(45deg,#feb2b2,#fc8181);border:none;border-radius:3px;color:#2d3748;cursor:pointer;font-size:9px;">删除</button>
          </div>
        </div>
      </div>
    \`;
  }).join('');
}

function refreshSiteCookies() {
  loadSiteCookies();
  showNotification('Cookie记录已刷新', 'success');
}

function copyCookieValue(name) {
  const cookies = document.cookie.split(';').map(c => c.trim());
  const cookie = cookies.find(c => c.startsWith(name + '='));
  if (cookie) {
    const value = cookie.substring(name.length + 1);
    navigator.clipboard.writeText(value).then(() => {
      showNotification('Cookie值已复制', 'success');
    });
  }
}

function deleteSiteCookie(name) {
  if (confirm('确定要删除这个Cookie吗？')) {
    document.cookie = \`\${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;\`;
    loadSiteCookies();
    showNotification('Cookie已删除', 'success');
  }
}

function exportSiteCookies() {
  const cookies = document.cookie.split(';').map(c => c.trim());
  const cookieData = cookies.map(cookie => {
    const [name, ...valueParts] = cookie.split('=');
    const value = valueParts.join('=');
    return { name, value };
  });
  
  const data = JSON.stringify(cookieData, null, 2);
  const blob = new Blob([data], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'site_cookies.json';
  a.click();
  URL.revokeObjectURL(url);
  showNotification('Cookie已导出', 'success');
}

function clearSiteCookies() {
  if (confirm('确定要清空当前网站的所有Cookie吗？此操作不可撤销！')) {
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = \`\${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;\`;
    });
    loadSiteCookies();
    showNotification('所有Cookie已清空', 'success');
  }
}

// 原有的Cookie功能函数保持不变
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
    cookies
  };
  
  // 保存到localStorage
  try {
    cookieManagementData[targetSite] = settings;
    localStorage.setItem('${cookieInjectionDataName}', JSON.stringify(cookieManagementData));
    
    // 实际注入Cookie
    injectCookies(cookies);
    
    showNotification('Cookie设置已保存！页面将刷新以应用更改。', 'success');
    setTimeout(() => {
      location.reload();
    }, 1500);
  } catch(e) {
    showNotification('保存失败: ' + e.message, 'error');
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

function loadCookieSettings() {
  try {
    const targetSite = document.getElementById('targetSite').value;
    const settings = cookieManagementData[targetSite];
    
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

function closeCookieModal() {
  const modal = document.getElementById('__COOKIE_INJECTION_MODAL__');
  if(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// 通知功能
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.padding = '12px 20px';
  notification.style.borderRadius = '8px';
  notification.style.color = '#2d3748';
  notification.style.fontWeight = 'bold';
  notification.style.zIndex = '1000001';
  notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  notification.style.transition = 'all 0.3s ease';
  notification.style.opacity = '0';
  notification.style.transform = 'translateX(100%)';
  
  if (type === 'success') {
    notification.style.background = 'linear-gradient(45deg,#9ae6b4,#68d391)';
  } else if (type === 'error') {
    notification.style.background = 'linear-gradient(45deg,#feb2b2,#fc8181)';
  } else {
    notification.style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
  }
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}
`;

// =======================================================================================
// 第六部分：广告拦截功能脚本 - 增强版
// 功能：实现广告拦截和元素标记，添加订阅规则支持
// =======================================================================================

const adBlockScript = `
// 广告拦截功能
let adBlockEnabled = false;
let adBlockRules = [];
let adBlockSubscriptions = {};
let elementPickerActive = false;
let selectedElements = new Set();

// 预定义订阅规则
const defaultSubscriptions = {
  'easylist': {
    name: 'EasyList',
    url: 'https://easylist-downloads.adblockplus.org/easylist.txt',
    enabled: false
  },
  'easyprivacy': {
    name: 'EasyPrivacy',
    url: 'https://easylist-downloads.adblockplus.org/easyprivacy.txt',
    enabled: false
  },
  'antiadblock': {
    name: 'Anti-Adblock',
    url: 'https://easylist-downloads.adblockplus.org/antiadblockfilters.txt',
    enabled: false
  },
  'cjx': {
    name: 'CJX Annoyance',
    url: 'https://fastly.jsdelivr.net/gh/cjx82630/cjxlist/cjx-annoyance.txt',
    enabled: false
  },
  'easylist_china': {
    name: 'EasyList China',
    url: 'https://easylist-downloads.adblockplus.org/easylistchina.txt',
    enabled: false
  }
};

function showAdBlockModal() {
  if(document.getElementById('__ADBLOCK_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__ADBLOCK_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:1000px;width:95%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🚫 广告拦截设置</h3>
        
        <!-- 状态和控制按钮 -->
        <div style="display:flex;gap:15px;margin-bottom:20px;justify-content:center;flex-wrap:wrap;">
          <button id="toggleAdBlock" onclick="toggleAdBlock()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">启用广告拦截</button>
          <button onclick="startElementPicker()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">标记广告元素</button>
          <button onclick="updateAllSubscriptions()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">更新所有订阅</button>
        </div>
        
        <!-- 订阅规则部分 -->
        <div style="text-align:left;margin-bottom:20px;">
          <h4 style="color:#2c5282;margin-bottom:10px;">订阅规则</h4>
          <div id="subscriptionsList" style="background:rgba(255,255,255,0.2);border-radius:8px;padding:15px;margin-bottom:15px;max-height:200px;overflow-y:auto;">
            <!-- 订阅列表将通过JavaScript动态生成 -->
          </div>
        </div>
        
        <!-- 自定义规则部分 -->
        <div style="text-align:left;margin-bottom:20px;">
          <h4 style="color:#2c5282;margin-bottom:10px;">自定义规则 (每行一条)</h4>
          <textarea id="customRules" placeholder="例如: ||ads.example.com^
##.ad-container
##a[href*=\\"ads\\"]" style="width:100%;height:200px;padding:12px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);resize:vertical;font-family:monospace;"></textarea>
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
    updateSubscriptionsList();
  }, 100);
}

function updateSubscriptionsList() {
  const container = document.getElementById('subscriptionsList');
  if (!container) return;
  
  const subscriptions = Object.entries(adBlockSubscriptions);
  
  if (subscriptions.length === 0) {
    // 初始化默认订阅
    adBlockSubscriptions = {...defaultSubscriptions};
    saveAdBlockSettings();
  }
  
  container.innerHTML = Object.entries(adBlockSubscriptions).map(([key, sub]) => \`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;margin-bottom:5px;background:rgba(255,255,255,0.1);border-radius:6px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <input type="checkbox" id="sub-\${key}" \${sub.enabled ? 'checked' : ''} onchange="toggleSubscription('\${key}', this.checked)" style="transform:scale(1.2);">
        <label for="sub-\${key}" style="cursor:pointer;font-weight:bold;color:#2c5282;">\${sub.name}</label>
      </div>
      <div style="display:flex;gap:5px;align-items:center;">
        <span style="font-size:11px;color:#666;">\${sub.lastUpdate ? '更新: ' + new Date(sub.lastUpdate).toLocaleDateString() : '未更新'}</span>
        <button onclick="updateSubscription('\${key}')" style="padding:4px 8px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;">更新</button>
      </div>
    </div>
  \`).join('');
}

async function updateSubscription(key) {
  const sub = adBlockSubscriptions[key];
  if (!sub) return;
  
  try {
    showNotification('正在更新订阅规则: ' + sub.name, 'info');
    const response = await fetch(sub.url);
    const text = await response.text();
    
    // 解析规则
    const rules = text.split('\\n')
      .filter(line => line.trim() && !line.startsWith('!'))
      .map(rule => rule.trim());
    
    sub.rules = rules;
    sub.lastUpdate = Date.now();
    sub.enabled = true;
    
    adBlockSubscriptions[key] = sub;
    saveAdBlockSettings();
    updateSubscriptionsList();
    
    if (adBlockEnabled) {
      applyAdBlockRules();
    }
    
    showNotification('订阅规则更新成功: ' + sub.name, 'success');
  } catch (error) {
    showNotification('更新订阅失败: ' + sub.name, 'error');
    console.error('更新订阅失败:', error);
  }
}

async function updateAllSubscriptions() {
  showNotification('正在更新所有订阅规则...', 'info');
  
  const promises = Object.keys(adBlockSubscriptions).map(key => 
    adBlockSubscriptions[key].enabled ? updateSubscription(key) : Promise.resolve()
  );
  
  await Promise.allSettled(promises);
  showNotification('所有订阅规则更新完成', 'success');
}

function toggleSubscription(key, enabled) {
  const sub = adBlockSubscriptions[key];
  if (sub) {
    sub.enabled = enabled;
    adBlockSubscriptions[key] = sub;
    saveAdBlockSettings();
    
    if (adBlockEnabled && enabled) {
      applyAdBlockRules();
    }
  }
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

function startElementPicker() {
  elementPickerActive = true;
  selectedElements.clear();
  closeAdBlockModal();
  
  // 添加元素选择模式样式
  const style = document.createElement('style');
  style.id = '__ELEMENT_PICKER_STYLE__';
  style.textContent = \`
    * { cursor: crosshair !important; }
    .__adblock_hover__ { 
      outline: 2px solid #c53030 !important; 
      background: rgba(197, 48, 48, 0.1) !important; 
      pointer-events: auto !important;
    }
    .__adblock_selected__ { 
      outline: 3px solid #c53030 !important; 
      background: rgba(197, 48, 48, 0.2) !important;
      pointer-events: auto !important;
    }
    #__PROXY_TOOLBAR__ *,
    #__ELEMENT_PICKER_PANEL__ * {
      cursor: default !important;
      pointer-events: auto !important;
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
  
  // 跳过工具栏和选择面板元素
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
  
  // 跳过工具栏和选择面板元素
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
    showNotification('请先选择要拦截的元素', 'error');
    return;
  }
  
  const textarea = document.getElementById('customRules');
  let currentRules = textarea.value.trim();
  
  selectedElements.forEach(element => {
    const selector = generateCSSSelector(element);
    if(selector && !currentRules.includes(selector)) {
      const newRule = \`##\${selector}\`;
      currentRules += (currentRules ? '\\n' : '') + newRule;
    }
  });
  
  textarea.value = currentRules;
  
  // 保存并应用
  saveAdBlockRules();
  showNotification(\`已添加 \${selectedElements.size} 条拦截规则\`, 'success');
  
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
  clearSelections();
  document.querySelectorAll('.__adblock_hover__').forEach(el => {
    el.classList.remove('__adblock_hover__');
  });
}

function generateCSSSelector(element) {
  if (element.id) {
    return '#' + CSS.escape(element.id);
  }
  
  let selector = element.tagName.toLowerCase();
  
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.split(' ').filter(cls => cls.trim());
    if (classes.length > 0) {
      selector += '.' + classes.map(cls => CSS.escape(cls)).join('.');
    }
  }
  
  // 添加属性选择器以提高特异性
  if (element.src) {
    selector += '[src]';
  } else if (element.href) {
    selector += '[href]';
  }
  
  return selector;
}

function saveAdBlockRules() {
  const customRules = document.getElementById('customRules').value;
  const rules = customRules.split('\\n').filter(rule => rule.trim());
  
  adBlockRules = rules;
  
  const settings = {
    enabled: adBlockEnabled,
    rules: adBlockRules,
    subscriptions: adBlockSubscriptions
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

function loadAdBlockSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem('${adBlockDataName}') || '{}');
    adBlockEnabled = settings.enabled || false;
    adBlockRules = settings.rules || [];
    adBlockSubscriptions = settings.subscriptions || {...defaultSubscriptions};
    
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
  // 收集所有规则
  let allRules = [...adBlockRules];
  
  // 添加启用的订阅规则
  Object.values(adBlockSubscriptions).forEach(sub => {
    if (sub.enabled && sub.rules) {
      allRules = [...allRules, ...sub.rules];
    }
  });
  
  // 应用规则
  allRules.forEach(rule => {
    if (rule.startsWith('##')) {
      // 元素隐藏规则
      const selector = rule.substring(2);
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.style.display = 'none !important';
        });
      } catch (e) {
        console.log('无效的选择器:', selector);
      }
    } else if (rule.startsWith('||')) {
      // 域名阻塞规则
      const domain = rule.substring(2).replace('^', '');
      // 在实际应用中，这里需要更复杂的URL匹配逻辑
    }
  });
  
  console.log('应用广告拦截规则:', allRules.length, '条规则');
}

function removeAdBlockRules() {
  // 移除所有广告拦截样式
  const elements = document.querySelectorAll('[style*="display: none !important"]');
  elements.forEach(el => {
    el.style.display = '';
  });
}

// 初始化广告拦截
setTimeout(loadAdBlockSettings, 2000);
`;

// =======================================================================================
// 第七部分：资源嗅探功能脚本 - 重构版
// 功能：拦截和显示网络请求，实现类似抓包工具的功能
// =======================================================================================

const resourceSnifferScript = `
// 资源嗅探功能
let snifferEnabled = false;
let capturedRequests = [];
let originalFetch = window.fetch;
let originalXHR = window.XMLHttpRequest;
let requestInterceptor = null;
let selectedRequest = null;

function showSnifferModal() {
  if(document.getElementById('__SNIFFER_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__SNIFFER_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:95%;width:1200px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🔍 资源嗅探</h3>
        
        <div style="display:flex;gap:15px;margin-bottom:20px;justify-content:center;flex-wrap:wrap;">
          <button id="toggleSniffer" onclick="toggleSniffer()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">启动嗅探</button>
          <button onclick="clearSnifferData()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">清空记录</button>
          <button onclick="exportSnifferData()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">导出数据</button>
        </div>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;height:500px;">
          <!-- 请求列表 -->
          <div style="text-align:left;">
            <h4 style="color:#2c5282;margin-bottom:10px;">请求列表</h4>
            <div style="background:rgba(255,255,255,0.5);border-radius:8px;padding:15px;height:450px;overflow-y:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:12px;">
                <thead>
                  <tr style="background:rgba(160,174,192,0.2);">
                    <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);width:60px;">方法</th>
                    <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);">URL</th>
                    <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);width:70px;">状态</th>
                    <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);width:80px;">操作</th>
                  </tr>
                </thead>
                <tbody id="snifferTableBody">
                  <tr><td colspan="4" style="padding:20px;text-align:center;color:#666;">暂无数据</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- 请求详情 -->
          <div style="text-align:left;">
            <h4 style="color:#2c5282;margin-bottom:10px;">请求详情</h4>
            <div style="background:rgba(255,255,255,0.5);border-radius:8px;padding:15px;height:450px;overflow-y:auto;">
              <div id="requestDetail" style="color:#666;text-align:center;padding:50px 20px;">
                选择左侧请求查看详情
              </div>
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
    
    updateSnifferTable();
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

function startSniffer() {
  // 拦截fetch请求
  window.fetch = function(...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0].url;
    const method = args[1]?.method || 'GET';
    
    const requestInfo = {
      id: generateId(),
      method: method,
      url: url,
      type: getResourceType(url),
      timestamp: new Date().toLocaleTimeString(),
      status: 'pending',
      size: '0 B',
      requestHeaders: args[1]?.headers || {},
      requestBody: args[1]?.body,
      responseHeaders: {},
      responseBody: null,
      startTime: Date.now(),
      endTime: null,
      duration: 0
    };
    
    capturedRequests.unshift(requestInfo);
    updateSnifferTable();
    
    return originalFetch.apply(this, args).then(async response => {
      requestInfo.status = response.status;
      requestInfo.responseHeaders = Object.fromEntries(response.headers.entries());
      
      // 克隆响应以读取body
      const clonedResponse = response.clone();
      try {
        const text = await clonedResponse.text();
        requestInfo.size = formatBytes(new Blob([text]).size);
        requestInfo.responseBody = text;
      } catch (e) {
        requestInfo.size = '0 B';
      }
      
      requestInfo.endTime = Date.now();
      requestInfo.duration = requestInfo.endTime - requestInfo.startTime;
      updateSnifferTable();
      
      if (selectedRequest && selectedRequest.id === requestInfo.id) {
        showRequestDetail(requestInfo);
      }
      
      return response;
    }).catch(error => {
      requestInfo.status = 'error';
      requestInfo.size = '0 B';
      requestInfo.endTime = Date.now();
      requestInfo.duration = requestInfo.endTime - requestInfo.startTime;
      updateSnifferTable();
      throw error;
    });
  };
  
  // 拦截XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  
  XMLHttpRequest.prototype.open = function(method, url) {
    this._snifferInfo = {
      id: generateId(),
      method: method,
      url: url,
      type: getResourceType(url),
      timestamp: new Date().toLocaleTimeString(),
      status: 'pending',
      size: '0 B',
      requestHeaders: {},
      requestBody: null,
      responseHeaders: {},
      responseBody: null,
      startTime: Date.now(),
      endTime: null,
      duration: 0
    };
    
    this._requestHeaders = {};
    
    capturedRequests.unshift(this._snifferInfo);
    updateSnifferTable();
    
    return originalOpen.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
    this._requestHeaders[name] = value;
    return originalSetRequestHeader.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.send = function(body) {
    if (this._snifferInfo) {
      this._snifferInfo.requestHeaders = this._requestHeaders;
      this._snifferInfo.requestBody = body;
    }
    
    this.addEventListener('load', function() {
      if (this._snifferInfo) {
        this._snifferInfo.status = this.status;
        this._snifferInfo.responseHeaders = this.getAllResponseHeaders();
        this._snifferInfo.responseBody = this.response;
        this._snifferInfo.size = formatBytes(this.response ? new Blob([this.response]).size : 0);
        this._snifferInfo.endTime = Date.now();
        this._snifferInfo.duration = this._snifferInfo.endTime - this._snifferInfo.startTime;
        updateSnifferTable();
        
        if (selectedRequest && selectedRequest.id === this._snifferInfo.id) {
          showRequestDetail(this._snifferInfo);
        }
      }
    });
    
    this.addEventListener('error', function() {
      if (this._snifferInfo) {
        this._snifferInfo.status = 'error';
        this._snifferInfo.endTime = Date.now();
        this._snifferInfo.duration = this._snifferInfo.endTime - this._snifferInfo.startTime;
        updateSnifferTable();
      }
    });
    
    return originalSend.apply(this, arguments);
  };
}

function stopSniffer() {
  // 恢复原始方法
  window.fetch = originalFetch;
  window.XMLHttpRequest = originalXHR;
}

function generateId() {
  return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function getResourceType(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    
    if (pathname.endsWith('.js')) return 'JS';
    if (pathname.endsWith('.css')) return 'CSS';
    if (pathname.match(/\\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) return 'Image';
    if (pathname.endsWith('.html')) return 'HTML';
    if (pathname.endsWith('.json')) return 'JSON';
    if (pathname.endsWith('.xml')) return 'XML';
    if (pathname.match(/\\.(mp4|webm|ogg|mp3|wav)$/)) return 'Media';
    if (urlObj.search.includes('format=json') || pathname.includes('/api/')) return 'API';
    
    return 'Other';
  } catch {
    return 'Other';
  }
}

function formatBytes(bytes) {
  if (typeof bytes !== 'number' || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateSnifferTable() {
  const tbody = document.getElementById('snifferTableBody');
  if(!tbody) return;
  
  if(capturedRequests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="padding:20px;text-align:center;color:#666;">暂无数据</td></tr>';
    return;
  }
  
  tbody.innerHTML = capturedRequests.map(req => \`
    <tr style="border-bottom:1px solid rgba(160,174,192,0.1); cursor:pointer;" onclick="showRequestDetail('\${req.id}')">
      <td style="padding:8px;"><code style="background:\${getMethodColor(req.method)};color:white;padding:2px 6px;border-radius:4px;font-size:10px;">\${req.method}</code></td>
      <td style="padding:8px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="\${req.url}">\${req.url}</td>
      <td style="padding:8px;">
        <span style="padding:2px 6px;border-radius:4px;background:\${getStatusColor(req.status)};color:white;font-size:10px;">
          \${req.status}
        </span>
      </td>
      <td style="padding:8px;">
        <button onclick="event.stopPropagation(); interceptRequest('\${req.id}')" style="padding:4px 8px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;">拦截</button>
        <button onclick="event.stopPropagation(); resendRequest('\${req.id}')" style="padding:4px 8px;background:linear-gradient(45deg,#9ae6b4,#68d391);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;margin-left:4px;">重发</button>
      </td>
    </tr>
  \`).join('');
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

function getStatusColor(status) {
  if(status === 200) return '#38a169';
  if(status >= 400) return '#e53e3e';
  if(status === 'pending') return '#d69e2e';
  return '#718096';
}

function showRequestDetail(requestId) {
  const request = typeof requestId === 'string' 
    ? capturedRequests.find(req => req.id === requestId)
    : requestId;
  
  if (!request) return;
  
  selectedRequest = request;
  
  const detailContainer = document.getElementById('requestDetail');
  detailContainer.innerHTML = \`
    <div style="text-align:left;">
      <h4 style="color:#2c5282;margin-bottom:15px;border-bottom:1px solid rgba(160,174,192,0.3);padding-bottom:8px;">请求详情</h4>
      
      <div style="margin-bottom:15px;">
        <strong>基本信息</strong>
        <div style="background:rgba(255,255,255,0.3);padding:10px;border-radius:6px;margin-top:5px;font-size:12px;">
          <div>URL: \${request.url}</div>
          <div>方法: \${request.method}</div>
          <div>状态: \${request.status}</div>
          <div>类型: \${request.type}</div>
          <div>大小: \${request.size}</div>
          <div>耗时: \${request.duration}ms</div>
          <div>时间: \${request.timestamp}</div>
        </div>
      </div>
      
      <div style="margin-bottom:15px;">
        <strong>请求头</strong>
        <pre style="background:rgba(255,255,255,0.3);padding:10px;border-radius:6px;margin-top:5px;font-size:11px;max-height:100px;overflow-y:auto;">\${JSON.stringify(request.requestHeaders, null, 2)}</pre>
      </div>
      
      <div style="margin-bottom:15px;">
        <strong>请求体</strong>
        <pre style="background:rgba(255,255,255,0.3);padding:10px;border-radius:6px;margin-top:5px;font-size:11px;max-height:100px;overflow-y:auto;">\${request.requestBody || '无'}</pre>
      </div>
      
      <div style="margin-bottom:15px;">
        <strong>响应头</strong>
        <pre style="background:rgba(255,255,255,0.3);padding:10px;border-radius:6px;margin-top:5px;font-size:11px;max-height:100px;overflow-y:auto;">\${typeof request.responseHeaders === 'string' ? request.responseHeaders : JSON.stringify(request.responseHeaders, null, 2)}</pre>
      </div>
      
      <div>
        <strong>响应体</strong>
        <pre style="background:rgba(255,255,255,0.3);padding:10px;border-radius:6px;margin-top:5px;font-size:11px;max-height:150px;overflow-y:auto;">\${request.responseBody || '无'}</pre>
      </div>
    </div>
  \`;
}

function interceptRequest(requestId) {
  const request = capturedRequests.find(req => req.id === requestId);
  if (request) {
    showNotification('拦截功能开发中...', 'info');
    // 这里可以实现请求拦截和修改功能
  }
}

function resendRequest(requestId) {
  const request = capturedRequests.find(req => req.id === requestId);
  if (request) {
    showNotification('重发请求: ' + request.url, 'info');
    
    fetch(request.url, {
      method: request.method,
      headers: request.requestHeaders,
      body: request.requestBody
    }).then(response => {
      showNotification('请求重发成功', 'success');
    }).catch(error => {
      showNotification('请求重发失败', 'error');
    });
  }
}

function clearSnifferData() {
  capturedRequests = [];
  updateSnifferTable();
  document.getElementById('requestDetail').innerHTML = '<div style="color:#666;text-align:center;padding:50px 20px;">选择左侧请求查看详情</div>';
  showNotification('嗅探数据已清空', 'success');
}

function exportSnifferData() {
  const data = JSON.stringify(capturedRequests, null, 2);
  const blob = new Blob([data], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sniffer_data.json';
  a.click();
  URL.revokeObjectURL(url);
  showNotification('数据已导出', 'success');
}

function saveSnifferSettings() {
  const settings = {
    enabled: snifferEnabled
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
// 第八部分：请求修改功能脚本 - 修复版
// 功能：修改请求头和浏览器标识，确保实际生效
// =======================================================================================

const requestModScript = `
// 请求修改功能
let requestModEnabled = false;
let customHeaders = [];
let userAgents = {
  'chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'firefox': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
  'safari': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'edge': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0'
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
const originalFetch = window.fetch;
const originalXHR = XMLHttpRequest.prototype.open;
const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

function showRequestModModal() {
  if(document.getElementById('__REQUEST_MOD_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__REQUEST_MOD_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:900px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🔧 请求修改设置</h3>
        
        <div style="display:flex;gap:15px;margin-bottom:20px;justify-content:center;">
          <button id="toggleRequestMod" onclick="toggleRequestMod()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">启用修改</button>
          <button onclick="testRequestMod()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">测试效果</button>
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
  // 测试当前设置是否生效
  const testUrl = 'https://httpbin.org/user-agent';
  
  fetch(testUrl)
    .then(response => response.json())
    .then(data => {
      const currentUA = navigator.userAgent;
      const serverUA = data['user-agent'];
      
      if (currentUA !== serverUA) {
        showNotification('请求修改测试成功: User-Agent已修改', 'success');
      } else {
        showNotification('请求修改测试: User-Agent未修改', 'info');
      }
    })
    .catch(error => {
      showNotification('测试失败: ' + error.message, 'error');
    });
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
    showNotification('请填写Header名称和值', 'error');
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
    if(requestModEnabled) {
      button.textContent = '禁用修改';
      button.style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
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
  if (!requestModEnabled) return;
  
  const settings = JSON.parse(localStorage.getItem('${requestModDataName}') || '{}');
  
  // 拦截fetch请求
  window.fetch = function(...args) {
    const options = args[1] || {};
    
    // 修改请求头
    if (settings.userAgent) {
      options.headers = options.headers || {};
      if (options.headers instanceof Headers) {
        options.headers.set('User-Agent', settings.userAgent);
      } else {
        options.headers['User-Agent'] = settings.userAgent;
      }
    }
    
    if (settings.acceptLanguage) {
      options.headers = options.headers || {};
      if (options.headers instanceof Headers) {
        options.headers.set('Accept-Language', settings.acceptLanguage);
      } else {
        options.headers['Accept-Language'] = settings.acceptLanguage;
      }
    }
    
    // 添加自定义请求头
    settings.customHeaders.forEach(header => {
      options.headers = options.headers || {};
      if (options.headers instanceof Headers) {
        options.headers.set(header.name, header.value);
      } else {
        options.headers[header.name] = header.value;
      }
    });
    
    return originalFetch.call(this, args[0], options);
  };
  
  // 拦截XMLHttpRequest
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    this._modified = true;
    return originalXHR.call(this, method, url, async, user, password);
  };
  
  XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
    if (this._modified) {
      // 修改User-Agent
      if (name.toLowerCase() === 'user-agent' && settings.userAgent) {
        value = settings.userAgent;
      }
      // 修改Accept-Language
      if (name.toLowerCase() === 'accept-language' && settings.acceptLanguage) {
        value = settings.acceptLanguage;
      }
    }
    
    // 添加自定义请求头
    if (this._modified) {
      settings.customHeaders.forEach(header => {
        if (name.toLowerCase() === header.name.toLowerCase()) {
          value = header.value;
        }
      });
    }
    
    return originalSetRequestHeader.call(this, name, value);
  };
  
  // 修改navigator.userAgent
  Object.defineProperty(navigator, 'userAgent', {
    get: function() {
      return settings.userAgent || originalUserAgent;
    }
  });
  
  // 修改navigator.language
  Object.defineProperty(navigator, 'language', {
    get: function() {
      return settings.acceptLanguage ? settings.acceptLanguage.split(',')[0] : originalLanguage;
    }
  });
  
  Object.defineProperty(navigator, 'languages', {
    get: function() {
      return settings.acceptLanguage ? [settings.acceptLanguage.split(',')[0]] : originalLanguages;
    }
  });
}

function removeRequestModifications() {
  // 恢复原始方法
  window.fetch = originalFetch;
  XMLHttpRequest.prototype.open = originalXHR;
  XMLHttpRequest.prototype.setRequestHeader = originalSetRequestHeader;
}

// 保存原始属性
const originalUserAgent = navigator.userAgent;
const originalLanguage = navigator.language;
const originalLanguages = navigator.languages;

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
  loadRequestModSettings();
  if (requestModEnabled) {
    applyRequestModifications();
  }
}, 1000);
`;

// =======================================================================================
// 第九部分：无图模式功能脚本 - 增强版
// 功能：控制图片和视频加载，扩展为无图无视频模式
// =======================================================================================

const imageBlockScript = `
// 无图模式功能
let imageBlockEnabled = false;
let imageBlockObserver = null;

function toggleImageBlock() {
  imageBlockEnabled = !imageBlockEnabled;
  
  if(imageBlockEnabled) {
    blockMediaContent();
    showNotification('无图模式已启用', 'success');
  } else {
    unblockMediaContent();
    showNotification('无图模式已禁用', 'info');
  }
  
  saveImageBlockSettings();
  updateImageBlockButton();
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
    
    if (img.style.backgroundImage) {
      img.setAttribute('data-original-bg', img.style.backgroundImage);
      img.style.backgroundImage = 'none';
    }
  });
  
  // 阻止视频加载
  const videos = document.querySelectorAll('video, audio, iframe[src*="youtube"], iframe[src*="vimeo"]');
  videos.forEach(media => {
    media.style.filter = 'blur(5px) grayscale(100%)';
    media.style.opacity = '0.3';
    media.setAttribute('data-original-src', media.src || '');
    media.setAttribute('data-original-poster', media.poster || '');
    media.setAttribute('data-original-style', media.style.cssText || '');
    
    if (media.tagName === 'VIDEO' || media.tagName === 'AUDIO') {
      media.poster = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
      media.src = '';
    }
  });
  
  // 阻止新的媒体加载
  imageBlockObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if(node.nodeType === 1) {
          // 处理图片
          if(node.tagName === 'IMG') {
            node.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
            node.style.filter = 'blur(5px) grayscale(100%)';
            node.style.opacity = '0.3';
          }
          
          // 处理视频
          if(node.tagName === 'VIDEO' || node.tagName === 'AUDIO') {
            node.poster = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
            node.src = '';
            node.style.filter = 'blur(5px) grayscale(100%)';
            node.style.opacity = '0.3';
          }
          
          // 处理子元素中的媒体
          const images = node.querySelectorAll && node.querySelectorAll('img, video, audio');
          if(images) {
            images.forEach(media => {
              if (media.tagName === 'IMG') {
                media.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
              } else {
                media.poster = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
                media.src = '';
              }
              media.style.filter = 'blur(5px) grayscale(100%)';
              media.style.opacity = '0.3';
            });
          }
        }
      });
    });
  });
  
  imageBlockObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
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
    
    if (originalStyle) {
      img.style.cssText = originalStyle;
    }
    
    if (originalBg) {
      img.style.backgroundImage = originalBg;
    }
    
    img.removeAttribute('data-original-src');
    img.removeAttribute('data-original-style');
    img.removeAttribute('data-original-bg');
  });
  
  // 恢复视频加载
  const videos = document.querySelectorAll('video, audio, iframe[src*="youtube"], iframe[src*="vimeo"]');
  videos.forEach(media => {
    media.style.filter = '';
    media.style.opacity = '';
    
    const originalSrc = media.getAttribute('data-original-src');
    const originalPoster = media.getAttribute('data-original-poster');
    const originalStyle = media.getAttribute('data-original-style');
    
    if (originalSrc && (media.tagName === 'VIDEO' || media.tagName === 'AUDIO')) {
      media.src = originalSrc;
    }
    
    if (originalPoster && media.tagName === 'VIDEO') {
      media.poster = originalPoster;
    }
    
    if (originalStyle) {
      media.style.cssText = originalStyle;
    }
    
    media.removeAttribute('data-original-src');
    media.removeAttribute('data-original-poster');
    media.removeAttribute('data-original-style');
  });
  
  // 停止观察
  if(imageBlockObserver) {
    imageBlockObserver.disconnect();
    imageBlockObserver = null;
  }
}

function updateImageBlockButton() {
  // 在实际界面中更新按钮状态
  const buttons = document.querySelectorAll('button');
  buttons.forEach(btn => {
    if (btn.innerHTML === '🖼️' && btn.title === '无图模式') {
      if (imageBlockEnabled) {
        btn.style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
        btn.title = '无图模式 (已启用)';
      } else {
        btn.style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
        btn.title = '无图模式';
      }
    }
  });
}

function saveImageBlockSettings() {
  const settings = {
    enabled: imageBlockEnabled
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
    
    if(imageBlockEnabled) {
      blockMediaContent();
    }
    
    updateImageBlockButton();
  } catch(e) {
    console.log('加载无图模式设置失败:', e);
  }
}

// 检查功能是否生效
function checkImageBlockStatus() {
  const images = document.querySelectorAll('img');
  const blockedImages = Array.from(images).filter(img => 
    img.src.includes('data:image/svg+xml') || 
    img.style.filter.includes('blur') ||
    img.getAttribute('data-original-src')
  );
  
  if (imageBlockEnabled && blockedImages.length > 0) {
    showNotification(\`无图模式生效中，已拦截 \${blockedImages.length} 个媒体资源\`, 'success');
  } else if (imageBlockEnabled) {
    showNotification('无图模式已启用但未检测到媒体资源', 'info');
  } else {
    showNotification('无图模式未启用', 'info');
  }
}
`;

// =======================================================================================
// 第十部分：HTTP请求注入脚本（核心功能） - 保持不变
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




//---***========================================***---元素的src和href---***========================================***---
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
  if (node instanceof HTMLElement) {
    removeIntegrityAttributesFromElement(node);
    covToAbs(node);
    node.querySelectorAll('*').forEach(function(child) {
      removeIntegrityAttributesFromElement(child);
      covToAbs(child);
    });
  }
}


// ************************************************************************
// ************************************************************************
// Problem: img can also have srcset
// https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images
// and link secret
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLLinkElement/imageSrcset
// ************************************************************************
// ************************************************************************

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





`;

// =======================================================================================
// 第十一部分：HTML路径转换注入脚本 - 保持不变
// 功能：处理HTML内容的解析和路径转换
// =======================================================================================

const htmlCovPathInjectFuncName = "parseAndInsertDoc";
const htmlCovPathInject = `
function ${htmlCovPathInjectFuncName}(htmlString) {
  // First, modify the HTML string to update all URLs and remove integrity
  const parser = new DOMParser();
  const tempDoc = parser.parseFromString(htmlString, 'text/html');
  
  // Process all elements in the temporary document
  const allElements = tempDoc.querySelectorAll('*');

  allElements.forEach(element => {
    covToAbs(element);
    removeIntegrityAttributesFromElement(element);



    if (element.tagName === 'SCRIPT') {
      if (element.textContent && !element.src) {
          element.textContent = replaceContentPaths(element.textContent);
      }
    }
  
    if (element.tagName === 'STYLE') {
      if (element.textContent) {
          element.textContent = replaceContentPaths(element.textContent);
      }
    }
  });

  
  // Get the modified HTML string
  const modifiedHtml = tempDoc.documentElement.outerHTML;
  
  // Now use document.open/write/close to replace the entire document
  // This preserves the natural script execution order
  document.open();
  document.write('<!DOCTYPE html>' + modifiedHtml);
  document.close();
}




function replaceContentPaths(content){
  // ChatGPT 替换里面的链接
  let regex = new RegExp(\`(?<!src="|href=")(https?:\\\\/\\\\/[^\s'"]+)\`, 'g');
  // 这里写四个 \ 是因为 Server side 的文本也会把它当成转义符


  content = content.replaceAll(regex, (match) => {
    if (match.startsWith("http")) {
      return proxy_host_with_schema + match;
    } else {
      return proxy_host + "/" + match;
    }
  });



  return content;


}

`;

// =======================================================================================
// 第十二部分：主页面HTML模板 - 保持不变
// 功能：代理服务的主页面，包含使用说明和表单
// =======================================================================================

const mainPage = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website Proxy</title>
    <style>
        html, body {
            height: 100%;
            margin: 0;
            overflow-x: hidden; /* 仅隐藏水平滚动条 */
            overflow-y: auto; /* 允许垂直滚动 */
            background-color: #f0f4f8;
        }
        
        body {
            font-family: 'Roboto', Arial, sans-serif;
            color: #2d3748;
            background-image: url('https://www.loliapi.com/acg/');
            background-size: cover;
            background-position: center;
            background-attachment: fixed; /* 背景固定，内容滚动 */
            background-repeat: no-repeat;
            position: relative;
            padding: 30px 0; /* 上下留白，避免内容贴边 */
        }
        
        /* 背景模糊和渐变覆盖层使用固定定位，不随内容滚动 */
        body::after {
            content: '';
            position: fixed;
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
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, rgba(160, 174, 192, 0.2), rgba(226, 232, 240, 0.2));
            z-index: -1;
        }
        
        /* 容器用于限制最大宽度并居中内容 */
        .container {
            max-width: 700px;
            margin: 0 auto;
            padding: 0 15px;
        }
        
        .content {
            text-align: center;
            width: 100%; /* 占满容器宽度 */
            padding: 30px;
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(160, 174, 192, 0.3), 0 0 10px rgba(226, 232, 240, 0.2);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(160, 174, 192, 0.3);
            transform: scale(0.95);
            opacity: 0;
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
            transform: scale(1.02);
            box-shadow: 0 12px 40px rgba(160, 174, 192, 0.5), 0 0 20px rgba(226, 232, 240, 0.3);
            transition: all 0.3s ease;
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 20px;
            color: #2c5282;
            text-shadow: 0 0 5px rgba(160, 174, 192, 0.3);
        }
        
        .description {
            font-size: 1rem;
            margin-bottom: 25px;
            line-height: 1.6;
            color: #4a5568;
        }
        
        form {
            margin-bottom: 30px;
        }
        
        input, button {
            margin: 15px auto;
            padding: 12px 20px;
            font-size: 16px;
            border-radius: 25px;
            outline: none;
            display: block;
            width: 100%;
            max-width: 350px;
            transition: all 0.3s ease;
        }
        
        input {
            background-color: rgba(255, 255, 255, 0.5);
            border: 1px solid rgba(160, 174, 192, 0.5);
            color: #2d3748;
            text-align: center;
        }
        
        input:focus {
            background-color: rgba(255, 255, 255, 0.7);
            border-color: #2c5282;
            box-shadow: 0 0 10px rgba(160, 174, 192, 0.3);
        }
        
        button {
            background: linear-gradient(45deg, #90cdf4, #b7e4f4);
            border: none;
            color: #2d3748;
            cursor: pointer;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        button:hover {
            background: linear-gradient(45deg, #63b3ed, #90cdf4);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(160, 174, 192, 0.4);
        }
        
        .links-container {
            margin: 20px 0;
        }
        
        a {
            color: #2c5282;
            text-decoration: none;
            font-weight: bold;
            transition: all 0.3s ease;
            display: block;
            margin: 10px 0;
            padding: 8px 0;
            border-radius: 10px;
            background-color: rgba(255, 255, 255, 0.3);
        }
        
        a:hover {
            color: #2b6cb0;
            background-color: rgba(255, 255, 255, 0.5);
            transform: translateX(5px);
        }
        
        .footer {
            margin-top: 30px;
            font-size: 0.9rem;
            color: #718096;
        }
        
        .password-section {
            margin-top: 20px;
            padding: 15px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
        }
        
        .password-toggle {
            background: none;
            border: none;
            color: #2c5282;
            cursor: pointer;
            font-size: 0.9rem;
            margin-top: 10px;
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
            .content {
                padding: 20px;
                margin: 10px;
            }
            
            h1 {
                font-size: 2rem;
            }
            
            .description {
                font-size: 0.9rem;
            }
        }
        
        /* 动画关键帧 */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .animate-fadeInUp {
            animation: fadeInUp 0.8s ease-out;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content" id="mainContent">
            <h1>Website Proxy</h1>
            
            <div class="description">
                <p>请输入您要访问的完整网址（包括http://或https://）</p>
                <p>Enter the full URL (including http:// or https://)</p>
            </div>
            
            <form onsubmit="goToWebsite(); return false;">
                <input type="text" id="url" placeholder="https://example.com" autocomplete="off">
                <button type="submit">访问网站</button>
            </form>
            
            <div class="links-container">
                <a href="https://www.google.com">Google</a>
                <a href="https://www.github.com">GitHub</a>
                <a href="https://www.youtube.com">YouTube</a>
                <a href="https://www.bilibili.com">Bilibili</a>
                <a href="https://www.zhihu.com">知乎</a>
                <a href="https://www.baidu.com">百度</a>
            </div>
            
            <div class="footer">
                <p>基于 Cloudflare Worker 构建 | Built with Cloudflare Worker</p>
                <p>原作者开源地址: <a href="https://github.com/1234567Yang/cf-proxy-ex/" target="_blank">GitHub</a></p>
                <p>本项目开源地址: <a href="https://github.com/cnzz666/zxfd" target="_blank">GitHub</a></p>
            </div>
            
            <div class="password-section" id="passwordSection" style="display: none;">
                <p>请输入密码访问</p>
                <input type="password" id="password" placeholder="密码">
                <button onclick="checkPassword()">提交密码</button>
                <button class="password-toggle" onclick="togglePasswordSection()">取消</button>
            </div>
        </div>
    </div>
    
    <script>
        // 页面加载动画
        window.addEventListener('load', function() {
            const content = document.getElementById('mainContent');
            content.classList.add('loaded');
            
            // 添加链接动画
            const links = document.querySelectorAll('.links-container a');
            links.forEach((link, index) => {
                link.style.animationDelay = (index * 0.1) + 's';
                link.classList.add('animate-fadeInUp');
            });
        });
        
        // 设置密码保护
        const showPasswordPage = ${showPasswordPage};
        const password = "${password}";
        
        if (showPasswordPage && password) {
            document.getElementById('passwordSection').style.display = 'block';
            document.querySelector('form').style.display = 'none';
        }
        
        function togglePasswordSection() {
            const passwordSection = document.getElementById('passwordSection');
            const form = document.querySelector('form');
            
            if (passwordSection.style.display === 'none') {
                passwordSection.style.display = 'block';
                form.style.display = 'none';
            } else {
                passwordSection.style.display = 'none';
                form.style.display = 'block';
            }
        }
        
        function checkPassword() {
            const inputPassword = document.getElementById('password').value;
            if (inputPassword === password) {
                document.getElementById('passwordSection').style.display = 'none';
                document.querySelector('form').style.display = 'block';
            } else {
                alert('密码错误！');
            }
        }
        
        function goToWebsite() {
            const urlInput = document.getElementById('url').value.trim();
            if (!urlInput) {
                alert('请输入网址！');
                return;
            }
            
            // 确保网址以http://或https://开头
            let fullUrl = urlInput;
            if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
                fullUrl = 'https://' + fullUrl;
            }
            
            // 跳转到代理页面
            window.location.href = fullUrl;
        }
    </script>
</body>
</html>
`;

// =======================================================================================
// 第十三部分：请求处理主函数 - 保持不变
// 功能：处理所有传入的HTTP请求
// =======================================================================================

async function handleRequest(request) {
  try {
    const url = new URL(request.url);
    const path = url.pathname;
    const host = url.host;
    
    // 记录访问的网站到cookie
    const cookieHeader = request.headers.get('Cookie') || '';
    let visitedSites = [];
    
    if (cookieHeader.includes(lastVisitProxyCookie)) {
      const match = cookieHeader.match(new RegExp(lastVisitProxyCookie + '=([^;]+)'));
      if (match) {
        try {
          visitedSites = JSON.parse(decodeURIComponent(match[1]));
        } catch (e) {
          visitedSites = [];
        }
      }
    }
    
    // 添加当前网站到访问记录（如果不是主页面）
    if (path !== '/' && !path.startsWith('/' + thisProxyServerUrlHttps)) {
      const currentSite = url.href.substring(url.origin.length + 1);
      if (currentSite && !visitedSites.includes(currentSite)) {
        visitedSites.unshift(currentSite);
        // 只保留最近的10个网站
        if (visitedSites.length > 10) {
          visitedSites = visitedSites.slice(0, 10);
        }
      }
    }
    
    // 检查是否需要密码
    if (showPasswordPage && password) {
      const hasPassword = cookieHeader.includes(passwordCookieName + '=' + password);
      if (!hasPassword && path === '/') {
        return new Response(mainPage, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
    }
    
    // 处理主页面请求
    if (path === '/' || path === '') {
      const response = new Response(mainPage, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
      
      // 设置访问记录cookie
      if (visitedSites.length > 0) {
        response.headers.append('Set-Cookie', 
          `${lastVisitProxyCookie}=${encodeURIComponent(JSON.stringify(visitedSites))}; path=/; max-age=2592000` // 30天
        );
      }
      
      return response;
    }
    
    // 获取目标URL
    let targetUrl = path.substring(1); // 移除开头的斜杠
    
    // 处理URL编码
    try {
      targetUrl = decodeURIComponent(targetUrl);
    } catch (e) {
      // 如果解码失败，保持原样
    }
    
    // 确保URL有协议
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://') && !targetUrl.startsWith('blob:')) {
      targetUrl = 'https://' + targetUrl;
    }
    
    // 创建请求对象
    const fetchOptions = {
      method: request.method,
      headers: {}
    };
    
    // 复制请求头，但移除一些不需要的
    const headersToRemove = ['host', 'cookie', 'referer', 'origin', 'accept-encoding'];
    for (const [key, value] of request.headers) {
      if (!headersToRemove.includes(key.toLowerCase())) {
        fetchOptions.headers[key] = value;
      }
    }
    
    // 添加必要的请求头
    fetchOptions.headers['User-Agent'] = request.headers.get('User-Agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    fetchOptions.headers['Accept'] = request.headers.get('Accept') || '*/*';
    
    // 处理请求体
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      fetchOptions.body = request.body;
    }
    
    // 发送请求
    let response;
    try {
      response = await fetch(targetUrl, fetchOptions);
    } catch (error) {
      return new Response(`无法访问目标网站: ${error.message}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
    
    // 处理响应
    const contentType = response.headers.get('Content-Type') || '';
    
    if (contentType.includes('text/html')) {
      // HTML内容需要特殊处理
      let html = await response.text();
      
      // 注入各种脚本
      const injections = [
        httpRequestInjection,
        proxyHintInjection,
        toolbarInjection,
        cookieInjectionScript,
        adBlockScript,
        resourceSnifferScript,
        requestModScript,
        imageBlockScript
      ];
      
      let injectionScript = injections.join('\n\n');
      
      // 在head标签结束前注入
      const headEndIndex = html.indexOf('</head>');
      if (headEndIndex !== -1) {
        html = html.substring(0, headEndIndex) + 
               `<script>${injectionScript}</script>` + 
               html.substring(headEndIndex);
      } else {
        // 如果没有head标签，在body开始处注入
        const bodyStartIndex = html.indexOf('<body');
        if (bodyStartIndex !== -1) {
          const bodyTagEnd = html.indexOf('>', bodyStartIndex) + 1;
          html = html.substring(0, bodyTagEnd) + 
                 `<script>${injectionScript}</script>` + 
                 html.substring(bodyTagEnd);
        } else {
          // 如果连body标签都没有，在开头注入
          html = `<script>${injectionScript}</script>` + html;
        }
      }
      
      // 创建新的响应
      const modifiedResponse = new Response(html, {
        status: response.status,
        statusText: response.statusText,
        headers: {}
      });
      
      // 复制响应头
      for (const [key, value] of response.headers) {
        if (key.toLowerCase() !== 'content-length' && 
            key.toLowerCase() !== 'content-encoding' &&
            key.toLowerCase() !== 'transfer-encoding') {
          modifiedResponse.headers.set(key, value);
        }
      }
      
      // 设置内容类型
      modifiedResponse.headers.set('Content-Type', 'text/html; charset=utf-8');
      
      // 设置访问记录cookie
      if (visitedSites.length > 0) {
        modifiedResponse.headers.append('Set-Cookie', 
          `${lastVisitProxyCookie}=${encodeURIComponent(JSON.stringify(visitedSites))}; path=/; max-age=2592000`
        );
      }
      
      return modifiedResponse;
      
    } else if (contentType.includes('text/css') || 
                contentType.includes('application/javascript') ||
                contentType.includes('text/javascript')) {
      // 处理CSS和JavaScript文件
      let content = await response.text();
      
      // 替换其中的URL
      content = content.replace(/(https?:\\/\\/[^"'\\s]+)/g, (match) => {
        if (match.startsWith('http')) {
          return thisProxyServerUrlHttps + match;
        } else {
          return thisProxyServerUrl_hostOnly + '/' + match;
        }
      });
      
      const modifiedResponse = new Response(content, {
        status: response.status,
        statusText: response.statusText,
        headers: {}
      });
      
      // 复制响应头
      for (const [key, value] of response.headers) {
        if (key.toLowerCase() !== 'content-length' && 
            key.toLowerCase() !== 'content-encoding' &&
            key.toLowerCase() !== 'transfer-encoding') {
          modifiedResponse.headers.set(key, value);
        }
      }
      
      modifiedResponse.headers.set('Content-Type', contentType);
      return modifiedResponse;
      
    } else {
      // 其他类型的响应直接返回
      const modifiedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {}
      });
      
      // 复制响应头
      for (const [key, value] of response.headers) {
        modifiedResponse.headers.set(key, value);
      }
      
      // 设置访问记录cookie
      if (visitedSites.length > 0) {
        modifiedResponse.headers.append('Set-Cookie', 
          `${lastVisitProxyCookie}=${encodeURIComponent(JSON.stringify(visitedSites))}; path=/; max-age=2592000`
        );
      }
      
      return modifiedResponse;
    }
    
  } catch (error) {
    return new Response(`服务器错误: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

// =======================================================================================
// 代码结束
// =======================================================================================