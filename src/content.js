// get enabled flag
chrome.storage.local.get(["enabled"], (data) => {
  if (data.enabled === false) return;

  (function() {
    'use strict';

    const HIDE_CLASS = 'tm-hide-code';
    const STYLE_ID  = 'tm-hide-code-css';

    // css rules to hide editor elements
    const CSS_RULES = `
.${HIDE_CLASS} .view-lines,
.${HIDE_CLASS} .margin-view,
.${HIDE_CLASS} .margin-view-overlays,
.${HIDE_CLASS} .core-guide {
  visibility: hidden !important;
}
`;

    let lastSlug = null;
    let hidden   = false;

    // inject style tag
    function injectHideCSS() {
      document.getElementById(STYLE_ID)?.remove();
      const st = document.createElement('style');
      st.id = STYLE_ID;
      st.textContent = CSS_RULES;
      (document.head || document.documentElement).appendChild(st);
    }

    // add hide class
    function addHide() {
      injectHideCSS();
      document.documentElement.classList.add(HIDE_CLASS);
      hidden = true;
      updateBtn();
    }

    // remove hide class
    function removeHide() {
      document.documentElement.classList.remove(HIDE_CLASS);
      hidden = false;
      updateBtn();
    }

    // toggle state
    function toggleHide() {
      hidden ? removeHide() : addHide();
    }

    // check if problem solved
    function isSolved() {
      return Array.from(document.querySelectorAll('div'))
        .some(el => el.textContent.trim().startsWith('Solved'));
    }

    // update button label
    function updateBtn() {
      const btn = document.getElementById('toggle-code-btn');
      if (btn) btn.innerText = hidden ? 'Show Code' : 'Hide Code';
    }

    // create toggle button
    function addToggleButton() {
      if (document.getElementById('toggle-code-btn')) return;

      const alignBtn = document.querySelector('button:has(svg[data-icon="align-left"])');
      if (!alignBtn) return setTimeout(addToggleButton, 500);

      const btn = document.createElement('button');
      btn.id    = 'toggle-code-btn';
      btn.type  = 'button';
      btn.innerText = hidden ? 'Show Code' : 'Hide Code';
      Object.assign(btn.style, {
        marginRight:  '8px',
        padding:      '4px 8px',
        fontSize:     '13px',
        background:   '#4f46e5',
        color:        '#fff',
        border:       'none',
        borderRadius: '4px',
        cursor:       'pointer',
      });
      btn.onclick = toggleHide;

      // place button
      alignBtn.insertAdjacentElement('beforebegin', btn);
    }

    // remove button
    function removeToggleButton() {
      document.getElementById('toggle-code-btn')?.remove();
    }

    // handle navigation
    function onNav() {
      const m = location.pathname.match(/^\/problems\/([^\/]+)(\/.*)?$/);
      if (!m) {
        removeHide();
        removeToggleButton();
        lastSlug = null;
        return;
      }
      const slug = m[1];
      if (slug === lastSlug) return;
      lastSlug = slug;

      if (isSolved()) {
        addHide();
        addToggleButton();
      } else {
        removeHide();
        removeToggleButton();
      }
    }

    // listen to spa navigation
    ['pushState','replaceState'].forEach(fn => {
      const orig = history[fn];
      history[fn] = function() {
        const rv = orig.apply(this, arguments);
        window.dispatchEvent(new Event('locationchange'));
        return rv;
      };
    });
    window.addEventListener('popstate',        () => window.dispatchEvent(new Event('locationchange')));
    window.addEventListener('hashchange',      onNav);
    window.addEventListener('locationchange',  onNav);
    window.addEventListener('DOMContentLoaded', onNav);
    if (document.readyState !== 'loading') onNav();

  })();
});
