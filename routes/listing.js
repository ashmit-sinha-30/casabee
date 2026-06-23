const express = require('express');
const router = express.Router();
const Listing = require("../models/listing");
const {isLoggedIn,isOwner,validateListings} = require("../middleware")
const listingController = require("../controller/listing");
const multer = require("multer");
const {storage} = require("../cloudConfig");
const upload = multer({storage});

router
    .route("/")
    .get(listingController.index)
    .post(isLoggedIn, upload.single("listing[image]"), validateListings, listingController.newListing);

router.get("/new", isLoggedIn, listingController.renderNewForm);
router.get("/search", listingController.searchListings);
router
    .route("/:id")
    .get(listingController.showListing)
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListings, listingController.editListing)
    .delete(isLoggedIn, isOwner, listingController.destroyListing);

router.get("/:id/edit", isLoggedIn, isOwner, listingController.renderEditListing);
router.post("/:id/book", isLoggedIn, listingController.reserveListing);

module.exports = router;