
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
    bucket         = "my-tfstate-bucket-test-1234511"
    key            = "global/s3/terraform.tfstate"
    region         = "ap-northeast-2"
    dynamodb_table = "terraform-locks-${random_id.tf_state_suffix.hex}"
    encrypt        = true
  }
}
