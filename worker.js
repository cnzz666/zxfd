// worker.js
addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  thisProxyServerUrlHttps = `${url.protocol}//${url.hostname}/`;
  thisProxyServerUrl_hostOnly = url.host;
  event.respondWith(handleRequest(event.request));
});

const str = "/";
const lastVisitProxyCookie = "__PROXY_VISITEDSITE__";
const passwordCookieName = "__PROXY_PWD__";
const tokenStore = new Map(); // 存储令牌和对应目标URL
const password = "";
const showPasswordPage = true;
const replaceUrlObj = "__location____";
var thisProxyServerUrlHttps;
var thisProxyServerUrl_hostOnly;

const proxyHintInjection = `
  document.addEventListener('DOMContentLoaded', () => {
    var hint = "Warning: You are currently using a web proxy, so do not log in to any website. Click to close this hint. For further details, please visit <a href=\\"https://github.com/1234567Yang/cf-proxy-ex/\\" style=\\"color:#0277bd;text-decoration:none;font-weight:bold;\\">https://github.com/1234567Yang/cf-proxy-ex/</a>. <br>警告：您当前正在使用网络代理，请勿登录任何网站。单击关闭此提示。详情请见 <a href=\\"https://github.com/1234567Yang/cf-proxy-ex/\\" style=\\"color:#0277bd;text-decoration:none;font-weight:bold;\\">https://github.com/1234567Yang/cf-proxy-ex/</a>。";

    document.body.insertAdjacentHTML(
      'afterbegin',
      "<div style=\\"position:fixed;left:0;top:0;width:100%;height:100vh;background:rgba(0,0,0,0.6);display:flex;justify-content:center;align-items:center;z-index:99999999999999999999999;user-select:none;pointer-events:auto;\\" id=\\"__PROXY_HINT_DIV__\\" onclick=\\"document.getElementById('__PROXY_HINT_DIV__').remove();\\">" +
      "<div class=\\"proxy-hint-content\\" style=\\"position:relative;width:80%;max-width:600px;background-color:rgba(255,255,255,0.3);border-radius:15px;padding:25px;box-shadow:0 8px 32px rgba(79,195,247,0.3);backdrop-filter:blur(5px);border:1px solid rgba(79,195,247,0.3);text-align:center;transform:scale(0.9);opacity:0;transition:transform 0.5s ease-out, opacity 0.5s ease-out;animation:fadeIn 0.5s ease-out forwards;pointer-events:auto;\\" onclick=\\"event.stopPropagation();\\">" +
      "<h3 style=\\"margin-top:0;color:#0277bd;font-size:22px;text-shadow:0 0 5px rgba(79,195,247,0.3);\\">⚠️ Proxy Usage Alert / 代理使用警告</h3>" +
      "<p style=\\"font-size:16px;line-height:1.6;margin:20px 0;color:#333333;\\">" + hint + "</p>" +
      "<button style=\\"background:linear-gradient(45deg,#4fc3f7,#81d4fa);color:#333333;padding:10px 20px;border:none;border-radius:25px;cursor:pointer;font-size:16px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;transition:all 0.3s ease;\\" onclick=\\"document.getElementById('__PROXY_HINT_DIV__').remove();\\">Close / 关闭</button>" +
      "</div>" +
      "</div>"
    );

    const style = document.createElement('style');
    style.textContent = \`
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      .proxy-hint-content:hover {
        transform: scale(1.02);
        box-shadow: 0 12px 40px rgba(79,195,247,0.5);
      }
      .proxy-hint-content button:hover {
        background: linear-gradient(45deg, #29b6f6, #4fc3f7);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(79,195,247,0.4);
      }
      @media (max-width: 768px) {
        .proxy-hint-content {
          width: 90%;
          padding: 20px;
        }
        .proxy-hint-content h3 {
          font-size: 18px;
        }
        .proxy-hint-content p {
          font-size: 14px;
        }
      }
    \`;
    document.head.appendChild(style);
  });
`;

function generateToken() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function handleRequest(request) {
  const userAgent = request.headers.get('User-Agent');
  if (userAgent.includes("Bytespider")) {
    return getHTMLResponse("好不要脸，爬Wikipedia还要用我代理爬，说的就是你们Bytespider。");
  }

  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(p => p);
  let token = pathParts[0] || '';
  let actualUrlStr = pathParts.slice(1).join('/') + url.search + url.hash;

  // 验证令牌
  if (token && !tokenStore.has(token)) {
    return getHTMLResponse("<h1>403 Forbidden</h1><br>Invalid or expired token.");
  }

  // 处理密码保护
  const siteCookie = request.headers.get('Cookie');
  if (password !== "") {
    const pwd = getCook(passwordCookieName, siteCookie);
    if (!pwd || pwd !== password) {
      return handleWrongPwd();
    }
  }

  // 处理特殊请求
  if (url.pathname.endsWith("favicon.ico")) {
    return getRedirect("https://www.baidu.com/favicon.ico");
  }
  if (url.pathname.endsWith("robots.txt")) {
    return new Response(`User-Agent: *\nDisallow: /`, {
      headers: { "Content-Type": "text/plain" },
    });
  }

  // 显示主页面
  if (!actualUrlStr && !token) {
    return getHTMLResponse(mainPage);
  }

  // 处理令牌生成页面
  if (url.pathname === '/generate-token') {
    const targetUrl = new URLSearchParams(url.search).get('url');
    if (!targetUrl) {
      return getHTMLResponse("<h1>400 Bad Request</h1><br>No target URL provided.");
    }
    const token = generateToken();
    tokenStore.set(token, { url: targetUrl, used: false });
    return getRedirect(`${thisProxyServerUrlHttps}${token}/${targetUrl}`);
  }

  // 验证URL
  try {
    if (!actualUrlStr.startsWith("http")) {
      actualUrlStr = "https://" + actualUrlStr;
    }
    const u = new URL(actualUrlStr);
    if (!u.host.includes(".")) {
      throw new Error();
    }
  } catch {
    const lastVisit = getCook(lastVisitProxyCookie, siteCookie);
    if (lastVisit) {
      return getRedirect(`${thisProxyServerUrlHttps}${token}/${lastVisit}/${actualUrlStr}`);
    }
    return getHTMLResponse("Something is wrong while trying to get your cookie: <br> siteCookie: " + siteCookie);
  }

  // 处理大小写
  const checkHostCase = actualUrlStr.substring(actualUrlStr.indexOf("://") + 3);
  const finalPos = Math.min(
    checkHostCase.indexOf("\\") !== -1 ? checkHostCase.indexOf("\\") : Infinity,
    checkHostCase.indexOf("/") !== -1 ? checkHostCase.indexOf("/") : Infinity
  );
  const hostPart = checkHostCase.substring(0, finalPos !== Infinity ? finalPos : checkHostCase.length);
  if (hostPart.toLowerCase() !== hostPart) {
    return getRedirect(`${thisProxyServerUrlHttps}${token}/${new URL(actualUrlStr).href}`);
  }

  // 标记令牌为已使用
  if (tokenStore.has(token)) {
    tokenStore.get(token).used = true;
  }

  const actualUrl = new URL(actualUrlStr);
  let clientHeaderWithChange = new Headers();
  for (let pair of request.headers.entries()) {
    clientHeaderWithChange.set(pair[0], pair[1].replaceAll(thisProxyServerUrlHttps, actualUrlStr).replaceAll(thisProxyServerUrl_hostOnly, actualUrl.host));
  }

  let clientRequestBodyWithChange;
  if (request.body) {
    clientRequestBodyWithChange = await request.text();
    clientRequestBodyWithChange = clientRequestBodyWithChange
      .replaceAll(thisProxyServerUrlHttps, actualUrlStr)
      .replaceAll(thisProxyServerUrl_hostOnly, actualUrl.host);
  }

  const modifiedRequest = new Request(actualUrl, {
    headers: clientHeaderWithChange,
    method: request.method,
    body: clientRequestBodyWithChange || request.body,
    redirect: "manual"
  });

  const response = await fetch(modifiedRequest);
  if (response.status.toString().startsWith("3") && response.headers.get("Location")) {
    const newToken = generateToken();
    tokenStore.set(newToken, { url: new URL(response.headers.get("Location"), actualUrlStr).href, used: false });
    return getRedirect(`${thisProxyServerUrlHttps}${newToken}/${new URL(response.headers.get("Location"), actualUrlStr).href}`);
  }

  let modifiedResponse;
  let bd;
  const contentType = response.headers.get("Content-Type");

  if (response.body) {
    if (contentType && contentType.startsWith("text/")) {
      bd = await response.text();
      let regex = new RegExp(`(?<!src="|href=")(https?:\\/\\/[^\s'"]+)`, 'g');
      bd = bd.replace(regex, match => `${thisProxyServerUrlHttps}${token}/${match}`);
      
      if (contentType && (contentType.includes("html") || contentType.includes("javascript"))) {
        bd = bd.replaceAll("window.location", `window.${replaceUrlObj}`);
        bd = bd.replaceAll("document.location", `document.${replaceUrlObj}`);
      }

      if (contentType && contentType.includes("text/html") && bd.includes("<html")) {
        bd = covToAbs(bd, actualUrlStr, token);
        bd = removeIntegrityAttributes(bd);
        const hasBom = bd.charCodeAt(0) === 0xFEFF;
        if (hasBom) {
          bd = bd.substring(1);
        }
        bd = (hasBom ? "\uFEFF" : "") + `<script>${proxyHintInjection}${httpRequestInjection}</script>` + bd;
      }
      modifiedResponse = new Response(bd, response);
    } else {
      modifiedResponse = new Response(response.body, response);
    }
  } else {
    modifiedResponse = new Response(response.body, response);
  }

  let headers = modifiedResponse.headers;
  let cookieHeaders = [];
  for (let [key, value] of headers.entries()) {
    if (key.toLowerCase() === 'set-cookie') {
      cookieHeaders.push({ headerName: key, headerValue: value });
    }
  }

  if (cookieHeaders.length > 0) {
    cookieHeaders.forEach(cookieHeader => {
      let cookies = cookieHeader.headerValue.split(',').map(cookie => cookie.trim());
      for (let i = 0; i < cookies.length; i++) {
        let parts = cookies[i].split(';').map(part => part.trim());
        let pathIndex = parts.findIndex(part => part.toLowerCase().startsWith('path='));
        let originalPath;
        if (pathIndex !== -1) {
          originalPath = parts[pathIndex].substring("path=".length);
        }
        let absolutePath = `/${token}/${new URL(originalPath || '/', actualUrlStr).href}`;
        if (pathIndex !== -1) {
          parts[pathIndex] = `Path=${absolutePath}`;
        } else {
          parts.push(`Path=${absolutePath}`);
        }
        let domainIndex = parts.findIndex(part => part.toLowerCase().startsWith('domain='));
        if (domainIndex !== -1) {
          parts[domainIndex] = `domain=${thisProxyServerUrl_hostOnly}`;
        } else {
          parts.push(`domain=${thisProxyServerUrl_hostOnly}`);
        }
        cookies[i] = parts.join('; ');
      }
      headers.set(cookieHeader.headerName, cookies.join(', '));
    });
  }

  if (contentType && contentType.includes("text/html") && response.status === 200 && bd.includes("<html")) {
    headers.append("Set-Cookie", `${lastVisitProxyCookie}=${actualUrl.origin}; Path=/; Domain=${thisProxyServerUrl_hostOnly}`);
  }

  headers.set('Access-Control-Allow-Origin', '*');
  headers.set("X-Frame-Options", "ALLOWALL");
  const listHeaderDel = ["Content-Security-Policy", "Permissions-Policy", "Cross-Origin-Embedder-Policy", "Cross-Origin-Resource-Policy"];
  listHeaderDel.forEach(element => {
    headers.delete(element);
    headers.delete(element + "-Report-Only");
  });

  headers.set("Cache-Control", "max-age=0");

  // 在页面加载完成后销毁令牌
  if (contentType && contentType.includes("text/html")) {
    tokenStore.delete(token);
  }

  return modifiedResponse;
}

function covToAbs(body, requestPathNow, token) {
  const matchList = [
    [/href=("|')([^"']*)("|')/g, `href="`],
    [/src=("|')([^"']*)("|')/g, `src="`]
  ];
  let original = [];
  let target = [];

  for (let match of matchList) {
    const setAttr = body.matchAll(match[0]);
    if (setAttr) {
      for (let replace of setAttr) {
        if (replace.length === 0) continue;
        let strReplace = replace[0];
        if (!strReplace.includes(thisProxyServerUrl_hostOnly)) {
          if (!isPosEmbed(body, replace.index)) {
            let relativePath = strReplace.substring(match[1].length, strReplace.length - 1);
            if (!relativePath.startsWith("data:") && !relativePath.startsWith("mailto:") && !relativePath.startsWith("javascript:") && !relativePath.startsWith("chrome") && !relativePath.startsWith("edge")) {
              try {
                const newToken = generateToken();
                tokenStore.set(newToken, { url: new URL(relativePath, requestPathNow).href, used: false });
                const absolutePath = `${thisProxyServerUrlHttps}${newToken}/${new URL(relativePath, requestPathNow).href}`;
                original.push(strReplace);
                target.push(`${match[1]}${absolutePath}"`);
              } catch {
                // 无视
              }
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
  let start = html.lastIndexOf('<', pos);
  if (start === -1) start = 0;
  let end = html.indexOf('>', pos);
  if (end === -1) end = html.length;
  let content = html.slice(start + 1, end);
  return content.includes(">") || content.includes("<");
}

function handleWrongPwd() {
  if (showPasswordPage) {
    return getHTMLResponse(pwdPage);
  } else {
    return getHTMLResponse("<h1>403 Forbidden</h1><br>You do not have access to view this webpage.");
  }
}

function getHTMLResponse(html) {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}

function getRedirect(url) {
  return Response.redirect(url, 301);
}

function getCook(cookiename, cookies) {
  const cookiestring = RegExp(cookiename + "=[^;]+").exec(cookies);
  return decodeURIComponent(cookiestring ? cookiestring.toString().replace(/^[^=]+./, "") : "");
}

// 修改httpRequestInjection以支持令牌
var httpRequestInjection = `
//---***========================================***---information---***========================================***---
var now = new URL(window.location.href);
var token = now.pathname.split('/')[1];
var base = now.host;
var protocol = now.protocol;
var nowlink = protocol + "//" + base + "/" + token + "/";
var oriUrlStr = window.location.href.substring(nowlink.length);
var oriUrl = new URL(oriUrlStr);

var path = now.pathname.substring(1);
if(!path.startsWith("http")) path = "https://" + path;

var original_host = oriUrlStr.substring(oriUrlStr.indexOf("://") + "://".length);
original_host = original_host.split('/')[0];
var mainOnly = oriUrlStr.substring(0, oriUrlStr.indexOf("://")) + "://" + original_host + "/";

//---***========================================***---通用func---***========================================***---
function changeURL(relativePath) {
  if (relativePath == null) return null;
  try {
    if (relativePath.startsWith("data:") || relativePath.startsWith("mailto:") || relativePath.startsWith("javascript:") || relativePath.startsWith("chrome") || relativePath.startsWith("edge")) return relativePath;
  } catch {
    // ignore
  }
  try {
    if (relativePath && relativePath.startsWith(nowlink)) relativePath = relativePath.substring(nowlink.length);
    if (relativePath && relativePath.startsWith(base + "/" + token + "/")) relativePath = relativePath.substring(base.length + token.length + 2);
    if (relativePath && relativePath.startsWith(base)) relativePath = relativePath.substring(base.length);
  } catch {
    // ignore
  }
  try {
    var absolutePath = new URL(relativePath, oriUrlStr).href;
    absolutePath = absolutePath.replace(window.location.href, path);
    absolutePath = absolutePath.replace(encodeURI(window.location.href), path);
    absolutePath = absolutePath.replace(encodeURIComponent(window.location.href), path);
    absolutePath = absolutePath.replace(nowlink, mainOnly);
    absolutePath = absolutePath.replace(nowlink, encodeURI(mainOnly));
    absolutePath = absolutePath.replace(nowlink, encodeURIComponent(mainOnly));
    absolutePath = absolutePath.replace(base, original_host);
    absolutePath = nowlink + absolutePath;
    return absolutePath;
  } catch (e) {
    console.log("Exception occurred: " + e.message + oriUrlStr + "   " + relativePath);
    return "";
  }
}

//---***========================================***---注入网络---***========================================***---
function networkInject() {
  var originalOpen = XMLHttpRequest.prototype.open;
  var originalFetch = window.fetch;
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
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
function windowOpenInject() {
  const originalOpen = window.open;
  window.open = function(url, name, specs) {
    let modifiedUrl = changeURL(url);
    return originalOpen.call(window, modifiedUrl, name, specs);
  };
  console.log("WINDOW OPEN INJECTED");
}

//---***========================================***---注入append元素---***========================================***---
function appendChildInject() {
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function(child) {
    try {
      if (child.src) {
        child.src = changeURL(child.src);
      }
      if (child.href) {
        child.href = changeURL(child.href);
      }
    } catch {
      // ignore
    }
    return originalAppendChild.call(this, child);
  };
  console.log("APPEND CHILD INJECTED");
}

//---***========================================***---注入元素的src和href---***========================================***---
function elementPropertyInject() {
  const originalSetAttribute = HTMLElement.prototype.setAttribute;
  HTMLElement.prototype.setAttribute = function(name, value) {
    if (name === "src" || name === "href") {
      value = changeURL(value);
    }
    originalSetAttribute.call(this, name, value);
  };
  console.log("ELEMENT PROPERTY (new Proxy) INJECTED");
}

//---***========================================***---注入location---***========================================***---
class ProxyLocation {
  constructor(originalLocation) {
    this.originalLocation = originalLocation;
  }

  getStrNPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
  }

  getOriginalHref() {
    return window.location.href.substring(this.getStrNPosition(window.location.href, "/", 3) + 1);
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
    return this.getOriginalHref();
  }

  set href(url) {
    this.originalLocation.href = changeURL(url);
  }

  get protocol() {
    return oriUrl.protocol;
  }

  set protocol(value) {
    oriUrl.protocol = value;
    window.location.href = nowlink + oriUrl.href;
  }

  get host() {
    return oriUrl.host;
  }

  set host(value) {
    oriUrl.host = value;
    window.location.href = nowlink + oriUrl.href;
  }

  get hostname() {
    return oriUrl.hostname;
  }

  set hostname(value) {
    oriUrl.hostname = value;
    window.location.href = nowlink + oriUrl.href;
  }

  get port() {
    return oriUrl.port;
  }

  set port(value) {
    oriUrl.port = value;
    window.location.href = nowlink + oriUrl.href;
  }

  get pathname() {
    return oriUrl.pathname;
  }

  set pathname(value) {
    oriUrl.pathname = value;
    window.location.href = nowlink + oriUrl.href;
  }

  get search() {
    return oriUrl.search;
  }

  set search(value) {
    oriUrl.search = value;
    window.location.href = nowlink + oriUrl.href;
  }

  get hash() {
    return oriUrl.hash;
  }

  set hash(value) {
    oriUrl.hash = value;
    window.location.href = nowlink + oriUrl.href;
  }

  get origin() {
    return oriUrl.origin;
  }
}

function documentLocationInject() {
  Object.defineProperty(document, 'URL', {
    get: function() {
      return oriUrlStr;
    },
    set: function(url) {
      document.URL = changeURL(url);
    }
  });

  Object.defineProperty(document, '${replaceUrlObj}', {
    get: function() {
      return new ProxyLocation(window.location);
    },
    set: function(url) {
      window.location.href = changeURL(url);
    }
  });
  console.log("LOCATION INJECTED");
}

function windowLocationInject() {
  Object.defineProperty(window, '${replaceUrlObj}', {
    get: function() {
      return new ProxyLocation(window.location);
    },
    set: function(url) {
      window.location.href = changeURL(url);
    }
  });
  console.log("WINDOW LOCATION INJECTED");
}

//---***========================================***---注入历史---***========================================***---
function historyInject() {
  const originalPushState = History.prototype.pushState;
  const originalReplaceState = History.prototype.replaceState;

  History.prototype.pushState = function(state, title, url) {
    if (!url) return;
    if (url.startsWith("/" + oriUrl.href)) url = url.substring(("/" + oriUrl.href).length);
    if (url.startsWith("/" + oriUrl.href.substring(0, oriUrl.href.length - 1))) url = url.substring(("/" + oriUrl.href).length - 1);
    var u = changeURL(url);
    return originalPushState.apply(this, [state, title, u]);
  };

  History.prototype.replaceState = function(state, title, url) {
    if (!url) return;
    if (url.startsWith("/" + oriUrl.href)) url = url.substring(("/" + oriUrl.href).length);
    if (url.startsWith("/" + oriUrl.href.substring(0, oriUrl.href.length - 1))) url = url.substring(("/" + oriUrl.href).length - 1);
    var u = changeURL(url);
    return originalReplaceState.apply(this, [state, title, u]);
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

function covToAbs(element) {
  var relativePath = "";
  var setAttr = "";
  if (element instanceof HTMLElement && element.hasAttribute("href")) {
    relativePath = element.getAttribute("href");
    setAttr = "href";
  }
  if (element instanceof HTMLElement && element.hasAttribute("src")) {
    relativePath = element.getAttribute("src");
    setAttr = "src";
  }

  if (setAttr !== "" && relativePath.indexOf(nowlink) !== 0) {
    if (!relativePath.includes("*")) {
      try {
        var absolutePath = changeURL(relativePath);
        element.setAttribute(setAttr, absolutePath);
      } catch (e) {
        console.log("Exception occurred: " + e.message + path + "   " + relativePath);
      }
    }
  }
}

function removeIntegrityAttributesFromElement(element) {
  if (element.hasAttribute('integrity')) {
    element.removeAttribute('integrity');
  }
}

function loopAndConvertToAbs() {
  for (var ele of document.querySelectorAll('*')) {
    removeIntegrityAttributesFromElement(ele);
    covToAbs(ele);
  }
  console.log("LOOPED EVERY ELEMENT");
}

function covScript() {
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
    if (element.alreadyChanged) {
      console.log("this script has already been injected, ignoring this problematic script...");
      return;
    }
    removeIntegrityAttributesFromElement(element);
    covToAbs(element);
    var newScript = document.createElement("script");
    newScript.src = element.src;
    newScript.async = element.async;
    newScript.defer = element.defer;
    newScript.alreadyChanged = true;
    document.head.appendChild(newScript);
    console.log("New script added:", newScript);
  }
}, true);
console.log("WINDOW CORS ERROR EVENT ADDED");
`;

httpRequestInjection = `(function () {${httpRequestInjection}})();`;

const mainPage = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Web online proxy</title>
  <style>
    html, body {
      height: 100%;
      margin: 0;
      overflow: auto;
      background-color: #e0f7fa;
    }
    body {
      font-family: 'Roboto', Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #333333;
      background-image: url('https://www.loliapi.com/acg/');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      position: relative;
      overflow: hidden;
      filter: none;
    }
    body::after {
      content: '';
      position: absolute;
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
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, rgba(79, 195, 247, 0.2), rgba(176, 196, 222, 0.2));
      z-index: -1;
    }
    .content {
      text-align: center;
      max-width: 80%;
      padding: 30px;
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 15px;
      box-shadow: 0 8px 32px rgba(79, 195, 247, 0.3), 
                  0 0 10px rgba(176, 196, 222, 0.2);
      backdrop-filter: blur(5px);
      border: 1px solid rgba(79, 195, 247, 0.3);
      transform: scale(0.5);
      opacity: 0.5;
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
      transform: scale(1.03);
      box-shadow: 0 12px 40px rgba(79, 195, 247, 0.5), 
                  0 0 20px rgba(176, 196, 222, 0.3);
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 20px;
      color: #0277bd;
      text-shadow: 0 0 5px rgba(79, 195, 247, 0.3);
    }
    input, button {
      margin: 15px auto;
      padding: 12px 20px;
      font-size: 16px;
      border-radius: 25px;
      outline: none;
      display: block;
      width: 80%;
      max-width: 300px;
      transition: all 0.3s ease;
    }
    input {
      background-color: rgba(255, 255, 255, 0.5);
      border: 1px solid rgba(79, 195, 247, 0.5);
      color: #333333;
      text-align: center;
    }
    input:focus {
      background-color: rgba(255, 255, 255, 0.7);
      border-color: #0277bd;
      box-shadow: 0 0 10px rgba(79, 195, 247, 0.3);
    }
    button {
      background: linear-gradient(45deg, #4fc3f7, #81d4fa);
      border: none;
      color: #333333;
      cursor: pointer;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    button:hover {
      background: linear-gradient(45deg, #29b6f6, #4fc3f7);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(79, 195, 247, 0.4);
    }
    a {
      color: #0277bd;
      text-decoration: none;
      font-weight: bold;
      transition: color 0.3s ease, transform 0.3s ease;
      display: block;
      margin: 15px 0;
    }
    a:hover {
      color: #01579b;
      transform: scale(1.05);
      text-shadow: 0 0 5px rgba(79, 195, 247, 0.3);
    }
    p {
      margin: 12px 0;
      font-size: 14px;
      opacity: 0.9;
    }
    @media (max-width: 768px) {
      .content {
        max-width: 90%;
        padding: 20px;
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
    @media (min-resolution: 2dppx) {
      body {
        background-size: cover;
      }
    }
  </style>
</head>
<body>
  <div class="content">
    <h1>Web online proxy</h1>
    <p>请输入学术研究网站或文献查询网站进行访问 如:百度百科 baike.baidu.com</p>
    <form id="urlForm" action="/generate-token">
      <input type="text" id="targetUrl" name="url" placeholder="请输入目标网址..." required>
      <button type="submit" id="jumpButton">跳转</button>
    </form>
    <p>声明：本工具仅用于学术研究和文献查阅，请严格遵守相关法律法规。</p>
    <p>By Sak 2025 </p>    
  </div>
  
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      var content = document.querySelector('.content');
      setTimeout(function() {
        content.classList.add('loaded');
      }, 100);
    });
  </script>
</body>
</html>
`;

const pwdPage = `
<!DOCTYPE html>
<html>
<head>
  <script>
    function setPassword() {
      try {
        var cookieDomain = window.location.hostname;
        var password = document.getElementById('password').value;
        var oneWeekLater = new Date();
        oneWeekLater.setTime(oneWeekLater.getTime() + (7 * 24 * 60 * 60 * 1000));
        document.cookie = "${passwordCookieName}" + "=" + password + "; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + cookieDomain;
        document.cookie = "${passwordCookieName}" + "=" + password + "; expires=" + oneWeekLater.toUTCString() + "; path=/; domain=" + cookieDomain;
      } catch(e) {
        alert(e.message);
      }
      location.reload();
    }
  </script>
</head>
<body>
  <div>
    <input id="password" type="password" placeholder="Password">
    <button onclick="setPassword()">Submit</button>
  </div>
</body>
</html>
`;

const redirectError = `
<html><head></head><body><h2>Error while redirecting: the website you want to access may contain wrong redirect information, and we cannot parse the info</h2></body></html>
`;