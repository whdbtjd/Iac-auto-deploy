package com.example.iac_sample_app.controller;

import com.example.iac_sample_app.dto.*;
import com.example.iac_sample_app.service.AwsResourceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = {"http://localhost:3000", "https://*.cloudfront.net"})
@RequiredArgsConstructor
public class ResourceController {

    private final AwsResourceService awsResourceService;

    /**
     * 전체 인프라 상태 조회 (데모용 메인 API)ㅁㄴddd
     */
    @GetMapping("/status")
    public ResponseEntity<InfrastructureStatusResponse> getInfrastructureStatus() {
        log.info("인프라 상태 조회 요청");
        
        try {
            InfrastructureStatusResponse status = awsResourceService.getInfrastructureStatus();
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("인프라 상태 조회 실패", e);
            
            InfrastructureStatusResponse errorResponse = InfrastructureStatusResponse.builder()
                    .status("error")
                    .message("리소스 정보를 가져오는 중 오류가 발생했습니다")
                    .lastUpdated(LocalDateTime.now())
                    .build();
            
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * 연결 상태 시뮬레이션 (데모용)
     * 처음에는 "connecting", 몇 초 후에는 "connected" 반환
     */
    @GetMapping("/connection-status")
    public ResponseEntity<Map<String, Object>> getConnectionStatus(@RequestParam(defaultValue = "0") int delay) {
        Map<String, Object> response = new HashMap<>();
        
        if (delay < 3000) { // 3초 미만이면 연결 중
            response.put("status", "connecting");
            response.put("message", "AWS 리소스에 연결 중입니다...");
            response.put("progress", Math.min(delay / 30, 100)); // 진행률
        } else {
            response.put("status", "connected");
            response.put("message", "모든 리소스가 성공적으로 연결되었습니다!");
            response.put("progress", 100);
        }
        
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    /**
     * EC2 인스턴스 상세 정보
     */
    @GetMapping("/ec2")
    public ResponseEntity<List<EC2InfoDto>> getEC2Info() {
        log.info("EC2 정보 조회 요청");
        
        try {
            List<EC2InfoDto> ec2Info = awsResourceService.getEC2Info();
            return ResponseEntity.ok(ec2Info);
        } catch (Exception e) {
            log.error("EC2 정보 조회 실패", e);
            return ResponseEntity.ok(List.of()); // 빈 리스트 반환
        }
    }

    /**
     * ALB 상세 정보
     */
    @GetMapping("/alb")
    public ResponseEntity<ALBInfoDto> getALBInfo() {
        log.info("ALB 정보 조회 요청");
        
        try {
            ALBInfoDto albInfo = awsResourceService.getALBInfo();
            return ResponseEntity.ok(albInfo);
        } catch (Exception e) {
            log.error("ALB 정보 조회 실패", e);
            return ResponseEntity.ok(null);
        }
    }

    /**
     * RDS 상세 정보
     */
    @GetMapping("/rds")
    public ResponseEntity<RDSInfoDto> getRDSInfo() {
        log.info("RDS 정보 조회 요청");
        
        try {
            RDSInfoDto rdsInfo = awsResourceService.getRDSInfo();
            return ResponseEntity.ok(rdsInfo);
        } catch (Exception e) {
            log.error("RDS 정보 조회 실패", e);
            return ResponseEntity.ok(null);
        }
    }

    /**
     * S3 상세 정보
     */
    @GetMapping("/s3")
    public ResponseEntity<S3InfoDto> getS3Info() {
        log.info("S3 정보 조회 요청");
        
        try {
            S3InfoDto s3Info = awsResourceService.getS3Info();
            return ResponseEntity.ok(s3Info);
        } catch (Exception e) {
            log.error("S3 정보 조회 실패", e);
            return ResponseEntity.ok(null);
        }
    }

    /**
     * CloudFront 상세 정보
     */
    @GetMapping("/cloudfront")
    public ResponseEntity<CloudFrontInfoDto> getCloudFrontInfo() {
        log.info("CloudFront 정보 조회 요청");
        
        try {
            CloudFrontInfoDto cloudFrontInfo = awsResourceService.getCloudFrontInfo();
            return ResponseEntity.ok(cloudFrontInfo);
        } catch (Exception e) {
            log.error("CloudFront 정보 조회 실패", e);
            return ResponseEntity.ok(null);
        }
    }

    /**
     * VPC 상세 정보
     */
    @GetMapping("/vpc")
    public ResponseEntity<VPCInfoDto> getVPCInfo() {
        log.info("VPC 정보 조회 요청");
        
        try {
            VPCInfoDto vpcInfo = awsResourceService.getVPCInfo();
            return ResponseEntity.ok(vpcInfo);
        } catch (Exception e) {
            log.error("VPC 정보 조회 실패", e);
            return ResponseEntity.ok(null);
        }
    }

    /**
     * 헬스체크 + 리소스 요약 정보
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getResourceHealth() {
        Map<String, Object> healthStatus = new HashMap<>();
        
        try {
            // 각 리소스의 간단한 상태만 체크
            List<EC2InfoDto> ec2Instances = awsResourceService.getEC2Info();
            ALBInfoDto alb = awsResourceService.getALBInfo();
            RDSInfoDto rds = awsResourceService.getRDSInfo();
            S3InfoDto s3 = awsResourceService.getS3Info();
            
            healthStatus.put("status", "UP");
            healthStatus.put("timestamp", LocalDateTime.now());
            
            Map<String, Object> components = new HashMap<>();
            components.put("ec2", Map.of(
                "status", ec2Instances.isEmpty() ? "DOWN" : "UP",
                "count", ec2Instances.size(),
                "healthy", ec2Instances.stream().mapToInt(ec2 -> 
                    "healthy".equals(ec2.getHealthStatus()) ? 1 : 0).sum()
            ));
            
            components.put("alb", Map.of(
                "status", alb != null ? "UP" : "DOWN",
                "dns", alb != null ? alb.getDnsName() : "N/A"
            ));
            
            components.put("rds", Map.of(
                "status", rds != null ? "UP" : "DOWN",
                "endpoint", rds != null ? rds.getEndpoint() : "N/A"
            ));
            
            components.put("s3", Map.of(
                "status", s3 != null ? "UP" : "DOWN",
                "bucket", s3 != null ? s3.getBucketName() : "N/A"
            ));
            
            healthStatus.put("components", components);
            
            return ResponseEntity.ok(healthStatus);
            
        } catch (Exception e) {
            log.error("리소스 헬스체크 실패", e);
            
            healthStatus.put("status", "DOWN");
            healthStatus.put("error", e.getMessage());
            healthStatus.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(healthStatus);
        }
    }

    /**
     * 리소스 배포 진행 상태 시뮬레이션 (데모용)
     */
    @GetMapping("/deployment-progress")
    public ResponseEntity<Map<String, Object>> getDeploymentProgress() {
        Map<String, Object> progress = new HashMap<>();
        
        // 시간 기반으로 배포 단계 시뮬레이션
        long currentTime = System.currentTimeMillis();
        long startTime = currentTime - (5 * 60 * 1000); // 5분 전부터 시작했다고 가정
        long elapsed = currentTime - startTime;
        
        String[] steps = {
            "VPC 생성", "서브넷 구성", "보안 그룹 설정", 
            "EC2 인스턴스 시작", "ALB 설정", "RDS 생성", 
            "S3 버킷 설정", "CloudFront 배포", "애플리케이션 배포"
        };
        
        int currentStep = Math.min((int)(elapsed / 30000), steps.length - 1); // 30초마다 다음 단계
        
        progress.put("totalSteps", steps.length);
        progress.put("currentStep", currentStep + 1);
        progress.put("currentStepName", steps[currentStep]);
        progress.put("progress", Math.min(100, (currentStep + 1) * 100 / steps.length));
        progress.put("status", currentStep >= steps.length - 1 ? "completed" : "in-progress");
        progress.put("estimatedTimeRemaining", Math.max(0, (steps.length - currentStep - 1) * 30));
        
        return ResponseEntity.ok(progress);
    }
}