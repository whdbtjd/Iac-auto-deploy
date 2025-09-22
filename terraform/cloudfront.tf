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
  
  # 오리진 설정
  origin {
    domain_name              = aws_s3_bucket.s3-web.bucket_domain_name # s3버킷 도메인
    origin_id                = "s3-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.web.id
  }

  # 기본 캐시 동작
  default_cache_behavior {
    target_origin_id        = "s3-origin"
    viewer_protocol_policy  = "redirect-to-https"
    allowed_methods         = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
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
