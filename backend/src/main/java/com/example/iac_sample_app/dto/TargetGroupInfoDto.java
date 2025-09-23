package com.example.iac_sample_app.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Target Group 정보 DTO
 */
@Data
@Builder
public class TargetGroupInfoDto {
    
    /**
     * Target Group ARN
     */
    private String arn;
    
    /**
     * Target Group 이름
     */
    private String name;
    
    /**
     * 프로토콜 (HTTP, HTTPS 등)
     */
    private String protocol;
    
    /**
     * 포트
     */
    private Integer port;
    
    /**
     * 헬스체크 경로
     */
    private String healthCheckPath;
    
    /**
     * 정상 타겟 개수
     */
    private Integer healthyTargetCount;
    
    /**
     * 비정상 타겟 개수
     */
    private Integer unhealthyTargetCount;
    
    /**
     * 타겟들의 상세 정보
     */
    private List<TargetHealthDto> targets;
    
    /**
     * 전체 타겟 개수
     */
    public int getTotalTargetCount() {
        return (healthyTargetCount != null ? healthyTargetCount : 0) + 
               (unhealthyTargetCount != null ? unhealthyTargetCount : 0);
    }
    
    /**
     * 헬스체크 성공률 (%)
     */
    public double getHealthPercentage() {
        int total = getTotalTargetCount();
        if (total == 0) return 0.0;
        
        int healthy = healthyTargetCount != null ? healthyTargetCount : 0;
        return (double) healthy / total * 100.0;
    }
    
    /**
     * 모든 타겟이 정상인지 확인
     */
    public boolean isAllTargetsHealthy() {
        return unhealthyTargetCount == null || unhealthyTargetCount == 0;
    }
}
