const express = require("express");
const { check } = require("express-validator");

const placesControllers = require("../controllers/places-controller");

const router = express.Router();

router.get("/:placeId", placesControllers.getPlaceById);

router.get("/user/:userId", placesControllers.getPlacesByUserId);

router.post(
  "/",
  check("title").not().isEmpty(),
  check("description").isLength({ min: 5 }),
  check("address").notEmpty(),
  placesControllers.createPlace
);

router.patch("/:placeId", [
    check('title').notEmpty(),
    check("description").isLength({ min: 5 })
], placesControllers.updatePlace);

router.delete("/:placeId", placesControllers.deletePlace);

module.exports = router;
