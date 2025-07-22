/**
 * Cloudflare Worker script for a global web proxy with enhanced functionality.
 * Features: URL rewriting, video/audio streaming, ad/element blocking, custom cookie injection.
 * Strictly adheres to Cloudflare Worker ES Module syntax and runtime constraints.
 */

const CONFIG = {
  STR: "/",
  LAST_VISIT_COOKIE: "__PROXY_VISITEDSITE__",
  PASSWORD_COOKIE: "__PROXY_PWD__",
  PROXY_HINT_COOKIE: "__PROXY_HINT_ACK__",
  LANGUAGE_COOKIE: "__PROXY_LANGUAGE__",
  DEVICE_COOKIE: "__PROXY_DEVICE__",
  BLOCK_EXTENSIONS_COOKIE: "__PROXY_BLOCK_EXTENSIONS__",
  BLOCK_ADS_COOKIE: "__PROXY_BLOCK_ADS__",
  BLOCK_ELEMENTS_COOKIE: "__PROXY_BLOCK_ELEMENTS__",
  BLOCK_ELEMENTS_SCOPE_COOKIE: "__PROXY_BLOCK_ELEMENTS_SCOPE__",
  CUSTOM_HEADERS_COOKIE: "__PROXY_CUSTOM_HEADERS__",
  CUSTOM_COOKIES_COOKIE: "__PROXY_CUSTOM_COOKIES__",
  PASSWORD: "",
  SHOW_PASSWORD_PAGE: true,
  REPLACE_URL_OBJ: "__location_yproxy__",
  INJECTED_JS_ID: "__yproxy_injected_js_id__",
};

const SUPPORTED_LANGUAGES = [
  { code: "zh-CN", name: "中文 (简体)" },
  { code: "en-US", name: "English (US)" },
  { code: "es-ES", name: "Español" },
  { code: "hi-IN", name: "हिन्दी" },
  { code: "ar-SA", name: "العربية" },
  { code: "pt-BR", name: "Português (Brasil)" },
  { code: "ru-RU", name: "Русский" },
  { code: "fr-FR", name: "Français" },
  { code: "de-DE", name: "Deutsch" },
  { code: "ja-JP", name: "日本語" },
];

const DEVICE_USER_AGENTS = {
  desktop: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  mobile: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
};

const DEVICE_LAYOUTS = {
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 375, height: 667 },
};

const AD_BLOCK_KEYWORDS = [
  "ads.", "ad.", "advert", "banner", "sponsor", "doubleclick", "googlead", 
  "adserver", "popunder", "interstitial", "googlesyndication.com", 
  "adsense.google.com", "admob.com", "adclick.g.doubleclick.net",
];

const PROXY_HINT_INJECTION = `
  setTimeout(() => {
    if (document.cookie.includes("${CONFIG.PROXY_HINT_COOKIE}=agreed")) return;
    const hint = "警告：您当前正在使用网络代理，请勿登录任何网站。单击关闭此提示。详情请见 <a href='https://github.com/1234567Yang/cf-proxy-ex/' style='color: #ffd700;'>https://github.com/1234567Yang/cf-proxy-ex/</a>。";
    const div = document.createElement('div');
    div.id = "__PROXY_HINT_DIV__";
    div.style = "position: fixed; left: 0; top: 0; width: 100%; margin: 0; padding: 0; display: block; z-index: 99999999999999999999999; user-select: none; cursor: pointer;";
    div.innerHTML = \`<span style="position: absolute; width: calc(100% - 20px); min-height: 30px; font-size: 18px; color: yellow; background: rgba(180, 0, 0, 0.9); text-align: center; border-radius: 5px; padding: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">\${hint}</span>\`;
    div.onclick = () => {
      document.cookie = "${CONFIG.PROXY_HINT_COOKIE}=agreed; path=/; max-age=86400";
      div.remove();
    };
    const appendHint = () => document.body && document.body.insertAdjacentElement('afterbegin', div);
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      appendHint();
    } else {
      document.addEventListener('DOMContentLoaded', appendHint);
    }
  }, 5000);
`;

const DISGUISE_INJECTION = `
  (function() {
    try {
      const now = new URL(window.location.href);
      const proxyBase = now.host;
      const proxyProtocol = now.protocol;
      const proxyPrefix = proxyProtocol + "//" + proxyBase + "/";
      let oriUrlStr = window.location.href.substring(proxyPrefix.length);
      let oriUrl;
      try {
        oriUrl = new URL(oriUrlStr);
      } catch (e) {
        oriUrl = new URL('https://' + oriUrlStr);
      }
      const originalHost = oriUrl.host;
      const originalOrigin = oriUrl.origin;
      
      Object.defineProperty(document, 'domain', {
        get: () => originalHost,
        set: value => value,
        configurable: true
      });
      
      Object.defineProperty(window, 'origin', {
        get: () => originalOrigin,
        configurable: true
      });
      
      Object.defineProperty(document, 'referrer', {
        get: () => {
          const actualReferrer = document.referrer || '';
          return actualReferrer.startsWith(proxyPrefix) ? actualReferrer.replace(proxyPrefix, '') : actualReferrer;
        },
        configurable: true
      });
      
      if (navigator.userAgentData) {
        Object.defineProperty(navigator, 'userAgentData', {
          get: () => ({ brands: [{ brand: "Chromium", version: "90" }], mobile: false, platform: "Windows" }),
          configurable: true
        });
      }
      
      const languageCookie = document.cookie.split('; ').find(row => row.startsWith('${CONFIG.LANGUAGE_COOKIE}='));
      const selectedLanguage = languageCookie ? languageCookie.split('=')[1] : 'zh-CN';
      Object.defineProperty(navigator, 'language', { get: () => selectedLanguage, configurable: true });
      Object.defineProperty(navigator, 'languages', { get: () => [selectedLanguage], configurable: true });
      
      const deviceCookie = document.cookie.split('; ').find(row => row.startsWith('${CONFIG.DEVICE_COOKIE}='));
      const deviceType = deviceCookie ? deviceCookie.split('=')[1] : 'none';
      if (deviceType !== 'none') {
        const layouts = ${JSON.stringify(DEVICE_LAYOUTS)};
        const layout = layouts[deviceType] || layouts.desktop;
        Object.defineProperty(window, 'innerWidth', { get: () => layout.width, configurable: true });
        Object.defineProperty(window, 'innerHeight', { get: () => layout.height, configurable: true });
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=' + layout.width + ', initial-scale=1.0';
        document.head && document.head.appendChild(meta);
      }
    } catch (e) {
      console.error('Disguise injection error:', e);
    }
  })();
`;

const BLOCK_ELEMENTS_INJECTION = `
  (function() {
    try {
      const blockElements = document.cookie.split('; ').find(row => row.startsWith('${CONFIG.BLOCK_ELEMENTS_COOKIE}='));
      const blockElementsScope = document.cookie.split('; ').find(row => row.startsWith('${CONFIG.BLOCK_ELEMENTS_SCOPE_COOKIE}='));
      const selectors = blockElements ? blockElements.split('=')[1].split(',').map(s => s.trim()).filter(s => s) : [];
      const scope = blockElementsScope ? blockElementsScope.split('=')[1] : 'global';
      const currentUrl = window.location.href;
      
      if (scope === 'global' || (scope === 'specific' && currentUrl.includes(scope))) {
        const observer = new MutationObserver(mutations => {
          mutations.forEach(mutation => {
            selectors.forEach(selector => {
              try {
                document.querySelectorAll(selector).forEach(el => el.remove());
              } catch (e) {}
            });
          });
        });
        observer.observe(document.body, { childList: true, subtree: true });
        
        selectors.forEach(selector => {
          try {
            document.querySelectorAll(selector).forEach(el => el.remove());
          } catch (e) {}
        });
        
        const adSelectors = ${JSON.stringify(AD_BLOCK_KEYWORDS.map(keyword => `[class*="${keyword}"], [id*="${keyword}"]`))};
        adSelectors.forEach(selector => {
          try {
            document.querySelectorAll(selector).forEach(el => el.remove());
          } catch (e) {}
        });
      }
    } catch (e) {
      console.error('Block elements injection error:', e);
    }
  })();
`;

const CUSTOM_COOKIE_INJECTION = `
  (function() {
    try {
      const customCookies = document.cookie.split('; ').find(row => row.startsWith('${CONFIG.CUSTOM_COOKIES_COOKIE}='));
      if (!customCookies) return;
      const cookies = JSON.parse(decodeURIComponent(customCookies.split('=')[1]));
      const currentHost = new URL(window.location.href).hostname;
      cookies.forEach(cookie => {
        if (cookie.host && (cookie.host === 'global' || currentHost.includes(cookie.host))) {
          document.cookie = \`\${cookie.name}=\${cookie.value}; path=/; max-age=\${cookie.maxAge || 86400}\`;
        }
      });
    } catch (e) {
      console.error('Custom cookie injection failed:', e);
    }
  })();
`;

const HTTP_REQUEST_INJECTION = `
  (function() {
    try {
      const nowURL = new URL(window.location.href);
      const proxy_host = nowURL.host;
      const proxy_protocol = nowURL.protocol;
      const proxy_host_with_schema = proxy_protocol + "//" + proxy_host + "/";
      let original_website_url_str = window.location.href.substring(proxy_host_with_schema.length);
      let original_website_url;
      try {
        original_website_url = new URL(original_website_url_str);
      } catch (e) {
        original_website_url_str = 'https://' + original_website_url_str;
        original_website_url = new URL(original_website_url_str);
      }
      let original_website_href = nowURL.pathname.substring(1);
      if (!original_website_href.startsWith("http")) original_website_href = "https://" + original_website_href;
      const original_website_host = original_website_url_str.substring(original_website_url_str.indexOf("://") + "://".length).split('/')[0];
      const original_website_host_with_schema = original_website_url_str.substring(0, original_website_url_str.indexOf("://")) + "://" + original_website_host + "/";
      
      function changeURL(relativePath) {
        if (!relativePath) return null;
        try {
          if (relativePath.startsWith("data:") || relativePath.startsWith("mailto:") || relativePath.startsWith("javascript:") || 
              relativePath.startsWith("chrome") || relativePath.startsWith("edge")) return relativePath;
          if (relativePath.startsWith(proxy_host_with_schema)) relativePath = relativePath.substring(proxy_host_with_schema.length);
          if (relativePath.startsWith(proxy_host + "/")) relativePath = relativePath.substring(proxy_host.length + 1);
          if (relativePath.startsWith(proxy_host)) relativePath = relativePath.substring(proxy_host.length);
          const absolutePath = new URL(relativePath, original_website_url_str).href;
          return proxy_host_with_schema + absolutePath;
        } catch {
          return null;
        }
      }
      
      function getOriginalUrl(url) {
        if (!url) return null;
        if (url.startsWith(proxy_host_with_schema)) return url.substring(proxy_host_with_schema.length);
        return url;
      }
      
      function networkInject() {
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalFetch = window.fetch;
        XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
          const modifiedUrl = changeURL(url);
          if (!modifiedUrl) return;
          return originalOpen.apply(this, [method, modifiedUrl, async, user, password]);
        };
        window.fetch = function(input, init) {
          let url;
          if (typeof input === 'string') {
            url = input;
          } else if (input instanceof Request) {
            url = input.url;
          } else {
            url = input;
          }
          const modifiedUrl = changeURL(url);
          if (!modifiedUrl) return Promise.reject(new Error('Invalid URL'));
          if (typeof input === 'string') {
            return originalFetch(modifiedUrl, init);
          } else {
            const newRequest = new Request(modifiedUrl, input);
            return originalFetch(newRequest, init);
          }
        };
      }
      
      function windowOpenInject() {
        const originalOpen = window.open;
        window.open = function(url, name, specs) {
          const modifiedUrl = changeURL(url);
          if (!modifiedUrl) return null;
          return originalOpen.call(window, modifiedUrl, name, specs);
        };
      }
      
      function appendChildInject() {
        const originalAppendChild = Node.prototype.appendChild;
        Node.prototype.appendChild = function(child) {
          try {
            if (child.src) child.src = changeURL(child.src) || child.src;
            if (child.href) child.href = changeURL(child.href) || child.href;
          } catch {}
          return originalAppendChild.call(this, child);
        };
      }
      
      function elementPropertyInject() {
        const originalSetAttribute = HTMLElement.prototype.setAttribute;
        HTMLElement.prototype.setAttribute = function(name, value) {
          if (name === "src" || name === "href") value = changeURL(value) || value;
          originalSetAttribute.call(this, name, value);
        };
        const originalGetAttribute = HTMLElement.prototype.getAttribute;
        HTMLElement.prototype.getAttribute = function(name) {
          const val = originalGetAttribute.call(this, name);
          if (name === "href" || name === "src") return getOriginalUrl(val);
          return val;
        };
        const descriptor = Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, 'href');
        Object.defineProperty(HTMLAnchorElement.prototype, 'href', {
          get: function() {
            const real = descriptor.get.call(this);
            return getOriginalUrl(real);
          },
          set: function(val) {
            descriptor.set.call(this, changeURL(val) || val);
          },
          configurable: true
        });
      }
      
      class ProxyLocation {
        constructor(originalLocation) { this.originalLocation = originalLocation; }
        getStrNPosition(string, subString, index) {
          return string.split(subString, index).join(subString).length;
        }
        getOriginalHref() {
          return window.location.href.substring(this.getStrNPosition(window.location.href, "/", 3) + 1);
        }
        reload(forcedReload) { this.originalLocation.reload(forcedReload); }
        replace(url) { this.originalLocation.replace(changeURL(url) || url); }
        assign(url) { this.originalLocation.assign(changeURL(url) || url); }
        get href() { return this.getOriginalHref(); }
        set href(url) { this.originalLocation.href = changeURL(url) || url; }
        get protocol() { return original_website_url.protocol; }
        set protocol(value) { 
          original_website_url.protocol = value; 
          window.location.href = proxy_host_with_schema + original_website_url.href; 
        }
        get host() { return original_website_url.host; }
        set host(value) { 
          original_website_url.host = value; 
          window.location.href = proxy_host_with_schema + original_website_url.href; 
        }
        get hostname() { return original_website_url.hostname; }
        set hostname(value) { 
          original_website_url.hostname = value; 
          window.location.href = proxy_host_with_schema + original_website_url.href; 
        }
        get port() { return original_website_url.port; }
        set port(value) { 
          original_website_url.port = value; 
          window.location.href = proxy_host_with_schema + original_website_url.href; 
        }
        get pathname() { return original_website_url.pathname; }
        set pathname(value) { 
          original_website_url.pathname = value; 
          window.location.href = proxy_host_with_schema + original_website_url.href; 
        }
        get search() { return original_website_url.search; }
        set search(value) { 
          original_website_url.search = value; 
          window.location.href = proxy_host_with_schema + original_website_url.href; 
        }
        get hash() { return original_website_url.hash; }
        set hash(value) { 
          original_website_url.hash = value; 
          window.location.href = proxy_host_with_schema + original_website_url.href; 
        }
      }
      
      function documentLocationInject() {
        Object.defineProperty(window.document, "location", {
          get: function() { return new ProxyLocation(window.location); },
          set: function(value) { window.location = changeURL(value) || value; },
          configurable: true
        });
      }
      
      function historyInject() {
        const originalPushState = History.prototype.pushState;
        const originalReplaceState = History.prototype.replaceState;
        History.prototype.pushState = function(state, title, url) {
          if (!url) return;
          let modifiedUrl = url;
          if (url.startsWith("/" + original_website_url.href)) 
            modifiedUrl = url.substring(("/" + original_website_url.href).length);
          else if (url.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1))) 
            modifiedUrl = url.substring(("/" + original_website_url.href).length - 1);
          else if (url.startsWith("/" + original_website_url.href.replace("://", ":/"))) 
            modifiedUrl = url.substring(("/" + original_website_url.href.replace("://", ":/")).length);
          else if (url.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1).replace("://", ":/"))) 
            modifiedUrl = url.substring(("/" + original_website_url.href.replace("://", ":/")).length - 1);
          modifiedUrl = changeURL(modifiedUrl) || modifiedUrl;
          return originalPushState.apply(this, [state, title, modifiedUrl]);
        };
        History.prototype.replaceState = function(state, title, url) {
          if (!url) return;
          let modifiedUrl = url;
          if (url.startsWith("/" + original_website_url.href)) 
            modifiedUrl = url.substring(("/" + original_website_url.href).length);
          else if (url.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1))) 
            modifiedUrl = url.substring(("/" + original_website_url.href).length - 1);
          else if (url.startsWith("/" + original_website_url.href.replace("://", ":/"))) 
            modifiedUrl = url.substring(("/" + original_website_url.href.replace("://", ":/")).length);
          else if (url.startsWith("/" + original_website_url.href.substring(0, original_website_url.href.length - 1).replace("://", ":/"))) 
            modifiedUrl = url.substring(("/" + original_website_url.href.replace("://", ":/")).length - 1);
          modifiedUrl = changeURL(modifiedUrl) || modifiedUrl;
          return originalReplaceState.apply(this, [state, title, modifiedUrl]);
        };
      }
      
      function elementObserverInject() {
        try {
          const yProxyObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
              traverseAndConvert(mutation.target);
            });
          });
          const config = { attributes: true, childList: true, subtree: true };
          document.body && yProxyObserver.observe(document.body, config);
        } catch (e) {
          console.error('Element observer injection error:', e);
        }
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
        let relativePath = "";
        let setAttr = "";
        if (element instanceof HTMLElement && element.hasAttribute("href")) {
          relativePath = element.getAttribute("href");
          setAttr = "href";
        }
        if (element instanceof HTMLElement && element.hasAttribute("src")) {
          relativePath = element.getAttribute("src");
          setAttr = "src";
        }
        if (setAttr !== "" && relativePath && !relativePath.includes(proxy_host_with_schema)) {
          if (!relativePath.includes("*")) {
            try {
              const absolutePath = changeURL(relativePath);
              if (absolutePath) element.setAttribute(setAttr, absolutePath);
            } catch (e) {}
          }
        }
      }
      
      function removeIntegrityAttributesFromElement(element) {
        if (element.hasAttribute('integrity')) {
          element.removeAttribute('integrity');
        }
        if (element.hasAttribute('crossorigin')) {
          element.removeAttribute('crossorigin');
        }
      }
      
      networkInject();
      windowOpenInject();
      appendChildInject();
      elementPropertyInject();
      documentLocationInject();
      historyInject();
      elementObserverInject();
      
      function loopAndConvert() {
        for (let ele of document.querySelectorAll('*')) {
          removeIntegrityAttributesFromElement(ele);
          covToAbs(ele);
        }
      }
      
      function covScript() {
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
          removeIntegrityAttributesFromElement(scripts[i]);
          covToAbs(scripts[i]);
        }
        setTimeout(covScript, 3000);
      }
      
      loopAndConvert();
      covScript();
      
      window.addEventListener('load', () => {
        loopAndConvert();
        elementObserverInject();
        covScript();
      });
      
      window.addEventListener('error', event => {
        const element = event.target || event.srcElement;
        if (element.tagName === 'SCRIPT' && !element.alreadyChanged) {
          removeIntegrityAttributesFromElement(element);
          covToAbs(element);
          const newScript = document.createElement("script");
          newScript.src = element.src;
          newScript.async = element.async;
          newScript.defer = element.defer;
          newScript.alreadyChanged = true;
          document.head && document.head.appendChild(newScript);
        }
      });
      
      document.head && covToAbs(document.head);
      document.body && covToAbs(document.body);
    } catch (e) {
      console.error('HTTP request injection error:', e);
    }
  })();
`;

const MAIN_PAGE = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Web Online Proxy</title>
  <style>
    html, body {
      height: 100%;
      margin: 0;
      overflow: auto;
      background-color: #e0f7fa;
      font-family: 'Roboto', Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #333333;
      background: linear-gradient(135deg, #4fc3f7, #29b6f6);
      position: relative;
      overflow: hidden;
    }
    .content {
      text-align: center;
      max-width: 80%;
      padding: 30px;
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 15px;
      box-shadow: 0 8px 32px rgba(79, 195, 247, 0.3), 0 0 10px rgba(176, 196, 222, 0.2);
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
      box-shadow: 0 12px 40px rgba(79, 195, 247, 0.5), 0 0 20px rgba(176, 196, 222, 0.3);
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 20px;
      color: #0277bd;
      text-shadow: 0 0 5px rgba(79, 195, 247, 0.3);
    }
    button, select {
      margin: 10px auto;
      padding: 10px 15px;
      font-size: 14px;
      border-radius: 25px;
      outline: none;
      display: block;
      width: 60%;
      max-width: 200px;
      transition: all 0.3s ease;
    }
    select {
      background-color: rgba(255, 255, 255, 0.5);
      border: 1px solid rgba(79, 195, 247, 0.5);
      color: #333333;
      text-align: center;
    }
    select:focus {
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
    .config-button {
      background: linear-gradient(45deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.5));
      border: 1px solid rgba(79, 195, 247, 0.5);
    }
    .config-button:hover {
      background: linear-gradient(45deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.7));
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
    .config-section {
      margin: 20px 0;
      display: none;
      flex-direction: column;
      align-items: center;
    }
    .config-section.active {
      display: flex;
    }
    .config-section label {
      font-size: 14px;
      margin-bottom: 10px;
      color: #333333;
    }
    .checkbox-container {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      margin: 10px 0;
    }
    .checkbox-wrapper {
      position: relative;
      display: inline-block;
      width: 20px;
      height: 20px;
      margin-right: 10px;
    }
    .checkbox-wrapper input {
      opacity: 0;
      width: 100%;
      height: 100%;
      position: absolute;
      cursor: pointer;
      z-index: 2;
    }
    .checkbox-custom {
      position: absolute;
      top: 0;
      left: 0;
      width: 20px;
      height: 20px;
      background-color: rgba(255, 255, 255, 0.5);
      border: 2px solid #0277bd;
      border-radius: 4px;
      transition: all 0.3s ease;
    }
    .checkbox-wrapper input:checked + .checkbox-custom {
      background-color: #0277bd;
      border-color: #0277bd;
    }
    .checkbox-custom::after {
      content: '';
      position: absolute;
      display: none;
      left: 5px;
      top: 3px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    .checkbox-wrapper input:checked + .checkbox-custom::after {
      display: block;
    }
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      z-index: 9999;
      justify-content: center;
      align-items: center;
      overflow-y: auto;
    }
    .modal-content {
      background-color: rgba(255, 255, 255, 0.9);
      padding: 20px;
      border-radius: 15px;
      max-width: 80%;
      max-height: 80vh;
      overflow-y: auto;
      text-align: center;
      box-shadow: 0 8px 32px rgba(79, 195, 247, 0.3);
    }
    .modal-content input, .modal-content select, .modal-content textarea {
      width: 90%;
      margin: 10px auto;
      padding: 10px;
      border-radius: 25px;
      border: 1px solid rgba(79, 195, 247, 0.5);
      background-color: rgba(255, 255, 255, 0.5);
      text-align: center;
    }
    .modal-content p {
      font-size: 12px;
      color: #666;
      display: block;
    }
    .modal-content button {
      width: 45%;
      margin: 5px;
    }
    .modal-content .config-button {
      background: linear-gradient(45deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.5));
      border: 1px solid rgba(79, 195, 247, 0.5);
    }
    .modal-content .config-button:hover {
      background: linear-gradient(45deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.7));
    }
    @media (max-width: 768px) {
      .content {
        max-width: 90%;
        padding: 20px;
      }
      h1 {
        font-size: 1.8rem;
      }
      button, select, input, textarea {
        width: 90%;
        font-size: 12px;
        padding: 8px;
      }
      .modal-content {
        width: 90%;
      }
    }
  </style>
</head>
<body>
  <div class="content">
    <h1>Website Online Proxy</h1>
    <p>请输入学术网站地址进行访问（如：baike.baidu.com）</p>
    <button onclick="showUrlModal()">访问网站</button>
    <button onclick="toggleAdvancedOptions()">高级选项</button>
    <div class="config-section" id="advancedOptions">
      <label>选择语言</label>
      <select id="languageSelect">
        ${SUPPORTED_LANGUAGES.map(lang => `<option value="${lang.code}" ${lang.code === 'zh-CN' ? 'selected' : ''}>${lang.name}</option>`).join('')}
      </select>
      <label>模拟设备</label>
      <select id="deviceSelect">
        <option value="none" selected>无</option>
        <option value="desktop">桌面</option>
        <option value="mobile">移动设备</option>
      </select>
      <label>自定义Cookie</label>
      <button class="config-button" onclick="showCustomCookieModal()">配置自定义Cookie</button>
      <div class="checkbox-container">
        <div class="checkbox-wrapper">
          <input type="checkbox" id="blockAds">
          <span class="checkbox-custom"></span>
        </div>
        <label for="blockAds">启用广告拦截</label>
      </div>
      <div class="checkbox-container">
        <div class="checkbox-wrapper">
          <input type="checkbox" id="blockElements">
          <span class="checkbox-custom"></span>
        </div>
        <label for="blockElements">启用元素拦截</label>
      </div>
      <label>元素拦截选择器（用逗号分隔）</label>
      <textarea id="blockElementsInput" placeholder="如：.ad, #banner"></textarea>
      <label>拦截作用域</label>
      <select id="blockElementsScope">
        <option value="global">全局</option>
        <option value="specific">特定网站</option>
      </select>
    </div>
    <a href="https://github.com/1234567Yang/cf-proxy-ex/" target="_blank">了解更多</a>
  </div>
  <div class="modal" id="urlModal">
    <div class="modal-content">
      <h2>输入网站地址</h2>
      <input type="text" id="urlInput" placeholder="如：baike.baidu.com">
      <p>请输入有效的网站地址</p>
      <button onclick="submitUrl()">访问</button>
      <button class="config-button" onclick="closeModal('urlModal')">取消</button>
    </div>
  </div>
  <div class="modal" id="passwordModal">
    <div class="modal-content">
      <h2>输入密码</h2>
      <input type="password" id="passwordInput" placeholder="请输入密码">
      <p>请输入正确的密码以继续</p>
      <button onclick="submitPassword()">提交</button>
      <button class="config-button" onclick="closeModal('passwordModal')">取消</button>
    </div>
  </div>
  <div class="modal" id="customCookieModal">
    <div class="modal-content">
      <h2>配置自定义Cookie</h2>
      <p>输入JSON格式的Cookie配置，示例：<br>{"cookies":[{"name":"key","value":"value","host":"example.com","maxAge":86400}]}</p>
      <textarea id="customCookieInput" placeholder='{"cookies":[{"name":"key","value":"value","host":"example.com","maxAge":86400}]}'></textarea>
      <button onclick="saveCustomCookies()">保存</button>
      <button class="config-button" onclick="closeModal('customCookieModal')">取消</button>
    </div>
  </div>
  <script>
    window.addEventListener('load', () => {
      document.querySelector('.content').classList.add('loaded');
      checkPassword();
    });
    
    function checkPassword() {
      if (${CONFIG.SHOW_PASSWORD_PAGE} && !document.cookie.includes('${CONFIG.PASSWORD_COOKIE}=${CONFIG.PASSWORD}')) {
        document.getElementById('passwordModal').style.display = 'flex';
      }
    }
    
    function submitPassword() {
      const passwordInput = document.getElementById('passwordInput').value;
      if (passwordInput === '${CONFIG.PASSWORD}' || '${CONFIG.PASSWORD}' === '') {
        document.cookie = '${CONFIG.PASSWORD_COOKIE}=${CONFIG.PASSWORD}; path=/; max-age=86400';
        closeModal('passwordModal');
      } else {
        alert('密码错误');
      }
    }
    
    function showUrlModal() {
      if (${CONFIG.SHOW_PASSWORD_PAGE} && !document.cookie.includes('${CONFIG.PASSWORD_COOKIE}=${CONFIG.PASSWORD}')) {
        checkPassword();
      } else {
        document.getElementById('urlModal').style.display = 'flex';
      }
    }
    
    function showCustomCookieModal() {
      document.getElementById('customCookieModal').style.display = 'flex';
    }
    
    function closeModal(modalId) {
      document.getElementById(modalId).style.display = 'none';
    }
    
    function toggleAdvancedOptions() {
      const advancedOptions = document.getElementById('advancedOptions');
      advancedOptions.classList.toggle('active');
    }
    
    function submitUrl() {
      let url = document.getElementById('urlInput').value.trim();
      if (!url) {
        alert('请输入有效的网站地址');
        return;
      }
      if (!url.match(/^https?:\/\//)) {
        url = 'https://' + url;
      }
      try {
        const validUrl = new URL(url);
        document.cookie = '${CONFIG.LAST_VISIT_COOKIE}=' + encodeURIComponent(validUrl.href) + '; path=/; max-age=86400';
        saveConfig();
        window.location.href = window.location.origin + '/' + validUrl.href;
      } catch (e) {
        alert('请输入有效的URL地址');
      }
    }
    
    function saveCustomCookies() {
      const cookieInput = document.getElementById('customCookieInput').value.trim();
      try {
        JSON.parse(cookieInput);
        document.cookie = '${CONFIG.CUSTOM_COOKIES_COOKIE}=' + encodeURIComponent(cookieInput) + '; path=/; max-age=86400';
        alert('自定义Cookie已保存');
        closeModal('customCookieModal');
      } catch (e) {
        alert('请输入有效的JSON格式');
      }
    }
    
    function saveConfig() {
      const language = document.getElementById('languageSelect').value;
      const device = document.getElementById('deviceSelect').value;
      const blockAds = document.getElementById('blockAds').checked;
      const blockElements = document.getElementById('blockElements').checked;
      const blockElementsInput = document.getElementById('blockElementsInput').value;
      const blockElementsScope = document.getElementById('blockElementsScope').value;
      
      document.cookie = '${CONFIG.LANGUAGE_COOKIE}=' + language + '; path=/; max-age=86400';
      document.cookie = '${CONFIG.DEVICE_COOKIE}=' + device + '; path=/; max-age=86400';
      document.cookie = '${CONFIG.BLOCK_ADS_COOKIE}=' + blockAds + '; path=/; max-age=86400';
      document.cookie = '${CONFIG.BLOCK_ELEMENTS_COOKIE}=' + blockElementsInput + '; path=/; max-age=86400';
      document.cookie = '${CONFIG.BLOCK_ELEMENTS_SCOPE_COOKIE}=' + blockElementsScope + '; path=/; max-age=86400';
    }
  </script>
</body>
</html>
`;

let proxyServerUrlHttps = '';
let proxyServerUrlHostOnly = '';

/**
 * Main fetch event listener for Cloudflare Worker.
 * @param {FetchEvent} event
 */
export async function handleRequest(event) {
  try {
    const request = event.request;
    const url = new URL(request.url);
    proxyServerUrlHttps = `${url.protocol}//${url.hostname}/`;
    proxyServerUrlHostOnly = url.hostname;

    // Serve the main page for root or index.html
    if (url.pathname === CONFIG.STR || url.pathname === '/index.html') {
      return new Response(MAIN_PAGE, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Extract target URL from pathname or cookie
    let targetUrlStr = url.pathname.startsWith(CONFIG.STR) ? url.pathname.substring(1) : url.pathname;
    let targetUrl;
    try {
      targetUrl = new URL(targetUrlStr);
    } catch (e) {
      const lastVisit = getCookie(request, CONFIG.LAST_VISIT_COOKIE);
      if (lastVisit) {
        try {
          targetUrl = new URL(decodeURIComponent(lastVisit));
        } catch {
          return getErrorResponse('无效的上次访问URL');
        }
      } else {
        return new Response(MAIN_PAGE, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
    }

    // Password protection
    if (CONFIG.SHOW_PASSWORD_PAGE && !getCookie(request, CONFIG.PASSWORD_COOKIE)) {
      return new Response(MAIN_PAGE, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Prepare request headers
    const headers = new Headers(request.headers);
    headers.set('Host', targetUrl.host);
    headers.set('Origin', targetUrl.origin);
    headers.set('Referer', targetUrl.href);

    // Apply device simulation
    const device = getCookie(request, CONFIG.DEVICE_COOKIE);
    if (device && DEVICE_USER_AGENTS[device]) {
      headers.set('User-Agent', DEVICE_USER_AGENTS[device]);
    }

    // Apply custom headers
    const customHeaders = getCookie(request, CONFIG.CUSTOM_HEADERS_COOKIE);
    if (customHeaders) {
      try {
        const headersObj = JSON.parse(decodeURIComponent(customHeaders));
        for (const [key, value] of Object.entries(headersObj)) {
          headers.set(key, value);
        }
      } catch (e) {
        console.error('Custom headers parsing error:', e);
      }
    }

    // Check blocked extensions
    const blockExtensions = getCookie(request, CONFIG.BLOCK_EXTENSIONS_COOKIE);
    const blockExts = blockExtensions ? blockExtensions.split(',').map(ext => ext.trim().toLowerCase()) : [];
    if (blockExts.length > 0) {
      const ext = targetUrl.pathname.split('.').pop().toLowerCase();
      if (blockExts.includes(ext)) {
        return getErrorResponse('文件类型被阻止');
      }
    }

    // Create modified request
    const modifiedRequest = new Request(targetUrl.href, {
      method: request.method,
      headers: headers,
      body: request.body,
      redirect: 'follow',
    });

    // Fetch target resource
    const response = await fetch(modifiedRequest);

    // Handle response based on content type
    const contentType = response.headers.get('Content-Type') || '';
    let newResponse;

    if (contentType.includes('text/html')) {
      let html = await response.text();
      
      // Apply ad and element blocking
      const blockAds = getCookie(request, CONFIG.BLOCK_ADS_COOKIE) === 'true';
      const blockElements = getCookie(request, CONFIG.BLOCK_ELEMENTS_COOKIE);
      const blockElementsScope = getCookie(request, CONFIG.BLOCK_ELEMENTS_SCOPE_COOKIE) || 'global';
      
      if (blockAds || blockElements) {
        html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, match => {
          for (const keyword of AD_BLOCK_KEYWORDS) {
            if (match.includes(keyword)) return '';
          }
          return match;
        });
      }

      // Inject client-side scripts
      html = html.replace(/<head>/i, `<head><script id="${CONFIG.INJECTED_JS_ID}">${DISGUISE_INJECTION}${PROXY_HINT_INJECTION}${BLOCK_ELEMENTS_INJECTION}${CUSTOM_COOKIE_INJECTION}${HTTP_REQUEST_INJECTION}</script>`);
      
      // Rewrite URLs
      html = html.replace(/(src|href)="\/([^"]*)"/gi, `$1="${proxyServerUrlHttps}$2"`);
      html = html.replace(/(src|href)="([^"]*)"/gi, (match, p1, p2) => {
        if (p2.startsWith('http') || p2.startsWith('data:') || p2.startsWith('mailto:') || p2.startsWith('javascript:')) {
          return match;
        }
        return `${p1}="${proxyServerUrlHttps}${targetUrl.origin}/${p2}"`;
      });

      newResponse = new Response(html, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
      newResponse.headers.set('Content-Type', 'text/html; charset=utf-8');
    } else if (contentType.includes('video') || contentType.includes('audio') || contentType.includes('image')) {
      // Stream media content
      newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } else {
      newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }

    // Set CORS and proxy headers
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('X-Proxied-By', 'Cloudflare-Worker-Proxy');

    // Rewrite cookies
    const cookieHeader = newResponse.headers.get('Set-Cookie');
    if (cookieHeader) {
      newResponse.headers.set('Set-Cookie', cookieHeader.replace(/domain=[^;]+;/i, `domain=${proxyServerUrlHostOnly};`));
    }

    return newResponse;
  } catch (e) {
    return getErrorResponse(`代理错误: ${e.message}`);
  }
}

/**
 * Parse cookies from request headers.
 * @param {Request} request
 * @param {string} name
 * @returns {string|undefined}
 */
function getCookie(request, name) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = cookieHeader.split('; ').reduce((acc, cookie) => {
    const [key, value] = cookie.split('=');
    acc[key] = value;
    return acc;
  }, {});
  return cookies[name];
}

/**
 * Generate an error response HTML page.
 * @param {string} message
 * @returns {Response}
 */
function getErrorResponse(message) {
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>错误</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #d32f2f; }
        p { font-size: 18px; }
        a { color: #0277bd; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>错误</h1>
      <p>${message}</p>
      <a href="/">返回首页</a>
    </body>
    </html>
  `, {
    status: 500,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// Export the fetch event listener
export default {
  async fetch(request, env, ctx) {
    return handleRequest({ request });
  },
};