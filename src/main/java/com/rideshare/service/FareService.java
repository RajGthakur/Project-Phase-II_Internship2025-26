package com.rideshare.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class FareService {

    private static final double BASE_FARE = 50.0;
    private static final double PER_KM_RATE = 12.0;
    
    // Mock distances in KM
    private static final Map<String, Map<String, Double>> DISTANCE_MAP = new HashMap<>();

    static {
        // Simple graph for key cities
        addDistance("chennai", "bangalore", 345.0);
        addDistance("chennai", "coimbatore", 510.0);
        addDistance("bangalore", "mysore", 145.0);
        addDistance("mumbai", "pune", 150.0);
        addDistance("delhi", "agra", 230.0);
    }

    private static void addDistance(String c1, String c2, Double dist) {
        DISTANCE_MAP.computeIfAbsent(c1.toLowerCase(), k -> new HashMap<>()).put(c2.toLowerCase(), dist);
        DISTANCE_MAP.computeIfAbsent(c2.toLowerCase(), k -> new HashMap<>()).put(c1.toLowerCase(), dist);
    }

    public double calculateFare(String source, String destination) {
        String s = source.toLowerCase().trim();
        String d = destination.toLowerCase().trim();

        Double distance;
        
        if (DISTANCE_MAP.containsKey(s) && DISTANCE_MAP.get(s).containsKey(d)) {
            distance = DISTANCE_MAP.get(s).get(d);
        } else {
            // Default random distance for unknown cities to allow testing
            distance = 100.0 + (Math.random() * 400); 
        }

        return BASE_FARE + (distance * PER_KM_RATE);
    }
}
