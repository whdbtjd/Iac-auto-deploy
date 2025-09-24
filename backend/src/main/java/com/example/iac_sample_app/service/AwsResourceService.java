package com.example.iac_sample_app.service;

import com.example.iac_sample_app.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.cloudfront.CloudFrontClient;
import software.amazon.awssdk.services.cloudfront.model.*;
import software.amazon.awssdk.services.ec2.Ec2Client;
import software.amazon.awssdk.services.ec2.model.*;
import software.amazon.awssdk.services.elasticloadbalancingv2.ElasticLoadBalancingV2Client;
import software.amazon.awssdk.services.elasticloadbalancingv2.model.*;
import software.amazon.awssdk.services.rds.RdsClient;
import software.amazon.awssdk.services.rds.model.*;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AwsResourceService {

    private final Ec2Client ec2Client;
    private final ElasticLoadBalancingV2Client elbClient;
    private final RdsClient rdsClient;
    private final S3Client s3Client;
    private final CloudFrontClient cloudFrontClient;

    // 환경 변수에서 리소스 정보들 주입받기
    
    // EC2 관련
    @Value("${aws.resources.ec2.instance-ids:}")
    private List<String> ec2InstanceIds;
    
    @Value("${aws.resources.ec2-details.public-ips:}")
    private List<String> ec2PublicIps;
    
    @Value("${aws.resources.ec2-details.private-ips:}")
    private List<String> ec2PrivateIps;
    
    @Value("${aws.resources.ec2-details.availability-zones:}")
    private List<String> ec2AvailabilityZones;
    
    @Value("${aws.resources.ec2-details.instance-types:}")
    private List<String> ec2InstanceTypes;
    
    @Value("${aws.resources.ec2-details.ami-id:}")
    private String ec2AmiId;

    // ALB 관련
    @Value("${aws.resources.alb.dns-name:}")
    private String albDnsName;
    
    @Value("${aws.resources.alb.arn:}")
    private String albArn;
    
    @Value("${aws.resources.alb.target-group-name:}")
    private String albTargetGroupName;
    
    @Value("${aws.resources.alb.listener-arn:}")
    private String albListenerArn;
    
    @Value("${aws.resources.alb.availability-zones:}")
    private List<String> albAvailabilityZones;

    // RDS 관련
    @Value("${aws.resources.rds.endpoint:}")
    private String rdsEndpoint;
    
    @Value("${aws.resources.rds.port:3306}")
    private Integer rdsPort;
    
    @Value("${aws.resources.rds.instance-identifier:}")
    private String rdsInstanceIdentifier;
    
    @Value("${aws.resources.rds.engine:mysql}")
    private String rdsEngine;
    
    @Value("${aws.resources.rds.engine-version:8.0}")
    private String rdsEngineVersion;
    
    @Value("${aws.resources.rds.instance-class:}")
    private String rdsInstanceClass;
    
    @Value("${aws.resources.rds.availability-zone:}")
    private String rdsAvailabilityZone;
    
    @Value("${aws.resources.rds.multi-az:false}")
    private Boolean rdsMultiAz;

    // S3 관련
    @Value("${aws.resources.s3.bucket-name:}")
    private String s3BucketName;
    
    @Value("${aws.resources.s3.region:ap-northeast-2}")
    private String s3BucketRegion;
    
    @Value("${aws.resources.s3.website-endpoint:}")
    private String s3WebsiteEndpoint;

    // CloudFront 관련
    @Value("${aws.resources.cloudfront.distribution-id:}")
    private String cloudFrontDistributionId;
    
    @Value("${aws.resources.cloudfront.domain-name:}")
    private String cloudFrontDomainName;
    
    @Value("${aws.resources.cloudfront.status:}")
    private String cloudFrontStatus;

    // VPC 관련
    @Value("${aws.resources.vpc.vpc-id:}")
    private String vpcId;
    
    @Value("${aws.resources.vpc.cidr-block:}")
    private String vpcCidrBlock;
    
    @Value("${aws.resources.vpc.public-subnet-ids:}")
    private List<String> publicSubnetIds;
    
    @Value("${aws.resources.vpc.private-subnet-ids-was:}")
    private List<String> privateSubnetIdsWas;
    
    @Value("${aws.resources.vpc.private-subnet-ids-db:}")
    private List<String> privateSubnetIdsDb;
    
    @Value("${aws.resources.vpc.internet-gateway-id:}")
    private String internetGatewayId;
    
    @Value("${aws.resources.vpc.nat-gateway-ids:}")
    private List<String> natGatewayIds;

    // 보안 그룹 관련
    @Value("${aws.resources.security-groups.alb-id:}")
    private String securityGroupAlbId;
    
    @Value("${aws.resources.security-groups.was-id:}")
    private String securityGroupWasId;
    
    @Value("${aws.resources.security-groups.db-id:}")
    private String securityGroupDbId;

    // 데모 모드 설정
    @Value("${demo.mode.enabled:true}")
    private boolean demoModeEnabled;

    /**
     * 전체 인프라 상태 조회
     */
    public InfrastructureStatusResponse getInfrastructureStatus() {
        try {
            log.info("인프라 상태 조회 시작");

            return InfrastructureStatusResponse.builder()
                    .status("connected")
                    .message("모든 리소스가 정상적으로 연결되었습니다")
                    .lastUpdated(LocalDateTime.now())
                    .ec2Instances(getEC2Info())
                    .loadBalancer(getALBInfo())
                    .database(getRDSInfo())
                    .storage(getS3Info())
                    .cdn(getCloudFrontInfo())
                    .network(getVPCInfo())
                    .build();

        } catch (Exception e) {
            log.error("인프라 상태 조회 실패", e);
            return InfrastructureStatusResponse.builder()
                    .status("error")
                    .message("리소스 정보를 가져오는 중 오류가 발생했습니다: " + e.getMessage())
                    .lastUpdated(LocalDateTime.now())
                    .build();
        }
    }

    /**
     * EC2 인스턴스 정보 조회
     */
    public List<EC2InfoDto> getEC2Info() {
        // 데모 모드인 경우 가짜 데이터 반환
        if (demoModeEnabled) {
            return createDemoEC2Data();
        }
        
        try {
            if (ec2InstanceIds.isEmpty()) {
                log.warn("EC2 인스턴스 ID가 설정되지 않았습니다");
                return Collections.emptyList();
            }

            DescribeInstancesRequest request = DescribeInstancesRequest.builder()
                    .instanceIds(ec2InstanceIds)
                    .build();

            DescribeInstancesResponse response = ec2Client.describeInstances(request);

            List<EC2InfoDto> ec2List = new ArrayList<>();
            for (Reservation reservation : response.reservations()) {
                for (Instance instance : reservation.instances()) {
                    EC2InfoDto dto = EC2InfoDto.builder()
                            .instanceId(instance.instanceId())
                            .privateIp(instance.privateIpAddress())
                            .publicIp(instance.publicIpAddress())
                            .instanceType(instance.instanceType().toString())
                            .availabilityZone(instance.placement().availabilityZone())
                            .state(instance.state().name().toString())
                            .amiId(instance.imageId())
                            .architecture(instance.architecture().toString())
                            .launchTime(instance.launchTime() != null ? 
                                    LocalDateTime.ofInstant(instance.launchTime(), ZoneId.systemDefault()) : null)
                            .tags(instance.tags().stream()
                                    .collect(Collectors.toMap(
                                            tag -> tag.key(), 
                                            tag -> tag.value())))
                            .healthStatus(getInstanceHealthStatus(instance))
                            .build();
                    ec2List.add(dto);
                }
            }

            log.info("EC2 인스턴스 정보 조회 완료: {} 개", ec2List.size());
            return ec2List;

        } catch (Exception e) {
            log.error("EC2 정보 조회 실패", e);
            return Collections.emptyList();
        }
    }

    /**
     * ALB 정보 조회
     */
    public ALBInfoDto getALBInfo() {
        // 데모 모드인 경우 가짜 데이터 반환
        if (demoModeEnabled) {
            return createDemoALBData();
        }
        
        try {
            if (albDnsName == null || albDnsName.isEmpty()) {
                log.warn("ALB DNS 이름이 설정되지 않았습니다");
                return null;
            }

            // ALB 정보 조회
            DescribeLoadBalancersResponse albResponse = elbClient.describeLoadBalancers();
            LoadBalancer alb = albResponse.loadBalancers().stream()
                    .filter(lb -> lb.dnsName().equals(albDnsName))
                    .findFirst()
                    .orElse(null);

            if (alb == null) {
                log.warn("ALB를 찾을 수 없습니다: {}", albDnsName);
                return null;
            }

            // Target Group 정보 조회
            List<TargetGroupInfoDto> targetGroups = getTargetGroupInfo(alb.loadBalancerArn());

            ALBInfoDto dto = ALBInfoDto.builder()
                    .arn(alb.loadBalancerArn())
                    .dnsName(alb.dnsName())
                    .state(alb.state().code().toString())
                    .type(alb.type().toString())
                    .scheme(alb.scheme().toString())
                            .availabilityZones(alb.availabilityZones().stream()
                            .map(az -> az.zoneName())
                            .collect(Collectors.toList()))
                    .targetGroups(targetGroups)
                    .createdTime(alb.createdTime() != null ? 
                            LocalDateTime.ofInstant(alb.createdTime(), ZoneId.systemDefault()) : null)
                    .build();

            log.info("ALB 정보 조회 완료: {}", dto.getDnsName());
            return dto;

        } catch (Exception e) {
            log.error("ALB 정보 조회 실패", e);
            return null;
        }
    }

    /**
     * RDS 정보 조회
     */
    public RDSInfoDto getRDSInfo() {
        // 데모 모드인 경우 가짜 데이터 반환
        if (demoModeEnabled) {
            return createDemoRDSData();
        }
        
        try {
            if (rdsEndpoint == null || rdsEndpoint.isEmpty()) {
                log.warn("RDS 엔드포인트가 설정되지 않았습니다");
                return null;
            }

            // RDS 인스턴스 조회
            var response = rdsClient.describeDBInstances();
            var rdsInstance = response.dbInstances().stream()
                    .filter(db -> db.endpoint() != null && db.endpoint().address().equals(rdsEndpoint))
                    .findFirst()
                    .orElse(null);

            if (rdsInstance == null) {
                log.warn("RDS 인스턴스를 찾을 수 없습니다: {}", rdsEndpoint);
                return null;
            }

            RDSInfoDto dto = RDSInfoDto.builder()
                    .identifier(rdsInstance.dbInstanceIdentifier())
                    .endpoint(rdsInstance.endpoint().address())
                    .port(rdsInstance.endpoint().port())
                    .engine(rdsInstance.engine())
                    .engineVersion(rdsInstance.engineVersion())
                    .instanceClass(rdsInstance.dbInstanceClass())
                    .status(rdsInstance.dbInstanceStatus())
                    .multiAZ(rdsInstance.multiAZ())
                    .availabilityZone(rdsInstance.availabilityZone())
                    .createdTime(rdsInstance.instanceCreateTime() != null ? 
                            LocalDateTime.ofInstant(rdsInstance.instanceCreateTime(), ZoneId.systemDefault()) : null)
                    .storageType(rdsInstance.storageType())
                    .allocatedStorage(rdsInstance.allocatedStorage())
                    .build();

            log.info("RDS 정보 조회 완료: {}", dto.getIdentifier());
            return dto;

        } catch (Exception e) {
            log.error("RDS 정보 조회 실패", e);
            return null;
        }
    }

    /**
     * S3 정보 조회
     */
    public S3InfoDto getS3Info() {
        // 데모 모드인 경우 가짜 데이터 반환
        if (demoModeEnabled) {
            return createDemoS3Data();
        }
        
        try {
            if (s3BucketName == null || s3BucketName.isEmpty()) {
                log.warn("S3 버킷 이름이 설정되지 않았습니다");
                return null;
            }

            // 버킷 정보 조회
            HeadBucketRequest headRequest = HeadBucketRequest.builder()
                    .bucket(s3BucketName)
                    .build();
            s3Client.headBucket(headRequest);

            // 버킷 생성 날짜 조회
            ListBucketsResponse bucketsResponse = s3Client.listBuckets();
            Bucket bucket = bucketsResponse.buckets().stream()
                    .filter(b -> b.name().equals(s3BucketName))
                    .findFirst()
                    .orElse(null);

            S3InfoDto dto = S3InfoDto.builder()
                    .bucketName(s3BucketName)
                    .region(s3Client.serviceClientConfiguration().region().toString())
                    .creationDate(bucket != null && bucket.creationDate() != null ? 
                            LocalDateTime.ofInstant(bucket.creationDate(), ZoneId.systemDefault()) : null)
                    .publicAccessStatus(getS3PublicAccessStatus())
                    .websiteHosting(checkS3WebsiteHosting())
                    .websiteEndpoint(getS3WebsiteEndpoint())
                    .build();

            log.info("S3 정보 조회 완료: {}", dto.getBucketName());
            return dto;

        } catch (Exception e) {
            log.error("S3 정보 조회 실패", e);
            return null;
        }
    }

    /**
     * CloudFront 정보 조회
     */
    public CloudFrontInfoDto getCloudFrontInfo() {
        // 데모 모드인 경우 가짜 데이터 반환
        if (demoModeEnabled) {
            return createDemoCloudFrontData();
        }
        
        try {
            if (cloudFrontDistributionId == null || cloudFrontDistributionId.isEmpty()) {
                log.warn("CloudFront Distribution ID가 설정되지 않았습니다");
                return null;
            }

            GetDistributionRequest request = GetDistributionRequest.builder()
                    .id(cloudFrontDistributionId)
                    .build();

            GetDistributionResponse response = cloudFrontClient.getDistribution(request);
            Distribution distribution = response.distribution();

            List<OriginInfoDto> origins = distribution.distributionConfig().origins().items().stream()
                    .map(origin -> OriginInfoDto.builder()
                            .originId(origin.id())
                            .domainName(origin.domainName())
                            .originType(origin.s3OriginConfig() != null ? "s3" : "custom")
                            .build())
                    .collect(Collectors.toList());

            CloudFrontInfoDto dto = CloudFrontInfoDto.builder()
                    .distributionId(distribution.id())
                    .domainName(distribution.domainName())
                    .status(distribution.status())
                    .enabled(distribution.distributionConfig().enabled())
                    .comment(distribution.distributionConfig().comment())
                    .lastModifiedTime(distribution.lastModifiedTime() != null ? 
                            LocalDateTime.ofInstant(distribution.lastModifiedTime(), ZoneId.systemDefault()) : null)
                    .origins(origins)
                    .build();

            log.info("CloudFront 정보 조회 완료: {}", dto.getDomainName());
            return dto;

        } catch (Exception e) {
            log.error("CloudFront 정보 조회 실패", e);
            return null;
        }
    }

    /**
     * VPC 정보 조회 (간소화된 버전)
     */
    public VPCInfoDto getVPCInfo() {
        // 데모 모드인 경우 가짜 데이터 반환
        if (demoModeEnabled) {
            return createDemoVPCData();
        }
        
        try {
            DescribeVpcsResponse response = ec2Client.describeVpcs();
            Vpc vpc = response.vpcs().stream()
                    .filter(v -> !v.isDefault()) // 기본 VPC가 아닌 것
                    .findFirst()
                    .orElse(null);

            if (vpc == null) {
                log.warn("사용자 정의 VPC를 찾을 수 없습니다");
                return null;
            }

            VPCInfoDto dto = VPCInfoDto.builder()
                    .vpcId(vpc.vpcId())
                    .cidrBlock(vpc.cidrBlock())
                    .state(vpc.state().toString())
                    .isDefault(vpc.isDefault())
                    .build();

            log.info("VPC 정보 조회 완료: {}", dto.getVpcId());
            return dto;

        } catch (Exception e) {
            log.error("VPC 정보 조회 실패", e);
            return null;
        }
    }

    // === 헬퍼 메서드들 ===

    private String getInstanceHealthStatus(Instance instance) {
        InstanceState state = instance.state();
        if (state.name() == InstanceStateName.RUNNING) {
            return "healthy";
        } else if (state.name() == InstanceStateName.STOPPED || 
                   state.name() == InstanceStateName.STOPPING) {
            return "unhealthy";
        } else {
            return "unknown";
        }
    }

    private List<TargetGroupInfoDto> getTargetGroupInfo(String albArn) {
        try {
            DescribeTargetGroupsResponse tgResponse = elbClient.describeTargetGroups(
                    DescribeTargetGroupsRequest.builder()
                            .loadBalancerArn(albArn)
                            .build()
            );

            return tgResponse.targetGroups().stream()
                    .map(tg -> {
                        List<TargetHealthDto> targets = getTargetHealth(tg.targetGroupArn());
                        long healthyCount = targets.stream()
                                .filter(t -> "healthy".equals(t.getHealthStatus()))
                                .count();

                        return TargetGroupInfoDto.builder()
                                .arn(tg.targetGroupArn())
                                .name(tg.targetGroupName())
                                .protocol(tg.protocol().toString())
                                .port(tg.port())
                                .healthCheckPath(tg.healthCheckPath())
                                .healthyTargetCount((int) healthyCount)
                                .unhealthyTargetCount(targets.size() - (int) healthyCount)
                                .targets(targets)
                                .build();
                    })
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Target Group 정보 조회 실패", e);
            return Collections.emptyList();
        }
    }

    private List<TargetHealthDto> getTargetHealth(String targetGroupArn) {
        try {
            DescribeTargetHealthResponse healthResponse = elbClient.describeTargetHealth(
                    DescribeTargetHealthRequest.builder()
                            .targetGroupArn(targetGroupArn)
                            .build()
            );

            return healthResponse.targetHealthDescriptions().stream()
                    .map(thd -> TargetHealthDto.builder()
                            .targetId(thd.target().id())
                            .targetType(thd.target().port() != null ? "instance" : "ip")
                            .healthStatus(thd.targetHealth().state().toString().toLowerCase())
                            .description(thd.targetHealth().description())
                            .build())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Target Health 조회 실패", e);
            return Collections.emptyList();
        }
    }

    private String getS3PublicAccessStatus() {
        try {
            GetPublicAccessBlockRequest request = GetPublicAccessBlockRequest.builder()
                    .bucket(s3BucketName)
                    .build();
            
            GetPublicAccessBlockResponse response = s3Client.getPublicAccessBlock(request);
            PublicAccessBlockConfiguration config = response.publicAccessBlockConfiguration();
            
            if (config.blockPublicAcls() && config.blockPublicPolicy()) {
                return "private";
            } else {
                return "public";
            }
        } catch (Exception e) {
            return "unknown";
        }
    }

    private Boolean checkS3WebsiteHosting() {
        try {
            GetBucketWebsiteRequest request = GetBucketWebsiteRequest.builder()
                    .bucket(s3BucketName)
                    .build();
            
            s3Client.getBucketWebsite(request);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private String getS3WebsiteEndpoint() {
        try {
            if (checkS3WebsiteHosting()) {
                return String.format("%s.s3-website.%s.amazonaws.com", 
                        s3BucketName, 
                        s3Client.serviceClientConfiguration().region().toString());
            }
        } catch (Exception e) {
            log.debug("S3 웹사이트 엔드포인트 조회 실패", e);
        }
        return null;
    }

    // === 데모 데이터 생성 메서드들 ===

    private List<EC2InfoDto> createDemoEC2Data() {
        List<EC2InfoDto> demoData = new ArrayList<>();

        // 환경변수에서 실제 값을 가져오거나 기본값 사용
        List<String> instanceIds = ec2InstanceIds.isEmpty() ? 
            Arrays.asList("i-1234567890abcdef0", "i-0987654321fedcba0") : ec2InstanceIds;
        List<String> privateIps = ec2PrivateIps.isEmpty() ? 
            Arrays.asList("172.31.47.117", "172.31.40.58") : ec2PrivateIps;
        List<String> publicIps = ec2PublicIps.isEmpty() ? 
            Arrays.asList(null, null) : ec2PublicIps;
        List<String> instanceTypes = ec2InstanceTypes.isEmpty() ? 
            Arrays.asList("t3.micro", "t3.micro") : ec2InstanceTypes;
        List<String> availabilityZones = ec2AvailabilityZones.isEmpty() ? 
            Arrays.asList("ap-northeast-2a", "ap-northeast-2c") : ec2AvailabilityZones;
        String amiId = ec2AmiId.isEmpty() ? "ami-0ea4d4b8dc1e46212" : ec2AmiId;

        for (int i = 0; i < instanceIds.size(); i++) {
            demoData.add(EC2InfoDto.builder()
                    .instanceId(instanceIds.get(i))
                    .privateIp(i < privateIps.size() ? privateIps.get(i) : "172.31.0." + (10 + i))
                    .publicIp(i < publicIps.size() && publicIps.get(i) != null ? publicIps.get(i) : null)
                    .instanceType(i < instanceTypes.size() ? instanceTypes.get(i) : "t3.micro")
                    .availabilityZone(i < availabilityZones.size() ? availabilityZones.get(i) : "ap-northeast-2" + (char)('a' + i))
                    .state("running")
                    .amiId(amiId)
                    .architecture("x86_64")
                    .launchTime(LocalDateTime.now().minusHours(2 - i))
                    .tags(Map.of("Name", "WAS-Instance-" + (i + 1), "Environment", "Demo"))
                    .healthStatus("healthy")
                    .build());
        }

        log.info("데모 EC2 데이터 생성 완료: {} 개 (실제 환경변수 활용)", demoData.size());
        return demoData;
    }

    private ALBInfoDto createDemoALBData() {
        // 환경변수에서 실제 값을 가져오거나 기본값 사용
        String dnsName = albDnsName.isEmpty() ? "alb-web-1234567890.ap-northeast-2.elb.amazonaws.com" : albDnsName;
        String arn = albArn.isEmpty() ? "arn:aws:elasticloadbalancing:ap-northeast-2:123456789012:loadbalancer/app/alb-web/1234567890123456" : albArn;
        String targetGroupName = albTargetGroupName.isEmpty() ? "alb-tg" : albTargetGroupName;
        String listenerArn = albListenerArn.isEmpty() ? "arn:aws:elasticloadbalancing:ap-northeast-2:123456789012:listener/app/alb-web/1234567890123456/1234567890123456" : albListenerArn;
        List<String> availabilityZones = albAvailabilityZones.isEmpty() ? Arrays.asList("ap-northeast-2a", "ap-northeast-2c") : albAvailabilityZones;
        List<String> instanceIds = ec2InstanceIds.isEmpty() ? Arrays.asList("i-1234567890abcdef0", "i-0987654321fedcba0") : ec2InstanceIds;

        List<TargetHealthDto> targets = instanceIds.stream()
                .map(instanceId -> TargetHealthDto.builder()
                        .targetId(instanceId)
                        .targetType("instance")
                        .healthStatus("healthy")
                        .description("Target is healthy")
                        .build())
                .collect(Collectors.toList());

        List<TargetGroupInfoDto> targetGroups = Arrays.asList(
                TargetGroupInfoDto.builder()
                        .arn("arn:aws:elasticloadbalancing:ap-northeast-2:123456789012:targetgroup/" + targetGroupName + "/1234567890123456")
                        .name(targetGroupName)
                        .protocol("HTTP")
                        .port(8080)
                        .healthCheckPath("/actuator/health")
                        .healthyTargetCount(targets.size())
                        .unhealthyTargetCount(0)
                        .targets(targets)
                        .build()
        );

        ALBInfoDto demo = ALBInfoDto.builder()
                .arn(arn)
                .dnsName(dnsName)
                .state("active")
                .type("application")
                .scheme("internet-facing")
                .availabilityZones(availabilityZones)
                .targetGroups(targetGroups)
                .createdTime(LocalDateTime.now().minusHours(3))
                .build();

        log.info("데모 ALB 데이터 생성 완료: {} (실제 환경변수 활용)", demo.getDnsName());
        return demo;
    }

    private RDSInfoDto createDemoRDSData() {
        // 환경변수에서 실제 값을 가져오거나 기본값 사용
        String identifier = rdsInstanceIdentifier.isEmpty() ? "rds-iac" : rdsInstanceIdentifier;
        String endpoint = rdsEndpoint.isEmpty() ? "rds-iac.cluster-xyz123.ap-northeast-2.rds.amazonaws.com" : rdsEndpoint;
        Integer port = rdsPort != null ? rdsPort : 3306;
        String engine = rdsEngine.isEmpty() ? "mysql" : rdsEngine;
        String engineVersion = rdsEngineVersion.isEmpty() ? "8.0" : rdsEngineVersion;
        String instanceClass = rdsInstanceClass.isEmpty() ? "db.t3.micro" : rdsInstanceClass;
        String availabilityZone = rdsAvailabilityZone.isEmpty() ? "ap-northeast-2a" : rdsAvailabilityZone;
        Boolean multiAZ = rdsMultiAz != null ? rdsMultiAz : true;

        RDSInfoDto demo = RDSInfoDto.builder()
                .identifier(identifier)
                .endpoint(endpoint)
                .port(port)
                .engine(engine)
                .engineVersion(engineVersion)
                .instanceClass(instanceClass)
                .status("available")
                .multiAZ(multiAZ)
                .availabilityZone(availabilityZone)
                .createdTime(LocalDateTime.now().minusHours(4))
                .storageType("gp2")
                .allocatedStorage(20)
                .build();

        log.info("데모 RDS 데이터 생성 완료: {} (실제 환경변수 활용)", demo.getIdentifier());
        return demo;
    }

    private S3InfoDto createDemoS3Data() {
        // 환경변수에서 실제 값을 가져오거나 기본값 사용
        String bucketName = s3BucketName.isEmpty() ? "frontend-web-abc123" : s3BucketName;
        String region = s3BucketRegion.isEmpty() ? "ap-northeast-2" : s3BucketRegion;
        String websiteEndpoint = s3WebsiteEndpoint.isEmpty() ? 
            bucketName + ".s3-website." + region + ".amazonaws.com" : s3WebsiteEndpoint;

        S3InfoDto demo = S3InfoDto.builder()
                .bucketName(bucketName)
                .region(region)
                .creationDate(LocalDateTime.now().minusHours(5))
                .publicAccessStatus("private")
                .websiteHosting(true)
                .websiteEndpoint(websiteEndpoint)
                .encryptionEnabled(true)
                .versioningEnabled(false)
                .build();

        log.info("데모 S3 데이터 생성 완료: {} (실제 환경변수 활용)", demo.getBucketName());
        return demo;
    }

    private CloudFrontInfoDto createDemoCloudFrontData() {
        // 환경변수에서 실제 값을 가져오거나 기본값 사용
        String distributionId = cloudFrontDistributionId.isEmpty() ? "E1234567890ABC" : cloudFrontDistributionId;
        String domainName = cloudFrontDomainName.isEmpty() ? "d1234567890abc.cloudfront.net" : cloudFrontDomainName;
        String status = cloudFrontStatus.isEmpty() ? "Deployed" : cloudFrontStatus;
        String bucketName = s3BucketName.isEmpty() ? "frontend-web-abc123" : s3BucketName;
        String region = s3BucketRegion.isEmpty() ? "ap-northeast-2" : s3BucketRegion;

        List<OriginInfoDto> origins = Arrays.asList(
                OriginInfoDto.builder()
                        .originId(bucketName)
                        .domainName(bucketName + ".s3." + region + ".amazonaws.com")
                        .originType("s3")
                        .originPath("")
                        .build()
        );

        CloudFrontInfoDto demo = CloudFrontInfoDto.builder()
                .distributionId(distributionId)
                .domainName(domainName)
                .status(status)
                .enabled(true)
                .comment("Frontend distribution for voting system")
                .lastModifiedTime(LocalDateTime.now().minusHours(2))
                .origins(origins)
                .priceClass("PriceClass_All")
                .defaultRootObject("index.html")
                .build();

        log.info("데모 CloudFront 데이터 생성 완료: {} (실제 환경변수 활용)", demo.getDomainName());
        return demo;
    }

    private VPCInfoDto createDemoVPCData() {
        // 환경변수에서 실제 값을 가져오거나 기본값 사용
        String vpcIdValue = vpcId.isEmpty() ? "vpc-1234567890abcdef0" : vpcId;
        String cidrBlock = vpcCidrBlock.isEmpty() ? "10.0.0.0/16" : vpcCidrBlock;
        String igwId = internetGatewayId.isEmpty() ? "igw-1234567890abcdef0" : internetGatewayId;
        
        List<String> publicSubnets = publicSubnetIds.isEmpty() ? 
            Arrays.asList("subnet-1234567890abcdef0", "subnet-0987654321fedcba0") : publicSubnetIds;
        List<String> privateSubnetsWas = privateSubnetIdsWas.isEmpty() ? 
            Arrays.asList("subnet-1111222233334444", "subnet-5555666677778888") : privateSubnetIdsWas;
        List<String> privateSubnetsDb = privateSubnetIdsDb.isEmpty() ? 
            Arrays.asList("subnet-aaaa111122223333", "subnet-bbbb444455556666") : privateSubnetIdsDb;

        List<SubnetInfoDto> subnets = new ArrayList<>();
        
        // Public 서브넷들 생성
        for (int i = 0; i < publicSubnets.size(); i++) {
            subnets.add(SubnetInfoDto.builder()
                    .subnetId(publicSubnets.get(i))
                    .cidrBlock("10.0." + (i + 1) + ".0/24")
                    .availabilityZone("ap-northeast-2" + (char)('a' + i))
                    .state("available")
                    .mapPublicIpOnLaunch(true)
                    .availableIpAddressCount(245 - i * 2)
                    .name("pub-sub-" + (i + 1))
                    .subnetType("public")
                    .build());
        }
        
        // Private WAS 서브넷들 생성
        for (int i = 0; i < privateSubnetsWas.size(); i++) {
            subnets.add(SubnetInfoDto.builder()
                    .subnetId(privateSubnetsWas.get(i))
                    .cidrBlock("10.0." + (i + 3) + ".0/24")
                    .availabilityZone("ap-northeast-2" + (char)('a' + i))
                    .state("available")
                    .mapPublicIpOnLaunch(false)
                    .availableIpAddressCount(249 - i)
                    .name("pri-sub-was-" + (i + 1))
                    .subnetType("private")
                    .build());
        }
        
        // Private DB 서브넷들 생성
        for (int i = 0; i < privateSubnetsDb.size(); i++) {
            subnets.add(SubnetInfoDto.builder()
                    .subnetId(privateSubnetsDb.get(i))
                    .cidrBlock("10.0." + (i + 5) + ".0/24")
                    .availabilityZone("ap-northeast-2" + (char)('a' + i))
                    .state("available")
                    .mapPublicIpOnLaunch(false)
                    .availableIpAddressCount(252 - i)
                    .name("pri-sub-db-" + (i + 1))
                    .subnetType("private")
                    .build());
        }

        InternetGatewayInfoDto igw = InternetGatewayInfoDto.builder()
                .internetGatewayId(igwId)
                .state("attached")
                .attachedVpcId(vpcIdValue)
                .name("main-igw")
                .build();

        VPCInfoDto demo = VPCInfoDto.builder()
                .vpcId(vpcIdValue)
                .cidrBlock(cidrBlock)
                .state("available")
                .isDefault(false)
                .name("main-vpc")
                .subnets(subnets)
                .internetGateway(igw)
                .routeTableCount(4)
                .securityGroupCount(3)
                .build();

        log.info("데모 VPC 데이터 생성 완료: {} (실제 환경변수 활용)", demo.getVpcId());
        return demo;
    }
}