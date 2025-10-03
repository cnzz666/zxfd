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
            e.stopPropagation();
            e.preventDefault();
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
        
        // 阻止事件冒泡
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
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

.proxy-tooltip {
    position: absolute;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 2147483647;
    pointer-events: none;
}

.check-status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    padding: 3px 8px;
    border-radius: 12px;
    margin-left: 8px;
}

.check-success {
    background: #4caf50;
    color: white;
}

.check-error {
    background: #f44336;
    color: white;
}

.check-loading {
    background: #ff9800;
    color: white;
}

.website-cookie-item {
    background: rgba(255,255,255,0.05);
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 8px;
    border-left: 3px solid #4caf50;
}

.website-cookie-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
}

.website-cookie-domain {
    font-weight: bold;
    color: #4fc3f7;
}

.website-cookie-actions {
    display: flex;
    gap: 5px;
}

.cookie-details {
    font-size: 11px;
    color: #b0b0b0;
    margin-top: 5px;
}

.cookie-pair {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;
}

.cookie-name {
    font-weight: 500;
    color: #e0e0e0;
}

.cookie-value {
    color: #b0b0b0;
    word-break: break-all;
    max-width: 60%;
}

.request-editor {
    background: rgba(0,0,0,0.3);
    border-radius: 8px;
    padding: 15px;
    margin: 10px 0;
}

.editor-section {
    margin-bottom: 15px;
}

.editor-section-title {
    font-weight: 500;
    margin-bottom: 8px;
    color: #4fc3f7;
}

.header-row, .param-row {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 8px;
    margin-bottom: 5px;
    align-items: center;
}

.header-input, .param-input {
    padding: 6px 8px;
    border-radius: 4px;
    border: 1px solid rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.1);
    color: white;
    font-size: 12px;
}

.remove-header, .remove-param {
    background: #ff4757;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 12px;
}

.add-header, .add-param {
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 12px;
    margin-top: 5px;
}

.replay-controls {
    display: flex;
    gap: 10px;
    margin-top: 15px;
}

.filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin: 10px 0;
}

.filter-tag {
    background: rgba(79,195,247,0.2);
    color: #4fc3f7;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 11px;
    cursor: pointer;
}

.filter-tag.active {
    background: #4fc3f7;
    color: white;
}

.bulk-actions {
    display: flex;
    gap: 10px;
    margin: 15px 0;
}

.bulk-action-btn {
    padding: 8px 15px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s ease;
}

.bulk-select {
    background: rgba(79,195,247,0.2);
    color: #4fc3f7;
}

.bulk-deselect {
    background: rgba(255,71,87,0.2);
    color: #ff4757;
}

.bulk-remove {
    background: rgba(255,71,87,0.3);
    color: #ff4757;
}

.element-selection-hint {
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255,193,7,0.9);
    color: #333;
    padding: 10px 20px;
    border-radius: 20px;
    z-index: 2147483646;
    font-weight: 500;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}
</style>
\`;

// 注入全局样式
document.head.insertAdjacentHTML('beforeend', toolbarStyles);
`;

// =======================================================================================
// 第五部分：增强的Cookie注入功能
// 功能：完整的Cookie注入系统，支持管理、网站Cookie记录和检查功能
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
                <h3 class="modal-title">🍪 Cookie注入与管理</h3>
                <button class="close-modal" onclick="closeAllModals()">×</button>
            </div>
            
            <div class="tab-container">
                <div class="tab-buttons">
                    <button class="tab-btn active" onclick="switchCookieTab('injection')">Cookie注入</button>
                    <button class="tab-btn" onclick="switchCookieTab('management')">Cookie管理</button>
                    <button class="tab-btn" onclick="switchCookieTab('website')">网站Cookie记录</button>
                    <button class="tab-btn" onclick="switchCookieTab('check')">检查功能</button>
                </div>
                
                <!-- Cookie注入标签页 -->
                <div id="injection-tab" class="tab-content active">
                    <div class="form-group">
                        <label class="form-label">目标网站</label>
                        <input type="text" id="target-website" class="form-input" value="\${getCurrentWebsite()}" readonly>
                        <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">自动获取当前代理网站地址</div>
                    </div>
                    
                    <div class="form-group">
                        <div class="tab-buttons" style="margin-bottom:15px;">
                            <button class="tab-btn active" onclick="switchCookieInjectionTab('combined')">合成Cookie</button>
                            <button class="tab-btn" onclick="switchCookieInjectionTab('separate')">分段输入</button>
                        </div>
                        
                        <div id="combined-cookie-tab" class="tab-content active">
                            <div class="form-group">
                                <label class="form-label">Cookie字符串</label>
                                <textarea id="combined-cookie" class="form-textarea" placeholder="例如: name=value; name2=value2; path=/; domain=.example.com"></textarea>
                                <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">输入完整的Cookie字符串，多个Cookie用分号分隔</div>
                            </div>
                        </div>
                        
                        <div id="separate-cookie-tab" class="tab-content">
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
                        <div id="saved-cookies-list" style="max-height:400px;overflow-y:auto;"></div>
                    </div>
                </div>
                
                <!-- 网站Cookie记录标签页 -->
                <div id="website-tab" class="tab-content">
                    <div class="form-group">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                            <label class="form-label">网站Cookie记录</label>
                            <div>
                                <button class="btn btn-secondary" onclick="refreshWebsiteCookies()" style="padding:6px 12px;font-size:12px;">刷新</button>
                                <button class="btn btn-secondary" onclick="clearWebsiteCookies()" style="padding:6px 12px;font-size:12px;">清空记录</button>
                            </div>
                        </div>
                        <div id="website-cookies-list" style="max-height:400px;overflow-y:auto;"></div>
                    </div>
                </div>
                
                <!-- 检查功能标签页 -->
                <div id="check-tab" class="tab-content">
                    <div class="form-group">
                        <label class="form-label">Cookie注入检查</label>
                        <div style="background:rgba(0,0,0,0.3);padding:15px;border-radius:8px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                                <span style="color:#e0e0e0;">当前网站Cookie状态</span>
                                <button class="btn btn-primary" onclick="checkCookieInjection()" style="padding:6px 12px;font-size:12px;">检查状态</button>
                            </div>
                            <div id="cookie-check-result"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">功能验证</label>
                        <div style="background:rgba(0,0,0,0.3);padding:15px;border-radius:8px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                                <span style="color:#e0e0e0;">Cookie功能测试</span>
                                <button class="btn btn-primary" onclick="testCookieFunction()" style="padding:6px 12px;font-size:12px;">测试功能</button>
                            </div>
                            <div id="cookie-test-result"></div>
                        </div>
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
        loadSavedCookiesList();
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

function switchCookieInjectionTab(tabName) {
    const container = document.querySelector('#injection-tab .tab-buttons');
    if (!container) return;
    
    // 更新标签按钮
    container.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 更新标签内容
    document.querySelectorAll('#injection-tab .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + '-cookie-tab').classList.add('active');
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
    const activeTab = document.querySelector('#injection-tab .tab-buttons .tab-btn.active').textContent;
    const autoRefresh = document.getElementById('auto-refresh').checked;
    
    let cookies = [];
    
    if (activeTab.includes('合成')) {
        const cookieStr = document.getElementById('combined-cookie').value.trim();
        if (cookieStr) {
            cookies = parseCombinedCookie(cookieStr);
        }
    } else {
        cookies = [...separateCookies];
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
        
        // 记录到网站Cookie记录
        recordWebsiteCookies(targetWebsite, cookies);
        
        showNotification('Cookie设置已保存并应用', 'success');
        
        if (autoRefresh) {
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            setTimeout(() => {
                closeAllModals();
                loadSavedCookiesList();
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
                switchCookieInjectionTab('combined');
                if (settings.cookies && settings.cookies.length > 0) {
                    const cookieStr = settings.cookies.map(c => \`\${c.name}=\${c.value}\`).join('; ');
                    document.getElementById('combined-cookie').value = cookieStr;
                }
            } else {
                switchCookieInjectionTab('separate');
                separateCookies = settings.cookies || [];
                updateCookieList();
            }
        }
    } catch (e) {
        console.log('加载Cookie设置失败:', e);
    }
}

function loadSavedCookiesList() {
    const container = document.getElementById('saved-cookies-list');
    if (!container) return;
    
    try {
        const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
        const websites = Object.keys(allSettings);
        
        if (websites.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:#b0b0b0;padding:40px;">暂无保存的Cookie配置</div>';
            return;
        }
        
        let html = '';
        websites.forEach(website => {
            const settings = allSettings[website];
            html += \`
            <div class="website-cookie-item">
                <div class="website-cookie-header">
                    <span class="website-cookie-domain">\${website}</span>
                    <div class="website-cookie-actions">
                        <button onclick="loadCookieForWebsite('\${website}')" style="background:#4caf50;color:white;border:none;padding:3px 8px;border-radius:3px;font-size:11px;cursor:pointer;">加载</button>
                        <button onclick="editCookieForWebsite('\${website}')" style="background:#2196f3;color:white;border:none;padding:3px 8px;border-radius:3px;font-size:11px;cursor:pointer;">编辑</button>
                        <button onclick="deleteCookieForWebsite('\${website}')" style="background:#ff4757;color:white;border:none;padding:3px 8px;border-radius:3px;font-size:11px;cursor:pointer;">删除</button>
                    </div>
                </div>
                <div class="cookie-details">
                    <div style="margin-bottom:5px;">保存时间: \${new Date(settings.timestamp).toLocaleString()}</div>
                    <div>Cookie数量: \${settings.cookies ? settings.cookies.length : 0}</div>
                    \${settings.cookies ? settings.cookies.map(cookie => \`
                        <div class="cookie-pair">
                            <span class="cookie-name">\${cookie.name}</span>
                            <span class="cookie-value">\${cookie.value}</span>
                        </div>
                    \`).join('') : ''}
                </div>
            </div>
            \`;
        });
        
        container.innerHTML = html;
    } catch (e) {
        console.error('加载保存的Cookie列表失败:', e);
        container.innerHTML = '<div style="text-align:center;color:#ff4757;padding:20px;">加载失败</div>';
    }
}

function loadCookieForWebsite(website) {
    try {
        const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
        const settings = allSettings[website];
        
        if (settings && settings.cookies) {
            applyCookiesImmediately(settings.cookies);
            showNotification(\`已加载 \${website} 的Cookie配置\`, 'success');
            
            // 更新当前网站的输入
            document.getElementById('target-website').value = website;
            if (settings.inputType === 'combined') {
                switchCookieInjectionTab('combined');
                const cookieStr = settings.cookies.map(c => \`\${c.name}=\${c.value}\`).join('; ');
                document.getElementById('combined-cookie').value = cookieStr;
            } else {
                switchCookieInjectionTab('separate');
                separateCookies = settings.cookies;
                updateCookieList();
            }
        }
    } catch (e) {
        showNotification('加载Cookie配置失败: ' + e.message, 'error');
    }
}

function editCookieForWebsite(website) {
    loadCookieForWebsite(website);
    switchCookieTab('injection');
}

function deleteCookieForWebsite(website) {
    if (confirm(\`确定要删除 \${website} 的Cookie配置吗？\`)) {
        try {
            const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
            delete allSettings[website];
            localStorage.setItem('${cookieInjectionDataName}', JSON.stringify(allSettings));
            loadSavedCookiesList();
            showNotification(\`已删除 \${website} 的Cookie配置\`, 'success');
        } catch (e) {
            showNotification('删除失败: ' + e.message, 'error');
        }
    }
}

function clearAllCookieSettings() {
    if (confirm('确定要清空所有Cookie配置吗？此操作不可恢复。')) {
        try {
            localStorage.removeItem('${cookieInjectionDataName}');
            loadSavedCookiesList();
            showNotification('已清空所有Cookie配置', 'success');
        } catch (e) {
            showNotification('清空失败: ' + e.message, 'error');
        }
    }
}

function loadWebsiteCookies() {
    const container = document.getElementById('website-cookies-list');
    if (!container) return;
    
    try {
        websiteCookies = JSON.parse(localStorage.getItem('${websiteCookiesName}') || '{}');
        const websites = Object.keys(websiteCookies);
        
        if (websites.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:#b0b0b0;padding:40px;">暂无网站Cookie记录</div>';
            return;
        }
        
        let html = '';
        websites.forEach(website => {
            const cookies = websiteCookies[website];
            html += \`
            <div class="website-cookie-item">
                <div class="website-cookie-header">
                    <span class="website-cookie-domain">\${website}</span>
                    <div class="website-cookie-actions">
                        <button onclick="applyWebsiteCookies('\${website}')" style="background:#4caf50;color:white;border:none;padding:3px 8px;border-radius:3px;font-size:11px;cursor:pointer;">应用</button>
                        <button onclick="deleteWebsiteCookies('\${website}')" style="background:#ff4757;color:white;border:none;padding:3px 8px;border-radius:3px;font-size:11px;cursor:pointer;">删除</button>
                    </div>
                </div>
                <div class="cookie-details">
                    <div style="margin-bottom:5px;">记录时间: \${new Date(cookies.timestamp).toLocaleString()}</div>
                    <div>Cookie数量: \${cookies.cookies ? cookies.cookies.length : 0}</div>
                    \${cookies.cookies ? cookies.cookies.map(cookie => \`
                        <div class="cookie-pair">
                            <span class="cookie-name">\${cookie.name}</span>
                            <span class="cookie-value">\${cookie.value}</span>
                        </div>
                    \`).join('') : ''}
                </div>
            </div>
            \`;
        });
        
        container.innerHTML = html;
    } catch (e) {
        console.error('加载网站Cookie记录失败:', e);
        container.innerHTML = '<div style="text-align:center;color:#ff4757;padding:20px;">加载失败</div>';
    }
}

function recordWebsiteCookies(website, cookies) {
    try {
        websiteCookies = JSON.parse(localStorage.getItem('${websiteCookiesName}') || '{}');
        websiteCookies[website] = {
            cookies: cookies,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('${websiteCookiesName}', JSON.stringify(websiteCookies));
    } catch (e) {
        console.error('记录网站Cookie失败:', e);
    }
}

function applyWebsiteCookies(website) {
    try {
        const cookies = websiteCookies[website];
        if (cookies && cookies.cookies) {
            applyCookiesImmediately(cookies.cookies);
            showNotification(\`已应用 \${website} 的Cookie记录\`, 'success');
        }
    } catch (e) {
        showNotification('应用Cookie记录失败: ' + e.message, 'error');
    }
}

function deleteWebsiteCookies(website) {
    if (confirm(\`确定要删除 \${website} 的Cookie记录吗？\`)) {
        try {
            delete websiteCookies[website];
            localStorage.setItem('${websiteCookiesName}', JSON.stringify(websiteCookies));
            loadWebsiteCookies();
            showNotification(\`已删除 \${website} 的Cookie记录\`, 'success');
        } catch (e) {
            showNotification('删除失败: ' + e.message, 'error');
        }
    }
}

function clearWebsiteCookies() {
    if (confirm('确定要清空所有网站Cookie记录吗？此操作不可恢复。')) {
        try {
            localStorage.removeItem('${websiteCookiesName}');
            websiteCookies = {};
            loadWebsiteCookies();
            showNotification('已清空所有网站Cookie记录', 'success');
        } catch (e) {
            showNotification('清空失败: ' + e.message, 'error');
        }
    }
}

function refreshWebsiteCookies() {
    // 从当前页面获取Cookie并记录
    const currentWebsite = getCurrentWebsite();
    const currentCookies = document.cookie.split(';').map(cookie => {
        const [name, value] = cookie.trim().split('=');
        return { name, value: value || '' };
    }).filter(cookie => cookie.name);
    
    if (currentCookies.length > 0) {
        recordWebsiteCookies(currentWebsite, currentCookies);
        loadWebsiteCookies();
        showNotification('已刷新当前网站Cookie记录', 'success');
    } else {
        showNotification('当前网站没有Cookie', 'info');
    }
}

function checkCookieInjection() {
    const resultContainer = document.getElementById('cookie-check-result');
    resultContainer.innerHTML = '<div class="check-status check-loading">🔍 检查中...</div>';
    
    setTimeout(() => {
        const targetWebsite = getCurrentWebsite();
        const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
        const settings = allSettings[targetWebsite];
        
        if (!settings) {
            resultContainer.innerHTML = '<div class="check-status check-error">❌ 未找到该网站的Cookie配置</div>';
            return;
        }
        
        // 检查Cookie是否实际应用
        const expectedCookies = settings.cookies || [];
        const appliedCookies = document.cookie.split(';').map(c => c.trim());
        let missingCookies = [];
        
        expectedCookies.forEach(expected => {
            const found = appliedCookies.some(applied => applied.startsWith(expected.name + '='));
            if (!found) {
                missingCookies.push(expected.name);
            }
        });
        
        if (missingCookies.length === 0) {
            resultContainer.innerHTML = \`
                <div class="check-status check-success">✅ Cookie注入成功</div>
                <div style="margin-top:10px;font-size:12px;color:#b0b0b0;">
                    已成功注入 \${expectedCookies.length} 个Cookie
                </div>
            \`;
        } else {
            resultContainer.innerHTML = \`
                <div class="check-status check-error">❌ Cookie注入不完整</div>
                <div style="margin-top:10px;font-size:12px;color:#ff4757;">
                    缺失Cookie: \${missingCookies.join(', ')}
                </div>
            \`;
        }
    }, 1000);
}

function testCookieFunction() {
    const resultContainer = document.getElementById('cookie-test-result');
    resultContainer.innerHTML = '<div class="check-status check-loading">🧪 测试中...</div>';
    
    setTimeout(() => {
        // 创建一个测试Cookie
        const testName = 'proxy_test_cookie';
        const testValue = 'test_value_' + Date.now();
        
        document.cookie = \`\${testName}=\${testValue}; path=/\`;
        
        // 检查是否设置成功
        const cookies = document.cookie.split(';').map(c => c.trim());
        const found = cookies.some(cookie => cookie.startsWith(testName + '='));
        
        if (found) {
            // 清理测试Cookie
            document.cookie = \`\${testName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/\`;
            resultContainer.innerHTML = '<div class="check-status check-success">✅ Cookie功能正常</div>';
        } else {
            resultContainer.innerHTML = '<div class="check-status check-error">❌ Cookie功能异常</div>';
        }
    }, 1000);
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
// 第六部分：增强的广告拦截系统
// 功能：完整的广告拦截和元素标记系统，支持规则订阅和智能元素标记
// =======================================================================================

const adBlockSystem = `
// 广告拦截系统
let adBlockEnabled = false;
let adBlockRules = [];
let isSelectingAd = false;
let selectedAdElements = new Set();

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
                    <button class="tab-btn" onclick="switchAdBlockTab('check')">检查功能</button>
                </div>
                
                <div id="rules-tab" class="tab-content active">
                    <div class="form-group">
                        <label class="form-label">规则订阅</label>
                        <div style="display:grid;gap:10px;">
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
                    </div>
                    
                    <div class="btn-group">
                        <button class="btn btn-secondary" onclick="updateAdBlockRules()">更新规则</button>
                        <button class="btn btn-primary" onclick="loadDefaultRules()">加载默认规则</button>
                        <button class="btn btn-secondary" onclick="checkAdBlockStatus()">检查状态</button>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">已加载规则数量: <span id="rules-count">0</span></label>
                        <div id="rules-list" style="max-height:200px;overflow-y:auto;background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;margin-top:10px;font-size:12px;"></div>
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
                        <button class="btn btn-secondary" onclick="testCustomRules()">测试规则</button>
                    </div>
                </div>
                
                <div id="element-tab" class="tab-content">
                    <div class="form-group">
                        <p style="color:#e0e0e0;margin-bottom:15px;">点击"开始标记"后，点击页面上的广告元素进行标记拦截</p>
                        
                        <div class="bulk-actions">
                            <button class="bulk-action-btn bulk-select" onclick="selectAllAdElements()">全选</button>
                            <button class="bulk-action-btn bulk-deselect" onclick="deselectAllAdElements()">取消全选</button>
                            <button class="bulk-action-btn bulk-remove" onclick="removeSelectedAdElements()">删除选中</button>
                        </div>
                        
                        <div class="btn-group">
                            <button class="btn btn-primary" id="start-select-btn" onclick="startElementSelection()">开始标记</button>
                            <button class="btn btn-secondary" id="stop-select-btn" onclick="stopElementSelection()" style="display:none;">停止标记</button>
                        </div>
                        
                        <div id="selected-elements" style="margin-top:20px;max-height:300px;overflow-y:auto;"></div>
                    </div>
                </div>
                
                <div id="check-tab" class="tab-content">
                    <div class="form-group">
                        <label class="form-label">广告拦截状态检查</label>
                        <div style="background:rgba(0,0,0,0.3);padding:15px;border-radius:8px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                                <span style="color:#e0e0e0;">拦截功能状态</span>
                                <button class="btn btn-primary" onclick="checkAdBlockStatus()" style="padding:6px 12px;font-size:12px;">检查状态</button>
                            </div>
                            <div id="adblock-check-result"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">规则有效性测试</label>
                        <div style="background:rgba(0,0,0,0.3);padding:15px;border-radius:8px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                                <span style="color:#e0e0e0;">测试广告拦截</span>
                                <button class="btn btn-primary" onclick="testAdBlockFunction()" style="padding:6px 12px;font-size:12px;">运行测试</button>
                            </div>
                            <div id="adblock-test-result"></div>
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
        
        // 加载标记的元素
        const markedElements = JSON.parse(localStorage.getItem('adblock_marked_elements') || '[]');
        updateSelectedElementsList(markedElements);
        
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
    adBlockRules.slice(0, 50).forEach((rule, index) => {
        html += \`<div style="padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.1);word-break:break-all;">\${rule}</div>\`;
    });
    
    if (adBlockRules.length > 50) {
        html += \`<div style="text-align:center;color:#b0b0b0;padding:10px;">... 还有 \${adBlockRules.length - 50} 条规则</div>\`;
    }
    
    rulesList.innerHTML = html;
}

async function loadDefaultRules() {
    showNotification('正在加载默认规则...', 'info');
    
    const rules = [];
    const ruleSettings = {
        easylist: document.getElementById('rule-easylist').checked,
        easylist_china: document.getElementById('rule-easylist-china').checked,
        cjx_annoyance: document.getElementById('rule-cjx-annoyance').checked,
        easyprivacy: document.getElementById('rule-easyprivacy').checked,
        antiadblock: document.getElementById('rule-antiadblock').checked
    };
    
    try {
        if (ruleSettings.easylist) {
            const response = await fetch('https://easylist-downloads.adblockplus.org/easylist.txt');
            const text = await response.text();
            rules.push(...text.split('\\n').filter(rule => rule && !rule.startsWith('!')));
        }
        
        if (ruleSettings.easylist_china) {
            const response = await fetch('https://easylist-downloads.adblockplus.org/easylistchina.txt');
            const text = await response.text();
            rules.push(...text.split('\\n').filter(rule => rule && !rule.startsWith('!')));
        }
        
        if (ruleSettings.cjx_annoyance) {
            const response = await fetch('https://fastly.jsdelivr.net/gh/cjx82630/cjxlist/cjx-annoyance.txt');
            const text = await response.text();
            rules.push(...text.split('\\n').filter(rule => rule && !rule.startsWith('!')));
        }
        
        if (ruleSettings.easyprivacy) {
            const response = await fetch('https://easylist-downloads.adblockplus.org/easyprivacy.txt');
            const text = await response.text();
            rules.push(...text.split('\\n').filter(rule => rule && !rule.startsWith('!')));
        }
        
        if (ruleSettings.antiadblock) {
            const response = await fetch('https://easylist-downloads.adblockplus.org/antiadblockfilters.txt');
            const text = await response.text();
            rules.push(...text.split('\\n').filter(rule => rule && !rule.startsWith('!')));
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

function updateAdBlockRules() {
    loadDefaultRules();
}

function saveCustomRules() {
    const customRules = document.getElementById('custom-rules').value;
    localStorage.setItem('adblock_custom_rules', customRules);
    showNotification('自定义规则已保存', 'success');
}

function testCustomRules() {
    const customRules = document.getElementById('custom-rules').value.split('\\n').filter(rule => rule.trim());
    const testUrls = [
        'https://ads.example.com/banner.jpg',
        'https://doubleclick.net/tracking.js',
        'https://googleadservices.com/pagead/conversion.js'
    ];
    
    let results = [];
    customRules.forEach(rule => {
        testUrls.forEach(url => {
            if (shouldBlockRequest(url, [rule])) {
                results.push(\`规则 "\${rule}" 拦截了 "\${url}"\`);
            }
        });
    });
    
    if (results.length > 0) {
        showNotification(\`测试完成: \${results.length} 个规则生效\`, 'success');
    } else {
        showNotification('测试完成: 没有规则匹配测试URL', 'info');
    }
}

function startElementSelection() {
    isSelectingAd = true;
    document.getElementById('start-select-btn').style.display = 'none';
    document.getElementById('stop-select-btn').style.display = 'block';
    
    // 添加选择模式样式
    document.body.style.cursor = 'crosshair';
    
    // 显示选择提示
    const hint = document.createElement('div');
    hint.className = 'element-selection-hint';
    hint.id = 'selection-hint';
    hint.textContent = '选择模式已激活 - 点击页面上的广告元素进行标记 (点击工具栏停止)';
    document.body.appendChild(hint);
    
    // 添加元素点击事件
    document.addEventListener('click', handleElementSelection, true);
    document.addEventListener('mouseover', handleElementHover, true);
    document.addEventListener('mouseout', handleElementUnhover, true);
    
    showNotification('选择模式已激活，点击页面上的广告元素进行标记', 'info');
}

function stopElementSelection() {
    isSelectingAd = false;
    document.getElementById('start-select-btn').style.display = 'block';
    document.getElementById('stop-select-btn').style.display = 'none';
    
    // 恢复正常光标
    document.body.style.cursor = '';
    
    // 移除提示
    const hint = document.getElementById('selection-hint');
    if (hint) hint.remove();
    
    // 移除事件监听
    document.removeEventListener('click', handleElementSelection, true);
    document.removeEventListener('mouseover', handleElementHover, true);
    document.removeEventListener('mouseout', handleElementUnhover, true);
    
    // 移除所有高亮
    document.querySelectorAll('.ad-element-highlight').forEach(el => {
        el.classList.remove('ad-element-highlight');
    });
    
    showNotification('选择模式已关闭', 'info');
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
    
    // 跳过工具栏元素
    if (event.target.closest('#proxy-toolbar')) return;
    
    // 只有未被选中的元素才移除高亮
    if (!selectedAdElements.has(event.target)) {
        event.target.classList.remove('ad-element-highlight');
    }
    event.stopPropagation();
}

function handleElementSelection(event) {
    if (!isSelectingAd) return;
    
    // 跳过工具栏元素
    if (event.target.closest('#proxy-toolbar')) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const element = event.target;
    
    // 检查是否是功能按钮或重要元素
    if (isFunctionalElement(element)) {
        showNotification('检测到功能元素，已跳过标记', 'warning');
        return false;
    }
    
    const selector = generateCSSSelector(element);
    
    if (selectedAdElements.has(element)) {
        // 如果已经选中，则取消选中
        selectedAdElements.delete(element);
        element.classList.remove('ad-element-highlight');
    } else {
        // 添加到选中集合
        selectedAdElements.add(element);
        
        // 添加到自定义规则
        const customRules = document.getElementById('custom-rules');
        const newRule = \`##\${selector}\`;
        
        if (!customRules.value.includes(newRule)) {
            customRules.value += (customRules.value ? '\\n' : '') + newRule;
            saveCustomRules();
            
            // 立即隐藏元素
            element.style.display = 'none';
            
            showNotification(\`已标记并隐藏元素: \${selector}\`, 'success');
            
            // 更新选中元素列表
            updateSelectedElementsList();
        }
    }
    
    return false;
}

function isFunctionalElement(element) {
    // 检查元素是否是功能按钮或重要元素
    const tagName = element.tagName.toLowerCase();
    const className = element.className.toString().toLowerCase();
    const id = element.id.toLowerCase();
    
    // 跳过按钮、链接、输入框等
    if (['button', 'a', 'input', 'select', 'textarea'].includes(tagName)) {
        return true;
    }
    
    // 跳过包含功能类名的元素
    const functionalClasses = ['button', 'btn', 'nav', 'menu', 'header', 'footer', 'toolbar', 'proxy'];
    if (functionalClasses.some(funcClass => className.includes(funcClass) || id.includes(funcClass))) {
        return true;
    }
    
    // 跳过包含特定文本的元素
    const text = element.textContent.toLowerCase();
    const functionalTexts = ['登录', '注册', '搜索', '菜单', '设置', '首页', '帮助', 'contact', 'login', 'signup', 'search', 'menu', 'settings', 'home', 'help'];
    if (functionalTexts.some(funcText => text.includes(funcText))) {
        return true;
    }
    
    return false;
}

function generateCSSSelector(element) {
    if (element.id) {
        return \`#\${element.id}\`;
    }
    
    let selector = element.tagName.toLowerCase();
    if (element.className) {
        const classes = element.className.toString().split(' ').filter(cls => cls.trim());
        if (classes.length > 0) {
            selector += '.' + classes.join('.');
        }
    }
    
    // 添加父元素信息以提高特异性
    if (element.parentElement) {
        const parentTag = element.parentElement.tagName.toLowerCase();
        selector = \`\${parentTag} > \${selector}\`;
    }
    
    return selector;
}

function updateSelectedElementsList() {
    const container = document.getElementById('selected-elements');
    const markedElements = Array.from(selectedAdElements).map(el => generateCSSSelector(el));
    
    // 保存到localStorage
    localStorage.setItem('adblock_marked_elements', JSON.stringify(markedElements));
    
    if (markedElements.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#b0b0b0;padding:20px;">暂无标记元素</div>';
        return;
    }
    
    let html = '';
    markedElements.forEach((selector, index) => {
        html += \`
        <div class="resource-item" data-selector="\${selector}">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div style="flex:1;">
                    <div class="resource-url">\${selector}</div>
                    <div class="resource-info">
                        <span>元素选择器</span>
                        <label style="display:flex;align-items:center;gap:5px;">
                            <input type="checkbox" class="element-checkbox" data-selector="\${selector}" checked onchange="toggleElementSelection(this)">
                            <span style="font-size:11px;color:#b0b0b0;">启用</span>
                        </label>
                    </div>
                </div>
                <div style="display:flex;gap:5px;">
                    <button onclick="testElementRule('\${selector}')" style="background:#4caf50;color:white;border:none;padding:3px 8px;border-radius:3px;font-size:10px;cursor:pointer;">测试</button>
                    <button onclick="removeElementRule('\${selector}')" style="background:#ff4757;color:white;border:none;padding:3px 8px;border-radius:3px;font-size:10px;cursor:pointer;">删除</button>
                </div>
            </div>
        </div>
        \`;
    });
    
    container.innerHTML = html;
}

function selectAllAdElements() {
    document.querySelectorAll('.element-checkbox').forEach(checkbox => {
        checkbox.checked = true;
        toggleElementSelection(checkbox);
    });
    showNotification('已全选所有标记元素', 'success');
}

function deselectAllAdElements() {
    document.querySelectorAll('.element-checkbox').forEach(checkbox => {
        checkbox.checked = false;
        toggleElementSelection(checkbox);
    });
    showNotification('已取消全选', 'info');
}

function removeSelectedAdElements() {
    const checkedBoxes = document.querySelectorAll('.element-checkbox:checked');
    if (checkedBoxes.length === 0) {
        showNotification('请先选择要删除的元素', 'warning');
        return;
    }
    
    checkedBoxes.forEach(checkbox => {
        const selector = checkbox.getAttribute('data-selector');
        removeElementRule(selector);
    });
    
    showNotification(\`已删除 \${checkedBoxes.length} 个标记元素\`, 'success');
}

function toggleElementSelection(checkbox) {
    const selector = checkbox.getAttribute('data-selector');
    const elements = document.querySelectorAll(selector);
    
    if (checkbox.checked) {
        // 隐藏元素
        elements.forEach(el => {
            el.style.display = 'none';
            selectedAdElements.add(el);
        });
    } else {
        // 显示元素
        elements.forEach(el => {
            el.style.display = '';
            selectedAdElements.delete(el);
        });
    }
}

function removeElementRule(selector) {
    const customRules = document.getElementById('custom-rules');
    const rules = customRules.value.split('\\n').filter(rule => !rule.includes(selector));
    customRules.value = rules.join('\\n');
    saveCustomRules();
    
    // 重新显示元素
    document.querySelectorAll(selector).forEach(el => {
        el.style.display = '';
        selectedAdElements.delete(el);
    });
    
    // 更新列表
    updateSelectedElementsList();
    
    showNotification(\`已移除规则: \${selector}\`, 'success');
}

function testElementRule(selector) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
        // 临时显示元素
        elements.forEach(el => {
            const originalDisplay = el.style.display;
            el.style.display = 'block';
            
            // 添加临时边框
            el.style.outline = '2px solid #4caf50';
            
            setTimeout(() => {
                el.style.display = originalDisplay;
                el.style.outline = '';
            }, 2000);
        });
        
        showNotification(\`找到 \${elements.length} 个匹配元素，已临时显示\`, 'success');
    } else {
        showNotification('未找到匹配的元素', 'warning');
    }
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

function startAdBlocking() {
    if (!adBlockEnabled) return;
    
    // 保存原始函数
    if (!window.originalFetch) {
        window.originalFetch = window.fetch;
    }
    if (!window.originalXHROpen) {
        window.originalXHROpen = XMLHttpRequest.prototype.open;
    }
    
    // 拦截网络请求
    window.fetch = function(...args) {
        const url = args[0];
        if (shouldBlockRequest(url)) {
            console.log('Blocked fetch request:', url);
            return Promise.reject(new Error('Blocked by ad blocker'));
        }
        return window.originalFetch.apply(this, args);
    };
    
    // 拦截XMLHttpRequest
    XMLHttpRequest.prototype.open = function(...args) {
        const url = args[1];
        if (shouldBlockRequest(url)) {
            console.log('Blocked XHR request:', url);
            this.shouldBlock = true;
            return;
        }
        return window.originalXHROpen.apply(this, args);
    };
    
    // 隐藏广告元素
    hideAdElements();
}

function shouldBlockRequest(url, customRules = null) {
    if (!adBlockEnabled) return false;
    
    const rulesToUse = customRules || adBlockRules;
    if (!rulesToUse.length) return false;
    
    const urlStr = url.toString().toLowerCase();
    
    return rulesToUse.some(rule => {
        if (!rule || rule.startsWith('!') || rule.startsWith('##')) return false;
        
        if (rule.startsWith('||')) {
            const domain = rule.substring(2).replace(/[\\^|$]/g, '');
            return urlStr.includes(domain);
        } else if (rule.startsWith('@@')) {
            // 白名单规则，不拦截
            return false;
        } else if (rule.startsWith('/') && rule.endsWith('/')) {
            // 正则表达式规则
            try {
                const regex = new RegExp(rule.substring(1, rule.length - 1));
                return regex.test(urlStr);
            } catch (e) {
                return false;
            }
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
    
    // 显示所有被隐藏的元素
    document.querySelectorAll('*').forEach(el => {
        if (el.style.display === 'none') {
            el.style.display = '';
        }
    });
}

function checkAdBlockStatus() {
    const resultContainer = document.getElementById('adblock-check-result');
    resultContainer.innerHTML = '<div class="check-status check-loading">🔍 检查中...</div>';
    
    setTimeout(() => {
        const enabled = localStorage.getItem('${adBlockEnabledName}') === 'true';
        const rules = JSON.parse(localStorage.getItem('adblock_rules') || '[]');
        const customRules = localStorage.getItem('adblock_custom_rules') || '';
        
        let statusHTML = '';
        
        if (enabled) {
            statusHTML += '<div class="check-status check-success">✅ 广告拦截已启用</div>';
        } else {
            statusHTML += '<div class="check-status check-error">❌ 广告拦截已禁用</div>';
        }
        
        statusHTML += \`
            <div style="margin-top:10px;font-size:12px;color:#b0b0b0;">
                <div>规则总数: \${rules.length}</div>
                <div>自定义规则: \${customRules.split('\\\\n').filter(r => r.trim()).length} 条</div>
                <div>标记元素: \${selectedAdElements.size} 个</div>
            </div>
        \`;
        
        // 测试拦截功能
        const testUrl = 'https://ads.example.com/test.js';
        const isBlocked = shouldBlockRequest(testUrl);
        
        statusHTML += \`
            <div style="margin-top:10px;font-size:12px;">
                拦截测试: <span style="color:\${isBlocked ? '#4caf50' : '#ff4757'}">\${isBlocked ? '✅ 正常工作' : '❌ 可能有问题'}</span>
            </div>
        \`;
        
        resultContainer.innerHTML = statusHTML;
    }, 1000);
}

function testAdBlockFunction() {
    const resultContainer = document.getElementById('adblock-test-result');
    resultContainer.innerHTML = '<div class="check-status check-loading">🧪 测试中...</div>';
    
    setTimeout(() => {
        // 创建测试广告元素
        const testAd = document.createElement('div');
        testAd.id = 'proxy-test-ad';
        testAd.innerHTML = '广告拦截测试 - 这个元素应该被隐藏';
        testAd.style.cssText = 'position:fixed;top:10px;left:10px;background:#ff4757;color:white;padding:10px;z-index:2147483645;border-radius:5px;';
        document.body.appendChild(testAd);
        
        // 添加测试规则
        const testRule = '##div#proxy-test-ad';
        const originalRules = [...adBlockRules];
        adBlockRules.push(testRule);
        
        // 应用规则
        hideAdElements();
        
        const isHidden = testAd.style.display === 'none';
        
        // 清理
        testAd.remove();
        adBlockRules = originalRules;
        
        if (isHidden) {
            resultContainer.innerHTML = '<div class="check-status check-success">✅ 广告拦截功能正常</div>';
        } else {
            resultContainer.innerHTML = '<div class="check-status check-error">❌ 广告拦截功能异常</div>';
        }
    }, 1000);
}
`;

// =======================================================================================
// 第七部分：增强的资源嗅探系统
// 功能：完整的资源请求监控和修改系统，支持请求拦截和重放
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
        <div class="proxy-modal-content" style="max-width:1000px;width:95vw;">
            <div class="modal-header">
                <h3 class="modal-title">🔍 资源嗅探</h3>
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
                    启用后自动开始捕获网络请求，无需刷新页面
                </div>
            </div>
            
            <div class="tab-container">
                <div class="tab-buttons">
                    <button class="tab-btn active" onclick="switchSnifferTab('captured')">捕获记录</button>
                    <button class="tab-btn" onclick="switchSnifferTab('modifiers')">请求修改</button>
                    <button class="tab-btn" onclick="switchSnifferTab('filters')">拦截设置</button>
                    <button class="tab-btn" onclick="switchSnifferTab('check')">检查功能</button>
                </div>
                
                <div id="captured-tab" class="tab-content active">
                    <div class="form-group">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                            <label class="form-label">捕获的资源请求</label>
                            <div>
                                <button class="btn btn-secondary" onclick="clearCapturedResources()" style="padding:6px 12px;font-size:12px;">清空记录</button>
                                <button class="btn btn-secondary" onclick="exportResources()" style="padding:6px 12px;font-size:12px;">导出</button>
                                <button class="btn btn-primary" onclick="toggleSniffer()" style="padding:6px 12px;font-size:12px;">
                                    \${isSnifferActive ? '停止捕获' : '开始捕获'}
                                </button>
                            </div>
                        </div>
                        
                        <div class="filter-tags">
                            <span class="filter-tag active" onclick="filterResources('all')">全部</span>
                            <span class="filter-tag" onclick="filterResources('xhr')">XHR</span>
                            <span class="filter-tag" onclick="filterResources('fetch')">Fetch</span>
                            <span class="filter-tag" onclick="filterResources('js')">JS</span>
                            <span class="filter-tag" onclick="filterResources('css')">CSS</span>
                            <span class="filter-tag" onclick="filterResources('image')">图片</span>
                            <span class="filter-tag" onclick="filterResources('media')">媒体</span>
                            <span class="filter-tag" onclick="filterResources('blocked')">已拦截</span>
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
                        <div style="display:flex;align-items:center;gap:10px;">
                            <label class="switch">
                                <input type="checkbox" id="auto-start-sniffer">
                                <span class="slider"></span>
                            </label>
                            <span style="color:#e0e0e0;font-size:14px;">页面加载时自动开启资源嗅探</span>
                        </div>
                    </div>
                </div>
                
                <div id="check-tab" class="tab-content">
                    <div class="form-group">
                        <label class="form-label">资源嗅探状态检查</label>
                        <div style="background:rgba(0,0,0,0.3);padding:15px;border-radius:8px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                                <span style="color:#e0e0e0;">嗅探功能状态</span>
                                <button class="btn btn-primary" onclick="checkSnifferStatus()" style="padding:6px 12px;font-size:12px;">检查状态</button>
                            </div>
                            <div id="sniffer-check-result"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">请求拦截测试</label>
                        <div style="background:rgba(0,0,0,0.3);padding:15px;border-radius:8px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                                <span style="color:#e0e0e0;">测试拦截功能</span>
                                <button class="btn btn-primary" onclick="testSnifferFunction()" style="padding:6px 12px;font-size:12px;">运行测试</button>
                            </div>
                            <div id="sniffer-test-result"></div>
                        </div>
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
        
        // 如果设置了自动开启且当前未激活，则开启嗅探
        const autoStart = localStorage.getItem('sniffer_auto_start') === 'true';
        if (autoStart && !isSnifferActive && resourceSnifferEnabled) {
            toggleSniffer();
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
        const autoStart = localStorage.getItem('sniffer_auto_start') === 'true';
        document.getElementById('auto-start-sniffer').checked = autoStart;
        
        // 加载捕获的资源
        capturedResources = JSON.parse(localStorage.getItem('sniffer_captured') || '[]');
        
        // 加载修改器规则
        requestModifiers = JSON.parse(localStorage.getItem('sniffer_modifiers') || '[]');
        
        // 加载嗅探状态
        isSnifferActive = localStorage.getItem('sniffer_active') === 'true';
        
    } catch (e) {
        console.error('加载资源嗅探设置失败:', e);
    }
}

function updateResourcesList(filter = 'all') {
    const container = document.getElementById('resources-list');
    
    // 更新过滤标签
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    event?.target.classList.add('active');
    
    let filteredResources = capturedResources;
    
    if (filter !== 'all') {
        filteredResources = capturedResources.filter(resource => {
            if (filter === 'blocked') {
                return resource.blocked === true;
            }
            return resource.type === filter;
        });
    }
    
    if (filteredResources.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#b0b0b0;padding:40px;">暂无捕获记录</div>';
        return;
    }
    
    let html = '';
    filteredResources.slice().reverse().forEach((resource, index) => {
        const time = new Date(resource.timestamp).toLocaleTimeString();
        const method = resource.method || 'GET';
        const status = resource.status || 'Pending';
        const type = resource.type || 'unknown';
        const isBlocked = resource.blocked === true;
        
        html += \`
        <div class="resource-item" style="border-left-color: \${isBlocked ? '#ff4757' : '#4fc3f7'}">
            <div class="resource-url" title="\${resource.url}">\${method} \${resource.url}</div>
            <div class="resource-info">
                <span style="color:\${isBlocked ? '#ff4757' : status === 200 ? '#4caf50' : '#ff9800'}">状态: \${isBlocked ? '已拦截' : status}</span>
                <span>类型: \${type}</span>
                <span>时间: \${time}</span>
                <span>大小: \${formatBytes(resource.size)}</span>
                <div style="display:flex;gap:5px;">
                    <button onclick="inspectResource(\${capturedResources.length - 1 - index})" style="background:#4fc3f7;color:white;border:none;padding:2px 8px;border-radius:3px;font-size:10px;cursor:pointer;">详情</button>
                    <button onclick="replayResource(\${capturedResources.length - 1 - index})" style="background:#4caf50;color:white;border:none;padding:2px 8px;border-radius:3px;font-size:10px;cursor:pointer;">重放</button>
                    \${isBlocked ? '' : '<button onclick="blockSimilarResource(' + (capturedResources.length - 1 - index) + ')" style="background:#ff9800;color:white;border:none;padding:2px 8px;border-radius:3px;font-size:10px;cursor:pointer;">拦截</button>'}
                </div>
            </div>
        </div>
        \`;
    });
    
    container.innerHTML = html;
}

function filterResources(type) {
    updateResourcesList(type);
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
                        <span>状态: \${modifier.enabled ? '✅ 启用' : '❌ 禁用'}</span>
                    </div>
                </div>
                <div style="display:flex;gap:5px;">
                    <button onclick="toggleModifier(\${index})" style="background:\${modifier.enabled ? '#ff9800' : '#4caf50'};color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;">\${modifier.enabled ? '禁用' : '启用'}</button>
                    <button onclick="editModifier(\${index})" style="background:#2196f3;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;">编辑</button>
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
        action: 'block', // block, redirect, modify
        target: 'url', // url, header, body
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
        <div class="proxy-modal-content" style="max-width:700px;">
            <div class="modal-header">
                <h3 class="modal-title">编辑修改规则</h3>
                <button class="close-modal" onclick="closeModifierEditor()">×</button>
            </div>
            
            <div class="form-group">
                <label class="form-label">URL模式 (支持通配符 * 和正则表达式)</label>
                <input type="text" id="modifier-pattern" class="form-input" value="\${modifier.pattern}" placeholder="例如: *://*.ads.com/* 或 /ads\\\\.\\\\w+\\\\.com/">
                <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">
                    * 匹配任意字符，/regex/ 使用正则表达式
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">动作</label>
                <select id="modifier-action" class="form-select">
                    <option value="block" \${modifier.action === 'block' ? 'selected' : ''}>拦截请求</option>
                    <option value="redirect" \${modifier.action === 'redirect' ? 'selected' : ''}>重定向到</option>
                    <option value="modify" \${modifier.action === 'modify' ? 'selected' : ''}>修改请求</option>
                    <option value="modify-response" \${modifier.action === 'modify-response' ? 'selected' : ''}>修改响应</option>
                </select>
            </div>
            
            <div class="form-group" id="modify-target-group" \${modifier.action !== 'modify' && modifier.action !== 'modify-response' ? 'style="display:none;"' : ''}>
                <label class="form-label">修改目标</label>
                <select id="modifier-target" class="form-select">
                    <option value="url" \${modifier.target === 'url' ? 'selected' : ''}>URL</option>
                    <option value="header" \${modifier.target === 'header' ? 'selected' : ''}>请求头</option>
                    <option value="body" \${modifier.target === 'body' ? 'selected' : ''}>请求体</option>
                    <option value="response" \${modifier.target === 'response' ? 'selected' : ''}>响应内容</option>
                </select>
            </div>
            
            <div class="form-group" id="modifier-value-group" \${!modifier.value && modifier.action !== 'redirect' ? 'style="display:none;"' : ''}>
                <label class="form-label" id="modifier-value-label">
                    \${modifier.action === 'redirect' ? '重定向到URL' : modifier.target === 'header' ? '请求头名称=值' : modifier.target === 'body' ? '请求体内容' : modifier.target === 'response' ? '响应内容' : '修改值'}
                </label>
                <textarea id="modifier-value" class="form-textarea" placeholder="输入修改内容" style="height:120px;">\${modifier.value || ''}</textarea>
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
        const valueLabel = document.getElementById('modifier-value-label');
        const valueInput = document.getElementById('modifier-value');
        
        if (action === 'modify' || action === 'modify-response') {
            targetGroup.style.display = 'block';
            valueGroup.style.display = 'block';
            updateValueLabel();
        } else if (action === 'redirect') {
            targetGroup.style.display = 'none';
            valueGroup.style.display = 'block';
            valueLabel.textContent = '重定向到URL';
            valueInput.placeholder = '输入重定向的URL';
        } else if (action === 'block') {
            targetGroup.style.display = 'none';
            valueGroup.style.display = 'none';
        }
    }
    
    function updateValueLabel() {
        const target = document.getElementById('modifier-target').value;
        const label = document.getElementById('modifier-value-label');
        const input = document.getElementById('modifier-value');
        
        if (target === 'header') {
            label.textContent = '请求头修改 (每行一个: HeaderName=HeaderValue)';
            input.placeholder = '例如:\\nUser-Agent=Custom Agent\\nReferer=https://example.com';
        } else if (target === 'body') {
            label.textContent = '请求体内容';
            input.placeholder = '输入修改后的请求体内容';
        } else if (target === 'response') {
            label.textContent = '响应内容';
            input.placeholder = '输入修改后的响应内容';
        } else {
            label.textContent = 'URL修改';
            input.placeholder = '输入修改后的URL';
        }
    }
    
    // 初始更新UI
    updateModifierEditorUI();
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
    requestModifiers.splice(index, 1);
    localStorage.setItem('sniffer_modifiers', JSON.stringify(requestModifiers));
    updateModifiersList();
    showNotification('修改规则已删除', 'success');
}

function inspectResource(index) {
    const resource = capturedResources[index];
    
    const detailHTML = \`
    <div class="proxy-modal" id="resource-detail">
        <div class="proxy-modal-content" style="max-width:900px;">
            <div class="modal-header">
                <h3 class="modal-title">资源详情与修改</h3>
                <button class="close-modal" onclick="closeResourceDetail()">×</button>
            </div>
            
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
                    <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:6px;font-size:13px;color:#e0e0e0;">\${resource.blocked ? '已拦截' : resource.status || 'Pending'}</div>
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
            
            <div class="request-editor">
                <div class="editor-section">
                    <div class="editor-section-title">请求头</div>
                    <div id="request-headers-editor">
                        \${resource.headers ? Object.entries(resource.headers).map(([key, value]) => \`
                            <div class="header-row">
                                <input class="header-input" value="\${key}" placeholder="Header Name">
                                <input class="header-input" value="\${value}" placeholder="Header Value">
                                <button class="remove-header" onclick="removeHeader(this)">×</button>
                            </div>
                        \`).join('') : '<div style="color:#b0b0b0;text-align:center;padding:10px;">无请求头信息</div>'}
                    </div>
                    <button class="add-header" onclick="addHeader()">添加请求头</button>
                </div>
                
                <div class="editor-section">
                    <div class="editor-section-title">请求体</div>
                    <textarea id="request-body-editor" class="form-textarea" placeholder="请求体内容" style="height:100px;">\${resource.body || ''}</textarea>
                </div>
            </div>
            
            <div class="replay-controls">
                <button class="btn btn-secondary" onclick="closeResourceDetail()">关闭</button>
                <button class="btn btn-primary" onclick="replayModifiedRequest(\${index})">重放修改后的请求</button>
                <button class="btn btn-primary" onclick="createModifierFromResource('\${resource.url}')">创建拦截规则</button>
            </div>
        </div>
    </div>
    \`;
    
    document.body.insertAdjacentHTML('beforeend', detailHTML);
}

function closeResourceDetail() {
    const detail = document.getElementById('resource-detail');
    if (detail) detail.remove();
}

function addHeader() {
    const container = document.getElementById('request-headers-editor');
    const newRow = document.createElement('div');
    newRow.className = 'header-row';
    newRow.innerHTML = \`
        <input class="header-input" placeholder="Header Name">
        <input class="header-input" placeholder="Header Value">
        <button class="remove-header" onclick="removeHeader(this)">×</button>
    \`;
    container.appendChild(newRow);
}

function removeHeader(button) {
    button.parentElement.remove();
}

function replayModifiedRequest(index) {
    const resource = capturedResources[index];
    const headers = {};
    
    // 收集修改后的请求头
    document.querySelectorAll('#request-headers-editor .header-row').forEach(row => {
        const inputs = row.querySelectorAll('.header-input');
        const key = inputs[0].value.trim();
        const value = inputs[1].value.trim();
        if (key && value) {
            headers[key] = value;
        }
    });
    
    // 获取修改后的请求体
    const body = document.getElementById('request-body-editor').value;
    
    // 创建新的请求
    const requestOptions = {
        method: resource.method || 'GET',
        headers: headers,
        body: body || undefined
    };
    
    fetch(resource.url, requestOptions)
        .then(response => {
            showNotification('请求重放成功', 'success');
            closeResourceDetail();
        })
        .catch(error => {
            showNotification('请求重放失败: ' + error.message, 'error');
        });
}

function replayResource(index) {
    const resource = capturedResources[index];
    if (resource.blocked) {
        showNotification('无法重放已拦截的请求', 'warning');
        return;
    }
    
    const requestOptions = {
        method: resource.method || 'GET',
        headers: resource.headers || {}
    };
    
    fetch(resource.url, requestOptions)
        .then(response => {
            showNotification('请求重放成功', 'success');
        })
        .catch(error => {
            showNotification('请求重放失败: ' + error.message, 'error');
        });
}

function blockSimilarResource(index) {
    const resource = capturedResources[index];
    const url = resource.url;
    
    // 创建基于域名的拦截规则
    const domain = new URL(url).hostname;
    const pattern = \`*://\${domain}/*\`;
    
    const modifier = {
        pattern: pattern,
        action: 'block',
        target: 'url',
        value: '',
        enabled: true
    };
    
    requestModifiers.push(modifier);
    localStorage.setItem('sniffer_modifiers', JSON.stringify(requestModifiers));
    updateModifiersList();
    
    // 标记资源为已拦截
    resource.blocked = true;
    localStorage.setItem('sniffer_captured', JSON.stringify(capturedResources));
    updateResourcesList();
    
    showNotification(\`已创建拦截规则: \${domain}\`, 'success');
}

function createModifierFromResource(url) {
    closeResourceDetail();
    
    const domain = new URL(url).hostname;
    const modifier = {
        pattern: \`*://\${domain}/*\`,
        action: 'block',
        target: 'url',
        value: '',
        enabled: true
    };
    
    requestModifiers.push(modifier);
    localStorage.setItem('sniffer_modifiers', JSON.stringify(requestModifiers));
    updateModifiersList();
    showNotification(\`已基于资源创建拦截规则: \${domain}\`, 'success');
}

function clearCapturedResources() {
    capturedResources = [];
    localStorage.setItem('sniffer_captured', JSON.stringify(capturedResources));
    updateResourcesList();
    showNotification('已清空捕获记录', 'success');
}

function exportResources() {
    const data = JSON.stringify(capturedResources, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`resources_\${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json\`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('资源记录已导出', 'success');
}

function toggleSniffer() {
    isSnifferActive = !isSnifferActive;
    localStorage.setItem('sniffer_active', isSnifferActive.toString());
    
    if (isSnifferActive) {
        startResourceSniffing();
        showNotification('资源嗅探已开始', 'success');
    } else {
        stopResourceSniffing();
        showNotification('资源嗅探已停止', 'info');
    }
    
    // 更新按钮文本
    const button = document.querySelector('#sniffer-modal button[onclick="toggleSniffer()"]');
    if (button) {
        button.textContent = isSnifferActive ? '停止捕获' : '开始捕获';
    }
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
    const autoStart = document.getElementById('auto-start-sniffer').checked;
    localStorage.setItem('sniffer_auto_start', autoStart.toString());
    
    if (resourceSnifferEnabled) {
        if (!isSnifferActive) {
            startResourceSniffing();
        }
        showNotification('资源嗅探设置已保存', 'success');
    } else {
        stopResourceSniffing();
        showNotification('资源嗅探已禁用', 'info');
    }
    
    setTimeout(closeAllModals, 500);
}

function startResourceSniffing() {
    if (!resourceSnifferEnabled) return;
    
    isSnifferActive = true;
    localStorage.setItem('sniffer_active', 'true');
    
    // 保存原始方法
    if (!window.originalFetch) {
        window.originalFetch = window.fetch;
    }
    if (!window.originalXHROpen) {
        window.originalXHROpen = XMLHttpRequest.prototype.open;
    }
    if (!window.originalXHRSend) {
        window.originalXHRSend = XMLHttpRequest.prototype.send;
    }
    
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
        
        // 应用修改规则
        const modified = applyRequestModifiers(resource);
        if (modified.blocked) {
            resource.blocked = true;
            captureResource(resource);
            return Promise.reject(new Error('Request blocked by resource sniffer'));
        }
        
        if (modified.redirected) {
            args[0] = modified.newUrl;
            resource.url = modified.newUrl;
        }
        
        if (modified.modified) {
            args[1] = modified.newOptions;
            resource.headers = modified.newOptions.headers;
            resource.body = modified.newOptions.body;
        }
        
        captureResource(resource);
        
        try {
            const response = await window.originalFetch.apply(this, args);
            
            // 捕获响应
            const responseResource = {
                url: url,
                method: options.method || 'GET',
                type: 'fetch',
                status: response.status,
                size: 0,
                timestamp: Date.now(),
                headers: Object.fromEntries(response.headers.entries())
            };
            
            // 应用响应修改
            const responseModified = applyResponseModifiers(responseResource, await response.clone().text());
            if (responseModified.modified) {
                const modifiedResponse = new Response(responseModified.newBody, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: responseModified.newHeaders
                });
                captureResource(responseResource);
                return modifiedResponse;
            }
            
            captureResource(responseResource);
            return response;
        } catch (error) {
            const errorResource = {
                url: url,
                method: options.method || 'GET',
                type: 'fetch',
                status: 'Error',
                error: error.message,
                timestamp: Date.now()
            };
            captureResource(errorResource);
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
        
        // 应用修改规则
        const modified = applyRequestModifiers(resource);
        if (modified.blocked) {
            resource.blocked = true;
            captureResource(resource);
            this.abort();
            return;
        }
        
        if (modified.redirected) {
            this._url = modified.newUrl;
        }
        
        captureResource(resource);
        
        this.addEventListener('load', function() {
            const responseResource = {
                url: this._url,
                method: this._method,
                type: 'xhr',
                status: this.status,
                size: this.response ? new Blob([this.response]).size : 0,
                timestamp: Date.now(),
                response: this.response
            };
            captureResource(responseResource);
        });
        
        this.addEventListener('error', function() {
            const errorResource = {
                url: this._url,
                method: this._method,
                type: 'xhr',
                status: 'Error',
                timestamp: Date.now()
            };
            captureResource(errorResource);
        });
        
        return window.originalXHRSend.apply(this, args);
    };
}

function stopResourceSniffing() {
    isSnifferActive = false;
    localStorage.setItem('sniffer_active', 'false');
    
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
    if (url.match(/\\.(mp4|webm|mp3|wav)$/i) && !filterSettings.media) return false;
    if (resource.type === 'xhr' && !filterSettings.xhr) return false;
    
    return true;
}

function applyRequestModifiers(resource) {
    const result = {
        blocked: false,
        redirected: false,
        modified: false,
        newUrl: resource.url,
        newOptions: { ...resource }
    };
    
    requestModifiers.forEach(modifier => {
        if (!modifier.enabled || modifier.action === 'modify-response') return;
        
        const matches = matchesPattern(resource.url, modifier.pattern);
        if (matches) {
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
                    } else if (modifier.target === 'header' && result.newOptions.headers) {
                        const headers = modifier.value.split('\\n').filter(h => h.trim());
                        headers.forEach(header => {
                            const [name, value] = header.split('=').map(h => h.trim());
                            if (name && value) {
                                result.newOptions.headers[name] = value;
                            }
                        });
                    } else if (modifier.target === 'body') {
                        result.newOptions.body = modifier.value;
                    }
                    break;
            }
        }
    });
    
    return result;
}

function applyResponseModifiers(resource, body) {
    const result = {
        modified: false,
        newHeaders: resource.headers || {},
        newBody: body
    };
    
    requestModifiers.forEach(modifier => {
        if (!modifier.enabled || modifier.action !== 'modify-response') return;
        
        const matches = matchesPattern(resource.url, modifier.pattern);
        if (matches && modifier.target === 'response') {
            result.modified = true;
            result.newBody = modifier.value;
        }
    });
    
    return result;
}

function matchesPattern(url, pattern) {
    if (pattern.startsWith('/') && pattern.endsWith('/')) {
        // 正则表达式模式
        try {
            const regex = new RegExp(pattern.slice(1, -1));
            return regex.test(url);
        } catch (e) {
            return false;
        }
    } else {
        // 通配符模式
        const regexPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\\*/g, '.*');
        const regex = new RegExp(\`^\${regexPattern}$\`);
        return regex.test(url);
    }
}

function checkSnifferStatus() {
    const resultContainer = document.getElementById('sniffer-check-result');
    resultContainer.innerHTML = '<div class="check-status check-loading">🔍 检查中...</div>';
    
    setTimeout(() => {
        const enabled = localStorage.getItem('${resourceSnifferName}') === 'true';
        const active = localStorage.getItem('sniffer_active') === 'true';
        const rules = JSON.parse(localStorage.getItem('sniffer_modifiers') || '[]');
        const captured = JSON.parse(localStorage.getItem('sniffer_captured') || '[]');
        
        let statusHTML = '';
        
        if (enabled) {
            statusHTML += '<div class="check-status check-success">✅ 资源嗅探已启用</div>';
        } else {
            statusHTML += '<div class="check-status check-error">❌ 资源嗅探已禁用</div>';
        }
        
        statusHTML += \`
            <div style="margin-top:10px;font-size:12px;color:#b0b0b0;">
                <div>运行状态: \${active ? '🟢 活跃' : '🔴 停止'}</div>
                <div>修改规则: \${rules.length} 条</div>
                <div>捕获记录: \${captured.length} 条</div>
                <div>自动开启: \${localStorage.getItem('sniffer_auto_start') === 'true' ? '是' : '否'}</div>
            </div>
        \`;
        
        // 测试拦截功能
        const testUrls = ['https://example.com/test', 'https://ads.com/tracking.js'];
        let blockedCount = 0;
        
        testUrls.forEach(url => {
            const resource = { url };
            const result = applyRequestModifiers(resource);
            if (result.blocked) blockedCount++;
        });
        
        statusHTML += \`
            <div style="margin-top:10px;font-size:12px;">
                拦截测试: <span style="color:\${blockedCount > 0 ? '#4caf50' : '#ff9800'}">\${blockedCount} / \${testUrls.length} 个测试URL被拦截</span>
            </div>
        \`;
        
        resultContainer.innerHTML = statusHTML;
    }, 1000);
}

function testSnifferFunction() {
    const resultContainer = document.getElementById('sniffer-test-result');
    resultContainer.innerHTML = '<div class="check-status check-loading">🧪 测试中...</div>';
    
    setTimeout(() => {
        // 创建测试请求
        const testUrl = 'https://httpbin.org/get';
        
        fetch(testUrl)
            .then(response => response.json())
            .then(data => {
                resultContainer.innerHTML = '<div class="check-status check-success">✅ 资源嗅探功能正常</div>';
            })
            .catch(error => {
                resultContainer.innerHTML = '<div class="check-status check-error">❌ 资源嗅探功能异常</div>';
            });
    }, 1000);
}
`;

// =======================================================================================
// 第八部分：增强的设置系统
// 功能：用户代理、语言设置和其他配置，包含无图模式和检查功能
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
                        <input type="text" id="custom-language" class="form-input" placeholder="例如: zh-CN, en-US">
                    </div>
                </div>
                
                <div id="content-tab" class="tab-content">
                    <div class="form-group">
                        <label style="display:flex;align-items:center;justify-content:space-between;">
                            <span style="color:#e0e0e0;font-size:16px;font-weight:500;">无图模式</span>
                            <label class="switch">
                                <input type="checkbox" id="image-mode">
                                <span class="slider"></span>
                            </label>
                        </label>
                        <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">
                            拦截所有图片和视频资源，节省流量
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label style="display:flex;align-items:center;justify-content:space-between;">
                            <span style="color:#e0e0e0;font-size:16px;font-weight:500;">无视频模式</span>
                            <label class="switch">
                                <input type="checkbox" id="video-mode">
                                <span class="slider"></span>
                            </label>
                        </label>
                        <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">
                            拦截所有视频资源
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">拦截的媒体类型</label>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(120px, 1fr));gap:8px;">
                            <label style="display:flex;align-items:center;gap:6px;">
                                <input type="checkbox" id="block-jpg" checked>
                                <span style="color:#e0e0e0;font-size:13px;">JPG/JPEG</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:6px;">
                                <input type="checkbox" id="block-png" checked>
                                <span style="color:#e0e0e0;font-size:13px;">PNG</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:6px;">
                                <input type="checkbox" id="block-gif" checked>
                                <span style="color:#e0e0e0;font-size:13px;">GIF</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:6px;">
                                <input type="checkbox" id="block-webp" checked>
                                <span style="color:#e0e0e0;font-size:13px;">WebP</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:6px;">
                                <input type="checkbox" id="block-svg" checked>
                                <span style="color:#e0e0e0;font-size:13px;">SVG</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:6px;">
                                <input type="checkbox" id="block-mp4" checked>
                                <span style="color:#e0e0e0;font-size:13px;">MP4</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:6px;">
                                <input type="checkbox" id="block-webm" checked>
                                <span style="color:#e0e0e0;font-size:13px;">WebM</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:6px;">
                                <input type="checkbox" id="block-mp3" checked>
                                <span style="color:#e0e0e0;font-size:13px;">MP3</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div id="advanced-tab" class="tab-content">
                    <div class="form-group">
                        <label style="display:flex;align-items:center;justify-content:space-between;">
                            <span style="color:#e0e0e0;font-size:16px;font-weight:500;">请求修改器</span>
                            <label class="switch">
                                <input type="checkbox" id="request-modifier">
                                <span class="slider"></span>
                            </label>
                        </label>
                        <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">
                            启用请求头和响应头修改功能
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">自定义CSS注入</label>
                        <textarea id="custom-css" class="form-textarea" placeholder="输入自定义CSS代码" style="height:150px;"></textarea>
                        <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">
                            修复网站样式冲突或自定义页面外观
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">网站特定补丁</label>
                        <select id="website-patch" class="form-select">
                            <option value="">无</option>
                            <option value="google">Google 服务</option>
                            <option value="youtube">YouTube</option>
                            <option value="facebook">Facebook</option>
                            <option value="twitter">Twitter</option>
                            <option value="instagram">Instagram</option>
                            <option value="custom">自定义</option>
                        </select>
                    </div>
                </div>
                
                <div id="check-tab" class="tab-content">
                    <div class="form-group">
                        <label class="form-label">功能状态检查</label>
                        <div style="background:rgba(0,0,0,0.3);padding:15px;border-radius:8px;">
                            <div id="settings-check-result">
                                <div style="color:#b0b0b0;text-align:center;padding:10px;">点击下方按钮检查功能状态</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="btn-group">
                        <button class="btn btn-primary" onclick="checkAllSettings()">检查所有功能</button>
                        <button class="btn btn-secondary" onclick="resetAllSettings()">重置所有设置</button>
                    </div>
                </div>
            </div>
            
            <div class="btn-group">
                <button class="btn btn-secondary" onclick="closeAllModals()">取消</button>
                <button class="btn btn-primary" onclick="saveSettings()">保存设置</button>
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
        
        // 添加事件监听
        document.getElementById('user-agent').addEventListener('change', function() {
            document.getElementById('custom-ua-group').style.display = 
                this.value === 'custom' ? 'block' : 'none';
        });
        
        document.getElementById('browser-language').addEventListener('change', function() {
            document.getElementById('custom-lang-group').style.display = 
                this.value === 'custom' ? 'block' : 'none';
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
        const userAgent = localStorage.getItem('${userAgentName}') || 'default';
        document.getElementById('user-agent').value = userAgent;
        
        const customUA = localStorage.getItem('custom_user_agent') || '';
        document.getElementById('custom-user-agent').value = customUA;
        document.getElementById('custom-ua-group').style.display = 
            userAgent === 'custom' ? 'block' : 'none';
        
        // 语言设置
        const language = localStorage.getItem('${languageName}') || 'zh-CN';
        document.getElementById('browser-language').value = language;
        
        const customLang = localStorage.getItem('custom_language') || '';
        document.getElementById('custom-language').value = customLang;
        document.getElementById('custom-lang-group').style.display = 
            language === 'custom' ? 'block' : 'none';
        
        // 无图模式
        const imageMode = localStorage.getItem('${imageModeName}') === 'true';
        document.getElementById('image-mode').checked = imageMode;
        
        // 无视频模式
        const videoMode = localStorage.getItem('video_mode') === 'true';
        document.getElementById('video-mode').checked = videoMode;
        
        // 媒体类型拦截设置
        const mediaTypes = JSON.parse(localStorage.getItem('block_media_types') || '{"jpg":true,"png":true,"gif":true,"webp":true,"svg":true,"mp4":true,"webm":true,"mp3":true}');
        document.getElementById('block-jpg').checked = mediaTypes.jpg || false;
        document.getElementById('block-png').checked = mediaTypes.png || false;
        document.getElementById('block-gif').checked = mediaTypes.gif || false;
        document.getElementById('block-webp').checked = mediaTypes.webp || false;
        document.getElementById('block-svg').checked = mediaTypes.svg || false;
        document.getElementById('block-mp4').checked = mediaTypes.mp4 || false;
        document.getElementById('block-webm').checked = mediaTypes.webm || false;
        document.getElementById('block-mp3').checked = mediaTypes.mp3 || false;
        
        // 请求修改器
        const requestModifier = localStorage.getItem('${requestModifierName}') === 'true';
        document.getElementById('request-modifier').checked = requestModifier;
        
        // 自定义CSS
        const customCSS = localStorage.getItem('custom_css') || '';
        document.getElementById('custom-css').value = customCSS;
        
        // 网站补丁
        const websitePatch = localStorage.getItem('website_patch') || '';
        document.getElementById('website-patch').value = websitePatch;
        
    } catch (e) {
        console.error('加载设置失败:', e);
    }
}

function saveSettings() {
    try {
        // 保存用户代理设置
        const userAgent = document.getElementById('user-agent').value;
        localStorage.setItem('${userAgentName}', userAgent);
        
        if (userAgent === 'custom') {
            const customUA = document.getElementById('custom-user-agent').value.trim();
            localStorage.setItem('custom_user_agent', customUA);
        }
        
        // 保存语言设置
        const language = document.getElementById('browser-language').value;
        localStorage.setItem('${languageName}', language);
        
        if (language === 'custom') {
            const customLang = document.getElementById('custom-language').value.trim();
            localStorage.setItem('custom_language', customLang);
        }
        
        // 保存无图模式设置
        const imageMode = document.getElementById('image-mode').checked;
        localStorage.setItem('${imageModeName}', imageMode.toString());
        
        // 保存无视频模式设置
        const videoMode = document.getElementById('video-mode').checked;
        localStorage.setItem('video_mode', videoMode.toString());
        
        // 保存媒体类型拦截设置
        const mediaTypes = {
            jpg: document.getElementById('block-jpg').checked,
            png: document.getElementById('block-png').checked,
            gif: document.getElementById('block-gif').checked,
            webp: document.getElementById('block-webp').checked,
            svg: document.getElementById('block-svg').checked,
            mp4: document.getElementById('block-mp4').checked,
            webm: document.getElementById('block-webm').checked,
            mp3: document.getElementById('block-mp3').checked
        };
        localStorage.setItem('block_media_types', JSON.stringify(mediaTypes));
        
        // 保存请求修改器设置
        const requestModifier = document.getElementById('request-modifier').checked;
        localStorage.setItem('${requestModifierName}', requestModifier.toString());
        
        // 保存自定义CSS
        const customCSS = document.getElementById('custom-css').value.trim();
        localStorage.setItem('custom_css', customCSS);
        
        // 保存网站补丁
        const websitePatch = document.getElementById('website-patch').value;
        localStorage.setItem('website_patch', websitePatch);
        
        // 应用设置
        applyAllSettings();
        
        showNotification('设置已保存', 'success');
        
        setTimeout(() => {
            closeAllModals();
            // 如果启用了无图模式，刷新页面
            if (imageMode || videoMode) {
                showNotification('页面即将刷新以应用媒体拦截设置', 'info');
                setTimeout(() => window.location.reload(), 1000);
            }
        }, 500);
        
    } catch (e) {
        showNotification('保存设置失败: ' + e.message, 'error');
    }
}

function applyAllSettings() {
    // 应用自定义CSS
    applyCustomCSS();
    
    // 应用媒体拦截
    applyMediaBlocking();
    
    // 应用网站补丁
    applyWebsitePatch();
}

function applyCustomCSS() {
    // 移除现有的自定义CSS
    const existingStyle = document.getElementById('proxy-custom-css');
    if (existingStyle) existingStyle.remove();
    
    const customCSS = localStorage.getItem('custom_css');
    if (customCSS) {
        const style = document.createElement('style');
        style.id = 'proxy-custom-css';
        style.textContent = customCSS;
        document.head.appendChild(style);
    }
}

function applyMediaBlocking() {
    const imageMode = localStorage.getItem('${imageModeName}') === 'true';
    const videoMode = localStorage.getItem('video_mode') === 'true';
    const mediaTypes = JSON.parse(localStorage.getItem('block_media_types') || '{}');
    
    if (!imageMode && !videoMode) return;
    
    // 拦截图片和视频请求
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'];
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];
    
    // 过滤需要拦截的扩展名
    const blockedImageExts = imageExtensions.filter(ext => mediaTypes[ext] !== false);
    const blockedVideoExts = videoExtensions.filter(ext => mediaTypes[ext] !== false);
    const blockedAudioExts = audioExtensions.filter(ext => mediaTypes[ext] !== false);
    
    const blockedPatterns = [];
    if (imageMode) blockedPatterns.push(...blockedImageExts);
    if (videoMode) {
        blockedPatterns.push(...blockedVideoExts);
        blockedPatterns.push(...blockedAudioExts);
    }
    
    if (blockedPatterns.length === 0) return;
    
    const regex = new RegExp(\`\\\\.(\${blockedPatterns.join('|')})(?:\\\\?.*)?$\`, 'i');
    
    // 拦截图片加载
    document.querySelectorAll('img').forEach(img => {
        if (regex.test(img.src)) {
            img.style.display = 'none';
        }
    });
    
    // 拦截视频加载
    document.querySelectorAll('video, audio').forEach(media => {
        if (regex.test(media.src)) {
            media.style.display = 'none';
        }
    });
    
    // 拦截背景图片
    document.querySelectorAll('*').forEach(element => {
        const bgImage = window.getComputedStyle(element).backgroundImage;
        if (bgImage && bgImage !== 'none' && regex.test(bgImage)) {
            element.style.backgroundImage = 'none';
        }
    });
}

function applyWebsitePatch() {
    const patch = localStorage.getItem('website_patch');
    if (!patch) return;
    
    const currentHost = window.location.hostname;
    
    switch(patch) {
        case 'google':
            if (currentHost.includes('google')) {
                // Google 特定修复
                const style = document.createElement('style');
                style.textContent = \`
                    /* Google 服务样式修复 */
                    .g3VIld { max-width: none !important; }
                    .UXf1P { overflow: visible !important; }
                \`;
                document.head.appendChild(style);
            }
            break;
            
        case 'youtube':
            if (currentHost.includes('youtube')) {
                // YouTube 特定修复
                const style = document.createElement('style');
                style.textContent = \`
                    /* YouTube 样式修复 */
                    #masthead-container { position: relative !important; }
                    ytd-app { --app-drawer-width: 0px !important; }
                \`;
                document.head.appendChild(style);
            }
            break;
            
        case 'custom':
            // 自定义补丁
            break;
    }
}

function checkAllSettings() {
    const resultContainer = document.getElementById('settings-check-result');
    resultContainer.innerHTML = '<div class="check-status check-loading">🔍 检查所有功能...</div>';
    
    setTimeout(() => {
        const checks = [];
        
        // 检查Cookie注入
        const cookieSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
        checks.push({
            name: 'Cookie注入',
            status: Object.keys(cookieSettings).length > 0 ? 'success' : 'info',
            message: Object.keys(cookieSettings).length > 0 ? 
                \`已配置 \${Object.keys(cookieSettings).length} 个网站的Cookie\` : '未配置Cookie注入'
        });
        
        // 检查广告拦截
        const adBlockEnabled = localStorage.getItem('${adBlockEnabledName}') === 'true';
        const adBlockRules = JSON.parse(localStorage.getItem('adblock_rules') || '[]');
        checks.push({
            name: '广告拦截',
            status: adBlockEnabled ? 'success' : 'info',
            message: adBlockEnabled ? 
                \`已启用，\${adBlockRules.length} 条规则\` : '已禁用'
        });
        
        // 检查资源嗅探
        const snifferEnabled = localStorage.getItem('${resourceSnifferName}') === 'true';
        const snifferActive = localStorage.getItem('sniffer_active') === 'true';
        checks.push({
            name: '资源嗅探',
            status: snifferEnabled ? (snifferActive ? 'success' : 'warning') : 'info',
            message: snifferEnabled ? 
                (snifferActive ? '已启用并运行中' : '已启用但未运行') : '已禁用'
        });
        
        // 检查无图模式
        const imageMode = localStorage.getItem('${imageModeName}') === 'true';
        checks.push({
            name: '无图模式',
            status: imageMode ? 'success' : 'info',
            message: imageMode ? '已启用' : '已禁用'
        });
        
        // 检查请求修改器
        const requestModifier = localStorage.getItem('${requestModifierName}') === 'true';
        const modifiers = JSON.parse(localStorage.getItem('sniffer_modifiers') || '[]');
        checks.push({
            name: '请求修改器',
            status: requestModifier ? 'success' : 'info',
            message: requestModifier ? 
                \`已启用，\${modifiers.length} 条规则\` : '已禁用'
        });
        
        // 检查用户代理
        const userAgent = localStorage.getItem('${userAgentName}') || 'default';
        checks.push({
            name: '用户代理',
            status: userAgent !== 'default' ? 'success' : 'info',
            message: userAgent !== 'default' ? \`已设置: \${userAgent}\` : '使用默认'
        });
        
        // 生成结果HTML
        let resultHTML = '';
        checks.forEach(check => {
            const statusColor = check.status === 'success' ? '#4caf50' : 
                              check.status === 'warning' ? '#ff9800' : '#2196f3';
            const statusIcon = check.status === 'success' ? '✅' : 
                             check.status === 'warning' ? '⚠️' : 'ℹ️';
            
            resultHTML += \`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1);">
                <span style="color:#e0e0e0;font-size:13px;">\${check.name}</span>
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="color:\${statusColor};font-size:12px;">\${check.message}</span>
                    <span style="font-size:14px;">\${statusIcon}</span>
                </div>
            </div>
            \`;
        });
        
        resultContainer.innerHTML = resultHTML;
        
    }, 1500);
}

function resetAllSettings() {
    if (confirm('确定要重置所有设置吗？此操作不可恢复。')) {
        try {
            // 清除所有相关设置
            const settingsToClear = [
                '${cookieInjectionDataName}',
                '${adBlockEnabledName}',
                '${resourceSnifferName}',
                '${imageModeName}',
                '${requestModifierName}',
                '${userAgentName}',
                '${languageName}',
                'adblock_rules',
                'adblock_rule_settings',
                'adblock_custom_rules',
                'adblock_marked_elements',
                'sniffer_filters',
                'sniffer_url_filter',
                'sniffer_auto_start',
                'sniffer_captured',
                'sniffer_modifiers',
                'sniffer_active',
                'custom_user_agent',
                'custom_language',
                'video_mode',
                'block_media_types',
                'custom_css',
                'website_patch'
            ];
            
            settingsToClear.forEach(key => {
                localStorage.removeItem(key);
            });
            
            showNotification('所有设置已重置', 'success');
            
            // 重新加载设置
            setTimeout(() => {
                closeAllModals();
                window.location.reload();
            }, 1000);
            
        } catch (e) {
            showNotification('重置设置失败: ' + e.message, 'error');
        }
    }
}
`;

// =======================================================================================
// 第九部分：初始化系统
// 功能：在页面加载时初始化所有系统
// =======================================================================================

const initializationSystem = `
// 初始化系统
function initializeProxySystem() {
    // 注入全局样式
    document.head.insertAdjacentHTML('beforeend', toolbarStyles);
    
    // 初始化工具栏
    createMainToolbar();
    
    // 加载所有设置
    loadAllSettings();
    
    // 应用所有设置
    applyAllSettings();
    
    // 启动广告拦截
    if (localStorage.getItem('${adBlockEnabledName}') === 'true') {
        startAdBlocking();
    }
    
    // 启动资源嗅探
    if (localStorage.getItem('${resourceSnifferName}') === 'true' && 
        localStorage.getItem('sniffer_auto_start') === 'true') {
        setTimeout(() => {
            startResourceSniffing();
        }, 1000);
    }
    
    console.log('代理系统初始化完成');
}

function loadAllSettings() {
    // 所有设置都在各自的系统中加载
    // 这里主要初始化一些全局状态
    adBlockEnabled = localStorage.getItem('${adBlockEnabledName}') === 'true';
    resourceSnifferEnabled = localStorage.getItem('${resourceSnifferName}') === 'true';
    
    // 加载广告拦截规则
    try {
        adBlockRules = JSON.parse(localStorage.getItem('adblock_rules') || '[]');
    } catch (e) {
        adBlockRules = [];
    }
    
    // 加载标记元素
    try {
        const markedSelectors = JSON.parse(localStorage.getItem('adblock_marked_elements') || '[]');
        markedSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    selectedAdElements.add(el);
                    el.style.display = 'none';
                });
            } catch (e) {
                // 忽略无效选择器
            }
        });
    } catch (e) {
        // 忽略错误
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProxySystem);
} else {
    setTimeout(initializeProxySystem, 100);
}
`;

// =======================================================================================
// 第十部分：主请求处理函数
// 功能：处理所有代理请求，应用各种修改和注入
// =======================================================================================

async function handleRequest(request) {
  const url = new URL(request.url);
  const actualUrlStr = url.pathname.slice(1) + url.search + url.hash;
  
  // 密码验证
  if (showPasswordPage && !await verifyPassword(request)) {
    return showPasswordPageFunc(url);
  }
  
  // 代理请求处理
  if (actualUrlStr) {
    try {
      const actualUrl = new URL(actualUrlStr);
      const modifiedRequest = await modifyRequest(request, actualUrl);
      const response = await fetch(modifiedRequest);
      
      // 保存访问记录
      await saveVisitRecord(actualUrl.hostname);
      
      // 修改响应
      return await modifyResponse(response, actualUrl);
      
    } catch (error) {
      return new Response('Error: ' + error.message, { status: 500 });
    }
  }
  
  // 显示主页
  return showMainPage();
}

// 密码验证函数
async function verifyPassword(request) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = new Map(cookieHeader.split(';').map(c => {
    const [key, ...values] = c.trim().split('=');
    return [key, values.join('=')];
  }));
  
  if (cookies.get(passwordCookieName) === password) {
    return true;
  }
  
  const url = new URL(request.url);
  return url.searchParams.get('password') === password;
}

// 密码页面
function showPasswordPageFunc(url) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Password Required</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 500px; margin: 100px auto; padding: 20px; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; }
            input[type="password"] { width: 100%; padding: 8px; box-sizing: border-box; }
            button { background: #007cba; color: white; padding: 10px 20px; border: none; cursor: pointer; }
        </style>
    </head>
    <body>
        <h2>Password Required</h2>
        <form method="GET">
            <div class="form-group">
                <label for="password">Enter Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Submit</button>
        </form>
    </body>
    </html>
  `;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// 修改请求
async function modifyRequest(originalRequest, actualUrl) {
  const headers = new Headers(originalRequest.headers);
  
  // 应用用户代理设置
  const userAgent = await getUserAgent();
  if (userAgent) {
    headers.set('User-Agent', userAgent);
  }
  
  // 应用语言设置
  const language = await getLanguage();
  if (language) {
    headers.set('Accept-Language', language);
  }
  
  // 移除可能引起问题的头
  headers.delete('Referer');
  headers.delete('Origin');
  
  // 创建新请求
  return new Request(actualUrl, {
    method: originalRequest.method,
    headers: headers,
    body: originalRequest.body,
    redirect: 'manual'
  });
}

// 获取用户代理
async function getUserAgent() {
  const userAgent = await localStorage.getItem(userAgentName);
  if (userAgent === 'default' || !userAgent) return null;
  
  const userAgents = {
    'chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'chrome-mac': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'firefox': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'safari': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'edge': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
    'mobile': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36'
  };
  
  if (userAgent === 'custom') {
    return await localStorage.getItem('custom_user_agent');
  }
  
  return userAgents[userAgent] || null;
}

// 获取语言设置
async function getLanguage() {
  const language = await localStorage.getItem(languageName);
  if (language === 'default' || !language) return null;
  
  if (language === 'custom') {
    return await localStorage.getItem('custom_language');
  }
  
  return language;
}

// 修改响应
async function modifyResponse(originalResponse, actualUrl) {
  const contentType = originalResponse.headers.get('Content-Type') || '';
  
  if (contentType.includes('text/html')) {
    const html = await originalResponse.text();
    const modifiedHtml = modifyHtml(html, actualUrl);
    
    return new Response(modifiedHtml, {
      status: originalResponse.status,
      statusText: originalResponse.statusText,
      headers: originalResponse.headers
    });
  }
  
  return originalResponse;
}

// 修改HTML内容
function modifyHtml(html, actualUrl) {
  // 注入代理提示（如果未禁用）
  if (!isHintDisabled()) {
    html = html.replace(/<head>/, `<head><script>${proxyHintInjection}</script>`);
  }
  
  // 注入工具栏系统
  html = html.replace(/<head>/, `<head>
    <script>
      ${toolbarSystem}
      ${cookieInjectionSystem}
      ${adBlockSystem}
      ${resourceSnifferSystem}
      ${settingsSystem}
      ${initializationSystem}
    </script>
  `);
  
  // 修复相对链接
  html = html.replace(/(href|src)=("|')\/([^"']*)/g, `$1=$2/${thisProxyServerUrl_hostOnly}/$3`);
  html = html.replace(/(href|src)=("|')(?!(http|\/))([^"']*)/g, `$1=$2/${thisProxyServerUrl_hostOnly}/${actualUrl.origin}/$4`);
  
  return html;
}

// 检查是否禁用提示
function isHintDisabled() {
  return localStorage.getItem(noHintCookieName) === '1';
}

// 保存访问记录
async function saveVisitRecord(hostname) {
  const visits = JSON.parse(await localStorage.getItem(lastVisitProxyCookie) || '[]');
  if (!visits.includes(hostname)) {
    visits.push(hostname);
    await localStorage.setItem(lastVisitProxyCookie, JSON.stringify(visits.slice(-50)));
  }
}

// 显示主页面
function showMainPage() {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Web Proxy</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .form-group { margin-bottom: 15px; }
            input[type="url"] { width: 100%; padding: 10px; box-sizing: border-box; }
            button { background: #007cba; color: white; padding: 10px 20px; border: none; cursor: pointer; }
            .recent-visits { margin-top: 30px; }
            .visit-item { padding: 5px 0; border-bottom: 1px solid #eee; }
        </style>
    </head>
    <body>
        <h1>Web Proxy</h1>
        <form method="GET">
            <div class="form-group">
                <label for="url">Enter URL to visit:</label>
                <input type="url" id="url" name="url" placeholder="https://example.com" required>
            </div>
            <button type="submit">Visit</button>
        </form>
        
        <div class="recent-visits">
            <h3>Recent Visits</h3>
            <div id="recent-list"></div>
        </div>
        
        <script>
            // 显示最近访问
            const visits = JSON.parse(localStorage.getItem('${lastVisitProxyCookie}') || '[]');
            const list = document.getElementById('recent-list');
            if (visits.length > 0) {
                visits.reverse().forEach(visit => {
                    const item = document.createElement('div');
                    item.className = 'visit-item';
                    item.innerHTML = \`<a href="/\${visit}">\${visit}</a>\`;
                    list.appendChild(item);
                });
            } else {
                list.innerHTML = '<p>No recent visits</p>';
            }
        </script>
    </body>
    </html>
  `;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// =======================================================================================
// 第十一部分：localStorage 模拟（用于 Cloudflare Workers）
// 功能：在 Workers 环境中模拟 localStorage 功能
// =======================================================================================

// 注意：在 Cloudflare Workers 中，我们需要使用其他方式存储数据
// 这里使用 Workers KV 或其他存储方案，这里简化为内存存储
const localStorage = {
  data: new Map(),
  
  getItem(key) {
    return this.data.get(key) || null;
  },
  
  setItem(key, value) {
    this.data.set(key, value);
  },
  
  removeItem(key) {
    this.data.delete(key);
  },
  
  clear() {
    this.data.clear();
  }
};

// 初始化一些默认值
localStorage.setItem(lastVisitProxyCookie, '[]');
localStorage.setItem(noHintCookieName, '0');
localStorage.setItem(adBlockEnabledName, 'false');
localStorage.setItem(imageModeName, 'false');
localStorage.setItem(resourceSnifferName, 'false');
localStorage.setItem(requestModifierName, 'false');
localStorage.setItem(userAgentName, 'default');
localStorage.setItem(languageName, 'zh-CN');

[file content end]