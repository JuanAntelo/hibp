import Axios from 'axios';
import {
  BAD_REQUEST,
  FORBIDDEN,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
} from './responses';

/**
 * An interface to the haveibeenpwned.com API (version 2).
 */
const hibp = {
  /**
   * The Axios instance used for API queries. Not meant for general use.
   *
   * @private
   */
  _axios: Axios.create({
    baseURL: 'https://haveibeenpwned.com/api',
    headers: {
      Accept: 'application/vnd.haveibeenpwned.v2+json',
    },
  }),

  /**
   * Fetches data from the supplied API endpoint.
   *
   * HTTP status code 200 returns an Object (data found).
   * HTTP status code 404 returns null (no data found).
   * HTTP status code 400 throws an Error (bad request).
   * HTTP status code 403 throws an Error (forbidden).
   * HTTP status code 429 throws an Error (too many requests).
   *
   * @private
   * @param {string} endpoint the API endpoint to query
   * @returns {Promise} a Promise which resolves to the data resulting from the
   * query (or null for 404 Not Found responses), or rejects with an Error
   */
  _fetchFromApi: endpoint => Promise
    .resolve(hibp._axios.get(endpoint))
    .then(res => res.data)
    .catch((err) => {
      if (err.response) {
        switch (err.response.status) {
          case BAD_REQUEST.status:
            throw new Error(BAD_REQUEST.statusText);
          case FORBIDDEN.status:
            throw new Error(FORBIDDEN.statusText);
          case NOT_FOUND.status:
            return null;
          case TOO_MANY_REQUESTS.status:
            throw new Error(err.response.data);
          default:
            throw new Error(err.response.statusText);
        }
      } else {
        throw err;
      }
    }),

  /**
   * Fetches breach data for the specified account.
   *
   * @param {string} account a username or email address
   * @param {Object} [options] a configuration object
   * @param {string} [options.domain] a domain by which to filter the results
   * (default: all domains)
   * @param {boolean} [options.truncate] truncate the results to only include
   * the name of each breach (default: false)
   * @returns {Promise} a Promise which resolves to an Object representing a
   * breach (or null if no breaches were found), or rejects with an Error
   * @example
   * hibp.breachedAccount('foo')
   *   .then((data) => {
   *     if (data) {
   *       // ...
   *     } else {
   *       // ...
   *     }
   *   })
   *   .catch((err) => {
   *     // ...
   *   });
   * @example
   * hibp.breachedAccount('bar', { truncate: true })
   *   .then((data) => {
   *     if (data) {
   *       // ...
   *     } else {
   *       // ...
   *     }
   *   })
   *   .catch((err) => {
   *     // ...
   *   });
   * @example
   * hibp.breachedAccount('baz', { domain: 'adobe.com', truncate: true })
   *   .then((data) => {
   *     if (data) {
   *       // ...
   *     } else {
   *       // ...
   *     }
   *   })
   *   .catch((err) => {
   *     // ...
   *   });
   */
  breachedAccount: (account, options = {}) => {
    const endpoint = `/breachedaccount/${encodeURIComponent(account)}?`;
    const params = [];
    if (options.domain) {
      params.push(`domain=${encodeURIComponent(options.domain)}`);
    }
    if (options.truncate) {
      params.push('truncateResponse=true');
    }
    return hibp._fetchFromApi(`${endpoint}${params.join('&')}`);
  },

  /**
   * Fetches all breached sites in the system.
   *
   * @param {Object} [options] a configuration object
   * @param {string} [options.domain] a domain by which to filter the results
   * (default: all domains)
   * @returns {Promise} a Promise which resolves to an array of breach Objects
   * (an empty array if no breaches were found), or rejects with an Error
   * @example
   * hibp.breaches()
   *   .then((data) => {
   *     if (data) {
   *       // ...
   *     } else {
   *       // ...
   *     }
   *   })
   *   .catch((err) => {
   *     // ...
   *   });
   * @example
   * hibp.breaches({ domain: 'adobe.com' })
   *   .then((data) => {
   *     if (data) {
   *       // ...
   *     } else {
   *       // ...
   *     }
   *   })
   *   .catch((err) => {
   *     // ...
   *   });
   */
  breaches: (options = {}) => {
    const endpoint = '/breaches?';
    const params = [];
    if (options.domain) {
      params.push(`domain=${encodeURIComponent(options.domain)}`);
    }
    return hibp._fetchFromApi(`${endpoint}${params.join('&')}`);
  },

  /**
   * Fetches breach data for a single site by breach name.
   *
   * @param {string} breachName the name of a breach in the system
   * @returns {Promise} a Promise which resolves to an Object representing a
   * breach (or null if no breach was found), or rejects with an Error
   * @example
   * hibp.breach('Adobe')
   *   .then((data) => {
   *     if (data) {
   *       // ...
   *     } else {
   *       // ...
   *     }
   *   })
   *   .catch((err) => {
   *     // ...
   *   });
   */
  breach: breachName => (
    hibp._fetchFromApi(`/breach/${encodeURIComponent(breachName)}`)
  ),

  /**
   * Fetches all data classes in the system.
   *
   * @returns {Promise} a Promise which resolves to an array of strings (or
   * null if no data classes were found), or rejects with an Error
   * @example
   * hibp.dataClasses()
   *   .then((data) => {
   *     if (data) {
   *       // ...
   *     } else {
   *       // ...
   *     }
   *   })
   *   .catch((err) => {
   *     // ...
   *   });
   */
  dataClasses: () => hibp._fetchFromApi('/dataclasses'),

  /**
   * Fetches all pastes for an account (email address).
   *
   * @param {string} email the email address to query
   * @returns {Promise} a Promise which resolves to an array of paste Objects
   * (or null if no pastes were found), or rejects with an Error
   * @example
   * hibp.pasteAccount('foo@bar.com')
   *   .then((data) => {
   *     if (data) {
   *       // ...
   *     } else {
   *       // ...
   *     }
   *   })
   *   .catch((err) => {
   *     // ...
   *   });
   */
  pasteAccount: email => (
    hibp._fetchFromApi(`/pasteaccount/${encodeURIComponent(email)}`)
  ),
};

export default hibp;
