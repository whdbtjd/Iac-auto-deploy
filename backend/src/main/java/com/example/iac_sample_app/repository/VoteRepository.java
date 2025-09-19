package com.example.iac_sample_app.repository;

import com.example.iac_sample_app.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    // 활성 투표만 조회
    List<Vote> findByActiveTrue();

    // 투표 옵션까지 함께 조회 (N+1 문제 해결)
    @Query("SELECT v FROM Vote v LEFT JOIN FETCH v.options WHERE v.id = :id")
    Vote findByIdWithOptions(Long id);

    // 최근 생성된 투표 조회
    List<Vote> findByActiveTrueOrderByCreatedAtDesc();
}
