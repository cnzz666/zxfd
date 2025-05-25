addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  thisProxyServerUrlHttps = `${url.protocol}//${url.hostname}/`;
  thisProxyServerUrl_hostOnly = url.host;
  event.respondWith(handleRequest(event.request));
});

const str = "/";
const lastVisitProxyCookie = "__PROXY_VISITEDSITE__";
const passwordCookieName = "__PROXY_PWD__";
const proxyHintCookieName = "__PROXY_HINT__";
const password = "";
const showPasswordPage = true;
const replaceUrlObj = "__location____";
var thisProxyServerUrlHttps;
var thisProxyServerUrl_hostOnly;

const proxyHintInjection = `
  //---***========================================***---提示使用代理---***========================================***---
  document.addEventListener('DOMContentLoaded', () => {
    var hint = "Warning: You are currently using a web proxy, so do not log in to any website. Click to close this hint. For further details, please visit <a href=\\"https://github.com/1234567Yang/cf-proxy-ex/\\" style=\\"color:#0277bd;text-decoration:none;font-weight:bold;\\">https://github.com/1234567Yang/cf-proxy-ex/</a>. <br>警告：您当前正在使用网络代理，请勿登录任何网站。单击关闭此提示。详情请见 <a href=\\"https://github.com/1234567Yang/cf-proxy-ex/\\" style=\\"color:#0277bd;text-decoration:none;font-weight:bold;\\">https://github.com/1234567Yang/cf-proxy-ex/</a>。";

    // 插入弹窗 HTML
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

    // 插入 CSS 动画样式
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

async function handleRequest(request) {
  // 这里是你的代理逻辑，暂时用一个简单的响应替代
  const url = new URL(request.url);
  const targetUrl = url.pathname + url.search;

  // 如果需要注入提示，修改响应内容
  const response = await fetch(targetUrl || request);
  const contentType = response.headers.get('Content-Type') || '';
  
  // 检查是否为 HTML 内容，如果是则注入脚本
  if (contentType.includes('text/html')) {
    const html = await response.text();
    let modifiedHtml = html;
    
    // 优先尝试注入到 </head> 之前
    if (html.includes('</head>')) {
      modifiedHtml = html.replace(
        /<\/head>/,
        `<script>${proxyHintInjection}</script></head>`
      );
    } else if (html.includes('<body>')) {
      // 如果没有 head 标签，尝试注入到 <body> 之后
      modifiedHtml = html.replace(
        /<body>/,
        `<body><script>${proxyHintInjection}</script>`
      );
    } else {
      // 如果都没有，直接追加到内容开头
      modifiedHtml = `<script>${proxyHintInjection}</script>` + html;
    }
    
    return new Response(modifiedHtml, {
      status: response.status,
      headers: response.headers
    });
  }

  // 对于非 HTML 内容，直接返回原始响应
  return response;
}