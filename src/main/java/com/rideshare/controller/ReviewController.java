package com.rideshare.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rideshare.model.Review;
import com.rideshare.service.ReviewService;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:5173")
public class ReviewController {
    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody java.util.Map<String, Object> reviewRequest) {
        Long reviewerId = Long.valueOf(reviewRequest.get("reviewerId").toString());
        Long revieweeId = Long.valueOf(reviewRequest.get("revieweeId").toString());
        Long rideId = Long.valueOf(reviewRequest.get("rideId").toString());
        Integer rating = Integer.valueOf(reviewRequest.get("rating").toString());
        String comment = (String) reviewRequest.get("comment");

        return ResponseEntity.ok(reviewService.saveReview(reviewerId, revieweeId, rideId, rating, comment));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getUserReviews(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getReviewsForUser(userId));
    }
}
