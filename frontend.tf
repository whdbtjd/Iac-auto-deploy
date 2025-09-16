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
