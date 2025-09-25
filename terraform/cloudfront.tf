# CloudFront Origin Access Control 생성
resource "aws_cloudfront_origin_access_control" "web" {
  name                         = "web-oac"
  description                  = "OAC for S3"
  origin_access_control_origin_type   = "s3"         # 오리진 타입 지정
  signing_behavior             = "always"     # 모든 요청에 서명 적용
  signing_protocol             = "sigv4" 
}

# CloudFront Distribution 생성
resource "aws_cloudfront_distribution" "web" {
  enabled = true
  default_root_object = "index.html"
  web_acl_id = aws_wafv2_web_acl.cloudfront_waf.arn 
  
  # 기존 S3 Origin
  origin {
    domain_name              = aws_s3_bucket.s3-web.bucket_regional_domain_name # s3버킷 도메인
    origin_id                = "s3-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.web.id
  }

  # 새로 추가: ALB Origin
  origin {
    domain_name = aws_lb.alb.dns_name
    origin_id   = "alb-origin"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # API 경로를 ALB로 라우팅 (우선순위 높음)
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "alb-origin"
    
    forwarded_values {
      query_string = true
      headers      = ["*"]
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  # 기본 캐시 동작 (정적 파일은 S3로)
  default_cache_behavior {
    target_origin_id        = "s3-origin"
    viewer_protocol_policy  = "redirect-to-https"
    allowed_methods         = ["GET", "HEAD"]
    cached_methods          = ["GET","HEAD"]
    
    forwarded_values {
      query_string = false  # 쿼리 파라미터 전달 안함
      cookies {
        forward = "none"    # 쿠키 전달 안함
      }
    }
  }

  # SSL/TLS 인증서 설정
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"  # 지역 제한 없음
    }
  }
}