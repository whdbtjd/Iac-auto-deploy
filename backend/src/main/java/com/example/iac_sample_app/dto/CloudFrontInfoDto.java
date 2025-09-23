package com.example.iac_sample_app.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * CloudFront Distribution 정보 DTO
 */
@Data
@Builder
public class CloudFrontInfoDto {
    
    /**
     * Distribution ID
     */
    private String distributionId;
    
    /**
     * CloudFront 도메인 이름 (예: d1234567890123.cloudfront.net)
     */
    private String domainName;
    
    /**
     * 배포 상태 (Deployed, InProgress, Disabled)
     */
    private String status;
    
    /**
     * 활성화 여부
     */
    private Boolean enabled;
    
    /**
     * 설명/코멘트
     */
    private String comment;
    
    /**
     * 마지막 수정 시간
     */
    private LocalDateTime lastModifiedTime;
    
    /**
     * Origin 정보들
     */
    private List<OriginInfoDto> origins;
    
    /**
     * 프라이스 클래스 (PriceClass_All, PriceClass_100, PriceClass_200)
     */
    private String priceClass;
    
    /**
     * 기본 루트 객체
     */
    private String defaultRootObject;
    
    /**
     * 커스텀 에러 페이지 설정 여부
     */
    private Boolean customErrorPagesEnabled;
    
    /**
     * 배포 완료 상태인지 확인
     */
    public boolean isDeployed() {
        return "Deployed".equalsIgnoreCase(status);
    }
    
    /**
     * 배포 진행 중인지 확인
     */
    public boolean isInProgress() {
        return "InProgress".equalsIgnoreCase(status);
    }
    
    /**
     * 활성화 상태인지 확인
     */
    public boolean isEnabled() {
        return enabled != null && enabled;
    }
    
    /**
     * CloudFront URL 생성
     */
    public String getCloudFrontUrl() {
        if (domainName == null) return null;
        return String.format("https://%s", domainName);
    }
    
    /**
     * 기본 Origin 정보 가져오기
     */
    public OriginInfoDto getPrimaryOrigin() {
        if (origins == null || origins.isEmpty()) return null;
        return origins.get(0);
    }
    
    /**
     * S3 Origin이 있는지 확인
     */
    public boolean hasS3Origin() {
        if (origins == null) return false;
        return origins.stream()
                .anyMatch(origin -> "s3".equalsIgnoreCase(origin.getOriginType()));
    }
    
    /**
     * 배포된 지 며칠인지 계산
     */
    public long getDaysSinceLastModified() {
        if (lastModifiedTime == null) return 0;
        return java.time.Duration.between(lastModifiedTime, LocalDateTime.now()).toDays();
    }
}
