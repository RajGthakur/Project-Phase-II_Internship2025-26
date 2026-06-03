package com.rideshare.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rideshare.model.Review;
import com.rideshare.model.Ride;
import com.rideshare.model.User;
import com.rideshare.repository.ReviewRepository;
import com.rideshare.repository.RideRepository;
import com.rideshare.repository.UserRepository;

@Service
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RideRepository rideRepository;

    @org.springframework.transaction.annotation.Transactional
    public Review saveReview(Long reviewerId, Long revieweeId, Long rideId, Integer rating, String comment) {
        User reviewer = userRepository.findById(reviewerId)
            .orElseThrow(() -> new RuntimeException("Reviewer not found"));
        User reviewee = userRepository.findById(revieweeId)
            .orElseThrow(() -> new RuntimeException("Reviewee not found"));
        Ride ride = rideRepository.findById(rideId)
            .orElseThrow(() -> new RuntimeException("Ride not found"));
            
        if (ride.getStatus() != Ride.RideStatus.COMPLETED) {
            throw new RuntimeException("Reviews can only be given for completed rides.");
        }
        
        if (reviewRepository.existsByReviewerIdAndRideId(reviewerId, rideId)) {
            throw new RuntimeException("You have already reviewed this ride.");
        }

        Review review = new Review();
        review.setReviewer(reviewer);
        review.setReviewee(reviewee);
        review.setRide(ride);
        review.setRating(rating);
        review.setComment(comment);
        review.setCreatedAt(java.time.LocalDateTime.now());

        return reviewRepository.save(review);
    }

    public List<Review> getReviewsForUser(Long userId) {
        return reviewRepository.findByRevieweeId(userId);
    }
}
