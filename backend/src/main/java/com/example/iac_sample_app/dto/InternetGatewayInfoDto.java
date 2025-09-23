package com.example.iac_sample_app.dto;

import lombok.Builder;
import lombok.Data;

/**
 * 인터넷 게이트웨이 정보 DTO
 */
@Data
@Builder
public class InternetGatewayInfoDto {
    
    /**
     * 인터넷 게이트웨이 ID
     */
    private String internetGatewayId;
    
    /**
     * 상태 (available, attaching, attached, detaching, detached)
     */
    private String state;
    
    /**
     * 연결된 VPC ID
     */
    private String attachedVpcId;
    
    /**
     * 인터넷 게이트웨이 이름 (Name 태그)
     */
    private String name;
    
    /**
     * IGW ARN 생성
     */
    public String getInternetGatewayArn() {
        if (internetGatewayId == null) return null;
        return String.format("arn:aws:ec2:*:*:internet-gateway/%s", internetGatewayId);
    }
    
    /**
     * VPC에 연결되어 있는지 확인
     */
    public boolean isAttached() {
        return "attached".equalsIgnoreCase(state);
    }
    
    /**
     * 사용 가능한 상태인지 확인
     */
    public boolean isAvailable() {
        return "available".equalsIgnoreCase(state) || isAttached();
    }
}
