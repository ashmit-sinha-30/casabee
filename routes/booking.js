const express = require('express');
const router = express.Router();
const {isLoggedIn} = require("../middleware")
const listingController = require("../controller/listing");

router.get("/mytrips", isLoggedIn, listingController.rendertrips);
router.get("/host/dashboard", isLoggedIn, listingController.renderHostDashboard);

module.exports = router;