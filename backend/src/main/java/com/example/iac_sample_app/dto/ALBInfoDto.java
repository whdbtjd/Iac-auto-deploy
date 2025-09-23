package com.example.iac_sample_app.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Application Load Balancer 정보 DTO
 */
@Data
@Builder
public class ALBInfoDto {
    
    /**
     * ALB ARN
     */
    private String arn;
    
    /**
     * DNS 이름
     */
    private String dnsName;
    
    /**
     * 상태 (active, provisioning, active_impaired, failed)
     */
    private String state;
    
    /**
     * 로드 밸런서 타입 (application, network, gateway)
     */
    private String type;
    
    /**
     * 스키마 (internet-facing, internal)
     */
    private String scheme;
    
    /**
     * 가용 영역들
     */
    private List<String> availabilityZones;
    
    /**
     * 타겟 그룹들
     */
    private List<TargetGroupInfoDto> targetGroups;
    
    /**
     * 생성 시간
     */
    private LocalDateTime createdTime;
    
    /**
     * ALB 이름 (ARN에서 추출)
     */
    public String getLoadBalancerName() {
        if (arn == null) return null;
        String[] parts = arn.split("/");
        return parts.length >= 2 ? parts[1] : null;
    }
    
    /**
     * 인터넷 연결 여부
     */
    public boolean isInternetFacing() {
        return "internet-facing".equalsIgnoreCase(scheme);
    }
    
    /**
     * 활성 상태 여부
     */
    public boolean isActive() {
        return "active".equalsIgnoreCase(state);
    }
    
    /**
     * 전체 타겟 개수
     */
    public int getTotalTargetCount() {
        if (targetGroups == null) return 0;
        return targetGroups.stream()
                .mapToInt(tg -> tg.getHealthyTargetCount() + tg.getUnhealthyTargetCount())
                .sum();
    }
    
    /**
     * 정상 타겟 개수
     */
    public int getHealthyTargetCount() {
        if (targetGroups == null) return 0;
        return targetGroups.stream()
                .mapToInt(TargetGroupInfoDto::getHealthyTargetCount)
                .sum();
    }
}
