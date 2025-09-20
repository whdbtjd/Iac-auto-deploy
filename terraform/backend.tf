# 버킷 이름 중복 방지용 랜덤 문자열
resource "random_id" "tf_state_suffix" {
  byte_length = 4
}

# S3 버킷 (Terraform state 저장)
resource "aws_s3_bucket" "tf_state" {
  bucket = "my-tfstate-bucket-${random_id.tf_state_suffix.hex}"

  tags = {
    Name = "terraform-state"
  }
}

# DynamoDB 테이블 (State Lock)
resource "aws_dynamodb_table" "tf_locks" {
  name         = "terraform-locks-${random_id.tf_state_suffix.hex}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name = "terraform-locks"
  }
}

# Terraform Backend
terraform {
  backend "s3" {
    bucket         = "my-tfstate-bucket-${random_id.tf_state_suffix.hex}"
    key            = "global/s3/terraform.tfstate"
    region         = "ap-northeast-2"
    dynamodb_table = "terraform-locks-${random_id.tf_state_suffix.hex}"
    encrypt        = true
  }
}
