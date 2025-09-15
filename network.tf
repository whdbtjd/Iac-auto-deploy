# 다중 AZ사용을 위한 data
data "aws_availability_zones" "az" {
  state = "available"
}

# vpc
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "Iac-vpc"
  }
}

# 퍼블릭 서브넷(WEB)
resource "aws_subnet" "pub-sub" {
  vpc_id      = aws_vpc.main.id
  cidr_block  = "10.0.1.0/24"

  tags = {
    Name = "pb-sub"
  }
}

# 프라이빗 서브넷(WAS)
resource "aws_subnet" "pri-sub-was" {
  vpc_id      = aws_vpc.main.id
  cidr_block  = "10.0.11.0/24"

  tags = {
    Name = "pri-sub-was"
  }
}

# 프라이빗 서브넷(DB)
resource "aws_subnet" "pri-sub-db" {
  vpc_id      = aws_vpc.main.id
  cidr_block  = "10.0.12.0/24"

  tags = {
    Name = "pri-sub-db"
  }
}

# 인터넷게이트웨이
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "main"
  }
}

# 고정ip
resource "aws_eip" "eip" {
  tags = {
    Name = "nat-main-eip"
  }
}

# nat
resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.eip.id
  subnet_id     = aws_subnet.pub-sub.id

  tags = {
    Name = "nat-main"
  }
}

# 퍼블릭 서브넷용 라우팅 테이블
resource "aws_route_table" "pub-rt" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "pub-rt"
  }
}

# 프라이빗 서브넷용 라우팅 테이블(WAS)
resource "aws_route_table" "pri-rt" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_nat_gateway.nat.id
  }

  tags = {
    Name = "pri-rt"
  }
}

# 퍼블릭 서브넷용 라우팅 테이블 연결
resource "aws_route_table_association" "pub-associate" {
  subnet_id      = aws_subnet.pub-sub.id
  route_table_id = aws_route_table.pub-rt.id
}

# 프라이빗 서브넷용 라우팅 테이블 연결
resource "aws_route_table_association" "pri-associate" {
  subnet_id      = aws_subnet.pri-sub-was.id
  route_table_id = aws_route_table.pri-rt.id
}

