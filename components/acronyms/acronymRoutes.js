const express = require("express");
const { query, param, body, validationResult } = require("express-validator");
const router = express.Router();

const acronymService = require("./acronymService");

/**
 * @api {get} /acronym List of acronyms
 *
 * @apiParam {Number} from Starting record to fetch, used for pagination
 * @apiParam {Number} limit Number of records to fetch, used for pagination
 * @apiParam {String} search A search string
 *
 * @apiGroup Acronyms
 * @apiName getAcronyms
 *
 * @apiSuccess {Object[]} - List of acronyms
 * @apiSuccess {Number} -.count Number of results
 * @apiSuccess {Array} -.rows Returned data
 * @apiSuccess {String} -.rows.name Name
 * @apiSuccess {String} -.rows.definition Definition
 */
router.get(
  "/",
  query("from").optional().isInt(),
  query("limit").optional().isInt(),
  query("search").customSanitizer(normalizeString),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const results = await acronymService.search(
      req.query.from,
      req.query.limit,
      req.query.search
    );

    if (results.count > 0) {
      res.set({
        "Pagination-Total-Records": results.count,
        "Pagination-More-Results-Exists":
          results.count > req.query.from + req.query.limit,
      });

      res.send(results.rows);
    } else {
      res.status(404).send();
    }
  }
);

/**
 * @api {post} /acronym Insert new acronym into database
 * @apiParam {String} name Acronym itself
 * @apiParam {String} definition Acronym definition
 *
 * @apiGroup Acronyms
 * @apiName postAcronym
 *
 * @apiSuccess {Object} - New acronym
 * @apiSuccess {Number} -.id
 * @apiSuccess {String} -.name
 * @apiSuccess {String} -.definition
 */
router.post(
  "/",
  body("name").isLength({ min: 1, max: 30 }),
  body("definition").isLength({ min: 1, max: 2000 }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await acronymService.insert(
      req.body.name,
      req.body.definition
    );

    res.status(201).send(result);
  }
);

router.use("/:acronym", (req, res, next) => {
  const auth = req.header("Authentication");

  if (!auth) {
    return res.sendStatus(401);
  }

  if (auth !== "secretword") {
    return res.sendStatus(403);
  }

  next();
});

/**
 * @api {put} /acronym/:acronym Updates acronym definition
 * @apiParam {String} acronym
 * @apiParam {String} definition Acronym definition
 *
 * @apiGroup Acronyms
 * @apiName putAcronym
 *
 * @apiSuccess {Object} - updated acronym
 * @apiSuccess {Number} -.id
 * @apiSuccess {String} -.name
 * @apiSuccess {String} -.definition
 */
router.put(
  "/:acronym",
  param("acronym")
    .isLength({ min: 1, max: 30 })
    .customSanitizer(normalizeString),
  body("definition").isLength({ min: 1, max: 2000 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await acronymService.update(
      req.params.acronym,
      req.body.definition
    );

    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send();
    }
  }
);

/**
 * @api {delete} /acronym/:acronym Deletes acronym definition
 * @apiParam {String} acronym
 *
 * @apiGroup Acronyms
 * @apiName deleteAcronym
 */
router.delete(
  "/:acronym",
  param("acronym")
    .isLength({ min: 1, max: 30 })
    .customSanitizer(normalizeString),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await acronymService.delete(req.params.acronym);

    if (result) {
      res.status(204).send();
    } else {
      res.status(404).send();
    }
  }
);

function normalizeString(value) {
  const decodedValue = decodeURIComponent(value);
  const entitiedValue = decodedValue.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      }[tag])
  );

  return entitiedValue;
}

module.exports = router;
