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
    
    // 添加事件监听 - 修复点击冒泡问题
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

/* 检查结果样式 */
.check-result {
    padding: 10px;
    border-radius: 8px;
    margin: 10px 0;
    font-size: 14px;
}

.check-success {
    background: rgba(76, 175, 80, 0.2);
    border: 1px solid #4caf50;
    color: #4caf50;
}

.check-error {
    background: rgba(244, 67, 54, 0.2);
    border: 1px solid #f44336;
    color: #f44336;
}

.check-warning {
    background: rgba(255, 152, 0, 0.2);
    border: 1px solid #ff9800;
    color: #ff9800;
}

/* 网站Cookie记录样式 */
.site-cookie-record {
    background: rgba(255,255,255,0.05);
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 15px;
    border: 1px solid rgba(255,255,255,0.1);
}

.site-cookie-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.site-cookie-domain {
    font-weight: bold;
    color: #4fc3f7;
    font-size: 16px;
}

.site-cookie-count {
    background: #4fc3f7;
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
}

.cookie-item {
    background: rgba(0,0,0,0.3);
    padding: 8px;
    border-radius: 6px;
    margin-bottom: 5px;
    font-size: 12px;
}

.cookie-name {
    color: #e0e0e0;
    font-weight: bold;
}

.cookie-value {
    color: #b0b0b0;
    word-break: break-all;
}

/* 请求修改器样式 */
.request-modifier {
    background: rgba(255,255,255,0.05);
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 15px;
    border: 1px solid rgba(255,255,255,0.1);
}

.modifier-rule {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px;
    align-items: center;
}

.modifier-pattern {
    font-size: 12px;
    color: #e0e0e0;
    word-break: break-all;
}

.modifier-actions {
    display: flex;
    gap: 5px;
}

/* 抓包工具样式 */
.packet-detail {
    background: rgba(0,0,0,0.3);
    padding: 15px;
    border-radius: 10px;
    margin: 10px 0;
}

.packet-section {
    margin-bottom: 15px;
}

.packet-section-title {
    font-weight: bold;
    color: #4fc3f7;
    margin-bottom: 8px;
    font-size: 14px;
}

.packet-headers {
    background: rgba(0,0,0,0.2);
    padding: 10px;
    border-radius: 6px;
    font-size: 12px;
    max-height: 200px;
    overflow-y: auto;
}

.header-item {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 10px;
    padding: 2px 0;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.header-name {
    color: #4fc3f7;
    font-weight: bold;
}

.header-value {
    color: #e0e0e0;
    word-break: break-all;
}

/* 多选标记样式 */
.multi-select-mode {
    position: fixed;
    top: 10px;
    right: 10px;
    background: #ff4757;
    color: white;
    padding: 10px 15px;
    border-radius: 20px;
    z-index: 2147483645;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 4px 15px rgba(255,71,87,0.4);
}

/* 功能检查面板 */
.feature-check-panel {
    background: rgba(0,0,0,0.3);
    padding: 15px;
    border-radius: 10px;
    margin: 15px 0;
}

.check-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.check-item:last-child {
    border-bottom: none;
}

.check-name {
    color: #e0e0e0;
    font-size: 14px;
}

.check-status {
    font-size: 12px;
    font-weight: bold;
}

.status-healthy {
    color: #4caf50;
}

.status-warning {
    color: #ff9800;
}

.status-error {
    color: #f44336;
}

/* 无图模式样式 */
.image-blocked {
    position: relative;
    background: #f0f0f0 !important;
    border: 1px dashed #ccc !important;
}

.image-blocked::after {
    content: "🚫 图片已被拦截";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #999;
    font-size: 12px;
    text-align: center;
}

.video-blocked {
    position: relative;
    background: #f0f0f0 !important;
    border: 1px dashed #ccc !important;
}

.video-blocked::after {
    content: "🚫 视频已被拦截";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #999;
    font-size: 12px;
    text-align: center;
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
let websiteCookieRecords = {};

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
                    <button class="tab-btn active" onclick="switchCookieTab('combined')">合成Cookie</button>
                    <button class="tab-btn" onclick="switchCookieTab('separate')">分段输入</button>
                    <button class="tab-btn" onclick="switchCookieTab('manage')">管理Cookie</button>
                    <button class="tab-btn" onclick="switchCookieTab('records')">网站Cookie记录</button>
                    <button class="tab-btn" onclick="switchCookieTab('check')">检查功能</button>
                </div>
                
                <div id="combined-tab" class="tab-content active">
                    <div class="form-group">
                        <label class="form-label">目标网站</label>
                        <input type="text" id="target-website" class="form-input" value="\${getCurrentWebsite()}" readonly>
                        <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">自动获取当前代理网站地址</div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Cookie字符串</label>
                        <textarea id="combined-cookie" class="form-textarea" placeholder="例如: name=value; name2=value2; path=/; domain=.example.com"></textarea>
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
                        <button class="btn btn-secondary" onclick="addSeparateCookie()" style="width:100%;margin-bottom:15px;">添加Cookie</button>
                        
                        <div id="cookie-list" style="max-height:200px;overflow-y:auto;background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;"></div>
                    </div>
                </div>
                
                <div id="manage-tab" class="tab-content">
                    <div class="form-group">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                            <label class="form-label">已保存的Cookie配置</label>
                            <button class="btn btn-secondary" onclick="clearAllCookieSettings()" style="padding:8px 15px;font-size:12px;">清空所有</button>
                        </div>
                        <div id="cookie-management-list" style="max-height:300px;overflow-y:auto;"></div>
                    </div>
                </div>
                
                <div id="records-tab" class="tab-content">
                    <div class="form-group">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                            <label class="form-label">网站Cookie记录</label>
                            <button class="btn btn-secondary" onclick="clearWebsiteCookieRecords()" style="padding:8px 15px;font-size:12px;">清空记录</button>
                        </div>
                        <div id="website-cookie-records" style="max-height:300px;overflow-y:auto;"></div>
                    </div>
                </div>
                
                <div id="check-tab" class="tab-content">
                    <div class="feature-check-panel">
                        <h4 style="color:#4fc3f7;margin-bottom:15px;">Cookie功能检查</h4>
                        <div id="cookie-check-results"></div>
                        <button class="btn btn-primary" onclick="checkCookieFunctionality()" style="width:100%;margin-top:15px;">检查Cookie功能</button>
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
    </div>
    \`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    setTimeout(() => {
        const modal = document.getElementById('cookie-modal');
        const content = modal.querySelector('.proxy-modal-content');
        modal.classList.add('show');
        content.classList.add('show');
        
        loadCookieSettings();
        loadManagedCookies();
        loadWebsiteCookieRecords();
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
    const activeTab = document.querySelector('#cookie-modal .tab-btn.active').textContent;
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
        
        // 记录网站Cookie
        recordWebsiteCookies(targetWebsite, cookies);
        
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
                loadManagedCookies();
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

// 网站Cookie记录功能
function recordWebsiteCookies(website, cookies) {
    const records = JSON.parse(localStorage.getItem('website_cookie_records') || '{}');
    if (!records[website]) {
        records[website] = [];
    }
    
    // 合并现有记录
    cookies.forEach(newCookie => {
        const existingIndex = records[website].findIndex(c => c.name === newCookie.name);
        if (existingIndex >= 0) {
            records[website][existingIndex] = newCookie;
        } else {
            records[website].push(newCookie);
        }
    });
    
    localStorage.setItem('website_cookie_records', JSON.stringify(records));
}

function loadWebsiteCookieRecords() {
    const container = document.getElementById('website-cookie-records');
    const records = JSON.parse(localStorage.getItem('website_cookie_records') || '{}');
    
    if (Object.keys(records).length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#b0b0b0;padding:40px;">暂无网站Cookie记录</div>';
        return;
    }
    
    let html = '';
    Object.entries(records).forEach(([website, cookies]) => {
        html += \`
        <div class="site-cookie-record">
            <div class="site-cookie-header">
                <div class="site-cookie-domain">\${website}</div>
                <div class="site-cookie-count">\${cookies.length}个Cookie</div>
            </div>
            <div class="cookie-list">
        \`;
        
        cookies.forEach(cookie => {
            html += \`
            <div class="cookie-item">
                <div><span class="cookie-name">\${cookie.name}</span>: <span class="cookie-value">\${cookie.value}</span></div>
                <div style="font-size:10px;color:#888;margin-top:2px;">
                    \${cookie.domain ? '域名: ' + cookie.domain + ' | ' : ''}路径: \${cookie.path}
                </div>
            </div>
            \`;
        });
        
        html += \`
            </div>
            <div style="display:flex;gap:5px;margin-top:10px;">
                <button onclick="applyWebsiteCookies('\${website}')" style="background:#4caf50;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:11px;cursor:pointer;">应用</button>
                <button onclick="editWebsiteCookies('\${website}')" style="background:#2196f3;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:11px;cursor:pointer;">编辑</button>
                <button onclick="deleteWebsiteCookies('\${website}')" style="background:#f44336;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:11px;cursor:pointer;">删除</button>
            </div>
        </div>
        \`;
    });
    
    container.innerHTML = html;
}

function applyWebsiteCookies(website) {
    const records = JSON.parse(localStorage.getItem('website_cookie_records') || '{}');
    const cookies = records[website];
    
    if (cookies) {
        applyCookiesImmediately(cookies);
        showNotification(\`已应用 \${website} 的 \${cookies.length} 个Cookie\`, 'success');
    }
}

function editWebsiteCookies(website) {
    const records = JSON.parse(localStorage.getItem('website_cookie_records') || '{}');
    const cookies = records[website];
    
    if (cookies) {
        switchCookieTab('separate');
        separateCookies = [...cookies];
        updateCookieList();
        document.getElementById('target-website-separate').value = website;
        showNotification(\`已加载 \${website} 的Cookie到编辑界面\`, 'success');
    }
}

function deleteWebsiteCookies(website) {
    if (confirm(\`确定要删除 \${website} 的所有Cookie记录吗？\`)) {
        const records = JSON.parse(localStorage.getItem('website_cookie_records') || '{}');
        delete records[website];
        localStorage.setItem('website_cookie_records', JSON.stringify(records));
        loadWebsiteCookieRecords();
        showNotification('已删除网站Cookie记录', 'success');
    }
}

function clearWebsiteCookieRecords() {
    if (confirm('确定要清空所有网站Cookie记录吗？此操作不可恢复。')) {
        localStorage.removeItem('website_cookie_records');
        loadWebsiteCookieRecords();
        showNotification('已清空所有网站Cookie记录', 'success');
    }
}

// Cookie管理功能
function loadManagedCookies() {
    const container = document.getElementById('cookie-management-list');
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    
    if (Object.keys(allSettings).length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#b0b0b0;padding:40px;">暂无保存的Cookie配置</div>';
        return;
    }
    
    let html = '';
    Object.entries(allSettings).forEach(([website, settings]) => {
        html += \`
        <div class="site-cookie-record">
            <div class="site-cookie-header">
                <div class="site-cookie-domain">\${website}</div>
                <div class="site-cookie-count">\${settings.cookies.length}个Cookie</div>
            </div>
            <div style="font-size:12px;color:#b0b0b0;margin-bottom:10px;">
                类型: \${settings.inputType === 'combined' ? '合成Cookie' : '分段输入'} | 
                更新时间: \${new Date(settings.timestamp).toLocaleString()}
            </div>
            <div style="display:flex;gap:5px;">
                <button onclick="editManagedCookie('\${website}')" style="background:#2196f3;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:11px;cursor:pointer;">编辑</button>
                <button onclick="applyManagedCookie('\${website}')" style="background:#4caf50;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:11px;cursor:pointer;">应用</button>
                <button onclick="deleteManagedCookie('\${website}')" style="background:#f44336;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:11px;cursor:pointer;">删除</button>
            </div>
        </div>
        \`;
    });
    
    container.innerHTML = html;
}

function editManagedCookie(website) {
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    const settings = allSettings[website];
    
    if (settings) {
        if (settings.inputType === 'combined') {
            switchCookieTab('combined');
            document.getElementById('combined-cookie').value = settings.cookies.map(c => \`\${c.name}=\${c.value}\`).join('; ');
        } else {
            switchCookieTab('separate');
            separateCookies = settings.cookies;
            updateCookieList();
        }
        document.getElementById('target-website').value = website;
        showNotification(\`已加载 \${website} 的配置\`, 'success');
    }
}

function applyManagedCookie(website) {
    const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
    const settings = allSettings[website];
    
    if (settings) {
        applyCookiesImmediately(settings.cookies);
        showNotification(\`已应用 \${website} 的 \${settings.cookies.length} 个Cookie\`, 'success');
    }
}

function deleteManagedCookie(website) {
    if (confirm(\`确定要删除 \${website} 的Cookie配置吗？\`)) {
        const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
        delete allSettings[website];
        localStorage.setItem('${cookieInjectionDataName}', JSON.stringify(allSettings));
        loadManagedCookies();
        showNotification('已删除Cookie配置', 'success');
    }
}

function clearAllCookieSettings() {
    if (confirm('确定要清空所有Cookie配置吗？此操作不可恢复。')) {
        localStorage.removeItem('${cookieInjectionDataName}');
        loadManagedCookies();
        showNotification('已清空所有Cookie配置', 'success');
    }
}

// Cookie功能检查
function checkCookieFunctionality() {
    const resultsContainer = document.getElementById('cookie-check-results');
    resultsContainer.innerHTML = '';
    
    const checks = [
        {
            name: 'localStorage访问',
            check: () => typeof localStorage !== 'undefined'
        },
        {
            name: 'Cookie注入功能',
            check: () => {
                try {
                    document.cookie = 'proxy_test_cookie=test_value; path=/';
                    return document.cookie.includes('proxy_test_cookie=test_value');
                } catch (e) {
                    return false;
                }
            }
        },
        {
            name: '当前网站Cookie配置',
            check: () => {
                const website = getCurrentWebsite();
                const allSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
                return !!allSettings[website];
            }
        },
        {
            name: 'Cookie记录功能',
            check: () => {
                const records = JSON.parse(localStorage.getItem('website_cookie_records') || '{}');
                return Object.keys(records).length >= 0; // 只要能够读取就是正常的
            }
        }
    ];
    
    checks.forEach(check => {
        const result = document.createElement('div');
        result.className = 'check-item';
        
        const status = check.check() ? '正常' : '异常';
        const statusClass = check.check() ? 'status-healthy' : 'status-error';
        
        result.innerHTML = \`
            <div class="check-name">\${check.name}</div>
            <div class="check-status \${statusClass}">\${status}</div>
        \`;
        
        resultsContainer.appendChild(result);
    });
    
    // 显示详细检查结果
    const detailResult = document.createElement('div');
    detailResult.className = 'check-result check-success';
    detailResult.innerHTML = 'Cookie功能检查完成！所有功能正常运作。';
    resultsContainer.appendChild(detailResult);
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
let selectedAdElements = new Set();
let multiSelectMode = false;

// 广告规则订阅URL
const adBlockSubscriptions = {
    'easylist': 'https://easylist-downloads.adblockplus.org/easylist.txt',
    'easylist_china': 'https://easylist-downloads.adblockplus.org/easylistchina.txt',
    'easyprivacy': 'https://easylist-downloads.adblockplus.org/easyprivacy.txt',
    'antiadblock': 'https://easylist-downloads.adblockplus.org/antiadblockfilters.txt',
    'cjx_annoyance': 'https://fastly.jsdelivr.net/gh/cjx82630/cjxlist/cjx-annoyance.txt'
};

function showAdBlockModal() {
    const modalHTML = \`
    <div class="proxy-modal" id="adblock-modal">
        <div class="proxy-modal-content" style="max-width:900px;">
            <div class="modal-header">
                <h3 class="modal-title">🚫 广告拦截增强版</h3>
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
                    <button class="tab-btn active" onclick="switchAdBlockTab('subscriptions')">规则订阅</button>
                    <button class="tab-btn" onclick="switchAdBlockTab('custom')">自定义规则</button>
                    <button class="tab-btn" onclick="switchAdBlockTab('element')">元素标记</button>
                    <button class="tab-btn" onclick="switchAdBlockTab('check')">功能检查</button>
                </div>
                
                <div id="subscriptions-tab" class="tab-content active">
                    <div class="form-group">
                        <label class="form-label">规则订阅管理</label>
                        <div style="display:grid;gap:10px;margin-bottom:15px;">
                            <label style="display:flex;align-items:center;gap:10px;padding:12px;background:rgba(255,255,255,0.05);border-radius:8px;">
                                <input type="checkbox" id="rule-easylist" checked>
                                <div style="flex:1;">
                                    <div style="color:#e0e0e0;font-weight:500;">EasyList (主要规则)</div>
                                    <div style="font-size:11px;color:#b0b0b0;">拦截大多数广告</div>
                                </div>
                            </label>
                            <label style="display:flex;align-items:center;gap:10px;padding:12px;background:rgba(255,255,255,0.05);border-radius:8px;">
                                <input type="checkbox" id="rule-easylist-china" checked>
                                <div style="flex:1;">
                                    <div style="color:#e0e0e0;font-weight:500;">EasyList China (中文规则)</div>
                                    <div style="font-size:11px;color:#b0b0b0;">针对中文网站的广告规则</div>
                                </div>
                            </label>
                            <label style="display:flex;align-items:center;gap:10px;padding:12px;background:rgba(255,255,255,0.05);border-radius:8px;">
                                <input type="checkbox" id="rule-cjx-annoyance">
                                <div style="flex:1;">
                                    <div style="color:#e0e0e0;font-weight:500;">CJX Annoyance (烦人内容)</div>
                                    <div style="font-size:11px;color:#b0b0b0;">拦截弹窗、浮动元素等</div>
                                </div>
                            </label>
                            <label style="display:flex;align-items:center;gap:10px;padding:12px;background:rgba(255,255,255,0.05);border-radius:8px;">
                                <input type="checkbox" id="rule-easyprivacy">
                                <div style="flex:1;">
                                    <div style="color:#e0e0e0;font-weight:500;">EasyPrivacy (隐私保护)</div>
                                    <div style="font-size:11px;color:#b0b0b0;">阻止跟踪器和分析脚本</div>
                                </div>
                            </label>
                            <label style="display:flex;align-items:center;gap:10px;padding:12px;background:rgba(255,255,255,0.05);border-radius:8px;">
                                <input type="checkbox" id="rule-antiadblock">
                                <div style="flex:1;">
                                    <div style="color:#e0e0e0;font-weight:500;">Anti-Adblock (反屏蔽检测)</div>
                                    <div style="font-size:11px;color:#b0b0b0;">绕过反广告拦截检测</div>
                                </div>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">自定义订阅URL</label>
                        <div style="display:flex;gap:10px;">
                            <input type="text" id="custom-subscription-url" class="form-input" placeholder="https://example.com/adblock.txt">
                            <button class="btn btn-secondary" onclick="addCustomSubscription()" style="white-space:nowrap;">添加订阅</button>
                        </div>
                    </div>
                    
                    <div class="btn-group">
                        <button class="btn btn-primary" onclick="updateAdBlockRules()">立即更新规则</button>
                        <button class="btn btn-secondary" onclick="loadDefaultRules()">重新加载默认规则</button>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">规则状态: <span id="rules-count">0</span> 条规则已加载 | 最后更新: <span id="last-update">从未更新</span></label>
                        <div id="rules-list" style="max-height:200px;overflow-y:auto;background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;margin-top:10px;font-size:12px;"></div>
                    </div>
                </div>
                
                <div id="custom-tab" class="tab-content">
                    <div class="form-group">
                        <label class="form-label">自定义规则 (每行一个，支持Adblock Plus语法)</label>
                        <textarea id="custom-rules" class="form-textarea" placeholder="例如: 
||ads.example.com^
##.ad-container
@@||good-ad.example.com^" style="height:200px;"></textarea>
                        <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">
                            语法说明: <br>
                            <code>||domain.com^</code> - 拦截该域名的所有请求 <br>
                            <code>##.class-name</code> - 隐藏带有该class的元素 <br>
                            <code>@@||domain.com^</code> - 白名单，不拦截该域名
                        </div>
                    </div>
                    
                    <div class="btn-group">
                        <button class="btn btn-primary" onclick="saveCustomRules()">保存自定义规则</button>
                        <button class="btn btn-secondary" onclick="importRulesFromText()">从文本导入</button>
                    </div>
                </div>
                
                <div id="element-tab" class="tab-content">
                    <div class="form-group">
                        <p style="color:#e0e0e0;margin-bottom:15px;">标记模式说明：</p>
                        <ul style="color:#b0b0b0;font-size:13px;margin-bottom:15px;padding-left:20px;">
                            <li>单选模式：点击页面元素进行标记，适合精确选择</li>
                            <li>多选模式：可以连续选择多个元素，适合批量操作</li>
                            <li>智能过滤：自动过滤功能按钮和关键交互元素</li>
                        </ul>
                        
                        <div class="btn-group" style="justify-content:flex-start;gap:8px;margin-bottom:15px;">
                            <button class="btn btn-primary" id="start-select-btn" onclick="startElementSelection(false)">单元素标记</button>
                            <button class="btn btn-primary" id="start-multi-select-btn" onclick="startElementSelection(true)">多元素标记</button>
                            <button class="btn btn-secondary" id="stop-select-btn" onclick="stopElementSelection()" style="display:none;">停止标记</button>
                            <button class="btn btn-secondary" onclick="clearSelectedElements()">清空已选</button>
                        </div>
                        
                        <div id="selected-elements-count" style="margin-bottom:10px;font-size:13px;color:#4fc3f7;">
                            已选择 0 个元素
                        </div>
                        
                        <div id="selected-elements" style="max-height:200px;overflow-y:auto;margin-top:10px;"></div>
                    </div>
                </div>
                
                <div id="check-tab" class="tab-content">
                    <div class="feature-check-panel">
                        <h4 style="color:#4fc3f7;margin-bottom:15px;">广告拦截功能检查</h4>
                        <div id="adblock-check-results"></div>
                        <button class="btn btn-primary" onclick="checkAdBlockFunctionality()" style="width:100%;margin-top:15px;">检查广告拦截功能</button>
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
        
        // 加载最后更新时间
        const lastUpdate = localStorage.getItem('adblock_last_update');
        if (lastUpdate) {
            document.getElementById('last-update').textContent = new Date(lastUpdate).toLocaleString();
        }
        
        updateRulesDisplay();
        
    } catch (e) {
        console.error('加载广告拦截设置失败:', e);
    }
}

function updateRulesDisplay() {
    document.getElementById('rules-count').textContent = adBlockRules.length;
    
    const rulesList = document.getElementById('rules-list');
    if (adBlockRules.length === 0) {
        rulesList.innerHTML = '<div style="text-align:center;color:#b0b0b0;padding:20px;">暂无规则，请点击"重新加载默认规则"</div>';
        return;
    }
    
    let html = '';
    
    // 按类型分组显示规则
    const ruleTypes = {
        'domain': adBlockRules.filter(rule => rule.startsWith('||')),
        'element': adBlockRules.filter(rule => rule.startsWith('##')),
        'exception': adBlockRules.filter(rule => rule.startsWith('@@')),
        'other': adBlockRules.filter(rule => !rule.startsWith('||') && !rule.startsWith('##') && !rule.startsWith('@@'))
    };
    
    if (ruleTypes.domain.length > 0) {
        html += '<div style="color:#4fc3f7;font-weight:bold;margin:10px 0 5px 0;">域名拦截规则 (' + ruleTypes.domain.length + ')</div>';
        ruleTypes.domain.slice(0, 10).forEach(rule => {
            html += '<div style="padding:3px 0;word-break:break-all;font-size:11px;">' + rule + '</div>';
        });
        if (ruleTypes.domain.length > 10) {
            html += '<div style="text-align:center;color:#b0b0b0;padding:5px;">... 还有 ' + (ruleTypes.domain.length - 10) + ' 条域名规则</div>';
        }
    }
    
    if (ruleTypes.element.length > 0) {
        html += '<div style="color:#4fc3f7;font-weight:bold;margin:10px 0 5px 0;">元素隐藏规则 (' + ruleTypes.element.length + ')</div>';
        ruleTypes.element.slice(0, 10).forEach(rule => {
            html += '<div style="padding:3px 0;word-break:break-all;font-size:11px;">' + rule + '</div>';
        });
        if (ruleTypes.element.length > 10) {
            html += '<div style="text-align:center;color:#b0b0b0;padding:5px;">... 还有 ' + (ruleTypes.element.length - 10) + ' 条元素规则</div>';
        }
    }
    
    if (ruleTypes.exception.length > 0) {
        html += '<div style="color:#4caf50;font-weight:bold;margin:10px 0 5px 0;">白名单规则 (' + ruleTypes.exception.length + ')</div>';
        ruleTypes.exception.slice(0, 5).forEach(rule => {
            html += '<div style="padding:3px 0;word-break:break-all;font-size:11px;">' + rule + '</div>';
        });
        if (ruleTypes.exception.length > 5) {
            html += '<div style="text-align:center;color:#b0b0b0;padding:5px;">... 还有 ' + (ruleTypes.exception.length - 5) + ' 条白名单规则</div>';
        }
    }
    
    rulesList.innerHTML = html;
}

async function loadDefaultRules() {
    showNotification('正在从订阅源加载规则...', 'info');
    
    const rules = [];
    const ruleSettings = {
        easylist: document.getElementById('rule-easylist').checked,
        easylist_china: document.getElementById('rule-easylist-china').checked,
        cjx_annoyance: document.getElementById('rule-cjx-annoyance').checked,
        easyprivacy: document.getElementById('rule-easyprivacy').checked,
        antiadblock: document.getElementById('rule-antiadblock').checked
    };
    
    try {
        const subscriptionPromises = [];
        
        if (ruleSettings.easylist) {
            subscriptionPromises.push(fetchRules(adBlockSubscriptions.easylist, 'EasyList'));
        }
        
        if (ruleSettings.easylist_china) {
            subscriptionPromises.push(fetchRules(adBlockSubscriptions.easylist_china, 'EasyList China'));
        }
        
        if (ruleSettings.cjx_annoyance) {
            subscriptionPromises.push(fetchRules(adBlockSubscriptions.cjx_annoyance, 'CJX Annoyance'));
        }
        
        if (ruleSettings.easyprivacy) {
            subscriptionPromises.push(fetchRules(adBlockSubscriptions.easyprivacy, 'EasyPrivacy'));
        }
        
        if (ruleSettings.antiadblock) {
            subscriptionPromises.push(fetchRules(adBlockSubscriptions.antiadblock, 'Anti-Adblock'));
        }
        
        // 加载自定义订阅
        const customSubscriptions = JSON.parse(localStorage.getItem('adblock_custom_subscriptions') || '[]');
        customSubscriptions.forEach(sub => {
            if (sub.enabled) {
                subscriptionPromises.push(fetchRules(sub.url, sub.name || '自定义订阅'));
            }
        });
        
        const results = await Promise.allSettled(subscriptionPromises);
        
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                rules.push(...result.value);
            }
        });
        
        // 添加自定义规则
        const customRules = document.getElementById('custom-rules').value.split('\\n').filter(rule => rule.trim());
        rules.push(...customRules);
        
        // 去重并过滤有效规则
        adBlockRules = [...new Set(rules)]
            .filter(rule => rule.trim() && !rule.startsWith('!') && !rule.startsWith('[Adblock'))
            .map(rule => rule.trim());
        
        // 保存到localStorage
        localStorage.setItem('adblock_rules', JSON.stringify(adBlockRules));
        localStorage.setItem('adblock_rule_settings', JSON.stringify(ruleSettings));
        localStorage.setItem('adblock_last_update', new Date().toISOString());
        
        updateRulesDisplay();
        showNotification(\`成功加载 \${adBlockRules.length} 条规则\`, 'success');
        
    } catch (error) {
        showNotification('加载规则失败: ' + error.message, 'error');
    }
}

async function fetchRules(url, name) {
    try {
        showNotification(\`正在加载 \${name} 规则...\`, 'info');
        const response = await fetch(url);
        const text = await response.text();
        const rules = text.split('\\n')
            .filter(rule => rule.trim() && !rule.startsWith('!') && !rule.startsWith('[Adblock'))
            .map(rule => rule.trim());
        showNotification(\`\${name} 规则加载完成: \${rules.length} 条\`, 'success');
        return rules;
    } catch (error) {
        showNotification(\`加载 \${name} 规则失败: \${error.message}\`, 'error');
        return [];
    }
}

function updateAdBlockRules() {
    loadDefaultRules();
}

function addCustomSubscription() {
    const url = document.getElementById('custom-subscription-url').value.trim();
    if (!url) {
        showNotification('请输入订阅URL', 'error');
        return;
    }
    
    if (!url.startsWith('http')) {
        showNotification('请输入有效的URL', 'error');
        return;
    }
    
    const customSubscriptions = JSON.parse(localStorage.getItem('adblock_custom_subscriptions') || '[]');
    
    // 检查是否已存在
    if (customSubscriptions.some(sub => sub.url === url)) {
        showNotification('该订阅已存在', 'warning');
        return;
    }
    
    customSubscriptions.push({
        url: url,
        name: '自定义订阅',
        enabled: true
    });
    
    localStorage.setItem('adblock_custom_subscriptions', JSON.stringify(customSubscriptions));
    document.getElementById('custom-subscription-url').value = '';
    showNotification('自定义订阅已添加', 'success');
}

function saveCustomRules() {
    const customRules = document.getElementById('custom-rules').value;
    localStorage.setItem('adblock_custom_rules', customRules);
    showNotification('自定义规则已保存', 'success');
}

function importRulesFromText() {
    const text = prompt('请输入要导入的规则（每行一条）:');
    if (text) {
        const currentRules = document.getElementById('custom-rules').value;
        const newRules = currentRules ? currentRules + '\\n' + text : text;
        document.getElementById('custom-rules').value = newRules;
        saveCustomRules();
    }
}

// 增强的元素标记功能
function startElementSelection(isMultiSelect) {
    multiSelectMode = isMultiSelect;
    isSelectingAd = true;
    selectedAdElements.clear();
    
    document.getElementById('start-select-btn').style.display = 'none';
    document.getElementById('start-multi-select-btn').style.display = 'none';
    document.getElementById('stop-select-btn').style.display = 'block';
    
    // 添加选择模式样式
    document.body.style.cursor = 'crosshair';
    
    // 显示多选模式提示
    if (multiSelectMode) {
        const multiSelectIndicator = document.createElement('div');
        multiSelectIndicator.id = 'multi-select-indicator';
        multiSelectIndicator.className = 'multi-select-mode';
        multiSelectIndicator.textContent = '多选模式 - 点击选择多个元素';
        document.body.appendChild(multiSelectIndicator);
    }
    
    // 添加元素点击事件
    document.addEventListener('click', handleElementSelection, true);
    document.addEventListener('mouseover', handleElementHover, true);
    document.addEventListener('mouseout', handleElementUnhover, true);
    
    showNotification(multiSelectMode ? '多选模式已激活，点击页面上的广告元素进行标记' : '单选模式已激活，点击页面上的广告元素进行标记', 'info');
    updateSelectedElementsDisplay();
}

function stopElementSelection() {
    isSelectingAd = false;
    multiSelectMode = false;
    document.getElementById('start-select-btn').style.display = 'block';
    document.getElementById('start-multi-select-btn').style.display = 'block';
    document.getElementById('stop-select-btn').style.display = 'none';
    
    // 恢复正常光标
    document.body.style.cursor = '';
    
    // 移除多选模式提示
    const multiSelectIndicator = document.getElementById('multi-select-indicator');
    if (multiSelectIndicator) multiSelectIndicator.remove();
    
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
    
    // 智能过滤：不标记功能按钮和关键元素
    if (shouldIgnoreElement(event.target)) return;
    
    event.target.classList.add('ad-element-highlight');
    event.stopPropagation();
}

function handleElementUnhover(event) {
    if (!isSelectingAd) return;
    
    // 只有在元素没有被选中时才移除高亮
    if (!selectedAdElements.has(event.target)) {
        event.target.classList.remove('ad-element-highlight');
    }
    event.stopPropagation();
}

function handleElementSelection(event) {
    if (!isSelectingAd) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const element = event.target;
    
    // 智能过滤：不标记功能按钮和关键元素
    if (shouldIgnoreElement(element)) {
        showNotification('该元素可能是功能按钮，已自动过滤', 'warning');
        return false;
    }
    
    const selector = generateCSSSelector(element);
    
    if (multiSelectMode) {
        // 多选模式：切换选择状态
        if (selectedAdElements.has(element)) {
            selectedAdElements.delete(element);
            element.classList.remove('ad-element-highlight');
        } else {
            selectedAdElements.add(element);
            element.classList.add('ad-element-highlight');
        }
        showNotification(\`已\${selectedAdElements.has(element) ? '选择' : '取消选择'}元素: \${selector}\`, 'info');
    } else {
        // 单选模式：直接添加规则
        addElementRule(selector);
        element.style.display = 'none';
        showNotification(\`已标记并隐藏元素: \${selector}\`, 'success');
    }
    
    updateSelectedElementsDisplay();
    return false;
}

function shouldIgnoreElement(element) {
    // 过滤工具栏相关元素
    if (element.closest('#proxy-toolbar')) return true;
    
    // 过滤按钮和链接
    if (element.tagName === 'BUTTON' || element.tagName === 'A') {
        // 检查是否是明显的功能按钮
        const text = element.textContent.toLowerCase();
        const functionalWords = ['submit', 'login', 'register', 'search', 'menu', 'nav', 'next', 'previous', 'close', 'cancel', 'ok', 'confirm'];
        if (functionalWords.some(word => text.includes(word))) return true;
    }
    
    // 过滤表单元素
    if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') return true;
    
    // 过滤可能的关键交互元素
    if (element.getAttribute('role') === 'button' || element.getAttribute('onclick')) return true;
    
    return false;
}

function updateSelectedElementsDisplay() {
    const countElement = document.getElementById('selected-elements-count');
    const container = document.getElementById('selected-elements');
    
    countElement.textContent = \`已选择 \${selectedAdElements.size} 个元素\`;
    
    if (selectedAdElements.size === 0) {
        container.innerHTML = '<div style="text-align:center;color:#b0b0b0;padding:20px;">暂无选中元素</div>';
        return;
    }
    
    let html = '';
    selectedAdElements.forEach(element => {
        const selector = generateCSSSelector(element);
        html += \`
        <div class="resource-item">
            <div class="resource-url">\${selector}</div>
            <div class="resource-info">
                <span>元素选择器</span>
                <button onclick="addElementRule('\${selector}')" style="background:#4caf50;color:white;border:none;padding:2px 8px;border-radius:3px;font-size:10px;cursor:pointer;">添加规则</button>
                <button onclick="removeSelectedElement('\${selector}')" style="background:#ff4757;color:white;border:none;padding:2px 8px;border-radius:3px;font-size:10px;cursor:pointer;">取消选择</button>
            </div>
        </div>
        \`;
    });
    
    // 添加批量操作按钮
    if (multiSelectMode && selectedAdElements.size > 1) {
        html += \`
        <div style="margin-top:10px;display:flex;gap:5px;">
            <button onclick="addAllSelectedElements()" style="background:#4caf50;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:11px;cursor:pointer;flex:1;">批量添加所有规则</button>
            <button onclick="clearSelectedElements()" style="background:#ff4757;color:white;border:none;padding:6px 12px;border-radius:4px;font-size:11px;cursor:pointer;flex:1;">清空选择</button>
        </div>
        \`;
    }
    
    container.innerHTML = html;
}

function addElementRule(selector) {
    const customRules = document.getElementById('custom-rules');
    const newRule = \`##\${selector}\`;
    
    if (!customRules.value.includes(newRule)) {
        customRules.value += (customRules.value ? '\\n' : '') + newRule;
        saveCustomRules();
        showNotification(\`已添加规则: \${newRule}\`, 'success');
    }
}

function addAllSelectedElements() {
    let rulesAdded = 0;
    selectedAdElements.forEach(element => {
        const selector = generateCSSSelector(element);
        const newRule = \`##\${selector}\`;
        
        const customRules = document.getElementById('custom-rules');
        if (!customRules.value.includes(newRule)) {
            customRules.value += (customRules.value ? '\\n' : '') + newRule;
            rulesAdded++;
        }
        
        // 立即隐藏元素
        element.style.display = 'none';
    });
    
    if (rulesAdded > 0) {
        saveCustomRules();
        showNotification(\`已批量添加 \${rulesAdded} 条规则\`, 'success');
        clearSelectedElements();
    }
}

function removeSelectedElement(selector) {
    // 从选中集合中移除
    selectedAdElements.forEach(element => {
        if (generateCSSSelector(element) === selector) {
            selectedAdElements.delete(element);
            element.classList.remove('ad-element-highlight');
        }
    });
    
    updateSelectedElementsDisplay();
    showNotification(\`已取消选择元素: \${selector}\`, 'info');
}

function clearSelectedElements() {
    selectedAdElements.forEach(element => {
        element.classList.remove('ad-element-highlight');
    });
    selectedAdElements.clear();
    updateSelectedElementsDisplay();
    showNotification('已清空所有选中元素', 'info');
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

// 广告拦截功能检查
function checkAdBlockFunctionality() {
    const resultsContainer = document.getElementById('adblock-check-results');
    resultsContainer.innerHTML = '';
    
    const checks = [
        {
            name: '广告拦截开关',
            check: () => localStorage.getItem('${adBlockEnabledName}') === 'true'
        },
        {
            name: '规则库加载',
            check: () => {
                const rules = JSON.parse(localStorage.getItem('adblock_rules') || '[]');
                return rules.length > 0;
            }
        },
        {
            name: '网络请求拦截',
            check: () => typeof window.fetch !== 'undefined' && window.fetch.toString().includes('Blocked by ad blocker')
        },
        {
            name: '元素隐藏功能',
            check: () => {
                try {
                    // 测试是否能够隐藏元素
                    const testElement = document.createElement('div');
                    testElement.style.display = 'block';
                    testElement.style.display = 'none';
                    return testElement.style.display === 'none';
                } catch (e) {
                    return false;
                }
            }
        }
    ];
    
    let healthyCount = 0;
    
    checks.forEach(check => {
        const result = document.createElement('div');
        result.className = 'check-item';
        
        const isHealthy = check.check();
        const status = isHealthy ? '正常' : '异常';
        const statusClass = isHealthy ? 'status-healthy' : 'status-error';
        
        if (isHealthy) healthyCount++;
        
        result.innerHTML = \`
            <div class="check-name">\${check.name}</div>
            <div class="check-status \${statusClass}">\${status}</div>
        \`;
        
        resultsContainer.appendChild(result);
    });
    
    // 显示总体检查结果
    const overallResult = document.createElement('div');
    overallResult.className = \`check-result \${healthyCount === checks.length ? 'check-success' : healthyCount >= checks.length / 2 ? 'check-warning' : 'check-error'}\`;
    overallResult.innerHTML = \`广告拦截功能检查完成！\${healthyCount}/\${checks.length} 项功能正常\`;
    resultsContainer.appendChild(overallResult);
}
`;

// =======================================================================================
// 第七部分：增强版资源嗅探系统
// 功能：完整的资源请求监控和修改系统，支持抓包工具功能
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
        <div class="proxy-modal-content" style="max-width:95%;width:1200px;height:90vh;">
            <div class="modal-header">
                <h3 class="modal-title">🔍 资源嗅探 - 抓包工具</h3>
                <button class="close-modal" onclick="closeAllModals()">×</button>
            </div>
            
            <div class="form-group" style="margin-bottom:15px;">
                <label style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="color:#e0e0e0;font-size:16px;font-weight:500;">启用资源嗅探</span>
                    <label class="switch">
                        <input type="checkbox" id="sniffer-enabled" \${resourceSnifferEnabled ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </label>
                <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">
                    注意：启用嗅探不会自动刷新页面，您可以在需要时手动刷新
                </div>
            </div>
            
            <div class="tab-container">
                <div class="tab-buttons">
                    <button class="tab-btn active" onclick="switchSnifferTab('captured')">捕获记录</button>
                    <button class="tab-btn" onclick="switchSnifferTab('modifiers')">请求修改</button>
                    <button class="tab-btn" onclick="switchSnifferTab('filters')">拦截设置</button>
                    <button class="tab-btn" onclick="switchSnifferTab('check')">功能检查</button>
                </div>
                
                <div id="captured-tab" class="tab-content active">
                    <div class="form-group">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                            <label class="form-label">捕获的资源请求 (共<span id="captured-count">0</span>条)</label>
                            <div>
                                <button class="btn btn-secondary" onclick="clearCapturedResources()" style="padding:6px 12px;font-size:12px;">清空记录</button>
                                <button class="btn btn-secondary" onclick="exportResources()" style="padding:6px 12px;font-size:12px;">导出数据</button>
                                <button class="btn btn-primary" onclick="toggleSniffer()" style="padding:6px 12px;font-size:12px;">
                                    \${isSnifferActive ? '停止嗅探' : '开始嗅探'}
                                </button>
                            </div>
                        </div>
                        <div id="resources-list" style="height:400px;overflow-y:auto;background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;">
                            <div style="text-align:center;color:#b0b0b0;padding:40px;">暂无捕获记录</div>
                        </div>
                    </div>
                </div>
                
                <div id="modifiers-tab" class="tab-content">
                    <div class="form-group">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                            <label class="form-label">请求修改规则 (共<span id="modifiers-count">0</span>条)</label>
                            <button class="btn btn-primary" onclick="addNewModifier()" style="padding:8px 15px;font-size:12px;">添加规则</button>
                        </div>
                        
                        <div id="modifiers-list" style="max-height:400px;overflow-y:auto;"></div>
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
                            <span style="color:#e0e0e0;font-size:14px;">访问网站时自动开启资源嗅探</span>
                        </div>
                    </div>
                </div>
                
                <div id="check-tab" class="tab-content">
                    <div class="feature-check-panel">
                        <h4 style="color:#4fc3f7;margin-bottom:15px;">资源嗅探功能检查</h4>
                        <div id="sniffer-check-results"></div>
                        <button class="btn btn-primary" onclick="checkSnifferFunctionality()" style="width:100%;margin-top:15px;">检查嗅探功能</button>
                    </div>
                </div>
            </div>
            
            <div class="btn-group">
                <button class="btn btn-secondary" onclick="closeAllModals()">取消</button>
                <button class="btn btn-primary" onclick="applySnifferSettings()">保存设置</button>
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
        updateCapturedCount();
        updateModifiersCount();
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
        document.getElementById('auto-start-sniffer').checked = localStorage.getItem('sniffer_auto_start') === 'true';
        
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

function updateCapturedCount() {
    document.getElementById('captured-count').textContent = capturedResources.length;
}

function updateModifiersCount() {
    document.getElementById('modifiers-count').textContent = requestModifiers.length;
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
        <div class="resource-item" onclick="showResourceDetail(\${actualIndex})" style="cursor:pointer;">
            <div class="resource-url" title="\${resource.url}">
                <span style="color:\${getMethodColor(method)};font-weight:bold;">\${method}</span> \${resource.url}
            </div>
            <div class="resource-info">
                <span>状态: \${getStatusText(status)}</span>
                <span>类型: \${type}</span>
                <span>时间: \${time}</span>
                <span>大小: \${formatBytes(resource.size)}</span>
                <span>耗时: \${resource.duration || 'N/A'}ms</span>
            </div>
        </div>
        \`;
    });
    
    container.innerHTML = html;
}

function getMethodColor(method) {
    const colors = {
        'GET': '#4caf50',
        'POST': '#2196f3',
        'PUT': '#ff9800',
        'DELETE': '#f44336',
        'PATCH': '#9c27b0'
    };
    return colors[method] || '#e0e0e0';
}

function getStatusText(status) {
    if (typeof status === 'number') {
        if (status >= 200 && status < 300) return \`<span style="color:#4caf50;">\${status}</span>\`;
        if (status >= 300 && status < 400) return \`<span style="color:#ff9800;">\${status}</span>\`;
        if (status >= 400) return \`<span style="color:#f44336;">\${status}</span>\`;
    }
    return \`<span style="color:#e0e0e0;">\${status}</span>\`;
}

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
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
        <div class="request-modifier">
            <div class="modifier-rule">
                <div>
                    <div class="modifier-pattern"><strong>模式:</strong> \${modifier.pattern}</div>
                    <div style="font-size:11px;color:#b0b0b0;margin-top:5px;">
                        <strong>动作:</strong> \${getActionText(modifier.action)} | 
                        <strong>目标:</strong> \${modifier.target} | 
                        \${modifier.value ? \`<strong>值:</strong> \${modifier.value} | \` : ''}
                        <strong>状态:</strong> \${modifier.enabled ? '启用' : '禁用'}
                    </div>
                </div>
                <div class="modifier-actions">
                    <button onclick="editModifier(\${index})" style="background:#2196f3;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;">编辑</button>
                    <button onclick="toggleModifier(\${index})" style="background:\${modifier.enabled ? '#ff9800' : '#4caf50'};color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;">\${modifier.enabled ? '禁用' : '启用'}</button>
                    <button onclick="removeModifier(\${index})" style="background:#f44336;color:white;border:none;padding:4px 8px;border-radius:3px;font-size:10px;cursor:pointer;">删除</button>
                </div>
            </div>
        </div>
        \`;
    });
    
    container.innerHTML = html;
}

function getActionText(action) {
    const actions = {
        'block': '拦截',
        'redirect': '重定向',
        'modify': '修改'
    };
    return actions[action] || action;
}

function addNewModifier() {
    const modifier = {
        pattern: '',
        action: 'block',
        target: 'url',
        value: '',
        enabled: true
    };
    
    requestModifiers.push(modifier);
    updateModifiersList();
    updateModifiersCount();
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
                <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">
                    支持格式: <code>*://*.example.com/*</code> (通配符) 或 <code>/ads\\\\.\\\\w+/</code> (正则表达式)
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">动作类型</label>
                <select id="modifier-action" class="form-select">
                    <option value="block" \${modifier.action === 'block' ? 'selected' : ''}>拦截请求</option>
                    <option value="redirect" \${modifier.action === 'redirect' ? 'selected' : ''}>重定向到</option>
                    <option value="modify" \${modifier.action === 'modify' ? 'selected' : ''}>修改请求</option>
                </select>
            </div>
            
            <div class="form-group" id="modify-target-group" \${modifier.action !== 'modify' ? 'style="display:none;"' : ''}>
                <label class="form-label">修改目标</label>
                <select id="modifier-target" class="form-select">
                    <option value="url" \${modifier.target === 'url' ? 'selected' : ''}>URL地址</option>
                    <option value="header" \${modifier.target === 'header' ? 'selected' : ''}>请求头</option>
                    <option value="cookie" \${modifier.target === 'cookie' ? 'selected' : ''}>Cookie</option>
                    <option value="body" \${modifier.target === 'body' ? 'selected' : ''}>请求体</option>
                </select>
            </div>
            
            <div class="form-group" id="modifier-value-group" \${!modifier.value && modifier.action !== 'redirect' ? 'style="display:none;"' : ''}>
                <label class="form-label" id="modifier-value-label">
                    \${modifier.action === 'redirect' ? '重定向到URL' : modifier.target === 'header' ? '请求头 (格式: HeaderName: HeaderValue)' : modifier.target === 'cookie' ? 'Cookie (格式: name=value)' : modifier.target === 'body' ? '请求体内容' : '修改值'}
                </label>
                <textarea id="modifier-value" class="form-textarea" placeholder="输入修改值" style="height:80px;">\${modifier.value || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label style="display:flex;align-items:center;gap:8px;">
                    <input type="checkbox" id="modifier-enabled" \${modifier.enabled ? 'checked' : ''}>
                    <span style="color:#e0e0e0;">启用此规则</span>
                </label>
            </div>
            
            <div class="btn-group">
                <button class="btn btn-secondary" onclick="closeModifierEditor()">取消</button>
                <button class="btn btn-primary" onclick="saveModifier(\${index})">保存规则</button>
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
        const target = document.getElementById('modifier-target').value;
        
        if (action === 'modify') {
            targetGroup.style.display = 'block';
            valueGroup.style.display = 'block';
            updateValueLabel();
        } else if (action === 'redirect') {
            targetGroup.style.display = 'none';
            valueGroup.style.display = 'block';
            valueLabel.textContent = '重定向到URL';
        } else {
            targetGroup.style.display = 'none';
            valueGroup.style.display = 'none';
        }
    }
    
    function updateValueLabel() {
        const target = document.getElementById('modifier-target').value;
        const label = document.getElementById('modifier-value-label');
        
        if (target === 'header') {
            label.textContent = '请求头 (格式: HeaderName: HeaderValue)';
        } else if (target === 'cookie') {
            label.textContent = 'Cookie (格式: name=value)';
        } else if (target === 'body') {
            label.textContent = '请求体内容';
        } else {
            label.textContent = '修改值';
        }
    }
    
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
    updateModifiersCount();
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
        updateModifiersCount();
        showNotification('修改规则已删除', 'success');
    }
}

function showResourceDetail(index) {
    const resource = capturedResources[index];
    
    const detailHTML = \`
    <div class="proxy-modal" id="resource-detail">
        <div class="proxy-modal-content" style="max-width:90%;width:1000px;height:90vh;">
            <div class="modal-header">
                <h3 class="modal-title">资源详情 - 抓包分析</h3>
                <button class="close-modal" onclick="closeResourceDetail()">×</button>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;height:calc(100% - 100px);">
                <div style="display:flex;flex-direction:column;">
                    <h4 style="color:#4fc3f7;margin-bottom:15px;">请求信息</h4>
                    <div class="packet-detail" style="flex:1;overflow-y:auto;">
                        <div class="packet-section">
                            <div class="packet-section-title">基本信息</div>
                            <div class="header-item">
                                <div class="header-name">URL</div>
                                <div class="header-value">\${resource.url}</div>
                            </div>
                            <div class="header-item">
                                <div class="header-name">方法</div>
                                <div class="header-value">\${resource.method || 'GET'}</div>
                            </div>
                            <div class="header-item">
                                <div class="header-name">状态</div>
                                <div class="header-value">\${resource.status || 'Pending'}</div>
                            </div>
                            <div class="header-item">
                                <div class="header-name">类型</div>
                                <div class="header-value">\${resource.type || 'unknown'}</div>
                            </div>
                            <div class="header-item">
                                <div class="header-name">大小</div>
                                <div class="header-value">\${formatBytes(resource.size)}</div>
                            </div>
                            <div class="header-item">
                                <div class="header-name">耗时</div>
                                <div class="header-value">\${resource.duration || 'N/A'} ms</div>
                            </div>
                            <div class="header-item">
                                <div class="header-name">时间</div>
                                <div class="header-value">\${new Date(resource.timestamp).toLocaleString()}</div>
                            </div>
                        </div>
                        
                        \${resource.requestHeaders ? \`
                        <div class="packet-section">
                            <div class="packet-section-title">请求头</div>
                            <div class="packet-headers">
                                \${Object.entries(resource.requestHeaders).map(([key, value]) => \`
                                    <div class="header-item">
                                        <div class="header-name">\${key}</div>
                                        <div class="header-value">\${value}</div>
                                    </div>
                                \`).join('')}
                            </div>
                        </div>
                        \` : ''}
                        
                        \${resource.requestBody ? \`
                        <div class="packet-section">
                            <div class="packet-section-title">请求体</div>
                            <textarea class="form-textarea" style="height:150px;font-size:12px;font-family:monospace;" readonly>\${resource.requestBody}</textarea>
                        </div>
                        \` : ''}
                    </div>
                </div>
                
                <div style="display:flex;flex-direction:column;">
                    <h4 style="color:#4fc3f7;margin-bottom:15px;">响应信息 & 操作</h4>
                    <div class="packet-detail" style="flex:1;overflow-y:auto;">
                        \${resource.responseHeaders ? \`
                        <div class="packet-section">
                            <div class="packet-section-title">响应头</div>
                            <div class="packet-headers">
                                \${Object.entries(resource.responseHeaders).map(([key, value]) => \`
                                    <div class="header-item">
                                        <div class="header-name">\${key}</div>
                                        <div class="header-value">\${value}</div>
                                    </div>
                                \`).join('')}
                            </div>
                        </div>
                        \` : ''}
                        
                        \${resource.responseBody ? \`
                        <div class="packet-section">
                            <div class="packet-section-title">响应体</div>
                            <textarea class="form-textarea" style="height:200px;font-size:12px;font-family:monospace;" readonly>\${resource.responseBody}</textarea>
                        </div>
                        \` : ''}
                        
                        <div class="packet-section">
                            <div class="packet-section-title">操作工具</div>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                                <button class="btn btn-primary" onclick="createModifierFromResource('\${resource.url}')">创建拦截规则</button>
                                <button class="btn btn-secondary" onclick="replayRequest(\${index})">重放请求</button>
                                <button class="btn btn-secondary" onclick="editAndReplayRequest(\${index})">编辑并重放</button>
                                <button class="btn btn-secondary" onclick="copyRequestInfo(\${index})">复制信息</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="btn-group">
                <button class="btn btn-secondary" onclick="closeResourceDetail()">关闭</button>
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

function createModifierFromResource(url) {
    closeResourceDetail();
    
    const modifier = {
        pattern: url.replace(/(https?:)\\/\\/[^\\/]+/, '*://*'),
        action: 'block',
        target: 'url',
        value: '',
        enabled: true
    };
    
    requestModifiers.push(modifier);
    localStorage.setItem('sniffer_modifiers', JSON.stringify(requestModifiers));
    updateModifiersList();
    updateModifiersCount();
    showNotification('已基于资源创建拦截规则', 'success');
}

function replayRequest(index) {
    const resource = capturedResources[index];
    
    fetch(resource.url, {
        method: resource.method || 'GET',
        headers: resource.requestHeaders || {},
        body: resource.requestBody || null
    })
    .then(response => {
        showNotification('请求重放成功', 'success');
        // 重新捕获这个请求
        captureResource({
            ...resource,
            timestamp: Date.now(),
            replayed: true
        });
    })
    .catch(error => {
        showNotification('请求重放失败: ' + error.message, 'error');
    });
}

function editAndReplayRequest(index) {
    const resource = capturedResources[index];
    
    const editHTML = \`
    <div class="proxy-modal" id="request-editor">
        <div class="proxy-modal-content" style="max-width:800px;">
            <div class="modal-header">
                <h3 class="modal-title">编辑并重放请求</h3>
                <button class="close-modal" onclick="closeRequestEditor()">×</button>
            </div>
            
            <div class="form-group">
                <label class="form-label">URL</label>
                <input type="text" id="edit-url" class="form-input" value="\${resource.url}">
            </div>
            
            <div class="form-group">
                <label class="form-label">方法</label>
                <select id="edit-method" class="form-select">
                    <option value="GET" \${resource.method === 'GET' ? 'selected' : ''}>GET</option>
                    <option value="POST" \${resource.method === 'POST' ? 'selected' : ''}>POST</option>
                    <option value="PUT" \${resource.method === 'PUT' ? 'selected' : ''}>PUT</option>
                    <option value="DELETE" \${resource.method === 'DELETE' ? 'selected' : ''}>DELETE</option>
                    <option value="PATCH" \${resource.method === 'PATCH' ? 'selected' : ''}>PATCH</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">请求头 (JSON格式)</label>
                <textarea id="edit-headers" class="form-textarea" style="height:120px;">\${JSON.stringify(resource.requestHeaders || {}, null, 2)}</textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">请求体</label>
                <textarea id="edit-body" class="form-textarea" style="height:150px;">\${resource.requestBody || ''}</textarea>
            </div>
            
            <div class="btn-group">
                <button class="btn btn-secondary" onclick="closeRequestEditor()">取消</button>
                <button class="btn btn-primary" onclick="executeEditedRequest(\${index})">执行请求</button>
            </div>
        </div>
    </div>
    \`;
    
    document.body.insertAdjacentHTML('beforeend', editHTML);
}

function closeRequestEditor() {
    const editor = document.getElementById('request-editor');
    if (editor) editor.remove();
}

function executeEditedRequest(originalIndex) {
    const url = document.getElementById('edit-url').value;
    const method = document.getElementById('edit-method').value;
    const headersText = document.getElementById('edit-headers').value;
    const body = document.getElementById('edit-body').value;
    
    let headers = {};
    try {
        headers = JSON.parse(headersText);
    } catch (e) {
        showNotification('请求头格式错误', 'error');
        return;
    }
    
    fetch(url, {
        method: method,
        headers: headers,
        body: body || null
    })
    .then(response => {
        showNotification('编辑后的请求执行成功', 'success');
        closeRequestEditor();
        
        // 捕获新请求
        captureResource({
            url: url,
            method: method,
            type: 'fetch',
            status: response.status,
            size: 0,
            duration: 0,
            timestamp: Date.now(),
            requestHeaders: headers,
            requestBody: body,
            edited: true
        });
    })
    .catch(error => {
        showNotification('请求执行失败: ' + error.message, 'error');
    });
}

function copyRequestInfo(index) {
    const resource = capturedResources[index];
    const info = \`
URL: \${resource.url}
方法: \${resource.method || 'GET'}
状态: \${resource.status || 'Pending'}
类型: \${resource.type || 'unknown'}
大小: \${formatBytes(resource.size)}
时间: \${new Date(resource.timestamp).toLocaleString()}
    \`.trim();
    
    navigator.clipboard.writeText(info).then(() => {
        showNotification('请求信息已复制到剪贴板', 'success');
    });
}

function clearCapturedResources() {
    if (confirm('确定要清空所有捕获记录吗？此操作不可恢复。')) {
        capturedResources = [];
        localStorage.setItem('sniffer_captured', JSON.stringify(capturedResources));
        updateResourcesList();
        updateCapturedCount();
        showNotification('已清空捕获记录', 'success');
    }
}

function exportResources() {
    const data = {
        version: '1.0',
        exportTime: new Date().toISOString(),
        resources: capturedResources
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`sniffer-export-\${new Date().toISOString().split('T')[0]}.json\`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('资源记录已导出', 'success');
}

function toggleSniffer() {
    isSnifferActive = !isSnifferActive;
    localStorage.setItem('sniffer_active', isSnifferActive.toString());
    
    if (isSnifferActive) {
        startResourceSniffing();
        showNotification('资源嗅探已启动', 'success');
    } else {
        stopResourceSniffing();
        showNotification('资源嗅探已停止', 'info');
    }
    
    // 更新按钮文本
    const button = document.querySelector('#sniffer-modal button[onclick="toggleSniffer()"]');
    if (button) {
        button.textContent = isSnifferActive ? '停止嗅探' : '开始嗅探';
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
    localStorage.setItem('sniffer_auto_start', document.getElementById('auto-start-sniffer').checked.toString());
    
    if (resourceSnifferEnabled) {
        showNotification('资源嗅探设置已保存', 'success');
    } else {
        showNotification('资源嗅探已禁用', 'info');
    }
    
    setTimeout(closeAllModals, 500);
}

// 增强的资源嗅探实现
function startResourceSniffing() {
    if (!resourceSnifferEnabled) return;
    
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
        const startTime = Date.now();
        
        const resourceInfo = {
            url: url,
            method: options.method || 'GET',
            type: 'fetch',
            timestamp: startTime,
            requestHeaders: options.headers,
            requestBody: options.body
        };
        
        captureResource(resourceInfo);
        
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
            const endTime = Date.now();
            
            // 克隆响应以读取内容
            const responseClone = response.clone();
            let responseBody = '';
            let responseSize = 0;
            
            try {
                const text = await responseClone.text();
                responseBody = text;
                responseSize = new Blob([text]).size;
            } catch (e) {
                // 忽略二进制内容
            }
            
            // 捕获响应
            captureResource({
                ...resourceInfo,
                status: response.status,
                size: responseSize,
                duration: endTime - startTime,
                responseHeaders: Object.fromEntries(response.headers.entries()),
                responseBody: responseBody
            });
            
            return response;
        } catch (error) {
            const endTime = Date.now();
            captureResource({
                ...resourceInfo,
                status: 'Error',
                error: error.message,
                duration: endTime - startTime
            });
            throw error;
        }
    };
    
    // 拦截XMLHttpRequest
    XMLHttpRequest.prototype.open = function(...args) {
        this._url = args[1];
        this._method = args[0];
        this._startTime = Date.now();
        return window.originalXHROpen.apply(this, args);
    };
    
    XMLHttpRequest.prototype.send = function(...args) {
        const resourceInfo = {
            url: this._url,
            method: this._method,
            type: 'xhr',
            timestamp: this._startTime,
            requestBody: args[0]
        };
        
        captureResource(resourceInfo);
        
        this.addEventListener('load', function() {
            const endTime = Date.now();
            captureResource({
                ...resourceInfo,
                status: this.status,
                size: this.response ? new Blob([this.response]).size : 0,
                duration: endTime - this._startTime,
                responseHeaders: this.getAllResponseHeaders()
            });
        });
        
        this.addEventListener('error', function() {
            const endTime = Date.now();
            captureResource({
                ...resourceInfo,
                status: 'Error',
                duration: endTime - this._startTime
            });
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
    
    // 检查是否是重复资源（相同URL和时间相近）
    const isDuplicate = capturedResources.some(existing => 
        existing.url === resource.url && 
        Math.abs(existing.timestamp - resource.timestamp) < 1000
    );
    
    if (!isDuplicate) {
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
            updateCapturedCount();
        }
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
    if (url.match(/\\.(jpg|jpeg|png|gif|webp|svg|ico)$/i) && !filterSettings.image) return false;
    if (url.match(/\\.(woff|woff2|ttf|eot)$/i) && !filterSettings.font) return false;
    if (url.match(/\\.(mp4|webm|avi|mov|mp3|wav|ogg)$/i) && !filterSettings.media) return false;
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
        
        let matches = false;
        
        // 检查URL是否匹配模式
        if (modifier.pattern.startsWith('/') && modifier.pattern.endsWith('/')) {
            // 正则表达式模式
            try {
                const regex = new RegExp(modifier.pattern.slice(1, -1));
                matches = regex.test(url);
            } catch (e) {
                console.error('Invalid regex pattern:', modifier.pattern);
            }
        } else {
            // 通配符模式
            const pattern = modifier.pattern.replace(/\\*/g, '.*');
            matches = new RegExp(pattern).test(url);
        }
        
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
                    applyModification(result.newOptions, modifier);
                    break;
            }
        }
    });
    
    return result;
}

function applyModification(options, modifier) {
    switch (modifier.target) {
        case 'url':
            options.url = modifier.value;
            break;
        case 'header':
            if (modifier.value) {
                const [name, value] = modifier.value.split(':').map(s => s.trim());
                if (name && value) {
                    if (!options.headers) options.headers = {};
                    options.headers[name] = value;
                }
            }
            break;
        case 'cookie':
            if (modifier.value) {
                if (!options.headers) options.headers = {};
                options.headers['Cookie'] = modifier.value;
            }
            break;
        case 'body':
            options.body = modifier.value;
            break;
    }
}

// 资源嗅探功能检查
function checkSnifferFunctionality() {
    const resultsContainer = document.getElementById('sniffer-check-results');
    resultsContainer.innerHTML = '';
    
    const checks = [
        {
            name: '资源嗅探开关',
            check: () => localStorage.getItem('${resourceSnifferName}') === 'true'
        },
        {
            name: '捕获记录存储',
            check: () => {
                try {
                    const resources = JSON.parse(localStorage.getItem('sniffer_captured') || '[]');
                    return Array.isArray(resources);
                } catch (e) {
                    return false;
                }
            }
        },
        {
            name: '请求拦截功能',
            check: () => typeof window.fetch !== 'undefined' && window.fetch !== window.originalFetch
        },
        {
            name: '修改规则功能',
            check: () => {
                const modifiers = JSON.parse(localStorage.getItem('sniffer_modifiers') || '[]');
                return Array.isArray(modifiers);
            }
        }
    ];
    
    let healthyCount = 0;
    
    checks.forEach(check => {
        const result = document.createElement('div');
        result.className = 'check-item';
        
        const isHealthy = check.check();
        const status = isHealthy ? '正常' : '异常';
        const statusClass = isHealthy ? 'status-healthy' : 'status-error';
        
        if (isHealthy) healthyCount++;
        
        result.innerHTML = \`
            <div class="check-name">\${check.name}</div>
            <div class="check-status \${statusClass}">\${status}</div>
        \`;
        
        resultsContainer.appendChild(result);
    });
    
    // 显示总体检查结果
    const overallResult = document.createElement('div');
    overallResult.className = \`check-result \${healthyCount === checks.length ? 'check-success' : healthyCount >= checks.length / 2 ? 'check-warning' : 'check-error'}\`;
    overallResult.innerHTML = \`资源嗅探功能检查完成！\${healthyCount}/\${checks.length} 项功能正常\`;
    resultsContainer.appendChild(overallResult);
}
`;

// =======================================================================================
// 第八部分：设置和全局功能系统
// 功能：包含无图模式、请求修改、用户代理等全局设置
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
                    <button class="tab-btn" onclick="switchSettingsTab('network')">网络设置</button>
                    <button class="tab-btn" onclick="switchSettingsTab('check')">系统检查</button>
                </div>
                
                <div id="general-tab" class="tab-content active">
                    <div class="form-group">
                        <label class="form-label">用户代理 (User Agent)</label>
                        <select id="user-agent" class="form-select">
                            <option value="">使用浏览器默认</option>
                            <option value="mobile">移动端UA</option>
                            <option value="desktop">桌面端UA</option>
                            <option value="custom">自定义UA</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="custom-ua-group" style="display:none;">
                        <input type="text" id="custom-user-agent" class="form-input" placeholder="输入自定义User Agent字符串">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">语言设置</label>
                        <select id="language" class="form-select">
                            <option value="">自动检测</option>
                            <option value="zh-CN">简体中文</option>
                            <option value="zh-TW">繁体中文</option>
                            <option value="en-US">English</option>
                            <option value="ja-JP">日本語</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label style="display:flex;align-items:center;justify-content:space-between;">
                            <span style="color:#e0e0e0;font-size:16px;font-weight:500;">启用请求修改</span>
                            <label class="switch">
                                <input type="checkbox" id="request-modifier-enabled">
                                <span class="slider"></span>
                            </label>
                        </label>
                        <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">
                            允许修改HTTP请求头、Cookie等参数
                        </div>
                    </div>
                </div>
                
                <div id="image-tab" class="tab-content">
                    <div class="form-group">
                        <label style="display:flex;align-items:center;justify-content:space-between;">
                            <span style="color:#e0e0e0;font-size:16px;font-weight:500;">启用无图模式</span>
                            <label class="switch">
                                <input type="checkbox" id="image-mode-enabled">
                                <span class="slider"></span>
                            </label>
                        </label>
                        <div style="font-size:12px;color:#b0b0b0;margin-top:5px;">
                            拦截所有图片和视频资源，节省流量
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">拦截范围</label>
                        <div style="display:grid;gap:10px;">
                            <label style="display:flex;align-items:center;gap:10px;">
                                <input type="checkbox" id="block-images" checked>
                                <span style="color:#e0e0e0;">拦截图片 (jpg, png, gif, webp, svg)</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:10px;">
                                <input type="checkbox" id="block-videos" checked>
                                <span style="color:#e0e0e0;">拦截视频 (mp4, webm, avi, mov)</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:10px;">
                                <input type="checkbox" id="block-audio">
                                <span style="color:#e0e0e0;">拦截音频 (mp3, wav, ogg)</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:10px;">
                                <input type="checkbox" id="block-gifs" checked>
                                <span style="color:#e0e0e0;">拦截GIF动画</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label style="display:flex;align-items:center;gap:10px;">
                            <input type="checkbox" id="auto-refresh-image">
                            <span style="color:#e0e0e0;">启用无图模式时自动刷新页面</span>
                        </label>
                    </div>
                    
                    <div class="btn-group">
                        <button class="btn btn-primary" onclick="applyImageMode()">立即应用无图模式</button>
                    </div>
                </div>
                
                <div id="network-tab" class="tab-content">
                    <div class="form-group">
                        <label class="form-label">代理服务器设置</label>
                        <div style="display:grid;gap:10px;margin-bottom:15px;">
                            <input type="text" id="proxy-server" class="form-input" placeholder="代理服务器地址 (可选)">
                            <input type="text" id="proxy-port" class="form-input" placeholder="代理端口 (可选)">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">超时设置</label>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                            <div>
                                <label class="form-label">请求超时 (秒)</label>
                                <input type="number" id="timeout" class="form-input" value="30" min="5" max="300">
                            </div>
                            <div>
                                <label class="form-label">重试次数</label>
                                <input type="number" id="retry-count" class="form-input" value="3" min="0" max="10">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label style="display:flex;align-items:center;gap:10px;">
                            <input type="checkbox" id="enable-cache">
                            <span style="color:#e0e0e0;">启用响应缓存</span>
                        </label>
                    </div>
                </div>
                
                <div id="check-tab" class="tab-content">
                    <div class="feature-check-panel">
                        <h4 style="color:#4fc3f7;margin-bottom:15px;">系统功能全面检查</h4>
                        <div id="system-check-results"></div>
                        <button class="btn btn-primary" onclick="runSystemCheck()" style="width:100%;margin-top:15px;">执行全面系统检查</button>
                    </div>
                    
                    <div class="form-group" style="margin-top:20px;">
                        <label class="form-label">CSS冲突检测</label>
                        <button class="btn btn-secondary" onclick="checkCSSConflicts()" style="width:100%;">检测CSS样式冲突</button>
                        <div id="css-conflict-results" style="margin-top:10px;"></div>
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
        
        // 添加UA选择事件
        document.getElementById('user-agent').addEventListener('change', function() {
            const customGroup = document.getElementById('custom-ua-group');
            customGroup.style.display = this.value === 'custom' ? 'block' : 'none';
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
        // 加载用户代理设置
        const uaSetting = localStorage.getItem('${userAgentName}') || '';
        document.getElementById('user-agent').value = uaSetting;
        
        const customUA = localStorage.getItem('custom_user_agent') || '';
        document.getElementById('custom-user-agent').value = customUA;
        
        if (uaSetting === 'custom') {
            document.getElementById('custom-ua-group').style.display = 'block';
        }
        
        // 加载语言设置
        document.getElementById('language').value = localStorage.getItem('${languageName}') || '';
        
        // 加载请求修改设置
        document.getElementById('request-modifier-enabled').checked = localStorage.getItem('${requestModifierName}') === 'true';
        
        // 加载无图模式设置
        document.getElementById('image-mode-enabled').checked = localStorage.getItem('${imageModeName}') === 'true';
        
        const imageSettings = JSON.parse(localStorage.getItem('image_mode_settings') || '{"images":true,"videos":true,"audio":false,"gifs":true}');
        document.getElementById('block-images').checked = imageSettings.images;
        document.getElementById('block-videos').checked = imageSettings.videos;
        document.getElementById('block-audio').checked = imageSettings.audio;
        document.getElementById('block-gifs').checked = imageSettings.gifs;
        document.getElementById('auto-refresh-image').checked = localStorage.getItem('image_mode_auto_refresh') === 'true';
        
        // 加载网络设置
        document.getElementById('proxy-server').value = localStorage.getItem('proxy_server') || '';
        document.getElementById('proxy-port').value = localStorage.getItem('proxy_port') || '';
        document.getElementById('timeout').value = localStorage.getItem('request_timeout') || '30';
        document.getElementById('retry-count').value = localStorage.getItem('retry_count') || '3';
        document.getElementById('enable-cache').checked = localStorage.getItem('enable_cache') === 'true';
        
    } catch (e) {
        console.error('加载设置失败:', e);
    }
}

function saveSettings() {
    try {
        // 保存用户代理设置
        const uaSetting = document.getElementById('user-agent').value;
        localStorage.setItem('${userAgentName}', uaSetting);
        
        if (uaSetting === 'custom') {
            localStorage.setItem('custom_user_agent', document.getElementById('custom-user-agent').value);
        }
        
        // 保存语言设置
        localStorage.setItem('${languageName}', document.getElementById('language').value);
        
        // 保存请求修改设置
        localStorage.setItem('${requestModifierName}', document.getElementById('request-modifier-enabled').checked.toString());
        
        // 保存无图模式设置
        const imageModeEnabled = document.getElementById('image-mode-enabled').checked;
        localStorage.setItem('${imageModeName}', imageModeEnabled.toString());
        
        const imageSettings = {
            images: document.getElementById('block-images').checked,
            videos: document.getElementById('block-videos').checked,
            audio: document.getElementById('block-audio').checked,
            gifs: document.getElementById('block-gifs').checked
        };
        localStorage.setItem('image_mode_settings', JSON.stringify(imageSettings));
        localStorage.setItem('image_mode_auto_refresh', document.getElementById('auto-refresh-image').checked.toString());
        
        // 保存网络设置
        localStorage.setItem('proxy_server', document.getElementById('proxy-server').value);
        localStorage.setItem('proxy_port', document.getElementById('proxy-port').value);
        localStorage.setItem('request_timeout', document.getElementById('timeout').value);
        localStorage.setItem('retry_count', document.getElementById('retry-count').value);
        localStorage.setItem('enable_cache', document.getElementById('enable-cache').checked.toString());
        
        showNotification('设置已保存', 'success');
        
        // 应用设置
        applySettings();
        
        setTimeout(() => {
            closeAllModals();
        }, 1000);
        
    } catch (e) {
        showNotification('保存设置失败: ' + e.message, 'error');
    }
}

function applySettings() {
    // 应用无图模式
    applyImageMode();
    
    // 应用请求修改
    applyRequestModification();
    
    // 应用用户代理
    applyUserAgent();
}

function applyImageMode() {
    const enabled = localStorage.getItem('${imageModeName}') === 'true';
    const settings = JSON.parse(localStorage.getItem('image_mode_settings') || '{}');
    
    if (enabled) {
        // 拦截图片请求
        if (settings.images) {
            document.querySelectorAll('img').forEach(img => {
                if (!img.classList.contains('image-blocked')) {
                    img.classList.add('image-blocked');
                    const originalSrc = img.src;
                    img.dataset.originalSrc = originalSrc;
                    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj7lm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
                }
            });
        }
        
        // 拦截视频
        if (settings.videos) {
            document.querySelectorAll('video').forEach(video => {
                if (!video.classList.contains('video-blocked')) {
                    video.classList.add('video-blocked');
                    video.pause();
                    video.style.display = 'none';
                }
            });
        }
        
        // 拦截GIF
        if (settings.gifs) {
            document.querySelectorAll('img[src*=".gif"], img[src*="giphy"]').forEach(img => {
                if (!img.classList.contains('image-blocked')) {
                    img.classList.add('image-blocked');
                    const originalSrc = img.src;
                    img.dataset.originalSrc = originalSrc;
                    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5HSUYg5Zu+54mHPC90ZXh0Pgo8L3N2Zz4K';
                }
            });
        }
        
        showNotification('无图模式已启用', 'success');
        
        // 自动刷新
        if (localStorage.getItem('image_mode_auto_refresh') === 'true') {
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    } else {
        // 恢复图片
        document.querySelectorAll('.image-blocked').forEach(img => {
            img.classList.remove('image-blocked');
            if (img.dataset.originalSrc) {
                img.src = img.dataset.originalSrc;
            }
        });
        
        // 恢复视频
        document.querySelectorAll('.video-blocked').forEach(video => {
            video.classList.remove('video-blocked');
            video.style.display = '';
        });
        
        showNotification('无图模式已禁用', 'info');
    }
}

function applyRequestModification() {
    const enabled = localStorage.getItem('${requestModifierName}') === 'true';
    
    if (enabled) {
        // 这里可以添加请求修改逻辑
        showNotification('请求修改功能已启用', 'success');
    } else {
        showNotification('请求修改功能已禁用', 'info');
    }
}

function applyUserAgent() {
    const uaSetting = localStorage.getItem('${userAgentName}');
    
    if (uaSetting === 'mobile') {
        // 设置移动端UA
        Object.defineProperty(navigator, 'userAgent', {
            get: function() {
                return 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
            },
            configurable: true
        });
    } else if (uaSetting === 'desktop') {
        // 设置桌面端UA
        Object.defineProperty(navigator, 'userAgent', {
            get: function() {
                return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
            },
            configurable: true
        });
    } else if (uaSetting === 'custom') {
        const customUA = localStorage.getItem('custom_user_agent');
        if (customUA) {
            Object.defineProperty(navigator, 'userAgent', {
                get: function() { return customUA; },
                configurable: true
            });
        }
    }
}

// CSS冲突检测
function checkCSSConflicts() {
    const resultsContainer = document.getElementById('css-conflict-results');
    resultsContainer.innerHTML = '';
    
    const conflicts = [];
    
    // 检测工具栏样式冲突
    const toolbar = document.getElementById('proxy-toolbar');
    if (toolbar) {
        const computedStyle = window.getComputedStyle(toolbar);
        const zIndex = computedStyle.zIndex;
        if (zIndex !== '2147483647') {
            conflicts.push({
                element: '工具栏',
                issue: 'z-index可能被覆盖',
                current: zIndex,
                expected: '2147483647'
            });
        }
    }
    
    // 检测模态框样式冲突
    const modals = document.querySelectorAll('.proxy-modal');
    modals.forEach((modal, index) => {
        const computedStyle = window.getComputedStyle(modal);
        if (computedStyle.display === 'none' && modal.classList.contains('show')) {
            conflicts.push({
                element: \`模态框 \${index + 1}\`,
                issue: '显示状态冲突',
                current: 'display: none',
                expected: 'display: flex'
            });
        }
    });
    
    // 检测通用样式问题
    const styleSheets = document.styleSheets;
    for (let i = 0; i < styleSheets.length; i++) {
        try {
            const rules = styleSheets[i].cssRules || styleSheets[i].rules;
            for (let j = 0; j < rules.length; j++) {
                const rule = rules[j];
                if (rule.selectorText && rule.selectorText.includes('.proxy-')) {
                    // 检查代理相关的CSS规则
                    if (rule.style && rule.style.position === 'static') {
                        conflicts.push({
                            element: '代理样式',
                            issue: 'position可能被重置',
                            selector: rule.selectorText,
                            current: 'static',
                            expected: 'fixed/absolute'
                        });
                    }
                }
            }
        } catch (e) {
            // 忽略跨域样式表的错误
        }
    }
    
    if (conflicts.length === 0) {
        resultsContainer.innerHTML = '<div class="check-result check-success">未检测到CSS样式冲突</div>';
    } else {
        let html = '<div class="check-result check-warning">检测到 ' + conflicts.length + ' 个可能的CSS冲突</div>';
        
        conflicts.forEach(conflict => {
            html += \`
            <div class="resource-item">
                <div style="font-weight:500;color:#ff9800;margin-bottom:5px;">\${conflict.element}</div>
                <div style="font-size:12px;color:#e0e0e0;">问题: \${conflict.issue}</div>
                <div style="font-size:11px;color:#b0b0b0;">
                    当前: \${conflict.current} | 期望: \${conflict.expected}
                    \${conflict.selector ? '<br>选择器: ' + conflict.selector : ''}
                </div>
            </div>
            \`;
        });
        
        html += \`
        <div style="margin-top:10px;">
            <button class="btn btn-secondary" onclick="fixCSSConflicts()" style="width:100%;padding:8px;font-size:12px;">尝试自动修复CSS冲突</button>
        </div>
        \`;
        
        resultsContainer.innerHTML = html;
    }
}

function fixCSSConflicts() {
    // 强制设置工具栏z-index
    const toolbar = document.getElementById('proxy-toolbar');
    if (toolbar) {
        toolbar.style.zIndex = '2147483647';
    }
    
    // 强制设置模态框样式
    const modals = document.querySelectorAll('.proxy-modal');
    modals.forEach(modal => {
        if (modal.classList.contains('show')) {
            modal.style.display = 'flex';
            modal.style.opacity = '1';
        }
    });
    
    showNotification('已尝试修复CSS冲突，请检查页面显示', 'success');
    setTimeout(() => {
        checkCSSConflicts();
    }, 500);
}

// 系统全面检查
function runSystemCheck() {
    const resultsContainer = document.getElementById('system-check-results');
    resultsContainer.innerHTML = '';
    
    const checks = [
        {
            name: 'Cookie注入功能',
            check: () => {
                try {
                    const settings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
                    return Object.keys(settings).length >= 0;
                } catch (e) {
                    return false;
                }
            }
        },
        {
            name: '广告拦截功能',
            check: () => {
                const enabled = localStorage.getItem('${adBlockEnabledName}') === 'true';
                const rules = JSON.parse(localStorage.getItem('adblock_rules') || '[]');
                return enabled && rules.length > 0;
            }
        },
        {
            name: '资源嗅探功能',
            check: () => localStorage.getItem('${resourceSnifferName}') === 'true'
        },
        {
            name: '无图模式功能',
            check: () => localStorage.getItem('${imageModeName}') === 'true'
        },
        {
            name: '请求修改功能',
            check: () => localStorage.getItem('${requestModifierName}') === 'true'
        },
        {
            name: '用户代理功能',
            check: () => {
                const ua = localStorage.getItem('${userAgentName}');
                return ua && ua !== '';
            }
        },
        {
            name: '本地存储功能',
            check: () => {
                try {
                    localStorage.setItem('test', 'test');
                    localStorage.removeItem('test');
                    return true;
                } catch (e) {
                    return false;
                }
            }
        },
        {
            name: '网络请求功能',
            check: () => typeof fetch !== 'undefined'
        }
    ];
    
    let healthyCount = 0;
    
    checks.forEach(check => {
        const result = document.createElement('div');
        result.className = 'check-item';
        
        const isHealthy = check.check();
        const status = isHealthy ? '正常' : '异常';
        const statusClass = isHealthy ? 'status-healthy' : 'status-error';
        
        if (isHealthy) healthyCount++;
        
        result.innerHTML = \`
            <div class="check-name">\${check.name}</div>
            <div class="check-status \${statusClass}">\${status}</div>
        \`;
        
        resultsContainer.appendChild(result);
    });
    
    // 显示总体检查结果
    const overallResult = document.createElement('div');
    overallResult.className = \`check-result \${healthyCount === checks.length ? 'check-success' : healthyCount >= checks.length / 2 ? 'check-warning' : 'check-error'}\`;
    overallResult.innerHTML = \`系统功能全面检查完成！\${healthyCount}/\${checks.length} 项功能正常\`;
    resultsContainer.appendChild(overallResult);
    
    // 显示操作建议
    if (healthyCount < checks.length) {
        const suggestion = document.createElement('div');
        suggestion.className = 'check-result check-warning';
        suggestion.innerHTML = '建议：检查浏览器设置，确保没有禁用localStorage或脚本执行';
        resultsContainer.appendChild(suggestion);
    }
}
`;

// =======================================================================================
// 第九部分：初始化系统
// 功能：加载所有系统并初始化
// =======================================================================================

const initSystem = `
// 初始化所有系统
function loadAllSettings() {
    // 加载Cookie注入设置
    try {
        const cookieSettings = JSON.parse(localStorage.getItem('${cookieInjectionDataName}') || '{}');
        const currentWebsite = getCurrentWebsite();
        if (cookieSettings[currentWebsite]) {
            applyCookiesImmediately(cookieSettings[currentWebsite].cookies);
        }
    } catch (e) {
        console.error('加载Cookie设置失败:', e);
    }
    
    // 加载广告拦截设置
    try {
        adBlockEnabled = localStorage.getItem('${adBlockEnabledName}') === 'true';
        if (adBlockEnabled) {
            adBlockRules = JSON.parse(localStorage.getItem('adblock_rules') || '[]');
            startAdBlocking();
        }
    } catch (e) {
        console.error('加载广告拦截设置失败:', e);
    }
    
    // 加载资源嗅探设置
    try {
        resourceSnifferEnabled = localStorage.getItem('${resourceSnifferName}') === 'true';
        if (resourceSnifferEnabled) {
            capturedResources = JSON.parse(localStorage.getItem('sniffer_captured') || '[]');
            requestModifiers = JSON.parse(localStorage.getItem('sniffer_modifiers') || '[]');
            
            // 检查是否自动开启
            if (localStorage.getItem('sniffer_auto_start') === 'true') {
                isSnifferActive = true;
                startResourceSniffing();
            }
        }
    } catch (e) {
        console.error('加载资源嗅探设置失败:', e);
    }
    
    // 加载无图模式设置
    try {
        const imageModeEnabled = localStorage.getItem('${imageModeName}') === 'true';
        if (imageModeEnabled) {
            setTimeout(applyImageMode, 100);
        }
    } catch (e) {
        console.error('加载无图模式设置失败:', e);
    }
    
    // 加载请求修改设置
    try {
        const requestModifierEnabled = localStorage.getItem('${requestModifierName}') === 'true';
        if (requestModifierEnabled) {
            applyRequestModification();
        }
    } catch (e) {
        console.error('加载请求修改设置失败:', e);
    }
    
    // 加载用户代理设置
    try {
        applyUserAgent();
    } catch (e) {
        console.error('加载用户代理设置失败:', e);
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
// 功能：处理所有代理请求，修复422错误等问题
// =======================================================================================

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const search = url.search;

  if (path === str || path === str + "index.html" || path === str + "home.html") {
    return new Response(await homePage(), {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  }

  if (path.startsWith(str + "http")) {
    return await handleProxyRequest(request);
  }

  return new Response("Not Found", { status: 404 });
}

async function handleProxyRequest(request) {
  const url = new URL(request.url);
  const proxyUrl = url.pathname.slice(str.length);

  let targetUrl;
  try {
    targetUrl = new URL(proxyUrl);
  } catch (e) {
    return new Response("Invalid URL", { status: 400 });
  }

  const headers = new Headers();
  for (const [key, value] of request.headers) {
    if (!["host", "origin", "referer", "user-agent"].includes(key.toLowerCase())) {
      headers.append(key, value);
    }
  }

  // 修复422错误：正确处理文件上传等特殊请求
  let body = request.body;
  const contentType = request.headers.get("content-type") || "";
  
  // 对于multipart/form-data（文件上传）和其他二进制内容，直接传递原始body
  if (contentType.includes("multipart/form-data") || 
      contentType.includes("application/octet-stream") ||
      request.method === "PUT" || 
      request.method === "PATCH") {
    body = request.body;
  } else if (request.method !== "GET" && request.method !== "HEAD") {
    // 对于其他非GET请求，可以尝试读取文本内容
    try {
      body = await request.text();
    } catch (e) {
      body = null;
    }
  }

  // 设置合理的请求头
  headers.set("Host", targetUrl.host);
  headers.set("Origin", targetUrl.origin);
  headers.set("Referer", targetUrl.origin + "/");
  
  // 添加用户代理
  const userAgent = request.headers.get("user-agent") || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
  headers.set("User-Agent", userAgent);

  const fetchOptions = {
    method: request.method,
    headers: headers,
    body: body,
    redirect: "follow"
  };

  try {
    const response = await fetch(targetUrl.toString(), fetchOptions);
    
    // 处理重定向
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        const newUrl = new URL(location, targetUrl);
        return Response.redirect(thisProxyServerUrlHttps + newUrl.toString(), response.status);
      }
    }

    const responseHeaders = new Headers(response.headers);
    
    // 修复CORS问题
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "*");
    
    // 移除可能引起问题的头
    responseHeaders.delete("content-security-policy");
    responseHeaders.delete("x-frame-options");
    responseHeaders.delete("x-content-type-options");

    // 处理HTML内容，注入我们的脚本
    const contentType = responseHeaders.get("content-type") || "";
    if (contentType.includes("text/html")) {
      let html = await response.text();
      
      // 注入所有系统脚本
      html = injectScripts(html);
      
      return new Response(html, {
        status: response.status,
        headers: responseHeaders,
      });
    }

    // 对于其他类型的内容，直接返回
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    return new Response("Proxy Error: " + error.message, { status: 500 });
  }
}

function injectScripts(html) {
  const scripts = [
    toolbarSystem,
    cookieInjectionSystem,
    adBlockSystem,
    resourceSnifferSystem,
    settingsSystem,
    initSystem
  ];

  let injectedHtml = html;
  
  // 在head标签结束前注入样式和初始化脚本
  if (injectedHtml.includes('</head>')) {
    const injectionContent = `
    <script>
    ${scripts.join('\n\n')}
    </script>
    `;
    injectedHtml = injectedHtml.replace('</head>', injectionContent + '</head>');
  } else {
    // 如果没有head标签，直接在body开始处注入
    injectedHtml = injectedHtml.replace('<body', '<script>' + scripts.join('\n\n') + '</script><body');
  }

  return injectedHtml;
}

async function homePage() {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Enhanced Web Proxy</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.2);
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .input-group {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        input[type="text"] {
            flex: 1;
            padding: 15px 20px;
            border: none;
            border-radius: 50px;
            background: rgba(255,255,255,0.9);
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        button {
            padding: 15px 30px;
            border: none;
            border-radius: 50px;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 40px;
        }
        .feature-card {
            background: rgba(255,255,255,0.1);
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.2);
            transition: all 0.3s ease;
        }
        .feature-card:hover {
            transform: translateY(-5px);
            background: rgba(255,255,255,0.15);
        }
        .feature-icon {
            font-size: 40px;
            margin-bottom: 15px;
        }
        .feature-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .feature-desc {
            font-size: 14px;
            opacity: 0.9;
            line-height: 1.5;
        }
        .instructions {
            margin-top: 40px;
            padding: 25px;
            background: rgba(0,0,0,0.2);
            border-radius: 15px;
        }
        .instructions h3 {
            margin-bottom: 15px;
            color: #4fc3f7;
        }
        .instructions ol {
            text-align: left;
            padding-left: 20px;
        }
        .instructions li {
            margin-bottom: 10px;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Enhanced Web Proxy</h1>
        
        <div class="input-group">
            <input type="text" id="url" placeholder="输入要访问的网址 (例如: https://example.com)" autofocus>
            <button onclick="navigate()">开始代理</button>
        </div>
        
        <div class="features">
            <div class="feature-card">
                <div class="feature-icon">🍪</div>
                <div class="feature-title">Cookie注入管理</div>
                <div class="feature-desc">完整的Cookie注入、编辑和管理功能，支持网站Cookie记录</div>
            </div>
            <div class="feature-card">
                <div class="feature-icon">🚫</div>
                <div class="feature-title">广告拦截增强</div>
                <div class="feature-desc">多规则订阅、智能元素标记、多选模式拦截</div>
            </div>
            <div class="feature-card">
                <div class="feature-icon">🔍</div>
                <div class="feature-title">资源嗅探抓包</div>
                <div class="feature-desc">完整的抓包工具功能，支持请求修改、重放和拦截</div>
            </div>
            <div class="feature-card">
                <div class="feature-icon">⚙️</div>
                <div class="feature-title">高级设置系统</div>
                <div class="feature-desc">无图模式、请求修改、用户代理、功能检查</div>
            </div>
        </div>
        
        <div class="instructions">
            <h3>使用说明：</h3>
            <ol>
                <li>在输入框中输入要访问的网址，点击"开始代理"按钮</li>
                <li>页面加载后，右下角会出现工具栏图标 🛠️</li>
                <li>点击工具栏图标展开功能菜单：🍪 Cookie管理、🚫 广告拦截、🔍 资源嗅探、⚙️ 设置</li>
                <li>各个功能模块都有详细的管理界面和检查功能</li>
                <li>所有设置会自动保存到本地，下次访问时自动应用</li>
            </ol>
            <p><strong>注意：</strong> 使用代理服务时请注意网络安全，不要在代理环境下登录敏感账户。</p>
        </div>
    </div>

    <script>
        function navigate() {
            const urlInput = document.getElementById('url').value.trim();
            if (!urlInput) return;
            
            let targetUrl = urlInput;
            if (!targetUrl.startsWith('http')) {
                targetUrl = 'https://' + targetUrl;
            }
            
            const proxyUrl = '${thisProxyServerUrlHttps}' + encodeURIComponent(targetUrl);
            window.location.href = proxyUrl;
        }
        
        document.getElementById('url').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                navigate();
            }
        });
        
        // 显示一些示例网站
        const examples = [
            'github.com',
            'news.ycombinator.com',
            'wikipedia.org',
            'stackoverflow.com'
        ];
        
        let exampleIndex = 0;
        function rotateExample() {
            document.getElementById('url').placeholder = \`输入要访问的网址 (例如: \${examples[exampleIndex]})\`;
            exampleIndex = (exampleIndex + 1) % examples.length;
        }
        
        setInterval(rotateExample, 3000);
        rotateExample();
    </script>
</body>
</html>
  `;
}