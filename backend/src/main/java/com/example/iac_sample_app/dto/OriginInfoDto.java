package com.example.iac_sample_app.dto;

import lombok.Builder;
import lombok.Data;

/**
 * CloudFront Origin 정보 DTO
 */
@Data
@Builder
public class OriginInfoDto {
    
    /**
     * Origin ID
     */
    private String originId;
    
    /**
     * 도메인 이름 (S3 버킷 또는 커스텀 도메인)
     */
    private String domainName;
    
    /**
     * Origin 타입 (s3, custom)
     */
    private String originType;
    
    /**
     * Origin 경로 (옵션)
     */
    private String originPath;
    
    /**
     * 커스텀 헤더들 (있을 경우)
     */
    private String customHeaders;
    
    /**
     * HTTP 포트 (커스텀 Origin인 경우)
     */
    private Integer httpPort;
    
    /**
     * HTTPS 포트 (커스텀 Origin인 경우)
     */
    private Integer httpsPort;
    
    /**
     * Origin 프로토콜 정책 (http-only, https-only, match-viewer)
     */
    private String originProtocolPolicy;
    
    /**
     * S3 Origin인지 확인
     */
    public boolean isS3Origin() {
        return "s3".equalsIgnoreCase(originType) || 
               (domainName != null && domainName.contains(".s3."));
    }
    
    /**
     * 커스텀 Origin인지 확인
     */
    public boolean isCustomOrigin() {
        return "custom".equalsIgnoreCase(originType) || !isS3Origin();
    }
    
    /**
     * HTTPS 지원 여부 확인
     */
    public boolean supportsHttps() {
        return httpsPort != null || 
               "https-only".equalsIgnoreCase(originProtocolPolicy) ||
               "match-viewer".equalsIgnoreCase(originProtocolPolicy);
    }
    
    /**
     * Origin URL 생성
     */
    public String getOriginUrl() {
        if (domainName == null) return null;
        
        String protocol = supportsHttps() ? "https" : "http";
        String path = originPath != null ? originPath : "";
        
        return String.format("%s://%s%s", protocol, domainName, path);
    }
}
