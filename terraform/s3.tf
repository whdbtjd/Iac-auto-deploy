# 버킷 이름 중복 방지용 랜덤 문자열
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# S3 버킷 생성
resource "aws_s3_bucket" "s3-web" {
  bucket = "frontend-web-${random_id.bucket_suffix.hex}"
  
  tags = {
    Name = "frontend-web"
  }
}

# 정적 웹사이트 호스팅 설정
resource "aws_s3_bucket_website_configuration" "s3-web-config" {
  bucket = aws_s3_bucket.s3-web.id
  
  index_document {
    suffix = "index.html"
  }
  
  error_document {
    key = "index.html"
  }
}

# S3 버킷 정책
resource "aws_s3_bucket_policy" "web" {
  bucket = aws_s3_bucket.s3-web.id
  
  depends_on = [aws_cloudfront_distribution.web]  # 명시적 종속성
  
  policy = jsonencode({
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.s3-web.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.web.arn
          }
        }
      }
    ]
  })
}

# CloudFront 사용 시 퍼블릭 액세스는 차단
resource "aws_s3_bucket_public_access_block" "s3-web-unblock" {
  bucket = aws_s3_bucket.s3-web.id

  block_public_acls       = true   # CloudFront 사용 시 차단
  block_public_policy     = false  # CloudFront 정책 허용
  ignore_public_acls      = true   # CloudFront 사용 시 차단
  restrict_public_buckets = false  # CloudFront 정책 허용
}
