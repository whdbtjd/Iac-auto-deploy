# S3 버킷 (Terraform state 저장)
resource "aws_s3_bucket" "tf_state" {
  bucket = "my-tfstate-bucket"

  tags = {
    Name = "terraform-state"
  }
}

# DynamoDB 테이블 (State Lock)
resource "aws_dynamodb_table" "tf_locks" {
  name         = "terraform-locks"
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
    bucket         = "my-tfstate-bucket"
    key            = "global/s3/terraform.tfstate"
    region         = "ap-northeast-2"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
