package com.example.iac_sample_app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cloudfront.CloudFrontClient;
import software.amazon.awssdk.services.ec2.Ec2Client;
import software.amazon.awssdk.services.elasticloadbalancingv2.ElasticLoadBalancingV2Client;
import software.amazon.awssdk.services.rds.RdsClient;
import software.amazon.awssdk.services.s3.S3Client;

/**
 * AWS SDK 클라이언트 설정
 */
@Configuration
public class AwsConfig {

    private static final Region AWS_REGION = Region.AP_NORTHEAST_2; // Seoul

    @Bean
    public Ec2Client ec2Client() {
        return Ec2Client.builder()
                .region(AWS_REGION)
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    @Bean
    public ElasticLoadBalancingV2Client elasticLoadBalancingV2Client() {
        return ElasticLoadBalancingV2Client.builder()
                .region(AWS_REGION)
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    @Bean
    public RdsClient rdsClient() {
        return RdsClient.builder()
                .region(AWS_REGION)
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(AWS_REGION)
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    @Bean
    public CloudFrontClient cloudFrontClient() {
        // CloudFront는 글로벌 서비스이므로 US_EAST_1 리전 사용
        return CloudFrontClient.builder()
                .region(Region.US_EAST_1)
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }
}
