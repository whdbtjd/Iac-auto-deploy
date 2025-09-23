package com.example.iac_sample_app.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * NAT 게이트웨이 정보 DTO
 */
@Data
@Builder
public class NatGatewayInfoDto {
    
    /**
     * NAT 게이트웨이 ID
     */
    private String natGatewayId;
    
    /**
     * 상태 (pending, failed, available, deleting, deleted)
     */
    private String state;
    
    /**
     * 위치한 서브넷 ID
     */
    private String subnetId;
    
    /**
     * 가용 영역
     */
    private String availabilityZone;
    
    /**
     * 퍼블릭 IP 주소
     */
    private String publicIp;
    
    /**
     * 프라이빗 IP 주소
     */
    private String privateIp;
    
    /**
     * 생성 시간
     */
    private LocalDateTime createTime;
    
    /**
     * NAT 게이트웨이 이름 (Name 태그)
     */
    private String name;
    
    /**
     * 연결 추적 정보
     */
    private String connectivityType; // public, private
    
    /**
     * NAT Gateway ARN 생성
     */
    public String getNatGatewayArn() {
        if (natGatewayId == null) return null;
        return String.format("arn:aws:ec2:*:*:natgateway/%s", natGatewayId);
    }
    
    /**
     * 사용 가능한 상태인지 확인
     */
    public boolean isAvailable() {
        return "available".equalsIgnoreCase(state);
    }
    
    /**
     * 생성 중인지 확인
     */
    public boolean isPending() {
        return "pending".equalsIgnoreCase(state);
    }
    
    /**
     * 퍼블릭 NAT 게이트웨이인지 확인
     */
    public boolean isPublic() {
        return "public".equalsIgnoreCase(connectivityType) || publicIp != null;
    }
    
    /**
     * 실행 시간 (시간 단위)
     */
    public long getUptimeHours() {
        if (createTime == null) return 0;
        return java.time.Duration.between(createTime, LocalDateTime.now()).toHours();
    }
}
