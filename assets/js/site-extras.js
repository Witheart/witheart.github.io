// 站点增强：图片点击放大 + 返回顶部
(function () {
  document.addEventListener('DOMContentLoaded', function () {

    // ---- 返回顶部按钮 ----
    var btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', '返回顶部');
    btn.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
    document.body.appendChild(btn);

    function toggleBackTop() {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }
    window.addEventListener('scroll', toggleBackTop, { passive: true });
    toggleBackTop();
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ---- 图片点击放大（灯箱） ----
    var overlay = document.createElement('div');
    overlay.id = 'image-lightbox';
    overlay.innerHTML = '<img src="" alt=""><button type="button" class="image-lightbox-close" aria-label="关闭">&times;</button>';
    document.body.appendChild(overlay);
    var lbImg = overlay.querySelector('img');

    function openLightbox(src) {
      lbImg.src = src;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.tagName === 'IMG' && t.closest && t.closest('.page__content')) {
        var src = t.src;
        if (src) {
          e.preventDefault();
          openLightbox(src);
        }
        return;
      }
      if (overlay.classList.contains('open') &&
          (e.target === overlay || e.target === overlay.querySelector('.image-lightbox-close'))) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  });
})();
