/* ==========================================================================
   Verdara Intelligence — Questionnaire
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'verdara-intelligence-questionnaire-v1';
  const TOTAL_STEPS = 6;
  const REVIEW_STEP = 6;
  const SECTION_NAMES = ['Operations', 'Finance', 'Stock & store', 'AI & automation', 'Priorities'];
  const SECTION_NAMES_FR = ['Opérations', 'Finance', 'Stock & boutique', 'IA & automatisation', 'Priorités'];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const els = {
    header: $('#siteHeader'),
    intro: $('#viewIntro'),
    formView: $('#viewForm'),
    success: $('#viewSuccess'),
    offline: $('#viewOffline'),
    form: $('#questionnaire'),
    steps: $$('.step'),
    start: $('#btnStart'),
    startLabel: $('#btnStartLabel'),
    startOver: $('#btnStartOver'),
    resume: $('#introResume'),
    name: $('#respondentName'),
    role: $('#respondentRole'),
    nameError: $('#nameError'),
    nameField: $('#respondentName').closest('.field'),
    saveStatus: $('#saveStatus'),
    progressPct: $('#progressPct'),
    progressBar: $('#progressBar'),
    progressTrack: $('#progressTrack'),
    mobileStepLabel: $('#mobileStepLabel'),
    mobilePct: $('#mobilePct'),
    mobileBar: $('#mobileProgressBar'),
    stepList: $('#stepList'),
    reviewContent: $('#reviewContent'),
    btnBack: $('#btnBack'),
    btnNext: $('#btnNext'),
    btnNextLabel: $('#btnNextLabel'),
    navHint: $('#navHint'),
    rankGrid: $('#rankGrid'),
    rankHelp: $('#rankHelp'),
    rankValue: $('#rankGrid') ? $('input[type="hidden"]', $('#rankGrid').closest('.question')) : null,
    successName: $('#successName'),
    successChips: $('#successChips'),
    successSummary: $('#successSummary'),
    successId: $('#successId'),
    offlineEmail: $('#offlineEmail'),
    submitError: $('#submitError'),
    btnDownload: $('#btnDownload'),
    btnDownloadOffline: $('#btnDownloadOffline'),
    btnPrint: $('#btnPrint'),
    btnRetry: $('#btnRetry')
  };

  const state = {
    step: 1,
    answers: {},
    respondent: { name: '', role: '' },
    startedAt: Date.now(),
    lastPayload: null,
    draftAvailable: false,
    submitting: false,
    submitted: false
  };

  let rank = [];
  let saveTimer = null;
  let statusTimer = null;

  const rankQuestionKey = () =>
    els.rankGrid ? els.rankGrid.closest('.question')?.dataset.q || '' : '';

  /* ------------------------------------------------------------------ */
  /* Utilities                                                           */
  /* ------------------------------------------------------------------ */

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

  const firstQuestionMeta = () => {
    const sections = [];
    for (let stepNumber = 1; stepNumber <= 5; stepNumber += 1) {
      const stepEl = $(`.step[data-step="${stepNumber}"]`);
      if (!stepEl) continue;
      const title = $('.section-head h2', stepEl).textContent.trim();
      const questions = $$('.question', stepEl).map((question) => ({
        key: question.dataset.q,
        type: question.dataset.type || 'text',
        number: ($('.qnum', question)?.textContent || '').trim(),
        label: $('.question__label', question).textContent.trim()
      }));
      sections.push({ step: stepNumber, title, questions });
    }
    return sections;
  };

  let reviewSections = firstQuestionMeta();

  /* ------------------------------------------------------------------ */
  /* Saving status                                                       */
  /* ------------------------------------------------------------------ */

  function setSaveStatus(text, active = false) {
    if (!els.saveStatus) return;
    clearTimeout(statusTimer);
    els.saveStatus.textContent = text;
    els.saveStatus.classList.toggle('is-active', active);
    if (active && text) {
      statusTimer = setTimeout(() => {
        els.saveStatus.textContent = '';
        els.saveStatus.classList.remove('is-active');
      }, 2600);
    }
  }

  function scheduleSave() {
    if (state.submitting || state.submitted) return;
    setSaveStatus('Saving…');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      persistDraft();
      setSaveStatus('Saved', true);
    }, 500);
  }

  function persistDraft() {
    if (state.submitted) return;
    collectAll();
    state.draftAvailable = true;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 1,
          answers: state.answers,
          respondent: state.respondent,
          step: state.step,
          startedAt: state.startedAt,
          updatedAt: new Date().toISOString()
        })
      );
    } catch {
      setSaveStatus('Autosave unavailable');
    }
  }

  /* ------------------------------------------------------------------ */
  /* Collecting answers                                                  */
  /* ------------------------------------------------------------------ */

  function collectQuestion(question) {
    const key = question.dataset.q;
    const type = question.dataset.type || 'text';

    if (type === 'rank') {
      state.answers[key] = rank.slice();
      return;
    }

    const checkboxes = $$('input[type="checkbox"]', question);
    if (checkboxes.length) {
      const values = [];
      checkboxes.forEach((checkbox) => {
        if (!checkbox.checked) return;
        if (checkbox.value === 'Other') {
          const other = $(`input[name="${key}_other"]`, question);
          const text = other ? other.value.trim() : '';
          values.push(text ? `Other: ${text}` : 'Other');
        } else {
          values.push(checkbox.value);
        }
      });
      state.answers[key] = values;
      return;
    }

    const radios = $$('input[type="radio"]', question);
    if (radios.length) {
      const selected = radios.find((radio) => radio.checked);
      state.answers[key] = selected ? selected.value : '';
      return;
    }

    const field = $('textarea, input[type="text"]', question);
    state.answers[key] = field ? field.value.trim() : '';
  }

  function collectAll() {
    $$('.step .question').forEach(collectQuestion);
    state.respondent = {
      name: els.name.value.trim(),
      role: els.role.value.trim()
    };
    return state.answers;
  }

  function cleanAnswers() {
    collectAll();
    const cleaned = {};
    Object.entries(state.answers).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        const items = value.filter((item) => String(item).trim());
        if (items.length) cleaned[key] = items;
      } else if (value) {
        cleaned[key] = value;
      }
    });
    return cleaned;
  }

  /* ------------------------------------------------------------------ */
  /* Restoring answers                                                   */
  /* ------------------------------------------------------------------ */

  function syncOptionStates() {
    $$('.option').forEach((option) => {
      const input = $('input[type="checkbox"], input[type="radio"]', option);
      if (!input) return;
      option.classList.toggle('is-checked', input.checked);
      if (option.classList.contains('option--other')) {
        option.classList.toggle('is-open', input.checked);
        const otherInput = $('.option__input', option);
        if (otherInput) otherInput.tabIndex = input.checked ? 0 : -1;
      }
    });
  }

  function applyAnswersToForm() {
    if (els.name) els.name.value = state.respondent.name || '';
    if (els.role) els.role.value = state.respondent.role || '';

    $$('.step .question').forEach((question) => {
      const key = question.dataset.q;
      const type = question.dataset.type || 'text';
      const value = state.answers[key];

      if (type === 'rank') {
        rank = Array.isArray(value) ? value.slice(0, 3) : [];
        updateRankUI();
        return;
      }

      const checkboxes = $$('input[type="checkbox"]', question);
      if (checkboxes.length) {
        const values = Array.isArray(value) ? value : [];
        checkboxes.forEach((checkbox) => {
          if (checkbox.value === 'Other') {
            const otherValue = values.find((item) => item === 'Other' || item.startsWith('Other:'));
            checkbox.checked = Boolean(otherValue);
            const otherInput = $(`input[name="${key}_other"]`, question);
            if (otherInput) {
              otherInput.value =
                otherValue && otherValue.startsWith('Other:')
                  ? otherValue.replace(/^Other:\s*/, '')
                  : '';
            }
          } else {
            checkbox.checked = values.includes(checkbox.value);
          }
        });
        syncOptionStates();
        return;
      }

      const radios = $$('input[type="radio"]', question);
      if (radios.length) {
        radios.forEach((radio) => {
          radio.checked = radio.value === value;
        });
        syncOptionStates();
        return;
      }

      const field = $('textarea, input[type="text"]', question);
      if (field) field.value = typeof value === 'string' ? value : '';
    });
  }

  function restoreDraft() {
    let draft;
    try {
      draft = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
      return;
    }
    if (!draft || !draft.answers) return;

    const hasAnswers =
      Boolean(draft.respondent?.name || draft.respondent?.role) ||
      Object.values(draft.answers).some((value) =>
        Array.isArray(value) ? value.length : Boolean(value)
      );
    if (!hasAnswers) return;

    state.answers = draft.answers || {};
    state.respondent = {
      name: draft.respondent?.name || '',
      role: draft.respondent?.role || ''
    };
    state.startedAt = Number(draft.startedAt) || Date.now();
    state.step = Number(draft.step) >= 1 && Number(draft.step) <= TOTAL_STEPS ? Number(draft.step) : 1;
    state.draftAvailable = true;

    applyAnswersToForm();

    els.startLabel.textContent = 'Resume questionnaire';
    els.resume.hidden = false;
    els.startOver.hidden = false;
  }

  function clearDraft() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    state.draftAvailable = false;
  }

  /* ------------------------------------------------------------------ */
  /* Rank question                                                       */
  /* ------------------------------------------------------------------ */

  function updateRankUI() {
    $$('.rank-option', els.rankGrid).forEach((button) => {
      const index = rank.indexOf(button.dataset.value);
      const ranked = index !== -1;
      button.classList.toggle('is-ranked', ranked);
      button.setAttribute('aria-pressed', ranked ? 'true' : 'false');
      const badge = $('.rank-badge', button);
      const stateLabel = $('.rank-option__state', button);
      if (badge) badge.textContent = ranked ? String(index + 1) : '·';
      if (stateLabel) stateLabel.textContent = ranked
        ? uiText(`Priority ${index + 1}`, `Priorité ${index + 1}`)
        : uiText('Select', 'Choisir');
    });
    if (els.rankValue) els.rankValue.value = rank.join('|');
    if (els.rankHelp) {
      els.rankHelp.textContent =
        rank.length === 3
          ? uiText(
              'Top three selected. Click one to remove it, then choose another.',
              'Trois choix sélectionnés. Cliquez sur un choix pour le retirer, puis choisissez-en un autre.'
            )
          : uiText(
              'Your first pick = priority 1. Click a selected item to remove it.',
              'Votre premier choix = priorité 1. Cliquez sur un choix sélectionné pour le retirer.'
            );
    }
  }

  function bindRank() {
    if (!els.rankGrid) return;
    $$('.rank-option', els.rankGrid).forEach((button) => {
      button.addEventListener('click', () => {
        const value = button.dataset.value;
        const index = rank.indexOf(value);
        if (index !== -1) {
          rank.splice(index, 1);
        } else {
          if (rank.length >= 3) rank.pop();
          rank.push(value);
          button.classList.remove('bump');
          void button.offsetWidth;
          button.classList.add('bump');
        }
        updateRankUI();
        scheduleSave();
      });
    });
    updateRankUI();
  }

  /* ------------------------------------------------------------------ */
  /* Review                                                              */
  /* ------------------------------------------------------------------ */

  const lang = () => (window.VerdaraI18n ? window.VerdaraI18n.getLang() : 'en');
  const isFr = () => lang() === 'fr';

  // Display helper: translate a stored English option value for display only.
  const displayValue = (value) =>
    isFr() && window.VerdaraI18n ? window.VerdaraI18n.opt(String(value)) : String(value);

  const uiText = (en, fr) => (isFr() ? fr : en);

  function renderAnswer(question, value) {
    if (question.type === 'rank') {
      const items = Array.isArray(value) ? value : [];
      if (!items.length) return `<span class="review-empty">${uiText('Not answered', 'Sans réponse')}</span>`;
      return `<ol class="review-rank">${items
        .map(
          (item, index) =>
            `<li><span class="review-rank__num">${index + 1}</span>${escapeHtml(displayValue(item))}</li>`
        )
        .join('')}</ol>`;
    }

    if (Array.isArray(value)) {
      if (!value.length) return `<span class="review-empty">${uiText('Not answered', 'Sans réponse')}</span>`;
      return `<div class="review-chips">${value
        .map((item) => {
          const clean = String(item).replace(/^Other:\s*/, '');
          const shown = String(item).startsWith('Other')
            ? uiText('Other', 'Autre') + (clean !== 'Other' ? ': ' + clean : '')
            : displayValue(item);
          return `<span class="review-chip">${escapeHtml(shown)}</span>`;
        })
        .join('')}</div>`;
    }

    if (!value) return `<span class="review-empty">${uiText('Not answered', 'Sans réponse')}</span>`;
    return escapeHtml(displayValue(value));
  }

  function renderReview() {
    collectAll();
    reviewSections = firstQuestionMeta();
    const parts = [];

    parts.push(`
      <section class="review-block">
        <header class="review-block__head">
          <h3>${uiText('Your details', 'Vos coordonnées')}</h3>
          <button type="button" class="review-edit" data-edit="1">${uiText('Edit', 'Modifier')}</button>
        </header>
        <dl class="review-list">
          <div class="review-item">
            <dt>${uiText('Name', 'Nom')}</dt>
            <dd>${state.respondent.name ? escapeHtml(state.respondent.name) : `<span class="review-empty">${uiText('Not answered', 'Sans réponse')}</span>`}</dd>
          </div>
          <div class="review-item">
            <dt>${uiText('Role', 'Rôle')}</dt>
            <dd>${state.respondent.role ? escapeHtml(state.respondent.role) : `<span class="review-empty">${uiText('Not answered', 'Sans réponse')}</span>`}</dd>
          </div>
        </dl>
      </section>
    `);

    reviewSections.forEach((section) => {
      const items = section.questions
        .map((question) => {
          const label = question.number
            ? `${question.number} · ${question.label}`
            : question.label;
          return `
            <div class="review-item">
              <dt>${escapeHtml(label)}</dt>
              <dd>${renderAnswer(question, state.answers[question.key])}</dd>
            </div>
          `;
        })
        .join('');

      parts.push(`
        <section class="review-block">
          <header class="review-block__head">
            <h3>${escapeHtml(section.title)}</h3>
            <button type="button" class="review-edit" data-edit="${section.step}">${uiText('Edit', 'Modifier')}</button>
          </header>
          <dl class="review-list">${items}</dl>
        </section>
      `);
    });

    els.reviewContent.innerHTML = parts.join('');
  }

  /* ------------------------------------------------------------------ */
  /* Navigation                                                          */
  /* ------------------------------------------------------------------ */

  function updateChrome() {
    const total = TOTAL_STEPS;
    const percent = Math.round((state.step / total) * 100);

    els.progressPct.textContent = `${percent}%`;
    els.progressBar.style.width = `${percent}%`;
    els.progressTrack.setAttribute('aria-valuenow', String(percent));

    els.mobilePct.textContent = `${percent}%`;
    els.mobileBar.style.width = `${percent}%`;
    els.mobileStepLabel.textContent =
      state.step === REVIEW_STEP
        ? uiText('Review & send', 'Vérifier & envoyer')
        : uiText(
            `Section ${state.step} of 5 · ${SECTION_NAMES[state.step - 1]}`,
            `Section ${state.step} sur 5 · ${SECTION_NAMES_FR[state.step - 1]}`
          );

    $$('li[data-step-link]', els.stepList).forEach((item) => {
      const itemStep = Number(item.dataset.stepLink);
      item.classList.toggle('is-active', itemStep === state.step);
      item.classList.toggle('is-done', itemStep < state.step);
      if (itemStep === state.step) {
        item.setAttribute('aria-current', 'step');
      } else {
        item.removeAttribute('aria-current');
      }
    });

    const isReview = state.step === REVIEW_STEP;
    if (!state.submitting) {
      els.btnNextLabel.textContent = isReview
        ? uiText('Send my answers', 'Envoyer mes réponses')
        : state.step === 5
          ? uiText('Review answers', 'Vérifier les réponses')
          : uiText('Continue', 'Continuer');
    }
    const iconUse = els.btnNext.querySelector('use');
    if (iconUse) iconUse.setAttribute('href', isReview ? '#i-send' : '#i-arrow');

    const hints = isFr()
      ? {
          1: 'Durée totale d\u2019environ 10–15 minutes',
          2: 'Vos réponses sont enregistrées automatiquement sur cet appareil',
          3: 'Vos réponses sont enregistrées automatiquement sur cet appareil',
          4: 'Vos réponses sont enregistrées automatiquement sur cet appareil',
          5: 'Ensuite : une vérification rapide avant l\u2019envoi',
          6: 'Un clic pour envoyer — vous pouvez encore revenir'
        }
      : {
          1: 'Takes about 10–15 minutes in total',
          2: 'Your answers save automatically on this device',
          3: 'Your answers save automatically on this device',
          4: 'Your answers save automatically on this device',
          5: 'Next: a quick review before sending',
          6: 'One click to send — you can still go back'
        };
    els.navHint.textContent = hints[state.step] || '';
  }

  function showStep(stepNumber, { focus = true } = {}) {
    collectAll();
    state.step = Math.min(Math.max(stepNumber, 1), TOTAL_STEPS);

    els.steps.forEach((stepEl) => {
      stepEl.hidden = Number(stepEl.dataset.step) !== state.step;
    });

    els.submitError.hidden = true;
    if (state.step === REVIEW_STEP) renderReview();
    updateChrome();
    persistDraft();

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (focus) {
      requestAnimationFrame(() => {
        if (state.step === 1 && !state.respondent.name) {
          els.name.focus({ preventScroll: true });
          return;
        }
        const heading = $(`.step[data-step="${state.step}"] .section-head h2`);
        if (heading) heading.focus({ preventScroll: true });
      });
    }
  }

  function openQuestionnaire() {
    els.intro.hidden = true;
    els.success.hidden = true;
    els.offline.hidden = true;
    els.formView.hidden = false;
    if (!state.draftAvailable && !Object.keys(state.answers).length) {
      state.startedAt = Date.now();
    }
    showStep(state.step || 1);
  }

  function validateBeforeNext() {
    if (state.step !== 1) return true;
    collectAll();
    if (state.respondent.name) {
      els.nameField.classList.remove('has-error');
      els.nameError.hidden = true;
      return true;
    }
    els.nameField.classList.add('has-error');
    els.nameError.hidden = false;
    els.name.focus();
    els.name.scrollIntoView({ block: 'center', behavior: 'smooth' });
    return false;
  }

  function goNext() {
    if (state.step === REVIEW_STEP) {
      submitQuestionnaire();
      return;
    }
    if (!validateBeforeNext()) return;
    showStep(state.step + 1);
  }

  function goBack() {
    if (state.step === 1) {
      collectAll();
      els.formView.hidden = true;
      els.intro.hidden = false;
      els.startLabel.textContent = state.draftAvailable ? 'Resume questionnaire' : 'Start the questionnaire';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    showStep(state.step - 1);
  }

  /* ------------------------------------------------------------------ */
  /* Submission                                                          */
  /* ------------------------------------------------------------------ */

  function buildPayload() {
    const answers = cleanAnswers();
    return {
      version: 1,
      respondent: { ...state.respondent },
      answers,
      startedAt: new Date(state.startedAt || Date.now()).toISOString(),
      durationSeconds: Math.max(0, Math.round((Date.now() - (state.startedAt || Date.now())) / 1000)),
      language: navigator.language || '',
      company_website: els.form.querySelector('[name="company_website"]')?.value || ''
    };
  }

  function setSubmitting(isSubmitting) {
    state.submitting = isSubmitting;
    els.btnNext.disabled = isSubmitting;
    if (isSubmitting) {
      els.btnNextLabel.textContent = 'Sending…';
    } else {
      updateChrome();
    }
  }

  async function submitQuestionnaire() {
    if (state.submitting) return;
    collectAll();

    if (!state.respondent.name) {
      showStep(1);
      validateBeforeNext();
      return;
    }

    const payload = buildPayload();
    if (!Object.keys(payload.answers).length) {
      els.submitError.hidden = false;
      els.submitError.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    state.lastPayload = payload;
    setSubmitting(true);
    setSaveStatus('');

    const configured =
      window.VERDARA_CONFIG && typeof window.VERDARA_CONFIG.endpoint === 'string'
        ? window.VERDARA_CONFIG.endpoint.trim()
        : '';
    const endpoint = configured || '/api/submit';

    if (window.location.protocol === 'file:') {
      setSubmitting(false);
      showOffline();
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(state.lastPayload)
      });

      if (!response.ok) throw new Error(`Submission failed with status ${response.status}`);

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        throw new Error('The submission endpoint returned a web page instead of a confirmation.');
      }

      let data = {};
      try {
        data = await response.json();
      } catch {
        /* endpoint may not return JSON */
      }

      finishSuccess(data && data.id ? data.id : null);
    } catch (error) {
      console.warn('Verdara questionnaire submission failed:', error);
      setSubmitting(false);
      showOffline();
    }
  }

  function finishSuccess(responseId) {
    collectAll();
    state.submitted = true;
    clearTimeout(saveTimer);
    clearDraft();
    state.draftAvailable = false;
    setSubmitting(false);
    els.saveStatus.textContent = '';

    els.intro.hidden = true;
    els.formView.hidden = true;
    els.offline.hidden = true;
    els.success.hidden = false;

    const firstName = (state.respondent.name || '').split(/\s+/)[0];
    els.successName.textContent = firstName ? `, ${firstName}` : '';

    renderSuccessChips();

    if (responseId) {
      els.successId.hidden = false;
      els.successId.textContent = `${uiText('Response ID', 'Référence de réponse')} · ${responseId.slice(0, 8).toUpperCase()}`;
    } else {
      els.successId.hidden = true;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    els.success.querySelector('h2')?.focus?.();
  }

  function renderSuccessChips() {
    const key = rankQuestionKey();
    const priorities = key && Array.isArray(state.answers[key]) ? state.answers[key] : [];
    if (priorities.length) {
      els.successSummary.hidden = false;
      els.successChips.innerHTML = priorities
        .map((item, index) => `<span><b>${index + 1}</b>${escapeHtml(displayValue(item))}</span>`)
        .join('');
    } else {
      els.successSummary.hidden = true;
    }
  }

  function showOffline() {
    els.intro.hidden = true;
    els.formView.hidden = true;
    els.success.hidden = true;
    els.offline.hidden = false;

    const email = window.VERDARA_CONFIG && window.VERDARA_CONFIG.contactEmail;
    if (email) {
      els.offlineEmail.textContent = email;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function downloadJson() {
    if (!state.lastPayload) state.lastPayload = buildPayload();
    const safeName = (state.respondent.name || 'answers')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
    const blob = new Blob([JSON.stringify(state.lastPayload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `verdara-questionnaire-${safeName || 'answers'}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  /* ------------------------------------------------------------------ */
  /* Wiring                                                              */
  /* ------------------------------------------------------------------ */

  function bindFormEvents() {
    els.form.addEventListener('input', (event) => {
      if (event.target === els.name && state.respondent.name) {
        els.nameField.classList.remove('has-error');
        els.nameError.hidden = true;
      }
      scheduleSave();
    });

    els.form.addEventListener('change', (event) => {
      const target = event.target;
      if (target.matches('input[type="checkbox"], input[type="radio"]')) {
        syncOptionStates();

        if (target.matches('input[type="checkbox"]') && target.value === 'Other' && target.checked) {
          const otherInput = target
            .closest('.option--other')
            ?.querySelector('.option__input');
          if (otherInput) {
            requestAnimationFrame(() => otherInput.focus());
          }
        }
      }
      scheduleSave();
    });

    els.form.addEventListener('submit', (event) => {
      event.preventDefault();
      goNext();
    });

    els.btnNext.addEventListener('click', goNext);
    els.btnBack.addEventListener('click', goBack);

    els.stepList.addEventListener('click', (event) => {
      const item = event.target.closest('li[data-step-link]');
      if (!item) return;
      if (!els.formView.hidden) {
        showStep(Number(item.dataset.stepLink));
      }
    });

    els.reviewContent.addEventListener('click', (event) => {
      const button = event.target.closest('[data-edit]');
      if (!button) return;
      showStep(Number(button.dataset.edit));
    });

    els.start.addEventListener('click', openQuestionnaire);

    els.startOver.addEventListener('click', () => {
      clearDraft();
      state.answers = {};
      rank = [];
      state.respondent = { name: '', role: '' };
      state.startedAt = Date.now();
      state.step = 1;
      els.form.reset();
      applyAnswersToForm();
      syncOptionStates();
      updateRankUI();
      els.nameField.classList.remove('has-error');
      els.nameError.hidden = true;
      els.startLabel.textContent = 'Start the questionnaire';
      els.resume.hidden = true;
      els.startOver.hidden = true;
      els.saveStatus.textContent = '';
    });

    els.name.addEventListener('input', () => {
      if (els.name.value.trim()) {
        els.nameField.classList.remove('has-error');
        els.nameError.hidden = true;
      }
    });

    els.btnDownload.addEventListener('click', downloadJson);
    els.btnDownloadOffline.addEventListener('click', downloadJson);
    els.btnPrint.addEventListener('click', () => window.print());
    els.btnRetry.addEventListener('click', submitQuestionnaire);
    $('#btnRestart').addEventListener('click', () => window.location.reload());

    window.addEventListener('beforeunload', () => {
      if (!els.formView.hidden && !state.submitting) persistDraft();
    });
  }

  function bindChrome() {
    const onScroll = () => {
      els.header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    $('#year').textContent = String(new Date().getFullYear());
  }

  function init() {
    bindChrome();
    bindRank();
    bindFormEvents();
    restoreDraft();

    state.step = Math.min(Math.max(state.step || 1, 1), TOTAL_STEPS);
    collectAll();
    updateChrome();

    // Re-render language-dependent UI when the user switches EN/FR.
    document.addEventListener('verdara:lang', () => {
      reviewSections = firstQuestionMeta();
      collectAll();
      updateChrome();
      if (state.step === REVIEW_STEP) renderReview();
      if (!els.success.hidden) {
        const firstName = (state.respondent.name || '').split(/\s+/)[0];
        if (els.successName) els.successName.textContent = firstName ? `, ${escapeHtml(firstName)}` : '';
        renderSuccessChips();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
