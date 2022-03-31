const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// POST /tour/7353057373505730nkf/reviews
// POST /reviews
// No matter the above two routes. Because of mergeParams is true, both will end up using below handlers!
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

router
  .route('/:id')
  // .get(reviewController.getReview)
  // .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
