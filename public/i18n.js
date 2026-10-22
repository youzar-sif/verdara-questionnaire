/* ==========================================================================
   Verdara Intelligence — EN / FR translation layer
   English is the source of truth in index.html; this file overlays French.
   Stored answer values always stay in English so CSV/admin stay comparable.
   ========================================================================== */

(function () {
  'use strict';

  var LANG_KEY = 'verdara-lang';

  /* ---------------------------------------------------------------- */
  /* Structural strings                                               */
  /* ---------------------------------------------------------------- */

  var FR = {
    time: '10–15 min',

    'intro.eyebrow': 'Verdara Home · Questionnaire de découverte',
    'intro.title': 'Dites-nous comment Verdara Home fonctionne <em>vraiment</em>.',
    'intro.lede':
      'Nous concevons <strong>Verdara Intelligence</strong> — une vue claire des ventes, du stock, des clients et de la trésorerie. Avant de construire, nous avons besoin d\u2019une image honnête de votre fonctionnement actuel et de ce qui ferait la plus grande différence pour vous.',
    'intro.forLabel': 'Pour',
    'intro.forValue': 'L\u2019équipe Verdara Home',
    'intro.formatLabel': 'Format',
    'intro.formatValue': '5 sections · 19 questions',
    'intro.timeLabel': 'Durée',
    'intro.timeValue': '10–15 minutes',
    'intro.start': 'Commencer le questionnaire',
    'intro.startOver': 'Recommencer',
    'intro.resume': 'Vos réponses précédentes ont été enregistrées sur cet appareil.',
    'intro.privacy':
      'Aucune mauvaise réponse. Des réponses courtes suffisent. Vos réponses servent uniquement à ce projet.',

    'hero.kicker': 'Contenu du questionnaire',
    'hero.s1': 'Opérations actuelles',
    'hero.s1d': 'Comment l\u2019entreprise fonctionne aujourd\u2019hui',
    'hero.s2': 'Finance & comptabilité',
    'hero.s2d': 'Entrées, sorties et visibilité',
    'hero.s3': 'Stock & boutique',
    'hero.s3d': 'Inventaire, commandes et paiements',
    'hero.s4': 'IA & automatisation',
    'hero.s4d': 'Ce que le système devrait gérer',
    'hero.s5': 'Tableau de bord & priorités',
    'hero.s5d': 'Ce qui compte en premier',
    'hero.footLabel': 'Conçu autour de',
    'hero.footValue': 'Le plan directeur Verdara Intelligence',

    'sec1.kicker': 'Section 01 <span aria-hidden="true">·</span> Opérations',
    'sec2.kicker': 'Section 02 <span aria-hidden="true">·</span> Finance',
    'sec3.kicker': 'Section 03 <span aria-hidden="true">·</span> Stock &amp; boutique',
    'sec4.kicker': 'Section 04 <span aria-hidden="true">·</span> IA &amp; automatisation',
    'sec5.kicker': 'Section 05 <span aria-hidden="true">·</span> Priorités',
    'review.kicker': 'Dernière étape <span aria-hidden="true">·</span> Vérification',

    'sec1.title': 'Opérations actuelles de l\u2019entreprise',
    'sec2.title': 'Finance &amp; comptabilité',
    'sec3.title': 'Stock &amp; boutique physique',
    'sec4.title': 'Agents IA &amp; automatisation',
    'sec5.title': 'Tableau de bord &amp; priorités',

    'sec1.sub': 'Commençons par le quotidien de Verdara Home.',
    'sec2.sub': 'Comment l\u2019argent est suivi, rapporté et vérifié aujourd\u2019hui.',
    'sec3.sub': 'Comment vous suivez les produits, les commandes et les paiements.',
    'sec4.sub': 'Là où l\u2019IA pourrait vraiment vous faire gagner du temps.',
    'sec5.sub': 'Ce que vous voulez voir en premier — et ce que nous devons construire en premier.',
    'review.sub': 'Vérifiez vos réponses, modifiez ce qui doit l\u2019être, puis envoyez-les à l\u2019équipe.',
    'review.title': 'Un dernier coup d\u2019œil.',

    'resp.title': 'D\u2019abord, qui répond ?',
    'resp.name': 'Votre nom <em>requis</em>',
    'resp.nameError': 'Veuillez indiquer votre nom pour que nous sachions qui a répondu.',
    'resp.role': 'Votre rôle',

    'rail.progress': 'Progression',
    'rail.1': 'Opérations',
    'rail.2': 'Finance',
    'rail.3': 'Stock & boutique',
    'rail.4': 'IA & automatisation',
    'rail.5': 'Priorités',
    'rail.review': 'Vérification',
    'rail.note':
      'Les réponses sont enregistrées automatiquement sur cet appareil, vous pouvez donc faire une pause et revenir plus tard.',

    'nav.back': 'Retour',
    'nav.continue': 'Continuer',
    'nav.send': 'Envoyer',
    'nav.hint1': 'Durée totale d\u2019environ 10–15 minutes',
    'nav.hint2': 'Remplissez ce que vous pouvez — rien n\u2019est obligatoire.',
    'nav.hint5': 'Vous pourrez tout vérifier à l\u2019étape suivante.',
    'submit.error':
      'Veuillez répondre à au moins une question avant d\u2019envoyer — même une courte note aide.',
    'review.note':
      'Vos réponses vont directement à l\u2019équipe Verdara Intelligence et servent uniquement à orienter ce projet.',

    'footnote': 'Verdara Intelligence · Questionnaire de découverte · Verdara Home',
    'foot.discovery': 'Découverte Verdara Home',
    'foot.private': 'Réponses confidentielles',
    'noscript':
      'Ce questionnaire nécessite JavaScript. Veuillez l\u2019ouvrir dans un navigateur moderne.',

    'success.eyebrow': 'Réponses reçues',
    'success.lede':
      'Vos réponses sont chez l\u2019équipe Verdara Intelligence. Elles détermineront ce que nous construisons en premier — et ce que nous laissons de côté.',
    'success.priorities': 'Vos principales priorités',
    'success.download': 'Télécharger une copie',
    'success.print': 'Imprimer / enregistrer en PDF',
    'success.restart': 'Commencer une autre réponse',

    'offline.eyebrow': 'Problème de connexion',
    'offline.title': 'Presque terminé.',
    'offline.lede':
      'Nous n\u2019avons pas pu joindre le serveur, vos réponses sont donc enregistrées en sécurité sur cet appareil. Téléchargez une copie et envoyez-la à l\u2019équipe — ou réessayez.',
    'offline.retry': 'Réessayer',
    'offline.download': 'Télécharger les réponses',
    'offline.help':
      'Envoyez le fichier téléchargé à <strong id="offlineEmail">l\u2019équipe Verdara Intelligence</strong>. Rien n\u2019a été perdu.',

    /* Question labels */
    'q.q1.label': 'Comment enregistrez-vous une vente aujourd\u2019hui ?',
    'q.q2.label': 'Comment vos clients paient-ils habituellement ?',
    'q.q3.label': 'Combien de produits différents vendez-vous environ ?',
    'q.q4.label': 'Où se trouvent aujourd\u2019hui vos informations produits et stock ?',
    'q.q5.label': 'Quelles sont les plus grandes difficultés que vous rencontrez dans la gestion ?',
    'q.q6.label': 'Combien de ventes ou commandes traitez-vous un jour typique ?',
    'q.q7.label': 'Comment suivez-vous aujourd\u2019hui les recettes, les dépenses et la trésorerie ?',
    'q.q8.label': 'Qui tient les comptes et prépare les rapports financiers ?',
    'q.q9.label': 'Quelles informations financières aimeriez-vous voir instantanément ?',
    'q.q10.label': 'Comment savez-vous aujourd\u2019hui si un produit est en stock ?',
    'q.q11.label': 'Quels problèmes liés au stock aimeriez-vous surtout résoudre ?',
    'q.q12.label': 'Comment suivez-vous aujourd\u2019hui les commandes clients, les acomptes et les paiements restants ?',
    'q.q13.label': 'Quelles tâches aimeriez-vous le plus confier à l\u2019IA ?',
    'q.q14.label': 'Quel niveau de contrôle l\u2019IA devrait-elle avoir ?',
    'q.q15.label': 'Qu\u2019est-ce qui rendrait ce système vraiment utile — et qu\u2019est-ce qui vous empêcherait de l\u2019utiliser ?',
    'q.q16.label': 'Que voudriez-vous voir en premier en ouvrant votre tableau de bord ?',
    'q.q17.label': 'Quel module devrions-nous prioriser ?',
    'q.q18.label': 'À quels logiciels ou fichiers le nouveau système devrait-il se connecter ?',
    'q.q19.label': 'Dans quelle langue devrions-nous construire le système ?',
    'q.comments.label': 'Commentaires ou idées supplémentaires',

    /* Question hints */
    'h.q1': 'Sélectionnez tout ce qui s\u2019applique — au comptoir, en ligne ou par téléphone.',
    'h.q2': 'Sélectionnez tout ce qui s\u2019applique — cela nous indique ce que le module financier doit gérer.',
    'h.q3': 'Une estimation suffit — cela nous dit s\u2019il vous faut une simple liste ou un inventaire complet.',
    'h.q4': 'Fichiers, cahiers, logiciels, WhatsApp — là où ils se trouvent réellement.',
    'h.q5': 'Ce qui vous coûte du temps, de l\u2019argent ou de la sérénité — et à quelle fréquence.',
    'h.q6': 'Une estimation suffit — cela nous aide à dimensionner la première version.',
    'h.q7': 'Indiquez les outils, fichiers ou personnes concernés, et à quelle fréquence tout est vérifié.',
    'h.q8': 'Une personne interne, un comptable externe, ou un mélange des deux.',
    'h.q9': 'Sélectionnez tout ce qui s\u2019applique.',
    'h.q10': 'Expliquez-nous comment vous vérifiez.',
    'h.q11': 'Sélectionnez tout ce qui s\u2019applique.',
    'h.q12': 'Surtout pour les commandes personnalisées ou livrées.',
    'h.q13': 'Sélectionnez tout ce qui s\u2019applique — le travail répétitif que vous confieriez volontiers.',
    'h.q14': 'Choisissez le niveau avec lequel vous êtes à l\u2019aise aujourd\u2019hui.',
    'h.q15': 'Pensez à la confiance, au coût, à la formation, à la fiabilité d\u2019Internet ou à la langue. Une chose pour chacun suffit.',
    'h.q16': 'Le chiffre, le graphique ou l\u2019alerte que vous consulteriez chaque matin.',
    'h.q17': 'Classez vos trois premiers — cliquez par ordre de priorité.',
    'h.q18': 'Sélectionnez tout ce qui s\u2019applique — nous demanderons des détails plus tard si besoin.',
    'h.q19': 'Cela détermine l\u2019interface et les réponses IA que vous lirez chaque jour.',
    'h.comments': 'Autre chose à nous signaler ? Facultatif.',

    /* Placeholders */
    'ph.e.g. An Excel file, plus a notebook in the shop…':
      'ex. : un fichier Excel, plus un cahier dans la boutique…',
    'ph.Tell us what gets in the way…': 'Dites-nous ce qui vous bloque…',
    'ph.e.g. Sales in a notebook, expenses in Excel, checked weekly…':
      'ex. : ventes dans un cahier, dépenses dans Excel, vérifiées chaque semaine…',
    'ph.e.g. We check the shelf, then call the stockroom…':
      'ex. : nous vérifions l\u2019étagère, puis appelons la réserve…',
    'ph.e.g. Order book with deposit and balance columns…':
      'ex. : un cahier de commandes avec les colonnes acompte et solde…',
    'ph.What success looks like — and what could get in the way…':
      'À quoi ressemble la réussite — et ce qui pourrait vous bloquer…',
    'ph.e.g. Today\u2019s sales, cash on hand, and unpaid balances…':
      'ex. : les ventes du jour, la trésorerie disponible et les impayés…',
    'ph.Your thoughts…': 'Vos réflexions…',
    'ph.Your full name': 'Votre nom complet',
    'ph.e.g. Owner': 'ex. : Propriétaire'
  };

  /* ---------------------------------------------------------------- */
  /* Option / rank item translations (display only)                   */
  /* ---------------------------------------------------------------- */

  var FR_OPT = {
    'Excel / Google Sheets': 'Excel / Google Sheets',
    'Cash register / POS software': 'Caisse / logiciel de caisse',
    'Accounting software': 'Logiciel de comptabilité',
    'Notebook / Manual records': 'Cahier / registres manuels',
    'WhatsApp / phone notes': 'WhatsApp / notes téléphoniques',
    'Other': 'Autre',
    'Cash': 'Espèces',
    'Card / bank terminal': 'Carte / terminal bancaire',
    'Bank transfer': 'Virement bancaire',
    'Deposit then balance later': 'Acompte puis solde plus tard',
    'Customer credit / pay later': 'Crédit client / paiement différé',
    'Online payment (card link, PayPal…)': 'Paiement en ligne (lien carte, PayPal…)',
    'Under 100 products': 'Moins de 100 produits',
    '100–500 products': '100–500 produits',
    '500–2,000 products': '500–2 000 produits',
    'Over 2,000 products': 'Plus de 2 000 produits',
    'Not sure': 'Pas sûr',
    'Under 10 per day': 'Moins de 10 par jour',
    '10–30 per day': '10–30 par jour',
    '30–100 per day': '30–100 par jour',
    'Over 100 per day': 'Plus de 100 par jour',
    'Not sure / varies a lot': 'Pas sûr / très variable',
    'We do it ourselves': 'Nous le faisons nous-mêmes',
    'An internal employee handles it': 'Un employé interne s\u2019en occupe',
    'An external accountant': 'Un comptable externe',
    'Accountant plus internal help': 'Comptable externe plus aide interne',
    'Nobody formally — it\u2019s informal': 'Personne officiellement — c\u2019est informel',
    'Daily / Monthly sales': 'Ventes journalières / mensuelles',
    'Expenses': 'Dépenses',
    'Profit and profit margins': 'Bénéfice et marges',
    'Cash available': 'Trésorerie disponible',
    'Customer payments and unpaid balances': 'Paiements clients et impayés',
    'Supplier payments and outstanding amounts': 'Paiements fournisseurs et montants dus',
    'Products running out of stock': 'Produits en rupture de stock',
    'Products remaining unsold for too long': 'Produits invendus trop longtemps',
    'Stock discrepancies': 'Écarts de stock',
    'Difficulty finding product information': 'Difficulté à trouver les informations produit',
    'Tracking stock across online and offline sales': 'Suivi du stock entre ventes en ligne et en boutique',
    'Reconcile daily sales with cash collected': 'Rapprocher les ventes du jour et les espèces encaissées',
    'Flag products that are running low': 'Signaler les produits bientôt épuisés',
    'Categorise expenses': 'Catégoriser les dépenses',
    'Detect unusual expenses or possible errors': 'Détecter les dépenses inhabituelles ou erreurs possibles',
    'Prepare the monthly summary': 'Préparer le résumé mensuel',
    'Follow up on unpaid customer balances': 'Relancer les impayés clients',
    'Draft replies to customer messages': 'Rédiger des réponses aux messages clients',
    'Suggest what to reorder from suppliers': 'Suggérer quoi recommander aux fournisseurs',
    'Answer questions about the business': 'Répondre aux questions sur l\u2019entreprise',
    'Only answer questions and provide reports': 'Répondre aux questions et fournir des rapports uniquement',
    'Suggest actions for us to approve': 'Suggérer des actions à approuver par nous',
    'Perform selected routine tasks automatically': 'Exécuter automatiquement certaines tâches routinières',
    'Not sure yet': 'Pas encore sûr',
    'POS / cash register': 'Caisse / terminal de point de vente',
    'Online store (Shopify, WooCommerce…)': 'Boutique en ligne (Shopify, WooCommerce…)',
    'WhatsApp / phone orders': 'Commandes WhatsApp / téléphone',
    'Instagram / social media': 'Instagram / réseaux sociaux',
    'Supplier invoices or statements': 'Factures ou relevés fournisseurs',
    'None yet — mostly manual': 'Rien pour l\u2019instant — surtout manuel',
    'English': 'Anglais',
    'French': 'Français',
    'Arabic': 'Arabe',
    'English and French': 'Anglais et français',
    'Other / mixed': 'Autre / mixte',

    /* Rank items */
    'Finance & Accounting': 'Finance & comptabilité',
    'Cash Register / POS': 'Caisse / point de vente',
    'Stock & Inventory': 'Stock & inventaire',
    'Customer Management': 'Gestion des clients',
    'Website & Online Sales': 'Site web & ventes en ligne',
    'Business Analytics & AI Reports': 'Analyse métier & rapports IA',
    'Income, expenses, profit, cash': 'Recettes, dépenses, bénéfice, trésorerie',
    'Fast checkout and daily sales': 'Encaissement rapide et ventes du jour',
    'Stock levels, alerts, reorders': 'Niveaux de stock, alertes, réapprovisionnement',
    'Contacts, balances, follow-ups': 'Contacts, soldes, relances',
    'Online catalogue and orders': 'Catalogue en ligne et commandes',
    'Trends, forecasts, monthly summaries': 'Tendances, prévisions, résumés mensuels'
  };

  /* ---------------------------------------------------------------- */
  /* Engine                                                            */
  /* ---------------------------------------------------------------- */

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var IDENTITY = {}; // built so EN restore is exact

  function captureEnglish() {
    $$('[data-i18n]').forEach(function (el) { IDENTITY[el.getAttribute('data-i18n')] = el.textContent; });
    $$('[data-i18n-html]').forEach(function (el) { IDENTITY['html:' + (el.getAttribute('data-i18n-html') || el.getAttribute('data-i18n-html-key') || '')] = el.innerHTML; });
    $$('[data-i18n-opt]').forEach(function (el) { IDENTITY['opt:' + el.getAttribute('data-i18n-opt')] = el.textContent; });
    $$('[data-i18n-rank]').forEach(function (el) { IDENTITY['rank:' + el.getAttribute('data-i18n-rank')] = el.textContent; });
    $$('[data-i18n-rankdesc]').forEach(function (el) { IDENTITY['rankdesc:' + el.getAttribute('data-i18n-rankdesc')] = el.textContent; });
    $$('[data-i18n-ph]').forEach(function (el) { IDENTITY['ph:' + el.getAttribute('data-i18n-ph')] = el.getAttribute('placeholder'); });
  }

  // The key lives in data-i18n-html itself (e.g. data-i18n-html="sec1.title").
  function assignHtmlKeys() {
    $$('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (key) el.setAttribute('data-i18n-html-key', key);
    });
  }

  function setLang(lang) {
    document.documentElement.lang = lang;

    // Turn everything back to English first.
    $$('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (IDENTITY[k] !== undefined) el.textContent = IDENTITY[k];
    });
    $$('[data-i18n-html]').forEach(function (el) {
      var k = 'html:' + el.getAttribute('data-i18n-html-key');
      if (IDENTITY[k] !== undefined) el.innerHTML = IDENTITY[k];
    });
    $$('[data-i18n-opt]').forEach(function (el) {
      var k = 'opt:' + el.getAttribute('data-i18n-opt');
      if (IDENTITY[k] !== undefined) el.textContent = IDENTITY[k];
    });
    $$('[data-i18n-rank]').forEach(function (el) {
      var k = 'rank:' + el.getAttribute('data-i18n-rank');
      if (IDENTITY[k] !== undefined) el.textContent = IDENTITY[k];
    });
    $$('[data-i18n-rankdesc]').forEach(function (el) {
      var k = 'rankdesc:' + el.getAttribute('data-i18n-rankdesc');
      if (IDENTITY[k] !== undefined) el.textContent = IDENTITY[k];
    });
    $$('[data-i18n-ph]').forEach(function (el) {
      var k = 'ph:' + el.getAttribute('data-i18n-ph');
      if (IDENTITY[k] !== undefined) el.setAttribute('placeholder', IDENTITY[k]);
    });

    if (lang !== 'fr') {
      document.dispatchEvent(new CustomEvent('verdara:lang', { detail: { lang: 'en' } }));
      return;
    }

    $$('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (FR[k] !== undefined) el.textContent = FR[k];
    });
    $$('[data-i18n-html]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-html-key');
      if (FR[k] !== undefined) el.innerHTML = FR[k];
    });
    $$('[data-i18n-opt]').forEach(function (el) {
      var v = FR_OPT[el.getAttribute('data-i18n-opt')];
      if (v !== undefined) el.textContent = v;
    });
    $$('[data-i18n-rank]').forEach(function (el) {
      var v = FR_OPT[el.getAttribute('data-i18n-rank')];
      if (v !== undefined) el.textContent = v;
    });
    $$('[data-i18n-rankdesc]').forEach(function (el) {
      var v = FR_OPT[el.getAttribute('data-i18n-rankdesc')];
      if (v !== undefined) el.textContent = v;
    });
    $$('[data-i18n-ph]').forEach(function (el) {
      var v = FR['ph.' + el.getAttribute('data-i18n-ph')];
      if (v !== undefined) el.setAttribute('placeholder', v);
    });

    document.dispatchEvent(new CustomEvent('verdara:lang', { detail: { lang: 'fr' } }));
  }

  function currentLang() {
    try { return localStorage.getItem(LANG_KEY) || 'en'; } catch (e) { return 'en'; }
  }

  function rememberLang(lang) {
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignore */ }
  }

  function bindToggle() {
    var group = $('#langToggle');
    if (!group) return;
    $$('.lang-toggle__btn', group).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lang = btn.dataset.lang;
        rememberLang(lang);
        setLang(lang);
        $$('.lang-toggle__btn', group).forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
      });
    });
  }

  function init() {
    assignHtmlKeys();
    captureEnglish();
    bindToggle();

    var lang = currentLang();
    setLang(lang);
    var group = $('#langToggle');
    if (group) {
      $$('.lang-toggle__btn', group).forEach(function (b) {
        b.classList.toggle('is-active', b.dataset.lang === lang);
      });
    }

    window.VerdaraI18n = {
      setLang: setLang,
      getLang: currentLang,
      t: function (key) { return currentLang() === 'fr' && FR[key] !== undefined ? FR[key] : key; },
      opt: function (en) { return currentLang() === 'fr' && FR_OPT[en] !== undefined ? FR_OPT[en] : en; }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
