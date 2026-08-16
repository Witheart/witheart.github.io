// 深色模式切换
(function () {
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);

  // 同步 giscus 评论区主题
  function syncGiscusTheme() {
    var frame = document.querySelector('iframe.giscus-frame');
    if (!frame || !frame.contentWindow) return;
    var t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    try {
      frame.contentWindow.postMessage({ giscus: { setConfig: { theme: t } } }, 'https://giscus.app');
    } catch (e) {}
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.theme__toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var cur = document.documentElement.getAttribute('data-theme');
        var next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
        syncGiscusTheme();
      });
    }
  });

  // giscus iframe 异步加载，页面加载后再延时同步几次
  window.addEventListener('load', function () {
    setTimeout(syncGiscusTheme, 500);
    setTimeout(syncGiscusTheme, 2000);
  });
})();
