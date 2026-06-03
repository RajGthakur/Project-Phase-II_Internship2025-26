package com.rideshare.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rideshare.model.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(t.amount), 0.0) FROM Transaction t WHERE UPPER(t.status) = 'SUCCESS'")
    double sumTotalSuccessfulRevenue();
}

