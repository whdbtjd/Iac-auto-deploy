# ALB DNS 출력 (백엔드 API 접속용)
output "alb_dns_name" {
  description = "Application Load Balancer DNS name for backend API"
  value       = aws_lb.alb.dns_name
}

# ALB 타겟 그룹 ARN 출력 (EC2 인스턴스 연결용)
output "alb_target_group_arn" {
  description = "ALB target group ARN"
  value       = aws_lb_target_group.alb-tg.arn
}

# CloudFront 도메인 출력 (프론트엔드 접속용)
output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name for frontend"
  value       = aws_cloudfront_distribution.web.domain_name
}

# CloudFront Distribution ID 출력
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.web.id
}

# S3 버킷 이름 출력 (GitHub Actions에서 파일 업로드용)
output "s3_bucket_name" {
  description = "S3 bucket name for frontend files"
  value       = aws_s3_bucket.s3-web.bucket
}

# RDS 엔드포인트 출력 (데이터베이스 연결용)
output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.rds.endpoint
}

# RDS 포트 출력
output "rds_port" {
  description = "RDS instance port"
  value       = aws_db_instance.rds.port
}

# 데이터베이스 이름 출력
output "database_name" {
  description = "Database name"
  value       = aws_db_instance.rds.db_name
}

# EC2 인스턴스들의 프라이빗 IP 출력 (Ansible 인벤토리용)
output "ec2_private_ips" {
  description = "EC2 instances private IP addresses"
  value       = [
    aws_instance.ec2-1.private_ip,
    aws_instance.ec2-2.private_ip
  ]
}

# EC2 인스턴스 ID들 출력
output "ec2_instance_ids" {
  description = "EC2 instance IDs"
  value       = [
    aws_instance.ec2-1.id,
    aws_instance.ec2-2.id
  ]
}
