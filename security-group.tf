# ALB용 보안 그룹
resource "aws_security_group" "sg-alb" {
  name      = "alb"
  vpc_id    = aws_vpc.main.id

  tags      = {
    Name = "sg-alb"
  }

  ingress {
    description   = "Allow HTTP"
    from_port     = 80
    to_port       = 80
    protocol      = "tcp"
    cidr_blocks   = ["0.0.0.0/0"]
  }

  ingress {
    description   = "Allow HTTPS"
    from_port     = 443
    to_port       = 443
    protocol      = "tcp"
    cidr_blocks   = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
