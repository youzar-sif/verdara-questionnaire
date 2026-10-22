/**
 * Optional front-end configuration.
 *
 * By default the questionnaire posts to this project's own server
 * (POST /api/submit). Leave `endpoint` empty when running with `npm start`.
 *
 * If you host the site as a static page (Netlify, Vercel, GitHub Pages…)
 * set `endpoint` to a form service or webhook, for example:
 *   endpoint: 'https://formspree.io/f/your-form-id'
 *
 * `contactEmail` is shown on the fallback screen if a submission fails.
 */
window.VERDARA_CONFIG = {
  endpoint: '',
  contactEmail: ''
};
