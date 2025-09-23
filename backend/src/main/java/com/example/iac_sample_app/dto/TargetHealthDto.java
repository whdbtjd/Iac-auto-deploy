package com.example.iac_sample_app.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Target Health 상태 DTO
 */
@Data
@Builder
public class TargetHealthDto {
    
    /**
     * 타겟 ID (인스턴스 ID 또는 IP)
     */
    private String targetId;
    
    /**
     * 타겟 타입 (instance, ip, lambda)
     */
    private String targetType;
    
    /**
     * 헬스 상태 (healthy, unhealthy, initial, draining, unavailable)
     */
    private String healthStatus;
    
    /**
     * 상태 설명
     */
    private String description;
    
    /**
     * 포트 (있을 경우)
     */
    private Integer port;
    
    /**
     * 정상 상태인지 확인
     */
    public boolean isHealthy() {
        return "healthy".equalsIgnoreCase(healthStatus);
    }
    
    /**
     * 초기화 중인지 확인
     */
    public boolean isInitializing() {
        return "initial".equalsIgnoreCase(healthStatus);
    }
    
    /**
     * 배수 중인지 확인
     */
    public boolean isDraining() {
        return "draining".equalsIgnoreCase(healthStatus);
    }
}
