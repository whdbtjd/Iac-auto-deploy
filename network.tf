resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "Iac-vpc"
  }
}

resource "aws_subnet" "pb-sub" {
  vpc_id      = aws_vpc.main.id
  cidr_block  = "10.0.1.0/24"

  tags = {
    Name = "pb-sub"
  }
}

resource "aws_subnet" "pri-sub" {
  vpc_id      = aws_vpc.main.id
  cidr_block  = "10.0.11.0/24"

  tags = {
    Name = "pri-sub"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "main"
  }
}

resource "aws_eip" "eip" {
  tags = {
    Name = "nat-main-eip"
  }
}
