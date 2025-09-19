package com.example.iac_sample_app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreateVoteRequest {

    @NotBlank(message = "투표 질문은 필수입니다")
    @Size(max = 200, message = "질문은 200자 이내로 입력해주세요")
    private String question;

    @Size(max = 500, message = "설명은 500자 이내로 입력해주세요")
    private String description;

    @NotEmpty(message = "투표 옵션은 최소 2개 이상이어야 합니다")
    @Size(min = 2, max = 10, message = "투표 옵션은 2개 이상 10개 이하로 설정해주세요")
    private List<String> options;
}
