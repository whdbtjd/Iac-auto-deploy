package com.example.iac_sample_app.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * RDS 데이터베이스 정보 DTO
 */
@Data
@Builder
public class RDSInfoDto {
    
    /**
     * DB 인스턴스 식별자
     */
    private String identifier;
    
    /**
     * 엔드포인트 주소
     */
    private String endpoint;
    
    /**
     * 포트
     */
    private Integer port;
    
    /**
     * 데이터베이스 엔진 (mysql, postgresql 등)
     */
    private String engine;
    
    /**
     * 엔진 버전
     */
    private String engineVersion;
    
    /**
     * 인스턴스 클래스 (db.t3.micro 등)
     */
    private String instanceClass;
    
    /**
     * DB 상태 (available, backing-up, creating 등)
     */
    private String status;
    
    /**
     * Multi-AZ 배포 여부
     */
    private Boolean multiAZ;
    
    /**
     * 가용 영역
     */
    private String availabilityZone;
    
    /**
     * 생성 시간
     */
    private LocalDateTime createdTime;
    
    /**
     * 스토리지 타입 (gp2, gp3, io1 등)
     */
    private String storageType;
    
    /**
     * 할당된 스토리지 크기 (GB)
     */
    private Integer allocatedStorage;
    
    /**
     * 사용 가능한 상태인지 확인
     */
    public boolean isAvailable() {
        return "available".equalsIgnoreCase(status);
    }
    
    /**
     * 백업 중인지 확인
     */
    public boolean isBackingUp() {
        return "backing-up".equalsIgnoreCase(status);
    }
    
    /**
     * 생성 중인지 확인
     */
    public boolean isCreating() {
        return "creating".equalsIgnoreCase(status);
    }
    
    /**
     * 연결 문자열 생성
     */
    public String getConnectionString() {
        if (endpoint == null || port == null) return null;
        return String.format("jdbc:%s://%s:%d/", 
                engine != null ? engine : "mysql", 
                endpoint, 
                port);
    }
    
    /**
     * 실행 시간 (시간 단위)
     */
    public long getUptimeHours() {
        if (createdTime == null) return 0;
        return java.time.Duration.between(createdTime, LocalDateTime.now()).toHours();
    }
    
    /**
     * MySQL인지 확인
     */
    public boolean isMySQL() {
        return "mysql".equalsIgnoreCase(engine);
    }
    
    /**
     * PostgreSQL인지 확인
     */
    public boolean isPostgreSQL() {
        return "postgres".equalsIgnoreCase(engine) || "postgresql".equalsIgnoreCase(engine);
    }
}
