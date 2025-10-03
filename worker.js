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
    
    // 添加事件监听 - 修复点击穿透问题
    document.getElementById('tools-toggle').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleExtendedToolbar();
    });
    
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
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

/* 防止工具栏点击穿透 */
#proxy-toolbar * {
    pointer-events: auto !important;
}

/* 修复CSS冲突问题 */
.proxy-toolbar-element {
    all: initial !important;
    font-family: system-ui, -apple-system, sans-serif !important;
}

/* 文件上传样式 */
.file-upload-area {
    border: 2px dashed rgba(255,255,255,0.3);
    border-radius: 10px;
    padding: 30px;
    text-align: center;
    transition: all 0.3s ease;
    margin-bottom: 15px;
}

.file-upload-area.dragover {
    border-color: #4fc3f7;
    background: rgba(79,195,247,0.1);
}

.file-upload-text {
    color: #e0e0e0;
    margin-bottom: 15px;
}

.file-input {
    display: none;
}

.upload-btn {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

.upload-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(79,195,247,0.4);
}
</style>
\`;

// 注入全局样式
document.head.insertAdjacentHTML('beforeend', toolbarStyles);
`;

// =======================================================================================
// 第五部分：增强版Cookie注入功能
// 功能：完整的Cookie注入系统，支持管理界面和网站Cookie记录
// =======================================================================================

const cookieInjectionSystem = `
// Cookie注入系统
let currentCookies = [];
let separateCookies = [];
let cookieHistory = {};

function showCookieInjectionModal() {
    const modalHTML = \`
    <div class="proxy-modal" id="cookie-modal">
        <div class="proxy-modal-content" style="max-width:1000px;">
            <div class="modal-header">
                <h3 class="modal-title">🍪 Cookie注入与管理</h3>
                <button class="close-modal" onclick="closeAllModals()">×</button>
            </div>
            
            <div class="tab-container">
                <div class="tab-buttons">
                    <button class="tab-btn active" onclick="switchCookieTab('combined')">合成Cookie</button>
                    <button class="tab-btn" onclick="switchCookieTab('separate')">分段输入</button>
                    <button class="tab-btn" onclick="switchCookieTab('manage')">管理规则</button>
                    <button class="tab-btn" onclick="switchCookieTab('history')">网站Cookie记录</button>
                </div>
                
                <div id="combined-tab" class="tab-content active">
                    <div class="form-group">
                        <label class="form-label">目标网站</label>
                        <input type="text" id="target-website" class="form-input" value="\${getCurrentWebsite()}" readonly>
                        <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">自动获取当前代理网站地址</div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Cookie字符串</label>
                        <textarea id="combined-cookie" class="form-textarea" placeholder="例如: name=value; name2=value2; path=/; domain=.example.com" style="height:120px;"></textarea>
                        <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">输入完整的Cookie字符串，多个Cookie用分号分隔</div>
                    </div>
                </div>
                
                <div id="separate-tab" class="tab-content">
                    <div class="form-group">
                        <label class="form-label">目标网站</label>
                        <input type="text" id="target-website-separate" class="form-input" value="\${getCurrentWebsite()}" readonly>
                    </div>
                    
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
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:15px;">
                            <div>
                                <label style="display:flex;align-items:center;gap:8px;">
                                    <input type="checkbox" id="cookie-secure">
                                    <span style="color:#e0e0e0;font-size:14px;">Secure</span>
                                </label>
                            </div>
                            <div>
                                <label style="display:flex;align-items:center;gap:8px;">
                                    <input type="checkbox" id="cookie-httponly">
                                    <span style="color:#e0e0e0;font-size:14px;">HttpOnly</span>
                                </label>
                            </div>
                        </div>
                        <button class="btn btn-secondary" onclick="addSeparateCookie()" style="width:100%;margin-bottom:15px;">添加Cookie</button>
                        
                        <div id="cookie-list" style="max-height:200px;overflow-y:auto;background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;"></div>
                    </div>
                </div>
                
                <div id="manage-tab" class="tab-content">
                    <div class="form-group">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                            <label class="form-label">已保存的Cookie规则</label>
                            <button class="btn btn-primary" onclick="exportCookieRules()" style="padding:8px 15px;font-size:12px;">导出规则</button>
                        </div>
                        <div id="saved-cookies-list" style="max-height:300px;overflow-y:auto;background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;"></div>
                    </div>
                </div>
                
                <div id="history-tab" class="tab-content">
                    <div class="form-group">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                            <label class="form-label">当前网站Cookie记录</label>
                            <button class="btn btn-secondary" onclick="refreshCookieHistory()" style="padding:8px 15px;font-size:12px;">刷新</button>
                        </div>
                        <div id="cookie-history-list" style="max-height:300px;overflow-y:auto;background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;"></div>
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
                <button class="btn btn-secondary" onclick="checkCookieInjection()">检查注入</button>
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
        loadSavedCookies();
        loadCookieHistory();
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

function addSeparateCookie() {
    const name = document.getElementById('cookie-name').value.trim();
    const value = document.getElementById('cookie-value').value.trim();
    const domain = document.getElementById('cookie-domain').value.trim();
    const path = document.getElementById('cookie-path').value.trim() || '/';
    const secure = document.getElementById('cookie-secure').checked;
    const httpOnly = document.getElementById('cookie-httponly').checked;
    
    if (!name || !value) {
        showNotification('请填写Cookie名称和值', 'error');
        return;
    }
    
    const cookie = {
        name: name,
        value: value,
        domain: domain,
        path: path,
        secure: secure,
        httpOnly: httpOnly
    };
    
    separateCookies.push(cookie);
    updateCookieList();
    
    // 清空输入框
    document.getElementById('cookie-name').value = '';
    document.getElementById('cookie-value').value = '';
    document.getElementById('cookie-domain').value = '';
    document.getElementById('cookie-path').value = '/';
    document.getElementById('cookie-secure').checked = false;
    document.getElementById('cookie-httponly').checked = false;
    
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
                <div style="font-size:10px;color:#b0b0b0;">\${cookie.domain || '当前域名'} | \${cookie.path} \${cookie.secure ? '| Secure' : ''} \${cookie.httpOnly ? '| HttpOnly' : ''}</div>
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
    const targetWebsite = document.getElementById('target-website').value || document.getElementById('target-website-separate').value;
    const activeTab = document.querySelector('#cookie-modal .tab-btn.active').textContent;
    const autoRefresh = document.getElementById('auto-refresh').checked;
    
    let cookies = [];
    
    if (activeTab.includes('合成')) {
        const cookieStr = document.getElementById('combined-cookie').value.trim();
        if (cookieStr) {
            cookies = parseCombinedCookie(cookieStr);
        }
    } else if (activeTab.includes('分段')) {
        cookies = [...separateCookies];
    } else {
        showNotification('请在合成或分段标签页中保存Cookie规则', 'error');
        return;
    }
    
    const settings = {
        targetWebsite: targetWebsite,
        inputType: activeTab.includes('合成') ? 'combined' : 'separate',
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
        
        showNotification('Cookie设置已保存并应用', 'success');
        
        if (autoRefresh) {
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            setTimeout(() => {
                closeAllModals();
                checkCookieInjection();
            }, 1500);
        }
    } catch (e) {
        showNotification('保存失败: ' + e.message, 'error');
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
                switchCookieTab('combined');
                if (settings.cookies && settings.cookies.length > 0) {
                    const cookieStr = settings.cookies.map(c => \`\${c.name}=\${c.value}\`).join('; ');
                    document.getElementById('combined-cookie').value = cookieStr;
                }
            } else {
                switchCookieTab('separate');
                separateCookies = settings.cookies || [];
                updateCookieList();
            }
        }
    } catch (e) {
        console.log('加载Cookie设置失败:', e);
    }
}

function loadSavedCookies() {
    const container = document.getElementById('saved-cookies-list');
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    
    if (Object.keys(allSettings).length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#b0b0b0;padding:20px;">暂无保存的Cookie规则</div>';
        return;
    }
    
    let html = '';
    for (const [website, settings] of Object.entries(allSettings)) {
        html += \`
        <div class="resource-item">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                <div style="flex:1;">
                    <div class="resource-url">\${website}</div>
                    <div class="resource-info">
                        <span>输入类型: \${settings.inputType}</span>
                        <span>Cookie数量: \${settings.cookies ? settings.cookies.length : 0}</span>
                        <span>保存时间: \${new Date(settings.timestamp).toLocaleString()}</span>
                    </div>
                </div>
                <div style="display:flex;gap:5px;">
                    <button onclick="editCookieRule('\${website}')" style="background:#4caf50;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;">编辑</button>
                    <button onclick="deleteCookieRule('\${website}')" style="background:#ff4757;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;">删除</button>
                </div>
            </div>
        </div>
        \`;
    }
    
    container.innerHTML = html;
}

function editCookieRule(website) {
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    const settings = allSettings[website];
    
    if (!settings) return;
    
    // 切换到相应的标签页
    if (settings.inputType === 'combined') {
        switchCookieTab('combined');
        document.getElementById('target-website').value = website;
        if (settings.cookies && settings.cookies.length > 0) {
            const cookieStr = settings.cookies.map(c => \`\${c.name}=\${c.value}\`).join('; ');
            document.getElementById('combined-cookie').value = cookieStr;
        }
    } else {
        switchCookieTab('separate');
        document.getElementById('target-website-separate').value = website;
        separateCookies = settings.cookies || [];
        updateCookieList();
    }
    
    showNotification('已加载Cookie规则，请修改后保存', 'success');
}

function deleteCookieRule(website) {
    if (confirm(\`确定要删除网站 \${website} 的Cookie规则吗？\`)) {
        const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
        delete allSettings[website];
        localStorage.setItem('${cookieInjectionDataName}', JSON.stringify(allSettings));
        loadSavedCookies();
        showNotification('已删除Cookie规则', 'success');
    }
}

function loadCookieHistory() {
    const container = document.getElementById('cookie-history-list');
    const currentWebsite = getCurrentWebsite();
    const allCookies = document.cookie.split(';').map(c => c.trim()).filter(c => c);
    
    if (allCookies.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#b0b0b0;padding:20px;">当前网站暂无Cookie记录</div>';
        return;
    }
    
    let html = '';
    allCookies.forEach(cookie => {
        const [name, ...valueParts] = cookie.split('=');
        const value = valueParts.join('=');
        
        html += \`
        <div class="resource-item">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div style="flex:1;">
                    <div style="font-weight:500;color:white;">\${name}=\${value}</div>
                    <div style="font-size:10px;color:#b0b0b0;">当前网站: \${currentWebsite}</div>
                </div>
                <button onclick="copyCookieValue('\${name}', '\${value}')" style="background:#4fc3f7;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;">复制</button>
            </div>
        </div>
        \`;
    });
    
    container.innerHTML = html;
}

function refreshCookieHistory() {
    loadCookieHistory();
    showNotification('Cookie记录已刷新', 'success');
}

function copyCookieValue(name, value) {
    navigator.clipboard.writeText(\`\${name}=\${value}\`).then(() => {
        showNotification('Cookie已复制到剪贴板', 'success');
    });
}

function exportCookieRules() {
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    const data = JSON.stringify(allSettings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cookie-rules.json';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Cookie规则已导出', 'success');
}

function checkCookieInjection() {
    const targetWebsite = getCurrentWebsite();
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    const settings = allSettings[targetWebsite];
    
    if (!settings) {
        showNotification('未找到该网站的Cookie注入规则', 'error');
        return;
    }
    
    // 检查Cookie是否已注入
    const expectedCookies = settings.cookies || [];
    let allInjected = true;
    const missingCookies = [];
    
    expectedCookies.forEach(expectedCookie => {
        const actualCookie = getCookie(expectedCookie.name);
        if (!actualCookie || actualCookie !== expectedCookie.value) {
            allInjected = false;
            missingCookies.push(expectedCookie.name);
        }
    });
    
    if (allInjected) {
        showNotification('✓ Cookie注入检查通过，所有Cookie已成功注入', 'success');
    } else {
        showNotification(\`✗ Cookie注入检查失败，以下Cookie未注入: \${missingCookies.join(', ')}\`, 'error');
    }
}

function getCookie(name) {
    const value = \`; \${document.cookie}\`;
    const parts = value.split(\`; \${name}=\`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
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
// 第六部分：增强版广告拦截系统
// 功能：完整的广告拦截和元素标记系统，支持规则订阅和多选标记
// =======================================================================================

const adBlockSystem = `
// 广告拦截系统
let adBlockEnabled = false;
let adBlockRules = [];
let isSelectingAd = false;
let selectedElements = new Set();

// 规则订阅源
const ruleSubscriptions = {
    'easylist': 'https://easylist-downloads.adblockplus.org/easylist.txt',
    'easylist_china': 'https://easylist-downloads.adblockplus.org/easylistchina.txt',
    'cjx_annoyance': 'https://fastly.jsdelivr.net/gh/cjx82630/cjxlist/cjx-annoyance.txt',
    'easyprivacy': 'https://easylist-downloads.adblockplus.org/easyprivacy.txt',
    'antiadblock': 'https://easylist-downloads.adblockplus.org/antiadblockfilters.txt'
};

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
                    <button class="tab-btn" onclick="switchAdBlockTab('subscriptions')">规则订阅</button>
                </div>
                
                <div id="rules-tab" class="tab-content active">
                    <div class="form-group">
                        <label class="form-label">已加载规则数量: <span id="rules-count">0</span></label>
                        <div style="display:flex;gap:10px;margin-bottom:15px;">
                            <button class="btn btn-primary" onclick="loadDefaultRules()" style="padding:8px 15px;font-size:12px;">加载默认规则</button>
                            <button class="btn btn-secondary" onclick="clearAllRules()" style="padding:8px 15px;font-size:12px;">清空规则</button>
                            <button class="btn btn-secondary" onclick="checkAdBlockStatus()" style="padding:8px 15px;font-size:12px;">检查状态</button>
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
                        <button class="btn btn-secondary" onclick="importCustomRules()">导入规则</button>
                    </div>
                </div>
                
                <div id="element-tab" class="tab-content">
                    <div class="form-group">
                        <p style="color:#e0e0e0;margin-bottom:15px;">点击"开始标记"后，按住Ctrl键点击页面上的广告元素进行多选标记</p>
                        
                        <div class="btn-group">
                            <button class="btn btn-primary" id="start-select-btn" onclick="startElementSelection()">开始标记</button>
                            <button class="btn btn-secondary" id="stop-select-btn" onclick="stopElementSelection()" style="display:none;">停止标记</button>
                            <button class="btn btn-secondary" id="confirm-select-btn" onclick="confirmElementSelection()" style="display:none;">确认标记</button>
                        </div>
                        
                        <div id="selected-elements-count" style="margin:15px 0;color:#e0e0e0;font-size:14px;">
                            已选择: <span id="selected-count">0</span> 个元素
                        </div>
                        
                        <div id="selected-elements" style="max-height:200px;overflow-y:auto;"></div>
                    </div>
                </div>
                
                <div id="subscriptions-tab" class="tab-content">
                    <div class="form-group">
                        <label class="form-label">规则订阅管理</label>
                        <div style="display:grid;gap:10px;margin-bottom:15px;">
                            <label style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px;">
                                <input type="checkbox" id="rule-easylist" checked>
                                <span style="color:#e0e0e0;">EasyList (主要规则)</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px;">
                                <input type="checkbox" id="rule-easylist-china" checked>
                                <span style="color:#e0e0e0;">EasyList China (中文规则)</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px;">
                                <input type="checkbox" id="rule-cjx-annoyance">
                                <span style="color:#e0e0e0;">CJX Annoyance (烦人内容)</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px;">
                                <input type="checkbox" id="rule-easyprivacy">
                                <span style="color:#e0e0e0;">EasyPrivacy (隐私保护)</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,0.05);border-radius:8px;">
                                <input type="checkbox" id="rule-antiadblock">
                                <span style="color:#e0e0e0;">Anti-Adblock (反屏蔽检测)</span>
                            </label>
                        </div>
                        
                        <div class="btn-group">
                            <button class="btn btn-primary" onclick="updateSubscriptionRules()">更新订阅规则</button>
                            <button class="btn btn-secondary" onclick="saveSubscriptionSettings()">保存订阅设置</button>
                        </div>
                        
                        <div class="form-group" style="margin-top:20px;">
                            <label class="form-label">自定义订阅URL</label>
                            <input type="text" id="custom-subscription" class="form-input" placeholder="输入自定义规则订阅URL">
                            <button class="btn btn-secondary" onclick="addCustomSubscription()" style="margin-top:10px;width:100%;">添加自定义订阅</button>
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
        
    } catch (e) {
        console.error('加载广告拦截设置失败:', e);
    }
}

function updateRulesDisplay() {
    document.getElementById('rules-count').textContent = adBlockRules.length;
    
    const rulesList = document.getElementById('rules-list');
    if (adBlockRules.length === 0) {
        rulesList.innerHTML = '<div style="text-align:center;color:#b0b0b0;padding:20px;">暂无规则，请点击"加载默认规则"</div>';
        return;
    }
    
    let html = '';
    adBlockRules.slice(0, 100).forEach((rule, index) => {
        const isElementRule = rule.startsWith('##');
        const isException = rule.startsWith('@@');
        const ruleClass = isElementRule ? 'style="border-left-color:#4caf50;"' : 
                          isException ? 'style="border-left-color:#ff9800;"' : '';
        
        html += \`<div class="resource-item" \${ruleClass}>\${rule}</div>\`;
    });
    
    if (adBlockRules.length > 100) {
        html += \`<div style="text-align:center;color:#b0b0b0;padding:10px;">... 还有 \${adBlockRules.length - 100} 条规则</div>\`;
    }
    
    rulesList.innerHTML = html;
}

async function loadDefaultRules() {
    showNotification('正在加载规则...', 'info');
    
    const rules = [];
    const ruleSettings = {
        easylist: document.getElementById('rule-easylist').checked,
        easylist_china: document.getElementById('rule-easylist-china').checked,
        cjx_annoyance: document.getElementById('rule-cjx-annoyance').checked,
        easyprivacy: document.getElementById('rule-easyprivacy').checked,
        antiadblock: document.getElementById('rule-antiadblock').checked
    };
    
    try {
        for (const [ruleName, ruleUrl] of Object.entries(ruleSubscriptions)) {
            if (ruleSettings[ruleName]) {
                try {
                    const response = await fetch(ruleUrl);
                    if (response.ok) {
                        const text = await response.text();
                        const ruleLines = text.split('\\n')
                            .filter(rule => rule && !rule.startsWith('!') && rule.trim())
                            .map(rule => rule.trim());
                        rules.push(...ruleLines);
                        showNotification(\`\${ruleName} 规则加载成功\`, 'success');
                    } else {
                        showNotification(\`\${ruleName} 规则加载失败: \${response.status}\`, 'error');
                    }
                } catch (error) {
                    showNotification(\`\${ruleName} 规则加载失败: \${error.message}\`, 'error');
                }
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
        showNotification(\`成功加载 \${adBlockRules.length} 条规则\`, 'success');
        
    } catch (error) {
        showNotification('加载规则失败: ' + error.message, 'error');
    }
}

function clearAllRules() {
    if (confirm('确定要清空所有规则吗？')) {
        adBlockRules = [];
        localStorage.setItem('adblock_rules', JSON.stringify(adBlockRules));
        updateRulesDisplay();
        showNotification('已清空所有规则', 'success');
    }
}

function saveCustomRules() {
    const customRules = document.getElementById('custom-rules').value;
    localStorage.setItem('adblock_custom_rules', customRules);
    showNotification('自定义规则已保存', 'success');
}

function importCustomRules() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                document.getElementById('custom-rules').value = content;
                saveCustomRules();
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function startElementSelection() {
    isSelectingAd = true;
    selectedElements.clear();
    document.getElementById('start-select-btn').style.display = 'none';
    document.getElementById('stop-select-btn').style.display = 'block';
    document.getElementById('confirm-select-btn').style.display = 'block';
    document.getElementById('selected-count').textContent = '0';
    
    // 添加选择模式样式
    document.body.style.cursor = 'crosshair';
    
    // 添加元素点击事件 - 修复工具栏点击问题
    document.addEventListener('click', handleElementSelection, true);
    document.addEventListener('mouseover', handleElementHover, true);
    document.addEventListener('mouseout', handleElementUnhover, true);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    showNotification('选择模式已激活，按住Ctrl键点击元素进行多选标记', 'info');
}

function stopElementSelection() {
    isSelectingAd = false;
    document.getElementById('start-select-btn').style.display = 'block';
    document.getElementById('stop-select-btn').style.display = 'none';
    document.getElementById('confirm-select-btn').style.display = 'none';
    
    // 恢复正常光标
    document.body.style.cursor = '';
    
    // 移除事件监听
    document.removeEventListener('click', handleElementSelection, true);
    document.removeEventListener('mouseover', handleElementHover, true);
    document.removeEventListener('mouseout', handleElementUnhover, true);
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    
    // 移除所有高亮
    document.querySelectorAll('.ad-element-highlight').forEach(el => {
        el.classList.remove('ad-element-highlight');
    });
    
    showNotification('选择模式已关闭', 'info');
}

function confirmElementSelection() {
    if (selectedElements.size === 0) {
        showNotification('请先选择要标记的元素', 'error');
        return;
    }
    
    const customRules = document.getElementById('custom-rules');
    let newRules = '';
    
    selectedElements.forEach(element => {
        const selector = generateCSSSelector(element);
        const rule = \`##\${selector}\\n\`;
        if (!customRules.value.includes(rule.trim())) {
            newRules += rule;
        }
    });
    
    if (newRules) {
        customRules.value += (customRules.value ? '\\n' : '') + newRules;
        saveCustomRules();
        showNotification(\`已添加 \${selectedElements.size} 条元素规则\`, 'success');
    }
    
    stopElementSelection();
}

let ctrlPressed = false;

function handleKeyDown(e) {
    if (e.key === 'Control') {
        ctrlPressed = true;
    }
}

function handleKeyUp(e) {
    if (e.key === 'Control') {
        ctrlPressed = false;
    }
}

function handleElementHover(event) {
    if (!isSelectingAd) return;
    
    // 跳过工具栏元素
    if (event.target.closest('#proxy-toolbar')) return;
    
    event.target.classList.add('ad-element-highlight');
    event.stopPropagation();
}

function handleElementUnhover(event) {
    if (!isSelectingAd) return;
    
    // 如果元素没有被选中，移除高亮
    if (!selectedElements.has(event.target)) {
        event.target.classList.remove('ad-element-highlight');
    }
    event.stopPropagation();
}

function handleElementSelection(event) {
    if (!isSelectingAd) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // 跳过工具栏元素
    if (event.target.closest('#proxy-toolbar')) {
        showNotification('不能标记工具栏元素', 'warning');
        return false;
    }
    
    const element = event.target;
    
    if (ctrlPressed) {
        // 多选模式
        if (selectedElements.has(element)) {
            selectedElements.delete(element);
            element.classList.remove('ad-element-highlight');
        } else {
            selectedElements.add(element);
            element.classList.add('ad-element-highlight');
        }
        document.getElementById('selected-count').textContent = selectedElements.size;
    } else {
        // 单选模式
        selectedElements.clear();
        document.querySelectorAll('.ad-element-highlight').forEach(el => {
            el.classList.remove('ad-element-highlight');
        });
        selectedElements.add(element);
        element.classList.add('ad-element-highlight');
        document.getElementById('selected-count').textContent = '1';
    }
    
    updateSelectedElementsList();
    
    return false;
}

function updateSelectedElementsList() {
    const container = document.getElementById('selected-elements');
    container.innerHTML = '';
    
    if (selectedElements.size === 0) {
        container.innerHTML = '<div style="text-align:center;color:#b0b0b0;padding:20px;">暂无选中元素</div>';
        return;
    }
    
    selectedElements.forEach(element => {
        const selector = generateCSSSelector(element);
        const item = document.createElement('div');
        item.className = 'resource-item';
        item.innerHTML = \`
            <div class="resource-url">\${selector}</div>
            <div class="resource-info">
                <span>元素选择器</span>
                <span>标签: \${element.tagName.toLowerCase()}</span>
                <button onclick="removeSelectedElement(this)" style="background:#ff4757;color:white;border:none;padding:2px 8px;border-radius:3px;font-size:10px;cursor:pointer;">移除</button>
            </div>
        \`;
        container.appendChild(item);
    });
}

function removeSelectedElement(button) {
    const item = button.closest('.resource-item');
    const selector = item.querySelector('.resource-url').textContent;
    
    // 从selectedElements中移除对应的元素
    for (let element of selectedElements) {
        if (generateCSSSelector(element) === selector) {
            selectedElements.delete(element);
            element.classList.remove('ad-element-highlight');
            break;
        }
    }
    
    document.getElementById('selected-count').textContent = selectedElements.size;
    updateSelectedElementsList();
}

function generateCSSSelector(element) {
    if (element.id) {
        return \`#\${element.id}\`;
    }
    
    let selector = element.tagName.toLowerCase();
    if (element.className && typeof element.className === 'string') {
        selector += '.' + element.className.split(' ').join('.');
    }
    
    return selector;
}

function updateSubscriptionRules() {
    loadDefaultRules();
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
    showNotification('订阅设置已保存', 'success');
}

function addCustomSubscription() {
    const url = document.getElementById('custom-subscription').value.trim();
    if (!url) {
        showNotification('请输入订阅URL', 'error');
        return;
    }
    
    // 这里可以添加自定义订阅的逻辑
    showNotification('自定义订阅功能开发中', 'info');
}

function applyAdBlockSettings() {
    adBlockEnabled = document.getElementById('adblock-enabled').checked;
    localStorage.setItem('${adBlockEnabledName}', adBlockEnabled.toString());
    
    if (adBlockEnabled) {
        startAdBlocking();
        showNotification('广告拦截已启用', 'success');
    } else {
        stopAdBlocking();
        showNotification('广告拦截已禁用', 'info');
    }
    
    setTimeout(() => {
        closeAllModals();
    }, 1000);
}

function checkAdBlockStatus() {
    const enabled = localStorage.getItem('${adBlockEnabledName}') === 'true';
    const rulesCount = adBlockRules.length;
    
    if (enabled && rulesCount > 0) {
        showNotification(\`✓ 广告拦截运行正常，已加载 \${rulesCount} 条规则\`, 'success');
    } else if (enabled) {
        showNotification('⚠ 广告拦截已启用但未加载规则', 'warning');
    } else {
        showNotification('✗ 广告拦截未启用', 'error');
    }
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
            const domain = rule.substring(2).replace(/[\\^|$]/g, '');
            return urlStr.includes(domain);
        } else if (rule.startsWith('@@')) {
            // 白名单规则，不拦截
            return false;
        } else {
            return urlStr.includes(rule.toLowerCase());
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
    
    // 显示被隐藏的元素
    document.querySelectorAll('*').forEach(el => {
        if (el.style.display === 'none') {
            el.style.display = '';
        }
    });
}
`;

// =======================================================================================
// 第七部分：增强版资源嗅探系统
// 功能：完整的资源请求监控和修改系统，支持请求拦截和重发
// =======================================================================================

const resourceSnifferSystem = `
// 资源嗅探系统
let resourceSnifferEnabled = false;
let capturedResources = [];
let requestModifiers = [];
let isSnifferActive = false;

function showResourceSnifferModal() {
    const modalHTML = \`
    <div class="proxy-modal" id="sniffer-modal">
        <div class="proxy-modal-content" style="max-width:1200px;width:95%;">
            <div class="modal-header">
                <h3 class="modal-title">🔍 资源嗅探 - 网络抓包工具</h3>
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
                <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">
                    状态: <span id="sniffer-status-text">\${isSnifferActive ? '运行中' : '已停止'}</span>
                    <span id="capture-count" style="margin-left:15px;">捕获: 0 个请求</span>
                </div>
            </div>
            
            <div class="tab-container">
                <div class="tab-buttons">
                    <button class="tab-btn active" onclick="switchSnifferTab('captured')">捕获记录</button>
                    <button class="tab-btn" onclick="switchSnifferTab('modifiers')">请求修改</button>
                    <button class="tab-btn" onclick="switchSnifferTab('filters')">拦截设置</button>
                    <button class="tab-btn" onclick="switchSnifferTab('tools')">工具</button>
                </div>
                
                <div id="captured-tab" class="tab-content active">
                    <div class="form-group">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                            <label class="form-label">捕获的资源请求</label>
                            <div style="display:flex;gap:8px;">
                                <button class="btn btn-secondary" onclick="clearCapturedResources()" style="padding:6px 12px;font-size:12px;">清空记录</button>
                                <button class="btn btn-secondary" onclick="exportResources()" style="padding:6px 12px;font-size:12px;">导出数据</button>
                                <button class="btn btn-primary" onclick="startSniffing()" style="padding:6px 12px;font-size:12px;" id="start-sniffing-btn">开始嗅探</button>
                                <button class="btn btn-secondary" onclick="stopSniffing()" style="padding:6px 12px;font-size:12px;display:none;" id="stop-sniffing-btn">停止嗅探</button>
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
                        <label class="form-label">自动开启设置</label>
                        <label style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                            <input type="checkbox" id="auto-start-sniffing">
                            <span style="color:#e0e0e0;">页面加载时自动开启嗅探</span>
                        </label>
                        <label style="display:flex;align-items:center;gap:8px;">
                            <input type="checkbox" id="remember-sniffing-state">
                            <span style="color:#e0e0e0;">记住嗅探状态</span>
                        </label>
                    </div>
                </div>
                
                <div id="tools-tab" class="tab-content">
                    <div class="form-group">
                        <h4 style="color:#e0e0e0;margin-bottom:15px;">抓包工具功能</h4>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                            <div>
                                <button class="btn btn-primary" onclick="testSnifferFunction()" style="width:100%;margin-bottom:10px;">测试功能</button>
                                <div style="font-size:12px;color:#b0b0b0;">测试资源嗅探功能是否正常工作</div>
                            </div>
                            <div>
                                <button class="btn btn-secondary" onclick="importHarFile()" style="width:100%;margin-bottom:10px;">导入HAR文件</button>
                                <div style="font-size:12px;color:#b0b0b0;">导入外部抓包数据</div>
                            </div>
                        </div>
                        
                        <div style="margin-top:20px;">
                            <h4 style="color:#e0e0e0;margin-bottom:10px;">快速操作</h4>
                            <div style="display:flex;gap:10px;flex-wrap:wrap;">
                                <button class="btn btn-secondary" onclick="blockAllImages()" style="padding:8px 12px;font-size:12px;">拦截所有图片</button>
                                <button class="btn btn-secondary" onclick="blockAllScripts()" style="padding:8px 12px;font-size:12px;">拦截所有脚本</button>
                                <button class="btn btn-secondary" onclick="enableAllFilters()" style="padding:8px 12px;font-size:12px;">启用所有过滤器</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="btn-group">
                <button class="btn btn-secondary" onclick="closeAllModals()">取消</button>
                <button class="btn btn-primary" onclick="applySnifferSettings()">保存设置</button>
                <button class="btn btn-secondary" onclick="checkSnifferStatus()">检查状态</button>
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
        updateCaptureCount();
        
        // 根据当前状态更新按钮
        if (isSnifferActive) {
            document.getElementById('start-sniffing-btn').style.display = 'none';
            document.getElementById('stop-sniffing-btn').style.display = 'block';
        }
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
        
        // 加载自动开启设置
        document.getElementById('auto-start-sniffing').checked = localStorage.getItem('sniffer_auto_start') === 'true';
        document.getElementById('remember-sniffing-state').checked = localStorage.getItem('sniffer_remember_state') === 'true';
        
        // 加载捕获的资源
        capturedResources = JSON.parse(localStorage.getItem('sniffer_captured') || '[]');
        
        // 加载修改器规则
        requestModifiers = JSON.parse(localStorage.getItem('sniffer_modifiers') || '[]');
        
        // 加载运行状态
        isSnifferActive = localStorage.getItem('sniffer_active') === 'true';
        
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
        
        // 根据状态设置颜色
        let statusColor = '#b0b0b0';
        if (typeof status === 'number') {
            if (status >= 200 && status < 300) statusColor = '#4caf50';
            else if (status >= 300 && status < 400) statusColor = '#ff9800';
            else if (status >= 400) statusColor = '#f44336';
        } else if (status === 'Error') {
            statusColor = '#f44336';
        }
        
        html += \`
        <div class="resource-item">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:5px;">
                <div style="flex:1;">
                    <div class="resource-url" title="\${resource.url}">\${method} \${resource.url}</div>
                    <div class="resource-info">
                        <span style="color:\${statusColor}">状态: \${status}</span>
                        <span>类型: \${type}</span>
                        <span>时间: \${time}</span>
                        <span>大小: \${formatBytes(resource.size)}</span>
                    </div>
                </div>
                <div style="display:flex;gap:5px;flex-direction:column;">
                    <button onclick="inspectResource(\${actualIndex})" style="background:#4fc3f7;color:white;border:none;padding:3px 8px;border-radius:3px;font-size:10px;cursor:pointer;">详情</button>
                    <button onclick="resendRequest(\${actualIndex})" style="background:#4caf50;color:white;border:none;padding:3px 8px;border-radius:3px;font-size:10px;cursor:pointer;">重发</button>
                    <button onclick="createModifierFromResource(\${actualIndex})" style="background:#ff9800;color:white;border:none;padding:3px 8px;border-radius:3px;font-size:10px;cursor:pointer;">拦截</button>
                </div>
            </div>
        </div>
        \`;
    });
    
    container.innerHTML = html;
}

function updateCaptureCount() {
    document.getElementById('capture-count').textContent = \`捕获: \${capturedResources.length} 个请求\`;
    document.getElementById('sniffer-status-text').textContent = isSnifferActive ? '运行中' : '已停止';
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
                        <span>状态: \${modifier.enabled ? '启用' : '禁用'}</span>
                    </div>
                </div>
                <div style="display:flex;gap:5px;">
                    <button onclick="toggleModifier(\${index})" style="background:\${modifier.enabled ? '#4caf50' : '#ff9800'};color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;">\${modifier.enabled ? '禁用' : '启用'}</button>
                    <button onclick="editModifier(\${index})" style="background:#4fc3f7;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;">编辑</button>
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
        target: 'url', // url, header, cookie, body
        value: '',
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
        <div class="proxy-modal-content" style="max-width:600px;">
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
                    <option value="redirect" \${modifier.action === 'redirect' ? 'selected' : ''}>重定向到</option>
                    <option value="modify" \${modifier.action === 'modify' ? 'selected' : ''}>修改内容</option>
                    <option value="header" \${modifier.action === 'header' ? 'selected' : ''}>修改请求头</option>
                </select>
            </div>
            
            <div class="form-group" id="modify-target-group" \${modifier.action !== 'modify' && modifier.action !== 'header' ? 'style="display:none;"' : ''}>
                <label class="form-label">修改目标</label>
                <select id="modifier-target" class="form-select">
                    <option value="url" \${modifier.target === 'url' ? 'selected' : ''}>URL</option>
                    <option value="header" \${modifier.target === 'header' ? 'selected' : ''}>请求头</option>
                    <option value="cookie" \${modifier.target === 'cookie' ? 'selected' : ''}>Cookie</option>
                    <option value="body" \${modifier.target === 'body' ? 'selected' : ''}>请求体</option>
                </select>
            </div>
            
            <div class="form-group" id="modifier-value-group" \${!modifier.value && modifier.action !== 'redirect' && modifier.action !== 'modify' && modifier.action !== 'header' ? 'style="display:none;"' : ''}>
                <label class="form-label" id="modifier-value-label">
                    \${getModifierValueLabel(modifier.action, modifier.target)}
                </label>
                <textarea id="modifier-value" class="form-textarea" placeholder="\${getModifierValuePlaceholder(modifier.action, modifier.target)}" style="height:100px;">\${modifier.value || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label style="display:flex;align-items:center;gap:8px;">
                    <input type="checkbox" id="modifier-enabled" \${modifier.enabled ? 'checked' : ''}>
                    <span style="color:#e0e0e0;font-size:14px;">启用此规则</span>
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
    
    document.getElementById('modifier-target').addEventListener('change', function() {
        updateModifierEditorUI();
    });
    
    function updateModifierEditorUI() {
        const action = document.getElementById('modifier-action').value;
        const target = document.getElementById('modifier-target').value;
        const targetGroup = document.getElementById('modify-target-group');
        const valueGroup = document.getElementById('modifier-value-group');
        const valueLabel = document.getElementById('modifier-value-label');
        const valueInput = document.getElementById('modifier-value');
        
        if (action === 'modify' || action === 'header') {
            targetGroup.style.display = 'block';
            valueGroup.style.display = 'block';
            valueLabel.textContent = getModifierValueLabel(action, target);
            valueInput.placeholder = getModifierValuePlaceholder(action, target);
        } else if (action === 'redirect') {
            targetGroup.style.display = 'none';
            valueGroup.style.display = 'block';
            valueLabel.textContent = '重定向到URL';
            valueInput.placeholder = '输入重定向的目标URL';
        } else {
            targetGroup.style.display = 'none';
            valueGroup.style.display = 'none';
        }
    }
}

function getModifierValueLabel(action, target) {
    if (action === 'redirect') return '重定向到URL';
    if (action === 'header') return '请求头修改 (格式: HeaderName: HeaderValue)';
    if (target === 'header') return '请求头名称=值';
    if (target === 'cookie') return 'Cookie名称=值';
    if (target === 'body') return '请求体修改内容';
    return '修改值';
}

function getModifierValuePlaceholder(action, target) {
    if (action === 'redirect') return '例如: https://example.com/new-path';
    if (action === 'header') return '例如: User-Agent: Custom-Agent\\nReferer: https://example.com';
    if (target === 'header') return '例如: User-Agent=Custom-Agent';
    if (target === 'cookie') return '例如: sessionid=abc123';
    if (target === 'body') return '输入要修改的请求体内容';
    return '输入修改值';
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
    const enabled = document.getElementById('modifier-enabled').checked;
    
    if (!pattern) {
        showNotification('请输入URL模式', 'error');
        return;
    }
    
    requestModifiers[index] = {
        pattern,
        action,
        target,
        value,
        enabled
    };
    
    localStorage.setItem('sniffer_modifiers', JSON.stringify(requestModifiers));
    updateModifiersList();
    closeModifierEditor();
    showNotification('修改规则已保存', 'success');
}

function toggleModifier(index) {
    requestModifiers[index].enabled = !requestModifiers[index].enabled;
    localStorage.setItem('sniffer_modifiers', JSON.stringify(requestModifiers));
    updateModifiersList();
    showNotification(\`规则已\${requestModifiers[index].enabled ? '启用' : '禁用'}\`, 'success');
}

function removeModifier(index) {
    if (confirm('确定要删除此修改规则吗？')) {
        requestModifiers.splice(index, 1);
        localStorage.setItem('sniffer_modifiers', JSON.stringify(requestModifiers));
        updateModifiersList();
        showNotification('修改规则已删除', 'success');
    }
}

function inspectResource(index) {
    const resource = capturedResources[index];
    
    const detailHTML = \`
    <div class="proxy-modal" id="resource-detail">
        <div class="proxy-modal-content" style="max-width:1000px;">
            <div class="modal-header">
                <h3 class="modal-title">资源详情 - 请求分析</h3>
                <button class="close-modal" onclick="closeResourceDetail()">×</button>
            </div>
            
            <div class="tab-container">
                <div class="tab-buttons">
                    <button class="tab-btn active" onclick="switchResourceTab('overview')">概览</button>
                    <button class="tab-btn" onclick="switchResourceTab('request')">请求</button>
                    <button class="tab-btn" onclick="switchResourceTab('response')">响应</button>
                    <button class="tab-btn" onclick="switchResourceTab('raw')">原始数据</button>
                </div>
                
                <div id="overview-tab" class="tab-content active">
                    <div class="form-group">
                        <label class="form-label">基本信息</label>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px;">
                            <div>
                                <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:6px;">
                                    <div style="font-size:11px;color:#b0b0b0;">URL</div>
                                    <div style="font-size:13px;color:#e0e0e0;word-break:break-all;">\${resource.url}</div>
                                </div>
                            </div>
                            <div>
                                <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:6px;">
                                    <div style="font-size:11px;color:#b0b0b0;">方法</div>
                                    <div style="font-size:13px;color:#e0e0e0;">\${resource.method || 'GET'}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-bottom:15px;">
                            <div>
                                <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:6px;">
                                    <div style="font-size:11px;color:#b0b0b0;">状态</div>
                                    <div style="font-size:13px;color:#e0e0e0;">\${resource.status || 'Pending'}</div>
                                </div>
                            </div>
                            <div>
                                <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:6px;">
                                    <div style="font-size:11px;color:#b0b0b0;">类型</div>
                                    <div style="font-size:13px;color:#e0e0e0;">\${resource.type || 'unknown'}</div>
                                </div>
                            </div>
                            <div>
                                <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:6px;">
                                    <div style="font-size:11px;color:#b0b0b0;">大小</div>
                                    <div style="font-size:13px;color:#e0e0e0;">\${formatBytes(resource.size)}</div>
                                </div>
                            </div>
                            <div>
                                <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:6px;">
                                    <div style="font-size:11px;color:#b0b0b0;">时间</div>
                                    <div style="font-size:13px;color:#e0e0e0;">\${new Date(resource.timestamp).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="request-tab" class="tab-content">
                    \${resource.headers ? \`
                    <div class="form-group">
                        <label class="form-label">请求头</label>
                        <textarea class="form-textarea" style="height:200px;font-size:12px;font-family:monospace;" readonly>\${JSON.stringify(resource.headers, null, 2)}</textarea>
                    </div>
                    \` : '<div style="text-align:center;color:#b0b0b0;padding:20px;">无请求头信息</div>'}
                    
                    \${resource.body ? \`
                    <div class="form-group">
                        <label class="form-label">请求体</label>
                        <textarea class="form-textarea" style="height:200px;font-size:12px;font-family:monospace;" readonly>\${resource.body}</textarea>
                    </div>
                    \` : ''}
                </div>
                
                <div id="response-tab" class="tab-content">
                    \${resource.responseHeaders ? \`
                    <div class="form-group">
                        <label class="form-label">响应头</label>
                        <textarea class="form-textarea" style="height:200px;font-size:12px;font-family:monospace;" readonly>\${JSON.stringify(resource.responseHeaders, null, 2)}</textarea>
                    </div>
                    \` : '<div style="text-align:center;color:#b0b0b0;padding:20px;">无响应头信息</div>'}
                    
                    \${resource.responseBody ? \`
                    <div class="form-group">
                        <label class="form-label">响应体</label>
                        <textarea class="form-textarea" style="height:200px;font-size:12px;font-family:monospace;" readonly>\${resource.responseBody}</textarea>
                    </div>
                    \` : ''}
                </div>
                
                <div id="raw-tab" class="tab-content">
                    <div class="form-group">
                        <label class="form-label">原始数据</label>
                        <textarea class="form-textarea" style="height:300px;font-size:12px;font-family:monospace;" readonly>\${JSON.stringify(resource, null, 2)}</textarea>
                    </div>
                </div>
            </div>
            
            <div class="btn-group">
                <button class="btn btn-secondary" onclick="closeResourceDetail()">关闭</button>
                <button class="btn btn-primary" onclick="resendRequest(\${index})">重发请求</button>
                <button class="btn btn-secondary" onclick="copyResourceData(\${index})">复制数据</button>
                <button class="btn btn-secondary" onclick="createModifierFromResource(\${index})">创建拦截规则</button>
            </div>
        </div>
    </div>
    \`;
    
    document.body.insertAdjacentHTML('beforeend', detailHTML);
}

function switchResourceTab(tabName) {
    const modal = document.getElementById('resource-detail');
    if (!modal) return;
    
    // 更新标签按钮
    modal.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 更新标签内容
    modal.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    modal.getElementById(tabName + '-tab').classList.add('active');
}

function closeResourceDetail() {
    const detail = document.getElementById('resource-detail');
    if (detail) detail.remove();
}

function copyResourceData(index) {
    const resource = capturedResources[index];
    const data = JSON.stringify(resource, null, 2);
    navigator.clipboard.writeText(data).then(() => {
        showNotification('资源数据已复制到剪贴板', 'success');
    });
}

async function resendRequest(index) {
    const resource = capturedResources[index];
    
    try {
        const options = {
            method: resource.method || 'GET',
            headers: resource.headers || {}
        };
        
        if (resource.body) {
            options.body = resource.body;
        }
        
        const response = await fetch(resource.url, options);
        const responseData = await response.text();
        
        // 更新资源记录
        resource.status = response.status;
        resource.size = responseData.length;
        resource.responseHeaders = Object.fromEntries(response.headers);
        resource.responseBody = responseData;
        resource.timestamp = Date.now();
        
        // 更新localStorage
        localStorage.setItem('sniffer_captured', JSON.stringify(capturedResources));
        
        showNotification('请求重发成功', 'success');
        
        // 刷新详情视图
        closeResourceDetail();
        inspectResource(index);
        
    } catch (error) {
        showNotification('请求重发失败: ' + error.message, 'error');
    }
}

function createModifierFromResource(index) {
    const resource = capturedResources[index];
    
    const modifier = {
        pattern: resource.url.replace(/https?:\\/\\/[^\\/]+/, '*://*'),
        action: 'block',
        target: 'url',
        value: '',
        enabled: true
    };
    
    requestModifiers.push(modifier);
    localStorage.setItem('sniffer_modifiers', JSON.stringify(requestModifiers));
    updateModifiersList();
    
    // 切换到修改规则标签页
    switchSnifferTab('modifiers');
    
    showNotification('已基于资源创建拦截规则', 'success');
}

function clearCapturedResources() {
    if (confirm('确定要清空所有捕获记录吗？')) {
        capturedResources = [];
        localStorage.setItem('sniffer_captured', JSON.stringify(capturedResources));
        updateResourcesList();
        updateCaptureCount();
        showNotification('已清空捕获记录', 'success');
    }
}

function exportResources() {
    const data = JSON.stringify(capturedResources, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`sniffer-resources-\${new Date().toISOString().slice(0, 10)}.json\`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('资源记录已导出', 'success');
}

function startSniffing() {
    isSnifferActive = true;
    document.getElementById('start-sniffing-btn').style.display = 'none';
    document.getElementById('stop-sniffing-btn').style.display = 'block';
    localStorage.setItem('sniffer_active', 'true');
    
    startResourceSniffing();
    showNotification('资源嗅探已启动', 'success');
    updateCaptureCount();
}

function stopSniffing() {
    isSnifferActive = false;
    document.getElementById('start-sniffing-btn').style.display = 'block';
    document.getElementById('stop-sniffing-btn').style.display = 'none';
    localStorage.setItem('sniffer_active', 'false');
    
    stopResourceSniffing();
    showNotification('资源嗅探已停止', 'info');
    updateCaptureCount();
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
    
    // 保存自动开启设置
    localStorage.setItem('sniffer_auto_start', document.getElementById('auto-start-sniffing').checked.toString());
    localStorage.setItem('sniffer_remember_state', document.getElementById('remember-sniffing-state').checked.toString());
    
    if (resourceSnifferEnabled) {
        if (!isSnifferActive && document.getElementById('auto-start-sniffing').checked) {
            startSniffing();
        }
        showNotification('资源嗅探设置已保存', 'success');
    } else {
        stopSniffing();
        showNotification('资源嗅探已禁用', 'info');
    }
    
    setTimeout(closeAllModals, 500);
}

function checkSnifferStatus() {
    const enabled = localStorage.getItem('${resourceSnifferName}') === 'true';
    const active = isSnifferActive;
    const rulesCount = requestModifiers.filter(m => m.enabled).length;
    const capturesCount = capturedResources.length;
    
    let message = \`资源嗅探: \${enabled ? '已启用' : '未启用'}\`;
    message += \` | 运行状态: \${active ? '运行中' : '已停止'}\`;
    message += \` | 捕获请求: \${capturesCount} 个\`;
    message += \` | 生效规则: \${rulesCount} 条\`;
    
    if (enabled && active) {
        showNotification(\`✓ \${message}\`, 'success');
    } else if (enabled) {
        showNotification(\`⚠ \${message}\`, 'warning');
    } else {
        showNotification(\`✗ \${message}\`, 'error');
    }
}

function testSnifferFunction() {
    // 创建一个测试请求来验证嗅探功能
    const testUrl = 'https://httpbin.org/get?test=sniffer';
    
    fetch(testUrl)
        .then(response => response.json())
        .then(data => {
            showNotification('资源嗅探功能测试成功', 'success');
        })
        .catch(error => {
            showNotification('资源嗅探功能测试失败: ' + error.message, 'error');
        });
}

function importHarFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.har,.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const harData = JSON.parse(e.target.result);
                    // 这里可以添加HAR文件解析逻辑
                    showNotification('HAR文件导入功能开发中', 'info');
                } catch (error) {
                    showNotification('HAR文件解析失败: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function blockAllImages() {
    const modifier = {
        pattern: '*://*/*.jpg*',
        action: 'block',
        target: 'url',
        value: '',
        enabled: true
    };
    
    requestModifiers.push(modifier);
    
    // 添加其他图片格式
    const extensions = ['jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
    extensions.forEach(ext => {
        requestModifiers.push({
            pattern: \`*://*/*.\${ext}*\`,
            action: 'block',
            target: 'url',
            value: '',
            enabled: true
        });
    });
    
    localStorage.setItem('sniffer_modifiers', JSON.stringify(requestModifiers));
    updateModifiersList();
    showNotification('已添加所有图片拦截规则', 'success');
}

function blockAllScripts() {
    const modifier = {
        pattern: '*://*/*.js*',
        action: 'block',
        target: 'url',
        value: '',
        enabled: true
    };
    
    requestModifiers.push(modifier);
    localStorage.setItem('sniffer_modifiers', JSON.stringify(requestModifiers));
    updateModifiersList();
    showNotification('已添加脚本拦截规则', 'success');
}

function enableAllFilters() {
    document.getElementById('filter-html').checked = true;
    document.getElementById('filter-css').checked = true;
    document.getElementById('filter-js').checked = true;
    document.getElementById('filter-image').checked = true;
    document.getElementById('filter-font').checked = true;
    document.getElementById('filter-media').checked = true;
    document.getElementById('filter-xhr').checked = true;
    document.getElementById('filter-websocket').checked = true;
    showNotification('已启用所有过滤器', 'success');
}

// 资源嗅探核心功能
function startResourceSniffing() {
    if (!resourceSnifferEnabled || !isSnifferActive) return;
    
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
        
        try {
            const response = await window.originalFetch.apply(this, args);
            
            // 捕获响应信息
            const clone = response.clone();
            const responseBody = await clone.text();
            
            resource.status = response.status;
            resource.size = responseBody.length;
            resource.responseHeaders = Object.fromEntries(response.headers);
            resource.responseBody = responseBody.length > 1000 ? responseBody.substring(0, 1000) + '...' : responseBody;
            
            updateResource(resource);
            
            return response;
        } catch (error) {
            resource.status = 'Error';
            resource.error = error.message;
            updateResource(resource);
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
        
        this.addEventListener('load', function() {
            resource.status = this.status;
            resource.size = this.response ? new Blob([this.response]).size : 0;
            resource.responseHeaders = this.getAllResponseHeaders();
            resource.responseBody = this.responseText && this.responseText.length > 1000 ? 
                this.responseText.substring(0, 1000) + '...' : this.responseText;
            
            updateResource(resource);
        });
        
        this.addEventListener('error', function() {
            resource.status = 'Error';
            updateResource(resource);
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
    
    // 给资源分配ID
    resource.id = Date.now() + Math.random().toString(36).substr(2, 9);
    capturedResources.push(resource);
    
    // 限制记录数量
    if (capturedResources.length > 1000) {
        capturedResources = capturedResources.slice(-500);
    }
    
    localStorage.setItem('sniffer_captured', JSON.stringify(capturedResources));
    
    // 更新UI
    if (document.getElementById('resources-list')) {
        updateResourcesList();
        updateCaptureCount();
    }
}

function updateResource(updatedResource) {
    const index = capturedResources.findIndex(r => r.id === updatedResource.id);
    if (index !== -1) {
        capturedResources[index] = { ...capturedResources[index], ...updatedResource };
        localStorage.setItem('sniffer_captured', JSON.stringify(capturedResources));
        
        if (document.getElementById('resources-list')) {
            updateResourcesList();
        }
    }
}

function shouldCaptureResource(resource) {
    // 获取过滤设置
    const filterSettings = JSON.parse(localStorage.getItem('sniffer_filters') || '{"html":true,"css":true,"js":true,"image":true,"xhr":true}');
    const urlFilter = localStorage.getItem('sniffer_url_filter') || '';
    
    // 检查URL过滤
    if (urlFilter && !resource.url.includes(urlFilter)) {
        return false;
    }
    
    // 检查类型过滤
    const url = resource.url.toLowerCase();
    
    if (url.endsWith('.html') || url.includes('.html?') || resource.type === 'document') {
        return filterSettings.html;
    } else if (url.endsWith('.css') || url.includes('.css?')) {
        return filterSettings.css;
    } else if (url.endsWith('.js') || url.includes('.js?') || url.includes('.mjs')) {
        return filterSettings.js;
    } else if (url.match(/\\.(jpg|jpeg|png|gif|webp|svg|ico|bmp)/i)) {
        return filterSettings.image;
    } else if (url.match(/\\.(woff|woff2|ttf|eot|otf)/i)) {
        return filterSettings.font;
    } else if (url.match(/\\.(mp4|webm|avi|mov|mp3|wav|ogg)/i)) {
        return filterSettings.media;
    } else if (resource.type === 'xhr' || resource.type === 'fetch') {
        return filterSettings.xhr;
    }
    
    return true;
}
`;

// =======================================================================================
// 第八部分：增强版设置系统
// 功能：包含所有高级设置选项，包括无图模式、请求修改等
// =======================================================================================

const settingsSystem = `
// 设置系统
function showSettingsModal() {
    const modalHTML = \`
    <div class="proxy-modal" id="settings-modal">
        <div class="proxy-modal-content" style="max-width:800px;">
            <div class="modal-header">
                <h3 class="modal-title">⚙️ 高级设置</h3>
                <button class="close-modal" onclick="closeAllModals()">×</button>
            </div>
            
            <div class="tab-container">
                <div class="tab-buttons">
                    <button class="tab-btn active" onclick="switchSettingsTab('general')">常规设置</button>
                    <button class="tab-btn" onclick="switchSettingsTab('image')">无图模式</button>
                    <button class="tab-btn" onclick="switchSettingsTab('request')">请求修改</button>
                    <button class="tab-btn" onclick="switchSettingsTab('debug')">调试工具</button>
                </div>
                
                <div id="general-tab" class="tab-content active">
                    <div class="form-group">
                        <label class="form-label">用户代理 (User Agent)</label>
                        <select id="user-agent-select" class="form-select">
                            <option value="">默认浏览器UA</option>
                            <option value="chrome">Chrome (Windows)</option>
                            <option value="chrome-mac">Chrome (Mac)</option>
                            <option value="firefox">Firefox</option>
                            <option value="safari">Safari</option>
                            <option value="edge">Edge</option>
                            <option value="mobile">手机浏览器</option>
                            <option value="custom">自定义</option>
                        </select>
                        <textarea id="custom-user-agent" class="form-textarea" placeholder="输入自定义User Agent" style="height:60px;margin-top:10px;display:none;"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">语言设置</label>
                        <select id="language-select" class="form-select">
                            <option value="">自动检测</option>
                            <option value="zh-CN">中文 (简体)</option>
                            <option value="zh-TW">中文 (繁体)</option>
                            <option value="en-US">English (US)</option>
                            <option value="en-GB">English (UK)</option>
                            <option value="ja-JP">日本語</option>
                            <option value="ko-KR">한국어</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label style="display:flex;align-items:center;gap:8px;">
                            <input type="checkbox" id="enable-hint" checked>
                            <span style="color:#e0e0e0;font-size:14px;">显示代理使用提示</span>
                        </label>
                    </div>
                </div>
                
                <div id="image-tab" class="tab-content">
                    <div class="form-group">
                        <label class="form-label">无图模式设置</label>
                        <select id="image-mode" class="form-select">
                            <option value="normal">正常模式 (加载所有图片)</option>
                            <option value="none">无图模式 (拦截所有图片和视频)</option>
                            <option value="webp">仅加载WebP格式</option>
                            <option value="lazy">懒加载模式</option>
                        </select>
                        <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">
                            选择"无图模式"将拦截所有图片和视频请求，提升页面加载速度
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label style="display:flex;align-items:center;gap:8px;">
                            <input type="checkbox" id="auto-apply-image-mode">
                            <span style="color:#e0e0e0;font-size:14px;">自动应用无图模式设置</span>
                        </label>
                    </div>
                    
                    <div class="btn-group">
                        <button class="btn btn-primary" onclick="applyImageModeNow()">立即应用</button>
                        <button class="btn btn-secondary" onclick="checkImageModeStatus()">检查状态</button>
                    </div>
                </div>
                
                <div id="request-tab" class="tab-content">
                    <div class="form-group">
                        <label class="form-label">请求头修改</label>
                        <textarea id="request-headers" class="form-textarea" placeholder="格式: HeaderName: HeaderValue
例如: 
User-Agent: Custom-Agent
Accept-Language: zh-CN,zh;q=0.9
Referer: https://example.com" style="height:150px;"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label style="display:flex;align-items:center;gap:8px;">
                            <input type="checkbox" id="enable-request-modification">
                            <span style="color:#e0e0e0;font-size:14px;">启用请求头修改</span>
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Cookie注入设置</label>
                        <textarea id="global-cookies" class="form-textarea" placeholder="全局Cookie注入 (对所有网站生效)
格式: name=value; domain=.example.com; path=/
多个Cookie用换行分隔" style="height:120px;"></textarea>
                    </div>
                </div>
                
                <div id="debug-tab" class="tab-content">
                    <div class="form-group">
                        <label class="form-label">功能状态检查</label>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:15px;">
                            <button class="btn btn-secondary" onclick="checkAllFunctions()" style="padding:10px;">检查所有功能</button>
                            <button class="btn btn-secondary" onclick="exportAllSettings()" style="padding:10px;">导出所有设置</button>
                        </div>
                        
                        <div id="debug-status" style="background:rgba(0,0,0,0.3);padding:15px;border-radius:8px;min-height:100px;font-size:12px;color:#e0e0e0;">
                            点击"检查所有功能"查看各功能状态...
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">CSS冲突检测</label>
                        <button class="btn btn-secondary" onclick="checkCssConflicts()" style="width:100%;margin-bottom:10px;">检测CSS冲突</button>
                        <div style="font-size:12px;color:#b0b0b0;">
                            检测并修复工具栏CSS与页面的冲突问题
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">代理连接测试</label>
                        <button class="btn btn-secondary" onclick="testProxyConnection()" style="width:100%;margin-bottom:10px;">测试代理连接</button>
                        <div id="proxy-test-result" style="font-size:12px;"></div>
                    </div>
                </div>
            </div>
            
            <div class="btn-group">
                <button class="btn btn-secondary" onclick="closeAllModals()">取消</button>
                <button class="btn btn-primary" onclick="saveAllSettings()">保存所有设置</button>
                <button class="btn btn-secondary" onclick="resetAllSettings()">恢复默认</button>
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
        
        loadAllSettings();
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

function loadAllSettings() {
    try {
        // 加载用户代理设置
        const userAgent = localStorage.getItem('${userAgentName}') || '';
        const customUA = localStorage.getItem('custom_user_agent') || '';
        
        if (customUA) {
            document.getElementById('user-agent-select').value = 'custom';
            document.getElementById('custom-user-agent').value = customUA;
            document.getElementById('custom-user-agent').style.display = 'block';
        } else if (userAgent) {
            document.getElementById('user-agent-select').value = userAgent;
        }
        
        // 加载语言设置
        const language = localStorage.getItem('${languageName}') || '';
        document.getElementById('language-select').value = language;
        
        // 加载提示设置
        const hintEnabled = localStorage.getItem('hint_enabled') !== 'false';
        document.getElementById('enable-hint').checked = hintEnabled;
        
        // 加载无图模式设置
        const imageMode = localStorage.getItem('${imageModeName}') || 'normal';
        document.getElementById('image-mode').value = imageMode;
        document.getElementById('auto-apply-image-mode').checked = localStorage.getItem('image_mode_auto') === 'true';
        
        // 加载请求修改设置
        const requestHeaders = localStorage.getItem('request_headers') || '';
        document.getElementById('request-headers').value = requestHeaders;
        document.getElementById('enable-request-modification').checked = localStorage.getItem('request_modification_enabled') === 'true';
        
        const globalCookies = localStorage.getItem('global_cookies') || '';
        document.getElementById('global-cookies').value = globalCookies;
        
        // 用户代理选择事件
        document.getElementById('user-agent-select').addEventListener('change', function() {
            if (this.value === 'custom') {
                document.getElementById('custom-user-agent').style.display = 'block';
            } else {
                document.getElementById('custom-user-agent').style.display = 'none';
            }
        });
        
    } catch (e) {
        console.error('加载设置失败:', e);
    }
}

function saveAllSettings() {
    try {
        // 保存用户代理设置
        const uaSelect = document.getElementById('user-agent-select').value;
        if (uaSelect === 'custom') {
            const customUA = document.getElementById('custom-user-agent').value.trim();
            localStorage.setItem('custom_user_agent', customUA);
            localStorage.setItem('${userAgentName}', 'custom');
        } else {
            localStorage.setItem('${userAgentName}', uaSelect);
            localStorage.removeItem('custom_user_agent');
        }
        
        // 保存语言设置
        const language = document.getElementById('language-select').value;
        localStorage.setItem('${languageName}', language);
        
        // 保存提示设置
        const hintEnabled = document.getElementById('enable-hint').checked;
        localStorage.setItem('hint_enabled', hintEnabled.toString());
        
        // 保存无图模式设置
        const imageMode = document.getElementById('image-mode').value;
        localStorage.setItem('${imageModeName}', imageMode);
        localStorage.setItem('image_mode_auto', document.getElementById('auto-apply-image-mode').checked.toString());
        
        // 保存请求修改设置
        localStorage.setItem('request_headers', document.getElementById('request-headers').value);
        localStorage.setItem('request_modification_enabled', document.getElementById('enable-request-modification').checked.toString());
        localStorage.setItem('global_cookies', document.getElementById('global-cookies').value);
        
        // 应用设置
        applyImageMode(imageMode);
        
        showNotification('所有设置已保存', 'success');
        
        setTimeout(() => {
            closeAllModals();
        }, 1000);
        
    } catch (e) {
        showNotification('保存设置失败: ' + e.message, 'error');
    }
}

function resetAllSettings() {
    if (confirm('确定要恢复所有默认设置吗？这将清除所有自定义设置。')) {
        // 清除所有相关设置
        const keys = [
            '${userAgentName}', '${languageName}', '${imageModeName}', 
            '${adBlockEnabledName}', '${resourceSnifferName}', '${requestModifierName}',
            'custom_user_agent', 'hint_enabled', 'image_mode_auto',
            'request_headers', 'request_modification_enabled', 'global_cookies',
            'adblock_rules', 'adblock_custom_rules', 'adblock_rule_settings',
            'sniffer_captured', 'sniffer_modifiers', 'sniffer_filters',
            'sniffer_url_filter', 'sniffer_auto_start', 'sniffer_remember_state',
            '${cookieInjectionDataName}'
        ];
        
        keys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        showNotification('所有设置已恢复默认', 'success');
        
        // 重新加载设置
        setTimeout(() => {
            closeAllModals();
            location.reload();
        }, 1500);
    }
}

function applyImageMode(mode) {
    const images = document.querySelectorAll('img');
    const videos = document.querySelectorAll('video');
    const iframes = document.querySelectorAll('iframe');
    
    switch (mode) {
        case 'none':
            // 拦截所有图片和视频
            images.forEach(img => {
                img.style.display = 'none';
            });
            videos.forEach(video => {
                video.style.display = 'none';
            });
            // 尝试拦截iframe中的内容
            iframes.forEach(iframe => {
                if (iframe.src && iframe.src.match(/\\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|avi)/i)) {
                    iframe.style.display = 'none';
                }
            });
            break;
        case 'webp':
            // 只加载WebP格式
            images.forEach(img => {
                if (!img.src.toLowerCase().endsWith('.webp')) {
                    img.style.display = 'none';
                }
            });
            break;
        case 'lazy':
            // 懒加载模式
            images.forEach(img => {
                img.loading = 'lazy';
            });
            break;
        default:
            // 正常模式
            images.forEach(img => {
                img.style.display = '';
                img.loading = 'eager';
            });
            videos.forEach(video => {
                video.style.display = '';
            });
            iframes.forEach(iframe => {
                iframe.style.display = '';
            });
    }
}

function applyImageModeNow() {
    const mode = document.getElementById('image-mode').value;
    applyImageMode(mode);
    showNotification('无图模式设置已应用', 'success');
}

function checkImageModeStatus() {
    const mode = localStorage.getItem('${imageModeName}') || 'normal';
    const images = document.querySelectorAll('img');
    const hiddenImages = Array.from(images).filter(img => img.style.display === 'none').length;
    
    let message = \`当前模式: \${mode} | 总图片数: \${images.length}\`;
    if (mode === 'none') {
        message += \` | 已隐藏图片: \${hiddenImages}\`;
    }
    
    showNotification(\`✓ \${message}\`, 'success');
}

function checkAllFunctions() {
    const statusDiv = document.getElementById('debug-status');
    let statusHTML = '<div style="line-height:1.6;">';
    
    // 检查Cookie注入
    const cookieSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    const cookieCount = Object.keys(cookieSettings).length;
    statusHTML += \`<div>🍪 Cookie注入: \${cookieCount > 0 ? '<span style="color:#4caf50;">已配置 ' + cookieCount + ' 个网站</span>' : '<span style="color:#f44336;">未配置</span>'}</div>\`;
    
    // 检查广告拦截
    const adBlockEnabled = localStorage.getItem('${adBlockEnabledName}') === 'true';
    const adRules = JSON.parse(localStorage.getItem('adblock_rules') || '[]');
    statusHTML += \`<div>🚫 广告拦截: \${adBlockEnabled ? '<span style="color:#4caf50;">已启用 (' + adRules.length + ' 条规则)</span>' : '<span style="color:#f44336;">未启用</span>'}</div>\`;
    
    // 检查资源嗅探
    const snifferEnabled = localStorage.getItem('${resourceSnifferName}') === 'true';
    const captured = JSON.parse(localStorage.getItem('sniffer_captured') || '[]');
    statusHTML += \`<div>🔍 资源嗅探: \${snifferEnabled ? '<span style="color:#4caf50;">已启用 (' + captured.length + ' 条记录)</span>' : '<span style="color:#f44336;">未启用</span>'}</div>\`;
    
    // 检查无图模式
    const imageMode = localStorage.getItem('${imageModeName}') || 'normal';
    statusHTML += \`<div>🖼️ 无图模式: <span style="color:#4fc3f7;">\${imageMode}</span></div>\`;
    
    // 检查请求修改
    const requestModEnabled = localStorage.getItem('request_modification_enabled') === 'true';
    statusHTML += \`<div>📡 请求修改: \${requestModEnabled ? '<span style="color:#4caf50;">已启用</span>' : '<span style="color:#f44336;">未启用</span>'}</div>\`;
    
    // 检查用户代理
    const userAgent = localStorage.getItem('${userAgentName}') || '';
    statusHTML += \`<div>👤 用户代理: \${userAgent ? '<span style="color:#4fc3f7;">' + userAgent + '</span>' : '<span style="color:#b0b0b0;">默认</span>'}</div>\`;
    
    statusHTML += '</div>';
    statusDiv.innerHTML = statusHTML;
    
    showNotification('功能状态检查完成', 'success');
}

function exportAllSettings() {
    const allSettings = {};
    
    // 收集所有设置
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
            allSettings[key] = JSON.parse(localStorage.getItem(key));
        } catch {
            allSettings[key] = localStorage.getItem(key);
        }
    }
    
    const data = JSON.stringify(allSettings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`proxy-settings-\${new Date().toISOString().slice(0, 10)}.json\`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('所有设置已导出', 'success');
}

function checkCssConflicts() {
    // 检查工具栏元素是否受到页面CSS影响
    const toolbar = document.getElementById('proxy-toolbar');
    if (!toolbar) {
        showNotification('工具栏未找到', 'error');
        return;
    }
    
    const computedStyle = window.getComputedStyle(toolbar);
    const issues = [];
    
    // 检查常见CSS冲突
    if (computedStyle.position !== 'fixed') {
        issues.push('位置属性被覆盖');
    }
    
    if (computedStyle.zIndex < '2147483647') {
        issues.push('z-index值过低');
    }
    
    if (computedStyle.display === 'none') {
        issues.push('工具栏被隐藏');
    }
    
    if (computedStyle.pointerEvents !== 'auto') {
        issues.push('点击事件被阻止');
    }
    
    if (issues.length === 0) {
        showNotification('✓ 未检测到CSS冲突', 'success');
    } else {
        showNotification(\`⚠ 检测到CSS冲突: \${issues.join(', ')}\`, 'warning');
        
        // 尝试自动修复
        toolbar.style.cssText += '!important; position:fixed !important; z-index:2147483647 !important; display:flex !important; pointer-events:auto !important;';
        showNotification('已尝试自动修复CSS冲突', 'info');
    }
}

function testProxyConnection() {
    const resultDiv = document.getElementById('proxy-test-result');
    resultDiv.innerHTML = '<div style="color:#ff9800;">测试中...</div>';
    
    // 测试当前代理连接
    const testUrl = window.location.href;
    
    fetch(testUrl)
        .then(response => {
            if (response.ok) {
                resultDiv.innerHTML = '<div style="color:#4caf50;">✓ 代理连接正常</div>';
                showNotification('代理连接测试成功', 'success');
            } else {
                resultDiv.innerHTML = \`<div style="color:#f44336;">✗ 连接失败: \${response.status}</div>\`;
                showNotification(\`代理连接测试失败: \${response.status}\`, 'error');
            }
        })
        .catch(error => {
            resultDiv.innerHTML = \`<div style="color:#f44336;">✗ 连接错误: \${error.message}</div>\`;
            showNotification(\`代理连接测试错误: \${error.message}\`, 'error');
        });
}
`;

// =======================================================================================
// 第九部分：初始化系统
// 功能：页面加载完成后初始化所有系统
// =======================================================================================

const initSystem = `
// 初始化系统
function initAllSystems() {
    // 注入工具栏系统
    const toolbarScript = document.createElement('script');
    toolbarScript.textContent = \`
        \${toolbarSystem}
        \${cookieInjectionSystem}
        \${adBlockSystem}
        \${resourceSnifferSystem}
        \${settingsSystem}
        
        // 初始化
        setTimeout(() => {
            initToolbarSystem();
            loadAllSettings();
            
            // 检查是否需要自动启动功能
            if (localStorage.getItem('sniffer_auto_start') === 'true') {
                startSniffing();
            }
            
            // 应用无图模式
            const imageMode = localStorage.getItem('${imageModeName}') || 'normal';
            if (imageMode !== 'normal') {
                applyImageMode(imageMode);
            }
            
            // 启动广告拦截
            if (localStorage.getItem('${adBlockEnabledName}') === 'true') {
                startAdBlocking();
            }
            
        }, 100);
    \`;
    document.head.appendChild(toolbarScript);
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSystems);
} else {
    initAllSystems();
}
`;

// =======================================================================================
// 第十部分：主请求处理函数
// 功能：处理所有代理请求，包含所有增强功能
// =======================================================================================

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // 处理根路径
  if (path === str) {
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Web Proxy</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            background: #1a1a1a;
            color: #e0e0e0;
          }
          .container { 
            background: rgba(255,255,255,0.1); 
            padding: 30px; 
            border-radius: 10px; 
            margin-top: 50px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
          }
          h1 { 
            color: #4fc3f7; 
            text-align: center; 
          }
          .input-group { 
            margin: 20px 0; 
          }
          input[type="text"] { 
            width: 100%; 
            padding: 12px; 
            border: 1px solid rgba(255,255,255,0.3); 
            border-radius: 5px; 
            background: rgba(255,255,255,0.1);
            color: white;
            font-size: 16px;
            box-sizing: border-box;
          }
          button { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            border: none; 
            padding: 12px 30px; 
            border-radius: 25px; 
            cursor: pointer; 
            font-size: 16px;
            width: 100%;
            transition: all 0.3s ease;
          }
          button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          }
          .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 30px;
          }
          .feature {
            background: rgba(255,255,255,0.05);
            padding: 15px;
            border-radius: 8px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🌐 Web Proxy</h1>
          <div class="input-group">
            <input type="text" id="url" placeholder="输入要访问的网址 (例如: https://example.com)" autofocus>
          </div>
          <button onclick="navigate()">开始浏览</button>
          
          <div class="features">
            <div class="feature">🍪 Cookie注入</div>
            <div class="feature">🚫 广告拦截</div>
            <div class="feature">🔍 资源嗅探</div>
            <div class="feature">🖼️ 无图模式</div>
            <div class="feature">📡 请求修改</div>
            <div class="feature">⚙️ 高级设置</div>
          </div>
        </div>
        
        <script>
          function navigate() {
            let url = document.getElementById('url').value.trim();
            if (!url) return;
            
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
              url = 'https://' + url;
            }
            
            window.location.href = '${thisProxyServerUrlHttps}' + '${replaceUrlObj}' + url;
          }
          
          document.getElementById('url').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') navigate();
          });
        </script>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  // 处理代理请求
  const originalUrlMatch = path.match(new RegExp(`^/${replaceUrlObj}(.+)`));
  if (originalUrlMatch) {
    try {
      let originalUrl = originalUrlMatch[1];
      
      // 添加协议前缀（如果需要）
      if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
        originalUrl = 'https://' + originalUrl;
      }
      
      // 解析原始URL
      const originalUrlObj = new URL(originalUrl);
      
      // 获取修改后的请求头
      const modifiedHeaders = new Headers();
      
      // 复制原始请求头，排除某些头
      for (const [key, value] of request.headers) {
        if (!['host', 'origin', 'referer'].includes(key.toLowerCase())) {
          modifiedHeaders.set(key, value);
        }
      }
      
      // 应用用户代理设置
      const userAgentSetting = request.headers.get('Cookie')?.match(/__PROXY_USER_AGENT__=([^;]+)/)?.[1] || '';
      if (userAgentSetting) {
        const uaMap = {
          'chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'chrome-mac': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'firefox': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
          'safari': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
          'edge': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
          'mobile': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        };
        
        if (uaMap[userAgentSetting]) {
          modifiedHeaders.set('User-Agent', uaMap[userAgentSetting]);
        }
      }
      
      // 应用语言设置
      const languageSetting = request.headers.get('Cookie')?.match(/__PROXY_LANGUAGE__=([^;]+)/)?.[1] || '';
      if (languageSetting) {
        modifiedHeaders.set('Accept-Language', languageSetting);
      }
      
      // 设置必要的请求头
      modifiedHeaders.set('Host', originalUrlObj.host);
      modifiedHeaders.set('Origin', originalUrlObj.origin);
      modifiedHeaders.set('Referer', originalUrlObj.origin + '/');
      
      // 准备请求选项
      const fetchOptions = {
        method: request.method,
        headers: modifiedHeaders,
        redirect: 'manual'
      };
      
      // 处理请求体（如果是POST等有body的请求）
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const contentType = request.headers.get('Content-Type') || '';
        
        if (contentType.includes('multipart/form-data')) {
          // 处理文件上传
          const formData = await request.formData();
          const newFormData = new FormData();
          
          for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
              newFormData.append(key, value, value.name);
            } else {
              newFormData.append(key, value);
            }
          }
          
          fetchOptions.body = newFormData;
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          // 处理表单数据
          const text = await request.text();
          fetchOptions.body = text;
        } else {
          // 其他类型直接传递
          fetchOptions.body = request.body;
        }
      }
      
      // 发送请求
      const response = await fetch(originalUrl, fetchOptions);
      
      // 处理响应
      let responseBody = await response.text();
      const responseHeaders = new Headers(response.headers);
      
      // 移除可能引起问题的响应头
      responseHeaders.delete('Content-Security-Policy');
      responseHeaders.delete('X-Frame-Options');
      responseHeaders.delete('X-Content-Type-Options');
      
      // 设置CORS头
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', '*');
      
      // 修改HTML内容
      if (responseHeaders.get('Content-Type')?.includes('text/html')) {
        // 基本URL替换
        responseBody = responseBody.replace(
          /<head(.*?)>/i,
          `<head$1><base href="${originalUrlObj.origin}/">`
        );
        
        // URL替换逻辑
        const baseUrl = `${thisProxyServerUrlHttps}${replaceUrlObj}${originalUrlObj.origin}/`;
        const urlReplaceRegex = new RegExp(`(https?:)?//${originalUrlObj.host}`, 'g');
        responseBody = responseBody.replace(urlReplaceRegex, baseUrl);
        
        // 处理相对URL
        responseBody = responseBody.replace(
          /(href|src|action)=["'](\/(?!\/))/g,
          `$1="${baseUrl}$2`
        );
        
        // 注入代理提示脚本（如果用户没有禁用）
        const noHint = request.headers.get('Cookie')?.includes(`${noHintCookieName}=1`);
        if (!noHint) {
          responseBody = responseBody.replace(
            '</body>',
            `<script>${proxyHintInjection}</script></body>`
          );
        }
        
        // 注入工具栏和功能系统
        responseBody = responseBody.replace(
          '</body>',
          `<script>
            // 设置代理信息
            window.proxyBaseUrl = '${thisProxyServerUrlHttps}';
            window.proxyUrlObj = '${replaceUrlObj}';
            ${initSystem}
          </script></body>`
        );
        
        // 更新Content-Length
        responseHeaders.set('Content-Length', new TextEncoder().encode(responseBody).length.toString());
      }
      
      // 处理重定向
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('Location');
        if (location) {
          let redirectUrl = location;
          if (location.startsWith('/')) {
            redirectUrl = `${thisProxyServerUrlHttps}${replaceUrlObj}${originalUrlObj.origin}${location}`;
          } else if (location.startsWith('http')) {
            redirectUrl = `${thisProxyServerUrlHttps}${replaceUrlObj}${location}`;
          }
          responseHeaders.set('Location', redirectUrl);
        }
      }
      
      return new Response(responseBody, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
      
    } catch (error) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error - Web Proxy</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 600px; 
              margin: 100px auto; 
              padding: 20px; 
              background: #1a1a1a;
              color: #e0e0e0;
            }
            .error-container { 
              background: rgba(255,0,0,0.1); 
              padding: 30px; 
              border-radius: 10px; 
              border: 1px solid rgba(255,0,0,0.3);
              text-align: center;
            }
            h1 { color: #ff4757; }
            .back-btn {
              background: #4fc3f7;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1>🚫 代理错误</h1>
            <p><strong>错误信息:</strong> ${error.message}</p>
            <p>请检查URL是否正确，或稍后重试。</p>
            <button class="back-btn" onclick="window.location.href='${thisProxyServerUrlHttps}'">返回首页</button>
          </div>
        </body>
        </html>
      `, {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
  }

  // 处理其他路径
  return new Response('Not Found', { status: 404 });
}