package com.rideshare.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rideshare.model.Transaction;
import com.rideshare.repository.TransactionRepository;
import com.rideshare.service.StripeService;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private StripeService stripeService;

    @PostMapping("/order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> orderRequest) {
        System.out.println("Processing Payment Order request for amount: " + orderRequest.get("amount"));
        try {
            Double amount = Double.valueOf(orderRequest.get("amount").toString());
            String currency = (String) orderRequest.getOrDefault("currency", "INR");
            Long bookingId = Long.valueOf(orderRequest.get("bookingId").toString());

            Map<String, Object> orderData = stripeService.createPaymentIntent(amount, currency, bookingId);
            System.out.println("PaymentIntent created successfully: " + orderData.get("id"));
            return ResponseEntity.ok(orderData);
        } catch (IllegalArgumentException | NullPointerException e) {
            System.err.println("Order Creation Validation Error: " + e.getMessage());
            return ResponseEntity.badRequest().body("Invalid order data: " + e.getMessage());
        } catch (Exception e) {
            // Log full error for server-side debugging
            System.err.println("Order Creation Failed: " + e.getLocalizedMessage());
            return ResponseEntity.internalServerError().body("Order Creation Failed: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, Object> paymentVerification) {
        System.out.println("Verifying Payment request for Intent: " + paymentVerification.get("paymentIntentId"));
        try {
            String paymentIntentId = (String) paymentVerification.get("paymentIntentId");
            
            // For saving details that are passed extra
            Long bookingId = Long.valueOf(paymentVerification.get("bookingId").toString());
            Double amount = Double.valueOf(paymentVerification.get("amount").toString());

            boolean isValid = stripeService.verifyPayment(paymentIntentId);

            if (isValid) {
                System.out.println("Payment verified successfully for booking: " + bookingId);
                Transaction transaction = new Transaction(bookingId, amount, "STRIPE", "SUCCESS");
                transactionRepository.save(transaction);
                return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Payment Verified and Recorded"));
            } else {
                System.out.println("Payment verification failed for intent: " + paymentIntentId);
                return ResponseEntity.badRequest().body(Map.of("status", "FAILED", "message", "Payment status not succeeded"));
            }
        } catch (IllegalArgumentException | NullPointerException e) {
            return ResponseEntity.badRequest().body("Verification Input Error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Verification Internal Error: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Verification Failed: " + e.getMessage());
        }
    }

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody Map<String, Object> paymentRequest) {
        try {
            Long bookingId = Long.valueOf(paymentRequest.get("bookingId").toString());
            Double amount = Double.valueOf(paymentRequest.get("amount").toString());
            String method = (String) paymentRequest.get("paymentMethod");

            // Mock Success (Always success for now)
            Transaction transaction = new Transaction(bookingId, amount, method, "SUCCESS");
            transactionRepository.save(transaction);

            return ResponseEntity.ok(Map.of("message", "Payment Successful", "transactionId", transaction.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Payment Failed: " + e.getMessage());
        }
    }
}
