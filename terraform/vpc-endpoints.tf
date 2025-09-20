# terraform/vpc-endpoints.tf (새 파일 생성)
resource "aws_vpc_endpoint" "ssm" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.ap-northeast-2.ssm"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.pri-sub-was[*].id
  security_group_ids  = [aws_security_group.sg-was.id]
  
  tags = {
    Name = "ssm-endpoint"
  }
}

resource "aws_vpc_endpoint" "ssm_messages" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.ap-northeast-2.ssmmessages"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.pri-sub-was[*].id
  security_group_ids  = [aws_security_group.sg-was.id]
  
  tags = {
    Name = "ssm-messages-endpoint"
  }
}

resource "aws_vpc_endpoint" "ec2_messages" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.ap-northeast-2.ec2messages"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.pri-sub-was[*].id
  security_group_ids  = [aws_security_group.sg-was.id]
  
  tags = {
    Name = "ec2-messages-endpoint"
  }
}
