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
const cookieRecordDataName = "__PROXY_COOKIE_RECORD__";
const adBlockSubscriptionDataName = "__PROXY_ADBLOCK_SUBSCRIPTION__";

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
// 第五部分：Cookie注入功能脚本
// 功能：提供cookie注入界面和功能
// =======================================================================================

const cookieInjectionScript = `
// Cookie注入功能
let cookieInjectionEnabled = false;

function showCookieModal() {
  // 检查是否已存在弹窗
  if(document.getElementById('__COOKIE_INJECTION_MODAL__')) return;
  
  // 获取当前网站信息
  const currentSite = window.location.href;
  
  const modalHTML = \`
  <div id="__COOKIE_INJECTION_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:900px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🍪 Cookie注入设置</h3>
        
        <div style="display:flex;gap:10px;margin-bottom:20px;justify-content:center;">
          <button onclick="showCookieManagement()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">管理已保存的Cookie</button>
          <button onclick="showWebsiteCookieRecord()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">网站Cookie记录</button>
        </div>
        
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
          <button onclick="testCookieInjection()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">检查注入</button>
          <button onclick="closeCookieModal()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">取消</button>
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
  }, 100);
}

function showCookieManagement() {
  if(document.getElementById('__COOKIE_MANAGEMENT_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__COOKIE_MANAGEMENT_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000001;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:900px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🍪 Cookie管理</h3>
        
        <div style="margin-bottom:20px;text-align:left;">
          <div id="cookieManagementList" style="max-height:400px;overflow-y:auto;border:1px solid rgba(160,174,192,0.3);border-radius:8px;padding:15px;background:rgba(255,255,255,0.2);">
            <div style="text-align:center;color:#666;padding:20px;">加载中...</div>
          </div>
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
    
    loadCookieManagementList();
  }, 100);
}

function showWebsiteCookieRecord() {
  if(document.getElementById('__COOKIE_RECORD_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__COOKIE_RECORD_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000001;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:900px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🍪 网站Cookie记录</h3>
        
        <div style="margin-bottom:20px;text-align:left;">
          <div id="cookieRecordList" style="max-height:400px;overflow-y:auto;border:1px solid rgba(160,174,192,0.3);border-radius:8px;padding:15px;background:rgba(255,255,255,0.2);">
            <div style="text-align:center;color:#666;padding:20px;">加载中...</div>
          </div>
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="clearCookieRecord()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">清空记录</button>
          <button onclick="closeCookieRecord()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭</button>
        </div>
      </div>
    </div>
  </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  setTimeout(() => {
    const modal = document.getElementById('__COOKIE_RECORD_MODAL__');
    const content = modal.querySelector('div > div');
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
    
    loadCookieRecordList();
  }, 100);
}

function loadCookieManagementList() {
  try {
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    const list = document.getElementById('cookieManagementList');
    
    if(Object.keys(allSettings).length === 0) {
      list.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">暂无保存的Cookie设置</div>';
      return;
    }
    
    let html = '';
    Object.entries(allSettings).forEach(([site, settings]) => {
      html += \`
        <div style="border:1px solid rgba(160,174,192,0.2);border-radius:8px;padding:15px;margin-bottom:10px;background:rgba(255,255,255,0.3);">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
            <div style="flex:1;">
              <strong style="color:#2c5282;">\${site}</strong>
              <div style="font-size:12px;color:#666;margin-top:5px;">
                输入方式: \${settings.inputType} | Cookie数量: \${settings.cookies ? settings.cookies.length : 0}
              </div>
            </div>
            <div style="display:flex;gap:5px;">
              <button onclick="editCookieSetting('\${site}')" style="padding:4px 8px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;">编辑</button>
              <button onclick="deleteCookieSetting('\${site}')" style="padding:4px 8px;background:#c53030;border:none;border-radius:4px;color:white;cursor:pointer;font-size:10px;">删除</button>
            </div>
          </div>
          \${settings.cookies ? settings.cookies.map(cookie => \`
            <div style="font-size:12px;padding:3px 0;border-bottom:1px solid rgba(160,174,192,0.1);">
              <strong>\${cookie.name}</strong>=\${cookie.value}
              \${cookie.domain ? \` | 域名: \${cookie.domain}\` : ''}
              \${cookie.path ? \` | 路径: \${cookie.path}\` : ''}
            </div>
          \`).join('') : ''}
        </div>
      \`;
    });
    
    list.innerHTML = html;
  } catch(e) {
    console.log('加载Cookie管理列表失败:', e);
    document.getElementById('cookieManagementList').innerHTML = '<div style="text-align:center;color:#c53030;padding:20px;">加载失败</div>';
  }
}

function loadCookieRecordList() {
  try {
    const records = JSON.parse(localStorage.getItem('${cookieRecordDataName}') || '[]');
    const list = document.getElementById('cookieRecordList');
    
    if(records.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">暂无Cookie记录</div>';
      return;
    }
    
    let html = '';
    records.forEach(record => {
      html += \`
        <div style="border:1px solid rgba(160,174,192,0.2);border-radius:8px;padding:15px;margin-bottom:10px;background:rgba(255,255,255,0.3);">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
            <div style="flex:1;">
              <strong style="color:#2c5282;">\${record.site}</strong>
              <div style="font-size:12px;color:#666;margin-top:5px;">
                记录时间: \${new Date(record.timestamp).toLocaleString()} | Cookie数量: \${record.cookies.length}
              </div>
            </div>
          </div>
          \${record.cookies.map(cookie => \`
            <div style="font-size:12px;padding:3px 0;border-bottom:1px solid rgba(160,174,192,0.1);">
              <strong>\${cookie.name}</strong>=\${cookie.value}
              \${cookie.domain ? \` | 域名: \${cookie.domain}\` : ''}
              \${cookie.path ? \` | 路径: \${cookie.path}\` : ''}
            </div>
          \`).join('')}
        </div>
      \`;
    });
    
    list.innerHTML = html;
  } catch(e) {
    console.log('加载Cookie记录失败:', e);
    document.getElementById('cookieRecordList').innerHTML = '<div style="text-align:center;color:#c53030;padding:20px;">加载失败</div>';
  }
}

function editCookieSetting(site) {
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
    
    closeCookieManagement();
  }
}

function deleteCookieSetting(site) {
  if(confirm('确定要删除该网站的Cookie设置吗？')) {
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    delete allSettings[site];
    localStorage.setItem('${cookieInjectionDataName}', JSON.stringify(allSettings));
    loadCookieManagementList();
    showNotification('Cookie设置已删除', 'success');
  }
}

function clearCookieRecord() {
  if(confirm('确定要清空所有Cookie记录吗？')) {
    localStorage.setItem('${cookieRecordDataName}', '[]');
    loadCookieRecordList();
    showNotification('Cookie记录已清空', 'success');
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

function closeCookieRecord() {
  const modal = document.getElementById('__COOKIE_RECORD_MODAL__');
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

let separateCookies = [];

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
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    allSettings[targetSite] = settings;
    localStorage.setItem('${cookieInjectionDataName}', JSON.stringify(allSettings));
    
    // 记录Cookie操作
    recordCookieAction(targetSite, cookies, 'inject');
    
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
  
  // 检查注入是否生效
  let allPassed = true;
  const results = [];
  
  cookies.forEach(cookie => {
    const injected = document.cookie.split(';').some(c => {
      const [cookieName, cookieValue] = c.trim().split('=');
      return cookieName === cookie.name && cookieValue === cookie.value;
    });
    
    if(injected) {
      results.push(\`✓ \${cookie.name} 注入成功\`);
    } else {
      results.push(\`✗ \${cookie.name} 注入失败\`);
      allPassed = false;
    }
  });
  
  if(cookies.length === 0) {
    showNotification('没有要检查的Cookie', 'warning');
    return;
  }
  
  const message = results.join('\\n');
  if(allPassed) {
    showNotification('所有Cookie注入成功！', 'success');
  } else {
    showNotification('部分Cookie注入失败，请检查设置', 'error');
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

function recordCookieAction(site, cookies, action) {
  try {
    const records = JSON.parse(localStorage.getItem('${cookieRecordDataName}') || '[]');
    records.unshift({
      site: site,
      cookies: cookies,
      action: action,
      timestamp: Date.now()
    });
    
    // 只保留最近50条记录
    if(records.length > 50) {
      records.splice(50);
    }
    
    localStorage.setItem('${cookieRecordDataName}', JSON.stringify(records));
  } catch(e) {
    console.log('记录Cookie操作失败:', e);
  }
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
// 第六部分：广告拦截功能脚本
// 功能：实现广告拦截和元素标记
// =======================================================================================

const adBlockScript = `
// 广告拦截功能
let adBlockEnabled = false;
let adBlockRules = [];
let elementPickerActive = false;
let selectedElements = new Set();

// 广告订阅规则URL
const adBlockSubscriptions = {
  'antiadblock': 'https://easylist-downloads.adblockplus.org/antiadblockfilters.txt',
  'easyprivacy': 'https://easylist-downloads.adblockplus.org/easyprivacy.txt',
  'cjx-annoyance': 'https://fastly.jsdelivr.net/gh/cjx82630/cjxlist/cjx-annoyance.txt',
  'easylistchina': 'https://easylist-downloads.adblockplus.org/easylistchina.txt'
};

function showAdBlockModal() {
  if(document.getElementById('__ADBLOCK_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__ADBLOCK_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:1000px;width:95%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🚫 广告拦截设置</h3>
        
        <div style="display:flex;gap:10px;margin-bottom:20px;justify-content:center;flex-wrap:wrap;">
          <button id="toggleAdBlock" onclick="toggleAdBlock()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">启用广告拦截</button>
          <button onclick="startElementPicker()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">标记广告元素</button>
          <button onclick="loadDefaultRules()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">加载默认规则</button>
          <button onclick="showSubscriptionModal()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">订阅规则</button>
        </div>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
          <div style="text-align:left;">
            <label style="display:block;margin-bottom:8px;font-weight:bold;">自定义规则 (每行一条):</label>
            <textarea id="customRules" placeholder="例如: ||ads.example.com^
##.ad-container
##a[href*=\\"ads\\"]" style="width:100%;height:200px;padding:12px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);resize:vertical;font-family:monospace;"></textarea>
          </div>
          
          <div style="text-align:left;">
            <label style="display:block;margin-bottom:8px;font-weight:bold;">规则统计:</label>
            <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:15px;height:185px;overflow-y:auto;">
              <div id="ruleStats">加载中...</div>
            </div>
          </div>
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="saveAdBlockRules()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;font-weight:bold;">保存规则</button>
          <button onclick="testAdBlock()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">检查拦截</button>
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
  }, 100);
}

function showSubscriptionModal() {
  if(document.getElementById('__SUBSCRIPTION_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__SUBSCRIPTION_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000001;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:800px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">📋 广告拦截订阅</h3>
        
        <div style="text-align:left;margin-bottom:20px;">
          <div id="subscriptionList" style="max-height:300px;overflow-y:auto;border:1px solid rgba(160,174,192,0.3);border-radius:8px;padding:15px;background:rgba(255,255,255,0.2);margin-bottom:15px;">
            <div style="text-align:center;color:#666;padding:20px;">加载中...</div>
          </div>
          
          <div style="display:flex;gap:10px;">
            <input type="text" id="customSubscriptionUrl" placeholder="输入自定义订阅URL" style="flex:1;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
            <button onclick="addCustomSubscription()" style="padding:8px 16px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:12px;color:#2d3748;cursor:pointer;">添加订阅</button>
          </div>
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="updateAllSubscriptions()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;font-weight:bold;">更新所有订阅</button>
          <button onclick="closeSubscriptionModal()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭</button>
        </div>
      </div>
    </div>
  </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  setTimeout(() => {
    const modal = document.getElementById('__SUBSCRIPTION_MODAL__');
    const content = modal.querySelector('div > div');
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
    
    loadSubscriptionList();
  }, 100);
}

function loadSubscriptionList() {
  try {
    const subscriptions = JSON.parse(localStorage.getItem('${adBlockSubscriptionDataName}') || '{}');
    const list = document.getElementById('subscriptionList');
    
    let html = '';
    Object.entries(adBlockSubscriptions).forEach(([key, url]) => {
      const enabled = subscriptions[key] || false;
      const lastUpdate = subscriptions[\`\${key}_lastUpdate\`] || '从未更新';
      const ruleCount = subscriptions[\`\${key}_count\`] || 0;
      
      html += \`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid rgba(160,174,192,0.2);">
          <div style="flex:1;">
            <div style="font-weight:bold;color:#2c5282;">\${key}</div>
            <div style="font-size:12px;color:#666;">\${url}</div>
            <div style="font-size:11px;color:#999;">最后更新: \${lastUpdate} | 规则数: \${ruleCount}</div>
          </div>
          <div style="display:flex;gap:5px;align-items:center;">
            <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
              <input type="checkbox" \${enabled ? 'checked' : ''} onchange="toggleSubscription('\${key}', this.checked)">
              启用
            </label>
            <button onclick="updateSubscription('\${key}')" style="padding:4px 8px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;">更新</button>
          </div>
        </div>
      \`;
    });
    
    // 自定义订阅
    const customSubs = subscriptions.custom || [];
    customSubs.forEach((sub, index) => {
      html += \`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid rgba(160,174,192,0.2);">
          <div style="flex:1;">
            <div style="font-weight:bold;color:#2c5282;">自定义\${index + 1}</div>
            <div style="font-size:12px;color:#666;">\${sub.url}</div>
            <div style="font-size:11px;color:#999;">最后更新: \${sub.lastUpdate || '从未更新'} | 规则数: \${sub.ruleCount || 0}</div>
          </div>
          <div style="display:flex;gap:5px;align-items:center;">
            <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
              <input type="checkbox" \${sub.enabled ? 'checked' : ''} onchange="toggleCustomSubscription(\${index}, this.checked)">
              启用
            </label>
            <button onclick="updateCustomSubscription(\${index})" style="padding:4px 8px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;">更新</button>
            <button onclick="removeCustomSubscription(\${index})" style="padding:4px 8px;background:#c53030;border:none;border-radius:4px;color:white;cursor:pointer;font-size:10px;">删除</button>
          </div>
        </div>
      \`;
    });
    
    if(!html) {
      html = '<div style="text-align:center;color:#666;padding:20px;">暂无订阅</div>';
    }
    
    list.innerHTML = html;
  } catch(e) {
    console.log('加载订阅列表失败:', e);
    document.getElementById('subscriptionList').innerHTML = '<div style="text-align:center;color:#c53030;padding:20px;">加载失败</div>';
  }
}

async function updateSubscription(key) {
  try {
    const url = adBlockSubscriptions[key];
    const response = await fetch(url);
    const rulesText = await response.text();
    const rules = rulesText.split('\\n').filter(rule => rule.trim() && !rule.startsWith('!'));
    
    const subscriptions = JSON.parse(localStorage.getItem('${adBlockSubscriptionDataName}') || '{}');
    subscriptions[key] = true;
    subscriptions[\`\${key}_rules\`] = rules;
    subscriptions[\`\${key}_lastUpdate\`] = new Date().toLocaleString();
    subscriptions[\`\${key}_count\`] = rules.length;
    
    localStorage.setItem('${adBlockSubscriptionDataName}', JSON.stringify(subscriptions));
    
    // 重新加载广告拦截规则
    loadAdBlockSettings();
    updateRuleStats();
    
    showNotification(\`订阅 \${key} 更新成功，添加了 \${rules.length} 条规则\`, 'success');
    loadSubscriptionList();
  } catch(e) {
    showNotification(\`更新订阅 \${key} 失败: \${e.message}\`, 'error');
  }
}

async function updateAllSubscriptions() {
  const subscriptions = JSON.parse(localStorage.getItem('${adBlockSubscriptionDataName}') || '{}');
  let totalRules = 0;
  
  for(const key of Object.keys(adBlockSubscriptions)) {
    if(subscriptions[key]) {
      try {
        await updateSubscription(key);
        totalRules += subscriptions[\`\${key}_count\`] || 0;
      } catch(e) {
        console.log(\`更新订阅 \${key} 失败:\`, e);
      }
    }
  }
  
  showNotification(\`所有订阅更新完成，总共 \${totalRules} 条规则\`, 'success');
}

function toggleSubscription(key, enabled) {
  const subscriptions = JSON.parse(localStorage.getItem('${adBlockSubscriptionDataName}') || '{}');
  subscriptions[key] = enabled;
  localStorage.setItem('${adBlockSubscriptionDataName}', JSON.stringify(subscriptions));
  
  // 重新加载广告拦截规则
  loadAdBlockSettings();
  updateRuleStats();
  
  showNotification(\`订阅 \${key} \${enabled ? '已启用' : '已禁用'}\`, 'success');
}

function addCustomSubscription() {
  const url = document.getElementById('customSubscriptionUrl').value.trim();
  if(!url) {
    showNotification('请输入订阅URL', 'warning');
    return;
  }
  
  const subscriptions = JSON.parse(localStorage.getItem('${adBlockSubscriptionDataName}') || '{}');
  if(!subscriptions.custom) {
    subscriptions.custom = [];
  }
  
  subscriptions.custom.push({
    url: url,
    enabled: true,
    lastUpdate: '从未更新',
    ruleCount: 0
  });
  
  localStorage.setItem('${adBlockSubscriptionDataName}', JSON.stringify(subscriptions));
  document.getElementById('customSubscriptionUrl').value = '';
  
  showNotification('自定义订阅已添加', 'success');
  loadSubscriptionList();
}

async function updateCustomSubscription(index) {
  try {
    const subscriptions = JSON.parse(localStorage.getItem('${adBlockSubscriptionDataName}') || '{}');
    const sub = subscriptions.custom[index];
    
    const response = await fetch(sub.url);
    const rulesText = await response.text();
    const rules = rulesText.split('\\n').filter(rule => rule.trim() && !rule.startsWith('!'));
    
    sub.rules = rules;
    sub.lastUpdate = new Date().toLocaleString();
    sub.ruleCount = rules.length;
    
    localStorage.setItem('${adBlockSubscriptionDataName}', JSON.stringify(subscriptions));
    
    // 重新加载广告拦截规则
    loadAdBlockSettings();
    updateRuleStats();
    
    showNotification(\`自定义订阅更新成功，添加了 \${rules.length} 条规则\`, 'success');
    loadSubscriptionList();
  } catch(e) {
    showNotification(\`更新自定义订阅失败: \${e.message}\`, 'error');
  }
}

function toggleCustomSubscription(index, enabled) {
  const subscriptions = JSON.parse(localStorage.getItem('${adBlockSubscriptionDataName}') || '{}');
  subscriptions.custom[index].enabled = enabled;
  localStorage.setItem('${adBlockSubscriptionDataName}', JSON.stringify(subscriptions));
  
  // 重新加载广告拦截规则
  loadAdBlockSettings();
  updateRuleStats();
  
  showNotification(\`自定义订阅 \${enabled ? '已启用' : '已禁用'}\`, 'success');
}

function removeCustomSubscription(index) {
  if(confirm('确定要删除这个自定义订阅吗？')) {
    const subscriptions = JSON.parse(localStorage.getItem('${adBlockSubscriptionDataName}') || '{}');
    subscriptions.custom.splice(index, 1);
    localStorage.setItem('${adBlockSubscriptionDataName}', JSON.stringify(subscriptions));
    
    showNotification('自定义订阅已删除', 'success');
    loadSubscriptionList();
  }
}

function closeSubscriptionModal() {
  const modal = document.getElementById('__SUBSCRIPTION_MODAL__');
  if(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

function updateRuleStats() {
  const stats = document.getElementById('ruleStats');
  if(!stats) return;
  
  try {
    const subscriptions = JSON.parse(localStorage.getItem('${adBlockSubscriptionDataName}') || '{}');
    let totalRules = adBlockRules.length;
    let enabledSubscriptions = 0;
    let subscriptionRules = 0;
    
    // 统计订阅规则
    Object.keys(adBlockSubscriptions).forEach(key => {
      if(subscriptions[key]) {
        enabledSubscriptions++;
        subscriptionRules += subscriptions[\`\${key}_count\`] || 0;
      }
    });
    
    // 统计自定义订阅规则
    if(subscriptions.custom) {
      subscriptions.custom.forEach(sub => {
        if(sub.enabled) {
          enabledSubscriptions++;
          subscriptionRules += sub.ruleCount || 0;
        }
      });
    }
    
    totalRules += subscriptionRules;
    
    stats.innerHTML = \`
      <div style="margin-bottom:10px;">
        <strong>总规则数:</strong> \${totalRules}
      </div>
      <div style="margin-bottom:10px;">
        <strong>自定义规则:</strong> \${adBlockRules.length}
      </div>
      <div style="margin-bottom:10px;">
        <strong>订阅规则:</strong> \${subscriptionRules}
      </div>
      <div style="margin-bottom:10px;">
        <strong>启用订阅:</strong> \${enabledSubscriptions}
      </div>
      <div style="margin-bottom:10px;">
        <strong>拦截状态:</strong> \${adBlockEnabled ? '<span style="color:#38a169;">已启用</span>' : '<span style="color:#e53e3e;">已禁用</span>'}
      </div>
    \`;
  } catch(e) {
    stats.innerHTML = '<div style="color:#c53030;">统计加载失败</div>';
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
  updateRuleStats();
}

function startElementPicker() {
  elementPickerActive = true;
  closeAdBlockModal();
  
  // 添加元素选择模式样式
  const style = document.createElement('style');
  style.id = '__ELEMENT_PICKER_STYLE__';
  style.textContent = \`
    * { cursor: crosshair !important; }
    .__adblock_hover__ { outline: 2px solid #c53030 !important; background: rgba(197, 48, 48, 0.1) !important; }
    .__adblock_selected__ { outline: 3px solid #2c5282 !important; background: rgba(44, 82, 130, 0.2) !important; }
    #__PROXY_TOOLBAR__ * { cursor: default !important; }
    #__PROXY_TOOLS_CONTAINER__ * { cursor: default !important; }
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
    <button onclick="confirmBlockElements()" style="padding:8px 16px;background:#2c5282;border:none;border-radius:15px;color:white;cursor:pointer;">确认拦截</button>
    <button onclick="clearSelectedElements()" style="padding:8px 16px;background:rgba(160,174,192,0.3);border:none;border-radius:15px;color:#2d3748;cursor:pointer;">清空选择</button>
    <button onclick="cancelElementPicker()" style="padding:8px 16px;background:#c53030;border:none;border-radius:15px;color:white;cursor:pointer;">取消</button>
  \`;
  
  document.body.appendChild(panel);
  
  // 添加鼠标移动事件监听
  document.addEventListener('mouseover', handleElementHover, true);
  document.addEventListener('click', handleElementClick, true);
}

function handleElementHover(e) {
  if(!elementPickerActive) return;
  
  // 跳过工具栏元素
  if(e.target.closest('#__PROXY_TOOLBAR__') || e.target.closest('#__PROXY_TOOLS_CONTAINER__')) {
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
  if(e.target.closest('#__PROXY_TOOLBAR__') || e.target.closest('#__PROXY_TOOLS_CONTAINER__')) {
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
    if(!element.classList.contains('__adblock_hover__')) {
      element.classList.add('__adblock_hover__');
    }
  });
  selectedElements.clear();
  updateSelectedCount();
}

function confirmBlockElements() {
  if(selectedElements.size === 0) {
    showNotification('请先选择要拦截的元素', 'warning');
    return;
  }
  
  const textarea = document.getElementById('customRules');
  const currentRules = textarea.value;
  let newRules = currentRules ? currentRules + '\\n' : '';
  
  selectedElements.forEach(element => {
    let selector = generateCSSSelector(element);
    if(selector && !currentRules.includes(selector)) {
      newRules += \`##\${selector}\\n\`;
    }
  });
  
  textarea.value = newRules.trim();
  
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
  document.querySelectorAll('.__adblock_hover__, .__adblock_selected__').forEach(el => {
    el.classList.remove('__adblock_hover__', '__adblock_selected__');
  });
  
  selectedElements.clear();
}

function generateCSSSelector(element) {
  // 跳过工具栏元素
  if(element.closest('#__PROXY_TOOLBAR__') || element.closest('#__PROXY_TOOLS_CONTAINER__')) {
    return null;
  }
  
  if(element.id) {
    return '#' + element.id;
  }
  
  let selector = element.tagName.toLowerCase();
  if(element.className && typeof element.className === 'string') {
    const classes = element.className.split(' ').filter(cls => cls.trim());
    if(classes.length > 0) {
      selector += '.' + classes.join('.');
    }
  }
  
  // 简单的唯一性检查
  if(document.querySelectorAll(selector).length === 1) {
    return selector;
  }
  
  // 如果选择器不唯一，尝试添加父级信息
  let uniqueSelector = selector;
  let parent = element.parentElement;
  let depth = 0;
  
  while(parent && depth < 3) {
    if(parent.id) {
      uniqueSelector = \`#\${parent.id} > \${uniqueSelector}\`;
      break;
    }
    depth++;
    parent = parent.parentElement;
  }
  
  return uniqueSelector;
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
  
  document.getElementById('customRules').value = defaultRules;
  showNotification('默认规则已加载', 'success');
}

function saveAdBlockRules() {
  const customRules = document.getElementById('customRules').value;
  const rules = customRules.split('\\n').filter(rule => rule.trim());
  
  adBlockRules = rules;
  
  const settings = {
    enabled: adBlockEnabled,
    rules: adBlockRules
  };
  
  try {
    localStorage.setItem('${adBlockDataName}', JSON.stringify(settings));
    
    if(adBlockEnabled) {
      applyAdBlockRules();
    }
    
    updateRuleStats();
    showNotification('广告规则已保存！', 'success');
  } catch(e) {
    showNotification('保存失败: ' + e.message, 'error');
  }
}

function testAdBlock() {
  if(!adBlockEnabled) {
    showNotification('请先启用广告拦截', 'warning');
    return;
  }
  
  // 检查当前页面上的广告元素
  const adSelectors = [
    '.ad', '.ads', '.advertisement', '[class*="ad-"]', '[id*="ad-"]',
    '.banner', '.google-ad', '.ad-container', '.ad-wrapper'
  ];
  
  let blockedCount = 0;
  adSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    blockedCount += elements.length;
  });
  
  if(blockedCount > 0) {
    showNotification(\`检测到 \${blockedCount} 个可能的广告元素，拦截功能正常\`, 'success');
  } else {
    showNotification('未检测到明显的广告元素，拦截功能可能已生效', 'info');
  }
}

function loadAdBlockSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem('${adBlockDataName}') || '{}');
    adBlockEnabled = settings.enabled || false;
    adBlockRules = settings.rules || [];
    
    // 加载订阅规则
    const subscriptions = JSON.parse(localStorage.getItem('${adBlockSubscriptionDataName}') || '{}');
    
    // 合并所有启用的订阅规则
    Object.keys(adBlockSubscriptions).forEach(key => {
      if(subscriptions[key] && subscriptions[\`\${key}_rules\`]) {
        adBlockRules = adBlockRules.concat(subscriptions[\`\${key}_rules\`]);
      }
    });
    
    // 合并自定义订阅规则
    if(subscriptions.custom) {
      subscriptions.custom.forEach(sub => {
        if(sub.enabled && sub.rules) {
          adBlockRules = adBlockRules.concat(sub.rules);
        }
      });
    }
    
    // 去重
    adBlockRules = [...new Set(adBlockRules)];
    
    const button = document.getElementById('toggleAdBlock');
    if(adBlockEnabled) {
      button.textContent = '禁用广告拦截';
      button.style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
      applyAdBlockRules();
    }
    
    if(document.getElementById('customRules')) {
      // 只显示自定义规则，不显示订阅规则
      const customSettings = JSON.parse(localStorage.getItem('${adBlockDataName}') || '{}');
      document.getElementById('customRules').value = (customSettings.rules || []).join('\\n');
    }
  } catch(e) {
    console.log('加载广告拦截设置失败:', e);
  }
}

function applyAdBlockRules() {
  console.log('应用广告拦截规则:', adBlockRules.length);
  
  // 应用CSS规则隐藏广告元素
  const styleId = '__ADBLOCK_STYLE__';
  let existingStyle = document.getElementById(styleId);
  if(existingStyle) {
    existingStyle.remove();
  }
  
  const style = document.createElement('style');
  style.id = styleId;
  
  // 过滤有效的CSS选择器规则
  const cssRules = adBlockRules.filter(rule => rule.startsWith('##'));
  if(cssRules.length > 0) {
    style.textContent = cssRules.map(rule => {
      const selector = rule.substring(2); // 移除 ## 前缀
      return \`\${selector} { display: none !important; }\`;
    }).join('\\n');
    
    document.head.appendChild(style);
  }
  
  // 处理URL拦截规则
  const urlRules = adBlockRules.filter(rule => rule.startsWith('||') && rule.endsWith('^'));
  console.log('URL拦截规则:', urlRules);
}

function removeAdBlockRules() {
  const style = document.getElementById('__ADBLOCK_STYLE__');
  if(style) {
    style.remove();
  }
  console.log('移除广告拦截规则');
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

// 初始化广告拦截
setTimeout(loadAdBlockSettings, 2000);
`;

// =======================================================================================
// 第七部分：资源嗅探功能脚本
// 功能：拦截和显示网络请求
// =======================================================================================

const resourceSnifferScript = `
// 资源嗅探功能
let snifferEnabled = false;
let capturedRequests = [];
let requestInterceptor = null;
let responseInterceptor = null;
let modifiedRequests = new Map();

function showSnifferModal() {
  if(document.getElementById('__SNIFFER_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__SNIFFER_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:95%;width:1200px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🔍 资源嗅探</h3>
        
        <div style="display:flex;gap:10px;margin-bottom:20px;justify-content:center;flex-wrap:wrap;">
          <button id="toggleSniffer" onclick="toggleSniffer()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">启动嗅探</button>
          <button onclick="clearSnifferData()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">清空记录</button>
          <button onclick="exportSnifferData()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">导出数据</button>
          <button onclick="importSnifferData()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">导入数据</button>
        </div>
        
        <div style="text-align:left;margin-bottom:20px;">
          <div style="background:rgba(255,255,255,0.5);border-radius:8px;padding:15px;max-height:400px;overflow-y:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
              <thead>
                <tr style="background:rgba(160,174,192,0.2);">
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);">方法</th>
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);">URL</th>
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);">类型</th>
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);">状态</th>
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);">大小</th>
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);">操作</th>
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
  if(requestInterceptor) return; // 防止重复拦截
  
  // 拦截fetch请求
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0].url;
    const method = args[1]?.method || 'GET';
    const headers = args[1]?.headers || {};
    
    const requestId = Date.now() + Math.random();
    const requestInfo = {
      id: requestId,
      method: method,
      url: url,
      type: getResourceType(url),
      timestamp: new Date().toLocaleTimeString(),
      status: 'pending',
      size: '0 B',
      headers: headers,
      requestData: args[1]?.body || null
    };
    
    capturedRequests.unshift(requestInfo);
    updateSnifferTable();
    
    // 检查是否有修改的请求
    const modifiedRequest = modifiedRequests.get(url);
    if(modifiedRequest) {
      Object.assign(args[1] || {}, modifiedRequest);
    }
    
    return originalFetch.apply(this, args).then(response => {
      requestInfo.status = response.status;
      requestInfo.size = formatBytes(response.headers.get('content-length') || 0);
      requestInfo.responseHeaders = Object.fromEntries(response.headers.entries());
      
      // 克隆响应以便读取body
      return response.clone().text().then(text => {
        requestInfo.responseData = text;
        updateSnifferTable();
        return response;
      });
    }).catch(error => {
      requestInfo.status = 'error';
      requestInfo.size = '0 B';
      requestInfo.error = error.message;
      updateSnifferTable();
      throw error;
    });
  };
  
  // 拦截XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    this._snifferInfo = {
      id: Date.now() + Math.random(),
      method: method,
      url: url,
      type: getResourceType(url),
      timestamp: new Date().toLocaleTimeString(),
      status: 'pending',
      size: '0 B',
      headers: {},
      requestData: null
    };
    
    capturedRequests.unshift(this._snifferInfo);
    updateSnifferTable();
    
    const originalSetRequestHeader = this.setRequestHeader;
    this.setRequestHeader = function(name, value) {
      this._snifferInfo.headers[name] = value;
      return originalSetRequestHeader.call(this, name, value);
    };
    
    this.addEventListener('load', function() {
      this._snifferInfo.status = this.status;
      this._snifferInfo.size = formatBytes(this.response ? new Blob([this.response]).size : 0);
      this._snifferInfo.responseHeaders = this.getAllResponseHeaders();
      this._snifferInfo.responseData = this.response;
      updateSnifferTable();
    });
    
    this.addEventListener('error', function() {
      this._snifferInfo.status = 'error';
      this._snifferInfo.error = 'Request failed';
      updateSnifferTable();
    });
    
    return originalOpen.apply(this, arguments);
  };
  
  requestInterceptor = { originalFetch, originalOpen };
}

function stopSniffer() {
  if(!requestInterceptor) return;
  
  // 恢复原始方法
  window.fetch = requestInterceptor.originalFetch;
  XMLHttpRequest.prototype.open = requestInterceptor.originalOpen;
  
  requestInterceptor = null;
}

function getResourceType(url) {
  const ext = url.split('.').pop().toLowerCase();
  const types = {
    'js': 'JavaScript',
    'css': 'CSS',
    'png': 'Image',
    'jpg': 'Image',
    'jpeg': 'Image',
    'gif': 'Image',
    'svg': 'Image',
    'webp': 'Image',
    'html': 'HTML',
    'json': 'JSON',
    'xml': 'XML',
    'woff': 'Font',
    'woff2': 'Font',
    'ttf': 'Font',
    'eot': 'Font',
    'mp4': 'Video',
    'webm': 'Video',
    'ogg': 'Video',
    'mp3': 'Audio',
    'wav': 'Audio'
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

function updateSnifferTable() {
  const tbody = document.getElementById('snifferTableBody');
  if(!tbody) return;
  
  if(capturedRequests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="padding:20px;text-align:center;color:#666;">暂无数据</td></tr>';
    return;
  }
  
  tbody.innerHTML = capturedRequests.map(req => \`
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
        <button onclick="inspectRequest('\${req.id}')" style="padding:4px 8px;background:rgba(160,174,192,0.3);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;">详情</button>
        <button onclick="interceptRequest('\${req.id}')" style="padding:4px 8px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;">拦截</button>
        <button onclick="replayRequest('\${req.id}')" style="padding:4px 8px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;">重放</button>
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
  const request = capturedRequests.find(req => req.id == id);
  if(request) {
    showRequestDetail(request);
  }
}

function interceptRequest(id) {
  const request = capturedRequests.find(req => req.id == id);
  if(request) {
    showRequestInterceptor(request);
  }
}

function replayRequest(id) {
  const request = capturedRequests.find(req => req.id == id);
  if(request) {
    // 重新发送请求
    if(request.method === 'GET') {
      fetch(request.url, {
        method: request.method,
        headers: request.headers
      }).then(response => {
        showNotification('请求重放成功', 'success');
      }).catch(error => {
        showNotification('请求重放失败: ' + error.message, 'error');
      });
    } else {
      fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.requestData
      }).then(response => {
        showNotification('请求重放成功', 'success');
      }).catch(error => {
        showNotification('请求重放失败: ' + error.message, 'error');
      });
    }
  }
}

function showRequestDetail(request) {
  if(document.getElementById('__REQUEST_DETAIL_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__REQUEST_DETAIL_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000001;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:90%;width:800px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🔍 请求详情</h3>
        
        <div style="text-align:left;margin-bottom:20px;">
          <div style="margin-bottom:15px;">
            <strong>URL:</strong> <span style="word-break:break-all;">\${request.url}</span>
          </div>
          <div style="margin-bottom:15px;">
            <strong>方法:</strong> \${request.method}
          </div>
          <div style="margin-bottom:15px;">
            <strong>状态:</strong> \${request.status}
          </div>
          <div style="margin-bottom:15px;">
            <strong>大小:</strong> \${request.size}
          </div>
          <div style="margin-bottom:15px;">
            <strong>时间:</strong> \${request.timestamp}
          </div>
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="closeRequestDetail()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭</button>
        </div>
      </div>
    </div>
  </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  setTimeout(() => {
    const modal = document.getElementById('__REQUEST_DETAIL_MODAL__');
    const content = modal.querySelector('div > div');
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
  }, 100);
}

function showRequestInterceptor(request) {
  if(document.getElementById('__REQUEST_INTERCEPTOR_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__REQUEST_INTERCEPTOR_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000001;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:90%;width:800px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">✏️ 请求修改</h3>
        
        <div style="text-align:left;margin-bottom:20px;">
          <div style="margin-bottom:15px;">
            <strong>URL:</strong> <span style="word-break:break-all;">\${request.url}</span>
          </div>
          
          <div style="margin-bottom:15px;">
            <label style="display:block;margin-bottom:5px;font-weight:bold;">请求方法:</label>
            <select id="interceptMethod" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
          
          <div style="margin-bottom:15px;">
            <label style="display:block;margin-bottom:5px;font-weight:bold;">请求头:</label>
            <textarea id="interceptHeaders" placeholder="格式: HeaderName: HeaderValue" style="width:100%;height:100px;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);resize:vertical;">\${Object.entries(request.headers).map(([k,v]) => \`\${k}: \${v}\`).join('\\n')}</textarea>
          </div>
          
          <div style="margin-bottom:15px;">
            <label style="display:block;margin-bottom:5px;font-weight:bold;">请求体:</label>
            <textarea id="interceptBody" style="width:100%;height:150px;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);resize:vertical;">\${request.requestData || ''}</textarea>
          </div>
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="saveInterceptedRequest('\${request.url}')" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;font-weight:bold;">保存修改</button>
          <button onclick="closeRequestInterceptor()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">取消</button>
        </div>
      </div>
    </div>
  </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // 设置当前值
  setTimeout(() => {
    const modal = document.getElementById('__REQUEST_INTERCEPTOR_MODAL__');
    const content = modal.querySelector('div > div');
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
    
    document.getElementById('interceptMethod').value = request.method;
  }, 100);
}

function saveInterceptedRequest(url) {
  const method = document.getElementById('interceptMethod').value;
  const headersText = document.getElementById('interceptHeaders').value;
  const body = document.getElementById('interceptBody').value;
  
  // 解析headers
  const headers = {};
  headersText.split('\\n').forEach(line => {
    const [name, ...valueParts] = line.split(':');
    if(name && valueParts.length > 0) {
      headers[name.trim()] = valueParts.join(':').trim();
    }
  });
  
  const modifiedRequest = {
    method: method,
    headers: headers,
    body: body
  };
  
  modifiedRequests.set(url, modifiedRequest);
  showNotification('请求修改已保存', 'success');
  closeRequestInterceptor();
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

function closeRequestInterceptor() {
  const modal = document.getElementById('__REQUEST_INTERCEPTOR_MODAL__');
  if(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

function clearSnifferData() {
  capturedRequests = [];
  updateSnifferTable();
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
  showNotification('数据导出成功', 'success');
}

function importSnifferData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        capturedRequests = data;
        updateSnifferTable();
        showNotification('数据导入成功', 'success');
      } catch(error) {
        showNotification('数据导入失败: ' + error.message, 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
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
// 第八部分：请求修改功能脚本
// 功能：修改请求头和浏览器标识
// =======================================================================================

const requestModScript = `
// 请求修改功能
let requestModEnabled = false;
let customHeaders = [];
let userAgents = {
  'chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'firefox': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'safari': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'edge': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
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

function showRequestModModal() {
  if(document.getElementById('__REQUEST_MOD_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__REQUEST_MOD_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:900px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🔧 请求修改设置</h3>
        
        <div style="display:flex;gap:10px;margin-bottom:20px;justify-content:center;">
          <button id="toggleRequestMod" onclick="toggleRequestMod()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">启用修改</button>
          <button onclick="testRequestMod()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">检查修改</button>
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
  if(!requestModEnabled) {
    showNotification('请先启用请求修改', 'warning');
    return;
  }
  
  // 测试当前设置是否生效
  const userAgentSelect = document.getElementById('userAgent');
  const customUserAgent = document.getElementById('customUserAgent');
  const acceptLanguageSelect = document.getElementById('acceptLanguage');
  const customLanguage = document.getElementById('customLanguage');
  
  const userAgent = customUserAgent.style.display !== 'none' ? customUserAgent.value : userAgentSelect.value;
  const acceptLanguage = customLanguage.style.display !== 'none' ? customLanguage.value : acceptLanguageSelect.value;
  
  let testResults = [];
  
  // 测试User-Agent
  if(userAgent) {
    testResults.push(\`✓ User-Agent 已设置: \${userAgent.substring(0, 50)}...\`);
  } else {
    testResults.push('✗ User-Agent 未设置');
  }
  
  // 测试Accept-Language
  if(acceptLanguage) {
    testResults.push(\`✓ Accept-Language 已设置: \${acceptLanguage}\`);
  } else {
    testResults.push('✗ Accept-Language 未设置');
  }
  
  // 测试自定义Header
  if(customHeaders.length > 0) {
    testResults.push(\`✓ 自定义Header已设置: \${customHeaders.length} 个\`);
  } else {
    testResults.push('✗ 自定义Header未设置');
  }
  
  showNotification(testResults.join('\\n'), 'info');
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
    showNotification('请填写Header名称和值', 'warning');
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
  showNotification('自定义Header已删除', 'success');
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
  // 重写 fetch
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const options = args[1] || {};
    
    // 应用修改
    if(requestModEnabled) {
      const settings = JSON.parse(localStorage.getItem('${requestModDataName}') || '{}');
      
      // 设置 User-Agent
      if(settings.userAgent) {
        options.headers = options.headers || {};
        if(options.headers instanceof Headers) {
          options.headers.set('User-Agent', settings.userAgent);
        } else {
          options.headers['User-Agent'] = settings.userAgent;
        }
      }
      
      // 设置 Accept-Language
      if(settings.acceptLanguage) {
        options.headers = options.headers || {};
        if(options.headers instanceof Headers) {
          options.headers.set('Accept-Language', settings.acceptLanguage);
        } else {
          options.headers['Accept-Language'] = settings.acceptLanguage;
        }
      }
      
      // 设置自定义 Header
      if(settings.customHeaders) {
        options.headers = options.headers || {};
        settings.customHeaders.forEach(header => {
          if(options.headers instanceof Headers) {
            options.headers.set(header.name, header.value);
          } else {
            options.headers[header.name] = header.value;
          }
        });
      }
    }
    
    return originalFetch.apply(this, args);
  };
  
  // 重写 XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    this._requestHeaders = {};
    return originalOpen.call(this, method, url, async, user, password);
  };
  
  XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
    this._requestHeaders[name] = value;
    return originalSetRequestHeader.call(this, name, value);
  };
  
  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function(data) {
    if(requestModEnabled) {
      const settings = JSON.parse(localStorage.getItem('${requestModDataName}') || '{}');
      
      // 应用修改
      if(settings.userAgent) {
        originalSetRequestHeader.call(this, 'User-Agent', settings.userAgent);
      }
      if(settings.acceptLanguage) {
        originalSetRequestHeader.call(this, 'Accept-Language', settings.acceptLanguage);
      }
      if(settings.customHeaders) {
        settings.customHeaders.forEach(header => {
          originalSetRequestHeader.call(this, header.name, header.value);
        });
      }
    }
    
    return originalSend.call(this, data);
  };
  
  console.log('请求修改已应用');
}

function removeRequestModifications() {
  // 恢复原始方法
  // 注意：在实际应用中，这需要更复杂的恢复逻辑
  location.reload();
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
// 第九部分：无图模式功能脚本
// 功能：控制图片和视频加载
// =======================================================================================

const imageBlockScript = `
// 无图模式功能
let imageBlockEnabled = false;

function toggleImageBlock() {
  imageBlockEnabled = !imageBlockEnabled;
  
  if(imageBlockEnabled) {
    blockMedia();
    showNotification('无图模式已启用', 'success');
  } else {
    unblockMedia();
    showNotification('无图模式已禁用', 'info');
  }
  
  saveImageBlockSettings();
  updateImageBlockButton();
}

function blockMedia() {
  // 阻止图片加载
  const images = document.querySelectorAll('img, picture, source[type^="image"], [style*="background-image"]');
  images.forEach(img => {
    img.style.filter = 'blur(5px) grayscale(100%)';
    img.style.opacity = '0.3';
    img.setAttribute('data-original-src', img.src || '');
    if(img.tagName === 'IMG') {
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
    }
  });
  
  // 阻止视频加载
  const videos = document.querySelectorAll('video, audio, iframe[src*="youtube"], iframe[src*="vimeo"]');
  videos.forEach(video => {
    video.style.filter = 'blur(5px) grayscale(100%)';
    video.style.opacity = '0.3';
    if(video.tagName === 'VIDEO' || video.tagName === 'AUDIO') {
      video.pause();
      video.setAttribute('data-original-src', video.src || '');
      video.src = '';
    }
  });
  
  // 阻止新的媒体加载
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if(node.nodeType === 1) {
          if(node.tagName === 'IMG') {
            node.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
          }
          if(node.tagName === 'VIDEO' || node.tagName === 'AUDIO') {
            node.pause();
            node.src = '';
          }
          const mediaElements = node.querySelectorAll && node.querySelectorAll('img, video, audio');
          if(mediaElements) {
            mediaElements.forEach(media => {
              if(media.tagName === 'IMG') {
                media.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
              } else {
                media.pause();
                media.src = '';
              }
            });
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

function unblockMedia() {
  // 恢复图片加载
  const images = document.querySelectorAll('img, picture, source[type^="image"], [style*="background-image"]');
  images.forEach(img => {
    img.style.filter = '';
    img.style.opacity = '';
    const originalSrc = img.getAttribute('data-original-src');
    if(originalSrc && img.tagName === 'IMG') {
      img.src = originalSrc;
    }
    img.removeAttribute('data-original-src');
  });
  
  // 恢复视频加载
  const videos = document.querySelectorAll('video, audio');
  videos.forEach(video => {
    video.style.filter = '';
    video.style.opacity = '';
    const originalSrc = video.getAttribute('data-original-src');
    if(originalSrc) {
      video.src = originalSrc;
    }
    video.removeAttribute('data-original-src');
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
      blockMedia();
    }
  } catch(e) {
    console.log('加载无图模式设置失败:', e);
  }
}
`;

// =======================================================================================
// 第十部分：通知系统脚本
// 功能：在页面右上角显示操作结果通知
// =======================================================================================

const notificationScript = `
// 通知系统
function showNotification(message, type = 'info') {
  // 移除现有通知
  const existingNotification = document.getElementById('__PROXY_NOTIFICATION__');
  if(existingNotification) {
    existingNotification.remove();
  }
  
  // 创建通知元素
  const notification = document.createElement('div');
  notification.id = '__PROXY_NOTIFICATION__';
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.zIndex = '1000002';
  notification.style.padding = '15px 20px';
  notification.style.borderRadius = '10px';
  notification.style.color = '#2d3748';
  notification.style.fontWeight = '500';
  notification.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
  notification.style.backdropFilter = 'blur(10px)';
  notification.style.border = '1px solid rgba(255,255,255,0.2)';
  notification.style.transform = 'translateX(100%)';
  notification.style.transition = 'transform 0.3s ease';
  notification.style.maxWidth = '400px';
  notification.style.wordBreak = 'break-word';
  notification.style.whiteSpace = 'pre-line';
  
  // 设置背景颜色基于类型
  const colors = {
    success: 'linear-gradient(45deg, #48bb78, #68d391)',
    error: 'linear-gradient(45deg, #f56565, #fc8181)',
    warning: 'linear-gradient(45deg, #ed8936, #f6ad55)',
    info: 'linear-gradient(45deg, #90cdf4, #b7e4f4)'
  };
  
  notification.style.background = colors[type] || colors.info;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // 显示动画
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // 自动隐藏
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if(notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 4000);
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

  // 方法：当调用 location.replace 或 location.assign 时，修改 URL
  replace(url) {
      this.originalLocation.replace(changeURL(url));
  }

  assign(url) {
      this.originalLocation.assign(changeURL(url));
  }

  reload() {
      this.originalLocation.reload();
  }

  toString() {
      return this.originalLocation.toString();
  }

  // Getter 和 Setter 用于处理 location.href
  get href() {
      return getOriginalUrl(this.originalLocation.href);
  }

  set href(url) {
      this.originalLocation.href = changeURL(url);
  }

  // 其他属性的代理
  get protocol() {
      return this.originalLocation.protocol;
  }

  get host() {
      return this.originalLocation.host;
  }

  get hostname() {
      return this.originalLocation.hostname;
  }

  get port() {
      return this.originalLocation.port;
  }

  get pathname() {
      return this.originalLocation.pathname;
  }

  get search() {
      return this.originalLocation.search;
  }

  get hash() {
      return this.originalLocation.hash;
  }

  get origin() {
      return this.originalLocation.origin;
  }
}

function locationInject() {
  // 替换全局的 location 对象
  Object.defineProperty(window, 'location', {
      value: new ProxyLocation(window.location),
      writable: false
  });

  console.log("LOCATION INJECTED");
}




//---***========================================***---注入history---***========================================***---
function historyInject(){
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (state, title, url) {
      const modifiedUrl = changeURL(url);
      originalPushState.call(this, state, title, modifiedUrl);
  };

  history.replaceState = function (state, title, url) {
      const modifiedUrl = changeURL(url);
      originalReplaceState.call(this, state, title, modifiedUrl);
  };

  console.log("HISTORY INJECTED");
}



//---***========================================***---注入postMessage---***========================================***---
function postMessageInject(){
  const originalPostMessage = window.postMessage;

  window.postMessage = function (message, targetOrigin, transfer) {
      // 如果 targetOrigin 是字符串，则修改它
      if (typeof targetOrigin === 'string') {
          targetOrigin = changeURL(targetOrigin);
      }
      originalPostMessage.call(this, message, targetOrigin, transfer);
  };

  console.log("POST MESSAGE INJECTED");
}



//---***========================================***---注入Worker---***========================================***---
function workerInject(){
  const originalWorker = window.Worker;

  window.Worker = function (scriptURL, options) {
      const modifiedScriptURL = changeURL(scriptURL);
      return new originalWorker(modifiedScriptURL, options);
  };

  console.log("WORKER INJECTED");
}



//---***========================================***---注入EventSource---***========================================***---
function eventSourceInject(){
  const originalEventSource = window.EventSource;

  window.EventSource = function (url, eventSourceInitDict) {
      const modifiedUrl = changeURL(url);
      return new originalEventSource(modifiedUrl, eventSourceInitDict);
  };

  console.log("EVENT SOURCE INJECTED");
}




//---***========================================***---注入WebSocket---***========================================***---
function webSocketInject(){
  const originalWebSocket = window.WebSocket;

  window.WebSocket = function (url, protocols) {
      const modifiedUrl = changeURL(url);
      return new originalWebSocket(modifiedUrl, protocols);
  };

  console.log("WEBSOCKET INJECTED");
}




//---***========================================***---注入importScripts---***========================================***---
function importScriptsInject(){
  const originalImportScripts = self.importScripts;

  self.importScripts = function (...urls) {
      const modifiedUrls = urls.map(url => changeURL(url));
      originalImportScripts(...modifiedUrls);
  };

  console.log("IMPORT SCRIPTS INJECTED");
}




//---***========================================***---注入document.write---***========================================***---
function documentWriteInject(){
  const originalWrite = document.write;
  const originalWriteln = document.writeln;

  document.write = function (...content) {
      const modifiedContent = content.map(html => html.replace(/src\\s*=\\s*["']([^"']+)["']/gi, (match, p1) => \`src="\${changeURL(p1)}"\`));
      originalWrite.apply(this, modifiedContent);
  };

  document.writeln = function (...content) {
      const modifiedContent = content.map(html => html.replace(/src\\s*=\\s*["']([^"']+)["']/gi, (match, p1) => \`src="\${changeURL(p1)}"\`));
      originalWriteln.apply(this, modifiedContent);
  };

  console.log("DOCUMENT WRITE INJECTED");
}




//---***========================================***---注入MutationObserver---***========================================***---
function mutationObserverInject(){
  const originalObserve = MutationObserver.prototype.observe;

  MutationObserver.prototype.observe = function (target, options) {
      // 在观察之前，我们可以修改目标或选项
      originalObserve.call(this, target, options);
  };

  console.log("MUTATION OBSERVER INJECTED");
}




//---***========================================***---注入form---***========================================***---
function formInject(){
  const originalSubmit = HTMLFormElement.prototype.submit;

  HTMLFormElement.prototype.submit = function () {
      // 在提交前修改表单的 action 属性
      if (this.action) {
          this.action = changeURL(this.action);
      }
      originalSubmit.call(this);
  };

  console.log("FORM INJECTED");
}




//---***========================================***---注入createElement---***========================================***---
function createElementInject(){
  const originalCreateElement = document.createElement;

  document.createElement = function (tagName) {
      const element = originalCreateElement.call(this, tagName);

      // 如果是 script 或 link 标签，重写其 src 或 href 属性
      if (tagName.toLowerCase() === 'script' || tagName.toLowerCase() === 'link') {
          const originalSetAttribute = element.setAttribute;

          element.setAttribute = function (name, value) {
              if ((name === 'src' && tagName.toLowerCase() === 'script') || 
                  (name === 'href' && tagName.toLowerCase() === 'link')) {
                  value = changeURL(value);
              }
              originalSetAttribute.call(this, name, value);
          };
      }

      return element;
  };

  console.log("CREATE ELEMENT INJECTED");
}




//---***========================================***---注入EventTarget---***========================================***---
function eventTargetInject(){
  const originalAddEventListener = EventTarget.prototype.addEventListener;

  EventTarget.prototype.addEventListener = function (type, listener, options) {
      // 可以在这里修改事件类型或监听器
      originalAddEventListener.call(this, type, listener, options);
  };

  console.log("EVENT TARGET INJECTED");
}




//---***========================================***---注入CSS---***========================================***---
function cssInject(){
  const originalInsertRule = CSSStyleSheet.prototype.insertRule;
  const originalDeleteRule = CSSStyleSheet.prototype.deleteRule;

  CSSStyleSheet.prototype.insertRule = function (rule, index) {
      // 修改 CSS 规则中的 URL
      rule = rule.replace(/url\\(['"]?([^'"]+)['"]?\\)/gi, (match, p1) => \`url("\${changeURL(p1)}"\`);
      return originalInsertRule.call(this, rule, index);
  };

  CSSStyleSheet.prototype.deleteRule = function (index) {
      return originalDeleteRule.call(this, index);
  };

  console.log("CSS INJECTED");
}




//---***========================================***---注入setTimeout/setInterval---***========================================***---
function timerInject(){
  const originalSetTimeout = window.setTimeout;
  const originalSetInterval = window.setInterval;

  window.setTimeout = function (handler, timeout, ...args) {
      // 如果 handler 是字符串，修改其中的 URL
      if (typeof handler === 'string') {
          handler = changeURL(handler);
      }
      return originalSetTimeout(handler, timeout, ...args);
  };

  window.setInterval = function (handler, timeout, ...args) {
      if (typeof handler === 'string') {
          handler = changeURL(handler);
      }
      return originalSetInterval(handler, timeout, ...args);
  };

  console.log("TIMER INJECTED");
}




//---***========================================***---注入eval---***========================================***---
function evalInject(){
  const originalEval = window.eval;

  window.eval = function (x) {
      // 修改字符串中的 URL
      if (typeof x === 'string') {
          x = changeURL(x);
      }
      return originalEval(x);
  };

  console.log("EVAL INJECTED");
}




//---***========================================***---注入Function---***========================================***---
function functionInject(){
  const originalFunction = window.Function;

  window.Function = function (...args) {
      // 修改参数中的 URL
      const modifiedArgs = args.map(arg => (typeof arg === 'string' ? changeURL(arg) : arg));
      return originalFunction(...modifiedArgs);
  };

  console.log("FUNCTION INJECTED");
}




//---***========================================***---注入Object.defineProperty---***========================================***---
function definePropertyInject(){
  const originalDefineProperty = Object.defineProperty;

  Object.defineProperty = function (obj, prop, descriptor) {
      // 可以在这里拦截对特定属性的定义
      return originalDefineProperty(obj, prop, descriptor);
  };

  console.log("DEFINE PROPERTY INJECTED");
}




//---***========================================***---注入Object.defineProperties---***========================================***---
function definePropertiesInject(){
  const originalDefineProperties = Object.defineProperties;

  Object.defineProperties = function (obj, props) {
      // 可以在这里拦截对多个属性的定义
      return originalDefineProperties(obj, props);
  };

  console.log("DEFINE PROPERTIES INJECTED");
}




//---***========================================***---注入Proxy---***========================================***---
function proxyInject(){
  const originalProxy = window.Proxy;

  window.Proxy = function (target, handler) {
      // 可以在这里修改 handler
      return originalProxy(target, handler);
  };

  console.log("PROXY INJECTED");
}




//---***========================================***---注入Reflect---***========================================***---
function reflectInject(){
  // Reflect 的方法通常不需要修改，但可以根据需要拦截
  console.log("REFLECT INJECTED");
}




//---***========================================***---注入JSON---***========================================***---
function jsonInject(){
  const originalParse = JSON.parse;
  const originalStringify = JSON.stringify;

  JSON.parse = function (text, reviver) {
      // 可以在这里修改 JSON 字符串中的 URL
      if (typeof text === 'string') {
          text = changeURL(text);
      }
      return originalParse(text, reviver);
  };

  JSON.stringify = function (value, replacer, space) {
      const result = originalStringify(value, replacer, space);
      // 可以在这里修改结果字符串中的 URL
      return changeURL(result);
  };

  console.log("JSON INJECTED");
}




//---***========================================***---注入console---***========================================***---
function consoleInject(){
  // 可以在这里修改 console 方法，例如记录日志
  console.log("CONSOLE INJECTED");
}




//---***========================================***---注入Error---***========================================***---
function errorInject(){
  const originalError = window.Error;

  window.Error = function (message) {
      // 可以在这里修改错误消息中的 URL
      message = changeURL(message);
      return originalError(message);
  };

  console.log("ERROR INJECTED");
}




//---***========================================***---注入Promise---***========================================***---
function promiseInject(){
  const originalThen = Promise.prototype.then;
  const originalCatch = Promise.prototype.catch;
  const originalFinally = Promise.prototype.finally;

  Promise.prototype.then = function (onFulfilled, onRejected) {
      // 可以在这里修改回调函数
      return originalThen.call(this, onFulfilled, onRejected);
  };

  Promise.prototype.catch = function (onRejected) {
      return originalCatch.call(this, onRejected);
  };

  Promise.prototype.finally = function (onFinally) {
      return originalFinally.call(this, onFinally);
  };

  console.log("PROMISE INJECTED");
}




//---***========================================***---注入Symbol---***========================================***---
function symbolInject(){
  // Symbol 通常不需要修改
  console.log("SYMBOL INJECTED");
}




//---***========================================***---注入Map---***========================================***---
function mapInject(){
  const originalSet = Map.prototype.set;

  Map.prototype.set = function (key, value) {
      // 可以在这里修改 key 或 value
      if (typeof value === 'string') {
          value = changeURL(value);
      }
      return originalSet.call(this, key, value);
  };

  console.log("MAP INJECTED");
}




//---***========================================***---注入Set---***========================================***---
function setInject(){
  const originalAdd = Set.prototype.add;

  Set.prototype.add = function (value) {
      // 可以在这里修改 value
      if (typeof value === 'string') {
          value = changeURL(value);
      }
      return originalAdd.call(this, value);
  };

  console.log("SET INJECTED");
}




//---***========================================***---注入WeakMap---***========================================***---
function weakMapInject(){
  // WeakMap 的键必须是对象，通常不需要修改
  console.log("WEAK MAP INJECTED");
}




//---***========================================***---注入WeakSet---***========================================***---
function weakSetInject(){
  // WeakSet 的值必须是对象，通常不需要修改
  console.log("WEAK SET INJECTED");
}




//---***========================================***---注入Array---***========================================***---
function arrayInject(){
  const originalPush = Array.prototype.push;
  const originalPop = Array.prototype.pop;
  const originalShift = Array.prototype.shift;
  const originalUnshift = Array.prototype.unshift;
  const originalSplice = Array.prototype.splice;

  Array.prototype.push = function (...items) {
      // 可以在这里修改 items
      const modifiedItems = items.map(item => (typeof item === 'string' ? changeURL(item) : item));
      return originalPush.apply(this, modifiedItems);
  };

  Array.prototype.pop = function () {
      return originalPop.call(this);
  };

  Array.prototype.shift = function () {
      return originalShift.call(this);
  };

  Array.prototype.unshift = function (...items) {
      const modifiedItems = items.map(item => (typeof item === 'string' ? changeURL(item) : item));
      return originalUnshift.apply(this, modifiedItems);
  };

  Array.prototype.splice = function (start, deleteCount, ...items) {
      const modifiedItems = items.map(item => (typeof item === 'string' ? changeURL(item) : item));
      return originalSplice.call(this, start, deleteCount, ...modifiedItems);
  };

  console.log("ARRAY INJECTED");
}




//---***========================================***---注入String---***========================================***---
function stringInject(){
  const originalReplace = String.prototype.replace;
  const originalReplaceAll = String.prototype.replaceAll;

  String.prototype.replace = function (searchValue, replaceValue) {
      // 可以在这里修改 replaceValue
      if (typeof replaceValue === 'string') {
          replaceValue = changeURL(replaceValue);
      }
      return originalReplace.call(this, searchValue, replaceValue);
  };

  String.prototype.replaceAll = function (searchValue, replaceValue) {
      if (typeof replaceValue === 'string') {
          replaceValue = changeURL(replaceValue);
      }
      return originalReplaceAll.call(this, searchValue, replaceValue);
  };

  console.log("STRING INJECTED");
}




//---***========================================***---注入RegExp---***========================================***---
function regexpInject(){
  // RegExp 通常不需要修改
  console.log("REGEXP INJECTED");
}




//---***========================================***---注入Date---***========================================***---
function dateInject(){
  // Date 通常不需要修改
  console.log("DATE INJECTED");
}




//---***========================================***---注入Math---***========================================***---
function mathInject(){
  // Math 通常不需要修改
  console.log("MATH INJECTED");
}




//---***========================================***---注入Number---***========================================***---
function numberInject(){
  // Number 通常不需要修改
  console.log("NUMBER INJECTED");
}




//---***========================================***---注入Boolean---***========================================***---
function booleanInject(){
  // Boolean 通常不需要修改
  console.log("BOOLEAN INJECTED");
}




//---***========================================***---注入globalThis---***========================================***---
function globalThisInject(){
  // globalThis 通常不需要修改
  console.log("GLOBAL THIS INJECTED");
}




//---***========================================***---注入所有---***========================================***---
function injectAll(){
  console.log("开始注入所有代理相关方法...");
  networkInject();
  windowOpenInject();
  appendChildInject();
  elementPropertyInject();
  locationInject();
  historyInject();
  postMessageInject();
  workerInject();
  eventSourceInject();
  webSocketInject();
  importScriptsInject();
  documentWriteInject();
  mutationObserverInject();
  formInject();
  createElementInject();
  eventTargetInject();
  cssInject();
  timerInject();
  evalInject();
  functionInject();
  definePropertyInject();
  definePropertiesInject();
  proxyInject();
  reflectInject();
  jsonInject();
  consoleInject();
  errorInject();
  promiseInject();
  symbolInject();
  mapInject();
  setInject();
  weakMapInject();
  weakSetInject();
  arrayInject();
  stringInject();
  regexpInject();
  dateInject();
  mathInject();
  numberInject();
  booleanInject();
  globalThisInject();
  console.log("所有代理相关方法注入完成！");
}




//---***========================================***---执行注入---***========================================***---
injectAll();

`;

// =======================================================================================
// 第十二部分：HTML页面定义
// 功能：定义代理工具的HTML界面
// =======================================================================================

const html = `<!DOCTYPE html>
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
            background: linear-gradient(135deg, #90cdf4, #b7e4f4);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(160, 174, 192, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            width: 100%;
            max-width: 500px;
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo h1 {
            color: #2d3748;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .logo p {
            color: #4a5568;
            font-size: 1.1em;
        }
        .input-group {
            margin-bottom: 20px;
        }
        .input-group label {
            display: block;
            margin-bottom: 8px;
            color: #2d3748;
            font-weight: 500;
        }
        .input-group input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid rgba(160, 174, 192, 0.5);
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.5);
            color: #2d3748;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        .input-group input:focus {
            outline: none;
            border-color: #90cdf4;
            background: rgba(255, 255, 255, 0.8);
            box-shadow: 0 0 0 3px rgba(144, 205, 244, 0.2);
        }
        .btn {
            width: 100%;
            padding: 12px 20px;
            background: linear-gradient(45deg, #90cdf4, #b7e4f4);
            border: none;
            border-radius: 12px;
            color: #2d3748;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(144, 205, 244, 0.4);
        }
        .btn:active {
            transform: translateY(0);
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #718096;
            font-size: 0.9em;
        }
        .footer a {
            color: #90cdf4;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .password-group {
            display: none;
        }
        @media (max-width: 600px) {
            .container {
                padding: 30px 20px;
            }
            .logo h1 {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>🌐 Web Proxy</h1>
            <p>安全、快速、便捷的网络代理服务</p>
        </div>
        <form id="proxyForm">
            <div class="input-group">
                <label for="url">输入要访问的网址</label>
                <input type="url" id="url" name="url" placeholder="https://example.com" required>
            </div>
            <div class="input-group password-group" id="passwordGroup">
                <label for="password">访问密码</label>
                <input type="password" id="password" name="password" placeholder="输入访问密码">
            </div>
            <button type="submit" class="btn">开始浏览</button>
        </form>
        <div class="footer">
            <p>基于 Cloudflare Workers 构建</p>
            <p>开源项目: <a href="https://github.com/1234567Yang/cf-proxy-ex/" target="_blank">GitHub</a></p>
        </div>
    </div>

    <script>
        document.getElementById('proxyForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const url = document.getElementById('url').value.trim();
            const password = document.getElementById('password').value;
            
            if (!url) {
                alert('请输入要访问的网址');
                return;
            }
            
            // 确保URL以http://或https://开头
            let targetUrl = url;
            if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                targetUrl = 'https://' + targetUrl;
            }
            
            // 构建代理URL
            const proxyUrl = \`\${window.location.origin}/\${encodeURIComponent(targetUrl)}\`;
            
            // 如果有密码，添加到URL参数中
            let finalUrl = proxyUrl;
            if (password) {
                finalUrl += \`?pwd=\${encodeURIComponent(password)}\`;
            }
            
            // 跳转到代理页面
            window.location.href = finalUrl;
        });

        // 检查是否需要显示密码输入框
        ${showPasswordPage ? `
        const urlParams = new URLSearchParams(window.location.search);
        const needPassword = urlParams.get('needPassword') === 'true';
        if (needPassword) {
            document.getElementById('passwordGroup').style.display = 'block';
        }
        ` : ''}
    </script>
</body>
</html>`;

// =======================================================================================
// 第十三部分：主要请求处理函数
// 功能：处理所有代理请求和响应
// =======================================================================================

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // 处理根路径访问 - 显示代理界面
  if (url.pathname === str) {
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
  
  // 处理代理请求
  try {
    // 解码目标URL
    let targetUrl = decodeURIComponent(url.pathname.substring(str.length));
    
    // 检查URL是否包含协议
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }
    
    // 验证密码
    if (password) {
      const requestPassword = url.searchParams.get('pwd');
      if (requestPassword !== password) {
        return new Response('Invalid password', { status: 401 });
      }
    }
    
    // 构建目标URL对象
    const targetUrlObj = new URL(targetUrl);
    
    // 复制原始请求的headers，移除不需要的headers
    const headers = new Headers();
    for (const [key, value] of request.headers) {
      if (!['host', 'origin', 'referer'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    }
    
    // 设置必要的headers
    headers.set('Host', targetUrlObj.host);
    headers.set('Origin', targetUrlObj.origin);
    headers.set('Referer', targetUrlObj.origin + '/');
    
    // 构建fetch选项
    const fetchOptions = {
      method: request.method,
      headers: headers,
      redirect: 'manual'
    };
    
    // 如果是POST请求，复制body
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      fetchOptions.body = request.body;
    }
    
    // 发送请求
    const response = await fetch(targetUrl, fetchOptions);
    
    // 处理响应
    const responseHeaders = new Headers(response.headers);
    
    // 移除不安全的headers
    responseHeaders.delete('content-security-policy');
    responseHeaders.delete('x-frame-options');
    responseHeaders.delete('x-content-type-options');
    
    // 设置CORS headers
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', '*');
    
    // 获取响应内容
    let body = await response.text();
    const contentType = responseHeaders.get('content-type') || '';
    
    // 如果是HTML内容，注入代理脚本
    if (contentType.includes('text/html')) {
      // 记录访问的网站
      responseHeaders.append('Set-Cookie', `${lastVisitProxyCookie}=${encodeURIComponent(targetUrl)}; path=/; max-age=2592000`);
      
      // 注入代理脚本
      const injectionScripts = `
        ${httpRequestInjection}
        ${proxyHintInjection}
        ${toolbarInjection}
        ${cookieInjectionScript}
        ${adBlockScript}
        ${resourceSnifferScript}
        ${requestModScript}
        ${imageBlockScript}
        ${notificationScript}
      `;
      
      body = body.replace(/<head[^>]*>/i, `$&<script>${injectionScripts}</script>`);
      body = body.replace(/<body[^>]*>/i, `$&`);
      
      // 更新所有相对URL为绝对URL
      body = body.replace(/(src|href|action)=["']([^"']+)["']/gi, (match, attr, value) => {
        if (value.startsWith('javascript:') || value.startsWith('data:') || value.startsWith('mailto:') || value.startsWith('#')) {
          return match;
        }
        try {
          const absoluteUrl = new URL(value, targetUrl).href;
          const proxyUrl = new URL(absoluteUrl, request.url).href;
          return `${attr}="${proxyUrl}"`;
        } catch (e) {
          return match;
        }
      });
    }
    
    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
    
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}