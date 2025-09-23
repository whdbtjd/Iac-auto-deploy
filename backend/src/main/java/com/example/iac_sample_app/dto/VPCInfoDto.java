package com.example.iac_sample_app.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * VPC 정보 DTO
 */
@Data
@Builder
public class VPCInfoDto {
    
    /**
     * VPC ID
     */
    private String vpcId;
    
    /**
     * CIDR 블록
     */
    private String cidrBlock;
    
    /**
     * VPC 상태 (available, pending)
     */
    private String state;
    
    /**
     * 기본 VPC 여부
     */
    private Boolean isDefault;
    
    /**
     * VPC 이름 (Name 태그)
     */
    private String name;
    
    /**
     * 서브넷 정보들
     */
    private List<SubnetInfoDto> subnets;
    
    /**
     * 인터넷 게이트웨이 정보
     */
    private InternetGatewayInfoDto internetGateway;
    
    /**
     * NAT 게이트웨이 정보들
     */
    private List<NatGatewayInfoDto> natGateways;
    
    /**
     * 라우트 테이블 개수
     */
    private Integer routeTableCount;
    
    /**
     * 보안 그룹 개수
     */
    private Integer securityGroupCount;
    
    /**
     * VPC ARN 생성
     */
    public String getVpcArn() {
        if (vpcId == null) return null;
        return String.format("arn:aws:ec2:*:*:vpc/%s", vpcId);
    }
    
    /**
     * 사용 가능한 상태인지 확인
     */
    public boolean isAvailable() {
        return "available".equalsIgnoreCase(state);
    }
    
    /**
     * 기본 VPC인지 확인
     */
    public boolean isDefaultVpc() {
        return isDefault != null && isDefault;
    }
    
    /**
     * 퍼블릭 서브넷 개수
     */
    public int getPublicSubnetCount() {
        if (subnets == null) return 0;
        return (int) subnets.stream()
                .filter(subnet -> subnet.isPublic())
                .count();
    }
    
    /**
     * 프라이빗 서브넷 개수
     */
    public int getPrivateSubnetCount() {
        if (subnets == null) return 0;
        return (int) subnets.stream()
                .filter(subnet -> !subnet.isPublic())
                .count();
    }
    
    /**
     * 전체 서브넷 개수
     */
    public int getTotalSubnetCount() {
        return subnets != null ? subnets.size() : 0;
    }
    
    /**
     * NAT 게이트웨이가 있는지 확인
     */
    public boolean hasNatGateway() {
        return natGateways != null && !natGateways.isEmpty();
    }
    
    /**
     * 인터넷 게이트웨이가 연결되어 있는지 확인
     */
    public boolean hasInternetGateway() {
        return internetGateway != null;
    }
}
