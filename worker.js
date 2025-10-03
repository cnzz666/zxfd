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
// 第五部分：Cookie注入功能脚本（增强版）
// 功能：提供cookie注入界面和功能，包含管理界面和网站cookie记录
// =======================================================================================

const cookieInjectionScript = `
// Cookie注入功能
let cookieManagementData = {};

function showCookieModal() {
  // 检查是否已存在弹窗
  if(document.getElementById('__COOKIE_INJECTION_MODAL__')) return;
  
  // 获取当前网站信息
  const currentSite = window.location.hostname;
  
  const modalHTML = \`
  <div id="__COOKIE_INJECTION_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:900px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🍪 Cookie注入设置</h3>
        
        <div style="display:flex;gap:10px;margin-bottom:20px;justify-content:center;">
          <button onclick="showCookieManagement()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">管理已保存的Cookie</button>
          <button onclick="showWebsiteCookies()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">查看网站Cookie</button>
        </div>
        
        <div style="margin-bottom:20px;text-align:left;">
          <label style="display:block;margin-bottom:8px;font-weight:bold;">目标网站:</label>
          <input type="text" id="targetSite" value="\${currentSite}" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.3);color:#666;">
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
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
            <div>
              <label style="display:block;margin-bottom:5px;font-size:12px;">过期时间:</label>
              <input type="datetime-local" id="cookieExpires" style="width:100%;padding:6px;border-radius:6px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
            </div>
            <div>
              <label style="display:block;margin-bottom:5px;font-size:12px;">安全设置:</label>
              <select id="cookieSecure" style="width:100%;padding:6px;border-radius:6px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
                <option value="">自动</option>
                <option value="true">Secure</option>
                <option value="false">非Secure</option>
              </select>
            </div>
          </div>
          <button onclick="addSeparateCookie()" style="padding:6px 12px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:12px;color:#2d3748;cursor:pointer;font-size:12px;">添加Cookie</button>
          <div id="cookieList" style="margin-top:10px;max-height:150px;overflow-y:auto;border:1px solid rgba(160,174,192,0.3);border-radius:8px;padding:10px;background:rgba(255,255,255,0.2);"></div>
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="saveCookieSettings()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;font-weight:bold;">保存设置</button>
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
        
        <div id="cookieManagementList" style="text-align:left;max-height:400px;overflow-y:auto;margin-bottom:20px;background:rgba(255,255,255,0.2);border-radius:8px;padding:15px;">
          <!-- 管理列表内容将通过JavaScript动态生成 -->
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;">
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

function showWebsiteCookies() {
  if(document.getElementById('__WEBSITE_COOKIES_MODAL__')) return;
  
  const currentCookies = document.cookie;
  const cookiesArray = currentCookies.split(';').map(cookie => {
    const [name, ...valueParts] = cookie.trim().split('=');
    return {
      name: name || '',
      value: valueParts.join('=') || '',
      domain: window.location.hostname,
      path: '/'
    };
  }).filter(cookie => cookie.name);
  
  const modalHTML = \`
  <div id="__WEBSITE_COOKIES_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000001;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:900px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🍪 当前网站Cookie</h3>
        
        <div style="text-align:left;margin-bottom:20px;">
          <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:15px;max-height:300px;overflow-y:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
              <thead>
                <tr style="background:rgba(160,174,192,0.2);">
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);">名称</th>
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);">值</th>
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);">操作</th>
                </tr>
              </thead>
              <tbody id="websiteCookiesTableBody">
                \${cookiesArray.length > 0 ? cookiesArray.map(cookie => \`
                  <tr>
                    <td style="padding:8px;border-bottom:1px solid rgba(160,174,192,0.1);">\${cookie.name}</td>
                    <td style="padding:8px;border-bottom:1px solid rgba(160,174,192,0.1);max-width:200px;overflow:hidden;text-overflow:ellipsis;" title="\${cookie.value}">\${cookie.value}</td>
                    <td style="padding:8px;border-bottom:1px solid rgba(160,174,192,0.1);">
                      <button onclick="copyCookieValue('\${cookie.name}')" style="padding:4px 8px;background:rgba(160,174,192,0.3);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;">复制</button>
                    </td>
                  </tr>
                \`).join('') : \`
                  <tr><td colspan="3" style="padding:20px;text-align:center;color:#666;">暂无Cookie</td></tr>
                \`}
              </tbody>
            </table>
          </div>
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;">
          <button onclick="closeWebsiteCookies()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭</button>
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
  }, 100);
}

function copyCookieValue(name) {
  const value = document.cookie.split('; ').find(row => row.startsWith(name + '='));
  if (value) {
    const cookieValue = value.split('=')[1];
    navigator.clipboard.writeText(cookieValue).then(() => {
      showNotification('Cookie值已复制到剪贴板', 'success');
    });
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
  const expires = document.getElementById('cookieExpires').value;
  const secure = document.getElementById('cookieSecure').value;
  
  if(!name || !value) {
    showNotification('请填写Cookie名称和值', 'error');
    return;
  }
  
  const cookie = { 
    name, 
    value, 
    domain: domain || window.location.hostname,
    path,
    expires: expires || '',
    secure: secure === '' ? window.location.protocol === 'https:' : secure === 'true'
  };
  
  separateCookies.push(cookie);
  updateCookieList();
  
  // 清空输入框
  document.getElementById('cookieName').value = '';
  document.getElementById('cookieValue').value = '';
  document.getElementById('cookieDomain').value = '';
  document.getElementById('cookiePath').value = '/';
  document.getElementById('cookieExpires').value = '';
  document.getElementById('cookieSecure').value = '';
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
        <small style="color:#666;">\${cookie.domain} | \${cookie.path} | \${cookie.expires ? '过期: ' + cookie.expires : '会话Cookie'} | \${cookie.secure ? 'Secure' : '非Secure'}</small>
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
  const targetSite = document.getElementById('targetSite').value.trim();
  const inputType = document.getElementById('inputType').value;
  
  if (!targetSite) {
    showNotification('请填写目标网站', 'error');
    return;
  }
  
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
            domain: targetSite,
            path: '/',
            expires: '',
            secure: window.location.protocol === 'https:'
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
    
    showNotification('Cookie设置已保存并注入！', 'success');
    
    // 测试注入是否成功
    setTimeout(testCookieInjection, 1000);
  } catch(e) {
    showNotification('保存失败: ' + e.message, 'error');
  }
}

function injectCookies(cookies) {
  cookies.forEach(cookie => {
    let cookieStr = \`\${cookie.name}=\${cookie.value}\`;
    if(cookie.domain) cookieStr += \`; domain=\${cookie.domain}\`;
    if(cookie.path) cookieStr += \`; path=\${cookie.path}\`;
    if(cookie.expires) {
      const expiryDate = new Date(cookie.expires);
      cookieStr += \`; expires=\${expiryDate.toUTCString()}\`;
    }
    if(cookie.secure) cookieStr += '; secure';
    cookieStr += '; samesite=lax';
    
    document.cookie = cookieStr;
  });
}

function testCookieInjection() {
  const targetSite = document.getElementById('targetSite').value.trim();
  const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
  const settings = allSettings[targetSite];
  
  if (!settings || !settings.cookies) {
    showNotification('未找到保存的Cookie设置', 'error');
    return;
  }
  
  let allInjected = true;
  const missingCookies = [];
  
  settings.cookies.forEach(expectedCookie => {
    const found = document.cookie.split('; ').find(row => row.startsWith(expectedCookie.name + '='));
    if (!found) {
      allInjected = false;
      missingCookies.push(expectedCookie.name);
    }
  });
  
  if (allInjected) {
    showNotification('✓ 所有Cookie注入成功！', 'success');
  } else {
    showNotification('✗ 部分Cookie注入失败: ' + missingCookies.join(', '), 'error');
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

function loadCookieManagementList() {
  const listContainer = document.getElementById('cookieManagementList');
  listContainer.innerHTML = '';
  
  try {
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    
    if (Object.keys(allSettings).length === 0) {
      listContainer.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">暂无保存的Cookie设置</div>';
      return;
    }
    
    Object.entries(allSettings).forEach(([site, settings]) => {
      const item = document.createElement('div');
      item.style.padding = '15px';
      item.style.marginBottom = '10px';
      item.style.background = 'rgba(255,255,255,0.2)';
      item.style.borderRadius = '10px';
      item.style.border = '1px solid rgba(160,174,192,0.3)';
      
      item.innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="flex:1;">
            <strong style="display:block;margin-bottom:5px;color:#2c5282;">\${site}</strong>
            <div style="font-size:12px;color:#666;margin-bottom:8px;">
              共 \${settings.cookies ? settings.cookies.length : 0} 个Cookie | 
              最后修改: \${new Date(settings.lastModified).toLocaleString()}
            </div>
            <div style="font-size:11px;color:#888;max-height:60px;overflow-y:auto;">
              \${settings.cookies ? settings.cookies.map(c => \`\${c.name}=\${c.value}\`).join('; ') : '无Cookie'}
            </div>
          </div>
          <div style="display:flex;gap:5px;flex-direction:column;">
            <button onclick="editCookieSettings('\${site}')" style="padding:5px 10px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:6px;color:#2d3748;cursor:pointer;font-size:11px;">编辑</button>
            <button onclick="applyCookieSettings('\${site}')" style="padding:5px 10px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:6px;color:#2d3748;cursor:pointer;font-size:11px;">应用</button>
            <button onclick="deleteCookieSettings('\${site}')" style="padding:5px 10px;background:#c53030;border:none;border-radius:6px;color:white;cursor:pointer;font-size:11px;">删除</button>
          </div>
        </div>
      \`;
      
      listContainer.appendChild(item);
    });
  } catch(e) {
    listContainer.innerHTML = '<div style="text-align:center;color:#c53030;padding:20px;">加载失败: ' + e.message + '</div>';
  }
}

function editCookieSettings(site) {
  closeCookieManagement();
  showCookieModal();
  
  setTimeout(() => {
    document.getElementById('targetSite').value = site;
    loadCookieSettings();
  }, 100);
}

function applyCookieSettings(site) {
  try {
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    const settings = allSettings[site];
    
    if (settings && settings.cookies) {
      injectCookies(settings.cookies);
      showNotification('已应用 ' + site + ' 的Cookie设置', 'success');
      
      // 测试注入
      setTimeout(() => {
        let allInjected = true;
        const missingCookies = [];
        
        settings.cookies.forEach(expectedCookie => {
          const found = document.cookie.split('; ').find(row => row.startsWith(expectedCookie.name + '='));
          if (!found) {
            allInjected = false;
            missingCookies.push(expectedCookie.name);
          }
        });
        
        if (allInjected) {
          showNotification('✓ 所有Cookie注入成功！', 'success');
        } else {
          showNotification('✗ 部分Cookie注入失败: ' + missingCookies.join(', '), 'error');
        }
      }, 1000);
    }
  } catch(e) {
    showNotification('应用失败: ' + e.message, 'error');
  }
}

function deleteCookieSettings(site) {
  if (confirm('确定删除 ' + site + ' 的Cookie设置吗？')) {
    try {
      const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
      delete allSettings[site];
      localStorage.setItem('${cookieInjectionDataName}', JSON.stringify(allSettings));
      loadCookieManagementList();
      showNotification('已删除 ' + site + ' 的Cookie设置', 'success');
    } catch(e) {
      showNotification('删除失败: ' + e.message, 'error');
    }
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

function closeCookieManagement() {
  const modal = document.getElementById('__COOKIE_MANAGEMENT_MODAL__');
  if(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

function closeWebsiteCookies() {
  const modal = document.getElementById('__WEBSITE_COOKIES_MODAL__');
  if(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// 通知功能
function showNotification(message, type = 'info') {
  // 移除现有通知
  const existingNotification = document.getElementById('__PROXY_NOTIFICATION__');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  const backgroundColor = type === 'success' ? 'rgba(72,187,120,0.9)' : 
                         type === 'error' ? 'rgba(245,101,101,0.9)' : 
                         'rgba(66,153,225,0.9)';
  
  const notification = document.createElement('div');
  notification.id = '__PROXY_NOTIFICATION__';
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.background = backgroundColor;
  notification.style.color = 'white';
  notification.style.padding = '15px 20px';
  notification.style.borderRadius = '8px';
  notification.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
  notification.style.zIndex = '1000002';
  notification.style.maxWidth = '300px';
  notification.style.wordWrap = 'break-word';
  notification.style.opacity = '0';
  notification.style.transform = 'translateX(100%)';
  notification.style.transition = 'all 0.3s ease';
  
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
        notification.remove();
      }
    }, 300);
  }, 3000);
}
`;

// =======================================================================================
// 第六部分：广告拦截功能脚本（增强版）
// 功能：实现广告拦截和元素标记，支持订阅规则
// =======================================================================================

const adBlockScript = `
// 广告拦截功能
let adBlockEnabled = false;
let adBlockRules = [];
let elementPickerActive = false;
let selectedElements = new Set();

// 广告订阅规则
const adBlockSubscriptions = {
  'Anti-Adblock': 'https://easylist-downloads.adblockplus.org/antiadblockfilters.txt',
  'EasyPrivacy': 'https://easylist-downloads.adblockplus.org/easyprivacy.txt',
  'CJX Annoyance': 'https://fastly.jsdelivr.net/gh/cjx82630/cjxlist/cjx-annoyance.txt',
  'EasyList China': 'https://easylist-downloads.adblockplus.org/easylistchina.txt'
};

function showAdBlockModal() {
  if(document.getElementById('__ADBLOCK_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__ADBLOCK_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:1000px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🚫 广告拦截设置</h3>
        
        <div style="display:flex;gap:15px;margin-bottom:20px;justify-content:center;flex-wrap:wrap;">
          <button id="toggleAdBlock" onclick="toggleAdBlock()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">启用广告拦截</button>
          <button onclick="startElementPicker()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">标记广告元素</button>
          <button onclick="loadDefaultRules()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">加载默认规则</button>
          <button onclick="showSubscriptionPanel()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">订阅规则</button>
          <button onclick="testAdBlock()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">检查拦截</button>
        </div>
        
        <div style="text-align:left;margin-bottom:20px;">
          <label style="display:block;margin-bottom:8px;font-weight:bold;">自定义规则 (每行一条，支持Adblock Plus语法):</label>
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
  }, 100);
}

function showSubscriptionPanel() {
  if(document.getElementById('__SUBSCRIPTION_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__SUBSCRIPTION_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000001;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:800px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">📋 广告拦截订阅规则</h3>
        
        <div style="text-align:left;margin-bottom:20px;">
          <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:15px;margin-bottom:15px;">
            <h4 style="margin-bottom:10px;color:#2c5282;">推荐订阅:</h4>
            <div id="subscriptionList" style="display:grid;grid-template-columns:1fr;gap:10px;">
              \${Object.entries(adBlockSubscriptions).map(([name, url]) => \`
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:rgba(255,255,255,0.2);border-radius:6px;">
                  <div>
                    <strong>\${name}</strong>
                    <div style="font-size:12px;color:#666;word-break:break-all;">\${url}</div>
                  </div>
                  <button onclick="addSubscription('\${name}', '\${url}')" style="padding:5px 10px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:6px;color:#2d3748;cursor:pointer;font-size:12px;">添加</button>
                </div>
              \`).join('')}
            </div>
          </div>
          
          <label style="display:block;margin-bottom:8px;font-weight:bold;">自定义订阅链接:</label>
          <div style="display:flex;gap:10px;margin-bottom:10px;">
            <input type="text" id="customSubscriptionUrl" placeholder="输入订阅链接" style="flex:1;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
            <input type="text" id="customSubscriptionName" placeholder="订阅名称" style="width:120px;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
          </div>
          <button onclick="addCustomSubscription()" style="padding:8px 16px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:12px;color:#2d3748;cursor:pointer;">添加自定义订阅</button>
        </div>
        
        <div style="text-align:left;margin-bottom:20px;">
          <h4 style="margin-bottom:10px;color:#2c5282;">已启用的订阅:</h4>
          <div id="activeSubscriptions" style="max-height:200px;overflow-y:auto;background:rgba(255,255,255,0.2);border-radius:8px;padding:10px;">
            <!-- 动态生成已启用订阅列表 -->
          </div>
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="updateAllSubscriptions()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;font-weight:bold;">更新所有订阅</button>
          <button onclick="closeSubscriptionPanel()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭</button>
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
    
    loadActiveSubscriptions();
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

function startElementPicker() {
  elementPickerActive = true;
  closeAdBlockModal();
  
  // 添加元素选择模式样式
  const style = document.createElement('style');
  style.id = '__ELEMENT_PICKER_STYLE__';
  style.textContent = \`
    * { cursor: crosshair !important; }
    .__adblock_hover__ { outline: 2px solid #c53030 !important; background: rgba(197, 48, 48, 0.1) !important; }
    .__adblock_selected__ { outline: 3px solid #c53030 !important; background: rgba(197, 48, 48, 0.2) !important; }
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
    <button onclick="confirmBlockElements()" style="padding:8px 16px;background:#c53030;border:none;border-radius:15px;color:white;cursor:pointer;">确认拦截</button>
    <button onclick="clearSelectedElements()" style="padding:8px 16px;background:rgba(160,174,192,0.3);border:none;border-radius:15px;color:#2d3748;cursor:pointer;">清空选择</button>
    <button onclick="cancelElementPicker()" style="padding:8px 16px;background:rgba(160,174,192,0.3);border:none;border-radius:15px;color:#2d3748;cursor:pointer;">取消</button>
  \`;
  
  document.body.appendChild(panel);
  
  // 添加鼠标移动事件监听
  document.addEventListener('mouseover', handleElementHover, true);
  document.addEventListener('click', handleElementClick, true);
}

function handleElementHover(e) {
  if(!elementPickerActive) return;
  
  // 跳过工具栏元素
  if (e.target.closest('#__PROXY_TOOLBAR__') || e.target.closest('#__PROXY_TOOLS_CONTAINER__')) {
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
  if (!selectedElements.has(e.target)) {
    e.target.classList.add('__adblock_hover__');
  }
}

function handleElementClick(e) {
  if(!elementPickerActive) return;
  
  // 跳过工具栏元素
  if (e.target.closest('#__PROXY_TOOLBAR__') || e.target.closest('#__PROXY_TOOLS_CONTAINER__')) {
    return;
  }
  
  e.stopPropagation();
  e.preventDefault();
  
  const element = e.target;
  
  if (selectedElements.has(element)) {
    // 如果已选择，则取消选择
    selectedElements.delete(element);
    element.classList.remove('__adblock_selected__');
    if (!element.classList.contains('__adblock_hover__')) {
      element.classList.add('__adblock_hover__');
    }
  } else {
    // 如果未选择，则选择
    selectedElements.add(element);
    element.classList.remove('__adblock_hover__');
    element.classList.add('__adblock_selected__');
  }
  
  updateSelectedCount();
}

function updateSelectedCount() {
  const countElement = document.getElementById('selectedCount');
  if (countElement) {
    countElement.textContent = selectedElements.size;
  }
}

function clearSelectedElements() {
  selectedElements.forEach(element => {
    element.classList.remove('__adblock_selected__');
    if (!element.classList.contains('__adblock_hover__')) {
      element.classList.add('__adblock_hover__');
    }
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
  let currentRules = textarea.value;
  
  selectedElements.forEach(element => {
    let selector = generateCSSSelector(element);
    if(selector && !currentRules.includes(selector)) {
      const newRule = \`##\${selector}\`;
      currentRules += (currentRules ? '\\n' : '') + newRule;
    }
  });
  
  textarea.value = currentRules;
  
  // 保存并应用
  saveAdBlockRules();
  showNotification('已添加 ' + selectedElements.size + ' 条拦截规则', 'success');
  
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

function addSubscription(name, url) {
  const subscriptions = JSON.parse(localStorage.getItem('adBlockSubscriptions') || '{}');
  subscriptions[name] = {
    url: url,
    enabled: true,
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem('adBlockSubscriptions', JSON.stringify(subscriptions));
  updateSubscriptionRules(name, url);
  loadActiveSubscriptions();
  showNotification('已添加订阅: ' + name, 'success');
}

function addCustomSubscription() {
  const url = document.getElementById('customSubscriptionUrl').value.trim();
  const name = document.getElementById('customSubscriptionName').value.trim() || '自定义订阅';
  
  if (!url) {
    showNotification('请输入订阅链接', 'error');
    return;
  }
  
  addSubscription(name, url);
  
  // 清空输入框
  document.getElementById('customSubscriptionUrl').value = '';
  document.getElementById('customSubscriptionName').value = '';
}

async function updateSubscriptionRules(name, url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const rules = text.split('\\n')
      .filter(rule => rule.trim() && !rule.startsWith('!') && !rule.startsWith('['))
      .map(rule => rule.trim());
    
    const subscriptions = JSON.parse(localStorage.getItem('adBlockSubscriptions') || '{}');
    if (subscriptions[name]) {
      subscriptions[name].rules = rules;
      subscriptions[name].lastUpdated = new Date().toISOString();
      localStorage.setItem('adBlockSubscriptions', JSON.stringify(subscriptions));
    }
    
    // 更新广告拦截规则
    updateAdBlockRulesFromSubscriptions();
    showNotification('订阅更新成功: ' + name, 'success');
  } catch(e) {
    showNotification('更新订阅失败: ' + name, 'error');
    console.error('更新订阅失败:', e);
  }
}

async function updateAllSubscriptions() {
  const subscriptions = JSON.parse(localStorage.getItem('adBlockSubscriptions') || '{}');
  const enabledSubscriptions = Object.entries(subscriptions).filter(([name, sub]) => sub.enabled);
  
  if (enabledSubscriptions.length === 0) {
    showNotification('没有启用的订阅', 'info');
    return;
  }
  
  showNotification('正在更新 ' + enabledSubscriptions.length + ' 个订阅...', 'info');
  
  for (const [name, subscription] of enabledSubscriptions) {
    await updateSubscriptionRules(name, subscription.url);
  }
  
  showNotification('所有订阅更新完成', 'success');
}

function loadActiveSubscriptions() {
  const container = document.getElementById('activeSubscriptions');
  const subscriptions = JSON.parse(localStorage.getItem('adBlockSubscriptions') || '{}');
  
  if (Object.keys(subscriptions).length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">暂无启用的订阅</div>';
    return;
  }
  
  container.innerHTML = Object.entries(subscriptions).map(([name, sub]) => \`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;margin-bottom:8px;background:rgba(255,255,255,0.2);border-radius:6px;">
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:8px;">
          <strong>\${name}</strong>
          <span style="font-size:10px;padding:2px 6px;background:\${sub.enabled ? '#48bb78' : '#e53e3e'};color:white;border-radius:10px;">\${sub.enabled ? '启用' : '禁用'}</span>
        </div>
        <div style="font-size:11px;color:#666;">
          \${sub.rules ? sub.rules.length + ' 条规则' : '无规则'} | 
          最后更新: \${sub.lastUpdated ? new Date(sub.lastUpdated).toLocaleDateString() : '从未更新'}
        </div>
      </div>
      <div style="display:flex;gap:5px;">
        <button onclick="toggleSubscription('\${name}')" style="padding:4px 8px;background:\${sub.enabled ? '#e53e3e' : '#48bb78'};border:none;border-radius:4px;color:white;cursor:pointer;font-size:10px;">\${sub.enabled ? '禁用' : '启用'}</button>
        <button onclick="updateSubscriptionRules('\${name}', '\${sub.url}')" style="padding:4px 8px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;">更新</button>
        <button onclick="removeSubscription('\${name}')" style="padding:4px 8px;background:#c53030;border:none;border-radius:4px;color:white;cursor:pointer;font-size:10px;">删除</button>
      </div>
    </div>
  \`).join('');
}

function toggleSubscription(name) {
  const subscriptions = JSON.parse(localStorage.getItem('adBlockSubscriptions') || '{}');
  if (subscriptions[name]) {
    subscriptions[name].enabled = !subscriptions[name].enabled;
    localStorage.setItem('adBlockSubscriptions', JSON.stringify(subscriptions));
    loadActiveSubscriptions();
    updateAdBlockRulesFromSubscriptions();
    showNotification(subscriptions[name].enabled ? '已启用订阅: ' + name : '已禁用订阅: ' + name, 'success');
  }
}

function removeSubscription(name) {
  if (confirm('确定删除订阅 ' + name + ' 吗？')) {
    const subscriptions = JSON.parse(localStorage.getItem('adBlockSubscriptions') || '{}');
    delete subscriptions[name];
    localStorage.setItem('adBlockSubscriptions', JSON.stringify(subscriptions));
    loadActiveSubscriptions();
    updateAdBlockRulesFromSubscriptions();
    showNotification('已删除订阅: ' + name, 'success');
  }
}

function updateAdBlockRulesFromSubscriptions() {
  const subscriptions = JSON.parse(localStorage.getItem('adBlockSubscriptions') || '{}');
  let subscriptionRules = [];
  
  Object.values(subscriptions).forEach(sub => {
    if (sub.enabled && sub.rules) {
      subscriptionRules = subscriptionRules.concat(sub.rules);
    }
  });
  
  // 合并自定义规则和订阅规则
  const customRules = document.getElementById('customRules') ? 
    document.getElementById('customRules').value.split('\\n').filter(rule => rule.trim()) : [];
  
  adBlockRules = [...new Set([...customRules, ...subscriptionRules])];
  
  if (adBlockEnabled) {
    applyAdBlockRules();
  }
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
}

function saveAdBlockRules() {
  const customRules = document.getElementById('customRules').value;
  const rules = customRules.split('\\n').filter(rule => rule.trim());
  
  adBlockRules = rules;
  
  const settings = {
    enabled: adBlockEnabled,
    rules: adBlockRules,
    lastModified: new Date().toISOString()
  };
  
  try {
    localStorage.setItem('${adBlockDataName}', JSON.stringify(settings));
    
    // 更新订阅规则
    updateAdBlockRulesFromSubscriptions();
    
    if(adBlockEnabled) {
      applyAdBlockRules();
    }
    
    showNotification('广告规则已保存！', 'success');
    testAdBlock();
  } catch(e) {
    showNotification('保存失败: ' + e.message, 'error');
  }
}

function applyAdBlockRules() {
  // 移除之前添加的样式
  const existingStyle = document.getElementById('__ADBLOCK_STYLE__');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // 创建新的样式
  const style = document.createElement('style');
  style.id = '__ADBLOCK_STYLE__';
  
  // 过滤有效的CSS选择器规则
  const cssRules = adBlockRules.filter(rule => rule.startsWith('##') && rule.length > 2);
  const elementHidingRules = cssRules.map(rule => {
    const selector = rule.substring(2);
    try {
      // 测试选择器是否有效
      document.querySelector(selector);
      return selector + ' { display: none !important; }';
    } catch (e) {
      return null;
    }
  }).filter(rule => rule !== null);
  
  style.textContent = elementHidingRules.join('\\n');
  document.head.appendChild(style);
  
  // 处理URL阻塞规则
  const urlRules = adBlockRules.filter(rule => rule.startsWith('||') || rule.startsWith('|') || rule.includes('^'));
  console.log('应用广告拦截URL规则:', urlRules);
  
  showNotification('已应用 ' + elementHidingRules.length + ' 条元素隐藏规则', 'success');
}

function removeAdBlockRules() {
  const style = document.getElementById('__ADBLOCK_STYLE__');
  if (style) {
    style.remove();
  }
}

function testAdBlock() {
  // 测试常见的广告元素
  const testSelectors = [
    '.ad', '.ads', '.advertisement', '[class*="ad-"]', 
    '[id*="ad-"]', '.banner', '.popup', '.modal'
  ];
  
  let blockedCount = 0;
  let totalCount = 0;
  
  testSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      totalCount += elements.length;
      elements.forEach(element => {
        if (window.getComputedStyle(element).display === 'none') {
          blockedCount++;
        }
      });
    } catch (e) {
      // 忽略无效选择器
    }
  });
  
  if (totalCount === 0) {
    showNotification('未检测到常见广告元素', 'info');
  } else {
    const percentage = Math.round((blockedCount / totalCount) * 100);
    showNotification(\`广告拦截测试: 拦截了 \${blockedCount}/\${totalCount} 个元素 (\${percentage}%)\`, 'success');
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
    
    // 加载订阅设置
    updateAdBlockRulesFromSubscriptions();
  } catch(e) {
    console.log('加载广告拦截设置失败:', e);
  }
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

function closeSubscriptionPanel() {
  const modal = document.getElementById('__SUBSCRIPTION_MODAL__');
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
// 第七部分：资源嗅探功能脚本（增强版）
// 功能：拦截和显示网络请求，支持请求修改和重发
// =======================================================================================

const resourceSnifferScript = `
// 资源嗅探功能
let snifferEnabled = false;
let capturedRequests = [];
let requestInterceptor = null;
let originalFetch = window.fetch;
let originalXHR = window.XMLHttpRequest;
let autoStartSniffer = false;

// 请求修改功能
let requestModifications = [];
let responseModifications = [];

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
          <button onclick="showSnifferSettings()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">设置</button>
          <button onclick="testSniffer()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">检查功能</button>
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

function showSnifferSettings() {
  if(document.getElementById('__SNIFFER_SETTINGS_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__SNIFFER_SETTINGS_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000001;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🔧 嗅探设置</h3>
        
        <div style="text-align:left;margin-bottom:20px;">
          <label style="display:flex;align-items:center;gap:10px;margin-bottom:15px;cursor:pointer;">
            <input type="checkbox" id="autoStartSniffer" \${autoStartSniffer ? 'checked' : ''}>
            <span>页面加载时自动启动嗅探</span>
          </label>
          
          <label style="display:block;margin-bottom:8px;font-weight:bold;">过滤规则 (每行一个正则表达式):</label>
          <textarea id="snifferFilters" placeholder="例如: .*\\\\.google\\\\.com.*
.*ads.*
.*analytics.*" style="width:100%;height:150px;padding:12px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);resize:vertical;font-family:monospace;"></textarea>
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="saveSnifferSettings()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;font-weight:bold;">保存设置</button>
          <button onclick="closeSnifferSettings()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭</button>
        </div>
      </div>
    </div>
  </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  setTimeout(() => {
    const modal = document.getElementById('__SNIFFER_SETTINGS_MODAL__');
    const content = modal.querySelector('div > div');
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
    
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

function startSniffer() {
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
      requestBody: args[1]?.body || null,
      response: null,
      responseHeaders: null
    };
    
    capturedRequests.unshift(requestInfo);
    updateSnifferTable();
    
    // 应用请求修改
    let modifiedArgs = [...args];
    const modification = findRequestModification(url, method);
    if (modification) {
      if (modification.modifiedHeaders) {
        if (!modifiedArgs[1]) modifiedArgs[1] = {};
        modifiedArgs[1].headers = {...modifiedArgs[1].headers, ...modification.modifiedHeaders};
      }
      if (modification.modifiedBody) {
        if (!modifiedArgs[1]) modifiedArgs[1] = {};
        modifiedArgs[1].body = modification.modifiedBody;
      }
    }
    
    return originalFetch.apply(this, modifiedArgs).then(response => {
      requestInfo.status = response.status;
      requestInfo.size = formatBytes(response.headers.get('content-length') || 0);
      requestInfo.responseHeaders = Object.fromEntries(response.headers.entries());
      
      // 克隆响应以读取内容
      return response.clone().text().then(text => {
        requestInfo.response = text;
        
        // 应用响应修改
        const responseModification = findResponseModification(url, method);
        if (responseModification) {
          const modifiedResponse = new Response(responseModification.modifiedBody || text, {
            status: responseModification.modifiedStatus || response.status,
            statusText: response.statusText,
            headers: {...requestInfo.responseHeaders, ...responseModification.modifiedHeaders}
          });
          updateSnifferTable();
          return modifiedResponse;
        }
        
        updateSnifferTable();
        return response;
      });
    }).catch(error => {
      requestInfo.status = 'error';
      requestInfo.size = '0 B';
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
      id: Date.now() + Math.random(),
      method: method,
      url: url,
      type: getResourceType(url),
      timestamp: new Date().toLocaleTimeString(),
      status: 'pending',
      size: '0 B',
      headers: {},
      requestBody: null,
      response: null,
      responseHeaders: null
    };
    
    capturedRequests.unshift(this._snifferInfo);
    updateSnifferTable();
    
    this._requestHeaders = {};
    this.setRequestHeader = function(name, value) {
      this._requestHeaders[name] = value;
      return originalSetRequestHeader.apply(this, arguments);
    };
    
    return originalOpen.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.send = function(body) {
    if (this._snifferInfo) {
      this._snifferInfo.requestBody = body;
      this._snifferInfo.headers = this._requestHeaders || {};
    }
    
    this.addEventListener('load', function() {
      if (this._snifferInfo) {
        this._snifferInfo.status = this.status;
        this._snifferInfo.size = formatBytes(this.response ? new Blob([this.response]).size : 0);
        this._snifferInfo.responseHeaders = {};
        if (this.getAllResponseHeaders) {
          const headers = this.getAllResponseHeaders();
          if (headers) {
            headers.split('\\r\\n').forEach(line => {
              const [name, value] = line.split(': ');
              if (name && value) {
                this._snifferInfo.responseHeaders[name] = value;
              }
            });
          }
        }
        this._snifferInfo.response = this.responseText;
        updateSnifferTable();
      }
    });
    
    this.addEventListener('error', function() {
      if (this._snifferInfo) {
        this._snifferInfo.status = 'error';
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

function findRequestModification(url, method) {
  return requestModifications.find(mod => 
    new RegExp(mod.urlPattern).test(url) && 
    (!mod.method || mod.method === method)
  );
}

function findResponseModification(url, method) {
  return responseModifications.find(mod => 
    new RegExp(mod.urlPattern).test(url) && 
    (!mod.method || mod.method === method)
  );
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
  bytes = parseInt(bytes);
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
  
  tbody.innerHTML = capturedRequests.slice(0, 100).map(req => \`
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
        <button onclick="modifyRequest('\${req.id}')" style="padding:4px 8px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;">修改</button>
        <button onclick="replayRequest('\${req.id}')" style="padding:4px 8px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;">重发</button>
        <button onclick="blockRequest('\${req.id}')" style="padding:4px 8px;background:#c53030;border:none;border-radius:4px;color:white;cursor:pointer;font-size:10px;">拦截</button>
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
    const modalHTML = \`
    <div id="__REQUEST_DETAIL_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000002;user-select:none;">
      <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:90%;width:1000px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);">
        <div style="text-align:center;color:#2d3748;">
          <h3 style="color:#2c5282;margin-bottom:20px;">🔍 请求详情</h3>
          
          <div style="text-align:left;margin-bottom:20px;">
            <h4 style="color:#2c5282;margin-bottom:10px;">基本信息</h4>
            <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:15px;font-size:12px;margin-bottom:15px;">
              <div><strong>URL:</strong> \${request.url}</div>
              <div><strong>方法:</strong> \${request.method}</div>
              <div><strong>类型:</strong> \${request.type}</div>
              <div><strong>状态:</strong> \${request.status}</div>
              <div><strong>大小:</strong> \${request.size}</div>
              <div><strong>时间:</strong> \${request.timestamp}</div>
            </div>
            
            <h4 style="color:#2c5282;margin-bottom:10px;">请求头</h4>
            <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:15px;font-size:12px;margin-bottom:15px;max-height:150px;overflow-y:auto;">
              \${Object.entries(request.headers).map(([key, value]) => \`<div><strong>\${key}:</strong> \${value}</div>\`).join('') || '无请求头'}
            </div>
            
            \${request.requestBody ? \`
              <h4 style="color:#2c5282;margin-bottom:10px;">请求体</h4>
              <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:15px;font-size:12px;margin-bottom:15px;max-height:200px;overflow-y:auto;">
                <pre style="margin:0;white-space:pre-wrap;">\${typeof request.requestBody === 'string' ? request.requestBody : JSON.stringify(request.requestBody, null, 2)}</pre>
              </div>
            \` : ''}
            
            \${request.responseHeaders ? \`
              <h4 style="color:#2c5282;margin-bottom:10px;">响应头</h4>
              <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:15px;font-size:12px;margin-bottom:15px;max-height:150px;overflow-y:auto;">
                \${Object.entries(request.responseHeaders).map(([key, value]) => \`<div><strong>\${key}:</strong> \${value}</div>\`).join('')}
              </div>
            \` : ''}
            
            \${request.response ? \`
              <h4 style="color:#2c5282;margin-bottom:10px;">响应体</h4>
              <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:15px;font-size:12px;margin-bottom:15px;max-height:300px;overflow-y:auto;">
                <pre style="margin:0;white-space:pre-wrap;">\${request.response}</pre>
              </div>
            \` : ''}
          </div>
          
          <button onclick="closeRequestDetail()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭</button>
        </div>
      </div>
    </div>
    \`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
}

function modifyRequest(id) {
  const request = capturedRequests.find(req => req.id === id);
  if(request) {
    showNotification('请求修改功能开发中...', 'info');
    // 这里可以实现请求修改界面
  }
}

function replayRequest(id) {
  const request = capturedRequests.find(req => req.id === id);
  if(request) {
    const options = {
      method: request.method,
      headers: request.headers
    };
    
    if (request.requestBody) {
      options.body = request.requestBody;
    }
    
    fetch(request.url, options)
      .then(response => {
        showNotification('请求重发成功', 'success');
        // 重新开始嗅探以捕获新请求
        if (snifferEnabled) {
          stopSniffer();
          startSniffer();
        }
      })
      .catch(error => {
        showNotification('请求重发失败: ' + error.message, 'error');
      });
  }
}

function blockRequest(id) {
  const request = capturedRequests.find(req => req.id === id);
  if(request) {
    // 添加URL到拦截列表
    const blockedPattern = request.url.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&');
    requestModifications.push({
      urlPattern: blockedPattern,
      method: request.method,
      action: 'block'
    });
    
    showNotification('已添加请求拦截规则', 'success');
  }
}

function closeRequestDetail() {
  const modal = document.getElementById('__REQUEST_DETAIL_MODAL__');
  if(modal) {
    modal.remove();
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
  showNotification('数据已导出', 'success');
}

function testSniffer() {
  // 发送测试请求
  const testUrl = 'https://httpbin.org/get';
  fetch(testUrl)
    .then(() => {
      // 检查是否捕获到请求
      const found = capturedRequests.find(req => req.url.includes('httpbin.org'));
      if (found) {
        showNotification('✓ 资源嗅探功能正常', 'success');
      } else {
        showNotification('✗ 未捕获到测试请求', 'error');
      }
    })
    .catch(() => {
      showNotification('测试请求发送失败', 'error');
    });
}

function saveSnifferSettings() {
  const autoStart = document.getElementById('autoStartSniffer').checked;
  const filters = document.getElementById('snifferFilters').value.split('\\n').filter(f => f.trim());
  
  const settings = {
    enabled: snifferEnabled,
    autoStart: autoStart,
    filters: filters
  };
  
  try {
    localStorage.setItem('${resourceSnifferDataName}', JSON.stringify(settings));
    autoStartSniffer = autoStart;
    showNotification('嗅探设置已保存', 'success');
  } catch(e) {
    showNotification('保存失败: ' + e.message, 'error');
  }
}

function loadSnifferSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem('${resourceSnifferDataName}') || '{}');
    snifferEnabled = settings.enabled || false;
    autoStartSniffer = settings.autoStart || false;
    
    if(document.getElementById('autoStartSniffer')) {
      document.getElementById('autoStartSniffer').checked = autoStartSniffer;
    }
    
    if(document.getElementById('snifferFilters') && settings.filters) {
      document.getElementById('snifferFilters').value = settings.filters.join('\\n');
    }
    
    // 如果设置自动启动且当前未启动，则启动嗅探
    if(autoStartSniffer && !snifferEnabled) {
      setTimeout(() => {
        toggleSniffer();
      }, 1000);
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

function closeSnifferSettings() {
  const modal = document.getElementById('__SNIFFER_SETTINGS_MODAL__');
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
// 第八部分：请求修改功能脚本（增强版）
// 功能：修改请求头和浏览器标识，支持实际生效
// =======================================================================================

const requestModScript = `
// 请求修改功能
let requestModEnabled = false;
let customHeaders = [];
let userAgents = {
  'chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'firefox': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'safari': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'edge': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
  'iphone': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  'android': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
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
const originalXHR = window.XMLHttpRequest;
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
          <button onclick="testRequestMod()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">检查功能</button>
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
    customHeaders: customHeaders,
    lastModified: new Date().toISOString()
  };
  
  try {
    localStorage.setItem('${requestModDataName}', JSON.stringify(settings));
    
    if(requestModEnabled) {
      applyRequestModifications();
    }
    
    showNotification('请求修改设置已保存！', 'success');
    testRequestMod();
  } catch(e) {
    showNotification('保存失败: ' + e.message, 'error');
  }
}

function applyRequestModifications() {
  // 拦截fetch请求
  window.fetch = function(...args) {
    const options = args[1] || {};
    
    // 应用修改
    if (requestModEnabled) {
      const settings = JSON.parse(localStorage.getItem('${requestModDataName}') || '{}');
      
      // 设置User-Agent
      if (settings.userAgent) {
        if (!options.headers) options.headers = {};
        if (options.headers instanceof Headers) {
          options.headers.set('User-Agent', settings.userAgent);
        } else {
          options.headers['User-Agent'] = settings.userAgent;
        }
      }
      
      // 设置Accept-Language
      if (settings.acceptLanguage) {
        if (!options.headers) options.headers = {};
        if (options.headers instanceof Headers) {
          options.headers.set('Accept-Language', settings.acceptLanguage);
        } else {
          options.headers['Accept-Language'] = settings.acceptLanguage;
        }
      }
      
      // 添加自定义Header
      if (settings.customHeaders) {
        if (!options.headers) options.headers = {};
        settings.customHeaders.forEach(header => {
          if (options.headers instanceof Headers) {
            options.headers.set(header.name, header.value);
          } else {
            options.headers[header.name] = header.value;
          }
        });
      }
    }
    
    return originalFetch.apply(this, [args[0], options]);
  };
  
  // 拦截XMLHttpRequest
  XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
    if (requestModEnabled) {
      const settings = JSON.parse(localStorage.getItem('${requestModDataName}') || '{}');
      
      // 覆盖User-Agent
      if (name.toLowerCase() === 'user-agent' && settings.userAgent) {
        value = settings.userAgent;
      }
      
      // 覆盖Accept-Language
      if (name.toLowerCase() === 'accept-language' && settings.acceptLanguage) {
        value = settings.acceptLanguage;
      }
      
      // 添加或覆盖自定义Header
      if (settings.customHeaders) {
        const customHeader = settings.customHeaders.find(h => h.name.toLowerCase() === name.toLowerCase());
        if (customHeader) {
          value = customHeader.value;
        }
      }
    }
    
    return originalSetRequestHeader.call(this, name, value);
  };
  
  // 修改navigator.userAgent
  if (requestModEnabled) {
    const settings = JSON.parse(localStorage.getItem('${requestModDataName}') || '{}');
    if (settings.userAgent) {
      Object.defineProperty(navigator, 'userAgent', {
        get: function() { return settings.userAgent; },
        configurable: true
      });
    }
  }
}

function removeRequestModifications() {
  // 恢复原始方法
  window.fetch = originalFetch;
  XMLHttpRequest.prototype.setRequestHeader = originalSetRequestHeader;
  
  // 恢复navigator.userAgent
  delete navigator.userAgent;
}

function testRequestMod() {
  const settings = JSON.parse(localStorage.getItem('${requestModDataName}') || '{}');
  
  if (!settings.enabled) {
    showNotification('请求修改未启用', 'info');
    return;
  }
  
  let testResults = [];
  
  // 测试User-Agent
  if (settings.userAgent) {
    const currentUA = navigator.userAgent;
    if (currentUA === settings.userAgent) {
      testResults.push('✓ User-Agent修改成功');
    } else {
      testResults.push('✗ User-Agent修改失败');
    }
  }
  
  // 测试自定义Header
  if (settings.customHeaders && settings.customHeaders.length > 0) {
    testResults.push('✓ 自定义Header已配置');
  }
  
  if (testResults.length === 0) {
    testResults.push('⚠ 未配置任何修改');
  }
  
  showNotification(testResults.join(' | '), testResults.some(r => r.includes('✗')) ? 'error' : 'success');
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
      applyRequestModifications();
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
`;

// =======================================================================================
// 第九部分：无图模式功能脚本（增强版）
// 功能：控制图片和视频加载，支持刷新
// =======================================================================================

const imageBlockScript = `
// 无图模式功能
let imageBlockEnabled = false;
let videoBlockEnabled = false;

function toggleImageBlock() {
  imageBlockEnabled = !imageBlockEnabled;
  videoBlockEnabled = imageBlockEnabled; // 同时控制视频
  
  if(imageBlockEnabled) {
    blockMedia();
    showNotification('无图模式已启用 - 页面将刷新', 'success');
    // 刷新页面以应用更改
    setTimeout(() => {
      location.reload();
    }, 1000);
  } else {
    unblockMedia();
    showNotification('无图模式已禁用 - 页面将刷新', 'info');
    // 刷新页面以恢复
    setTimeout(() => {
      location.reload();
    }, 1000);
  }
  
  saveImageBlockSettings();
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
  const videos = document.querySelectorAll('video, audio, iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="dailymotion"]');
  videos.forEach(video => {
    video.style.filter = 'blur(5px) grayscale(100%)';
    video.style.opacity = '0.3';
    if (video.tagName === 'VIDEO' || video.tagName === 'AUDIO') {
      video.pause();
      video.setAttribute('data-original-src', video.src || '');
      video.src = '';
      video.load();
    } else if (video.tagName === 'IFRAME') {
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
            node.style.filter = 'blur(5px) grayscale(100%)';
            node.style.opacity = '0.3';
            node.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
          } else if(node.tagName === 'VIDEO' || node.tagName === 'AUDIO') {
            node.style.filter = 'blur(5px) grayscale(100%)';
            node.style.opacity = '0.3';
            node.pause();
            node.src = '';
            node.load();
          } else if(node.tagName === 'IFRAME' && (node.src.includes('youtube') || node.src.includes('vimeo') || node.src.includes('dailymotion'))) {
            node.style.filter = 'blur(5px) grayscale(100%)';
            node.style.opacity = '0.3';
            node.src = '';
          }
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // 保存observer以便后续清理
  window.imageBlockObserver = observer;
}

function unblockMedia() {
  // 恢复图片
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
  
  // 恢复视频
  const videos = document.querySelectorAll('video, audio, iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="dailymotion"]');
  videos.forEach(video => {
    video.style.filter = '';
    video.style.opacity = '';
    const originalSrc = video.getAttribute('data-original-src');
    if(originalSrc) {
      video.src = originalSrc;
      if (video.tagName === 'VIDEO' || video.tagName === 'AUDIO') {
        video.load();
      }
    }
    video.removeAttribute('data-original-src');
  });
  
  // 停止观察
  if(window.imageBlockObserver) {
    window.imageBlockObserver.disconnect();
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

function saveImageBlockSettings() {
  const settings = {
    enabled: imageBlockEnabled,
    lastModified: new Date().toISOString()
  };
  
  try {
    localStorage.setItem('${imageBlockDataName}', JSON.stringify(settings));
  } catch(e) {
    console.log('保存无图模式设置失败:', e);
  }
}

// 初始化无图模式
setTimeout(loadImageBlockState, 2000);
`;

// =======================================================================================
// 第十部分：工具函数和检查功能
// 功能：提供通用工具函数和功能检查
// =======================================================================================

const utilsScript = `
// 工具函数和检查功能
function checkFeature(feature) {
  switch(feature) {
    case 'cookie':
      return checkCookieInjection();
    case 'adblock':
      return checkAdBlock();
    case 'sniffer':
      return checkSniffer();
    case 'requestMod':
      return checkRequestMod();
    case 'imageBlock':
      return checkImageBlock();
    default:
      return { success: false, message: '未知功能' };
  }
}

function checkCookieInjection() {
  try {
    const settings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    const currentSite = window.location.hostname;
    const siteSettings = settings[currentSite];
    
    if (siteSettings && siteSettings.cookies) {
      let injectedCount = 0;
      siteSettings.cookies.forEach(cookie => {
        const found = document.cookie.split('; ').find(row => row.startsWith(cookie.name + '='));
        if (found) injectedCount++;
      });
      
      if (injectedCount === siteSettings.cookies.length) {
        return { success: true, message: \`✓ Cookie注入正常 (已注入 \${injectedCount}/\${siteSettings.cookies.length} 个Cookie)\` };
      } else {
        return { success: false, message: \`✗ Cookie注入异常 (仅注入 \${injectedCount}/\${siteSettings.cookies.length} 个Cookie)\` };
      }
    } else {
      return { success: true, message: '⚠ 未配置Cookie注入' };
    }
  } catch(e) {
    return { success: false, message: '✗ Cookie检查失败: ' + e.message };
  }
}

function checkAdBlock() {
  try {
    const settings = JSON.parse(localStorage.getItem('${adBlockDataName}') || '{}');
    if (!settings.enabled) {
      return { success: true, message: '⚠ 广告拦截未启用' };
    }
    
    // 测试常见广告元素
    const testSelectors = ['.ad', '.ads', '.advertisement', '[class*="ad-"]'];
    let blockedCount = 0;
    let totalCount = 0;
    
    testSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        totalCount += elements.length;
        elements.forEach(element => {
          if (window.getComputedStyle(element).display === 'none') {
            blockedCount++;
          }
        });
      } catch(e) {
        // 忽略无效选择器
      }
    });
    
    if (totalCount === 0) {
      return { success: true, message: '✓ 广告拦截正常 (未检测到广告元素)' };
    } else {
      const percentage = Math.round((blockedCount / totalCount) * 100);
      return { 
        success: percentage > 80, 
        message: \`\${percentage > 80 ? '✓' : '✗'} 广告拦截\${percentage > 80 ? '正常' : '异常'} (拦截率 \${percentage}%)\` 
      };
    }
  } catch(e) {
    return { success: false, message: '✗ 广告拦截检查失败: ' + e.message };
  }
}

function checkSniffer() {
  try {
    const settings = JSON.parse(localStorage.getItem('${resourceSnifferDataName}') || '{}');
    if (!settings.enabled) {
      return { success: true, message: '⚠ 资源嗅探未启用' };
    }
    
    // 检查是否能够捕获请求
    if (typeof window.fetch !== 'function') {
      return { success: false, message: '✗ 资源嗅探异常 (fetch拦截失效)' };
    }
    
    return { success: true, message: '✓ 资源嗅探正常' };
  } catch(e) {
    return { success: false, message: '✗ 资源嗅探检查失败: ' + e.message };
  }
}

function checkRequestMod() {
  try {
    const settings = JSON.parse(localStorage.getItem('${requestModDataName}') || '{}');
    if (!settings.enabled) {
      return { success: true, message: '⚠ 请求修改未启用' };
    }
    
    // 检查User-Agent修改
    if (settings.userAgent && navigator.userAgent !== settings.userAgent) {
      return { success: false, message: '✗ User-Agent修改未生效' };
    }
    
    return { success: true, message: '✓ 请求修改正常' };
  } catch(e) {
    return { success: false, message: '✗ 请求修改检查失败: ' + e.message };
  }
}

function checkImageBlock() {
  try {
    const settings = JSON.parse(localStorage.getItem('${imageBlockDataName}') || '{}');
    if (!settings.enabled) {
      return { success: true, message: '⚠ 无图模式未启用' };
    }
    
    // 检查图片是否被阻止
    const images = document.querySelectorAll('img');
    let blockedCount = 0;
    images.forEach(img => {
      if (img.style.filter && img.style.filter.includes('grayscale')) {
        blockedCount++;
      }
    });
    
    if (blockedCount > 0) {
      return { success: true, message: \`✓ 无图模式正常 (已阻止 \${blockedCount} 张图片)\` };
    } else {
      return { success: false, message: '✗ 无图模式未生效' };
    }
  } catch(e) {
    return { success: false, message: '✗ 无图模式检查失败: ' + e.message };
  }
}

function runAllChecks() {
  const features = ['cookie', 'adblock', 'sniffer', 'requestMod', 'imageBlock'];
  const results = [];
  
  features.forEach(feature => {
    const result = checkFeature(feature);
    results.push(result);
  });
  
  const allSuccess = results.every(r => r.success);
  const message = results.map(r => r.message).join(' | ');
  
  showNotification(message, allSuccess ? 'success' : 'error');
}

// 添加检查按钮到工具栏
function addCheckButton() {
  const toolbar = document.getElementById('__PROXY_TOOLBAR__');
  if (toolbar) {
    const checkBtn = document.createElement('button');
    checkBtn.innerHTML = '✅';
    checkBtn.title = '检查功能状态';
    checkBtn.style.width = '40px';
    checkBtn.style.height = '40px';
    checkBtn.style.background = 'linear-gradient(45deg, #90cdf4, #b7e4f4)';
    checkBtn.style.border = 'none';
    checkBtn.style.borderRadius = '50%';
    checkBtn.style.color = '#2d3748';
    checkBtn.style.cursor = 'pointer';
    checkBtn.style.boxShadow = '0 3px 10px rgba(160,174,192,0.3)';
    checkBtn.style.fontSize = '16px';
    checkBtn.style.transition = 'all 0.3s ease';
    
    checkBtn.onmouseenter = () => {
      checkBtn.style.transform = 'scale(1.1)';
      checkBtn.style.boxShadow = '0 5px 15px rgba(160,174,192,0.4)';
    };
    
    checkBtn.onmouseleave = () => {
      checkBtn.style.transform = 'scale(1)';
      checkBtn.style.boxShadow = '0 3px 10px rgba(160,174,192,0.3)';
    };
    
    checkBtn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      runAllChecks();
    };
    
    // 插入到工具容器中
    const toolsContainer = document.getElementById('__PROXY_TOOLS_CONTAINER__');
    if (toolsContainer) {
      toolsContainer.appendChild(checkBtn);
    }
  }
}

// 初始化检查功能
setTimeout(addCheckButton, 3000);
`;

// =======================================================================================
// 第十一部分：主处理函数
// 功能：处理所有代理请求和响应
// =======================================================================================

async function handleRequest(request) {
  const url = new URL(request.url);
  const proxyTarget = url.searchParams.get(replaceUrlObj);
  const cookie = request.headers.get("Cookie") || "";
  const userAgent = request.headers.get("User-Agent") || "";
  const acceptLanguage = request.headers.get("Accept-Language") || "";
  
  // 处理密码验证
  if (showPasswordPage && !cookie.includes(passwordCookieName + "=" + password) && !proxyTarget) {
    return showPasswordPage();
  }
  
  // 记录访问的网站
  if (proxyTarget) {
    const response = await fetch(proxyTarget, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: "follow"
    });
    
    let modifiedResponse = await modifyResponse(response, proxyTarget, cookie);
    
    // 设置访问记录cookie
    const visitedSites = getVisitedSites(cookie);
    visitedSites.add(new URL(proxyTarget).hostname);
    const visitedCookie = Array.from(visitedSites).join(",");
    
    modifiedResponse.headers.append("Set-Cookie", 
      `${lastVisitProxyCookie}=${visitedCookie}; Max-Age=2592000; Path=/`);
    
    return modifiedResponse;
  }
  
  // 处理根路径
  if (url.pathname === str) {
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Web Proxy</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          input { width: 100%; padding: 10px; margin: 10px 0; }
          button { padding: 10px 20px; background: #007cba; color: white; border: none; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1>Web Proxy</h1>
        <form>
          <input type="url" name="${replaceUrlObj}" placeholder="Enter URL" required>
          <button type="submit">Go</button>
        </form>
      </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" }
    });
  }
  
  return new Response("Not found", { status: 404 });
}

async function modifyResponse(response, proxyTarget, cookie) {
  const contentType = response.headers.get("Content-Type") || "";
  
  if (contentType.includes("text/html")) {
    const html = await response.text();
    const modifiedHtml = injectScripts(html, proxyTarget, cookie);
    
    return new Response(modifiedHtml, {
      status: response.status,
      headers: {
        ...Object.fromEntries(response.headers),
        "Content-Type": "text/html"
      }
    });
  }
  
  return response;
}

function injectScripts(html, proxyTarget, cookie) {
  const scripts = [
    proxyHintInjection,
    toolbarInjection,
    cookieInjectionScript,
    adBlockScript,
    resourceSnifferScript,
    requestModScript,
    imageBlockScript,
    utilsScript
  ].join("\n");
  
  const injectedHtml = html.replace(/<head>/, `<head><script>${scripts}</script>`);
  return injectedHtml;
}

function getVisitedSites(cookie) {
  const match = cookie.match(new RegExp(lastVisitProxyCookie + "=([^;]+)"));
  if (match) {
    return new Set(match[1].split(","));
  }
  return new Set();
}

function showPasswordPage() {
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Password Required</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px; }
        input { width: 100%; padding: 10px; margin: 10px 0; }
        button { width: 100%; padding: 10px; background: #007cba; color: white; border: none; cursor: pointer; }
      </style>
    </head>
    <body>
      <h2>Password Required</h2>
      <form method="POST">
        <input type="password" name="password" placeholder="Enter password" required>
        <button type="submit">Submit</button>
      </form>
    </body>
    </html>
  `, {
    headers: { "Content-Type": "text/html" },
    status: 401
  });
}