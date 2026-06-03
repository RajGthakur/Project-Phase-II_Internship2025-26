package com.rideshare.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rideshare.service.FareService;

@RestController
@RequestMapping("/api/fare")
@CrossOrigin(origins = "http://localhost:5173")
public class FareController {

    @Autowired
    private FareService fareService;

    @GetMapping("/calculate")
    public ResponseEntity<Map<String, Double>> calculateFare(@RequestParam String source, @RequestParam String destination) {
        double fare = fareService.calculateFare(source, destination);
        // Round to 2 decimal places
        fare = Math.round(fare * 100.0) / 100.0;
        return ResponseEntity.ok(Map.of("estimatedFare", fare));
    }
}
