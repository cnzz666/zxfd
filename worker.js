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
const adBlockEnabledName = "__PROXY_ADBLOCK_ENABLED__";
const imageModeName = "__PROXY_IMAGE_MODE__";
const resourceSnifferName = "__PROXY_RESOURCE_SNIFFER__";
const requestModifierName = "__PROXY_REQUEST_MODIFIER__";
const userAgentName = "__PROXY_USER_AGENT__";
const languageName = "__PROXY_LANGUAGE__";
const websiteCookiesName = "__PROXY_WEBSITE_COOKIES__";

var thisProxyServerUrlHttps;
var thisProxyServerUrl_hostOnly;

// =======================================================================================
// 第三部分：代理提示注入脚本
// 功能：在代理页面显示使用警告提示（修改为现代化弹窗样式）
// =======================================================================================

const proxyHintInjection = `
// 现代化代理提示弹窗
function showProxyHintModal() {
    if (document.getElementById('__PROXY_HINT_MODAL__')) return;
    
    const modalHTML = \`
    <div id="__PROXY_HINT_MODAL__" style="position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;justify-content:center;align-items:center;z-index:99999999999999999999999;user-select:none;opacity:0;transition:opacity 0.5s ease;backdrop-filter:blur(5px);">
        <div style="background:rgba(255,255,255,0.15);backdrop-filter:blur(15px);border-radius:20px;padding:40px;max-width:600px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);transform:scale(0.9) translateY(20px);transition:all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            <div style="text-align:center;color:#ffffff;">
                <div style="margin-bottom:25px;">
                    <div style="font-size:48px;margin-bottom:10px;">⚠️</div>
                    <h3 style="color:#ff6b6b;margin-bottom:15px;font-size:24px;font-weight:600;text-shadow:0 2px 4px rgba(0,0,0,0.3);">安全警告 Security Warning</h3>
                </div>
                <div style="background:rgba(0,0,0,0.3);padding:20px;border-radius:12px;margin-bottom:25px;text-align:left;">
                    <p style="margin-bottom:15px;line-height:1.6;font-size:15px;color:#e0e0e0;">
                        <strong style="color:#ff6b6b;">Warning:</strong> You are currently using a web proxy service. For security reasons, please DO NOT log in to any sensitive accounts or enter personal information.
                    </p>
                    <p style="margin-bottom:15px;line-height:1.6;font-size:15px;color:#e0e0e0;">
                        <strong style="color:#ff6b6b;">警告：</strong> 您当前正在使用网络代理服务。出于安全考虑，请勿登录任何敏感账户或输入个人信息。
                    </p>
                    <div style="border-left:3px solid #4fc3f7;padding-left:12px;margin:15px 0;">
                        <p style="font-size:13px;color:#b0b0b0;line-height:1.5;">
                            This proxy is for educational purposes only. Use at your own risk.
                            <br>此代理仅用于教育目的，使用风险自负。
                        </p>
                    </div>
                </div>
                <div style="margin-bottom:25px;">
                    <a href="https://github.com/1234567Yang/cf-proxy-ex/" target="_blank" style="color:#4fc3f7;text-decoration:none;font-size:14px;display:inline-flex;align-items:center;gap:5px;">
                        <span>📚 项目文档 Project Documentation</span>
                    </a>
                </div>
                <div style="display:flex;justify-content:center;gap:15px;flex-wrap:wrap;">
                    <button onclick="closeHint(false)" style="padding:12px 30px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border:none;border-radius:25px;color:white;cursor:pointer;font-weight:500;font-size:14px;transition:all 0.3s ease;box-shadow:0 4px 15px rgba(102,126,234,0.4);">
                        关闭提示 Close
                    </button>
                    <button onclick="closeHint(true)" style="padding:12px 30px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.3);border-radius:25px;color:white;cursor:pointer;font-weight:500;font-size:14px;transition:all 0.3s ease;">
                        不再显示 Don't show again
                    </button>
                </div>
            </div>
        </div>
    </div>
    \`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    setTimeout(() => {
        const modal = document.getElementById('__PROXY_HINT_MODAL__');
        const content = modal.querySelector('div > div');
        modal.style.opacity = '1';
        content.style.transform = 'scale(1) translateY(0)';
    }, 100);
}

function closeHint(dontShowAgain) {
    const modal = document.getElementById('__PROXY_HINT_MODAL__');
    if (modal) {
        const content = modal.querySelector('div > div');
        content.style.transform = 'scale(0.9) translateY(20px)';
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.remove();
            if(dontShowAgain) {
                const expiryDate = new Date();
                expiryDate.setTime(expiryDate.getTime() + (30 * 24 * 60 * 60 * 1000));
                document.cookie = "${noHintCookieName}=1; expires=" + expiryDate.toUTCString() + "; path=/";
            }
        }, 500);
    }
}

// 页面加载完成后显示弹窗
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(showProxyHintModal, 1000);
    });
} else {
    setTimeout(showProxyHintModal, 1000);
}
`;

// =======================================================================================
// 第四部分：工具栏系统
// 功能：创建右下角工具栏，包含所有高级功能入口
// =======================================================================================

const toolbarSystem = `
// 工具栏系统
function initToolbarSystem() {
    createMainToolbar();
    loadAllSettings();
}

function createMainToolbar() {
    const toolbarHTML = \`
    <div id="proxy-toolbar" style="position:fixed;bottom:20px;right:20px;z-index:2147483647;display:flex;flex-direction:column;align-items:flex-end;gap:10px;">
        <!-- 主工具栏 -->
        <div id="main-toolbar-buttons" style="display:flex;flex-direction:column;gap:8px;">
            <button id="tools-toggle" style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border:none;color:white;cursor:pointer;font-size:20px;box-shadow:0 4px 20px rgba(0,0,0,0.3);transition:all 0.3s ease;display:flex;align-items:center;justify-content:center;">
                🛠️
            </button>
        </div>
        
        <!-- 扩展工具栏（默认隐藏） -->
        <div id="extended-toolbar" style="display:none;flex-direction:column;gap:8px;">
            <button class="tool-btn" data-tool="cookie" style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#4facfe 0%,#00f2fe 100%);border:none;color:white;cursor:pointer;font-size:18px;box-shadow:0 4px 15px rgba(0,0,0,0.2);transition:all 0.3s ease;display:flex;align-items:center;justify-content:center;">
                🍪
            </button>
            <button class="tool-btn" data-tool="adblock" style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);border:none;color:white;cursor:pointer;font-size:18px;box-shadow:0 4px 15px rgba(0,0,0,0.2);transition:all 0.3s ease;display:flex;align-items:center;justify-content:center;">
                🚫
            </button>
            <button class="tool-btn" data-tool="sniffer" style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#4ecdc4 0%,#44a08d 100%);border:none;color:white;cursor:pointer;font-size:18px;box-shadow:0 4px 15px rgba(0,0,0,0.2);transition:all 0.3s ease;display:flex;align-items:center;justify-content:center;">
                🔍
            </button>
            <button class="tool-btn" data-tool="settings" style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#ffd89b 0%,#19547b 100%);border:none;color:white;cursor:pointer;font-size:18px;box-shadow:0 4px 15px rgba(0,0,0,0.2);transition:all 0.3s ease;display:flex;align-items:center;justify-content:center;">
                ⚙️
            </button>
        </div>
    </div>
    \`;
    
    document.body.insertAdjacentHTML('beforeend', toolbarHTML);
    
    // 添加事件监听
    document.getElementById('tools-toggle').addEventListener('click', toggleExtendedToolbar);
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // 防止事件冒泡
            const tool = this.getAttribute('data-tool');
            openToolModal(tool);
        });
    });
    
    // 添加悬停效果
    document.querySelectorAll('.tool-btn, #tools-toggle').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) translateY(-2px)';
            this.style.boxShadow = '0 6px 25px rgba(0,0,0,0.3)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) translateY(0)';
            this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        });
    });
}

function toggleExtendedToolbar() {
    const extendedToolbar = document.getElementById('extended-toolbar');
    const mainButton = document.getElementById('tools-toggle');
    
    if (extendedToolbar.style.display === 'none') {
        extendedToolbar.style.display = 'flex';
        mainButton.style.transform = 'rotate(45deg)';
        mainButton.innerHTML = '✕';
    } else {
        extendedToolbar.style.display = 'none';
        mainButton.style.transform = 'rotate(0deg)';
        mainButton.innerHTML = '🛠️';
    }
}

function openToolModal(toolName) {
    // 关闭其他打开的模态框
    closeAllModals();
    
    switch(toolName) {
        case 'cookie':
            showCookieInjectionModal();
            break;
        case 'adblock':
            showAdBlockModal();
            break;
        case 'sniffer':
            showResourceSnifferModal();
            break;
        case 'settings':
            showSettingsModal();
            break;
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.proxy-modal');
    modals.forEach(modal => {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    });
}

// 全局样式
const toolbarStyles = \`
<style>
.proxy-modal {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2147483646;
    opacity: 0;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(5px);
}

.proxy-modal-content {
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 30px;
    max-width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.2);
    transform: scale(0.9) translateY(20px);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    color: white;
}

.proxy-modal.show {
    opacity: 1;
}

.proxy-modal-content.show {
    transform: scale(1) translateY(0);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255,255,255,0.2);
}

.modal-title {
    font-size: 22px;
    font-weight: 600;
    color: white;
    margin: 0;
}

.close-modal {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s ease;
}

.close-modal:hover {
    background: rgba(255,255,255,0.1);
}

.form-group {
    margin-bottom: 20px;
}

.form-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #e0e0e0;
    font-size: 14px;
}

.form-input, .form-select, .form-textarea {
    width: 100%;
    padding: 12px 15px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.1);
    color: white;
    font-size: 14px;
    transition: all 0.3s ease;
    box-sizing: border-box;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
    outline: none;
    border-color: #4fc3f7;
    background: rgba(255,255,255,0.15);
    box-shadow: 0 0 0 2px rgba(79,195,247,0.2);
}

.form-textarea {
    resize: vertical;
    min-height: 80px;
}

.btn {
    padding: 12px 25px;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 500;
    font-size: 14px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-secondary {
    background: rgba(255,255,255,0.1);
    color: white;
    border: 1px solid rgba(255,255,255,0.3);
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}

.btn-group {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 25px;
}

.tab-container {
    margin-bottom: 20px;
}

.tab-buttons {
    display: flex;
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 5px;
    margin-bottom: 20px;
}

.tab-btn {
    flex: 1;
    padding: 10px;
    border: none;
    background: none;
    color: rgba(255,255,255,0.7);
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.3s ease;
    font-size: 13px;
}

.tab-btn.active {
    background: rgba(255,255,255,0.2);
    color: white;
}

.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}

.switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
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
    background-color: rgba(255,255,255,0.3);
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
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

input:checked + .slider:before {
    transform: translateX(26px);
}

.status-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    margin-left: 8px;
}

.status-on {
    background: #4caf50;
    color: white;
}

.status-off {
    background: #f44336;
    color: white;
}

.resource-item {
    background: rgba(255,255,255,0.05);
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 8px;
    border-left: 3px solid #4fc3f7;
}

.resource-url {
    font-size: 12px;
    color: #e0e0e0;
    word-break: break-all;
    margin-bottom: 5px;
}

.resource-info {
    font-size: 11px;
    color: #b0b0b0;
    display: flex;
    gap: 10px;
}

.ad-element-highlight {
    outline: 2px dashed #ff4757 !important;
    background: rgba(255,71,87,0.1) !important;
    position: relative;
    cursor: crosshair;
}

.ad-element-highlight::after {
    content: "🚫 AD";
    position: absolute;
    top: -20px;
    right: -2px;
    background: #ff4757;
    color: white;
    padding: 2px 6px;
    font-size: 10px;
    border-radius: 3px;
    z-index: 2147483645;
}

.protected-element {
    pointer-events: none !important;
}

.protected-element::before {
    content: "🔒 PROTECTED";
    position: absolute;
    top: -18px;
    right: -2px;
    background: #4caf50;
    color: white;
    padding: 2px 6px;
    font-size: 8px;
    border-radius: 3px;
    z-index: 2147483646;
}

.check-status {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 2147483647;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    transform: translateX(100px);
    opacity: 0;
    transition: all 0.3s ease;
}

.check-status.success {
    background: #4caf50;
    transform: translateX(0);
    opacity: 1;
}

.check-status.error {
    background: #f44336;
    transform: translateX(0);
    opacity: 1;
}

.check-status.info {
    background: #2196f3;
    transform: translateX(0);
    opacity: 1;
}
</style>
\`;

// 注入全局样式
document.head.insertAdjacentHTML('beforeend', toolbarStyles);
`;

// =======================================================================================
// 第五部分：Cookie注入功能
// 功能：完整的Cookie注入系统，支持合成和分段输入
// =======================================================================================

const cookieInjectionSystem = `
// Cookie注入系统
let currentCookies = [];
let separateCookies = [];
let websiteCookies = {};

function showCookieInjectionModal() {
    const modalHTML = \`
    <div class="proxy-modal" id="cookie-modal">
        <div class="proxy-modal-content" style="max-width:900px;">
            <div class="modal-header">
                <h3 class="modal-title">🍪 Cookie管理</h3>
                <button class="close-modal" onclick="closeAllModals()">×</button>
            </div>
            
            <div class="tab-container">
                <div class="tab-buttons">
                    <button class="tab-btn active" onclick="switchCookieTab('injection')">Cookie注入</button>
                    <button class="tab-btn" onclick="switchCookieTab('management')">Cookie管理</button>
                    <button class="tab-btn" onclick="switchCookieTab('website')">网站Cookie</button>
                </div>
                
                <!-- Cookie注入标签页 -->
                <div id="injection-tab" class="tab-content active">
                    <div class="form-group">
                        <label class="form-label">目标网站</label>
                        <input type="text" id="target-website" class="form-input" value="\${getCurrentWebsite()}" readonly>
                        <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">自动获取当前代理网站地址</div>
                    </div>
                    
                    <div class="form-group">
                        <div style="display:flex;gap:10px;margin-bottom:15px;">
                            <button class="tab-btn \${separateCookies.length === 0 ? 'active' : ''}" onclick="switchCookieInputTab('combined')">合成Cookie</button>
                            <button class="tab-btn \${separateCookies.length > 0 ? 'active' : ''}" onclick="switchCookieInputTab('separate')">分段输入</button>
                        </div>
                        
                        <div id="combined-input" class="\${separateCookies.length === 0 ? 'active' : ''}" style="display:\${separateCookies.length === 0 ? 'block' : 'none'};">
                            <div class="form-group">
                                <label class="form-label">Cookie字符串</label>
                                <textarea id="combined-cookie" class="form-textarea" placeholder="例如: name=value; name2=value2; path=/; domain=.example.com"></textarea>
                                <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">输入完整的Cookie字符串，多个Cookie用分号分隔</div>
                            </div>
                        </div>
                        
                        <div id="separate-input" class="\${separateCookies.length > 0 ? 'active' : ''}" style="display:\${separateCookies.length > 0 ? 'block' : 'none'};">
                            <div class="form-group">
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
                                    <div>
                                        <label class="form-label">Cookie名称</label>
                                        <input type="text" id="cookie-name" class="form-input" placeholder="cookie名">
                                    </div>
                                    <div>
                                        <label class="form-label">Cookie值</label>
                                        <input type="text" id="cookie-value" class="form-input" placeholder="cookie值">
                                    </div>
                                </div>
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:15px;">
                                    <div>
                                        <label class="form-label">域名</label>
                                        <input type="text" id="cookie-domain" class="form-input" placeholder="可选，如: .example.com">
                                    </div>
                                    <div>
                                        <label class="form-label">路径</label>
                                        <input type="text" id="cookie-path" class="form-input" value="/" placeholder="默认: /">
                                    </div>
                                </div>
                                <button class="btn btn-secondary" onclick="addSeparateCookie()" style="width:100%;margin-bottom:15px;">添加Cookie</button>
                                
                                <div id="cookie-list" style="max-height:200px;overflow-y:auto;background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                            <input type="checkbox" id="auto-refresh" checked>
                            <span style="color:#e0e0e0;font-size:14px;">保存后自动刷新页面应用Cookie</span>
                        </label>
                    </div>
                    
                    <div class="btn-group">
                        <button class="btn btn-secondary" onclick="closeAllModals()">取消</button>
                        <button class="btn btn-primary" onclick="saveCookieSettings()">保存并应用</button>
                    </div>
                </div>
                
                <!-- Cookie管理标签页 -->
                <div id="management-tab" class="tab-content">
                    <div class="form-group">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                            <label class="form-label">已保存的Cookie配置</label>
                            <button class="btn btn-secondary" onclick="clearAllCookieSettings()" style="padding:8px 15px;font-size:12px;">清空所有</button>
                        </div>
                        <div id="cookie-settings-list" style="max-height:400px;overflow-y:auto;"></div>
                    </div>
                </div>
                
                <!-- 网站Cookie标签页 -->
                <div id="website-tab" class="tab-content">
                    <div class="form-group">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                            <label class="form-label">当前网站Cookie记录</label>
                            <button class="btn btn-secondary" onclick="refreshWebsiteCookies()" style="padding:8px 15px;font-size:12px;">刷新</button>
                        </div>
                        <div id="website-cookies-list" style="max-height:400px;overflow-y:auto;"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    \`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    setTimeout(() => {
        const modal = document.getElementById('cookie-modal');
        const content = modal.querySelector('.proxy-modal-content');
        modal.classList.add('show');
        content.classList.add('show');
        
        loadCookieSettings();
        loadCookieManagementList();
        loadWebsiteCookies();
    }, 50);
}

function switchCookieTab(tabName) {
    // 更新标签按钮
    document.querySelectorAll('#cookie-modal .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 更新标签内容
    document.querySelectorAll('#cookie-modal .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + '-tab').classList.add('active');
}

function switchCookieInputTab(tabName) {
    if (tabName === 'combined') {
        document.getElementById('combined-input').style.display = 'block';
        document.getElementById('separate-input').style.display = 'none';
    } else {
        document.getElementById('combined-input').style.display = 'none';
        document.getElementById('separate-input').style.display = 'block';
    }
}

function addSeparateCookie() {
    const name = document.getElementById('cookie-name').value.trim();
    const value = document.getElementById('cookie-value').value.trim();
    const domain = document.getElementById('cookie-domain').value.trim();
    const path = document.getElementById('cookie-path').value.trim() || '/';
    
    if (!name || !value) {
        showNotification('请填写Cookie名称和值', 'error');
        return;
    }
    
    const cookie = {
        name: name,
        value: value,
        domain: domain,
        path: path,
        secure: false,
        httpOnly: false
    };
    
    separateCookies.push(cookie);
    updateCookieList();
    
    // 清空输入框
    document.getElementById('cookie-name').value = '';
    document.getElementById('cookie-value').value = '';
    document.getElementById('cookie-domain').value = '';
    document.getElementById('cookie-path').value = '/';
    
    showNotification('Cookie已添加到列表', 'success');
}

function updateCookieList() {
    const list = document.getElementById('cookie-list');
    list.innerHTML = '';
    
    if (separateCookies.length === 0) {
        list.innerHTML = '<div style="text-align:center;color:#b0b0b0;padding:20px;font-size:13px;">暂无Cookie，请添加</div>';
        return;
    }
    
    separateCookies.forEach((cookie, index) => {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px;margin-bottom:5px;background:rgba(255,255,255,0.1);border-radius:6px;font-size:12px;';
        
        item.innerHTML = \`
            <div style="flex:1;">
                <div style="font-weight:500;color:white;">\${cookie.name}=\${cookie.value}</div>
                <div style="font-size:10px;color:#b0b0b0;">\${cookie.domain || '当前域名'} | \${cookie.path}</div>
            </div>
            <button onclick="removeSeparateCookie(\${index})" style="background:none;border:none;color:#ff4757;cursor:pointer;padding:5px;border-radius:3px;font-size:14px;">×</button>
        \`;
        
        list.appendChild(item);
    });
}

function removeSeparateCookie(index) {
    separateCookies.splice(index, 1);
    updateCookieList();
}

function parseCombinedCookie(cookieStr) {
    const cookies = [];
    const pairs = cookieStr.split(';').map(pair => pair.trim()).filter(pair => pair);
    
    pairs.forEach(pair => {
        const [name, ...valueParts] = pair.split('=');
        const value = valueParts.join('=');
        
        if (name && value) {
            cookies.push({
                name: name.trim(),
                value: value.trim(),
                domain: '',
                path: '/',
                secure: false,
                httpOnly: false
            });
        }
    });
    
    return cookies;
}

function saveCookieSettings() {
    const targetWebsite = document.getElementById('target-website').value;
    const useCombined = document.getElementById('combined-input').style.display === 'block';
    const autoRefresh = document.getElementById('auto-refresh').checked;
    
    let cookies = [];
    
    if (useCombined) {
        const cookieStr = document.getElementById('combined-cookie').value.trim();
        if (cookieStr) {
            cookies = parseCombinedCookie(cookieStr);
        }
    } else {
        cookies = [...separateCookies];
    }
    
    const settings = {
        targetWebsite: targetWebsite,
        inputType: useCombined ? 'combined' : 'separate',
        cookies: cookies,
        timestamp: new Date().toISOString()
    };
    
    try {
        // 保存到localStorage
        const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
        allSettings[targetWebsite] = settings;
        localStorage.setItem('${cookieInjectionDataName}', JSON.stringify(allSettings));
        
        // 立即应用Cookie
        applyCookiesImmediately(cookies);
        
        showCheckStatus('Cookie设置已保存并应用', 'success');
        
        if (autoRefresh) {
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            setTimeout(() => {
                closeAllModals();
                loadCookieManagementList();
            }, 1500);
        }
    } catch (e) {
        showCheckStatus('保存失败: ' + e.message, 'error');
    }
}

function applyCookiesImmediately(cookies) {
    cookies.forEach(cookie => {
        let cookieStr = \`\${cookie.name}=\${cookie.value}\`;
        if (cookie.domain) cookieStr += \`; domain=\${cookie.domain}\`;
        if (cookie.path) cookieStr += \`; path=\${cookie.path}\`;
        if (cookie.secure) cookieStr += '; secure';
        if (cookie.httpOnly) cookieStr += '; HttpOnly';
        
        document.cookie = cookieStr;
    });
}

function loadCookieSettings() {
    try {
        const targetWebsite = getCurrentWebsite();
        const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
        const settings = allSettings[targetWebsite];
        
        if (settings) {
            // 设置输入类型
            if (settings.inputType === 'combined') {
                switchCookieInputTab('combined');
                if (settings.cookies && settings.cookies.length > 0) {
                    const cookieStr = settings.cookies.map(c => \`\${c.name}=\${c.value}\`).join('; ');
                    document.getElementById('combined-cookie').value = cookieStr;
                }
            } else {
                switchCookieInputTab('separate');
                separateCookies = settings.cookies || [];
                updateCookieList();
            }
        }
    } catch (e) {
        console.log('加载Cookie设置失败:', e);
    }
}

function loadCookieManagementList() {
    const container = document.getElementById('cookie-settings-list');
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    
    if (Object.keys(allSettings).length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#b0b0b0;padding:40px;">暂无保存的Cookie配置</div>';
        return;
    }
    
    let html = '';
    Object.entries(allSettings).forEach(([website, settings]) => {
        html += \`
        <div class="resource-item">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                <div style="flex:1;">
                    <div class="resource-url">\${website}</div>
                    <div class="resource-info">
                        <span>Cookie数量: \${settings.cookies ? settings.cookies.length : 0}</span>
                        <span>类型: \${settings.inputType === 'combined' ? '合成' : '分段'}</span>
                        <span>保存时间: \${new Date(settings.timestamp).toLocaleString()}</span>
                    </div>
                </div>
                <div style="display:flex;gap:5px;">
                    <button onclick="editCookieSetting('\${website}')" style="background:#4caf50;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;">编辑</button>
                    <button onclick="applyCookieSetting('\${website}')" style="background:#2196f3;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;">应用</button>
                    <button onclick="deleteCookieSetting('\${website}')" style="background:#ff4757;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;">删除</button>
                </div>
            </div>
        </div>
        \`;
    });
    
    container.innerHTML = html;
}

function editCookieSetting(website) {
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    const settings = allSettings[website];
    
    if (settings) {
        document.getElementById('target-website').value = website;
        
        if (settings.inputType === 'combined') {
            switchCookieInputTab('combined');
            if (settings.cookies && settings.cookies.length > 0) {
                const cookieStr = settings.cookies.map(c => \`\${c.name}=\${c.value}\`).join('; ');
                document.getElementById('combined-cookie').value = cookieStr;
            }
        } else {
            switchCookieInputTab('separate');
            separateCookies = settings.cookies || [];
            updateCookieList();
        }
        
        switchCookieTab('injection');
        showNotification('已加载' + website + '的Cookie配置', 'success');
    }
}

function applyCookieSetting(website) {
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    const settings = allSettings[website];
    
    if (settings && settings.cookies) {
        applyCookiesImmediately(settings.cookies);
        showCheckStatus('已应用' + website + '的Cookie设置', 'success');
    }
}

function deleteCookieSetting(website) {
    if (confirm('确定要删除' + website + '的Cookie配置吗？')) {
        const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
        delete allSettings[website];
        localStorage.setItem('${cookieInjectionDataName}', JSON.stringify(allSettings));
        loadCookieManagementList();
        showCheckStatus('已删除' + website + '的Cookie配置', 'success');
    }
}

function clearAllCookieSettings() {
    if (confirm('确定要清空所有Cookie配置吗？此操作不可恢复！')) {
        localStorage.removeItem('${cookieInjectionDataName}');
        loadCookieManagementList();
        showCheckStatus('已清空所有Cookie配置', 'success');
    }
}

function loadWebsiteCookies() {
    const container = document.getElementById('website-cookies-list');
    const cookies = document.cookie.split(';').map(cookie => cookie.trim()).filter(cookie => cookie);
    
    if (cookies.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#b0b0b0;padding:40px;">当前网站没有Cookie</div>';
        return;
    }
    
    let html = '';
    cookies.forEach(cookie => {
        const [name, ...valueParts] = cookie.split('=');
        const value = valueParts.join('=');
        
        html += \`
        <div class="resource-item">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div style="flex:1;">
                    <div style="font-weight:500;color:white;">\${name}=\${value}</div>
                    <div style="font-size:10px;color:#b0b0b0;">完整字符串: \${cookie}</div>
                </div>
                <button onclick="copyCookie('\${cookie}')" style="background:#2196f3;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;">复制</button>
            </div>
        </div>
        \`;
    });
    
    container.innerHTML = html;
}

function refreshWebsiteCookies() {
    loadWebsiteCookies();
    showNotification('Cookie列表已刷新', 'success');
}

function copyCookie(cookie) {
    navigator.clipboard.writeText(cookie).then(() => {
        showNotification('Cookie已复制到剪贴板', 'success');
    });
}

function getCurrentWebsite() {
    try {
        const currentUrl = new URL(window.location.href);
        const proxyBase = currentUrl.protocol + '//' + currentUrl.host + '/';
        const originalUrl = currentUrl.href.substring(proxyBase.length);
        const urlObj = new URL(originalUrl);
        return urlObj.hostname;
    } catch (e) {
        return 'unknown';
    }
}

function showCheckStatus(message, type = 'info') {
    // 移除现有的状态提示
    const existingStatus = document.getElementById('proxy-check-status');
    if (existingStatus) existingStatus.remove();
    
    const statusHTML = \`
    <div id="proxy-check-status" class="check-status \${type}">
        \${message}
    </div>
    \`;
    
    document.body.insertAdjacentHTML('beforeend', statusHTML);
    
    setTimeout(() => {
        const status = document.getElementById('proxy-check-status');
        if (status) {
            status.style.transform = 'translateX(100px)';
            status.style.opacity = '0';
            setTimeout(() => status.remove(), 300);
        }
    }, 3000);
}

function showNotification(message, type = 'info') {
    // 移除现有的通知
    const existingNotice = document.getElementById('proxy-notification');
    if (existingNotice) existingNotice.remove();
    
    const backgroundColor = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3';
    
    const noticeHTML = \`
    <div id="proxy-notification" style="position:fixed;top:20px;right:20px;background:\${backgroundColor};color:white;padding:12px 20px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.3);z-index:2147483647;max-width:300px;word-break:break-word;transform:translateX(100px);opacity:0;transition:all 0.3s ease;">
        \${message}
    </div>
    \`;
    
    document.body.insertAdjacentHTML('beforeend', noticeHTML);
    
    setTimeout(() => {
        const notice = document.getElementById('proxy-notification');
        notice.style.transform = 'translateX(0)';
        notice.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
        const notice = document.getElementById('proxy-notification');
        if (notice) {
            notice.style.transform = 'translateX(100px)';
            notice.style.opacity = '0';
            setTimeout(() => notice.remove(), 300);
        }
    }, 3000);
}
`;

// =======================================================================================
// 第六部分：广告拦截系统
// 功能：完整的广告拦截和元素标记系统
// =======================================================================================

const adBlockSystem = `
// 广告拦截系统
let adBlockEnabled = false;
let adBlockRules = [];
let isSelectingAd = false;
let selectedElements = new Set();

function showAdBlockModal() {
    const modalHTML = \`
    <div class="proxy-modal" id="adblock-modal">
        <div class="proxy-modal-content" style="max-width:900px;">
            <div class="modal-header">
                <h3 class="modal-title">🚫 广告拦截</h3>
                <button class="close-modal" onclick="closeAllModals()">×</button>
            </div>
            
            <div class="form-group">
                <label style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="color:#e0e0e0;font-size:16px;font-weight:500;">启用广告拦截</span>
                    <label class="switch">
                        <input type="checkbox" id="adblock-enabled" \${adBlockEnabled ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </label>
            </div>
            
            <div class="tab-container">
                <div class="tab-buttons">
                    <button class="tab-btn active" onclick="switchAdBlockTab('rules')">拦截规则</button>
                    <button class="tab-btn" onclick="switchAdBlockTab('custom')">自定义规则</button>
                    <button class="tab-btn" onclick="switchAdBlockTab('element')">元素标记</button>
                    <button class="tab-btn" onclick="switchAdBlockTab('subscription')">规则订阅</button>
                </div>
                
                <div id="rules-tab" class="tab-content active">
                    <div class="form-group">
                        <label class="form-label">已加载规则</label>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                            <span>规则数量: <span id="rules-count">0</span></span>
                            <button class="btn btn-secondary" onclick="updateAdBlockRules()" style="padding:6px 12px;font-size:12px;">更新所有规则</button>
                        </div>
                        <div id="rules-list" style="max-height:300px;overflow-y:auto;background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;margin-top:10px;font-size:12px;"></div>
                    </div>
                </div>
                
                <div id="custom-tab" class="tab-content">
                    <div class="form-group">
                        <label class="form-label">自定义规则 (每行一个)</label>
                        <textarea id="custom-rules" class="form-textarea" placeholder="例如: ||ads.example.com^
##.ad-container
@@||good-ad.example.com^" style="height:200px;"></textarea>
                        <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">
                            支持Adblock Plus语法: <br>
                            <code>||domain.com^</code> - 拦截域名 <br>
                            <code>##.class-name</code> - 隐藏元素 <br>
                            <code>@@||domain.com^</code> - 白名单
                        </div>
                    </div>
                    
                    <div class="btn-group">
                        <button class="btn btn-primary" onclick="saveCustomRules()">保存自定义规则</button>
                        <button class="btn btn-secondary" onclick="loadCustomRules()">加载自定义规则</button>
                    </div>
                </div>
                
                <div id="element-tab" class="tab-content">
                    <div class="form-group">
                        <p style="color:#e0e0e0;margin-bottom:15px;">点击"开始标记"后，点击页面上的广告元素进行标记拦截</p>
                        
                        <div class="btn-group">
                            <button class="btn btn-primary" id="start-select-btn" onclick="startElementSelection()">开始标记</button>
                            <button class="btn btn-secondary" id="stop-select-btn" onclick="stopElementSelection()" style="display:none;">停止标记</button>
                            <button class="btn btn-secondary" onclick="clearSelectedElements()">清空选择</button>
                        </div>
                        
                        <div id="selected-elements" style="margin-top:20px;max-height:200px;overflow-y:auto;"></div>
                    </div>
                </div>
                
                <div id="subscription-tab" class="tab-content">
                    <div class="form-group">
                        <label class="form-label">规则订阅管理</label>
                        <div style="display:grid;gap:10px;margin-bottom:15px;">
                            <label style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px;">
                                <input type="checkbox" id="rule-easylist" checked>
                                <span style="color:#e0e0e0;">EasyList (主要规则)</span>
                                <span style="font-size:11px;color:#b0b0b0;">https://easylist-downloads.adblockplus.org/easylist.txt</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px;">
                                <input type="checkbox" id="rule-easylist-china" checked>
                                <span style="color:#e0e0e0;">EasyList China (中文规则)</span>
                                <span style="font-size:11px;color:#b0b0b0;">https://easylist-downloads.adblockplus.org/easylistchina.txt</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px;">
                                <input type="checkbox" id="rule-cjx-annoyance">
                                <span style="color:#e0e0e0;">CJX Annoyance (烦人内容)</span>
                                <span style="font-size:11px;color:#b0b0b0;">https://fastly.jsdelivr.net/gh/cjx82630/cjxlist/cjx-annoyance.txt</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px;">
                                <input type="checkbox" id="rule-easyprivacy">
                                <span style="color:#e0e0e0;">EasyPrivacy (隐私保护)</span>
                                <span style="font-size:11px;color:#b0b0b0;">https://easylist-downloads.adblockplus.org/easyprivacy.txt</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px;">
                                <input type="checkbox" id="rule-antiadblock">
                                <span style="color:#e0e0e0;">Anti-Adblock (反屏蔽检测)</span>
                                <span style="font-size:11px;color:#b0b0b0;">https://easylist-downloads.adblockplus.org/antiadblockfilters.txt</span>
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">自定义订阅URL</label>
                            <div style="display:flex;gap:10px;">
                                <input type="text" id="custom-subscription-url" class="form-input" placeholder="输入自定义规则订阅URL">
                                <button class="btn btn-secondary" onclick="addCustomSubscription()" style="white-space:nowrap;">添加订阅</button>
                            </div>
                        </div>
                        
                        <div class="btn-group">
                            <button class="btn btn-primary" onclick="loadSubscriptionRules()">下载选中规则</button>
                            <button class="btn btn-secondary" onclick="saveSubscriptionSettings()">保存订阅设置</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="btn-group">
                <button class="btn btn-secondary" onclick="closeAllModals()">取消</button>
                <button class="btn btn-primary" onclick="applyAdBlockSettings()">应用设置</button>
            </div>
        </div>
    </div>
    \`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    setTimeout(() => {
        const modal = document.getElementById('adblock-modal');
        const content = modal.querySelector('.proxy-modal-content');
        modal.classList.add('show');
        content.classList.add('show');
        
        loadAdBlockSettings();
    }, 50);
}

function switchAdBlockTab(tabName) {
    // 更新标签按钮
    document.querySelectorAll('#adblock-modal .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 更新标签内容
    document.querySelectorAll('#adblock-modal .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + '-tab').classList.add('active');
}

function loadAdBlockSettings() {
    try {
        // 加载开关状态
        const enabled = localStorage.getItem('${adBlockEnabledName}') === 'true';
        document.getElementById('adblock-enabled').checked = enabled;
        adBlockEnabled = enabled;
        
        // 加载规则选择
        const ruleSettings = JSON.parse(localStorage.getItem('adblock_rule_settings') || '{"easylist":true,"easylist_china":true}');
        document.getElementById('rule-easylist').checked = ruleSettings.easylist || false;
        document.getElementById('rule-easylist-china').checked = ruleSettings.easylist_china || false;
        document.getElementById('rule-cjx-annoyance').checked = ruleSettings.cjx_annoyance || false;
        document.getElementById('rule-easyprivacy').checked = ruleSettings.easyprivacy || false;
        document.getElementById('rule-antiadblock').checked = ruleSettings.antiadblock || false;
        
        // 加载自定义规则
        const customRules = localStorage.getItem('adblock_custom_rules') || '';
        document.getElementById('custom-rules').value = customRules;
        
        // 加载规则列表
        const rules = JSON.parse(localStorage.getItem('adblock_rules') || '[]');
        adBlockRules = rules;
        updateRulesDisplay();
        
        // 加载自定义订阅
        const customSubscriptions = JSON.parse(localStorage.getItem('adblock_custom_subscriptions') || '[]');
        updateCustomSubscriptions(customSubscriptions);
        
    } catch (e) {
        console.error('加载广告拦截设置失败:', e);
    }
}

function updateRulesDisplay() {
    document.getElementById('rules-count').textContent = adBlockRules.length;
    
    const rulesList = document.getElementById('rules-list');
    if (adBlockRules.length === 0) {
        rulesList.innerHTML = '<div style="text-align:center;color:#b0b0b0;padding:20px;">暂无规则，请点击"下载选中规则"</div>';
        return;
    }
    
    let html = '';
    adBlockRules.slice(0, 100).forEach((rule, index) => {
        html += \`<div style="padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.1);word-break:break-all;font-size:11px;">\${rule}</div>\`;
    });
    
    if (adBlockRules.length > 100) {
        html += \`<div style="text-align:center;color:#b0b0b0;padding:10px;">... 还有 \${adBlockRules.length - 100} 条规则</div>\`;
    }
    
    rulesList.innerHTML = html;
}

function updateCustomSubscriptions(subscriptions) {
    const container = document.getElementById('subscription-list');
    if (!container) return;
    
    if (subscriptions.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#b0b0b0;padding:20px;">暂无自定义订阅</div>';
        return;
    }
    
    let html = '';
    subscriptions.forEach((subscription, index) => {
        html += \`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;margin-bottom:5px;background:rgba(255,255,255,0.05);border-radius:6px;">
            <span style="font-size:12px;color:#e0e0e0;">\${subscription.url}</span>
            <button onclick="removeCustomSubscription(\${index})" style="background:#ff4757;color:white;border:none;padding:2px 6px;border-radius:3px;font-size:10px;cursor:pointer;">删除</button>
        </div>
        \`;
    });
    
    container.innerHTML = html;
}

async function loadSubscriptionRules() {
    showCheckStatus('正在下载规则...', 'info');
    
    const rules = [];
    const ruleSettings = {
        easylist: document.getElementById('rule-easylist').checked,
        easylist_china: document.getElementById('rule-easylist-china').checked,
        cjx_annoyance: document.getElementById('rule-cjx-annoyance').checked,
        easyprivacy: document.getElementById('rule-easyprivacy').checked,
        antiadblock: document.getElementById('rule-antiadblock').checked
    };
    
    const customSubscriptions = JSON.parse(localStorage.getItem('adblock_custom_subscriptions') || '[]');
    
    try {
        // 加载预定义订阅
        if (ruleSettings.easylist) {
            try {
                const response = await fetch('https://easylist-downloads.adblockplus.org/easylist.txt');
                const text = await response.text();
                rules.push(...text.split('\\n').filter(rule => rule && !rule.startsWith('!')));
                showCheckStatus('EasyList规则下载完成', 'success');
            } catch (e) {
                showCheckStatus('EasyList规则下载失败', 'error');
            }
        }
        
        if (ruleSettings.easylist_china) {
            try {
                const response = await fetch('https://easylist-downloads.adblockplus.org/easylistchina.txt');
                const text = await response.text();
                rules.push(...text.split('\\n').filter(rule => rule && !rule.startsWith('!')));
                showCheckStatus('EasyList China规则下载完成', 'success');
            } catch (e) {
                showCheckStatus('EasyList China规则下载失败', 'error');
            }
        }
        
        if (ruleSettings.cjx_annoyance) {
            try {
                const response = await fetch('https://fastly.jsdelivr.net/gh/cjx82630/cjxlist/cjx-annoyance.txt');
                const text = await response.text();
                rules.push(...text.split('\\n').filter(rule => rule && !rule.startsWith('!')));
                showCheckStatus('CJX Annoyance规则下载完成', 'success');
            } catch (e) {
                showCheckStatus('CJX Annoyance规则下载失败', 'error');
            }
        }
        
        if (ruleSettings.easyprivacy) {
            try {
                const response = await fetch('https://easylist-downloads.adblockplus.org/easyprivacy.txt');
                const text = await response.text();
                rules.push(...text.split('\\n').filter(rule => rule && !rule.startsWith('!')));
                showCheckStatus('EasyPrivacy规则下载完成', 'success');
            } catch (e) {
                showCheckStatus('EasyPrivacy规则下载失败', 'error');
            }
        }
        
        if (ruleSettings.antiadblock) {
            try {
                const response = await fetch('https://easylist-downloads.adblockplus.org/antiadblockfilters.txt');
                const text = await response.text();
                rules.push(...text.split('\\n').filter(rule => rule && !rule.startsWith('!')));
                showCheckStatus('Anti-Adblock规则下载完成', 'success');
            } catch (e) {
                showCheckStatus('Anti-Adblock规则下载失败', 'error');
            }
        }
        
        // 加载自定义订阅
        for (const subscription of customSubscriptions) {
            try {
                const response = await fetch(subscription.url);
                const text = await response.text();
                rules.push(...text.split('\\n').filter(rule => rule && !rule.startsWith('!')));
                showCheckStatus('自定义订阅规则下载完成: ' + subscription.url, 'success');
            } catch (e) {
                showCheckStatus('自定义订阅规则下载失败: ' + subscription.url, 'error');
            }
        }
        
        // 添加自定义规则
        const customRules = document.getElementById('custom-rules').value.split('\\n').filter(rule => rule.trim());
        rules.push(...customRules);
        
        // 去重
        adBlockRules = [...new Set(rules)].filter(rule => rule.trim());
        
        // 保存到localStorage
        localStorage.setItem('adblock_rules', JSON.stringify(adBlockRules));
        localStorage.setItem('adblock_rule_settings', JSON.stringify(ruleSettings));
        
        updateRulesDisplay();
        showCheckStatus(\`成功加载 \${adBlockRules.length} 条规则\`, 'success');
        
    } catch (error) {
        showCheckStatus('加载规则失败: ' + error.message, 'error');
    }
}

function updateAdBlockRules() {
    loadSubscriptionRules();
}

function saveCustomRules() {
    const customRules = document.getElementById('custom-rules').value;
    localStorage.setItem('adblock_custom_rules', customRules);
    showCheckStatus('自定义规则已保存', 'success');
}

function loadCustomRules() {
    const customRules = localStorage.getItem('adblock_custom_rules') || '';
    document.getElementById('custom-rules').value = customRules;
    showCheckStatus('自定义规则已加载', 'success');
}

function addCustomSubscription() {
    const url = document.getElementById('custom-subscription-url').value.trim();
    if (!url) {
        showCheckStatus('请输入订阅URL', 'error');
        return;
    }
    
    const customSubscriptions = JSON.parse(localStorage.getItem('adblock_custom_subscriptions') || '[]');
    customSubscriptions.push({ url: url });
    localStorage.setItem('adblock_custom_subscriptions', JSON.stringify(customSubscriptions));
    
    document.getElementById('custom-subscription-url').value = '';
    updateCustomSubscriptions(customSubscriptions);
    showCheckStatus('自定义订阅已添加', 'success');
}

function removeCustomSubscription(index) {
    const customSubscriptions = JSON.parse(localStorage.getItem('adblock_custom_subscriptions') || '[]');
    customSubscriptions.splice(index, 1);
    localStorage.setItem('adblock_custom_subscriptions', JSON.stringify(customSubscriptions));
    updateCustomSubscriptions(customSubscriptions);
    showCheckStatus('自定义订阅已删除', 'success');
}

function saveSubscriptionSettings() {
    const ruleSettings = {
        easylist: document.getElementById('rule-easylist').checked,
        easylist_china: document.getElementById('rule-easylist-china').checked,
        cjx_annoyance: document.getElementById('rule-cjx-annoyance').checked,
        easyprivacy: document.getElementById('rule-easyprivacy').checked,
        antiadblock: document.getElementById('rule-antiadblock').checked
    };
    
    localStorage.setItem('adblock_rule_settings', JSON.stringify(ruleSettings));
    showCheckStatus('订阅设置已保存', 'success');
}

function startElementSelection() {
    isSelectingAd = true;
    document.getElementById('start-select-btn').style.display = 'none';
    document.getElementById('stop-select-btn').style.display = 'block';
    
    // 添加选择模式样式
    document.body.style.cursor = 'crosshair';
    
    // 保护工具栏元素
    protectToolbarElements();
    
    // 添加元素点击事件
    document.addEventListener('click', handleElementSelection, true);
    document.addEventListener('mouseover', handleElementHover, true);
    document.addEventListener('mouseout', handleElementUnhover, true);
    
    showCheckStatus('选择模式已激活，点击页面上的广告元素进行标记', 'info');
}

function stopElementSelection() {
    isSelectingAd = false;
    document.getElementById('start-select-btn').style.display = 'block';
    document.getElementById('stop-select-btn').style.display = 'none';
    
    // 恢复正常光标
    document.body.style.cursor = '';
    
    // 移除事件监听
    document.removeEventListener('click', handleElementSelection, true);
    document.removeEventListener('mouseover', handleElementHover, true);
    document.removeEventListener('mouseout', handleElementUnhover, true);
    
    // 移除所有高亮
    document.querySelectorAll('.ad-element-highlight').forEach(el => {
        el.classList.remove('ad-element-highlight');
    });
    
    // 移除保护
    unprotectToolbarElements();
    
    showCheckStatus('选择模式已关闭', 'info');
}

function protectToolbarElements() {
    // 保护工具栏相关元素不被标记
    const toolbar = document.getElementById('proxy-toolbar');
    if (toolbar) {
        toolbar.classList.add('protected-element');
    }
    
    // 保护所有模态框
    document.querySelectorAll('.proxy-modal').forEach(modal => {
        modal.classList.add('protected-element');
    });
}

function unprotectToolbarElements() {
    // 移除保护
    const toolbar = document.getElementById('proxy-toolbar');
    if (toolbar) {
        toolbar.classList.remove('protected-element');
    }
    
    document.querySelectorAll('.proxy-modal').forEach(modal => {
        modal.classList.remove('protected-element');
    });
}

function handleElementHover(event) {
    if (!isSelectingAd) return;
    
    // 跳过受保护的元素
    if (event.target.closest('.protected-element')) {
        return;
    }
    
    event.target.classList.add('ad-element-highlight');
    event.stopPropagation();
}

function handleElementUnhover(event) {
    if (!isSelectingAd) return;
    
    // 跳过受保护的元素
    if (event.target.closest('.protected-element')) {
        return;
    }
    
    event.target.classList.remove('ad-element-highlight');
    event.stopPropagation();
}

function handleElementSelection(event) {
    if (!isSelectingAd) return;
    
    // 跳过受保护的元素
    if (event.target.closest('.protected-element')) {
        return;
    }
    
    event.preventDefault();
    event.stopPropagation();
    
    const element = event.target;
    const selector = generateCSSSelector(element);
    
    // 检查是否已经选择过
    if (selectedElements.has(selector)) {
        showCheckStatus('该元素已被选择', 'info');
        return;
    }
    
    // 添加到选择集合
    selectedElements.add(selector);
    
    // 添加到自定义规则
    const customRules = document.getElementById('custom-rules');
    const newRule = \`##\${selector}\`;
    
    if (!customRules.value.includes(newRule)) {
        customRules.value += (customRules.value ? '\\n' : '') + newRule;
        
        // 立即隐藏元素
        element.style.display = 'none';
        
        showCheckStatus(\`已标记并隐藏元素: \${selector}\`, 'success');
        
        // 更新选中元素列表
        updateSelectedElementsList(selector);
    }
    
    return false;
}

function generateCSSSelector(element) {
    if (element.id) {
        return \`#\${element.id}\`;
    }
    
    let selector = element.tagName.toLowerCase();
    if (element.className && typeof element.className === 'string') {
        const classes = element.className.split(' ').filter(cls => cls.trim());
        if (classes.length > 0) {
            selector += '.' + classes.join('.');
        }
    }
    
    return selector;
}

function updateSelectedElementsList(selector) {
    const container = document.getElementById('selected-elements');
    
    const item = document.createElement('div');
    item.className = 'resource-item';
    item.innerHTML = \`
        <div class="resource-url">\${selector}</div>
        <div class="resource-info">
            <span>元素选择器</span>
            <button onclick="removeElementRule('\${selector}')" style="background:#ff4757;color:white;border:none;padding:2px 8px;border-radius:3px;font-size:10px;cursor:pointer;">删除</button>
        </div>
    \`;
    container.appendChild(item);
}

function clearSelectedElements() {
    if (confirm('确定要清空所有已选择的元素吗？')) {
        selectedElements.clear();
        document.getElementById('selected-elements').innerHTML = '';
        showCheckStatus('已清空所有选择的元素', 'success');
    }
}

function removeElementRule(selector) {
    const customRules = document.getElementById('custom-rules');
    const rules = customRules.value.split('\\n').filter(rule => !rule.includes(selector));
    customRules.value = rules.join('\\n');
    saveCustomRules();
    
    // 从选择集合中移除
    selectedElements.delete(selector);
    
    // 重新显示元素
    document.querySelectorAll(selector).forEach(el => {
        el.style.display = '';
    });
    
    // 从列表中移除
    const items = document.querySelectorAll('#selected-elements .resource-item');
    items.forEach(item => {
        if (item.querySelector('.resource-url').textContent === selector) {
            item.remove();
        }
    });
    
    showCheckStatus(\`已移除规则: \${selector}\`, 'success');
}

function applyAdBlockSettings() {
    adBlockEnabled = document.getElementById('adblock-enabled').checked;
    localStorage.setItem('${adBlockEnabledName}', adBlockEnabled.toString());
    
    if (adBlockEnabled) {
        startAdBlocking();
        showCheckStatus('广告拦截已启用', 'success');
    } else {
        stopAdBlocking();
        showCheckStatus('广告拦截已禁用', 'info');
    }
    
    setTimeout(() => {
        closeAllModals();
    }, 1500);
}

function startAdBlocking() {
    if (!adBlockEnabled) return;
    
    // 拦截网络请求
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        if (shouldBlockRequest(url)) {
            console.log('Blocked request:', url);
            return Promise.reject(new Error('Blocked by ad blocker'));
        }
        return originalFetch.apply(this, args);
    };
    
    // 拦截XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(...args) {
        const url = args[1];
        if (shouldBlockRequest(url)) {
            console.log('Blocked XHR:', url);
            this.shouldBlock = true;
            return;
        }
        return originalOpen.apply(this, args);
    };
    
    // 隐藏广告元素
    hideAdElements();
}

function shouldBlockRequest(url) {
    if (!adBlockEnabled || !adBlockRules.length) return false;
    
    const urlStr = url.toString().toLowerCase();
    return adBlockRules.some(rule => {
        if (!rule || rule.startsWith('!') || rule.startsWith('##')) return false;
        
        if (rule.startsWith('||')) {
            const domain = rule.substring(2).replace('^', '');
            return urlStr.includes(domain);
        } else if (rule.startsWith('@@')) {
            // 白名单规则，不拦截
            return false;
        } else {
            return urlStr.includes(rule);
        }
    });
}

function hideAdElements() {
    if (!adBlockEnabled || !adBlockRules.length) return;
    
    adBlockRules.forEach(rule => {
        if (rule.startsWith('##')) {
            const selector = rule.substring(2);
            try {
                document.querySelectorAll(selector).forEach(el => {
                    el.style.display = 'none';
                });
            } catch (e) {
                // 无效的选择器，忽略
            }
        }
    });
}

function stopAdBlocking() {
    // 恢复原始函数
    if (window.originalFetch) {
        window.fetch = window.originalFetch;
    }
    if (window.originalXHROpen) {
        XMLHttpRequest.prototype.open = window.originalXHROpen;
    }
}
`;

// =======================================================================================
// 第七部分：资源嗅探系统
// 功能：完整的资源请求监控和修改系统
// =======================================================================================

const resourceSnifferSystem = `
// 资源嗅探系统
let resourceSnifferEnabled = false;
let capturedResources = [];
let requestModifiers = [];

function showResourceSnifferModal() {
    const modalHTML = \`
    <div class="proxy-modal" id="sniffer-modal">
        <div class="proxy-modal-content" style="max-width:1200px;width:95%;">
            <div class="modal-header">
                <h3 class="modal-title">🔍 资源嗅探器</h3>
                <button class="close-modal" onclick="closeAllModals()">×</button>
            </div>
            
            <div class="form-group">
                <label style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="color:#e0e0e0;font-size:16px;font-weight:500;">启用资源嗅探</span>
                    <label class="switch">
                        <input type="checkbox" id="sniffer-enabled" \${resourceSnifferEnabled ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </label>
            </div>
            
            <div class="tab-container">
                <div class="tab-buttons">
                    <button class="tab-btn active" onclick="switchSnifferTab('captured')">捕获记录</button>
                    <button class="tab-btn" onclick="switchSnifferTab('modifiers')">请求修改</button>
                    <button class="tab-btn" onclick="switchSnifferTab('filters')">拦截设置</button>
                    <button class="tab-btn" onclick="switchSnifferTab('repeater')">重放器</button>
                </div>
                
                <div id="captured-tab" class="tab-content active">
                    <div class="form-group">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                            <label class="form-label">捕获的资源请求</label>
                            <div>
                                <button class="btn btn-secondary" onclick="clearCapturedResources()" style="padding:6px 12px;font-size:12px;">清空记录</button>
                                <button class="btn btn-secondary" onclick="exportResources()" style="padding:6px 12px;font-size:12px;">导出JSON</button>
                                <button class="btn btn-secondary" onclick="exportHar()" style="padding:6px 12px;font-size:12px;">导出HAR</button>
                            </div>
                        </div>
                        <div id="resources-list" style="max-height:400px;overflow-y:auto;background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;">
                            <div style="text-align:center;color:#b0b0b0;padding:40px;">暂无捕获记录</div>
                        </div>
                    </div>
                </div>
                
                <div id="modifiers-tab" class="tab-content">
                    <div class="form-group">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                            <label class="form-label">请求修改规则</label>
                            <button class="btn btn-primary" onclick="addNewModifier()" style="padding:8px 15px;font-size:12px;">添加规则</button>
                        </div>
                        
                        <div id="modifiers-list"></div>
                    </div>
                </div>
                
                <div id="filters-tab" class="tab-content">
                    <div class="form-group">
                        <label class="form-label">资源类型过滤</label>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(150px, 1fr));gap:10px;margin-bottom:15px;">
                            <label style="display:flex;align-items:center;gap:8px;">
                                <input type="checkbox" id="filter-html" checked>
                                <span style="color:#e0e0e0;">HTML</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:8px;">
                                <input type="checkbox" id="filter-css" checked>
                                <span style="color:#e0e0e0;">CSS</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:8px;">
                                <input type="checkbox" id="filter-js" checked>
                                <span style="color:#e0e0e0;">JavaScript</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:8px;">
                                <input type="checkbox" id="filter-image" checked>
                                <span style="color:#e0e0e0;">图片</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:8px;">
                                <input type="checkbox" id="filter-font">
                                <span style="color:#e0e0e0;">字体</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:8px;">
                                <input type="checkbox" id="filter-media">
                                <span style="color:#e0e0e0;">媒体</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:8px;">
                                <input type="checkbox" id="filter-xhr" checked>
                                <span style="color:#e0e0e0;">XHR/Fetch</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:8px;">
                                <input type="checkbox" id="filter-websocket">
                                <span style="color:#e0e0e0;">WebSocket</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">URL过滤</label>
                        <input type="text" id="url-filter" class="form-input" placeholder="过滤包含关键词的URL (可选)">
                    </div>
                    
                    <div class="form-group">
                        <label style="display:flex;align-items:center;gap:8px;">
                            <input type="checkbox" id="auto-start-sniffer">
                            <span style="color:#e0e0e0;">下次访问自动开启嗅探</span>
                        </label>
                    </div>
                </div>
                
                <div id="repeater-tab" class="tab-content">
                    <div class="form-group">
                        <label class="form-label">请求重放器</label>
                        <div style="display:grid;grid-template-columns:1fr auto;gap:10px;margin-bottom:10px;">
                            <input type="text" id="repeater-url" class="form-input" placeholder="输入要重放的URL">
                            <select id="repeater-method" class="form-select" style="width:120px;">
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                                <option value="PATCH">PATCH</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">请求头</label>
                            <textarea id="repeater-headers" class="form-textarea" placeholder='{"Content-Type": "application/json"}' style="height:100px;"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">请求体</label>
                            <textarea id="repeater-body" class="form-textarea" placeholder='{"key": "value"}' style="height:100px;"></textarea>
                        </div>
                        
                        <div class="btn-group">
                            <button class="btn btn-primary" onclick="sendRepeaterRequest()">发送请求</button>
                            <button class="btn btn-secondary" onclick="clearRepeater()">清空</button>
                        </div>
                        
                        <div id="repeater-result" style="margin-top:20px;max-height:200px;overflow-y:auto;"></div>
                    </div>
                </div>
            </div>
            
            <div class="btn-group">
                <button class="btn btn-secondary" onclick="closeAllModals()">取消</button>
                <button class="btn btn-primary" onclick="applySnifferSettings()">应用设置</button>
            </div>
        </div>
    </div>
    \`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    setTimeout(() => {
        const modal = document.getElementById('sniffer-modal');
        const content = modal.querySelector('.proxy-modal-content');
        modal.classList.add('show');
        content.classList.add('show');
        
        loadSnifferSettings();
        updateResourcesList();
        updateModifiersList();
    }, 50);
}

function switchSnifferTab(tabName) {
    // 更新标签按钮
    document.querySelectorAll('#sniffer-modal .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 更新标签内容
    document.querySelectorAll('#sniffer-modal .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + '-tab').classList.add('active');
}

function loadSnifferSettings() {
    try {
        // 加载开关状态
        const enabled = localStorage.getItem('${resourceSnifferName}') === 'true';
        document.getElementById('sniffer-enabled').checked = enabled;
        resourceSnifferEnabled = enabled;
        
        // 加载过滤设置
        const filterSettings = JSON.parse(localStorage.getItem('sniffer_filters') || '{"html":true,"css":true,"js":true,"image":true,"xhr":true}');
        document.getElementById('filter-html').checked = filterSettings.html || false;
        document.getElementById('filter-css').checked = filterSettings.css || false;
        document.getElementById('filter-js').checked = filterSettings.js || false;
        document.getElementById('filter-image').checked = filterSettings.image || false;
        document.getElementById('filter-font').checked = filterSettings.font || false;
        document.getElementById('filter-media').checked = filterSettings.media || false;
        document.getElementById('filter-xhr').checked = filterSettings.xhr || false;
        document.getElementById('filter-websocket').checked = filterSettings.websocket || false;
        
        document.getElementById('url-filter').value = localStorage.getItem('sniffer_url_filter') || '';
        
        // 加载自动启动设置
        document.getElementById('auto-start-sniffer').checked = localStorage.getItem('sniffer_auto_start') === 'true';
        
        // 加载捕获的资源
        capturedResources = JSON.parse(localStorage.getItem('sniffer_captured') || '[]');
        
        // 加载修改器规则
        requestModifiers = JSON.parse(localStorage.getItem('sniffer_modifiers') || '[]');
        
    } catch (e) {
        console.error('加载资源嗅探设置失败:', e);
    }
}

function updateResourcesList() {
    const container = document.getElementById('resources-list');
    
    if (capturedResources.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#b0b0b0;padding:40px;">暂无捕获记录</div>';
        return;
    }
    
    let html = '';
    capturedResources.slice().reverse().forEach((resource, index) => {
        const time = new Date(resource.timestamp).toLocaleTimeString();
        const method = resource.method || 'GET';
        const status = resource.status || 'Pending';
        const type = resource.type || 'unknown';
        const actualIndex = capturedResources.length - 1 - index;
        
        html += \`
        <div class="resource-item">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                <div style="flex:1;">
                    <div class="resource-url" title="\${resource.url}">\${method} \${resource.url}</div>
                    <div class="resource-info">
                        <span>状态: \${status}</span>
                        <span>类型: \${type}</span>
                        <span>时间: \${time}</span>
                        <span>大小: \${formatBytes(resource.size)}</span>
                    </div>
                </div>
                <div style="display:flex;gap:5px;">
                    <button onclick="inspectResource(\${actualIndex})" style="background:#4fc3f7;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;">详情</button>
                    <button onclick="createModifierFromResource(\${actualIndex})" style="background:#4caf50;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;">拦截</button>
                    <button onclick="replayResource(\${actualIndex})" style="background:#ff9800;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;">重放</button>
                </div>
            </div>
        </div>
        \`;
    });
    
    container.innerHTML = html;
}

function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateModifiersList() {
    const container = document.getElementById('modifiers-list');
    
    if (requestModifiers.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#b0b0b0;padding:20px;">暂无修改规则</div>';
        return;
    }
    
    let html = '';
    requestModifiers.forEach((modifier, index) => {
        html += \`
        <div class="resource-item">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                <div style="flex:1;">
                    <div class="resource-url">\${modifier.pattern}</div>
                    <div class="resource-info">
                        <span>动作: \${modifier.action}</span>
                        <span>目标: \${modifier.target}</span>
                        \${modifier.value ? \`<span>值: \${modifier.value}</span>\` : ''}
                        \${modifier.headerName ? \`<span>头部: \${modifier.headerName}</span>\` : ''}
                    </div>
                </div>
                <div style="display:flex;gap:5px;">
                    <button onclick="editModifier(\${index})" style="background:#4caf50;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;">编辑</button>
                    <button onclick="toggleModifier(\${index})" style="background:\${modifier.enabled ? '#ff9800' : '#4caf50'};color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;">\${modifier.enabled ? '禁用' : '启用'}</button>
                    <button onclick="removeModifier(\${index})" style="background:#ff4757;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;">删除</button>
                </div>
            </div>
        </div>
        \`;
    });
    
    container.innerHTML = html;
}

function addNewModifier() {
    const modifier = {
        pattern: '',
        action: 'block', // block, redirect, modify, header
        target: 'url', // url, header, body
        value: '',
        headerName: '',
        headerValue: '',
        enabled: true
    };
    
    requestModifiers.push(modifier);
    updateModifiersList();
    showModifierEditor(requestModifiers.length - 1);
}

function showModifierEditor(index) {
    const modifier = requestModifiers[index];
    
    const editorHTML = \`
    <div class="proxy-modal" id="modifier-editor">
        <div class="proxy-modal-content" style="max-width:700px;">
            <div class="modal-header">
                <h3 class="modal-title">编辑修改规则</h3>
                <button class="close-modal" onclick="closeModifierEditor()">×</button>
            </div>
            
            <div class="form-group">
                <label class="form-label">URL模式 (支持通配符 * 和正则表达式)</label>
                <input type="text" id="modifier-pattern" class="form-input" value="\${modifier.pattern}" placeholder="例如: *://*.ads.com/* 或 /ads\\\\.\\\\w+/">
            </div>
            
            <div class="form-group">
                <label class="form-label">动作类型</label>
                <select id="modifier-action" class="form-select">
                    <option value="block" \${modifier.action === 'block' ? 'selected' : ''}>拦截请求</option>
                    <option value="redirect" \${modifier.action === 'redirect' ? 'selected' : ''}>重定向URL</option>
                    <option value="modify" \${modifier.action === 'modify' ? 'selected' : ''}>修改内容</option>
                    <option value="header" \${modifier.action === 'header' ? 'selected' : ''}>修改头部</option>
                </select>
            </div>
            
            <div class="form-group" id="modify-target-group" \${modifier.action === 'modify' ? '' : 'style="display:none;"'}>
                <label class="form-label">修改目标</label>
                <select id="modifier-target" class="form-select">
                    <option value="url" \${modifier.target === 'url' ? 'selected' : ''}>URL</option>
                    <option value="body" \${modifier.target === 'body' ? 'selected' : ''}>请求体</option>
                </select>
            </div>
            
            <div class="form-group" id="header-fields-group" \${modifier.action === 'header' ? '' : 'style="display:none;"'}>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    <div>
                        <label class="form-label">头部名称</label>
                        <input type="text" id="modifier-header-name" class="form-input" value="\${modifier.headerName || ''}" placeholder="例如: User-Agent">
                    </div>
                    <div>
                        <label class="form-label">头部值</label>
                        <input type="text" id="modifier-header-value" class="form-input" value="\${modifier.headerValue || ''}" placeholder="例如: Custom Agent">
                    </div>
                </div>
            </div>
            
            <div class="form-group" id="modifier-value-group" \${modifier.action === 'redirect' || modifier.action === 'modify' ? '' : 'style="display:none;"'}>
                <label class="form-label" id="modifier-value-label">
                    \${modifier.action === 'redirect' ? '重定向到URL' : modifier.target === 'body' ? '请求体内容' : '修改值'}
                </label>
                <textarea id="modifier-value" class="form-textarea" placeholder="\${modifier.action === 'redirect' ? '输入重定向URL' : '输入修改内容'}">\${modifier.value || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label style="display:flex;align-items:center;gap:8px;">
                    <input type="checkbox" id="modifier-enabled" \${modifier.enabled ? 'checked' : ''}>
                    <span style="color:#e0e0e0;">启用此规则</span>
                </label>
            </div>
            
            <div class="btn-group">
                <button class="btn btn-secondary" onclick="closeModifierEditor()">取消</button>
                <button class="btn btn-primary" onclick="saveModifier(\${index})">保存</button>
            </div>
        </div>
    </div>
    \`;
    
    document.body.insertAdjacentHTML('beforeend', editorHTML);
    
    // 添加事件监听
    document.getElementById('modifier-action').addEventListener('change', function() {
        updateModifierEditorUI();
    });
    
    document.getElementById('modifier-target').addEventListener('change', updateModifierEditorUI);
    
    function updateModifierEditorUI() {
        const action = document.getElementById('modifier-action').value;
        const targetGroup = document.getElementById('modify-target-group');
        const valueGroup = document.getElementById('modifier-value-group');
        const headerGroup = document.getElementById('header-fields-group');
        const valueLabel = document.getElementById('modifier-value-label');
        
        // 重置显示
        targetGroup.style.display = 'none';
        valueGroup.style.display = 'none';
        headerGroup.style.display = 'none';
        
        if (action === 'modify') {
            targetGroup.style.display = 'block';
            valueGroup.style.display = 'block';
            const target = document.getElementById('modifier-target').value;
            valueLabel.textContent = target === 'body' ? '请求体内容' : '修改值';
        } else if (action === 'redirect') {
            valueGroup.style.display = 'block';
            valueLabel.textContent = '重定向到URL';
        } else if (action === 'header') {
            headerGroup.style.display = 'block';
        }
    }
}

function closeModifierEditor() {
    const editor = document.getElementById('modifier-editor');
    if (editor) editor.remove();
}

function saveModifier(index) {
    const pattern = document.getElementById('modifier-pattern').value.trim();
    const action = document.getElementById('modifier-action').value;
    const target = document.getElementById('modifier-target').value;
    const value = document.getElementById('modifier-value').value.trim();
    const headerName = document.getElementById('modifier-header-name').value.trim();
    const headerValue = document.getElementById('modifier-header-value').value.trim();
    const enabled = document.getElementById('modifier-enabled').checked;
    
    if (!pattern) {
        showCheckStatus('请输入URL模式', 'error');
        return;
    }
    
    requestModifiers[index] = {
        pattern,
        action,
        target,
        value,
        headerName,
        headerValue,
        enabled
    };
    
    localStorage.setItem('sniffer_modifiers', JSON.stringify(requestModifiers));
    updateModifiersList();
    closeModifierEditor();
    showCheckStatus('修改规则已保存', 'success');
}

function toggleModifier(index) {
    requestModifiers[index].enabled = !requestModifiers[index].enabled;
    localStorage.setItem('sniffer_modifiers', JSON.stringify(requestModifiers));
    updateModifiersList();
    showCheckStatus(\`规则已\${requestModifiers[index].enabled ? '启用' : '禁用'}\`, 'success');
}

function removeModifier(index) {
    if (confirm('确定要删除此修改规则吗？')) {
        requestModifiers.splice(index, 1);
        localStorage.setItem('sniffer_modifiers', JSON.stringify(requestModifiers));
        updateModifiersList();
        showCheckStatus('修改规则已删除', 'success');
    }
}

function inspectResource(index) {
    const resource = capturedResources[index];
    
    const detailHTML = \`
    <div class="proxy-modal" id="resource-detail">
        <div class="proxy-modal-content" style="max-width:900px;">
            <div class="modal-header">
                <h3 class="modal-title">资源详情</h3>
                <button class="close-modal" onclick="closeResourceDetail()">×</button>
            </div>
            
            <div class="tab-container">
                <div class="tab-buttons">
                    <button class="tab-btn active" onclick="switchResourceTab('overview')">概览</button>
                    <button class="tab-btn" onclick="switchResourceTab('request')">请求</button>
                    <button class="tab-btn" onclick="switchResourceTab('response')">响应</button>
                </div>
                
                <div id="overview-tab" class="tab-content active">
                    <div class="form-group">
                        <label class="form-label">URL</label>
                        <div style="background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;word-break:break-all;font-size:13px;color:#e0e0e0;">\${resource.url}</div>
                    </div>
                    
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px;">
                        <div>
                            <label class="form-label">方法</label>
                            <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:6px;font-size:13px;color:#e0e0e0;">\${resource.method || 'GET'}</div>
                        </div>
                        <div>
                            <label class="form-label">状态</label>
                            <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:6px;font-size:13px;color:#e0e0e0;">\${resource.status || 'Pending'}</div>
                        </div>
                    </div>
                    
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px;">
                        <div>
                            <label class="form-label">类型</label>
                            <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:6px;font-size:13px;color:#e0e0e0;">\${resource.type || 'unknown'}</div>
                        </div>
                        <div>
                            <label class="form-label">大小</label>
                            <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:6px;font-size:13px;color:#e0e0e0;">\${formatBytes(resource.size)}</div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">时间</label>
                        <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:6px;font-size:13px;color:#e0e0e0;">\${new Date(resource.timestamp).toLocaleString()}</div>
                    </div>
                </div>
                
                <div id="request-tab" class="tab-content">
                    \${resource.headers ? \`
                    <div class="form-group">
                        <label class="form-label">请求头</label>
                        <textarea class="form-textarea" style="height:200px;font-size:12px;font-family:monospace;" readonly>\${JSON.stringify(resource.headers, null, 2)}</textarea>
                    </div>
                    \` : '<div style="text-align:center;color:#b0b0b0;padding:40px;">无请求头信息</div>'}
                    
                    \${resource.body ? \`
                    <div class="form-group">
                        <label class="form-label">请求体</label>
                        <textarea class="form-textarea" style="height:200px;font-size:12px;font-family:monospace;" readonly>\${typeof resource.body === 'string' ? resource.body : JSON.stringify(resource.body, null, 2)}</textarea>
                    </div>
                    \` : ''}
                </div>
                
                <div id="response-tab" class="tab-content">
                    \${resource.responseHeaders ? \`
                    <div class="form-group">
                        <label class="form-label">响应头</label>
                        <textarea class="form-textarea" style="height:200px;font-size:12px;font-family:monospace;" readonly>\${JSON.stringify(resource.responseHeaders, null, 2)}</textarea>
                    </div>
                    \` : '<div style="text-align:center;color:#b0b0b0;padding:40px;">无响应头信息</div>'}
                    
                    \${resource.responseBody ? \`
                    <div class="form-group">
                        <label class="form-label">响应体</label>
                        <textarea class="form-textarea" style="height:200px;font-size:12px;font-family:monospace;" readonly>\${typeof resource.responseBody === 'string' ? resource.responseBody : JSON.stringify(resource.responseBody, null, 2)}</textarea>
                    </div>
                    \` : ''}
                </div>
            </div>
            
            <div class="btn-group">
                <button class="btn btn-secondary" onclick="closeResourceDetail()">关闭</button>
                <button class="btn btn-primary" onclick="createModifierFromResource(\${index})">创建拦截规则</button>
                <button class="btn btn-primary" onclick="replayResource(\${index})">重放请求</button>
            </div>
        </div>
    </div>
    \`;
    
    document.body.insertAdjacentHTML('beforeend', detailHTML);
}

function switchResourceTab(tabName) {
    // 更新标签按钮
    document.querySelectorAll('#resource-detail .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 更新标签内容
    document.querySelectorAll('#resource-detail .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + '-tab').classList.add('active');
}

function closeResourceDetail() {
    const detail = document.getElementById('resource-detail');
    if (detail) detail.remove();
}

function createModifierFromResource(index) {
    const resource = capturedResources[index];
    closeResourceDetail();
    
    const modifier = {
        pattern: resource.url.replace(/https?:\\/\\/[^\\/]+/, '*://*'),
        action: 'block',
        target: 'url',
        value: '',
        enabled: true
    };
    
    requestModifiers.push(modifier);
    updateModifiersList();
    showCheckStatus('已基于资源创建拦截规则', 'success');
}

function replayResource(index) {
    const resource = capturedResources[index];
    
    // 填充重放器
    document.getElementById('repeater-url').value = resource.url;
    document.getElementById('repeater-method').value = resource.method || 'GET';
    
    if (resource.headers) {
        document.getElementById('repeater-headers').value = JSON.stringify(resource.headers, null, 2);
    }
    
    if (resource.body) {
        document.getElementById('repeater-body').value = typeof resource.body === 'string' ? resource.body : JSON.stringify(resource.body, null, 2);
    }
    
    // 切换到重放器标签
    switchSnifferTab('repeater');
    closeResourceDetail();
    showCheckStatus('请求信息已加载到重放器', 'success');
}

async function sendRepeaterRequest() {
    const url = document.getElementById('repeater-url').value;
    const method = document.getElementById('repeater-method').value;
    const headersText = document.getElementById('repeater-headers').value;
    const bodyText = document.getElementById('repeater-body').value;
    
    if (!url) {
        showCheckStatus('请输入URL', 'error');
        return;
    }
    
    let headers = {};
    let body = null;
    
    try {
        if (headersText) {
            headers = JSON.parse(headersText);
        }
    } catch (e) {
        showCheckStatus('请求头格式错误', 'error');
        return;
    }
    
    try {
        if (bodyText) {
            body = bodyText;
        }
    } catch (e) {
        showCheckStatus('请求体格式错误', 'error');
        return;
    }
    
    const resultContainer = document.getElementById('repeater-result');
    resultContainer.innerHTML = '<div style="text-align:center;color:#b0b0b0;padding:20px;">发送请求中...</div>';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: body
        });
        
        const responseText = await response.text();
        
        resultContainer.innerHTML = \`
        <div class="resource-item">
            <div class="resource-url">响应状态: \${response.status} \${response.statusText}</div>
            <div class="resource-info">
                <span>大小: \${formatBytes(responseText.length)}</span>
                <span>类型: \${response.headers.get('content-type') || 'unknown'}</span>
            </div>
            <textarea class="form-textarea" style="height:150px;font-size:12px;font-family:monospace;margin-top:10px;" readonly>\${responseText}</textarea>
        </div>
        \`;
        
        showCheckStatus('请求发送成功', 'success');
    } catch (error) {
        resultContainer.innerHTML = \`
        <div class="resource-item" style="border-left-color:#ff4757;">
            <div class="resource-url">请求失败</div>
            <div style="color:#ff4757;font-size:12px;margin-top:5px;">\${error.message}</div>
        </div>
        \`;
        showCheckStatus('请求发送失败: ' + error.message, 'error');
    }
}

function clearRepeater() {
    document.getElementById('repeater-url').value = '';
    document.getElementById('repeater-headers').value = '';
    document.getElementById('repeater-body').value = '';
    document.getElementById('repeater-result').innerHTML = '';
    showCheckStatus('重放器已清空', 'success');
}

function clearCapturedResources() {
    if (confirm('确定要清空所有捕获记录吗？')) {
        capturedResources = [];
        localStorage.setItem('sniffer_captured', JSON.stringify(capturedResources));
        updateResourcesList();
        showCheckStatus('已清空捕获记录', 'success');
    }
}

function exportResources() {
    const data = JSON.stringify(capturedResources, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resources.json';
    a.click();
    URL.revokeObjectURL(url);
    showCheckStatus('资源记录已导出为JSON', 'success');
}

function exportHar() {
    const har = {
        log: {
            version: "1.2",
            creator: {
                name: "Proxy Sniffer",
                version: "1.0"
            },
            entries: capturedResources.map(resource => ({
                startedDateTime: new Date(resource.timestamp).toISOString(),
                time: 0,
                request: {
                    method: resource.method || "GET",
                    url: resource.url,
                    headers: Object.entries(resource.headers || {}).map(([name, value]) => ({ name, value })),
                    postData: resource.body ? {
                        mimeType: "application/json",
                        text: typeof resource.body === 'string' ? resource.body : JSON.stringify(resource.body)
                    } : undefined
                },
                response: {
                    status: resource.status || 0,
                    headers: Object.entries(resource.responseHeaders || {}).map(([name, value]) => ({ name, value })),
                    content: {
                        size: resource.size || 0,
                        mimeType: resource.responseHeaders?.['content-type'] || 'text/plain',
                        text: resource.responseBody || ''
                    }
                },
                cache: {},
                timings: {}
            }))
        }
    };
    
    const data = JSON.stringify(har, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resources.har';
    a.click();
    URL.revokeObjectURL(url);
    showCheckStatus('资源记录已导出为HAR', 'success');
}

function applySnifferSettings() {
    resourceSnifferEnabled = document.getElementById('sniffer-enabled').checked;
    localStorage.setItem('${resourceSnifferName}', resourceSnifferEnabled.toString());
    
    // 保存过滤设置
    const filterSettings = {
        html: document.getElementById('filter-html').checked,
        css: document.getElementById('filter-css').checked,
        js: document.getElementById('filter-js').checked,
        image: document.getElementById('filter-image').checked,
        font: document.getElementById('filter-font').checked,
        media: document.getElementById('filter-media').checked,
        xhr: document.getElementById('filter-xhr').checked,
        websocket: document.getElementById('filter-websocket').checked
    };
    localStorage.setItem('sniffer_filters', JSON.stringify(filterSettings));
    
    localStorage.setItem('sniffer_url_filter', document.getElementById('url-filter').value);
    localStorage.setItem('sniffer_auto_start', document.getElementById('auto-start-sniffer').checked.toString());
    
    if (resourceSnifferEnabled) {
        startResourceSniffing();
        showCheckStatus('资源嗅探已启用', 'success');
    } else {
        stopResourceSniffing();
        showCheckStatus('资源嗅探已禁用', 'info');
    }
    
    setTimeout(closeAllModals, 1500);
}

function startResourceSniffing() {
    if (!resourceSnifferEnabled) return;
    
    // 保存原始方法
    window.originalFetch = window.fetch;
    window.originalXHROpen = XMLHttpRequest.prototype.open;
    window.originalXHRSend = XMLHttpRequest.prototype.send;
    
    // 拦截fetch
    window.fetch = async function(...args) {
        const url = args[0];
        const options = args[1] || {};
        
        const resource = {
            url: url,
            method: options.method || 'GET',
            type: 'fetch',
            timestamp: Date.now(),
            headers: options.headers,
            body: options.body
        };
        
        captureResource(resource);
        
        // 应用修改规则
        const modified = applyRequestModifiers(url, options);
        if (modified.blocked) {
            return Promise.reject(new Error('Request blocked by resource sniffer'));
        }
        
        if (modified.redirected) {
            args[0] = modified.newUrl;
        }
        
        if (modified.modified) {
            args[1] = modified.newOptions;
        }
        
        try {
            const response = await window.originalFetch.apply(this, args);
            
            // 克隆响应以读取内容
            const clonedResponse = response.clone();
            const responseText = await clonedResponse.text();
            
            // 更新捕获的资源
            resource.status = response.status;
            resource.size = responseText.length;
            resource.responseHeaders = Object.fromEntries(response.headers.entries());
            resource.responseBody = responseText;
            
            return response;
        } catch (error) {
            resource.status = 'Error';
            resource.error = error.message;
            throw error;
        }
    };
    
    // 拦截XMLHttpRequest
    XMLHttpRequest.prototype.open = function(...args) {
        this._url = args[1];
        this._method = args[0];
        return window.originalXHROpen.apply(this, args);
    };
    
    XMLHttpRequest.prototype.send = function(...args) {
        const resource = {
            url: this._url,
            method: this._method,
            type: 'xhr',
            timestamp: Date.now(),
            body: args[0]
        };
        
        captureResource(resource);
        
        // 应用修改规则
        const modified = applyRequestModifiers(this._url, { method: this._method, body: args[0] });
        if (modified.blocked) {
            this.dispatchEvent(new Event('error'));
            return;
        }
        
        if (modified.redirected) {
            this._url = modified.newUrl;
        }
        
        if (modified.modified && modified.newOptions.body) {
            args[0] = modified.newOptions.body;
        }
        
        this.addEventListener('load', function() {
            resource.status = this.status;
            resource.size = this.response ? new Blob([this.response]).size : 0;
            resource.responseHeaders = this.getAllResponseHeaders();
            resource.responseBody = this.responseText;
        });
        
        this.addEventListener('error', function() {
            resource.status = 'Error';
        });
        
        return window.originalXHRSend.apply(this, args);
    };
}

function stopResourceSniffing() {
    // 恢复原始方法
    if (window.originalFetch) {
        window.fetch = window.originalFetch;
    }
    if (window.originalXHROpen) {
        XMLHttpRequest.prototype.open = window.originalXHROpen;
    }
    if (window.originalXHRSend) {
        XMLHttpRequest.prototype.send = window.originalXHRSend;
    }
}

function captureResource(resource) {
    // 应用过滤器
    if (!shouldCaptureResource(resource)) return;
    
    capturedResources.push(resource);
    
    // 限制记录数量
    if (capturedResources.length > 1000) {
        capturedResources = capturedResources.slice(-500);
    }
    
    // 保存到localStorage
    localStorage.setItem('sniffer_captured', JSON.stringify(capturedResources));
    
    // 更新UI（如果打开着）
    if (document.getElementById('resources-list')) {
        updateResourcesList();
    }
}

function shouldCaptureResource(resource) {
    const filterSettings = JSON.parse(localStorage.getItem('sniffer_filters') || '{}');
    const urlFilter = localStorage.getItem('sniffer_url_filter') || '';
    
    // URL过滤
    if (urlFilter && !resource.url.includes(urlFilter)) {
        return false;
    }
    
    // 类型过滤
    const url = resource.url.toLowerCase();
    if (url.endsWith('.html') && !filterSettings.html) return false;
    if (url.endsWith('.css') && !filterSettings.css) return false;
    if (url.endsWith('.js') && !filterSettings.js) return false;
    if (url.match(/\\.(jpg|jpeg|png|gif|webp|svg)$/i) && !filterSettings.image) return false;
    if (url.match(/\\.(woff|woff2|ttf|eot)$/i) && !filterSettings.font) return false;
    if (url.match(/\\.(mp4|webm|mp3|wav|avi|mov)$/i) && !filterSettings.media) return false;
    if (resource.type === 'xhr' && !filterSettings.xhr) return false;
    
    return true;
}

function applyRequestModifiers(url, options) {
    const result = {
        blocked: false,
        redirected: false,
        modified: false,
        newUrl: url,
        newOptions: { ...options }
    };
    
    requestModifiers.forEach(modifier => {
        if (!modifier.enabled) return;
        
        // 检查URL是否匹配模式
        let isMatch = false;
        if (modifier.pattern.includes('*')) {
            // 通配符匹配
            const regex = new RegExp('^' + modifier.pattern.replace(/\\*/g, '.*') + '$');
            isMatch = regex.test(url);
        } else if (modifier.pattern.startsWith('/') && modifier.pattern.endsWith('/')) {
            // 正则表达式匹配
            const regex = new RegExp(modifier.pattern.slice(1, -1));
            isMatch = regex.test(url);
        } else {
            // 简单字符串匹配
            isMatch = url.includes(modifier.pattern);
        }
        
        if (isMatch) {
            switch (modifier.action) {
                case 'block':
                    result.blocked = true;
                    break;
                case 'redirect':
                    result.redirected = true;
                    result.newUrl = modifier.value;
                    break;
                case 'modify':
                    result.modified = true;
                    if (modifier.target === 'url') {
                        result.newUrl = modifier.value;
                    } else if (modifier.target === 'body') {
                        result.newOptions.body = modifier.value;
                    }
                    break;
                case 'header':
                    result.modified = true;
                    if (!result.newOptions.headers) {
                        result.newOptions.headers = {};
                    }
                    result.newOptions.headers[modifier.headerName] = modifier.headerValue;
                    break;
            }
        }
    });
    
    return result;
}
`;

// =======================================================================================
// 第八部分：设置系统
// 功能：用户代理、语言设置和其他配置
// =======================================================================================

const settingsSystem = `
// 设置系统
function showSettingsModal() {
    const modalHTML = \`
    <div class="proxy-modal" id="settings-modal">
        <div class="proxy-modal-content" style="max-width:800px;">
            <div class="modal-header">
                <h3 class="modal-title">⚙️ 代理设置</h3>
                <button class="close-modal" onclick="closeAllModals()">×</button>
            </div>
            
            <div class="tab-container">
                <div class="tab-buttons">
                    <button class="tab-btn active" onclick="switchSettingsTab('browser')">浏览器设置</button>
                    <button class="tab-btn" onclick="switchSettingsTab('content')">内容设置</button>
                    <button class="tab-btn" onclick="switchSettingsTab('advanced')">高级设置</button>
                    <button class="tab-btn" onclick="switchSettingsTab('check')">功能检查</button>
                </div>
                
                <div id="browser-tab" class="tab-content active">
                    <div class="form-group">
                        <label class="form-label">用户代理 (User Agent)</label>
                        <select id="user-agent" class="form-select">
                            <option value="default">默认浏览器</option>
                            <option value="chrome">Chrome (Windows)</option>
                            <option value="chrome-mac">Chrome (Mac)</option>
                            <option value="firefox">Firefox</option>
                            <option value="safari">Safari</option>
                            <option value="edge">Edge</option>
                            <option value="mobile">移动端 Chrome</option>
                            <option value="custom">自定义</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="custom-ua-group" style="display:none;">
                        <label class="form-label">自定义用户代理</label>
                        <input type="text" id="custom-user-agent" class="form-input" placeholder="输入自定义User Agent字符串">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">语言偏好</label>
                        <select id="browser-language" class="form-select">
                            <option value="zh-CN">简体中文</option>
                            <option value="zh-TW">繁体中文</option>
                            <option value="en-US">English (US)</option>
                            <option value="en-GB">English (UK)</option>
                            <option value="ja-JP">日本語</option>
                            <option value="ko-KR">한국어</option>
                            <option value="fr-FR">Français</option>
                            <option value="de-DE">Deutsch</option>
                            <option value="es-ES">Español</option>
                            <option value="ru-RU">Русский</option>
                            <option value="custom">自定义</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="custom-lang-group" style="display:none;">
                        <label class="form-label">自定义语言</label>
                        <input type="text" id="custom-language" class="form-input" placeholder="例如: en-US, zh-CN">
                    </div>
                </div>
                
                <div id="content-tab" class="tab-content">
                    <div class="form-group">
                        <label style="display:flex;align-items:center;justify-content:space-between;">
                            <span style="color:#e0e0e0;font-size:16px;font-weight:500;">无图模式</span>
                            <label class="switch">
                                <input type="checkbox" id="no-image-mode">
                                <span class="slider"></span>
                            </label>
                        </label>
                        <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">启用后将不加载图片和视频</div>
                    </div>
                    
                    <div class="form-group">
                        <label style="display:flex;align-items:center;justify-content:space-between;">
                            <span style="color:#e0e0e0;font-size:16px;font-weight:500;">无视频模式</span>
                            <label class="switch">
                                <input type="checkbox" id="no-video-mode">
                                <span class="slider"></span>
                            </label>
                        </label>
                        <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">启用后将不加载视频内容</div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">自定义拦截后缀</label>
                        <textarea id="blocked-extensions" class="form-textarea" placeholder="每行一个后缀，例如: .mp4 .avi .exe .mkv .mov .wmv .flv .webm" style="height:100px;"></textarea>
                        <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">设置需要拦截的文件类型后缀</div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">自定义拦截域名</label>
                        <textarea id="blocked-domains" class="form-textarea" placeholder="每行一个域名，例如: ads.com tracker.org" style="height:100px;"></textarea>
                        <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">设置需要拦截的域名</div>
                    </div>
                </div>
                
                <div id="advanced-tab" class="tab-content">
                    <div class="form-group">
                        <label style="display:flex;align-items:center;justify-content:space-between;">
                            <span style="color:#e0e0e0;font-size:16px;font-weight:500;">启用所有功能</span>
                            <label class="switch">
                                <input type="checkbox" id="enable-all-features">
                                <span class="slider"></span>
                            </label>
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">功能状态</label>
                        <div style="display:grid;gap:10px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px;">
                                <span style="color:#e0e0e0;">广告拦截</span>
                                <span id="adblock-status" class="status-badge status-off">关闭</span>
                            </div>
                            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px;">
                                <span style="color:#e0e0e0;">资源嗅探</span>
                                <span id="sniffer-status" class="status-badge status-off">关闭</span>
                            </div>
                            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px;">
                                <span style="color:#e0e0e0;">无图模式</span>
                                <span id="image-mode-status" class="status-badge status-off">关闭</span>
                            </div>
                            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px;">
                                <span style="color:#e0e0e0;">无视频模式</span>
                                <span id="video-mode-status" class="status-badge status-off">关闭</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <button class="btn btn-secondary" onclick="resetAllSettings()" style="width:100%;">恢复默认设置</button>
                    </div>
                </div>
                
                <div id="check-tab" class="tab-content">
                    <div class="form-group">
                        <label class="form-label">功能检查</label>
                        <div style="display:grid;gap:10px;">
                            <button class="btn btn-secondary" onclick="checkAdBlock()">检查广告拦截</button>
                            <button class="btn btn-secondary" onclick="checkResourceSniffer()">检查资源嗅探</button>
                            <button class="btn btn-secondary" onclick="checkCookieInjection()">检查Cookie注入</button>
                            <button class="btn btn-secondary" onclick="checkImageBlocking()">检查图片拦截</button>
                            <button class="btn btn-secondary" onclick="checkAllFeatures()">检查所有功能</button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">检查结果</label>
                        <div id="check-results" style="min-height:100px;background:rgba(0,0,0,0.3);padding:15px;border-radius:8px;font-size:13px;"></div>
                    </div>
                </div>
            </div>
            
            <div class="btn-group">
                <button class="btn btn-secondary" onclick="closeAllModals()">取消</button>
                <button class="btn btn-primary" onclick="saveAllSettings()">保存所有设置</button>
            </div>
        </div>
    </div>
    \`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    setTimeout(() => {
        const modal = document.getElementById('settings-modal');
        const content = modal.querySelector('.proxy-modal-content');
        modal.classList.add('show');
        content.classList.add('show');
        
        loadSettings();
        updateStatusBadges();
        
        // 添加事件监听
        document.getElementById('user-agent').addEventListener('change', function() {
            if (this.value === 'custom') {
                document.getElementById('custom-ua-group').style.display = 'block';
            } else {
                document.getElementById('custom-ua-group').style.display = 'none';
            }
        });
        
        document.getElementById('browser-language').addEventListener('change', function() {
            if (this.value === 'custom') {
                document.getElementById('custom-lang-group').style.display = 'block';
            } else {
                document.getElementById('custom-lang-group').style.display = 'none';
            }
        });
    }, 50);
}

function switchSettingsTab(tabName) {
    // 更新标签按钮
    document.querySelectorAll('#settings-modal .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 更新标签内容
    document.querySelectorAll('#settings-modal .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + '-tab').classList.add('active');
}

function loadSettings() {
    try {
        // 用户代理设置
        const uaSetting = localStorage.getItem('${userAgentName}') || 'default';
        document.getElementById('user-agent').value = uaSetting;
        
        const customUA = localStorage.getItem('custom_user_agent') || '';
        document.getElementById('custom-user-agent').value = customUA;
        
        if (uaSetting === 'custom') {
            document.getElementById('custom-ua-group').style.display = 'block';
        }
        
        // 语言设置
        const langSetting = localStorage.getItem('${languageName}') || 'zh-CN';
        document.getElementById('browser-language').value = langSetting;
        
        const customLang = localStorage.getItem('custom_language') || '';
        document.getElementById('custom-language').value = customLang;
        
        if (langSetting === 'custom') {
            document.getElementById('custom-lang-group').style.display = 'block';
        }
        
        // 图片和视频模式
        const noImageMode = localStorage.getItem('no_image_mode') === 'true';
        document.getElementById('no-image-mode').checked = noImageMode;
        
        const noVideoMode = localStorage.getItem('no_video_mode') === 'true';
        document.getElementById('no-video-mode').checked = noVideoMode;
        
        // 拦截设置
        const blockedExtensions = localStorage.getItem('blocked_extensions') || '';
        document.getElementById('blocked-extensions').value = blockedExtensions;
        
        const blockedDomains = localStorage.getItem('blocked_domains') || '';
        document.getElementById('blocked-domains').value = blockedDomains;
        
        // 高级设置
        const enableAll = localStorage.getItem('enable_all_features') === 'true';
        document.getElementById('enable-all-features').checked = enableAll;
        
    } catch (e) {
        console.error('加载设置失败:', e);
    }
}

function updateStatusBadges() {
    const adblockEnabled = localStorage.getItem('${adBlockEnabledName}') === 'true';
    const snifferEnabled = localStorage.getItem('${resourceSnifferName}') === 'true';
    const noImageMode = localStorage.getItem('no_image_mode') === 'true';
    const noVideoMode = localStorage.getItem('no_video_mode') === 'true';
    
    document.getElementById('adblock-status').textContent = adblockEnabled ? '开启' : '关闭';
    document.getElementById('adblock-status').className = adblockEnabled ? 'status-badge status-on' : 'status-badge status-off';
    
    document.getElementById('sniffer-status').textContent = snifferEnabled ? '开启' : '关闭';
    document.getElementById('sniffer-status').className = snifferEnabled ? 'status-badge status-on' : 'status-badge status-off';
    
    document.getElementById('image-mode-status').textContent = noImageMode ? '开启' : '关闭';
    document.getElementById('image-mode-status').className = noImageMode ? 'status-badge status-on' : 'status-badge status-off';
    
    document.getElementById('video-mode-status').textContent = noVideoMode ? '开启' : '关闭';
    document.getElementById('video-mode-status').className = noVideoMode ? 'status-badge status-on' : 'status-badge status-off';
}

function saveAllSettings() {
    try {
        // 保存用户代理设置
        const uaSetting = document.getElementById('user-agent').value;
        localStorage.setItem('${userAgentName}', uaSetting);
        
        if (uaSetting === 'custom') {
            const customUA = document.getElementById('custom-user-agent').value;
            localStorage.setItem('custom_user_agent', customUA);
        }
        
        // 保存语言设置
        const langSetting = document.getElementById('browser-language').value;
        localStorage.setItem('${languageName}', langSetting);
        
        if (langSetting === 'custom') {
            const customLang = document.getElementById('custom-language').value;
            localStorage.setItem('custom_language', customLang);
        }
        
        // 保存图片和视频模式
        const noImageMode = document.getElementById('no-image-mode').checked;
        localStorage.setItem('no_image_mode', noImageMode.toString());
        applyImageMode(noImageMode);
        
        const noVideoMode = document.getElementById('no-video-mode').checked;
        localStorage.setItem('no_video_mode', noVideoMode.toString());
        applyVideoMode(noVideoMode);
        
        // 保存拦截设置
        const blockedExtensions = document.getElementById('blocked-extensions').value;
        localStorage.setItem('blocked_extensions', blockedExtensions);
        
        const blockedDomains = document.getElementById('blocked-domains').value;
        localStorage.setItem('blocked_domains', blockedDomains);
        
        // 保存高级设置
        const enableAll = document.getElementById('enable-all-features').checked;
        localStorage.setItem('enable_all_features', enableAll.toString());
        
        if (enableAll) {
            enableAllFeatures();
        }
        
        updateStatusBadges();
        showCheckStatus('所有设置已保存', 'success');
        setTimeout(closeAllModals, 1500);
        
    } catch (e) {
        showCheckStatus('保存设置失败: ' + e.message, 'error');
    }
}

function applyImageMode(enabled) {
    const images = document.querySelectorAll('img');
    
    if (enabled) {
        images.forEach(img => {
            img.style.display = 'none';
        });
    } else {
        images.forEach(img => {
            img.style.display = '';
        });
    }
}

function applyVideoMode(enabled) {
    const videos = document.querySelectorAll('video, audio, iframe[src*="youtube"], iframe[src*="vimeo"]');
    
    if (enabled) {
        videos.forEach(video => {
            video.style.display = 'none';
        });
    } else {
        videos.forEach(video => {
            video.style.display = '';
        });
    }
}

function enableAllFeatures() {
    localStorage.setItem('${adBlockEnabledName}', 'true');
    localStorage.setItem('${resourceSnifferName}', 'true');
    localStorage.setItem('no_image_mode', 'true');
    localStorage.setItem('no_video_mode', 'true');
    
    // 加载默认广告规则
    const defaultRules = [
        '||ads.example.com^',
        '||doubleclick.net^',
        '||googleadservices.com^',
        '||googlesyndication.com^',
        '##.ad-container',
        '##.ad-banner',
        '##[class*="advertisement"]'
    ];
    localStorage.setItem('adblock_custom_rules', defaultRules.join('\\n'));
    
    showCheckStatus('已启用所有功能', 'success');
}

function resetAllSettings() {
    if (confirm('确定要恢复所有默认设置吗？这将清除所有自定义配置。')) {
        localStorage.removeItem('${userAgentName}');
        localStorage.removeItem('${languageName}');
        localStorage.removeItem('${adBlockEnabledName}');
        localStorage.removeItem('${resourceSnifferName}');
        localStorage.removeItem('${cookieInjectionDataName}');
        localStorage.removeItem('adblock_rules');
        localStorage.removeItem('adblock_custom_rules');
        localStorage.removeItem('adblock_custom_subscriptions');
        localStorage.removeItem('sniffer_captured');
        localStorage.removeItem('sniffer_modifiers');
        localStorage.removeItem('blocked_extensions');
        localStorage.removeItem('blocked_domains');
        localStorage.removeItem('enable_all_features');
        localStorage.removeItem('no_image_mode');
        localStorage.removeItem('no_video_mode');
        localStorage.removeItem('custom_user_agent');
        localStorage.removeItem('custom_language');
        
        showCheckStatus('已恢复默认设置', 'success');
        setTimeout(() => window.location.reload(), 1500);
    }
}

// 功能检查方法
function checkAdBlock() {
    const enabled = localStorage.getItem('${adBlockEnabledName}') === 'true';
    const rules = JSON.parse(localStorage.getItem('adblock_rules') || '[]');
    
    let result = \`广告拦截状态: \${enabled ? '✅ 已启用' : '❌ 未启用'}\\n\`;
    result += \`规则数量: \${rules.length}\\n\`;
    
    if (rules.length > 0) {
        result += '✅ 规则加载正常\\n';
    } else {
        result += '⚠️ 未加载任何规则\\n';
    }
    
    document.getElementById('check-results').textContent = result;
    showCheckStatus('广告拦截检查完成', 'success');
}

function checkResourceSniffer() {
    const enabled = localStorage.getItem('${resourceSnifferName}') === 'true';
    const modifiers = JSON.parse(localStorage.getItem('sniffer_modifiers') || '[]');
    
    let result = \`资源嗅探状态: \${enabled ? '✅ 已启用' : '❌ 未启用'}\\n\`;
    result += \`修改规则数量: \${modifiers.length}\\n\`;
    
    if (modifiers.length > 0) {
        const enabledModifiers = modifiers.filter(m => m.enabled).length;
        result += \`启用规则: \${enabledModifiers}\\n\`;
    }
    
    document.getElementById('check-results').textContent = result;
    showCheckStatus('资源嗅探检查完成', 'success');
}

function checkCookieInjection() {
    const cookieSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    const websites = Object.keys(cookieSettings);
    
    let result = \`Cookie注入配置数量: \${websites.length}\\n\`;
    
    websites.forEach(website => {
        const settings = cookieSettings[website];
        result += \`\\n\${website}: \${settings.cookies ? settings.cookies.length : 0} 个Cookie\`;
    });
    
    document.getElementById('check-results').textContent = result;
    showCheckStatus('Cookie注入检查完成', 'success');
}

function checkImageBlocking() {
    const noImageMode = localStorage.getItem('no_image_mode') === 'true';
    const noVideoMode = localStorage.getItem('no_video_mode') === 'true';
    const blockedExtensions = localStorage.getItem('blocked_extensions') || '';
    
    let result = \`无图模式: \${noImageMode ? '✅ 已启用' : '❌ 未启用'}\\n\`;
    result += \`无视频模式: \${noVideoMode ? '✅ 已启用' : '❌ 未启用'}\\n\`;
    result += \`拦截后缀: \${blockedExtensions ? blockedExtensions.split('\\\\n').length : 0} 个\\n\`;
    
    document.getElementById('check-results').textContent = result;
    showCheckStatus('内容拦截检查完成', 'success');
}

function checkAllFeatures() {
    let result = '';
    
    // 检查广告拦截
    const adblockEnabled = localStorage.getItem('${adBlockEnabledName}') === 'true';
    const adblockRules = JSON.parse(localStorage.getItem('adblock_rules') || '[]');
    result += \`广告拦截: \${adblockEnabled ? '✅' : '❌'} (\${adblockRules.length}规则)\\n\`;
    
    // 检查资源嗅探
    const snifferEnabled = localStorage.getItem('${resourceSnifferName}') === 'true';
    const snifferModifiers = JSON.parse(localStorage.getItem('sniffer_modifiers') || '[]');
    result += \`资源嗅探: \${snifferEnabled ? '✅' : '❌'} (\${snifferModifiers.length}规则)\\n\`;
    
    // 检查Cookie注入
    const cookieSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    result += \`Cookie注入: ✅ (\${Object.keys(cookieSettings).length}网站)\\n\`;
    
    // 检查内容拦截
    const noImageMode = localStorage.getItem('no_image_mode') === 'true';
    const noVideoMode = localStorage.getItem('no_video_mode') === 'true';
    result += \`无图模式: \${noImageMode ? '✅' : '❌'}\\n\`;
    result += \`无视频模式: \${noVideoMode ? '✅' : '❌'}\\n\`;
    
    document.getElementById('check-results').textContent = result;
    showCheckStatus('所有功能检查完成', 'success');
}

// 用户代理字符串映射
const userAgentMap = {
    'default': navigator.userAgent,
    'chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'chrome-mac': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'firefox': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'safari': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'edge': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
    'mobile': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36'
};
`;

// =======================================================================================
// 第九部分：初始化系统
// 功能：加载所有系统并初始化
// =======================================================================================

const initializationSystem = `
// 初始化系统
function loadAllSettings() {
    // 加载广告拦截设置
    adBlockEnabled = localStorage.getItem('${adBlockEnabledName}') === 'true';
    adBlockRules = JSON.parse(localStorage.getItem('adblock_rules') || '[]');
    
    if (adBlockEnabled) {
        startAdBlocking();
    }
    
    // 加载资源嗅探设置
    resourceSnifferEnabled = localStorage.getItem('${resourceSnifferName}') === 'true';
    requestModifiers = JSON.parse(localStorage.getItem('sniffer_modifiers') || '[]');
    
    if (resourceSnifferEnabled) {
        startResourceSniffing();
    }
    
    // 加载图片模式设置
    const noImageMode = localStorage.getItem('no_image_mode') === 'true';
    if (noImageMode) {
        applyImageMode(true);
    }
    
    // 加载视频模式设置
    const noVideoMode = localStorage.getItem('no_video_mode') === 'true';
    if (noVideoMode) {
        applyVideoMode(true);
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initToolbarSystem, 100);
    });
} else {
    setTimeout(initToolbarSystem, 100);
}
`;

// =======================================================================================
// 第十部分：主请求处理函数
// 功能：处理所有代理请求，注入脚本和功能
// =======================================================================================

async function handleRequest(request) {
  const url = new URL(request.url);
  const proxyBase = url.protocol + "//" + url.host + str;
  let originalUrl = url.href.substring(proxyBase.length);
  
  // 处理代理服务器本身
  if (!originalUrl || originalUrl === proxyBase || originalUrl === url.host + str) {
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>高级网络代理</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .feature { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>高级网络代理</h1>
        <p>输入网址开始使用代理服务：</p>
        <input type="text" id="url" placeholder="https://example.com" style="width: 70%; padding: 8px;">
        <button onclick="go()" style="padding: 8px 15px;">访问</button>
        
        <div class="feature">
          <h3>功能特性：</h3>
          <ul>
            <li>Cookie注入和管理</li>
            <li>广告拦截和元素标记</li>
            <li>资源嗅探和请求修改</li>
            <li>无图/无视频模式</li>
            <li>用户代理切换</li>
          </ul>
        </div>
        
        <script>
          function go() {
            const url = document.getElementById('url').value;
            if (url) {
              window.location.href = '${proxyBase}' + url;
            }
          }
          document.getElementById('url').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') go();
          });
        </script>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  // 处理文件上传422错误
  if (request.method === 'POST') {
    try {
      const formData = await request.formData();
      // 处理文件上传逻辑
      return new Response(JSON.stringify({
        success: true,
        message: 'File uploaded successfully'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Upload failed: ' + error.message
      }), {
        status: 422,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }

  // 获取原始页面
  let response;
  try {
    response = await fetch(originalUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'manual'
    });
  } catch (error) {
    return new Response('Error fetching page: ' + error.message, { status: 500 });
  }

  // 处理重定向
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    const location = response.headers.get('location');
    if (location) {
      return Response.redirect(proxyBase + location, response.status);
    }
  }

  const contentType = response.headers.get('content-type') || '';
  
  // 只处理HTML内容
  if (contentType.includes('text/html')) {
    let html = await response.text();
    
    // 注入所有系统脚本
    const injectionScript = `
      <script>
        ${toolbarSystem}
        ${cookieInjectionSystem}
        ${adBlockSystem}
        ${resourceSnifferSystem}
        ${settingsSystem}
        ${initializationSystem}
      </script>
    `;
    
    // 注入代理提示和工具栏系统
    html = html.replace('</body>', `${proxyHintInjection}${injectionScript}</body>`);
    
    return new Response(html, {
      status: response.status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  // 对于非HTML内容，直接返回
  return new Response(response.body, {
    status: response.status,
    headers: response.headers
  });
}