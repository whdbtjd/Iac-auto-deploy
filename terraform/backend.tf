

# Terraform Backend
terraform {
  backend "s3" {
    bucket         = "my-tfstate-bucket-test-1234511"
    key            = "global/s3/terraform.tfstate"
    region         = "ap-northeast-2"
    encrypt        = true
  }
}
