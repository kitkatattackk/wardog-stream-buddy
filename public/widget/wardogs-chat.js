/* =====================================================
   WARDOGS CHAT — StreamElements Custom Widget (JS tab)
   Gritty military chat overlay with combat dispatches
   ===================================================== */

(function () {
  var W = {};
  window.WARDOGS = W;

  var cfg = {};
  var root = null;
  var queue = [];

  var DEFAULTS = {
    accentColor: '#b58b2a',
    panelColor: 'rgba(20,23,14,0.82)',
    textColor: '#e8e4d4',
    fontSize: 22,
    animationSpeed: 320,
    maxMessages: 25,
    messageLifetime: 0,
    chatDirection: 'bottom',
    hideBots: true,
    botList: 'nightbot,streamelements,streamlabs,moobot,fossabot,soundalerts',
    hideCommands: true,
    showBadges: true,
    showAvatars: true,
    showRanks: true,
    showSubs: true,
    showResubs: true,
    showGiftSubs: true,
    showBits: true,
    minBits: 1,
    showRaids: true,
    showFollows: true,
    showFirstChat: true,
    showTips: true,
    alertVolume: 60,
    subSound: '',
    bitsSound: '',
    raidSound: ''
  };

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function num(v, d) { var n = parseInt(v, 10); return isNaN(n) ? d : n; }

  function applyTheme() {
    var s = document.documentElement.style;
    s.setProperty('--wd-accent', cfg.accentColor);
    s.setProperty('--wd-panel', cfg.panelColor);
    s.setProperty('--wd-text', cfg.textColor);
    s.setProperty('--wd-size', num(cfg.fontSize, 22) + 'px');
    s.setProperty('--wd-speed', num(cfg.animationSpeed, 320) + 'ms');
    if (root) root.className = cfg.chatDirection === 'top' ? 'wd-reverse' : '';
  }

  function play(url) {
    if (!url) return;
    try {
      var a = new Audio(url);
      a.volume = Math.max(0, Math.min(1, num(cfg.alertVolume, 60) / 100));
      a.play();
    } catch (e) { /* autoplay blocked */ }
  }

  function push(el, msgId) {
    if (!root) return;
    if (msgId) el.setAttribute('data-msgid', msgId);
    if (cfg.chatDirection === 'top') root.appendChild(el);
    else root.appendChild(el);

    var max = num(cfg.maxMessages, 25);
    while (root.children.length > max) root.removeChild(root.firstChild);

    var life = num(cfg.messageLifetime, 0);
    if (life > 0) {
      setTimeout(function () {
        el.classList.add('wd-out');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 280);
      }, life * 1000);
    }
  }

  /* ---------- rank ladder ---------- */
  function rankFor(data) {
    if (!cfg.showRanks) return '';
    var b = data.badges || [];
    var has = function (t) { for (var i = 0; i < b.length; i++) if (b[i].type === t) return true; return false; };
    if (has('broadcaster')) return 'COMMANDER';
    if (has('moderator')) return 'SERGEANT';
    if (has('vip')) return 'SPECIALIST';
    if (has('subscriber')) return 'ENLISTED';
    return '';
  }

  function badgesHtml(data) {
    if (!cfg.showBadges || !data.badges) return '';
    var out = '';
    for (var i = 0; i < data.badges.length; i++) {
      if (!data.badges[i] || !data.badges[i].url) continue;
      out += '<img class="wd-badge" src="' + esc(data.badges[i].url) + '" alt="">';
    }
    return out;
  }

  function emoteHtml(data) {
    var text = esc(data.text || '');
    var emotes = data.emotes || [];
    if (!emotes.length) return text;
    var seen = {};
    for (var i = 0; i < emotes.length; i++) {
      var e = emotes[i];
      var name = e.name;
      if (!name || seen[name]) continue;
      seen[name] = true;
      var url = (e.urls && (e.urls['4'] || e.urls['2'] || e.urls['1'])) || e.url;
      if (!url) continue;
      var safe = esc(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      text = text.replace(new RegExp('(^|\\s)' + safe + '(?=\\s|$)', 'g'),
        '$1<img class="wd-emote" src="' + esc(url) + '" alt="' + esc(name) + '">');
    }
    return text;
  }

  /* ---------- chat message ---------- */
  W.renderMessage = function (data) {
    var name = data.displayName || data.nick || 'UNKNOWN';
    var text = data.text || '';

    if (cfg.hideCommands && text.charAt(0) === '!') return;
    if (cfg.hideBots) {
      var bots = String(cfg.botList || '').toLowerCase().split(',');
      for (var i = 0; i < bots.length; i++) {
        if (bots[i].trim() && bots[i].trim() === String(name).toLowerCase()) return;
      }
    }

    var el = document.createElement('div');
    el.className = 'wd-item wd-msg';
    var color = data.displayColor || cfg.accentColor;
    var rank = rankFor(data);

    el.innerHTML =
      '<div class="wd-head">' +
      (cfg.showAvatars && data.avatar ? '<img class="wd-avatar" src="' + esc(data.avatar) + '" alt="">' : '') +
      badgesHtml(data) +
      '<span class="wd-name" style="color:' + esc(color) + '">' + esc(name) + '</span>' +
      (rank ? '<span class="wd-rank">' + rank + '</span>' : '') +
      '</div>' +
      '<span class="wd-text">' + emoteHtml(data) + '</span>';

    push(el, data.msgId);
  };

  /* ---------- dispatch alerts ---------- */
  function dispatch(kind, tag, line, sub, sound) {
    var el = document.createElement('div');
    el.className = 'wd-item wd-alert wd-flash wd-ev-' + kind;
    el.innerHTML =
      '<span class="wd-tag">' + esc(tag) + '</span>' +
      '<div class="wd-line">' + line + '</div>' +
      (sub ? '<span class="wd-sub">' + esc(sub) + '</span>' : '');
    push(el);
    play(sound);
  }

  function nameHtml(n) { return '<span style="color:var(--wd-accent)">' + esc(n) + '</span>'; }

  function bitsTier(amount) {
    if (amount >= 10000) return 'AIRSTRIKE INBOUND';
    if (amount >= 5000) return 'ARTILLERY BARRAGE';
    if (amount >= 1000) return 'MORTAR STRIKE';
    if (amount >= 100) return 'FRAG OUT';
    return 'TRACER ROUND';
  }

  W.event = function (listener, data) {
    data = data || {};
    var name = data.displayName || data.name || data.sender || 'UNKNOWN';
    var amount = num(data.amount, 0);

    switch (listener) {
      case 'subscriber':
        if (data.gifted || data.bulkGifted) {
          if (!cfg.showGiftSubs) return;
          var gifter = data.sender || name;
          var count = data.bulkGifted ? amount : 1;
          dispatch('gift', 'Supply Drop',
            nameHtml(gifter) + ' dropped ' + count + ' crate' + (count > 1 ? 's' : ''),
            count > 1 ? count + ' recruits armed and deployed' : 'Recruit ' + (data.gifted ? name : '') + ' armed',
            cfg.subSound);
          return;
        }
        if (amount > 1) {
          if (!cfg.showResubs) return;
          dispatch('resub', 'Re-Enlisted',
            nameHtml(name) + ' signed on for month ' + amount,
            (data.tier && data.tier !== 'prime' ? 'Tier ' + String(data.tier).charAt(0) : 'Prime') + ' · still in the fight',
            cfg.subSound);
          return;
        }
        if (!cfg.showSubs) return;
        dispatch('sub', 'New Recruit',
          nameHtml(name) + ' enlisted',
          'Boots on the ground', cfg.subSound);
        return;

      case 'cheer':
        if (!cfg.showBits || amount < num(cfg.minBits, 1)) return;
        dispatch('bits', bitsTier(amount),
          nameHtml(name) + ' fired ' + amount + ' rounds',
          data.message || 'Ammo resupplied', cfg.bitsSound);
        return;

      case 'raid':
      case 'host':
        if (!cfg.showRaids) return;
        dispatch('raid', listener === 'raid' ? 'Incoming Convoy' : 'Allied Escort',
          nameHtml(name) + ' rolled in with ' + amount,
          'Reinforcements on deck', cfg.raidSound);
        return;

      case 'follower':
        if (!cfg.showFollows) return;
        dispatch('follow', 'Signed Up', nameHtml(name) + ' joined the unit', '', '');
        return;

      case 'tip':
        if (!cfg.showTips) return;
        dispatch('tip', 'War Chest',
          nameHtml(name) + ' funded the op',
          data.message || '', cfg.subSound);
        return;
    }
  };

  W.firstChat = function (name) {
    if (!cfg.showFirstChat) return;
    dispatch('first', 'First Contact', nameHtml(name) + ' broke radio silence', '', '');
  };

  W.init = function (fieldData, container) {
    cfg = Object.assign({}, DEFAULTS, fieldData || {});
    root = container || document.getElementById('wardogs-chat');
    applyTheme();
    while (queue.length) { var q = queue.shift(); W.event(q[0], q[1]); }
  };

  /* ---------- StreamElements bindings ---------- */
  var seen = {};

  window.addEventListener('onWidgetLoad', function (obj) {
    W.init(obj.detail.fieldData, document.getElementById('wardogs-chat'));
  });

  window.addEventListener('onEventReceived', function (obj) {
    var listener = obj.detail.listener;
    var data = obj.detail.event || {};

    if (listener === 'message') {
      var d = data.data || data;
      if (cfg.showFirstChat && d.userId && !seen[d.userId]) {
        seen[d.userId] = true;
        if (d.tags && d.tags['first-msg'] === '1') W.firstChat(d.displayName || d.nick);
      }
      W.renderMessage(d);
      return;
    }

    if (listener === 'delete-message') {
      var el = root && root.querySelector('[data-msgid="' + data.msgId + '"]');
      if (el && el.parentNode) el.parentNode.removeChild(el);
      return;
    }

    if (listener === 'delete-messages') {
      if (!root) return;
      var nodes = root.querySelectorAll('.wd-msg');
      for (var i = 0; i < nodes.length; i++) nodes[i].remove();
      return;
    }

    if (listener && listener.indexOf('-latest') > -1) {
      W.event(listener.replace('-latest', ''), data);
      return;
    }

    if (listener === 'event:test' || listener === 'event') {
      W.event(data.listener, data);
    }
  });
})();
