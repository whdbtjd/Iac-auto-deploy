package com.example.iac_sample_app.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/votes")
@CrossOrigin(origins = "http://localhost:3000")
public class VoteController {

    // 임시 데이터 (실제로는 DB 연동) atqㅇdddaaaa
    private List<Map<String, Object>> votes = new ArrayList<>();
    private Long nextId = 1L;

    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "voting-system");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return response;
    }

    @GetMapping
    public List<Map<String, Object>> getAllVotes() {
        return votes;
    }

    @GetMapping("/{id}")
    public Map<String, Object> getVoteById(@PathVariable Long id) {
        return votes.stream()
                .filter(vote -> vote.get("id").equals(id))
                .findFirst()
                .orElse(null);
    }

    @PostMapping
    public Map<String, Object> createVote(@RequestBody Map<String, Object> request) {
        Map<String, Object> vote = new HashMap<>();
        vote.put("id", nextId++);
        vote.put("question", request.get("question"));
        vote.put("description", request.get("description"));
        vote.put("totalVotes", 0);
        vote.put("active", true);
        vote.put("createdAt", new Date());

        // 옵션 생성
        List<Map<String, Object>> options = new ArrayList<>();
        @SuppressWarnings("unchecked")
        List<String> requestOptions = (List<String>) request.get("options");

        for (int i = 0; i < requestOptions.size(); i++) {
            Map<String, Object> option = new HashMap<>();
            option.put("id", (long)(i + 1));
            option.put("optionText", requestOptions.get(i));
            option.put("voteCount", 0);
            option.put("percentage", 0.0);
            options.add(option);
        }
        vote.put("options", options);

        votes.add(vote);
        return vote;
    }

    @PostMapping("/{voteId}/options/{optionId}")
    public Map<String, Object> castVote(@PathVariable Long voteId, @PathVariable Long optionId) {
        // 투표 찾기
        Map<String, Object> vote = votes.stream()
                .filter(v -> v.get("id").equals(voteId))
                .findFirst()
                .orElse(null);

        if (vote == null) {
            throw new RuntimeException("투표를 찾을 수 없습니다: " + voteId);
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> options = (List<Map<String, Object>>) vote.get("options");

        // 선택된 옵션 찾기 및 투표수 증가
        for (Map<String, Object> option : options) {
            if (option.get("id").equals(optionId)) {
                int currentVotes = (Integer) option.get("voteCount");
                option.put("voteCount", currentVotes + 1);
                break;
            }
        }

        // 총 투표수 계산
        int totalVotes = options.stream()
                .mapToInt(option -> (Integer) option.get("voteCount"))
                .sum();
        vote.put("totalVotes", totalVotes);

        // 퍼센티지 다시 계산
        for (Map<String, Object> option : options) {
            int voteCount = (Integer) option.get("voteCount");
            double percentage = totalVotes > 0 ? (double) voteCount / totalVotes * 100 : 0.0;
            option.put("percentage", Math.round(percentage * 100.0) / 100.0);
        }

        return vote;
    }
}
