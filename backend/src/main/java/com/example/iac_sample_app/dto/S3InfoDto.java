package com.example.iac_sample_app.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * S3 버킷 정보 DTO
 */
@Data
@Builder
public class S3InfoDto {
    
    /**
     * 버킷 이름
     */
    private String bucketName;
    
    /**
     * 리전
     */
    private String region;
    
    /**
     * 생성 날짜
     */
    private LocalDateTime creationDate;
    
    /**
     * 퍼블릭 액세스 상태 (public, private, unknown)
     */
    private String publicAccessStatus;
    
    /**
     * 정적 웹사이트 호스팅 활성화 여부
     */
    private Boolean websiteHosting;
    
    /**
     * 웹사이트 엔드포인트 URL
     */
    private String websiteEndpoint;
    
    /**
     * 버킷 정책 상태
     */
    private String bucketPolicyStatus;
    
    /**
     * 암호화 설정 여부
     */
    private Boolean encryptionEnabled;
    
    /**
     * 버전 관리 활성화 여부
     */
    private Boolean versioningEnabled;
    
    /**
     * 버킷 ARN 생성
     */
    public String getBucketArn() {
        if (bucketName == null) return null;
        return String.format("arn:aws:s3:::%s", bucketName);
    }
    
    /**
     * 버킷 URL 생성
     */
    public String getBucketUrl() {
        if (bucketName == null || region == null) return null;
        return String.format("https://%s.s3.%s.amazonaws.com", bucketName, region);
    }
    
    /**
     * 웹사이트 호스팅이 활성화되어 있는지 확인
     */
    public boolean isWebsiteHostingEnabled() {
        return websiteHosting != null && websiteHosting;
    }
    
    /**
     * 퍼블릭 액세스가 허용되어 있는지 확인
     */
    public boolean isPublicAccessAllowed() {
        return "public".equalsIgnoreCase(publicAccessStatus);
    }
    
    /**
     * 버킷이 보안상 안전한지 확인 (퍼블릭 액세스 차단됨)
     */
    public boolean isSecure() {
        return "private".equalsIgnoreCase(publicAccessStatus);
    }
    
    /**
     * 생성된 지 며칠인지 계산
     */
    public long getAgeInDays() {
        if (creationDate == null) return 0;
        return java.time.Duration.between(creationDate, LocalDateTime.now()).toDays();
    }
}
