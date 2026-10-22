/* ==========================================================================
   Verdara Intelligence — Responses dashboard
   ========================================================================== */

(function () {
  'use strict';

  const SECTIONS = [
    {
      title: 'Current business operations',
      items: [
        ['q1', '1. How a sale is recorded'],
        ['q2', '2. How customers pay'],
        ['q3', '3. Number of products sold'],
        ['q4', '4. Where product and stock info lives'],
        ['q5', '5. Biggest difficulties'],
        ['q6', '6. Sales or orders per day']
      ]
    },
    {
      title: 'Finance & accounting',
      items: [
        ['q7', '7. Tracking income, expenses and cash'],
        ['q8', '8. Who keeps the books'],
        ['q9', '9. Financial information wanted instantly']
      ]
    },
    {
      title: 'Stock & physical store',
      items: [
        ['q10', '10. Knowing stock availability'],
        ['q11', '11. Stock problems to solve'],
        ['q12', '12. Orders, deposits and balances']
      ]
    },
    {
      title: 'AI agents & automation',
      items: [
        ['q13', '13. Tasks wanted from AI'],
        ['q14', '14. AI control level'],
        ['q15', '15. Value and adoption blockers']
      ]
    },
    {
      title: 'Dashboard & priorities',
      items: [
        ['q16', '16. First dashboard view'],
        ['q17', '17. Top three priorities'],
        ['q18', '18. Software or files to connect'],
        ['q19', '19. Preferred language'],
        ['comments', 'Additional comments']
      ]
    }
  ];

  const state = {
    items: [],
    filtered: [],
    query: '',
    selectedId: null,
    lastFocused: null,
    loading: false
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const els = {
    rows: $('#responseRows'),
    tableWrap: $('#tableWrap'),
    empty: $('#emptyState'),
    emptyTitle: $('#emptyTitle'),
    emptyText: $('#emptyText'),
    emptyCopy: $('#btnEmptyCopy'),
    search: $('#searchInput'),
    refresh: $('#btnRefresh'),
    total: $('#statTotal'),
    week: $('#statWeek'),
    priority: $('#statPriority'),
    duration: $('#statDuration'),
    count: $('#countBadge'),
    error: $('#adminError'),
    shareText: $('#shareUrlText'),
    copyLink: $('#btnCopyLink'),
    shareUrl: $('#shareUrl'),
    drawer: $('#drawer'),
    backdrop: $('#drawerBackdrop'),
    drawerName: $('#drawerName'),
    drawerMeta: $('#drawerMeta'),
    drawerBody: $('#drawerBody'),
    drawerId: $('#drawerId'),
    closeDrawer: $('#btnCloseDrawer'),
    deleteBtn: $('#btnDelete'),
    toast: $('#toast')
  };

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (char) => {
      switch (char) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '"':
          return '&quot;';
        default:
          return '&#39;';
      }
    });

  const formatDate = (iso) => {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDay = (iso) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return { day: '—', time: '' };
    return {
      day: new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(date),
      time: new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(date)
    };
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '—';
    const minutes = seconds / 60;
    if (minutes < 1) return '<1 min';
    return `${minutes.toFixed(minutes < 10 ? 1 : 0)} min`;
  };

  const plainAnswer = (value) => (Array.isArray(value) ? value.join('; ') : String(value || ''));

  let toastTimer = null;
  function toast(message) {
    clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add('is-visible');
    toastTimer = setTimeout(() => els.toast.classList.remove('is-visible'), 2400);
  }

  /* ------------------------------------------------------------------ */
  /* Rendering                                                           */
  /* ------------------------------------------------------------------ */

  function computeStats() {
    const total = state.items.length;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const week = state.items.filter((item) => new Date(item.submittedAt).getTime() >= weekAgo).length;

    const counts = new Map();
    state.items.forEach((item) => {
      const priorities = item.answers?.q14;
      if (Array.isArray(priorities) && priorities[0]) {
        counts.set(priorities[0], (counts.get(priorities[0]) || 0) + 1);
      }
    });
    let topPriority = '—';
    let topCount = 0;
    counts.forEach((count, value) => {
      if (count > topCount) {
        topCount = count;
        topPriority = value;
      }
    });

    const durations = state.items
      .map((item) => Number(item.durationSeconds))
      .filter((value) => Number.isFinite(value) && value > 0);
    const average = durations.length
      ? durations.reduce((sum, value) => sum + value, 0) / durations.length
      : 0;

    els.total.textContent = String(total);
    els.week.textContent = String(week);
    els.priority.textContent = topPriority;
    els.duration.textContent = average ? formatDuration(average) : '—';
    document.title = total ? `Responses (${total}) — Verdara Intelligence` : 'Responses — Verdara Intelligence';
  }

  function filteredItems() {
    const query = state.query.trim().toLowerCase();
    if (!query) return state.items;
    return state.items.filter((item) => {
      const haystack = [
        item.respondent?.name,
        item.respondent?.role,
        ...Object.values(item.answers || {}).map(plainAnswer)
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  function renderTable() {
    state.filtered = filteredItems();
    computeStats();

    els.count.textContent = String(state.filtered.length);
    const hasAny = state.items.length > 0;
    const hasMatches = state.filtered.length > 0;

    els.tableWrap.hidden = !hasMatches;
    els.empty.hidden = hasMatches;

    if (!hasMatches) {
      if (!hasAny) {
        els.emptyTitle.textContent = 'No responses yet';
        els.emptyText.textContent =
          'Share the questionnaire link — responses will appear here automatically.';
        els.emptyCopy.hidden = false;
      } else {
        els.emptyTitle.textContent = 'No matching responses';
        els.emptyText.textContent = 'Try a different name, role or keyword.';
        els.emptyCopy.hidden = true;
      }
      els.rows.innerHTML = '';
      return;
    }

    els.rows.innerHTML = state.filtered
      .map((item) => {
        const name = item.respondent?.name || 'Anonymous';
        const role = item.respondent?.role || 'Role not given';
        const priorities = item.answers?.q14;
        const topPriority = Array.isArray(priorities) && priorities[0] ? priorities[0] : '—';
        const aiControl = item.answers?.q11 || '—';
        const date = formatDay(item.submittedAt);
        return `
          <tr data-id="${escapeHtml(item.id)}" tabindex="0" role="button" aria-label="Open response from ${escapeHtml(name)}">
            <td class="cell-date">${escapeHtml(date.day)}<small>${escapeHtml(date.time)}</small></td>
            <td>
              <span class="cell-name">
                <strong>${escapeHtml(name)}</strong>
                <small>${escapeHtml(role)}</small>
              </span>
            </td>
            <td><span class="priority-chip">${escapeHtml(topPriority)}</span></td>
            <td><span class="ai-control">${escapeHtml(aiControl)}</span></td>
            <td class="cell-time">${escapeHtml(formatDuration(item.durationSeconds))}</td>
            <td>
              <span class="row-arrow" aria-hidden="true">
                <svg class="icon" width="14" height="14"><use href="#i-arrow"/></svg>
              </span>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  function answerMarkup(key, value) {
    if (!value || (Array.isArray(value) && !value.length)) {
      return '<span class="review-empty">Not answered</span>';
    }

    if (key === 'q14' && Array.isArray(value)) {
      return `<div class="drawer-rank">${value
        .map((item) => `<span>${escapeHtml(item)}</span>`)
        .join('')}</div>`;
    }

    if (Array.isArray(value)) {
      return `<div class="drawer-answer-list">${value
        .map((item) => `<span>${escapeHtml(item)}</span>`)
        .join('')}</div>`;
    }

    return escapeHtml(value);
  }

  function openDrawer(id) {
    const item = state.items.find((entry) => entry.id === id);
    if (!item) return;

    state.selectedId = id;
    state.lastFocused = document.activeElement;

    const name = item.respondent?.name || 'Anonymous';
    const role = item.respondent?.role || 'Role not given';
    els.drawerName.textContent = name;
    els.drawerMeta.textContent = `${role} · ${formatDate(item.submittedAt)} · ${formatDuration(item.durationSeconds)}`;
    els.drawerId.textContent = item.id ? `ID · ${item.id.slice(0, 8).toUpperCase()}` : '';

    const details = `
      <section class="drawer-section">
        <h3>Respondent</h3>
        <dl class="drawer-qa">
          <div class="drawer-q"><dt>Name</dt><dd>${escapeHtml(name)}</dd></div>
          <div class="drawer-q"><dt>Role</dt><dd>${escapeHtml(role)}</dd></div>
          <div class="drawer-q"><dt>Submitted</dt><dd>${escapeHtml(formatDate(item.submittedAt))}</dd></div>
          <div class="drawer-q"><dt>Time taken</dt><dd>${escapeHtml(formatDuration(item.durationSeconds))}</dd></div>
        </dl>
      </section>
    `;

    const sections = SECTIONS.map((section) => {
      const questions = section.items
        .map(([key, label]) => {
          const value = item.answers?.[key];
          const empty = !value || (Array.isArray(value) && !value.length);
          return `
            <div class="drawer-q">
              <dt>${escapeHtml(label)}</dt>
              <dd>${empty ? '<span class="review-empty">Not answered</span>' : answerMarkup(key, value)}</dd>
            </div>
          `;
        })
        .join('');
      return `<section class="drawer-section"><h3>${escapeHtml(section.title)}</h3><dl class="drawer-qa">${questions}</dl></section>`;
    }).join('');

    els.drawerBody.innerHTML = details + sections;
    els.drawerBody.scrollTop = 0;

    els.backdrop.hidden = false;
    els.drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');

    requestAnimationFrame(() => {
      els.backdrop.classList.add('is-open');
      els.drawer.classList.add('is-open');
      setTimeout(() => els.closeDrawer.focus(), 60);
    });
  }

  function closeDrawer() {
    els.backdrop.classList.remove('is-open');
    els.drawer.classList.remove('is-open');
    els.drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');
    state.selectedId = null;

    setTimeout(() => {
      if (!els.drawer.classList.contains('is-open')) els.backdrop.hidden = true;
    }, 300);

    if (state.lastFocused && typeof state.lastFocused.focus === 'function') {
      state.lastFocused.focus();
    }
  }

  /* ------------------------------------------------------------------ */
  /* Data                                                                */
  /* ------------------------------------------------------------------ */

  async function load({ silent = false } = {}) {
    if (state.loading) return;
    state.loading = true;
    if (!silent) els.refresh.classList.add('is-spinning');
    els.error.hidden = true;

    try {
      const response = await fetch('/api/submissions', {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      if (response.status === 401) throw new Error('Your session expired. Reload the page and sign in again.');
      if (!response.ok) throw new Error(`The server returned ${response.status}.`);

      const data = await response.json();
      state.items = Array.isArray(data.submissions) ? data.submissions : [];
      renderTable();
    } catch (error) {
      els.error.hidden = false;
      els.error.textContent = `Could not load responses. ${error.message}`;
    } finally {
      state.loading = false;
      els.refresh.classList.remove('is-spinning');
    }
  }

  async function deleteSelected() {
    if (!state.selectedId) return;
    const item = state.items.find((entry) => entry.id === state.selectedId);
    const name = item?.respondent?.name || 'this response';
    if (!window.confirm(`Delete the response from ${name}? This cannot be undone.`)) return;

    els.deleteBtn.disabled = true;
    try {
      const response = await fetch(`/api/submissions/${state.selectedId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`The server returned ${response.status}.`);
      state.items = state.items.filter((entry) => entry.id !== state.selectedId);
      closeDrawer();
      renderTable();
      toast('Response deleted');
    } catch (error) {
      window.alert(`Could not delete the response. ${error.message}`);
    } finally {
      els.deleteBtn.disabled = false;
    }
  }

  function copyLink() {
    const url = `${window.location.origin}/`;
    const done = () => toast('Share link copied');
    const fallback = () => {
      const input = document.createElement('textarea');
      input.value = url;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand('copy');
        done();
      } catch {
        window.prompt('Copy this link:', url);
      }
      input.remove();
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(done).catch(fallback);
    } else {
      fallback();
    }
  }

  /* ------------------------------------------------------------------ */
  /* Wiring                                                              */
  /* ------------------------------------------------------------------ */

  function init() {
    els.shareText.textContent = `${window.location.origin}/`;
    els.copyLink.addEventListener('click', copyLink);
    els.shareUrl.addEventListener('click', copyLink);
    els.emptyCopy.addEventListener('click', copyLink);
    els.refresh.addEventListener('click', () => load());
    els.closeDrawer.addEventListener('click', closeDrawer);
    els.backdrop.addEventListener('click', closeDrawer);
    els.deleteBtn.addEventListener('click', deleteSelected);

    els.search.addEventListener('input', () => {
      state.query = els.search.value;
      renderTable();
    });

    els.rows.addEventListener('click', (event) => {
      const row = event.target.closest('tr[data-id]');
      if (row) openDrawer(row.dataset.id);
    });

    els.rows.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const row = event.target.closest('tr[data-id]');
      if (!row) return;
      event.preventDefault();
      openDrawer(row.dataset.id);
    });

    els.drawer.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const focusables = $$(
        'button, a[href], input, [tabindex]:not([tabindex="-1"])',
        els.drawer
      ).filter((el) => !el.disabled && el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && state.selectedId) closeDrawer();
    });

    load();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
