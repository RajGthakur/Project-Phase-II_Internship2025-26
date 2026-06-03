package com.rideshare.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rideshare.model.Query;

@Repository
public interface QueryRepository extends JpaRepository<Query, Long> {
}
