package com.example.iac_sample_app.dto;

import lombok.Builder;
import lombok.Data;

/**
 * 서브넷 정보 DTO
 */
@Data
@Builder
public class SubnetInfoDto {
    
    /**
     * 서브넷 ID
     */
    private String subnetId;
    
    /**
     * CIDR 블록
     */
    private String cidrBlock;
    
    /**
     * 가용 영역
     */
    private String availabilityZone;
    
    /**
     * 상태 (available, pending)
     */
    private String state;
    
    /**
     * 퍼블릭 서브넷 여부
     */
    private Boolean mapPublicIpOnLaunch;
    
    /**
     * 사용 가능한 IP 개수
     */
    private Integer availableIpAddressCount;
    
    /**
     * 서브넷 이름 (Name 태그)
     */
    private String name;
    
    /**
     * 서브넷 타입 (public, private, isolated)
     */
    private String subnetType;
    
    /**
     * 서브넷 ARN 생성
     */
    public String getSubnetArn() {
        if (subnetId == null) return null;
        return String.format("arn:aws:ec2:*:*:subnet/%s", subnetId);
    }
    
    /**
     * 퍼블릭 서브넷인지 확인
     */
    public boolean isPublic() {
        return mapPublicIpOnLaunch != null && mapPublicIpOnLaunch;
    }
    
    /**
     * 사용 가능한 상태인지 확인
     */
    public boolean isAvailable() {
        return "available".equalsIgnoreCase(state);
    }
    
    /**
     * IP 사용률 계산 (%)
     */
    public double getIpUsagePercentage() {
        if (availableIpAddressCount == null) return 0.0;
        
        // /24 서브넷 기준 (256개 IP - 5개 예약 = 251개 사용 가능)
        int totalIps = 251; // AWS에서 기본적으로 예약하는 5개 IP 제외
        int usedIps = totalIps - availableIpAddressCount;
        
        return ((double) usedIps / totalIps) * 100.0;
    }
}
