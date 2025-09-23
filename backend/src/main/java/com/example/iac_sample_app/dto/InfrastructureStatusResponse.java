package com.example.iac_sample_app.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 전체 인프라 상태를 담는 응답 DTO
 */
@Data
@Builder
public class InfrastructureStatusResponse {
    
    /**
     * 전체 상태 ("connecting", "connected", "error")
     */
    private String status;
    
    /**
     * 상태 메시지
     */
    private String message;
    
    /**
     * 마지막 업데이트 시간
     */
    private LocalDateTime lastUpdated;
    
    /**
     * EC2 인스턴스들
     */
    private List<EC2InfoDto> ec2Instances;
    
    /**
     * ALB 정보
     */
    private ALBInfoDto loadBalancer;
    
    /**
     * RDS 정보
     */
    private RDSInfoDto database;
    
    /**
     * S3 정보
     */
    private S3InfoDto storage;
    
    /**
     * CloudFront 정보
     */
    private CloudFrontInfoDto cdn;
    
    /**
     * VPC 정보
     */
    private VPCInfoDto network;
    
    /**
     * 연결 진행률 (0-100)
     */
    @Builder.Default
    private Integer progress = 100;
    
    /**
     * 전체 리소스 개수 (요약용)
     */
    public int getTotalResourceCount() {
        int count = 0;
        if (ec2Instances != null) count += ec2Instances.size();
        if (loadBalancer != null) count += 1;
        if (database != null) count += 1;
        if (storage != null) count += 1;
        if (cdn != null) count += 1;
        if (network != null) count += 1;
        return count;
    }
    
    /**
     * 정상 상태 리소스 개수
     */
    public int getHealthyResourceCount() {
        int healthy = 0;
        
        if (ec2Instances != null) {
            healthy += (int) ec2Instances.stream()
                    .filter(ec2 -> "healthy".equals(ec2.getHealthStatus()))
                    .count();
        }
        
        if (loadBalancer != null && "active".equals(loadBalancer.getState())) {
            healthy += 1;
        }
        
        if (database != null && "available".equals(database.getStatus())) {
            healthy += 1;
        }
        
        if (storage != null) {
            healthy += 1; // S3는 항상 사용 가능하다고 가정
        }
        
        if (cdn != null && "Deployed".equals(cdn.getStatus())) {
            healthy += 1;
        }
        
        if (network != null && "available".equals(network.getState())) {
            healthy += 1;
        }
        
        return healthy;
    }
}
