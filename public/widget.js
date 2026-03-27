// ShopBot IA — Widget intégrable
// Copiez ce fichier dans votre dossier public/
(function() {
  var shopbotUrl = document.currentScript
    ? document.currentScript.getAttribute('data-shopbot-url')
    : window.SHOPBOT_URL || '';

  if (!shopbotUrl) {
    console.warn('ShopBot: data-shopbot-url manquant');
    return;
  }

  // Styles
  var style = document.createElement('style');
  style.textContent = `
    #shopbot-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 58px;
      height: 58px;
      border-radius: 18px;
      background: linear-gradient(135deg, #6c63ff, #a78bfa);
      border: none;
      color: white;
      font-size: 26px;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(108,99,255,0.4);
      z-index: 99998;
      transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #shopbot-btn:hover {
      transform: scale(1.1) translateY(-2px);
      box-shadow: 0 12px 32px rgba(108,99,255,0.5);
    }
    #shopbot-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 14px;
      height: 14px;
      background: #00e5a0;
      border-radius: 50%;
      border: 2px solid white;
      animation: shopbot-pulse 2s infinite;
    }
    @keyframes shopbot-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(0,229,160,0.4); }
      50% { box-shadow: 0 0 0 6px rgba(0,229,160,0); }
    }
    #shopbot-iframe {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 390px;
      height: 560px;
      border: none;
      border-radius: 24px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.3);
      z-index: 99999;
      opacity: 0;
      pointer-events: none;
      transform: translateY(20px) scale(0.95);
      transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
    }
    #shopbot-iframe.open {
      opacity: 1;
      pointer-events: all;
      transform: translateY(0) scale(1);
    }
    @media (max-width: 480px) {
      #shopbot-iframe {
        width: calc(100vw - 20px);
        height: calc(100vh - 110px);
        bottom: 90px;
        right: 10px;
        left: 10px;
        border-radius: 20px;
      }
    }
  `;
  document.head.appendChild(style);

  // Button
  var btn = document.createElement('button');
  btn.id = 'shopbot-btn';
  btn.setAttribute('aria-label', 'Ouvrir le support client');
  btn.innerHTML = '<span id="shopbot-icon">💬</span><div id="shopbot-badge"></div>';
  document.body.appendChild(btn);

  // Iframe
  var iframe = document.createElement('iframe');
  iframe.id = 'shopbot-iframe';
  iframe.src = shopbotUrl;
  iframe.title = 'Support client IA';
  document.body.appendChild(iframe);

  // Toggle
  var isOpen = false;
  btn.addEventListener('click', function() {
    isOpen = !isOpen;
    if (isOpen) {
      iframe.classList.add('open');
      document.getElementById('shopbot-icon').textContent = '✕';
      document.getElementById('shopbot-badge').style.display = 'none';
    } else {
      iframe.classList.remove('open');
      document.getElementById('shopbot-icon').textContent = '💬';
      document.getElementById('shopbot-badge').style.display = 'block';
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isOpen) btn.click();
  });
})();
