/** Branding pulled from env so one build can be rebranded per solar partner. */
const env = import.meta.env;

export const BRAND = {
  name: env.VITE_COMPANY_NAME ?? 'Marketron Solar',
  phone: env.VITE_COMPANY_PHONE ?? '(800) 555-0142',
  get phoneHref() {
    return `tel:${this.phone.replace(/[^\d+]/g, '')}`;
  },
};

/**
 * TCPA express written consent. The exact wording is stored on every lead so
 * you can prove what a homeowner agreed to and when. Have your counsel review
 * this string before launch, and treat any edit as a new version - do not
 * change it retroactively for leads already captured.
 */
export const CONSENT_TEXT =
  `By checking this box and clicking "Get my free consultation", I give ${BRAND.name} and up to three ` +
  'of its local solar partners my express written consent to contact me at the phone number and email ' +
  'address I provided - including by automatic telephone dialing system, artificial or prerecorded voice, ' +
  'and SMS - about solar products and services. Consent is not a condition of any purchase. Message and ' +
  'data rates may apply. I can revoke consent at any time by replying STOP or asking to be removed.';
