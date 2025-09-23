package com.example.iac_sample_app.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * EC2 인스턴스 정보 DTO
 */
@Data
@Builder
public class EC2InfoDto {
    
    /**
     * 인스턴스 ID (예: i-1234567890abcdef0)
     */
    private String instanceId;
    
    /**
     * 프라이빗 IP 주소
     */
    private String privateIp;
    
    /**
     * 퍼블릭 IP 주소 (있을 경우)
     */
    private String publicIp;
    
    /**
     * 인스턴스 타입 (예: t3.micro)
     */
    private String instanceType;
    
    /**
     * 가용 영역 (예: ap-northeast-2a)
     */
    private String availabilityZone;
    
    /**
     * 인스턴스 상태 (running, stopped, pending 등)
     */
    private String state;
    
    /**
     * AMI ID
     */
    private String amiId;
    
    /**
     * 아키텍처 (x86_64, arm64 등)
     */
    private String architecture;
    
    /**
     * 시작 시간
     */
    private LocalDateTime launchTime;
    
    /**
     * 태그들
     */
    private Map<String, String> tags;
    
    /**
     * 헬스 상태 (healthy, unhealthy, unknown)
     */
    private String healthStatus;
    
    /**
     * 인스턴스 이름 (Name 태그에서 추출)
     */
    public String getInstanceName() {
        return tags != null ? tags.getOrDefault("Name", instanceId) : instanceId;
    }
    
    /**
     * 실행 시간 (분 단위)
     */
    public long getUptimeMinutes() {
        if (launchTime == null) return 0;
        return java.time.Duration.between(launchTime, LocalDateTime.now()).toMinutes();
    }
    
    /**
     * 상태가 실행 중인지 확인
     */
    public boolean isRunning() {
        return "running".equalsIgnoreCase(state);
    }
    
    /**
     * 퍼블릭 IP가 있는지 확인
     */
    public boolean hasPublicIp() {
        return publicIp != null && !publicIp.isEmpty();
    }
}
