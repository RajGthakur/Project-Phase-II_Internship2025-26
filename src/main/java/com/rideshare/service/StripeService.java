package com.rideshare.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

import jakarta.annotation.PostConstruct;

@Service
public class StripeService {

    @Value("${stripe.api.key}")
    private String secretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    public Map<String, Object> createPaymentIntent(Double amount, String currency, Long bookingId) throws Exception {
        // Stripe expects amount in cents (1 INR = 100 cents)
        long amountInCents = (long) (amount * 100);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(currency.toLowerCase())
                .putMetadata("bookingId", String.valueOf(bookingId))
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("id", intent.getId());
        responseData.put("clientSecret", intent.getClientSecret());
        responseData.put("amount", amount);
        
        return responseData;
    }

    public boolean verifyPayment(String paymentIntentId) {
        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            return "succeeded".equals(intent.getStatus());
        } catch (com.stripe.exception.StripeException e) {
            return false;
        }
    }
}
