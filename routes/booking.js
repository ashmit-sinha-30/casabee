const express = require('express');
const router = express.Router();
const {isLoggedIn} = require("../middleware")
const listingController = require("../controller/listing");

router.get("/mytrips", isLoggedIn, listingController.rendertrips);

module.exports = router;