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
