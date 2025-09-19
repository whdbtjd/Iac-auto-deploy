package com.example.iac_sample_app.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vote_options")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoteOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String optionText;

    @Column(nullable = false)
    private Integer voteCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_id", nullable = false)
    @JsonIgnore
    private Vote vote;

    // 투표수 증가
    public void incrementVoteCount() {
        this.voteCount++;
    }

    // 투표 비율 계산
    public double getPercentage() {
        if (vote.getTotalVotes() == 0) {
            return 0.0;
        }
        return (double) voteCount / vote.getTotalVotes() * 100;
    }
}
