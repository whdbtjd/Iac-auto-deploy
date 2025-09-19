package com.example.iac_sample_app.service;

import com.example.iac_sample_app.dto.CreateVoteRequest;
import com.example.iac_sample_app.dto.VoteResponse;
import com.example.iac_sample_app.entity.Vote;
import com.example.iac_sample_app.entity.VoteOption;
import com.example.iac_sample_app.repository.VoteOptionRepository;
import com.example.iac_sample_app.repository.VoteRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoteService {

    private final VoteRepository voteRepository;
    private final VoteOptionRepository voteOptionRepository;

    // 모든 활성 투표 조회
    @Transactional(readOnly = true)
    public List<VoteResponse> getAllActiveVotes() {
        List<Vote> votes = voteRepository.findByActiveTrueOrderByCreatedAtDesc();
        return votes.stream()
                .map(VoteResponse::from)
                .collect(Collectors.toList());
    }

    // 특정 투표 조회
    @Transactional(readOnly = true)
    public VoteResponse getVoteById(Long id) {
        Vote vote = voteRepository.findByIdWithOptions(id);
        if (vote == null) {
            throw new RuntimeException("투표를 찾을 수 없습니다: " + id);
        }
        return VoteResponse.from(vote);
    }

    // 새 투표 생성
    @Transactional
    public VoteResponse createVote(CreateVoteRequest request) {
        // 투표 엔티티 생성
        Vote vote = new Vote();
        vote.setQuestion(request.getQuestion());
        vote.setDescription(request.getDescription());
        vote.setActive(true);

        Vote savedVote = voteRepository.save(vote);

        // 투표 옵션 생성
        List<VoteOption> options = request.getOptions().stream()
                .map(optionText -> {
                    VoteOption option = new VoteOption();
                    option.setOptionText(optionText);
                    option.setVoteCount(0);
                    option.setVote(savedVote);
                    return option;
                })
                .collect(Collectors.toList());

        voteOptionRepository.saveAll(options);
        savedVote.setOptions(options);

        return VoteResponse.from(savedVote);
    }

    // 투표하기
    @Transactional
    public VoteResponse castVote(Long voteId, Long optionId) {
        Vote vote = voteRepository.findByIdWithOptions(voteId);
        if (vote == null || !vote.getActive()) {
            throw new RuntimeException("유효하지 않은 투표입니다: " + voteId);
        }

        VoteOption selectedOption = vote.getOptions().stream()
                .filter(option -> option.getId().equals(optionId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("유효하지 않은 투표 옵션입니다: " + optionId));

        selectedOption.incrementVoteCount();
        voteOptionRepository.save(selectedOption);

        return VoteResponse.from(vote);
    }

    // 투표 비활성화
    @Transactional
    public void deactivateVote(Long voteId) {
        Vote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("투표를 찾을 수 없습니다: " + voteId));

        vote.setActive(false);
        voteRepository.save(vote);
    }
}
