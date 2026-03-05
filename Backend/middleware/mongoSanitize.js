/**
 * Custom MongoDB sanitization middleware compatible with Express 5.
 *
 * Problem:
 *   express-mongo-sanitize@2.2.0 does `req[key] = target` for all keys including
 *   'query'. In Express 5, req.query is defined via Object.defineProperty with only
 *   a getter (no setter), so that direct assignment throws:
 *     TypeError: Cannot set property query of #<IncomingMessage> which has only a getter
 *
 * Solution:
 *   For 'body', 'params', and 'headers' we can still reassign the whole object
 *   (Express 5 allows that for those). For 'query' we must mutate the existing
 *   object in-place instead of replacing the reference.
 *
 *   The sanitization logic itself (strip keys starting with '$' or containing '.')
 *   is reproduced faithfully from express-mongo-sanitize so behaviour is identical.
 */

const PROHIBITED_REGEX = /^\$|\./;

/**
 * Recursively removes keys that start with '$' or contain '.' from a plain
 * object or array, mutating the object in-place.
 *
 * @param {unknown} obj
 * @returns {boolean} true if anything was removed
 */
function sanitizeInPlace(obj) {
  if (Array.isArray(obj)) {
    let dirty = false;
    for (const item of obj) {
      if (sanitizeInPlace(item)) dirty = true;
    }
    return dirty;
  }

  if (obj !== null && typeof obj === "object") {
    let dirty = false;
    for (const key of Object.keys(obj)) {
      if (PROHIBITED_REGEX.test(key)) {
        delete obj[key];
        dirty = true;
      } else {
        if (sanitizeInPlace(obj[key])) dirty = true;
      }
    }
    return dirty;
  }

  return false;
}

/**
 * Express 5-compatible mongo-sanitize middleware factory.
 *
 * Usage (drop-in for express-mongo-sanitize):
 *   import mongoSanitize from "./middleware/mongoSanitize.js";
 *   app.use(mongoSanitize());
 *
 * @param {{ onSanitize?: (info: { req: import('express').Request, key: string }) => void }} [options]
 * @returns {import('express').RequestHandler}
 */
function mongoSanitize(options = {}) {
  const hasOnSanitize = typeof options.onSanitize === "function";

  return function mongoSanitizeMiddleware(req, res, next) {
    // These three can be reassigned in Express 5.
    for (const key of ["body", "params", "headers"]) {
      if (req[key] && typeof req[key] === "object") {
        const isSanitized = sanitizeInPlace(req[key]);
        if (isSanitized && hasOnSanitize) {
          options.onSanitize({ req, key });
        }
      }
    }

    // req.query is a read-only getter in Express 5 — mutate in-place only.
    if (req.query && typeof req.query === "object") {
      const isSanitized = sanitizeInPlace(req.query);
      if (isSanitized && hasOnSanitize) {
        options.onSanitize({ req, key: "query" });
      }
    }

    next();
  };
}

export default mongoSanitize;
