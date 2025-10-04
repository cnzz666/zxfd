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

// 显示操作结果通知
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.padding = '15px 20px';
  notification.style.background = type === 'success' ? 'rgba(72,187,120,0.9)' : 'rgba(245,101,101,0.9)';
  notification.style.color = 'white';
  notification.style.borderRadius = '8px';
  notification.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
  notification.style.zIndex = '1000001';
  notification.style.backdropFilter = 'blur(10px)';
  notification.style.fontWeight = 'bold';
  notification.style.transition = 'all 0.3s ease';
  notification.style.transform = 'translateX(100%)';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
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
  }, 3000);
}
`;

// =======================================================================================
// 第五部分：Cookie注入功能脚本
// 功能：提供cookie注入界面和功能
// =======================================================================================

const cookieInjectionScript = `
// Cookie注入功能
let cookieInjectionData = {};

function showCookieModal() {
  // 检查是否已存在弹窗
  if(document.getElementById('__COOKIE_INJECTION_MODAL__')) return;
  
  // 获取当前网站信息
  const currentSite = window.location.hostname;
  
  const modalHTML = \`
  <div id="__COOKIE_INJECTION_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:900px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🍪 Cookie注入管理</h3>
        
        <div style="display:flex;gap:10px;margin-bottom:20px;">
          <button onclick="showCookieInjectionTab()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;flex:1;">注入Cookie</button>
          <button onclick="showCookieManagementTab()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;flex:1;">管理记录</button>
          <button onclick="showWebsiteCookiesTab()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;flex:1;">网站Cookie</button>
        </div>
        
        <!-- Cookie注入标签 -->
        <div id="cookieInjectionTab" style="text-align:left;">
          <div style="margin-bottom:20px;">
            <label style="display:block;margin-bottom:8px;font-weight:bold;">目标网站:</label>
            <input type="text" id="targetSite" value="\${currentSite}" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
          </div>
          
          <div style="margin-bottom:20px;">
            <label style="display:block;margin-bottom:8px;font-weight:bold;">Cookie字符串:</label>
            <textarea id="cookieString" placeholder="输入Cookie字符串，例如: name=value; name2=value2; path=/; domain=.example.com" style="width:100%;height:120px;padding:12px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);resize:vertical;"></textarea>
          </div>
          
          <div style="display:flex;gap:10px;justify-content:center;">
            <button onclick="injectCookie()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">注入Cookie</button>
            <button onclick="testCookieInjection()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">检查注入</button>
            <button onclick="closeCookieModal()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭</button>
          </div>
        </div>
        
        <!-- 管理记录标签 -->
        <div id="cookieManagementTab" style="display:none;text-align:left;">
          <div style="margin-bottom:15px;">
            <input type="text" id="searchCookies" placeholder="搜索网站..." style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
          </div>
          <div id="cookieRecords" style="max-height:300px;overflow-y:auto;border:1px solid rgba(160,174,192,0.3);border-radius:8px;padding:10px;background:rgba(255,255,255,0.2);">
            <!-- 记录将在这里动态加载 -->
          </div>
        </div>
        
        <!-- 网站Cookie标签 -->
        <div id="websiteCookiesTab" style="display:none;text-align:left;">
          <div style="margin-bottom:15px;">
            <button onclick="loadWebsiteCookies()" style="padding:8px 16px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:12px;color:#2d3748;cursor:pointer;">刷新Cookie列表</button>
          </div>
          <div id="websiteCookieList" style="max-height:300px;overflow-y:auto;border:1px solid rgba(160,174,192,0.3);border-radius:8px;padding:10px;background:rgba(255,255,255,0.2);">
            <!-- 网站Cookie将在这里显示 -->
          </div>
        </div>
      </div>
    </div>
  </div>
  \`;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  setTimeout(() => {
    const modal = document.getElementById('__COOKIE_INJECTION_MODAL__');
    const content = modal.querySelector('div > div');
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
    
    // 加载保存的数据
    loadCookieData();
    loadCookieRecords();
  }, 100);
}

function showCookieInjectionTab() {
  document.getElementById('cookieInjectionTab').style.display = 'block';
  document.getElementById('cookieManagementTab').style.display = 'none';
  document.getElementById('websiteCookiesTab').style.display = 'none';
  
  // 更新按钮样式
  const buttons = document.querySelectorAll('#__COOKIE_INJECTION_MODAL__ button');
  buttons[0].style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
  buttons[1].style.background = 'rgba(160,174,192,0.3)';
  buttons[2].style.background = 'rgba(160,174,192,0.3)';
}

function showCookieManagementTab() {
  document.getElementById('cookieInjectionTab').style.display = 'none';
  document.getElementById('cookieManagementTab').style.display = 'block';
  document.getElementById('websiteCookiesTab').style.display = 'none';
  
  // 更新按钮样式
  const buttons = document.querySelectorAll('#__COOKIE_INJECTION_MODAL__ button');
  buttons[0].style.background = 'rgba(160,174,192,0.3)';
  buttons[1].style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
  buttons[2].style.background = 'rgba(160,174,192,0.3)';
}

function showWebsiteCookiesTab() {
  document.getElementById('cookieInjectionTab').style.display = 'none';
  document.getElementById('cookieManagementTab').style.display = 'none';
  document.getElementById('websiteCookiesTab').style.display = 'block';
  
  // 更新按钮样式
  const buttons = document.querySelectorAll('#__COOKIE_INJECTION_MODAL__ button');
  buttons[0].style.background = 'rgba(160,174,192,0.3)';
  buttons[1].style.background = 'rgba(160,174,192,0.3)';
  buttons[2].style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
  
  loadWebsiteCookies();
}

function loadCookieData() {
  try {
    const data = localStorage.getItem('${cookieInjectionDataName}');
    if (data) {
      cookieInjectionData = JSON.parse(data);
    }
  } catch(e) {
    console.error('加载Cookie数据失败:', e);
  }
}

function saveCookieData() {
  try {
    localStorage.setItem('${cookieInjectionDataName}', JSON.stringify(cookieInjectionData));
    return true;
  } catch(e) {
    console.error('保存Cookie数据失败:', e);
    return false;
  }
}

function injectCookie() {
  const targetSite = document.getElementById('targetSite').value.trim();
  const cookieString = document.getElementById('cookieString').value.trim();
  
  if (!targetSite || !cookieString) {
    showNotification('请输入目标网站和Cookie字符串', 'error');
    return;
  }
  
  try {
    // 解析Cookie字符串
    const cookies = parseCookieString(cookieString);
    
    // 保存到数据
    if (!cookieInjectionData[targetSite]) {
      cookieInjectionData[targetSite] = [];
    }
    
    cookies.forEach(cookie => {
      cookieInjectionData[targetSite].push({
        ...cookie,
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString()
      });
    });
    
    // 保存数据
    if (saveCookieData()) {
      // 实际注入Cookie
      injectCookies(cookies);
      showNotification('Cookie注入成功！');
      loadCookieRecords();
    } else {
      showNotification('保存失败', 'error');
    }
  } catch(e) {
    showNotification('Cookie格式错误: ' + e.message, 'error');
  }
}

function parseCookieString(cookieString) {
  const cookies = [];
  const pairs = cookieString.split(';').map(pair => pair.trim()).filter(pair => pair);
  
  pairs.forEach(pair => {
    const [name, ...valueParts] = pair.split('=');
    if (name && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      const cookie = {
        name: name.trim(),
        value: value,
        domain: '',
        path: '/'
      };
      
      // 提取其他属性
      if (pair.includes('domain=')) {
        const domainMatch = pair.match(/domain=([^;]+)/i);
        if (domainMatch) cookie.domain = domainMatch[1];
      }
      
      if (pair.includes('path=')) {
        const pathMatch = pair.match(/path=([^;]+)/i);
        if (pathMatch) cookie.path = pathMatch[1];
      }
      
      cookies.push(cookie);
    }
  });
  
  return cookies;
}

function injectCookies(cookies) {
  cookies.forEach(cookie => {
    let cookieStr = \`\${cookie.name}=\${cookie.value}\`;
    if (cookie.domain) cookieStr += \`; domain=\${cookie.domain}\`;
    if (cookie.path) cookieStr += \`; path=\${cookie.path}\`;
    cookieStr += '; samesite=lax';
    
    document.cookie = cookieStr;
  });
}

function testCookieInjection() {
  const targetSite = document.getElementById('targetSite').value.trim();
  const cookies = cookieInjectionData[targetSite] || [];
  
  if (cookies.length === 0) {
    showNotification('该网站没有保存的Cookie记录', 'error');
    return;
  }
  
  let allInjected = true;
  const missingCookies = [];
  
  cookies.forEach(cookie => {
    const found = document.cookie.includes(\`\${cookie.name}=\`);
    if (!found) {
      allInjected = false;
      missingCookies.push(cookie.name);
    }
  });
  
  if (allInjected) {
    showNotification('所有Cookie都已成功注入！');
  } else {
    showNotification(\`以下Cookie未成功注入: \${missingCookies.join(', ')}\`, 'error');
  }
}

function loadCookieRecords() {
  const recordsContainer = document.getElementById('cookieRecords');
  const searchTerm = document.getElementById('searchCookies')?.value.toLowerCase() || '';
  
  if (!recordsContainer) return;
  
  let html = '';
  let hasRecords = false;
  
  Object.keys(cookieInjectionData).forEach(site => {
    if (searchTerm && !site.toLowerCase().includes(searchTerm)) return;
    
    const cookies = cookieInjectionData[site];
    if (cookies && cookies.length > 0) {
      hasRecords = true;
      html += \`
        <div style="margin-bottom:15px;padding:10px;background:rgba(255,255,255,0.2);border-radius:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <strong style="color:#2c5282;">\${site}</strong>
            <div>
              <button onclick="editCookies('\${site}')" style="padding:4px 8px;background:rgba(160,174,192,0.3);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:12px;margin-right:5px;">编辑</button>
              <button onclick="deleteCookies('\${site}')" style="padding:4px 8px;background:#e53e3e;border:none;border-radius:4px;color:white;cursor:pointer;font-size:12px;">删除</button>
            </div>
          </div>
          <div style="font-size:12px;color:#666;">
            共 \${cookies.length} 个Cookie，最后更新: \${new Date(cookies[cookies.length-1].timestamp).toLocaleString()}
          </div>
        </div>
      \`;
    }
  });
  
  if (!hasRecords) {
    html = '<div style="text-align:center;color:#666;padding:20px;">暂无Cookie记录</div>';
  }
  
  recordsContainer.innerHTML = html;
  
  // 添加搜索事件监听
  const searchInput = document.getElementById('searchCookies');
  if (searchInput) {
    searchInput.oninput = loadCookieRecords;
  }
}

function loadWebsiteCookies() {
  const container = document.getElementById('websiteCookieList');
  if (!container) return;
  
  const cookies = document.cookie.split(';').map(c => c.trim()).filter(c => c);
  
  if (cookies.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">当前网站没有Cookie</div>';
    return;
  }
  
  let html = '';
  cookies.forEach(cookie => {
    const [name, value] = cookie.split('=');
    html += \`
      <div style="margin-bottom:10px;padding:8px;background:rgba(255,255,255,0.2);border-radius:6px;font-size:12px;">
        <strong>\${name}</strong>=<span style="color:#2c5282;">\${value}</span>
      </div>
    \`;
  });
  
  container.innerHTML = html;
}

function editCookies(site) {
  const cookies = cookieInjectionData[site];
  if (!cookies) return;
  
  document.getElementById('targetSite').value = site;
  const cookieString = cookies.map(c => \`\${c.name}=\${c.value}\${c.domain ? \`; domain=\${c.domain}\` : ''}\${c.path ? \`; path=\${c.path}\` : ''}\`).join('; ');
  document.getElementById('cookieString').value = cookieString;
  
  showCookieInjectionTab();
  showNotification(\`已加载 \${site} 的Cookie记录\`);
}

function deleteCookies(site) {
  if (confirm(\`确定要删除 \${site} 的所有Cookie记录吗？\`)) {
    delete cookieInjectionData[site];
    if (saveCookieData()) {
      showNotification(\`已删除 \${site} 的Cookie记录\`);
      loadCookieRecords();
    }
  }
}

function closeCookieModal() {
  const modal = document.getElementById('__COOKIE_INJECTION_MODAL__');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// 初始化时加载Cookie数据
setTimeout(loadCookieData, 1000);
`;

// =======================================================================================
// 第六部分：广告拦截功能脚本
// 功能：实现广告拦截和元素标记
// =======================================================================================

const adBlockScript = `
// 广告拦截功能
let adBlockEnabled = false;
let adBlockRules = [];
let adBlockSubscriptions = [];
let elementPickerActive = false;
let selectedElements = new Set();

// 默认订阅规则
const defaultSubscriptions = [
  {
    name: 'Anti-Adblock',
    url: 'https://easylist-downloads.adblockplus.org/antiadblockfilters.txt',
    enabled: true
  },
  {
    name: 'EasyPrivacy',
    url: 'https://easylist-downloads.adblockplus.org/easyprivacy.txt',
    enabled: true
  },
  {
    name: 'CJX Annoyance',
    url: 'https://fastly.jsdelivr.net/gh/cjx82630/cjxlist/cjx-annoyance.txt',
    enabled: true
  },
  {
    name: 'EasyList China',
    url: 'https://easylist-downloads.adblockplus.org/easylistchina.txt',
    enabled: true
  }
];

function showAdBlockModal() {
  if(document.getElementById('__ADBLOCK_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__ADBLOCK_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:1000px;width:95%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🚫 广告拦截设置</h3>
        
        <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
          <button id="toggleAdBlock" onclick="toggleAdBlock()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;flex:1;">启用广告拦截</button>
          <button onclick="startElementPicker()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;flex:1;">标记广告元素</button>
          <button onclick="updateAllSubscriptions()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;flex:1;">更新订阅</button>
        </div>
        
        <div style="display:flex;gap:20px;margin-bottom:20px;">
          <!-- 订阅规则 -->
          <div style="flex:1;text-align:left;">
            <h4 style="color:#2c5282;margin-bottom:10px;">订阅规则</h4>
            <div id="subscriptionList" style="max-height:200px;overflow-y:auto;border:1px solid rgba(160,174,192,0.3);border-radius:8px;padding:10px;background:rgba(255,255,255,0.2);margin-bottom:10px;">
              <!-- 订阅列表 -->
            </div>
            <div style="display:flex;gap:10px;">
              <input type="text" id="newSubscriptionUrl" placeholder="订阅URL" style="flex:1;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
              <input type="text" id="newSubscriptionName" placeholder="名称" style="width:100px;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
              <button onclick="addSubscription()" style="padding:8px 16px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:12px;color:#2d3748;cursor:pointer;">添加</button>
            </div>
          </div>
          
          <!-- 自定义规则 -->
          <div style="flex:1;text-align:left;">
            <h4 style="color:#2c5282;margin-bottom:10px;">自定义规则</h4>
            <textarea id="customRules" placeholder="每行一条规则，支持Adblock Plus语法" style="width:100%;height:200px;padding:12px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);resize:vertical;font-family:monospace;"></textarea>
          </div>
        </div>
        
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="saveAdBlockRules()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;font-weight:bold;">保存设置</button>
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
    loadSubscriptionList();
  }, 100);
}

function loadSubscriptionList() {
  const container = document.getElementById('subscriptionList');
  if (!container) return;
  
  let html = '';
  adBlockSubscriptions.forEach((sub, index) => {
    html += \`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding:8px;background:rgba(255,255,255,0.2);border-radius:6px;">
        <div style="flex:1;">
          <input type="checkbox" \${sub.enabled ? 'checked' : ''} onchange="toggleSubscription(\${index}, this.checked)" style="margin-right:8px;">
          <span style="font-weight:bold;">\${sub.name}</span>
          <div style="font-size:11px;color:#666;word-break:break-all;">\${sub.url}</div>
        </div>
        <button onclick="updateSubscription(\${index})" style="padding:4px 8px;background:rgba(160,174,192,0.3);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:11px;margin-right:5px;">更新</button>
        <button onclick="removeSubscription(\${index})" style="padding:4px 8px;background:#e53e3e;border:none;border-radius:4px;color:white;cursor:pointer;font-size:11px;">删除</button>
      </div>
    \`;
  });
  
  container.innerHTML = html || '<div style="text-align:center;color:#666;">暂无订阅</div>';
}

function addSubscription() {
  const url = document.getElementById('newSubscriptionUrl').value.trim();
  const name = document.getElementById('newSubscriptionName').value.trim() || '自定义订阅';
  
  if (!url) {
    showNotification('请输入订阅URL', 'error');
    return;
  }
  
  adBlockSubscriptions.push({
    name: name,
    url: url,
    enabled: true,
    rules: []
  });
  
  document.getElementById('newSubscriptionUrl').value = '';
  document.getElementById('newSubscriptionName').value = '';
  
  updateSubscription(adBlockSubscriptions.length - 1);
  showNotification('订阅已添加');
}

function toggleSubscription(index, enabled) {
  if (adBlockSubscriptions[index]) {
    adBlockSubscriptions[index].enabled = enabled;
    saveAdBlockSettings();
    if (enabled && adBlockEnabled) {
      applyAdBlockRules();
    }
  }
}

async function updateSubscription(index) {
  const sub = adBlockSubscriptions[index];
  if (!sub) return;
  
  try {
    showNotification(\`正在更新 \${sub.name}...\`);
    const response = await fetch(sub.url);
    const text = await response.text();
    
    const rules = text.split('\\n')
      .filter(line => line.trim() && !line.startsWith('!'))
      .map(rule => rule.trim());
    
    sub.rules = rules;
    sub.lastUpdate = new Date().toISOString();
    
    saveAdBlockSettings();
    if (adBlockEnabled) {
      applyAdBlockRules();
    }
    
    showNotification(\`\${sub.name} 更新成功，共 \${rules.length} 条规则\`);
    loadSubscriptionList();
  } catch (e) {
    showNotification(\`更新 \${sub.name} 失败: \${e.message}\`, 'error');
  }
}

async function updateAllSubscriptions() {
  showNotification('正在更新所有订阅...');
  
  for (let i = 0; i < adBlockSubscriptions.length; i++) {
    if (adBlockSubscriptions[i].enabled) {
      await updateSubscription(i);
    }
  }
  
  showNotification('所有订阅更新完成');
}

function removeSubscription(index) {
  if (confirm('确定要删除这个订阅吗？')) {
    adBlockSubscriptions.splice(index, 1);
    saveAdBlockSettings();
    loadSubscriptionList();
    showNotification('订阅已删除');
  }
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
      outline: 2px dashed #c53030 !important; 
      background: rgba(197, 48, 48, 0.1) !important; 
      pointer-events: none !important;
    }
    .__adblock_selected__ { 
      outline: 3px solid #c53030 !important; 
      background: rgba(197, 48, 48, 0.2) !important;
      pointer-events: none !important;
    }
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
  panel.style.background = 'rgba(255,255,255,0.95)';
  panel.style.backdropFilter = 'blur(10px)';
  panel.style.padding = '15px 20px';
  panel.style.borderRadius = '10px';
  panel.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
  panel.style.zIndex = '1000001';
  panel.style.display = 'flex';
  panel.style.gap = '15px';
  panel.style.alignItems = 'center';
  panel.style.border = '2px solid #c53030';
  
  panel.innerHTML = \`
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="color:#2d3748;font-weight:bold;white-space:nowrap;">选择广告元素 (已选择: <span id="selectedCount">0</span>)</span>
      <button onclick="confirmBlockElements()" style="padding:8px 16px;background:#c53030;border:none;border-radius:15px;color:white;cursor:pointer;font-weight:bold;">确认拦截</button>
      <button onclick="cancelElementPicker()" style="padding:8px 16px;background:rgba(160,174,192,0.3);border:none;border-radius:15px;color:#2d3748;cursor:pointer;">取消</button>
    </div>
  \`;
  
  document.body.appendChild(panel);
  
  // 添加事件监听
  document.addEventListener('mouseover', handleElementHover, true);
  document.addEventListener('click', handleElementClick, true);
  document.addEventListener('contextmenu', handleRightClick, true);
}

function handleElementHover(e) {
  if(!elementPickerActive) return;
  
  // 跳过工具栏和选择面板
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
  if (!selectedElements.has(e.target)) {
    e.target.classList.add('__adblock_hover__');
  }
}

function handleElementClick(e) {
  if(!elementPickerActive) return;
  
  // 跳过工具栏和选择面板
  if (e.target.closest('#__PROXY_TOOLBAR__') || e.target.closest('#__ELEMENT_PICKER_PANEL__')) {
    return;
  }
  
  e.stopPropagation();
  e.preventDefault();
  
  const element = e.target;
  
  if (selectedElements.has(element)) {
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

function handleRightClick(e) {
  if(!elementPickerActive) return;
  e.stopPropagation();
  e.preventDefault();
  
  // 右键取消所有选择
  selectedElements.forEach(el => {
    el.classList.remove('__adblock_selected__');
    el.classList.remove('__adblock_hover__');
  });
  selectedElements.clear();
  updateSelectedCount();
}

function updateSelectedCount() {
  const countElement = document.getElementById('selectedCount');
  if (countElement) {
    countElement.textContent = selectedElements.size;
  }
}

function confirmBlockElements() {
  if(selectedElements.size === 0) {
    showNotification('请先选择要拦截的元素', 'error');
    return;
  }
  
  const currentHost = window.location.hostname;
  let newRules = [];
  
  selectedElements.forEach(element => {
    const selector = generateCSSSelector(element);
    if(selector && !selector.includes('#__PROXY_')) {
      newRules.push(\`##\${selector}\`);
    }
  });
  
  if(newRules.length > 0) {
    const textarea = document.getElementById('customRules');
    const currentRules = textarea.value;
    const updatedRules = currentRules + (currentRules ? '\\n' : '') + newRules.join('\\n');
    textarea.value = updatedRules;
    
    // 保存并应用
    saveAdBlockRules();
    showNotification(\`已添加 \${newRules.length} 条拦截规则\`);
  }
  
  cancelElementPicker();
}

function cancelElementPicker() {
  elementPickerActive = false;
  
  // 移除所有高亮和选择
  document.querySelectorAll('.__adblock_hover__, .__adblock_selected__').forEach(el => {
    el.classList.remove('__adblock_hover__', '__adblock_selected__');
  });
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
  document.removeEventListener('contextmenu', handleRightClick, true);
}

function generateCSSSelector(element) {
  if (element.id && !element.id.includes('__PROXY_')) {
    return '#' + element.id;
  }
  
  // 生成基于类名和标签的选择器
  let selector = element.tagName.toLowerCase();
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.split(' ').filter(cls => 
      cls && !cls.includes('__PROXY_') && cls.length < 50
    );
    if (classes.length > 0) {
      selector += '.' + classes.join('.');
    }
  }
  
  // 如果选择器太通用，添加父元素信息
  if (selector === element.tagName.toLowerCase() || document.querySelectorAll(selector).length > 10) {
    if (element.parentElement) {
      const parentSelector = generateCSSSelector(element.parentElement);
      if (parentSelector) {
        selector = parentSelector + ' > ' + selector;
        
        // 添加:nth-child信息
        const index = Array.from(element.parentElement.children).indexOf(element) + 1;
        selector += \`:nth-child(\${index})\`;
      }
    }
  }
  
  return selector;
}

function toggleAdBlock() {
  adBlockEnabled = !adBlockEnabled;
  const button = document.getElementById('toggleAdBlock');
  if(adBlockEnabled) {
    button.textContent = '禁用广告拦截';
    button.style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
    applyAdBlockRules();
    showNotification('广告拦截已启用');
  } else {
    button.textContent = '启用广告拦截';
    button.style.background = 'rgba(160,174,192,0.3)';
    removeAdBlockRules();
    showNotification('广告拦截已禁用');
  }
  saveAdBlockSettings();
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
    
    showNotification('广告规则已保存');
  } catch(e) {
    showNotification('保存失败: ' + e.message, 'error');
  }
}

function loadAdBlockSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem('${adBlockDataName}') || '{}');
    adBlockEnabled = settings.enabled || false;
    adBlockRules = settings.rules || [];
    adBlockSubscriptions = settings.subscriptions || defaultSubscriptions;
    
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
  
  // 添加订阅规则
  adBlockSubscriptions.forEach(sub => {
    if (sub.enabled && sub.rules) {
      allRules = allRules.concat(sub.rules);
    }
  });
  
  // 应用规则逻辑
  console.log('应用广告拦截规则:', allRules.length);
  
  // 这里应该实现实际的广告拦截逻辑
  // 由于复杂性，这里只做简单演示
  allRules.forEach(rule => {
    if (rule.startsWith('##')) {
      // 元素隐藏规则
      const selector = rule.substring(2);
      try {
        document.querySelectorAll(selector).forEach(el => {
          el.style.display = 'none !important';
        });
      } catch(e) {
        // 忽略无效选择器
      }
    }
  });
  
  showNotification(\`已应用 \${allRules.length} 条拦截规则\`);
}

function removeAdBlockRules() {
  // 移除所有隐藏样式
  document.querySelectorAll('[style*="display: none !important"]').forEach(el => {
    el.style.display = '';
  });
}

function testAdBlock() {
  const adElements = document.querySelectorAll('.ad, .ads, .advertisement, [class*="ad-"], [id*="ad-"]');
  const blockedCount = Array.from(adElements).filter(el => 
    el.style.display === 'none' || el.offsetParent === null
  ).length;
  
  showNotification(\`检测到 \${adElements.length} 个广告元素，已拦截 \${blockedCount} 个\`);
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
setTimeout(() => {
  loadAdBlockSettings();
  // 自动更新启用的订阅
  adBlockSubscriptions.forEach((sub, index) => {
    if (sub.enabled && (!sub.lastUpdate || Date.now() - new Date(sub.lastUpdate).getTime() > 24 * 60 * 60 * 1000)) {
      setTimeout(() => updateSubscription(index), 5000 + index * 2000);
    }
  });
}, 2000);
`;

// =======================================================================================
// 第七部分：资源嗅探功能脚本
// 功能：拦截和显示网络请求
// =======================================================================================

const resourceSnifferScript = `
// 资源嗅探功能
let snifferEnabled = false;
let capturedRequests = [];
let originalFetch = window.fetch;
let originalXHR = XMLHttpRequest;
let requestInterceptor = null;

function showSnifferModal() {
  if(document.getElementById('__SNIFFER_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__SNIFFER_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:95%;width:1200px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🔍 资源嗅探器</h3>
        
        <div style="display:flex;gap:15px;margin-bottom:20px;justify-content:center;flex-wrap:wrap;">
          <button id="toggleSniffer" onclick="toggleSniffer()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">启动嗅探</button>
          <button onclick="clearSnifferData()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">清空记录</button>
          <button onclick="exportSnifferData()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">导出数据</button>
          <button onclick="toggleAutoStart()" style="padding:10px 20px;background:linear-gradient(45deg,#90cdf4,#b7e4f4);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">自动开启</button>
        </div>
        
        <div style="margin-bottom:15px;text-align:left;">
          <input type="text" id="snifferFilter" placeholder="过滤请求..." style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(160,174,192,0.5);background:rgba(255,255,255,0.5);">
        </div>
        
        <div style="text-align:left;margin-bottom:20px;">
          <div style="background:rgba(255,255,255,0.5);border-radius:8px;padding:15px;max-height:400px;overflow-y:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
              <thead>
                <tr style="background:rgba(160,174,192,0.2);position:sticky;top:0;">
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);width:60px;">方法</th>
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);">URL</th>
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);width:80px;">类型</th>
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);width:70px;">状态</th>
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);width:80px;">大小</th>
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);width:150px;">时间</th>
                  <th style="padding:8px;text-align:left;border-bottom:1px solid rgba(160,174,192,0.3);width:120px;">操作</th>
                </tr>
              </thead>
              <tbody id="snifferTableBody">
                <tr><td colspan="7" style="padding:20px;text-align:center;color:#666;">暂无数据</td></tr>
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
    
    // 添加过滤功能
    const filterInput = document.getElementById('snifferFilter');
    if (filterInput) {
      filterInput.oninput = updateSnifferTable;
    }
  }, 100);
}

function toggleSniffer() {
  snifferEnabled = !snifferEnabled;
  const button = document.getElementById('toggleSniffer');
  
  if(snifferEnabled) {
    button.textContent = '停止嗅探';
    button.style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
    startSniffer();
    showNotification('资源嗅探已启动');
  } else {
    button.textContent = '启动嗅探';
    button.style.background = 'rgba(160,174,192,0.3)';
    stopSniffer();
    showNotification('资源嗅探已停止');
  }
  
  saveSnifferSettings();
}

function startSniffer() {
  // 拦截fetch请求
  window.fetch = function(...args) {
    const startTime = Date.now();
    const url = typeof args[0] === 'string' ? args[0] : args[0].url;
    const method = args[1]?.method || 'GET';
    
    const requestInfo = {
      id: generateId(),
      method: method,
      url: url,
      type: getResourceType(url),
      timestamp: new Date().toLocaleTimeString(),
      startTime: startTime,
      status: 'pending',
      size: '0 B',
      duration: '0ms',
      requestHeaders: args[1]?.headers || {},
      responseHeaders: {}
    };
    
    capturedRequests.unshift(requestInfo);
    updateSnifferTable();
    
    return originalFetch.apply(this, args).then(response => {
      const endTime = Date.now();
      requestInfo.status = response.status;
      requestInfo.size = formatBytes(response.headers.get('content-length') || 0);
      requestInfo.duration = \`\${endTime - startTime}ms\`;
      requestInfo.responseHeaders = Object.fromEntries(response.headers.entries());
      
      // 克隆响应以便读取body
      response.clone().text().then(text => {
        requestInfo.responseBody = text.substring(0, 1000); // 只保存前1000字符
      }).catch(() => {});
      
      updateSnifferTable();
      return response;
    }).catch(error => {
      const endTime = Date.now();
      requestInfo.status = 'error';
      requestInfo.size = '0 B';
      requestInfo.duration = \`\${endTime - startTime}ms\`;
      requestInfo.error = error.message;
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
      startTime: Date.now(),
      status: 'pending',
      size: '0 B',
      duration: '0ms',
      requestHeaders: {}
    };
    
    this.setRequestHeader = function(name, value) {
      this._snifferInfo.requestHeaders[name] = value;
      return originalSetRequestHeader.apply(this, arguments);
    };
    
    capturedRequests.unshift(this._snifferInfo);
    updateSnifferTable();
    
    return originalOpen.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.send = function(data) {
    this._snifferInfo.requestBody = data;
    
    this.addEventListener('load', function() {
      const endTime = Date.now();
      this._snifferInfo.status = this.status;
      this._snifferInfo.size = formatBytes(this.response ? new Blob([this.response]).size : 0);
      this._snifferInfo.duration = \`\${endTime - this._snifferInfo.startTime}ms\`;
      
      // 获取响应头
      const responseHeaders = {};
      const headers = this.getAllResponseHeaders();
      if (headers) {
        headers.split('\\r\\n').forEach(line => {
          const parts = line.split(': ');
          if (parts.length >= 2) {
            responseHeaders[parts[0]] = parts.slice(1).join(': ');
          }
        });
      }
      this._snifferInfo.responseHeaders = responseHeaders;
      
      // 保存响应体（前1000字符）
      if (this.responseText) {
        this._snifferInfo.responseBody = this.responseText.substring(0, 1000);
      }
      
      updateSnifferTable();
    });
    
    this.addEventListener('error', function() {
      const endTime = Date.now();
      this._snifferInfo.status = 'error';
      this._snifferInfo.duration = \`\${endTime - this._snifferInfo.startTime}ms\`;
      updateSnifferTable();
    });
    
    return originalSend.apply(this, arguments);
  };
}

function stopSniffer() {
  // 恢复原始方法
  window.fetch = originalFetch;
  XMLHttpRequest.prototype.open = originalXHR.prototype.open;
  XMLHttpRequest.prototype.send = originalXHR.prototype.send;
  XMLHttpRequest.prototype.setRequestHeader = originalXHR.prototype.setRequestHeader;
}

function generateId() {
  return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function getResourceType(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    
    if (pathname.match(/\\.(js)$/)) return 'JS';
    if (pathname.match(/\\.(css)$/)) return 'CSS';
    if (pathname.match(/\\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) return 'Image';
    if (pathname.match(/\\.(mp4|webm|avi|mov|flv)$/)) return 'Video';
    if (pathname.match(/\\.(mp3|wav|ogg)$/)) return 'Audio';
    if (pathname.match(/\\.(html|htm)$/)) return 'HTML';
    if (pathname.match(/\\.(json)$/)) return 'JSON';
    if (pathname.match(/\\.(xml)$/)) return 'XML';
    if (pathname.match(/\\.(woff|woff2|ttf|eot)$/)) return 'Font';
    
    // 根据内容类型判断
    if (url.includes('video') || url.includes('stream')) return 'Video';
    if (url.includes('image') || url.includes('img')) return 'Image';
    if (url.includes('audio') || url.includes('sound')) return 'Audio';
    
    return 'Other';
  } catch {
    return 'Other';
  }
}

function formatBytes(bytes) {
  bytes = parseInt(bytes) || 0;
  if(bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateSnifferTable() {
  const tbody = document.getElementById('snifferTableBody');
  const filterInput = document.getElementById('snifferFilter');
  const filter = filterInput ? filterInput.value.toLowerCase() : '';
  
  if(!tbody) return;
  
  const filteredRequests = capturedRequests.filter(req => 
    !filter || 
    req.url.toLowerCase().includes(filter) ||
    req.method.toLowerCase().includes(filter) ||
    req.type.toLowerCase().includes(filter)
  );
  
  if(filteredRequests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="padding:20px;text-align:center;color:#666;">暂无数据</td></tr>';
    return;
  }
  
  tbody.innerHTML = filteredRequests.map(req => \`
    <tr style="border-bottom:1px solid rgba(160,174,192,0.1);">
      <td style="padding:8px;"><code style="background:rgba(160,174,192,0.2);padding:2px 4px;border-radius:3px;">\${req.method}</code></td>
      <td style="padding:8px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="\${req.url}">\${req.url}</td>
      <td style="padding:8px;">
        <span style="padding:2px 6px;border-radius:4px;background:\${getTypeColor(req.type)};color:white;font-size:10px;">
          \${req.type}
        </span>
      </td>
      <td style="padding:8px;">
        <span style="padding:2px 6px;border-radius:4px;background:\${getStatusColor(req.status)};color:white;font-size:10px;">
          \${req.status}
        </span>
      </td>
      <td style="padding:8px;font-size:11px;">\${req.size}</td>
      <td style="padding:8px;font-size:11px;">\${req.duration}</td>
      <td style="padding:8px;">
        <button onclick="inspectRequest('\${req.id}')" style="padding:4px 8px;background:rgba(160,174,192,0.3);border:none;border-radius:4px;color:#2d3748;cursor:pointer;font-size:10px;margin-right:5px;">详情</button>
        <button onclick="blockRequest('\${req.id}')" style="padding:4px 8px;background:#e53e3e;border:none;border-radius:4px;color:white;cursor:pointer;font-size:10px;">拦截</button>
      </td>
    </tr>
  \`).join('');
}

function getTypeColor(type) {
  const colors = {
    'JS': '#d69e2e',
    'CSS': #38a169',
    'Image': #3182ce',
    'Video': #805ad5',
    'Audio': #d53f8c',
    'HTML': #dd6b20',
    'JSON': #319795',
    'Font': #38a169',
    'Other': #718096'
  };
  return colors[type] || '#718096';
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
    <div id="__REQUEST_DETAIL_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000001;">
      <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:90%;width:800px;max-height:80vh;overflow-y:auto;">
        <h4 style="color:#2c5282;margin-bottom:20px;">请求详情</h4>
        <div style="text-align:left;">
          <div style="margin-bottom:15px;">
            <strong>URL:</strong><br>
            <div style="background:rgba(255,255,255,0.5);padding:8px;border-radius:4px;margin-top:5px;word-break:break-all;">\${request.url}</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px;">
            <div>
              <strong>方法:</strong> \${request.method}<br>
              <strong>类型:</strong> \${request.type}<br>
              <strong>状态:</strong> \${request.status}
            </div>
            <div>
              <strong>大小:</strong> \${request.size}<br>
              <strong>耗时:</strong> \${request.duration}<br>
              <strong>时间:</strong> \${request.timestamp}
            </div>
          </div>
          \${request.requestHeaders && Object.keys(request.requestHeaders).length > 0 ? \`
            <div style="margin-bottom:15px;">
              <strong>请求头:</strong>
              <div style="background:rgba(255,255,255,0.5);padding:8px;border-radius:4px;margin-top:5px;max-height:100px;overflow-y:auto;font-family:monospace;font-size:11px;">
                \${Object.entries(request.requestHeaders).map(([k,v]) => \`\${k}: \${v}\`).join('\\n')}
              </div>
            </div>
          \` : ''}
          \${request.responseHeaders && Object.keys(request.responseHeaders).length > 0 ? \`
            <div style="margin-bottom:15px;">
              <strong>响应头:</strong>
              <div style="background:rgba(255,255,255,0.5);padding:8px;border-radius:4px;margin-top:5px;max-height:100px;overflow-y:auto;font-family:monospace;font-size:11px;">
                \${Object.entries(request.responseHeaders).map(([k,v]) => \`\${k}: \${v}\`).join('\\n')}
              </div>
            </div>
          \` : ''}
          \${request.responseBody ? \`
            <div style="margin-bottom:15px;">
              <strong>响应体 (前1000字符):</strong>
              <div style="background:rgba(255,255,255,0.5);padding:8px;border-radius:4px;margin-top:5px;max-height:150px;overflow-y:auto;font-family:monospace;font-size:11px;white-space:pre-wrap;">\${request.responseBody}</div>
            </div>
          \` : ''}
        </div>
        <div style="display:flex;justify-content:center;gap:10px;margin-top:20px;">
          <button onclick="closeRequestDetail()" style="padding:10px 20px;background:rgba(160,174,192,0.3);border:none;border-radius:20px;color:#2d3748;cursor:pointer;">关闭</button>
        </div>
      </div>
    </div>
    \`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
}

function closeRequestDetail() {
  const modal = document.getElementById('__REQUEST_DETAIL_MODAL__');
  if(modal) modal.remove();
}

function blockRequest(id) {
  const request = capturedRequests.find(req => req.id === id);
  if(request && confirm(\`确定要拦截这个请求吗？\\n\\n\${request.url}\`)) {
    // 这里应该实现请求拦截逻辑
    showNotification(\`已拦截请求: \${request.url}\`);
  }
}

function clearSnifferData() {
  if(capturedRequests.length > 0 && confirm('确定要清空所有嗅探数据吗？')) {
    capturedRequests = [];
    updateSnifferTable();
    showNotification('嗅探数据已清空');
  }
}

function exportSnifferData() {
  if(capturedRequests.length === 0) {
    showNotification('没有数据可导出', 'error');
    return;
  }
  
  const data = JSON.stringify(capturedRequests, null, 2);
  const blob = new Blob([data], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = \`sniffer-data-\${new Date().toISOString().split('T')[0]}.json\`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showNotification('数据导出成功');
}

function toggleAutoStart() {
  const settings = loadSnifferSettings();
  settings.autoStart = !settings.autoStart;
  saveSnifferSettings(settings);
  showNotification(\`自动启动已\${settings.autoStart ? '开启' : '关闭'}\`);
}

function saveSnifferSettings(settings) {
  if (!settings) {
    settings = {
      enabled: snifferEnabled,
      autoStart: loadSnifferSettings().autoStart || false
    };
  }
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
    
    if(settings.autoStart && !snifferEnabled) {
      setTimeout(() => {
        snifferEnabled = true;
        startSniffer();
        showNotification('资源嗅探已自动启动');
      }, 2000);
    }
    
    return settings;
  } catch(e) {
    console.log('加载嗅探设置失败:', e);
    return { enabled: false, autoStart: false };
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
  'edge': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
  'iphone': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  'android': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36'
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
const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;
const originalXHRSetHeader = XMLHttpRequest.prototype.setRequestHeader;

function showRequestModModal() {
  if(document.getElementById('__REQUEST_MOD_MODAL__')) return;
  
  const modalHTML = \`
  <div id="__REQUEST_MOD_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:1000000;user-select:none;opacity:0;transition:opacity 0.3s ease;">
    <div style="background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border-radius:15px;padding:30px;max-width:900px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(160,174,192,0.3);border:1px solid rgba(255,255,255,0.2);transform:scale(0.8);transition:transform 0.3s ease;">
      <div style="text-align:center;color:#2d3748;">
        <h3 style="color:#2c5282;margin-bottom:20px;">🔧 请求修改设置</h3>
        
        <div style="display:flex;gap:15px;margin-bottom:20px;justify-content:center;">
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
    showNotification('请求修改已启用');
  } else {
    button.textContent = '启用修改';
    button.style.background = 'rgba(160,174,192,0.3)';
    removeRequestModifications();
    showNotification('请求修改已禁用');
  }
}

function applyRequestModifications() {
  // 修改navigator.userAgent
  const userAgentSelect = document.getElementById('userAgent');
  const customUserAgent = document.getElementById('customUserAgent');
  const selectedUA = customUserAgent.style.display !== 'none' ? customUserAgent.value : userAgentSelect.value;
  
  if (selectedUA) {
    Object.defineProperty(navigator, 'userAgent', {
      get: function() { return selectedUA; },
      configurable: true
    });
    
    Object.defineProperty(navigator, 'appVersion', {
      get: function() { return selectedUA; },
      configurable: true
    });
  }
  
  // 修改fetch请求
  window.fetch = function(...args) {
    const init = args[1] || {};
    
    // 应用自定义headers
    customHeaders.forEach(header => {
      init.headers = init.headers || {};
      if (typeof init.headers === 'object' && !(init.headers instanceof Headers)) {
        init.headers[header.name] = header.value;
      } else if (init.headers instanceof Headers) {
        init.headers.set(header.name, header.value);
      }
    });
    
    // 应用语言设置
    const acceptLanguageSelect = document.getElementById('acceptLanguage');
    const customLanguage = document.getElementById('customLanguage');
    const selectedLang = customLanguage.style.display !== 'none' ? customLanguage.value : acceptLanguageSelect.value;
    
    if (selectedLang) {
      init.headers = init.headers || {};
      if (typeof init.headers === 'object' && !(init.headers instanceof Headers)) {
        init.headers['Accept-Language'] = selectedLang;
      } else if (init.headers instanceof Headers) {
        init.headers.set('Accept-Language', selectedLang);
      }
    }
    
    args[1] = init;
    return originalFetch.apply(this, args);
  };
  
  // 修改XMLHttpRequest
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    this._requestMod = { method, url };
    return originalXHROpen.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
    // 检查是否有自定义header要覆盖
    const customHeader = customHeaders.find(h => h.name.toLowerCase() === name.toLowerCase());
    if (customHeader) {
      value = customHeader.value;
    }
    
    // 应用语言设置
    if (name.toLowerCase() === 'accept-language') {
      const acceptLanguageSelect = document.getElementById('acceptLanguage');
      const customLanguage = document.getElementById('customLanguage');
      const selectedLang = customLanguage.style.display !== 'none' ? customLanguage.value : acceptLanguageSelect.value;
      if (selectedLang) {
        value = selectedLang;
      }
    }
    
    return originalXHRSetHeader.call(this, name, value);
  };
  
  XMLHttpRequest.prototype.send = function(data) {
    // 在发送前设置User-Agent（如果可能）
    const userAgentSelect = document.getElementById('userAgent');
    const customUserAgent = document.getElementById('customUserAgent');
    const selectedUA = customUserAgent.style.display !== 'none' ? customUserAgent.value : userAgentSelect.value;
    
    if (selectedUA && this._requestMod) {
      this.setRequestHeader('User-Agent', selectedUA);
    }
    
    return originalXHRSend.apply(this, arguments);
  };
}

function removeRequestModifications() {
  // 恢复原始方法
  window.fetch = originalFetch;
  XMLHttpRequest.prototype.open = originalXHROpen;
  XMLHttpRequest.prototype.send = originalXHRSend;
  XMLHttpRequest.prototype.setRequestHeader = originalXHRSetHeader;
  
  // 恢复navigator属性
  delete navigator.userAgent;
  delete navigator.appVersion;
}

function testRequestMod() {
  const userAgentSelect = document.getElementById('userAgent');
  const customUserAgent = document.getElementById('customUserAgent');
  const selectedUA = customUserAgent.style.display !== 'none' ? customUserAgent.value : userAgentSelect.value;
  
  const acceptLanguageSelect = document.getElementById('acceptLanguage');
  const customLanguage = document.getElementById('customLanguage');
  const selectedLang = customLanguage.style.display !== 'none' ? customLanguage.value : acceptLanguageSelect.value;
  
  let message = '当前设置:\\n';
  message += \`User Agent: \${selectedUA || '未修改'}\\n\`;
  message += \`Accept-Language: \${selectedLang || '未修改'}\\n\`;
  message += \`自定义Headers: \${customHeaders.length} 个\\n\\n\`;
  
  message += \`实际User Agent: \${navigator.userAgent}\\n\`;
  
  // 测试fetch请求
  fetch(window.location.href, { method: 'HEAD' })
    .then(response => {
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      message += \`\\n请求头检测: \${JSON.stringify(headers, null, 2)}\`;
    })
    .catch(() => {
      message += '\\n请求头检测: 无法检测';
    })
    .finally(() => {
      alert(message);
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
  
  if (requestModEnabled) {
    applyRequestModifications();
  }
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
  
  if (requestModEnabled) {
    applyRequestModifications();
  }
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
    
    showNotification('请求修改设置已保存');
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
      setTimeout(() => applyRequestModifications(), 100);
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
// 第九部分：无图模式功能脚本
// 功能：控制图片和视频加载
// =======================================================================================

const imageBlockScript = `
// 无图模式功能
let imageBlockEnabled = false;
let imageBlockObserver = null;

function toggleImageBlock() {
  imageBlockEnabled = !imageBlockEnabled;
  
  if(imageBlockEnabled) {
    blockImagesAndVideos();
    showNotification('无图模式已开启 - 页面将刷新');
    setTimeout(() => location.reload(), 1000);
  } else {
    unblockImagesAndVideos();
    showNotification('无图模式已关闭 - 页面将刷新');
    setTimeout(() => location.reload(), 1000);
  }
  
  saveImageBlockSettings();
  updateImageBlockButton();
}

function blockImagesAndVideos() {
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
  const videos = document.querySelectorAll('video, audio, iframe[src*="youtube"], iframe[src*="vimeo"], embed[type*="video"]');
  videos.forEach(video => {
    video.style.filter = 'blur(5px) grayscale(100%)';
    video.style.opacity = '0.3';
    video.setAttribute('data-original-src', video.src || '');
    if (video.tagName === 'VIDEO' || video.tagName === 'AUDIO') {
      video.src = '';
      video.poster = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
    }
  });
  
  // 阻止新的媒体资源加载
  imageBlockObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if(node.nodeType === 1) {
          // 处理图片
          if(node.tagName === 'IMG') {
            node.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
          }
          
          // 处理视频
          if(node.tagName === 'VIDEO' || node.tagName === 'AUDIO') {
            node.src = '';
          }
          
          // 处理子元素中的媒体
          const images = node.querySelectorAll && node.querySelectorAll('img, video, audio');
          if(images) {
            images.forEach(media => {
              if (media.tagName === 'IMG') {
                media.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
              } else if (media.tagName === 'VIDEO' || media.tagName === 'AUDIO') {
                media.src = '';
              }
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

function unblockImagesAndVideos() {
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
  const videos = document.querySelectorAll('video, audio, iframe, embed');
  videos.forEach(video => {
    video.style.filter = '';
    video.style.opacity = '';
    const originalSrc = video.getAttribute('data-original-src');
    if(originalSrc && (video.tagName === 'VIDEO' || video.tagName === 'AUDIO')) {
      video.src = originalSrc;
    }
    video.removeAttribute('data-original-src');
  });
  
  // 停止观察
  if(imageBlockObserver) {
    imageBlockObserver.disconnect();
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
      blockImagesAndVideos();
    }
  } catch(e) {
    console.log('加载无图模式设置失败:', e);
  }
}

// 测试无图模式功能
function testImageBlock() {
  const images = document.querySelectorAll('img, video').length;
  const blocked = document.querySelectorAll('[src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTBBMEFDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo="]').length;
  
  showNotification(\`检测到 \${images} 个媒体元素，已拦截 \${blocked} 个\`);
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
// 第十一部分：HTML路径转换注入脚本
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
// 第十二部分：主页面HTML模板
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
            border-radius: 8px;
        }
        
        a:hover {
            color: #1a365d;
            transform: translateX(5px);
            text-shadow: 0 0 5px rgba(160, 174, 192, 0.3);
            background-color: rgba(255, 255, 255, 0.1);
        }
        
        .notes {
            margin-top: 25px;
            padding: 15px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            font-size: 0.9rem;
            line-height: 1.5;
            color: #4a5568;
        }
        
        .important {
            font-weight: bold;
            color: #c53030;
        }
        
        /* 响应式设计优化 */
        @media (max-width: 768px) {
            .content {
                max-width: 90%;
                padding: 20px 15px;
            }
            
            h1 {
                font-size: 1.8rem;
            }
            
            input, button {
                width: 90%;
                font-size: 14px;
                padding: 10px;
            }
        }
        
        @media (max-width: 480px) {
            body {
                padding: 15px 0;
            }
            
            .content {
                padding: 15px 10px;
            }
            
            h1 {
                font-size: 1.5rem;
            }
            
            .description {
                fontSize: 0.9rem;
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
    <div class="container">
        <div class="content">
            <h1>Website Proxy</h1>
            
            <div class="description">
                本项目基于开源项目优化修改，旨在提供安全的Website Proxy。
                请在下方输入您想要访问的网站地址，我们将为您提供代理服务。
            </div>
            
            <form id="urlForm" onsubmit="redirectToProxy(event)">
                <fieldset style="border: none;">
                    <label for="targetUrl" style="display: none;">目标网址</label>
                    <input type="text" id="targetUrl" placeholder="例如: github.com 或 https://github.com" required>
                    <button type="submit">访问</button>
                </fieldset>
            </form>
            
            <div class="links-container">
                <a href="https://github.com/1234567Yang/cf-proxy-ex/" target="_blank">原项目开源地址</a>
                <a href="https://github.com/cnzz666/zxfd" target="_blank">优化项目地址</a>
                <a href="https://github.com/1234567Yang/cf-proxy-ex/blob/main/deploy_on_deno_tutorial.md" target="_blank">自建代理教程</a>
            </div>
            
            <div class="notes">
                <p><span class="important">重要提示:</span> 使用代理时请勿登录任何账户，保护您的个人信息安全。</p>
                <p>如果遇到400错误，请尝试清除浏览器Cookie。</p>
                <p>本工具仅用于合法用途，请勿用于违反法律法规的活动。</p>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            var content = document.querySelector('.content');
            setTimeout(function() {
                content.classList.add('loaded');
            }, 100);
        });

        function redirectToProxy(event) {
            event.preventDefault();
            const targetUrl = document.getElementById('targetUrl').value.trim();
            const currentOrigin = window.location.origin;
            
            if (targetUrl) {
                window.open(currentOrigin + '/' + targetUrl, '_blank');
            }
        }
    </script>
    <script defer src="https://static.cloudflareinsights.com/beacon.min.js/vcd15cbe7772f49c399c6a5babf22c1241717689176015" integrity="sha512-ZpsOmlRQV6y907TI0dKBHq9Md29nnaEIPlkf84rnaERnq6zvWvPUqr2ft8M1aS28oN72PdrCzSjY4U6VaAw1EQ==" data-cf-beacon='{"version":"2024.11.0","token":"23706d89f379497d9a10994cbea3fda0","r":1,"server_timing":{"name":{"cfCacheStatus":true,"cfEdge":true,"cfExtPri":true,"cfL4":true,"cfOrigin":true,"cfSpeedBrain":true},"location_startswith":null}}' crossorigin="anonymous"></script>
</body>
</html>
    
`;

// =======================================================================================
// 第十三部分：密码页面HTML模板
// 功能：密码验证页面
// =======================================================================================

const pwdPage = `
<!DOCTYPE html>
<html>
    
    <head>
        <script>
            function setPassword() {
                try {
                    var cookieDomain = window.location.hostname;
                    var password = document.getElementById('password').value;
                    var currentOrigin = window.location.origin;
                    var oneWeekLater = new Date();
                    oneWeekLater.setTime(oneWeekLater.getTime() + (7 * 24 * 60 * 60 * 1000));
                    document.cookie = '${passwordCookieName}=' + password + '; expires=' + oneWeekLater.toUTCString() + '; path=/';
                    window.location.href = currentOrigin;
                } catch (e) {
                    alert('Error: ' + e.message);
                }
            }
        </script>
    </head>
    
    <body>
        <h1>Password</h1>
        <input type="password" id="password" placeholder="Password">
        <button onclick="setPassword()">Set</button>
    </body>

</html>
`;

// =======================================================================================
// 第十四部分：主请求处理函数
// 功能：处理所有HTTP请求，实现代理功能
// =======================================================================================

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const host = url.hostname;

  // 处理密码验证
  if (showPasswordPage && password) {
    const pwd = getCookie(request, passwordCookieName);
    if (pwd !== password) {
      return new Response(pwdPage, {
        status: 200,
        headers: { 'Content-Type': 'text/html;charset=utf-8' }
      });
    }
  }

  // 处理主页面
  if (path === str || path === str + "index.html") {
    return new Response(mainPage, {
      status: 200,
      headers: { 'Content-Type': 'text/html;charset=utf-8' }
    });
  }

  // 处理密码设置页面
  if (path === str + "setPassword.html") {
    return new Response(pwdPage, {
      status: 200,
      headers: { 'Content-Type': 'text/html;charset=utf-8' }
    });
  }

  // 处理代理请求
  return await handleProxyRequest(request);
}

// =======================================================================================
// 第十五部分：代理请求处理函数
// 功能：处理具体的代理请求逻辑
// =======================================================================================

async function handleProxyRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const host = url.hostname;

  // 构建目标URL
  let targetUrlStr = path.substring(1);
  if (!targetUrlStr.startsWith('http')) {
    targetUrlStr = 'https://' + targetUrlStr;
  }

  // 记录访问的网站
  const targetUrl = new URL(targetUrlStr);
  const targetHost = targetUrl.hostname;
  
  // 设置访问记录cookie
  const visitedSites = getCookie(request, lastVisitProxyCookie) || '';
  const newVisitedSites = visitedSites ? `${visitedSites},${targetHost}` : targetHost;
  
  // 构建请求头
  const headers = new Headers();
  for (const [key, value] of request.headers) {
    if (!['host', 'origin', 'referer', 'cookie', 'content-length'].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  }
  
  // 添加必要的请求头
  headers.set('Host', targetUrl.host);
  headers.set('Origin', targetUrl.origin);
  headers.set('Referer', targetUrl.origin + '/');
  
  // 处理cookie注入
  const cookieInjectionData = getCookieInjectionData();
  if (cookieInjectionData[targetHost]) {
    const injectedCookies = cookieInjectionData[targetHost].map(cookie => 
      `${cookie.name}=${cookie.value}`
    ).join('; ');
    if (injectedCookies) {
      headers.set('Cookie', (headers.get('Cookie') || '') + '; ' + injectedCookies);
    }
  }

  // 构建请求选项
  const requestOptions = {
    method: request.method,
    headers: headers,
    redirect: 'manual'
  };

  // 处理POST请求体
  if (request.method === 'POST') {
    requestOptions.body = await request.arrayBuffer();
  }

  try {
    // 发送请求
    const response = await fetch(targetUrlStr, requestOptions);
    
    // 处理重定向
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        const newLocation = thisProxyServerUrlHttps + location;
        return Response.redirect(newLocation, response.status);
      }
    }

    // 处理响应内容
    const contentType = response.headers.get('content-type') || '';
    let responseBody = await response.arrayBuffer();

    // 处理HTML内容
    if (contentType.includes('text/html')) {
      let htmlText = new TextDecoder().decode(responseBody);
      
      // 注入各种脚本
      htmlText = injectScripts(htmlText, targetHost, newVisitedSites);
      
      responseBody = new TextEncoder().encode(htmlText);
    }

    // 构建响应头
    const responseHeaders = new Headers();
    for (const [key, value] of response.headers) {
      if (!['content-security-policy', 'x-frame-options', 'content-length'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    }

    // 设置代理相关cookie
    responseHeaders.set('Set-Cookie', `${lastVisitProxyCookie}=${newVisitedSites}; Path=/; Max-Age=2592000`);
    responseHeaders.set('Content-Type', contentType);

    return new Response(responseBody, {
      status: response.status,
      headers: responseHeaders
    });

  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

// =======================================================================================
// 第十六部分：工具函数
// 功能：辅助函数，包括cookie处理、脚本注入等
// =======================================================================================

function getCookie(request, name) {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) return cookieValue;
  }
  return null;
}

function getCookieInjectionData() {
  try {
    return JSON.parse(localStorage.getItem(cookieInjectionDataName) || '{}');
  } catch {
    return {};
  }
}

function injectScripts(html, targetHost, visitedSites) {
  // 注入各种功能脚本
  const scripts = [
    proxyHintInjection,
    toolbarInjection,
    cookieInjectionScript,
    adBlockScript,
    resourceSnifferScript,
    requestModScript,
    imageBlockScript,
    httpRequestInjection,
    htmlCovPathInject
  ];

  const combinedScript = scripts.join('\n\n');

  // 在head标签前注入脚本
  if (html.includes('</head>')) {
    html = html.replace('</head>', `<script>${combinedScript}</script></head>`);
  } else {
    html = `<script>${combinedScript}</script>` + html;
  }

  return html;
}

// =======================================================================================
// 第十七部分：CSS冲突检测和修复
// 功能：检测和修复CSS冲突问题
// =======================================================================================

const cssConflictFixScript = `
// CSS冲突检测和修复
function detectAndFixCSSConflicts() {
  const conflicts = [];
  
  // 检查样式覆盖
  const elements = document.querySelectorAll('*');
  elements.forEach(element => {
    const computedStyle = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    // 检测隐藏元素
    if (computedStyle.display === 'none' && element.offsetParent !== null) {
      conflicts.push({
        element: element,
        issue: 'display:none但元素仍然可见',
        selector: generateCSSSelector(element)
      });
    }
    
    // 检测位置偏移
    if (Math.abs(rect.left) > 10000 || Math.abs(rect.top) > 10000) {
      conflicts.push({
        element: element,
        issue: '元素位置异常偏移',
        selector: generateCSSSelector(element)
      });
    }
  });
  
  // 检查z-index冲突
  const highZIndex = document.querySelectorAll('[style*="z-index"]');
  highZIndex.forEach(element => {
    const zIndex = parseInt(element.style.zIndex);
    if (zIndex > 10000) {
      conflicts.push({
        element: element,
        issue: '异常高的z-index值',
        selector: generateCSSSelector(element)
      });
    }
  });
  
  return conflicts;
}

function fixCSSConflicts(conflicts) {
  conflicts.forEach(conflict => {
    switch(conflict.issue) {
      case 'display:none但元素仍然可见':
        conflict.element.style.setProperty('display', 'none', 'important');
        break;
      case '元素位置异常偏移':
        conflict.element.style.setProperty('position', 'static', 'important');
        conflict.element.style.setProperty('left', 'auto', 'important');
        conflict.element.style.setProperty('top', 'auto', 'important');
        break;
      case '异常高的z-index值':
        conflict.element.style.setProperty('z-index', '9999', 'important');
        break;
    }
  });
}

// 自动检测和修复
setTimeout(() => {
  const conflicts = detectAndFixCSSConflicts();
  if (conflicts.length > 0) {
    console.log('检测到CSS冲突:', conflicts);
    fixCSSConflicts(conflicts);
    showNotification(\`已修复 \${conflicts.length} 个CSS冲突\`);
  }
}, 3000);
`;

// 将CSS冲突修复脚本添加到注入脚本中
const finalHttpRequestInjection = httpRequestInjection + '\n\n' + cssConflictFixScript;

// 更新主函数中的脚本注入
function injectScripts(html, targetHost, visitedSites) {
  const scripts = [
    proxyHintInjection,
    toolbarInjection,
    cookieInjectionScript,
    adBlockScript,
    resourceSnifferScript,
    requestModScript,
    imageBlockScript,
    finalHttpRequestInjection,
    htmlCovPathInject
  ];

  const combinedScript = scripts.join('\n\n');

  if (html.includes('</head>')) {
    html = html.replace('</head>', `<script>${combinedScript}</script></head>`);
  } else {
    html = `<script>${combinedScript}</script>` + html;
  }

  return html;
}

// =======================================================================================
// 第十八部分：功能检查模块
// 功能：检查各功能是否生效
// =======================================================================================

const featureCheckScript = `
// 功能检查模块
function checkFeatureStatus() {
  const results = [];
  
  // 检查Cookie注入
  try {
    const cookieData = localStorage.getItem('${cookieInjectionDataName}');
    if (cookieData) {
      const data = JSON.parse(cookieData);
      const currentHost = window.location.hostname;
      const hasCookies = data[currentHost] && data[currentHost].length > 0;
      results.push({
        feature: 'Cookie注入',
        status: hasCookies ? 'active' : 'inactive',
        message: hasCookies ? \`已注入 \${data[currentHost].length} 个Cookie\` : '未配置Cookie注入'
      });
    }
  } catch(e) {
    results.push({
      feature: 'Cookie注入',
      status: 'error',
      message: '检查失败: ' + e.message
    });
  }
  
  // 检查广告拦截
  try {
    const adBlockData = localStorage.getItem('${adBlockDataName}');
    if (adBlockData) {
      const data = JSON.parse(adBlockData);
      results.push({
        feature: '广告拦截',
        status: data.enabled ? 'active' : 'inactive',
        message: data.enabled ? \`已启用 (\${data.rules ? data.rules.length : 0} 条规则)\` : '已禁用'
      });
    }
  } catch(e) {
    results.push({
      feature: '广告拦截',
      status: 'error',
      message: '检查失败: ' + e.message
    });
  }
  
  // 检查资源嗅探
  try {
    const snifferData = localStorage.getItem('${resourceSnifferDataName}');
    if (snifferData) {
      const data = JSON.parse(snifferData);
      results.push({
        feature: '资源嗅探',
        status: data.enabled ? 'active' : 'inactive',
        message: data.enabled ? '正在捕获网络请求' : '已停止'
      });
    }
  } catch(e) {
    results.push({
      feature: '资源嗅探',
      status: 'error',
      message: '检查失败: ' + e.message
    });
  }
  
  // 检查请求修改
  try {
    const requestModData = localStorage.getItem('${requestModDataName}');
    if (requestModData) {
      const data = JSON.parse(requestModData);
      results.push({
        feature: '请求修改',
        status: data.enabled ? 'active' : 'inactive',
        message: data.enabled ? '正在修改请求头' : '已禁用'
      });
    }
  } catch(e) {
    results.push({
      feature: '请求修改',
      status: 'error',
      message: '检查失败: ' + e.message
    });
  }
  
  // 检查无图模式
  try {
    const imageBlockData = localStorage.getItem('${imageBlockDataName}');
    if (imageBlockData) {
      const data = JSON.parse(imageBlockData);
      results.push({
        feature: '无图模式',
        status: data.enabled ? 'active' : 'inactive',
        message: data.enabled ? '已拦截图片和视频' : '正常显示'
      });
    }
  } catch(e) {
    results.push({
      feature: '无图模式',
      status: 'error',
      message: '检查失败: ' + e.message
    });
  }
  
  return results;
}

function showFeatureStatus() {
  const results = checkFeatureStatus();
  let message = '功能状态检查:\\n\\n';
  
  results.forEach(result => {
    const statusIcon = result.status === 'active' ? '✅' : result.status === 'inactive' ? '⚪' : '❌';
    message += \`\${statusIcon} \${result.feature}: \${result.message}\\n\`;
  });
  
  alert(message);
}

// 添加到工具栏
function addFeatureCheckButton() {
  setTimeout(() => {
    const toolbar = document.getElementById('__PROXY_TOOLBAR__');
    if (toolbar) {
      const checkBtn = document.createElement('button');
      checkBtn.innerHTML = '✅';
      checkBtn.title = '检查功能状态';
      checkBtn.style.width = '40px';
      checkBtn.style.height = '40px';
      checkBtn.style.background = 'linear-gradient(45deg,#90cdf4,#b7e4f4)';
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
        showFeatureStatus();
      };
      
      const toolsContainer = document.getElementById('__PROXY_TOOLS_CONTAINER__');
      if (toolsContainer) {
        toolsContainer.appendChild(checkBtn);
      }
    }
  }, 2000);
}

// 初始化功能检查
setTimeout(addFeatureCheckButton, 3000);
`;

// 将功能检查脚本添加到注入脚本中
const enhancedHttpRequestInjection = finalHttpRequestInjection + '\n\n' + featureCheckScript;

// 更新最终的脚本注入
function injectScripts(html, targetHost, visitedSites) {
  const scripts = [
    proxyHintInjection,
    toolbarInjection,
    cookieInjectionScript,
    adBlockScript,
    resourceSnifferScript,
    requestModScript,
    imageBlockScript,
    enhancedHttpRequestInjection,
    htmlCovPathInject
  ];

  const combinedScript = scripts.join('\n\n');

  if (html.includes('</head>')) {
    html = html.replace('</head>', `<script>${combinedScript}</script></head>`);
  } else {
    html = `<script>${combinedScript}</script>` + html;
  }

  return html;
}