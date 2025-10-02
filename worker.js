// ======================================================================================= 
// 原作者开源地址:https://github.com/1234567Yang/cf-proxy-ex/
// 本项目基于原作者进行优化修改，开源地址:https://github.com/cnzz666/zxfd
// 第一部分：事件监听和全局变量定义
// =======================================================================================

addEventListener('fetch', event => {
  try {
    const url = new URL(event.request.url);
    thisProxyServerUrlHttps = `${url.protocol}//${url.hostname}/`;
    thisProxyServerUrl_hostOnly = url.host;
    event.respondWith(handleRequest(event.request));
  } catch (e) {
    event.respondWith(getHTMLResponse(`错误: ${e.message}`));
  }
});

// =======================================================================================
// 第二部分：常量定义
// =======================================================================================

const str = "/";
const lastVisitProxyCookie = "__PROXY_VISITEDSITE__";
const passwordCookieName = "__PROXY_PWD__";
const proxyHintCookieName = "__PROXY_HINT_DISMISSED__";
const languageCookieName = "__PROXY_LANGUAGE__";
const deviceCookieName = "__PROXY_DEVICE__";
const blockExtensionsCookieName = "__PROXY_BLOCK_EXTENSIONS__";
const blockAdsCookieName = "__PROXY_BLOCK_ADS__";
const blockElementsCookieName = "__PROXY_BLOCK_ELEMENTS__";
const blockElementsScopeCookieName = "__PROXY_BLOCK_ELEMENTS_SCOPE__";
const customHeadersCookieName = "__PROXY_CUSTOM_HEADERS__";
const cookieInjectionCookieName = "__PROXY_COOKIE_INJECTION__";
const requestModificationCookieName = "__PROXY_REQUEST_MOD__";
const imageControlCookieName = "__PROXY_IMAGE_CONTROL__";
const password = ""; // 设置密码，若为空则不启用
const showPasswordPage = true;
const replaceUrlObj = "__location_yproxy__";
const injectedJsId = "__yproxy_injected_js_id__";

let thisProxyServerUrlHttps;
let thisProxyServerUrl_hostOnly;

// 支持的语言
const supportedLanguages = [
  { code: "zh-CN", name: "中文 (简体)" },
  { code: "en-US", name: "English (US)" },
  { code: "es-ES", name: "Español" },
  { code: "hi-IN", name: "हिन्दी" },
  { code: "ar-SA", name: "العربية" },
  { code: "pt-BR", name: "Português (Brasil)" },
  { code: "ru-RU", name: "Русский" },
  { code: "fr-FR", name: "Français" },
  { code: "de-DE", name: "Deutsch" },
  { code: "ja-JP", name: "日本語" }
];

// 设备模拟
const deviceUserAgents = {
  desktop: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  mobile: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
};

const deviceLayouts = {
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 375, height: 667 }
};

// 广告拦截关键词
const adBlockKeywords = [
  "ads.", "ad.", "advert", "banner", "sponsor", "doubleclick", "googlead", "adserver", "popunder", "interstitial",
  "googlesyndication.com", "adsense.google.com", "admob.com", "adclick.g.doubleclick.net"
];

// =======================================================================================
// 第三部分：代理提示注入脚本（玻璃态弹窗）
// =======================================================================================

const proxyHintInjection = `
(function() {
  // 检查是否已经同意或不再显示
  if (localStorage.getItem('proxyHintDismissed') === 'true') {
    return;
  }
  
  // 等待页面加载完成
  window.addEventListener('load', () => {
    setTimeout(() => {
      const hint = \`
Warning: You are currently using a web proxy, so do not log in to any website. Click to close this hint. For further details, please visit the link below.
警告：您当前正在使用网络代理，请勿登录任何网站。单击关闭此提示。详情请见以下链接。
\`;

      // 创建玻璃态弹窗
      const hintOverlay = document.createElement('div');
      hintOverlay.style.cssText = \`
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(15px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999999999999999999999;
        opacity: 0;
        transition: opacity 0.8s ease;
      \`;
      
      const hintContent = document.createElement('div');
      hintContent.style.cssText = \`
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(25px);
        border-radius: 20px;
        padding: 40px;
        max-width: 600px;
        width: 85%;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.4);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        transform: scale(0.7) translateY(50px);
        transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        color: white;
        font-family: 'Roboto', Arial, sans-serif;
      \`;
      
      hintContent.innerHTML = \`
        <div style="margin-bottom: 25px;">
          <div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
          <h3 style="margin-bottom: 20px; color: #ffeb3b; font-size: 24px; font-weight: bold;">代理使用警告</h3>
          <p style="margin-bottom: 20px; line-height: 1.6; font-size: 16px;">\${hint}</p>
        </div>
        <div style="margin-bottom: 25px;">
          <a href="https://github.com/1234567Yang/cf-proxy-ex/" 
             style="color: #90caf9; text-decoration: none; font-weight: bold; font-size: 14px; padding: 8px 16px; background: rgba(144, 202, 249, 0.2); border-radius: 20px; display: inline-block;">
            https://github.com/1234567Yang/cf-proxy-ex/
          </a>
        </div>
        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
          <button id="closeHint" style="
            padding: 12px 30px;
            background: rgba(255, 255, 255, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.4);
            border-radius: 25px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            font-weight: bold;
            min-width: 120px;
          ">关闭提示</button>
          <button id="dismissHint" style="
            padding: 12px 30px;
            background: rgba(255, 59, 59, 0.4);
            border: 1px solid rgba(255, 59, 59, 0.6);
            border-radius: 25px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            font-weight: bold;
            min-width: 120px;
          ">不再显示</button>
        </div>
      \`;
      
      hintOverlay.appendChild(hintContent);
      document.body.appendChild(hintOverlay);
      
      // 动画显示
      setTimeout(() => {
        hintOverlay.style.opacity = '1';
        hintContent.style.transform = 'scale(1) translateY(0)';
      }, 300);
      
      // 关闭按钮事件
      document.getElementById('closeHint').onclick = function() {
        hintOverlay.style.opacity = '0';
        hintContent.style.transform = 'scale(0.7) translateY(50px)';
        setTimeout(() => {
          if (hintOverlay.parentNode) {
            document.body.removeChild(hintOverlay);
          }
        }, 800);
      };
      
      // 不再显示按钮事件
      document.getElementById('dismissHint').onclick = function() {
        localStorage.setItem('proxyHintDismissed', 'true');
        hintOverlay.style.opacity = '0';
        hintContent.style.transform = 'scale(0.7) translateY(50px)';
        setTimeout(() => {
          if (hintOverlay.parentNode) {
            document.body.removeChild(hintOverlay);
          }
        }, 800);
      };
    }, 500);
  });
})();
`;

// =======================================================================================
// 第四部分：HTTP请求注入脚本（核心功能 + 工具栏）
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
return relativePath;
}

try{
if(relativePath.startsWith(proxy_host_with_schema)) relativePath = relativePath.substring(proxy_host_with_schema.length);
if(relativePath.startsWith(proxy_host + "/")) relativePath = relativePath.substring(proxy_host.length + 1);
if(relativePath.startsWith(proxy_host)) relativePath = relativePath.substring(proxy_host.length);
}catch{}
try {
var absolutePath = new URL(relativePath, original_website_url_str).href; //获取绝对路径
absolutePath = absolutePath.replaceAll(window.location.href, original_website_url_str); //可能是参数里面带了当前的链接，需要还原原来的链接防止403
absolutePath = absolutePath.replaceAll(encodeURI(window.location.href), encodeURI(original_website_url_str));
absolutePath = absolutePath.replaceAll(encodeURIComponent(window.location.href), encodeURIComponent(original_website_url_str));

absolutePath = absolutePath.replaceAll(proxy_host, original_website_host);
absolutePath = absolutePath.replaceAll(encodeURI(proxy_host), encodeURI(original_website_host));
absolutePath = absolutePath.replaceAll(encodeURIComponent(proxy_host), encodeURIComponent(original_website_host));

absolutePath = proxy_host_with_schema + absolutePath;
return absolutePath;
} catch (e) {
return relativePath;
}
}

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
    url = changeURL(url);
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

    if (typeof input === 'string') {
      return originalFetch(url, init);
    } else {
      const newRequest = new Request(url, input);
      return originalFetch(newRequest, init);
    }
  };
}

//---***========================================***---注入window.open---***========================================***---
function windowOpenInject(){
  const originalOpen = window.open;
  window.open = function (url, name, specs) {
      let modifiedUrl = changeURL(url);
      return originalOpen.call(window, modifiedUrl, name, specs);
  };
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
    }catch{}
    return originalAppendChild.call(this, child);
};
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
}

//---***========================================***---注入location---***========================================***---
class ProxyLocation {
  constructor(originalLocation) {
      this.originalLocation = originalLocation;
  }

  reload(forcedReload) {
    this.originalLocation.reload(forcedReload);
  }

  replace(url) {
    this.originalLocation.replace(changeURL(url));
  }

  assign(url) {
    this.originalLocation.assign(changeURL(url));
  }

  get href() {
    return original_website_url_str;
  }

  set href(url) {
    this.originalLocation.href = changeURL(url);
  }

  get protocol() {
    return original_website_url.protocol;
  }

  set protocol(value) {
    original_website_url.protocol = value;
    this.originalLocation.href = proxy_host_with_schema + original_website_url.href;
  }

  get host() {
    return original_website_url.host;
  }

  set host(value) {
    original_website_url.host = value;
    this.originalLocation.href = proxy_host_with_schema + original_website_url.href;
  }

  get hostname() {
    return original_website_url.hostname;
  }

  set hostname(value) {
    original_website_url.hostname = value;
    this.originalLocation.href = proxy_host_with_schema + original_website_url.href;
  }

  get port() {
    return original_website_url.port;
  }

  set port(value) {
    original_website_url.port = value;
    this.originalLocation.href = proxy_host_with_schema + original_website_url.href;
  }

  get pathname() {
    return original_website_url.pathname;
  }

  set pathname(value) {
    original_website_url.pathname = value;
    this.originalLocation.href = proxy_host_with_schema + original_website_url.href;
  }

  get search() {
    return original_website_url.search;
  }

  set search(value) {
    original_website_url.search = value;
    this.originalLocation.href = proxy_host_with_schema + original_website_url.href;
  }

  get hash() {
    return original_website_url.hash;
  }

  set hash(value) {
    original_website_url.hash = value;
    this.originalLocation.href = proxy_host_with_schema + original_website_url.href;
  }

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
}

//---***========================================***---注入历史---***========================================***---
function historyInject(){
  const originalPushState = History.prototype.pushState;
  const originalReplaceState = History.prototype.replaceState;

  History.prototype.pushState = function (state, title, url) {
    if(!url) return;

    if(url.startsWith("/" + original_website_url.href)) url = url.substring(("/" + original_website_url.href).length);
    if(url.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1))) url = url.substring(("/" + original_website_url.href).length - 1);

    var u = changeURL(url);
    return originalPushState.apply(this, [state, title, u]);
  };

  History.prototype.replaceState = function (state, title, url) {
    if(!url) return;

    let url_str = url.toString();

    if(url_str.startsWith("/" + original_website_url.href)) url_str = url_str.substring(("/" + original_website_url.href).length);
    if(url_str.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1))) url_str = url_str.substring(("/" + original_website_url.href).length - 1);

    if(url_str.startsWith("/" + original_website_url.href.replace("://", ":/"))) url_str = url_str.substring(("/" + original_website_url.href.replace("://", ":/")).length);
    if(url_str.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1).replace("://", ":/"))) url_str = url_str.substring(("/" + original_website_url.href).replace("://", ":/").length - 1);

    var u = changeURL(url_str);
    return originalReplaceState.apply(this, [state, title, u]);
  };
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

function covToAbs(element) {
  if(!(element instanceof HTMLElement)) return;
  
  if (element.hasAttribute("href")) {
    relativePath = element.getAttribute("href");
    try {
      var absolutePath = changeURL(relativePath);
      element.setAttribute("href", absolutePath);
    } catch (e) {}
  }

  if (element.hasAttribute("src")) {
    relativePath = element.getAttribute("src");
    try {
      var absolutePath = changeURL(relativePath);
      element.setAttribute("src", absolutePath);
    } catch (e) {}
  }

  if (element.tagName === "FORM" && element.hasAttribute("action")) {
    relativePath = element.getAttribute("action");
    try {
      var absolutePath = changeURL(relativePath);
      element.setAttribute("action", absolutePath);
    } catch (e) {}
  }

  if (element.tagName === "SOURCE" && element.hasAttribute("srcset")) {
    relativePath = element.getAttribute("srcset");
    try {
      var absolutePath = changeURL(relativePath);
      element.setAttribute("srcset", absolutePath);
    } catch (e) {}
  }

  if ((element.tagName === "VIDEO" || element.tagName === "AUDIO") && element.hasAttribute("poster")) {
    relativePath = element.getAttribute("poster");
    try {
      var absolutePath = changeURL(relativePath);
      element.setAttribute("poster", absolutePath);
    } catch (e) {}
  }

  if (element.tagName === "OBJECT" && element.hasAttribute("data")) {
    relativePath = element.getAttribute("data");
    try {
      var absolutePath = changeURL(relativePath);
      element.setAttribute("data", absolutePath);
    } catch (e) {}
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
}

function covScript(){
  var scripts = document.getElementsByTagName('script');
  for (var i = 0; i < scripts.length; i++) {
    covToAbs(scripts[i]);
  }
    setTimeout(covScript, 3000);
}

//---***========================================***---工具栏功能---***========================================***---
function initToolbar() {
  // 创建工具栏容器
  const toolbar = document.createElement('div');
  toolbar.id = 'proxy-toolbar';
  toolbar.style.cssText = \`
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
  \`;

  // 主工具按钮
  const mainButton = document.createElement('button');
  mainButton.innerHTML = '🛠️';
  mainButton.style.cssText = \`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  \`;

  // 功能按钮容器
  const buttonsContainer = document.createElement('div');
  buttonsContainer.id = 'toolbar-buttons';
  buttonsContainer.style.cssText = \`
    display: none;
    flex-direction: column;
    gap: 10px;
  \`;

  // 功能按钮
  const cookieButton = createToolButton('🍪', 'Cookie注入', showCookiePanel);
  const adblockButton = createToolButton('🛡️', '广告拦截', showAdblockPanel);
  const snifferButton = createToolButton('👃', '资源嗅探', showSnifferPanel);
  const requestButton = createToolButton('🔧', '请求修改', showRequestPanel);
  const imageButton = createToolButton('🖼️', '图片控制', showImageControlPanel);

  buttonsContainer.appendChild(cookieButton);
  buttonsContainer.appendChild(adblockButton);
  buttonsContainer.appendChild(snifferButton);
  buttonsContainer.appendChild(requestButton);
  buttonsContainer.appendChild(imageButton);

  toolbar.appendChild(buttonsContainer);
  toolbar.appendChild(mainButton);
  document.body.appendChild(toolbar);

  // 主按钮点击事件
  mainButton.addEventListener('click', function() {
    const isVisible = buttonsContainer.style.display === 'flex';
    buttonsContainer.style.display = isVisible ? 'none' : 'flex';
    
    // 按钮动画
    if (!isVisible) {
      const buttons = buttonsContainer.children;
      for (let i = 0; i < buttons.length; i++) {
        setTimeout(() => {
          buttons[i].style.transform = 'scale(1)';
          buttons[i].style.opacity = '1';
        }, i * 100);
      }
    }
  });

  // 鼠标悬停效果
  mainButton.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.1)';
    this.style.background = 'rgba(255, 255, 255, 0.3)';
  });

  mainButton.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
    this.style.background = 'rgba(255, 255, 255, 0.2)';
  });
}

function createToolButton(emoji, title, clickHandler) {
  const button = document.createElement('button');
  button.innerHTML = emoji;
  button.title = title;
  button.style.cssText = \`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    transform: scale(0);
    opacity: 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  \`;

  button.addEventListener('click', clickHandler);
  button.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.1)';
    this.style.background = 'rgba(255, 255, 255, 0.25)';
  });

  button.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
    this.style.background = 'rgba(255, 255, 255, 0.15)';
  });

  return button;
}

//---***========================================***---Cookie注入功能---***========================================***---
function showCookiePanel() {
  const currentUrl = getOriginalUrl(window.location.href);
  const currentHost = new URL(currentUrl).hostname;
  
  // 从localStorage获取已保存的cookie
  const savedCookies = JSON.parse(localStorage.getItem('proxyCookies') || '{}');
  const siteCookies = savedCookies[currentHost] || { type: 'combined', combined: '', segments: [] };
  
  const panel = createPanel('🍪 Cookie注入', \`
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">注入地址:</label>
      <input type="text" id="cookie-url" value="\${currentHost}" readonly 
             style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;">
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">输入方式:</label>
      <select id="cookie-type" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;">
        <option value="combined" \${siteCookies.type === 'combined' ? 'selected' : ''}>合成Cookie</option>
        <option value="segments" \${siteCookies.type === 'segments' ? 'selected' : ''}>分段Cookie</option>
      </select>
    </div>
    
    <div id="combined-section" style="margin-bottom: 15px; display: \${siteCookies.type === 'combined' ? 'block' : 'none'}">
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">合成Cookie:</label>
      <textarea id="combined-cookie" placeholder="例如: name=value; name2=value2" 
                style="width: 100%; height: 80px; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; resize: vertical;">\${siteCookies.combined || ''}</textarea>
    </div>
    
    <div id="segments-section" style="margin-bottom: 15px; display: \${siteCookies.type === 'segments' ? 'block' : 'none'}">
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">分段Cookie:</label>
      <div id="cookie-segments">
        \${(siteCookies.segments || []).map(segment => \`
          <div class="cookie-segment" style="display: flex; gap: 8px; margin-bottom: 8px;">
            <input type="text" class="cookie-name" placeholder="名称" value="\${segment.name}" 
                   style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;">
            <input type="text" class="cookie-value" placeholder="值" value="\${segment.value}" 
                   style="flex: 2; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;">
            <button type="button" class="remove-segment" style="padding: 8px; background: rgba(255,59,59,0.3); border: 1px solid rgba(255,59,59,0.5); border-radius: 8px; color: white; cursor: pointer;">×</button>
          </div>
        \`).join('')}
      </div>
      <button type="button" id="add-segment" style="width: 100%; padding: 8px; background: rgba(76,175,80,0.3); border: 1px solid rgba(76,175,80,0.5); border-radius: 8px; color: white; cursor: pointer;">+ 添加字段</button>
    </div>
    
    <div style="display: flex; gap: 10px;">
      <button type="button" id="save-cookie" style="flex: 1; padding: 10px; background: rgba(76,175,80,0.3); border: 1px solid rgba(76,175,80,0.5); border-radius: 8px; color: white; cursor: pointer;">保存</button>
      <button type="button" id="inject-cookie" style="flex: 1; padding: 10px; background: rgba(33,150,243,0.3); border: 1px solid rgba(33,150,243,0.5); border-radius: 8px; color: white; cursor: pointer;">立即注入</button>
      <button type="button" id="convert-cookie" style="flex: 1; padding: 10px; background: rgba(255,152,0,0.3); border: 1px solid rgba(255,152,0,0.5); border-radius: 8px; color: white; cursor: pointer;">转换格式</button>
    </div>
  \`);

  // 事件处理
  document.getElementById('cookie-type').addEventListener('change', function() {
    document.getElementById('combined-section').style.display = this.value === 'combined' ? 'block' : 'none';
    document.getElementById('segments-section').style.display = this.value === 'segments' ? 'block' : 'none';
  });

  document.getElementById('add-segment').addEventListener('click', function() {
    const container = document.getElementById('cookie-segments');
    const segment = document.createElement('div');
    segment.className = 'cookie-segment';
    segment.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px;';
    segment.innerHTML = \`
      <input type="text" class="cookie-name" placeholder="名称" 
             style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;">
      <input type="text" class="cookie-value" placeholder="值" 
             style="flex: 2; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;">
      <button type="button" class="remove-segment" style="padding: 8px; background: rgba(255,59,59,0.3); border: 1px solid rgba(255,59,59,0.5); border-radius: 8px; color: white; cursor: pointer;">×</button>
    \`;
    container.appendChild(segment);
    
    segment.querySelector('.remove-segment').addEventListener('click', function() {
      container.removeChild(segment);
    });
  });

  // 移除分段的事件委托
  document.getElementById('cookie-segments').addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-segment')) {
      e.target.closest('.cookie-segment').remove();
    }
  });

  document.getElementById('save-cookie').addEventListener('click', saveCookie);
  document.getElementById('inject-cookie').addEventListener('click', injectCookie);
  document.getElementById('convert-cookie').addEventListener('click', convertCookieFormat);
}

function saveCookie() {
  const currentHost = document.getElementById('cookie-url').value;
  const type = document.getElementById('cookie-type').value;
  
  const savedCookies = JSON.parse(localStorage.getItem('proxyCookies') || '{}');
  
  if (type === 'combined') {
    const combined = document.getElementById('combined-cookie').value;
    savedCookies[currentHost] = { type, combined, segments: [] };
  } else {
    const segments = [];
    document.querySelectorAll('.cookie-segment').forEach(segment => {
      const name = segment.querySelector('.cookie-name').value;
      const value = segment.querySelector('.cookie-value').value;
      if (name && value) {
        segments.push({ name, value });
      }
    });
    savedCookies[currentHost] = { type, combined: '', segments };
  }
  
  localStorage.setItem('proxyCookies', JSON.stringify(savedCookies));
  showNotification('Cookie保存成功!', 'success');
}

function injectCookie() {
  const currentHost = document.getElementById('cookie-url').value;
  const type = document.getElementById('cookie-type').value;
  
  let cookieString = '';
  if (type === 'combined') {
    cookieString = document.getElementById('combined-cookie').value;
  } else {
    const segments = [];
    document.querySelectorAll('.cookie-segment').forEach(segment => {
      const name = segment.querySelector('.cookie-name').value;
      const value = segment.querySelector('.cookie-value').value;
      if (name && value) {
        segments.push(\`\${name}=\${value}\`);
      }
    });
    cookieString = segments.join('; ');
  }
  
  // 注入cookie
  if (cookieString) {
    cookieString.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        document.cookie = \`\${name}=\${value}; path=/; domain=\${currentHost}\`;
      }
    });
    showNotification('Cookie注入成功!', 'success');
    location.reload();
  }
}

function convertCookieFormat() {
  const type = document.getElementById('cookie-type').value;
  
  if (type === 'combined') {
    // 合成转分段
    const combined = document.getElementById('combined-cookie').value;
    const segments = combined.split(';').map(segment => {
      const [name, value] = segment.trim().split('=');
      return { name: name || '', value: value || '' };
    }).filter(segment => segment.name && segment.value);
    
    const container = document.getElementById('cookie-segments');
    container.innerHTML = '';
    segments.forEach(segment => {
      const segmentDiv = document.createElement('div');
      segmentDiv.className = 'cookie-segment';
      segmentDiv.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px;';
      segmentDiv.innerHTML = \`
        <input type="text" class="cookie-name" placeholder="名称" value="\${segment.name}" 
               style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;">
        <input type="text" class="cookie-value" placeholder="值" value="\${segment.value}" 
               style="flex: 2; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;">
        <button type="button" class="remove-segment" style="padding: 8px; background: rgba(255,59,59,0.3); border: 1px solid rgba(255,59,59,0.5); border-radius: 8px; color: white; cursor: pointer;">×</button>
      \`;
      container.appendChild(segmentDiv);
    });
    
    document.getElementById('cookie-type').value = 'segments';
    document.getElementById('combined-section').style.display = 'none';
    document.getElementById('segments-section').style.display = 'block';
  } else {
    // 分段转合成
    const segments = [];
    document.querySelectorAll('.cookie-segment').forEach(segment => {
      const name = segment.querySelector('.cookie-name').value;
      const value = segment.querySelector('.cookie-value').value;
      if (name && value) {
        segments.push(\`\${name}=\${value}\`);
      }
    });
    
    document.getElementById('combined-cookie').value = segments.join('; ');
    document.getElementById('cookie-type').value = 'combined';
    document.getElementById('combined-section').style.display = 'block';
    document.getElementById('segments-section').style.display = 'none';
  }
}

//---***========================================***---广告拦截功能---***========================================***---
let adBlockEnabled = false;
let adBlockRules = [];
let blockedAdsCount = 0;

function showAdblockPanel() {
  const panel = createPanel('🛡️ 广告拦截', \`
    <div style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0;">广告拦截</h3>
        <label class="switch">
          <input type="checkbox" id="adblock-toggle" \${adBlockEnabled ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
      
      <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <div style="font-size: 24px; font-weight: bold; color: #4caf50; text-align: center; margin-bottom: 10px;">\${blockedAdsCount}</div>
        <div style="text-align: center;">已拦截广告数量</div>
      </div>
    </div>
    
    <div style="margin-bottom: 15px;">
      <h4 style="margin-bottom: 10px;">规则订阅</h4>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="easylist" checked>
          <span>EasyList</span>
        </label>
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="easylist-china" checked>
          <span>EasyList China</span>
        </label>
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="easyprivacy" checked>
          <span>EasyPrivacy</span>
        </label>
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="cjx-annoyance" checked>
          <span>CJX's Annoyance List</span>
        </label>
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="anti-adblock" checked>
          <span>Anti-Adblock</span>
        </label>
      </div>
    </div>
    
    <div style="margin-bottom: 15px;">
      <h4 style="margin-bottom: 10px;">自定义规则</h4>
      <textarea id="custom-rules" placeholder="添加自定义规则（每行一个）" 
                style="width: 100%; height: 100px; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; resize: vertical;"></textarea>
      <button type="button" id="save-rules" style="width: 100%; padding: 8px; margin-top: 8px; background: rgba(76,175,80,0.3); border: 1px solid rgba(76,175,80,0.5); border-radius: 8px; color: white; cursor: pointer;">保存规则</button>
    </div>
    
    <div>
      <button type="button" id="mark-ad" style="width: 100%; padding: 10px; background: rgba(255,152,0,0.3); border: 1px solid rgba(255,152,0,0.5); border-radius: 8px; color: white; cursor: pointer;">标记广告元素</button>
    </div>
  \`);

  // 开关样式
  const style = document.createElement('style');
  style.textContent = \`
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
      background-color: #4caf50;
    }
    input:checked + .slider:before {
      transform: translateX(26px);
    }
  \`;
  document.head.appendChild(style);

  document.getElementById('adblock-toggle').addEventListener('change', function() {
    adBlockEnabled = this.checked;
    if (adBlockEnabled) {
      enableAdBlock();
      showNotification('广告拦截已开启', 'success');
    } else {
      disableAdBlock();
      showNotification('广告拦截已关闭', 'info');
    }
  });

  document.getElementById('save-rules').addEventListener('click', saveCustomRules);
  document.getElementById('mark-ad').addEventListener('click', startAdMarking);
}

async function enableAdBlock() {
  adBlockRules = [];
  blockedAdsCount = 0;
  
  // 加载选中的规则订阅
  const subscriptions = {
    easylist: 'https://easylist-downloads.adblockplus.org/easylist.txt',
    'easylist-china': 'https://easylist-downloads.adblockplus.org/easylistchina.txt',
    easyprivacy: 'https://easylist-downloads.adblockplus.org/easyprivacy.txt',
    'cjx-annoyance': 'https://fastly.jsdelivr.net/gh/cjx82630/cjxlist/cjx-annoyance.txt',
    'anti-adblock': 'https://easylist-downloads.adblockplus.org/antiadblockfilters.txt'
  };
  
  for (const [id, url] of Object.entries(subscriptions)) {
    if (document.getElementById(id)?.checked) {
      try {
        const rules = await loadRulesFromUrl(url);
        adBlockRules = adBlockRules.concat(rules);
        showNotification(\`\${id} 规则加载成功\`, 'success');
      } catch (error) {
        console.error(\`Failed to load \${id}:\`, error);
      }
    }
  }
  
  // 加载自定义规则
  const customRules = localStorage.getItem('adblockCustomRules');
  if (customRules) {
    adBlockRules = adBlockRules.concat(customRules.split('\\n').filter(rule => rule.trim()));
  }
  
  interceptAds();
}

async function loadRulesFromUrl(url) {
  const response = await fetch(url);
  const text = await response.text();
  return text.split('\\n')
    .filter(line => line && !line.startsWith('!') && !line.startsWith('['))
    .map(rule => rule.trim());
}

function disableAdBlock() {
  adBlockRules = [];
  // 恢复被拦截的元素
  document.querySelectorAll('[data-proxy-ad-blocked]').forEach(el => {
    el.style.display = el.getAttribute('data-original-display') || '';
    el.removeAttribute('data-proxy-ad-blocked');
    el.removeAttribute('data-original-display');
  });
}

function interceptAds() {
  if (!adBlockEnabled) return;
  
  // 拦截网络请求
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    const url = typeof input === 'string' ? input : input.url;
    
    if (shouldBlock(url)) {
      console.log('Blocked ad request:', url);
      blockedAdsCount++;
      return Promise.reject(new Error('Ad blocked'));
    }
    
    return originalFetch.call(this, input, init);
  };

  // 拦截图片加载
  const originalImage = Image;
  window.Image = function() {
    const img = new originalImage();
    const originalSrc = Object.getOwnPropertyDescriptor(originalImage.prototype, 'src');
    
    Object.defineProperty(img, 'src', {
      get: function() {
        return originalSrc.get.call(this);
      },
      set: function(value) {
        if (shouldBlock(value)) {
          console.log('Blocked ad image:', value);
          blockedAdsCount++;
          return;
        }
        originalSrc.set.call(this, value);
      }
    });
    
    return img;
  };

  // 拦截现有元素
  blockExistingAds();
  
  // 观察新元素
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) { // Element node
          blockAdsInElement(node);
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function shouldBlock(url) {
  return adBlockRules.some(rule => {
    try {
      const regex = new RegExp(rule.replace(/\\*/g, '.*'));
      return regex.test(url);
    } catch {
      return url.includes(rule);
    }
  });
}

function blockExistingAds() {
  // 阻止广告iframe
  document.querySelectorAll('iframe').forEach(iframe => {
    if (shouldBlock(iframe.src)) {
      iframe.style.display = 'none';
      iframe.setAttribute('data-proxy-ad-blocked', 'true');
      blockedAdsCount++;
    }
  });
  
  // 阻止广告图片
  document.querySelectorAll('img').forEach(img => {
    if (shouldBlock(img.src)) {
      const originalDisplay = window.getComputedStyle(img).display;
      img.setAttribute('data-original-display', originalDisplay);
      img.style.display = 'none';
      img.setAttribute('data-proxy-ad-blocked', 'true');
      blockedAdsCount++;
    }
  });
}

function blockAdsInElement(element) {
  if (element.tagName === 'IFRAME' && shouldBlock(element.src)) {
    element.style.display = 'none';
    element.setAttribute('data-proxy-ad-blocked', 'true');
    blockedAdsCount++;
  }
  
  if (element.tagName === 'IMG' && shouldBlock(element.src)) {
    const originalDisplay = window.getComputedStyle(element).display;
    element.setAttribute('data-original-display', originalDisplay);
    element.style.display = 'none';
    element.setAttribute('data-proxy-ad-blocked', 'true');
    blockedAdsCount++;
  }
  
  element.querySelectorAll('iframe, img').forEach(child => {
    blockAdsInElement(child);
  });
}

function saveCustomRules() {
  const rules = document.getElementById('custom-rules').value.split('\\n').filter(rule => rule.trim());
  localStorage.setItem('adblockCustomRules', rules.join('\\n'));
  if (adBlockEnabled) {
    adBlockRules = adBlockRules.concat(rules);
  }
  showNotification('自定义规则已保存', 'success');
}

function startAdMarking() {
  // 关闭所有面板
  const existingPanel = document.getElementById('proxy-tool-panel');
  if (existingPanel) {
    document.body.removeChild(existingPanel);
  }
  
  showNotification('点击页面上的广告元素进行标记，再次点击工具栏按钮退出标记模式', 'info');
  
  document.body.style.cursor = 'crosshair';
  
  function markElement(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const element = e.target;
    
    // 切换标记状态
    if (element.hasAttribute('data-proxy-ad-marked')) {
      element.removeAttribute('data-proxy-ad-marked');
      element.style.outline = '';
      const removeBtn = element.querySelector('.proxy-ad-remove-btn');
      if (removeBtn) {
        element.removeChild(removeBtn);
      }
    } else {
      element.setAttribute('data-proxy-ad-marked', 'true');
      element.style.outline = '3px solid red';
      element.style.position = 'relative';
      
      // 添加删除按钮
      const removeBtn = document.createElement('button');
      removeBtn.innerHTML = '×';
      removeBtn.className = 'proxy-ad-remove-btn';
      removeBtn.style.cssText = \`
        position: absolute;
        top: -12px;
        right: -12px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: red;
        color: white;
        border: none;
        cursor: pointer;
        z-index: 10001;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      \`;
      
      removeBtn.onclick = function(e) {
        e.stopPropagation();
        element.removeAttribute('data-proxy-ad-marked');
        element.style.outline = '';
        element.removeChild(removeBtn);
        
        // 添加到自定义规则
        const src = element.src || element.href || '';
        if (src) {
          const domain = new URL(src, window.location.href).hostname;
          const customRules = localStorage.getItem('adblockCustomRules') || '';
          if (!customRules.includes(domain)) {
            const newRules = customRules ? customRules + '\\n' + domain : domain;
            localStorage.setItem('adblockCustomRules', newRules);
            if (adBlockEnabled) {
              adBlockRules.push(domain);
            }
          }
        }
      };
      
      element.appendChild(removeBtn);
    }
    
    return false;
  }
  
  document.addEventListener('click', markElement, true);
}

//---***========================================***---资源嗅探功能---***========================================***---
let requests = [];
let requestInterceptorEnabled = false;
let requestObserver = null;

function showSnifferPanel() {
  const panel = createPanel('👃 资源嗅探', \`
    <div style="margin-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0;">请求监控</h3>
        <label class="switch">
          <input type="checkbox" id="sniffer-toggle" \${requestInterceptorEnabled ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
    </div>
    
    <div style="margin-bottom: 15px;">
      <div style="display: flex; gap: 8px; margin-bottom: 10px;">
        <button type="button" id="clear-requests" style="flex: 1; padding: 8px; background: rgba(244,67,54,0.3); border: 1px solid rgba(244,67,54,0.5); border-radius: 8px; color: white; cursor: pointer;">清空记录</button>
        <button type="button" id="export-requests" style="flex: 1; padding: 8px; background: rgba(76,175,80,0.3); border: 1px solid rgba(76,175,80,0.5); border-radius: 8px; color: white; cursor: pointer;">导出数据</button>
      </div>
      <div style="display: flex; gap: 8px;">
        <button type="button" id="filter-requests" style="flex: 1; padding: 8px; background: rgba(33,150,243,0.3); border: 1px solid rgba(33,150,243,0.5); border-radius: 8px; color: white; cursor: pointer;">过滤设置</button>
        <button type="button" id="auto-refresh" style="flex: 1; padding: 8px; background: rgba(156,39,176,0.3); border: 1px solid rgba(156,39,176,0.5); border-radius: 8px; color: white; cursor: pointer;">自动刷新</button>
      </div>
    </div>
    
    <div style="height: 300px; overflow-y: auto; background: rgba(255,255,255,0.1); border-radius: 8px; padding: 10px;">
      <div id="requests-list">
        \${requests.map((req, index) => \`
          <div class="request-item" style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); cursor: pointer;" data-index="\${index}">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: bold; color: \${getMethodColor(req.method)}">\${req.method}</span>
              <span style="font-size: 12px; opacity: 0.7;">\${new Date(req.timestamp).toLocaleTimeString()}</span>
            </div>
            <div style="font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="\${req.url}">\${req.url}</div>
            <div style="font-size: 11px; opacity: 0.7;">状态: \${req.status} | 类型: \${req.type} | 大小: \${formatSize(req.size)}</div>
          </div>
        \`).join('')}
        \${requests.length === 0 ? '<div style="text-align: center; opacity: 0.7; padding: 20px;">暂无请求记录</div>' : ''}
      </div>
    </div>
  \`);

  document.getElementById('sniffer-toggle').addEventListener('change', function() {
    requestInterceptorEnabled = this.checked;
    if (requestInterceptorEnabled) {
      startRequestInterception();
      showNotification('请求拦截已开启', 'success');
    } else {
      stopRequestInterception();
      showNotification('请求拦截已关闭', 'info');
    }
  });

  document.getElementById('clear-requests').addEventListener('click', function() {
    requests = [];
    updateRequestsList();
  });

  document.getElementById('export-requests').addEventListener('click', function() {
    const data = JSON.stringify(requests, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'requests.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('filter-requests').addEventListener('click', showFilterPanel);
  document.getElementById('auto-refresh').addEventListener('click', toggleAutoRefresh);

  // 请求项点击事件
  document.getElementById('requests-list').addEventListener('click', function(e) {
    const item = e.target.closest('.request-item');
    if (item) {
      const index = parseInt(item.dataset.index);
      showRequestDetail(requests[index]);
    }
  });
}

function getMethodColor(method) {
  const colors = {
    'GET': '#4caf50',
    'POST': '#2196f3',
    'PUT': '#ff9800',
    'DELETE': '#f44336',
    'PATCH': '#9c27b0'
  };
  return colors[method] || '#757575';
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function startRequestInterception() {
  const originalFetch = window.fetch;
  const originalXHR = window.XMLHttpRequest;
  
  // 拦截fetch
  window.fetch = function(...args) {
    const startTime = Date.now();
    const requestUrl = typeof args[0] === 'string' ? args[0] : args[0].url;
    const requestMethod = (args[1] && args[1].method) || 'GET';
    
    const request = {
      method: requestMethod,
      url: requestUrl,
      timestamp: startTime,
      type: 'fetch',
      headers: args[1]?.headers || {}
    };
    
    return originalFetch.apply(this, args).then(response => {
      const endTime = Date.now();
      request.status = response.status;
      request.duration = endTime - startTime;
      
      response.clone().text().then(text => {
        request.size = new Blob([text]).size;
        request.responseHeaders = Object.fromEntries(response.headers.entries());
        addRequest(request);
      });
      
      return response;
    }).catch(error => {
      request.status = 'Error';
      request.error = error.message;
      addRequest(request);
      throw error;
    });
  };
  
  // 拦截XMLHttpRequest
  window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    
    let request = {};
    
    xhr.open = function(method, url) {
      request = {
        method: method,
        url: url,
        timestamp: Date.now(),
        type: 'xhr'
      };
      return originalOpen.apply(this, arguments);
    };
    
    xhr.send = function(data) {
      request.requestData = data;
      const startTime = Date.now();
      
      xhr.addEventListener('load', function() {
        request.status = xhr.status;
        request.duration = Date.now() - startTime;
        request.size = xhr.responseText.length;
        request.responseHeaders = {
          'content-type': xhr.getResponseHeader('content-type')
        };
        addRequest(request);
      });
      
      xhr.addEventListener('error', function() {
        request.status = 'Error';
        request.error = 'Request failed';
        addRequest(request);
      });
      
      return originalSend.apply(this, arguments);
    };
    
    return xhr;
  };
  
  // 监听资源加载
  requestObserver = new PerformanceObserver(function(list) {
    list.getEntries().forEach(function(entry) {
      if (entry.initiatorType === 'img' || entry.initiatorType === 'script' || entry.initiatorType === 'css') {
        const request = {
          method: 'GET',
          url: entry.name,
          timestamp: Date.now(),
          type: entry.initiatorType,
          status: 200,
          duration: entry.duration,
          size: entry.transferSize || 0
        };
        addRequest(request);
      }
    });
  });
  
  requestObserver.observe({entryTypes: ['resource']});
}

function stopRequestInterception() {
  if (requestObserver) {
    requestObserver.disconnect();
    requestObserver = null;
  }
}

function addRequest(request) {
  requests.unshift(request); // 新的请求放在前面
  if (requests.length > 1000) {
    requests.pop(); // 限制记录数量
  }
  updateRequestsList();
}

function updateRequestsList() {
  const list = document.getElementById('requests-list');
  if (list) {
    list.innerHTML = requests.map((req, index) => \`
      <div class="request-item" style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); cursor: pointer;" data-index="\${index}">
        <div style="display: flex; justify-content: space-between;">
          <span style="font-weight: bold; color: \${getMethodColor(req.method)}">\${req.method}</span>
          <span style="font-size: 12px; opacity: 0.7;">\${new Date(req.timestamp).toLocaleTimeString()}</span>
        </div>
        <div style="font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="\${req.url}">\${req.url}</div>
        <div style="font-size: 11px; opacity: 0.7;">状态: \${req.status} | 类型: \${req.type} | 大小: \${formatSize(req.size)}</div>
      </div>
    \`).join('') || '<div style="text-align: center; opacity: 0.7; padding: 20px;">暂无请求记录</div>';
  }
}

function showRequestDetail(request) {
  const panel = createPanel('请求详情', \`
    <div style="margin-bottom: 15px;">
      <h4>基本信息</h4>
      <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; font-size: 12px;">
        <div><strong>URL:</strong> \${request.url}</div>
        <div><strong>方法:</strong> \${request.method}</div>
        <div><strong>状态:</strong> \${request.status}</div>
        <div><strong>类型:</strong> \${request.type}</div>
        <div><strong>时间:</strong> \${new Date(request.timestamp).toLocaleString()}</div>
        <div><strong>耗时:</strong> \${request.duration}ms</div>
        <div><strong>大小:</strong> \${formatSize(request.size)}</div>
      </div>
    </div>
    
    \${request.requestData ? \`
    <div style="margin-bottom: 15px;">
      <h4>请求数据</h4>
      <textarea readonly style="width: 100%; height: 100px; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; resize: vertical; font-size: 12px;">\${typeof request.requestData === 'string' ? request.requestData : JSON.stringify(request.requestData)}</textarea>
    </div>
    \` : ''}
    
    \${request.responseHeaders ? \`
    <div style="margin-bottom: 15px;">
      <h4>响应头</h4>
      <textarea readonly style="width: 100%; height: 80px; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; resize: vertical; font-size: 12px;">\${JSON.stringify(request.responseHeaders, null, 2)}</textarea>
    </div>
    \` : ''}
    
    <div style="display: flex; gap: 8px;">
      <button type="button" id="block-request" style="flex: 1; padding: 8px; background: rgba(244,67,54,0.3); border: 1px solid rgba(244,67,54,0.5); border-radius: 8px; color: white; cursor: pointer;">拦截此请求</button>
      <button type="button" id="modify-request" style="flex: 1; padding: 8px; background: rgba(255,152,0,0.3); border: 1px solid rgba(255,152,0,0.5); border-radius: 8px; color: white; cursor: pointer;">修改重发</button>
    </div>
  \`);

  document.getElementById('block-request').addEventListener('click', function() {
    const domain = new URL(request.url).hostname;
    if (adBlockRules.indexOf(domain) === -1) {
      adBlockRules.push(domain);
      showNotification(\`已拦截域名: \${domain}\`, 'success');
    }
  });

  document.getElementById('modify-request').addEventListener('click', function() {
    showRequestModifier(request);
  });
}

function showFilterPanel() {
  const panel = createPanel('过滤设置', \`
    <div style="margin-bottom: 15px;">
      <h4>请求类型过滤</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="filter-fetch" checked>
          <span>Fetch</span>
        </label>
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="filter-xhr" checked>
          <span>XHR</span>
        </label>
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="filter-img" checked>
          <span>图片</span>
        </label>
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="filter-script" checked>
          <span>脚本</span>
        </label>
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="filter-css" checked>
          <span>CSS</span>
        </label>
      </div>
    </div>
    
    <div style="margin-bottom: 15px;">
      <h4>域名过滤</h4>
      <input type="text" id="domain-filter" placeholder="输入域名关键词，用逗号分隔" 
             style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;">
    </div>
    
    <div style="display: flex; gap: 8px;">
      <button type="button" id="apply-filter" style="flex: 1; padding: 10px; background: rgba(76,175,80,0.3); border: 1px solid rgba(76,175,80,0.5); border-radius: 8px; color: white; cursor: pointer;">应用过滤</button>
      <button type="button" id="reset-filter" style="flex: 1; padding: 10px; background: rgba(244,67,54,0.3); border: 1px solid rgba(244,67,54,0.5); border-radius: 8px; color: white; cursor: pointer;">重置过滤</button>
    </div>
  \`);
}

function toggleAutoRefresh() {
  const button = document.getElementById('auto-refresh');
  const isAutoRefresh = button.getAttribute('data-auto-refresh') === 'true';
  
  if (isAutoRefresh) {
    button.removeAttribute('data-auto-refresh');
    button.style.background = 'rgba(156,39,176,0.3)';
    showNotification('自动刷新已关闭', 'info');
  } else {
    button.setAttribute('data-auto-refresh', 'true');
    button.style.background = 'rgba(76,175,80,0.3)';
    showNotification('自动刷新已开启', 'success');
    
    // 每2秒更新一次列表
    setInterval(updateRequestsList, 2000);
  }
}

//---***========================================***---请求修改功能---***========================================***---
function showRequestPanel() {
  const panel = createPanel('🔧 请求修改', \`
    <div style="margin-bottom: 15px;">
      <h3>请求重写规则</h3>
      <p style="opacity: 0.8; font-size: 14px;">修改特定请求的URL、请求头或响应</p>
    </div>
    
    <div style="margin-bottom: 15px;">
      <h4>浏览器标识</h4>
      <select id="user-agent" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;">
        <option value="">默认</option>
        <option value="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36">Android (手机)</option>
        <option value="Mozilla/5.0 (Linux; Android 10; Tablet) AppleWebKit/537.36">Android (平板)</option>
        <option value="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36">Windows (Chrome)</option>
        <option value="Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko">Windows (IE 11)</option>
        <option value="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36">macOS</option>
        <option value="Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1">iPhone</option>
        <option value="Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1">iPad</option>
        <option value="NokiaSeries40">塞班 (Symbian)</option>
      </select>
    </div>
    
    <div style="margin-bottom: 15px;">
      <h4>请求语言</h4>
      <select id="accept-language" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;">
        <option value="">默认</option>
        <option value="zh-CN,zh;q=0.9,en;q=0.8">中文简体</option>
        <option value="zh-TW,zh;q=0.9,en;q=0.8">中文繁体</option>
        <option value="en-US,en;q=0.9">英语</option>
        <option value="ja-JP,ja;q=0.9">日语</option>
        <option value="ko-KR,ko;q=0.9">韩语</option>
        <option value="fr-FR,fr;q=0.9">法语</option>
        <option value="de-DE,de;q=0.9">德语</option>
      </select>
    </div>
    
    <div style="margin-bottom: 15px;">
      <h4>自定义请求头</h4>
      <div id="custom-headers">
        <div class="header-row" style="display: flex; gap: 8px; margin-bottom: 8px;">
          <input type="text" placeholder="Header名称" class="header-name" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;">
          <input type="text" placeholder="Header值" class="header-value" style="flex: 2; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;">
          <button type="button" class="remove-header" style="padding: 8px; background: rgba(255,59,59,0.3); border: 1px solid rgba(255,59,59,0.5); border-radius: 8px; color: white; cursor: pointer;">×</button>
        </div>
      </div>
      <button type="button" id="add-header" style="width: 100%; padding: 8px; background: rgba(76,175,80,0.3); border: 1px solid rgba(76,175,80,0.5); border-radius: 8px; color: white; cursor: pointer;">+ 添加请求头</button>
    </div>
    
    <div style="display: flex; gap: 8px;">
      <button type="button" id="save-settings" style="flex: 1; padding: 10px; background: rgba(76,175,80,0.3); border: 1px solid rgba(76,175,80,0.5); border-radius: 8px; color: white; cursor: pointer;">保存设置</button>
      <button type="button" id="apply-now" style="flex: 1; padding: 10px; background: rgba(33,150,243,0.3); border: 1px solid rgba(33,150,243,0.5); border-radius: 8px; color: white; cursor: pointer;">立即应用</button>
    </div>
  \`);

  // 加载保存的设置
  loadRequestSettings();

  document.getElementById('add-header').addEventListener('click', function() {
    const container = document.getElementById('custom-headers');
    const row = document.createElement('div');
    row.className = 'header-row';
    row.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px;';
    row.innerHTML = \`
      <input type="text" placeholder="Header名称" class="header-name" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;">
      <input type="text" placeholder="Header值" class="header-value" style="flex: 2; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;">
      <button type="button" class="remove-header" style="padding: 8px; background: rgba(255,59,59,0.3); border: 1px solid rgba(255,59,59,0.5); border-radius: 8px; color: white; cursor: pointer;">×</button>
    \`;
    container.appendChild(row);
    
    row.querySelector('.remove-header').addEventListener('click', function() {
      container.removeChild(row);
    });
  });

  document.getElementById('save-settings').addEventListener('click', saveRequestSettings);
  document.getElementById('apply-now').addEventListener('click', applyRequestSettings);
}

function loadRequestSettings() {
  const settings = JSON.parse(localStorage.getItem('requestSettings') || '{}');
  
  if (settings.userAgent) {
    document.getElementById('user-agent').value = settings.userAgent;
  }
  if (settings.acceptLanguage) {
    document.getElementById('accept-language').value = settings.acceptLanguage;
  }
  
  const headersContainer = document.getElementById('custom-headers');
  headersContainer.innerHTML = '';
  
  if (settings.headers && settings.headers.length > 0) {
    settings.headers.forEach(header => {
      const row = document.createElement('div');
      row.className = 'header-row';
      row.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px;';
      row.innerHTML = \`
        <input type="text" placeholder="Header名称" class="header-name" value="\${header.name}" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;">
        <input type="text" placeholder="Header值" class="header-value" value="\${header.value}" style="flex: 2; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;">
        <button type="button" class="remove-header" style="padding: 8px; background: rgba(255,59,59,0.3); border: 1px solid rgba(255,59,59,0.5); border-radius: 8px; color: white; cursor: pointer;">×</button>
      \`;
      headersContainer.appendChild(row);
      
      row.querySelector('.remove-header').addEventListener('click', function() {
        headersContainer.removeChild(row);
      });
    });
  } else {
    // 添加一个空行
    document.getElementById('add-header').click();
  }
}

function saveRequestSettings() {
  const settings = {
    userAgent: document.getElementById('user-agent').value,
    acceptLanguage: document.getElementById('accept-language').value,
    headers: []
  };
  
  document.querySelectorAll('.header-row').forEach(row => {
    const name = row.querySelector('.header-name').value;
    const value = row.querySelector('.header-value').value;
    if (name && value) {
      settings.headers.push({ name, value });
    }
  });
  
  localStorage.setItem('requestSettings', JSON.stringify(settings));
  showNotification('请求设置已保存', 'success');
}

function applyRequestSettings() {
  saveRequestSettings();
  
  // 应用User-Agent
  const userAgent = document.getElementById('user-agent').value;
  if (userAgent) {
    Object.defineProperty(navigator, 'userAgent', {
      get: function() { return userAgent; },
      configurable: true
    });
  }
  
  // 应用Accept-Language
  const acceptLanguage = document.getElementById('accept-language').value;
  if (acceptLanguage) {
    Object.defineProperty(navigator, 'language', {
      get: function() { return acceptLanguage.split(',')[0]; },
      configurable: true
    });
  }
  
  showNotification('请求设置已应用', 'success');
}

function showRequestModifier(request) {
  const panel = createPanel('修改请求', \`
    <div style="margin-bottom: 15px;">
      <h4>修改请求</h4>
      <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; margin-bottom: 10px; font-size: 12px;">
        <strong>原始URL:</strong> \${request.url}
      </div>
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 8px;">新的URL:</label>
      <input type="text" id="modified-url" value="\${request.url}" 
             style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;">
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 8px;">请求方法:</label>
      <select id="modified-method" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;">
        <option value="GET" \${request.method === 'GET' ? 'selected' : ''}>GET</option>
        <option value="POST" \${request.method === 'POST' ? 'selected' : ''}>POST</option>
        <option value="PUT" \${request.method === 'PUT' ? 'selected' : ''}>PUT</option>
        <option value="DELETE" \${request.method === 'DELETE' ? 'selected' : ''}>DELETE</option>
        <option value="PATCH" \${request.method === 'PATCH' ? 'selected' : ''}>PATCH</option>
      </select>
    </div>
    
    <div style="display: flex; gap: 8px;">
      <button type="button" id="send-modified" style="flex: 1; padding: 10px; background: rgba(76,175,80,0.3); border: 1px solid rgba(76,175,80,0.5); border-radius: 8px; color: white; cursor: pointer;">发送修改</button>
      <button type="button" id="cancel-modify" style="flex: 1; padding: 10px; background: rgba(244,67,54,0.3); border: 1px solid rgba(244,67,54,0.5); border-radius: 8px; color: white; cursor: pointer;">取消</button>
    </div>
  \`);

  document.getElementById('send-modified').addEventListener('click', function() {
    const modifiedUrl = document.getElementById('modified-url').value;
    const modifiedMethod = document.getElementById('modified-method').value;
    
    // 重新发送请求
    fetch(modifiedUrl, {
      method: modifiedMethod,
      headers: {
        'X-Original-Url': request.url
      }
    }).then(response => {
      showNotification('修改的请求已发送', 'success');
      document.body.removeChild(panel);
    }).catch(error => {
      showNotification('请求发送失败: ' + error.message, 'error');
    });
  });

  document.getElementById('cancel-modify').addEventListener('click', function() {
    document.body.removeChild(panel);
  });
}

//---***========================================***---图片控制功能---***========================================***---
function showImageControlPanel() {
  const panel = createPanel('🖼️ 图片控制', \`
    <div style="margin-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0;">图片加载控制</h3>
      </div>
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">图片加载模式:</label>
      <select id="image-mode" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;">
        <option value="all">加载所有图片</option>
        <option value="none">不加载图片</option>
        <option value="lazy">懒加载图片</option>
        <option value="cache">仅加载缓存图片</option>
      </select>
    </div>
    
    <div style="margin-bottom: 15px;">
      <h4 style="margin-bottom: 10px;">自定义拦截</h4>
      <textarea id="image-block-rules" placeholder="输入要拦截的图片URL关键词，每行一个" 
                style="width: 100%; height: 80px; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; resize: vertical;"></textarea>
      <button type="button" id="save-image-rules" style="width: 100%; padding: 8px; margin-top: 8px; background: rgba(76,175,80,0.3); border: 1px solid rgba(76,175,80,0.5); border-radius: 8px; color: white; cursor: pointer;">保存图片规则</button>
    </div>
    
    <div style="display: flex; gap: 8px;">
      <button type="button" id="apply-image-settings" style="flex: 1; padding: 10px; background: rgba(76,175,80,0.3); border: 1px solid rgba(76,175,80,0.5); border-radius: 8px; color: white; cursor: pointer;">应用设置</button>
      <button type="button" id="reload-images" style="flex: 1; padding: 10px; background: rgba(33,150,243,0.3); border: 1px solid rgba(33,150,243,0.5); border-radius: 8px; color: white; cursor: pointer;">重新加载图片</button>
    </div>
  \`);

  // 加载保存的设置
  const imageSettings = JSON.parse(localStorage.getItem('imageSettings') || '{}');
  if (imageSettings.mode) {
    document.getElementById('image-mode').value = imageSettings.mode;
  }
  if (imageSettings.blockRules) {
    document.getElementById('image-block-rules').value = imageSettings.blockRules.join('\\n');
  }

  document.getElementById('save-image-rules').addEventListener('click', function() {
    const rules = document.getElementById('image-block-rules').value.split('\\n').filter(rule => rule.trim());
    const settings = JSON.parse(localStorage.getItem('imageSettings') || '{}');
    settings.blockRules = rules;
    localStorage.setItem('imageSettings', JSON.stringify(settings));
    showNotification('图片规则已保存', 'success');
  });

  document.getElementById('apply-image-settings').addEventListener('click', function() {
    const mode = document.getElementById('image-mode').value;
    const settings = JSON.parse(localStorage.getItem('imageSettings') || '{}');
    settings.mode = mode;
    localStorage.setItem('imageSettings', JSON.stringify(settings));
    applyImageSettings(mode);
    showNotification('图片设置已应用', 'success');
  });

  document.getElementById('reload-images').addEventListener('click', function() {
    location.reload();
  });
}

function applyImageSettings(mode) {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    switch (mode) {
      case 'none':
        img.style.display = 'none';
        break;
      case 'lazy':
        img.loading = 'lazy';
        break;
      case 'cache':
        // 这里可以实现缓存逻辑
        break;
      default:
        img.style.display = '';
        img.loading = 'auto';
    }
  });
}

//---***========================================***---通用面板功能---***========================================***---
function createPanel(title, content) {
  // 移除已存在的面板
  const existingPanel = document.getElementById('proxy-tool-panel');
  if (existingPanel) {
    document.body.removeChild(existingPanel);
  }
  
  const panel = document.createElement('div');
  panel.id = 'proxy-tool-panel';
  panel.style.cssText = \`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(25px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    padding: 25px;
    z-index: 10001;
    color: white;
    overflow-y: auto;
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
    font-family: 'Roboto', Arial, sans-serif;
  \`;
  
  panel.innerHTML = \`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0; font-size: 20px; font-weight: bold;">\${title}</h2>
      <button id="close-panel" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 5px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(255,255,255,0.1);">×</button>
    </div>
    \${content}
  \`;
  
  document.body.appendChild(panel);
  
  // 动画显示
  setTimeout(() => {
    panel.style.opacity = '1';
    panel.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 10);
  
  // 关闭按钮事件
  document.getElementById('close-panel').addEventListener('click', function() {
    panel.style.opacity = '0';
    panel.style.transform = 'translate(-50%, -50%) scale(0.8)';
    setTimeout(() => {
      if (panel.parentNode) {
        document.body.removeChild(panel);
      }
    }, 400);
  });
  
  // 点击外部关闭
  panel.addEventListener('click', function(e) {
    if (e.target === panel) {
      panel.style.opacity = '0';
      panel.style.transform = 'translate(-50%, -50%) scale(0.8)';
      setTimeout(() => {
        if (panel.parentNode) {
          document.body.removeChild(panel);
        }
      }, 400);
    }
  });
  
  return panel;
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  const backgroundColor = type === 'success' ? 'rgba(76,175,80,0.9)' : 
                         type === 'error' ? 'rgba(244,67,54,0.9)' : 
                         type === 'warning' ? 'rgba(255,152,0,0.9)' : 
                         'rgba(33,150,243,0.9)';
  
  notification.style.cssText = \`
    position: fixed;
    top: 20px;
    right: 20px;
    background: \${backgroundColor};
    color: white;
    padding: 12px 20px;
    border-radius: 12px;
    z-index: 10002;
    transform: translateX(100%);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.3);
    font-weight: bold;
    max-width: 300px;
    word-wrap: break-word;
  \`;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 400);
  }, 3000);
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
  obsPage();
  covScript();
  initToolbar(); // 初始化工具栏
});

//---***========================================***---在window.error的时候---***========================================***---
window.addEventListener('error', event => {
  var element = event.target || event.srcElement;
  if (element.tagName === 'SCRIPT') {
    if(element.alreadyChanged){
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
  }
}, true);
`;

// =======================================================================================
// 第五部分：主页面HTML模板
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
            overflow-x: hidden;
            overflow-y: auto;
            background-color: #f0f4f8;
        }
        
        body {
            font-family: 'Roboto', Arial, sans-serif;
            color: #2d3748;
            background-image: url('https://www.loliapi.com/acg/');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            background-repeat: no-repeat;
            position: relative;
            padding: 30px 0;
        }
        
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
        
        .container {
            max-width: 700px;
            margin: 0 auto;
            padding: 0 15px;
        }
        
        .content {
            text-align: center;
            width: 100%;
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
                font-size: 0.9rem;
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
</body>
</html>
`;

// =======================================================================================
// 第六部分：密码页面HTML模板
// =======================================================================================

const pwdPage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>请输入密码</title>
  <style>
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1e3c72, #2a5298);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .container {
      background: rgba(255, 255, 255, 0.95);
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      text-align: center;
      color: #333;
    }
    input {
      padding: 0.8rem;
      margin-bottom: 1rem;
      border: 1px solid #2a5298;
      border-radius: 25px;
      width: 200px;
      font-size: 1rem;
    }
    button {
      background: linear-gradient(90deg, #2a5298, #1e3c72);
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      font-size: 1rem;
    }
    button:hover {
      background: linear-gradient(90deg, #1e3c72, #2a5298);
      transform: translateY(-2px);
    }
  </style>
  <script>
    function setPassword() {
      try {
        const cookieDomain = window.location.hostname;
        const password = document.getElementById('password').value;
        const oneWeekLater = new Date();
        oneWeekLater.setTime(oneWeekLater.getTime() + (7 * 24 * 60 * 60 * 1000));
        document.cookie = "${passwordCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + cookieDomain;
        document.cookie = "${passwordCookieName}=" + password + "; expires=" + oneWeekLater.toUTCString() + "; path=/; domain=" + cookieDomain;
        location.reload();
      } catch (e) {
        alert('设置密码失败: ' + e.message);
      }
    }
  </script>
</head>
<body>
  <div class="container">
    <input id="password" type="password" placeholder="请输入密码">
    <button onclick="setPassword()">提交</button>
  </div>
</body>
</html>
`;

// =======================================================================================
// 第七部分：错误页面HTML模板
// =======================================================================================

const redirectError = `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head><body><h2>重定向错误：目标网站可能包含错误的跳转信息，无法解析</h2></body></html>
`;

// =======================================================================================
// 第八部分：主请求处理函数
// =======================================================================================

async function handleRequest(request) {
  try {
    // 防止爬虫
    const userAgent = request.headers.get('User-Agent') || '';
    if (userAgent.includes("Bytespider")) {
      return getHTMLResponse("好不要脸，爬Wikipedia还要用我代理爬，说的就是你们Bytespider。");
    }

    // 检查密码
    const siteCookie = request.headers.get('Cookie') || '';
    if (password) {
      const pwd = getCook(siteCookie, passwordCookieName);
      if (!pwd || pwd !== password) return handleWrongPwd();
    }

    // 处理 favicon 和 robots.txt
    const url = new URL(request.url);
    if (url.pathname.endsWith("favicon.ico")) return getRedirect("https://www.baidu.com/favicon.ico");
    if (url.pathname.endsWith("robots.txt")) {
      return new Response(`User-Agent: *\nDisallow: /`, { headers: { "Content-Type": "text/plain" } });
    }

    // 显示主页面
    const actualUrlStr = url.pathname.substring(url.pathname.indexOf(str) + str.length) + url.search + url.hash;
    if (!actualUrlStr) return getHTMLResponse(mainPage);

    // 检查文件扩展名拦截
    const blockExtensions = getCook(siteCookie, blockExtensionsCookieName) || "";
    const blockAds = getCook(siteCookie, blockAdsCookieName) === "true";
    const extensions = blockExtensions.split(',').map(ext => ext.trim().toLowerCase()).filter(ext => ext);
    if (extensions.length > 0) {
      const fileExt = actualUrlStr.split('.').pop().toLowerCase();
      if (extensions.includes(fileExt)) return new Response(null, { status: 204 });
    }

    // 检查广告拦截
    if (blockAds) {
      const urlLower = actualUrlStr.toLowerCase();
      if (adBlockKeywords.some(keyword => urlLower.includes(keyword))) return new Response(null, { status: 204 });
    }

    // 验证目标 URL
    let test = actualUrlStr;
    if (!test.startsWith("http")) test = "https://" + test;
    try {
      const u = new URL(test);
      if (!u.host.includes(".")) throw new Error();
    } catch {
      const lastVisit = getCook(siteCookie, lastVisitProxyCookie);
      if (lastVisit) return getRedirect(thisProxyServerUrlHttps + lastVisit + "/" + actualUrlStr);
      return getHTMLResponse("无效的 URL 或无法获取上次访问的站点。");
    }

    // 处理没有协议的 URL
    if (!actualUrlStr.startsWith("http") && !actualUrlStr.includes("://")) {
      return getRedirect(thisProxyServerUrlHttps + "https://" + actualUrlStr);
    }

    const actualUrl = new URL(actualUrlStr);

    // 检查主机大小写
    if (actualUrlStr !== actualUrl.href) return getRedirect(thisProxyServerUrlHttps + actualUrl.href);

    // 获取语言设置
    let selectedLanguage = getCook(siteCookie, languageCookieName) || url.searchParams.get('lang') || 'zh-CN';
    if (!supportedLanguages.some(lang => lang.code === selectedLanguage)) selectedLanguage = 'zh-CN';

    // 处理 WebSocket
    if (request.headers.get('Upgrade') === 'websocket') {
      const wsRequest = new Request(actualUrl, {
        headers: request.headers,
        method: request.method
      });
      return fetch(wsRequest);
    }

    // 修改请求头
    const clientHeaderWithChange = new Headers();
    for (const [key, value] of request.headers.entries()) {
      let newValue = value.replace(thisProxyServerUrlHttps, actualUrlStr).replace(thisProxyServerUrl_hostOnly, actualUrl.host);
      if (key.toLowerCase() === 'origin') newValue = actualUrl.origin;
      if (key.toLowerCase() === 'referer') newValue = newValue.replace(thisProxyServerUrlHttps, actualUrl.origin + '/');
      if (key.toLowerCase() === 'accept-language') newValue = selectedLanguage;
      clientHeaderWithChange.set(key, newValue);
    }
    if (!clientHeaderWithChange.has('Origin')) clientHeaderWithChange.set('Origin', actualUrl.origin);
    if (!clientHeaderWithChange.has('Accept-Language')) clientHeaderWithChange.set('Accept-Language', selectedLanguage);

    // 修改请求体
    let clientRequestBodyWithChange;
    if (request.body) {
      clientRequestBodyWithChange = await request.text();
      clientRequestBodyWithChange = clientRequestBodyWithChange
        .replace(thisProxyServerUrlHttps, actualUrlStr)
        .replace(thisProxyServerUrl_hostOnly, actualUrl.host);
    }

    // 创建修改后的请求
    const modifiedRequest = new Request(actualUrl, {
      headers: clientHeaderWithChange,
      method: request.method,
      body: request.body ? clientRequestBodyWithChange : request.body,
      redirect: "manual"
    });

    // 发送请求
    const response = await fetch(modifiedRequest);
    if (response.status.toString().startsWith("3") && response.headers.get("Location")) {
      try {
        const redirectUrl = new URL(response.headers.get("Location"), actualUrl).href;
        if (redirectUrl === 'about:blank') throw new Error('Invalid redirect to about:blank');
        return getRedirect(thisProxyServerUrlHttps + redirectUrl);
      } catch {
        return getHTMLResponse(redirectError + "<br>Redirect URL: " + response.headers.get("Location"));
      }
    }

    // 处理响应
    let modifiedResponse;
    let bd;
    const responseContentType = response.headers.get("Content-Type") || '';
    const hasProxyHintDismissed = getCook(siteCookie, proxyHintCookieName) === "true";
    
    if (response.body) {
      if (responseContentType.startsWith("text/")) {
        bd = await response.text();
        let regex = new RegExp(`(?<!src="|href=")(https?:\\/\\/[^\\s'"]+)`, 'g');
        bd = bd.replace(regex, match => match.includes("http") ? thisProxyServerUrlHttps + match : thisProxyServerUrl_hostOnly + "/" + match);
        if (responseContentType.includes("html") || responseContentType.includes("javascript")) {
          bd = bd.replace(/window\.location/g, "window." + replaceUrlObj);
          bd = bd.replace(/document\.location/g, "document." + replaceUrlObj);
        }
        if (responseContentType.includes("text/html") && bd.includes("<html")) {
          bd = covToAbs(bd, actualUrlStr);
          bd = removeIntegrityAttributes(bd);
          const hasBom = bd.charCodeAt(0) === 0xFEFF;
          if (hasBom) bd = bd.substring(1);
          const inject = `
          <!DOCTYPE html>
          <script id="${injectedJsId}">
          ${hasProxyHintDismissed ? "" : proxyHintInjection}
          ${httpRequestInjection}
          setTimeout(() => { document.getElementById("${injectedJsId}").remove(); }, 1);
          </script>
          `;
          bd = (hasBom ? "\uFEFF" : "") + inject + bd;
        }
        modifiedResponse = new Response(bd, response);
      } else {
        modifiedResponse = new Response(response.body, response);
      }
    } else {
      modifiedResponse = new Response(response.body, response);
    }

    // 处理响应头
    const headers = modifiedResponse.headers;
    const cookieHeaders = [];
    for (const [key, value] of headers.entries()) {
      if (key.toLowerCase() === 'set-cookie') cookieHeaders.push({ headerName: key, headerValue: value });
    }
    if (cookieHeaders.length > 0) {
      cookieHeaders.forEach(cookieHeader => {
        let cookies = cookieHeader.headerValue.split(',').map(cookie => cookie.trim());
        for (let i = 0; i < cookies.length; i++) {
          let parts = cookies[i].split(';').map(part => part.trim());
          const pathIndex = parts.findIndex(part => part.toLowerCase().startsWith('path='));
          let originalPath;
          if (pathIndex !== -1) originalPath = parts[pathIndex].substring("path=".length);
          const absolutePath = "/" + new URL(originalPath || '/', actualUrlStr).href;
          if (pathIndex !== -1) parts[pathIndex] = `Path=${absolutePath}`;
          else parts.push(`Path=${absolutePath}`);
          const domainIndex = parts.findIndex(part => part.toLowerCase().startsWith('domain='));
          if (domainIndex !== -1) parts[domainIndex] = `domain=${thisProxyServerUrl_hostOnly}`;
          else parts.push(`domain=${thisProxyServerUrl_hostOnly}`);
          cookies[i] = parts.join('; ');
        }
        headers.set(cookieHeader.headerName, cookies.join(', '));
      });
    }

    // 设置 cookie 和头
    if (responseContentType.includes("text/html") && response.status === 200 && bd.includes("<html")) {
      headers.append("Set-Cookie", `${lastVisitProxyCookie}=${actualUrl.origin}; Path=/; Domain=${thisProxyServerUrl_hostOnly}`);
      headers.append("Set-Cookie", `${languageCookieName}=${selectedLanguage}; Path=/; Domain=${thisProxyServerUrl_hostOnly}`);
      if (!hasProxyHintDismissed) {
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + 24 * 60 * 60 * 1000);
        headers.append("Set-Cookie", `${proxyHintCookieName}=true; expires=${expiryDate.toUTCString()}; path=/; domain=${thisProxyServerUrl_hostOnly}`);
      }
    }

    for (const [key, value] of headers.entries()) {
      if (key.toLowerCase() === 'access-control-allow-origin') headers.set(key, actualUrl.origin);
      else if (key.toLowerCase() === 'content-security-policy' || key.toLowerCase() === 'content-security-policy-report-only') {
        headers.set(key, value.replace(thisProxyServerUrl_hostOnly, actualUrl.host));
      }
    }

    modifiedResponse.headers.set('Access-Control-Allow-Origin', actualUrl.origin);
    modifiedResponse.headers.set("X-Frame-Options", "ALLOWALL");
    const listHeaderDel = ["Content-Length", "Content-Security-Policy", "Permissions-Policy", "Cross-Origin-Embedder-Policy", "Cross-Origin-Resource-Policy"];
    listHeaderDel.forEach(element => {
      modifiedResponse.headers.delete(element);
      modifiedResponse.headers.delete(element + "-Report-Only");
    });

    if (!hasProxyHintDismissed) {
      modifiedResponse.headers.set("Cache-Control", "max-age=0");
    }

    return modifiedResponse;
  } catch (e) {
    return getHTMLResponse(`请求处理失败: ${e.message}`);
  }
}

// =======================================================================================
// 第九部分：辅助函数
// =======================================================================================

function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

function getCook(cookies, cookiename) {
  const cookiestring = RegExp(escapeRegExp(cookiename) + "=[^;]+").exec(cookies);
  return decodeURIComponent(cookiestring ? cookiestring.toString().replace(/^[^=]+./, "") : "");
}

const matchList = [[/href=("|')([^"']*)("|')/g, `href="`], [/src=("|')([^"']*)("|')/g, `src="`]];
function covToAbs(body, requestPathNow) {
  const original = [];
  const target = [];
  for (const match of matchList) {
    const setAttr = body.matchAll(match[0]);
    if (setAttr) {
      for (const replace of setAttr) {
        if (!replace.length) continue;
        const strReplace = replace[0];
        if (!strReplace.includes(thisProxyServerUrl_hostOnly)) {
          if (!isPosEmbed(body, replace.index)) {
            const relativePath = strReplace.substring(match[1].toString().length, strReplace.length - 1);
            if (!relativePath.startsWith("data:") && !relativePath.startsWith("mailto:") && !relativePath.startsWith("javascript:") && !relativePath.startsWith("chrome") && !relativePath.startsWith("edge")) {
              try {
                const absolutePath = thisProxyServerUrlHttps + new URL(relativePath, requestPathNow).href;
                original.push(strReplace);
                target.push(match[1].toString() + absolutePath + `"`);
              } catch {}
            }
          }
        }
      }
    }
  }
  for (let i = 0; i < original.length; i++) {
    body = body.replace(original[i], target[i]);
  }
  return body;
}

function removeIntegrityAttributes(body) {
  return body.replace(/integrity=("|')([^"']*)("|')/g, '');
}

function isPosEmbed(html, pos) {
  if (pos > html.length || pos < 0) return false;
  const start = html.lastIndexOf('<', pos);
  const end = html.indexOf('>', pos);
  const content = html.slice(start + 1, end === -1 ? html.length : end);
  return content.includes(">") || content.includes("<");
}

function handleWrongPwd() {
  return showPasswordPage ? getHTMLResponse(pwdPage) : getHTMLResponse("<h1>403 Forbidden</h1><br>您无权访问此网页。");
}

function getHTMLResponse(html) {
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function getRedirect(url) {
  return Response.redirect(url, 301);
}