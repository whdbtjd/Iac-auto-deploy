package com.example.iac_sample_app.repository;

import com.example.iac_sample_app.entity.VoteOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VoteOptionRepository extends JpaRepository<VoteOption, Long> {
}
