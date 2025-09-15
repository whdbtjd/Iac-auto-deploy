# vpc
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "Iac-vpc"
  }
}

# 다중 AZ사용을 위한 data
data "aws_availability_zones" "az" {
  state = "available"
}

# 퍼블릭 서브넷(WEB)
resource "aws_subnet" "pub-sub" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet("10.0.0.0/16", 8, count.index) # 10.0.0.0/24, 10.0.1.0/24
  availability_zone = data.aws_availability_zones.az.names[count.index]

  tags = {
    Name = "pub-sub-${count.index + 1}"
  }
}

# 프라이빗 서브넷(WAS)
resource "aws_subnet" "pri-sub-was" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet("10.0.0.0/16", 8, count.index + 10) # 10.0.10.0/24, 10.0.11.0/24
  availability_zone = data.aws_availability_zones.az.names[count.index]

  tags = {
    Name = "pri-sub-was-${count.index + 1}"
  }
}

# 프라이빗 서브넷(DB)
resource "aws_subnet" "pri-sub-db" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet("10.0.0.0/16", 8, count.index + 20) # 10.0.20.0/24, 10.0.21.0/24
  availability_zone = data.aws_availability_zones.az.names[count.index]

  tags = {
    Name = "pri-sub-db-${count.index + 1}"
  }
}

# 인터넷게이트웨이
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "main"
  }
}

# 고정ip (NAT용)
resource "aws_eip" "eip" {
  count = 2

  tags = {
    Name = "nat-main-eip-${count.index + 1}"
  }
}

# nat
resource "aws_nat_gateway" "nat" {
  count         = 2
  allocation_id = aws_eip.eip[count.index].id
  subnet_id     = aws_subnet.pub-sub[count.index].id

  tags = {
    Name = "nat-main-${count.index + 1}"
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
  count  = 2
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat[count.index].id
  }

  tags = {
    Name = "pri-rt-${count.index + 1}"
  }
}  

# 퍼블릭 서브넷용 라우팅 테이블 연결
resource "aws_route_table_association" "pub-associate" {
  count          = length(aws_subnet.pub-sub)
  subnet_id      = aws_subnet.pub-sub[count.index].id
  route_table_id = aws_route_table.pub-rt.id
}

# 프라이빗 서브넷용 라우팅 테이블 연결(WAS)
resource "aws_route_table_association" "pri-associate-was" {
  count          = length(aws_subnet.pri-sub-was)
  subnet_id      = aws_subnet.pri-sub-was[count.index].id
  route_table_id = aws_route_table.pri-rt[count.index].id
}

# ALB
resource "aws_lb" "alb" {
  name               = "alb-web"
  internal           = false    # vpc 외부에서 접근 허용 여부
  load_balancer_type = "application"
  security_groups    = [aws_security_group.sg-alb.id]
  subnets            = aws_subnet.pub-sub[*].id

  tags = {
    Name = "alb-web"
  }
}

# ALB 타겟그룹 생성
resource "aws_lb_target_group" "alb-tg" {
  name       = "alb-tg"
  port       = 8080
  protocol   = "HTTP"
  vpc_id     = aws_vpc.main.id
}
