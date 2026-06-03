package com.rideshare.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rideshare.service.EmailService;

@RestController
public class TestController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/api/test-email")
    public String testEmail(@RequestParam String to) {
        try {
            emailService.sendSimpleMessage(to, "Test Email from Smart Ride Sharing", "This is a test email to verify SMTP configuration.");
            return "Email sent successfully to " + to;
        } catch (Exception e) {
            return "Failed to send email: " + e.getMessage();
        }
    }
}
