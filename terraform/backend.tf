

# Terraform Backend
terraform {
  backend "s3" {
    bucket         = "terraform-git-whdbtjd"
    key            = "cicd/s3/terraform.tfstate"
    region         = "ap-northeast-2"
    encrypt        = true
  }
}
