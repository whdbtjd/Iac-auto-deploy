package com.example.iac_sample_app.dto;

import com.example.iac_sample_app.entity.Vote;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class VoteResponse {

    private Long id;
    private String question;
    private String description;
    private List<VoteOptionResponse> options;
    private int totalVotes;
    private LocalDateTime createdAt;
    private boolean active;

    @Data
    public static class VoteOptionResponse {
        private Long id;
        private String optionText;
        private int voteCount;
        private double percentage;

        public VoteOptionResponse(Long id, String optionText, int voteCount, double percentage) {
            this.id = id;
            this.optionText = optionText;
            this.voteCount = voteCount;
            this.percentage = Math.round(percentage * 100.0) / 100.0; // 소수점 2자리
        }
    }

    // Entity -> DTO 변환
    public static VoteResponse from(Vote vote) {
        VoteResponse response = new VoteResponse();
        response.setId(vote.getId());
        response.setQuestion(vote.getQuestion());
        response.setDescription(vote.getDescription());
        response.setTotalVotes(vote.getTotalVotes());
        response.setCreatedAt(vote.getCreatedAt());
        response.setActive(vote.getActive());

        response.setOptions(vote.getOptions().stream()
                .map(option -> new VoteOptionResponse(
                        option.getId(),
                        option.getOptionText(),
                        option.getVoteCount(),
                        option.getPercentage()
                ))
                .collect(Collectors.toList()));

        return response;
    }
}
