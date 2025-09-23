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

# ssm 로그 저장용 버킷
output "ssm_bucket_name" {
  description = "S3 bucket name for SSM session logs"
  value       = aws_s3_bucket.ssm_logs.bucket
}

# =========================
# 백엔드 API용 추가 정보들
# =========================

# VPC 관련 정보
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "VPC CIDR block"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.pub-sub[*].id
}

output "private_subnet_ids_was" {
  description = "Private WAS subnet IDs"
  value       = aws_subnet.pri-sub-was[*].id
}

output "private_subnet_ids_db" {
  description = "Private DB subnet IDs"
  value       = aws_subnet.pri-sub-db[*].id
}

output "internet_gateway_id" {
  description = "Internet Gateway ID"
  value       = aws_internet_gateway.igw.id
}

output "nat_gateway_ids" {
  description = "NAT Gateway IDs"
  value       = aws_nat_gateway.nat-gw[*].id
}

# 보안 그룹 정보
output "security_group_alb_id" {
  description = "ALB Security Group ID"
  value       = aws_security_group.sg-alb.id
}

output "security_group_was_id" {
  description = "WAS Security Group ID"
  value       = aws_security_group.sg-was.id
}

output "security_group_db_id" {
  description = "DB Security Group ID"
  value       = aws_security_group.sg-db.id
}

# EC2 추가 정보
output "ec2_public_ips" {
  description = "EC2 instances public IP addresses (if available)"
  value       = [
    aws_instance.ec2-1.public_ip,
    aws_instance.ec2-2.public_ip
  ]
}

output "ec2_availability_zones" {
  description = "EC2 instances availability zones"
  value       = [
    aws_instance.ec2-1.availability_zone,
    aws_instance.ec2-2.availability_zone
  ]
}

output "ec2_instance_types" {
  description = "EC2 instance types"
  value       = [
    aws_instance.ec2-1.instance_type,
    aws_instance.ec2-2.instance_type
  ]
}

output "ec2_ami_id" {
  description = "AMI ID used for EC2 instances"
  value       = aws_instance.ec2-1.ami
}

# ALB 추가 정보
output "alb_arn" {
  description = "ALB ARN"
  value       = aws_lb.alb.arn
}

output "alb_availability_zones" {
  description = "ALB availability zones"
  value       = aws_lb.alb.subnets
}

output "alb_listener_arn" {
  description = "ALB listener ARN"
  value       = aws_lb_listener.alb-listner.arn
}

output "alb_target_group_name" {
  description = "ALB target group name"
  value       = aws_lb_target_group.alb-tg.name
}

# RDS 추가 정보
output "rds_instance_identifier" {
  description = "RDS instance identifier"
  value       = aws_db_instance.rds.identifier
}

output "rds_availability_zone" {
  description = "RDS availability zone"
  value       = aws_db_instance.rds.availability_zone
}

output "rds_multi_az" {
  description = "RDS Multi-AZ deployment"
  value       = aws_db_instance.rds.multi_az
}

output "rds_engine" {
  description = "RDS engine"
  value       = aws_db_instance.rds.engine
}

output "rds_engine_version" {
  description = "RDS engine version"
  value       = aws_db_instance.rds.engine_version
}

output "rds_instance_class" {
  description = "RDS instance class"
  value       = aws_db_instance.rds.instance_class
}

# S3 추가 정보
output "s3_bucket_region" {
  description = "S3 bucket region"
  value       = aws_s3_bucket.s3-web.region
}

output "s3_website_endpoint" {
  description = "S3 website endpoint"
  value       = aws_s3_bucket_website_configuration.s3-web-config.website_endpoint
}

# CloudFront 추가 정보
output "cloudfront_status" {
  description = "CloudFront distribution status"
  value       = aws_cloudfront_distribution.web.status
}