package com.rideshare.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rideshare.model.Query;
import com.rideshare.repository.QueryRepository;

@Service
public class QueryService {

    @Autowired
    private QueryRepository queryRepository;

    @Autowired
    private EmailService emailService;

    public Query saveQuery(Query query) {
        return queryRepository.save(query);
    }

    public List<Query> getAllQueries() {
        return queryRepository.findAll();
    }

    public Query getQueryById(Long id) {
        return queryRepository.findById(id).orElseThrow(() -> new RuntimeException("Query not found"));
    }

    public Query replyToQuery(Long id, String response) {
        Query query = getQueryById(id);
        query.setAdminResponse(response);
        query.setStatus("RESOLVED");
        Query updatedQuery = queryRepository.save(query);

        // Send email to user
        String subject = "Re: " + query.getSubject();
        String message = "Hello " + query.getFullName() + ",\n\n" +
                "Thank you for reaching out. Here is the response to your query:\n\n" +
                response + "\n\n" +
                "Best regards,\nRideShare Team";
        
        try {
            emailService.sendSimpleMessage(query.getEmail(), subject, message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }

        return updatedQuery;
    }
}
