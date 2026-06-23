const express = require('express');
const router = express.Router({mergeParams: true});
const {listingSchema,reviewSchema} = require("../schema");
const ExpressError = require("../utils/ExpressError")
const Review = require("../models/reviews");
const Listing = require("../models/listing");
const { isLoggedIn,validateReviews, isAuthor } = require('../middleware');
const reviewController = require("../controller/review");

router.post("/" , isLoggedIn ,validateReviews, reviewController.createReview);

router.delete("/:reviewId" , isAuthor, reviewController.destroyReview);

module.exports = router;