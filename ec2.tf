# EC2 2대 생성
resource "aws_instance" "ec2-1" {

  ami           = "ami-0b0231ef26fcbe13e"
  instance_type = "t3.micro"

  subnet_id     = aws_subnet.pri-sub-was[0].id

  vpc_security_group_ids = [ aws_security_group.sg-was.id ]

  tags = {
    Name = "was-instance-1"
  }
}

# EC2 2대 생성
resource "aws_instance" "ec2-2" {

  ami           = "ami-0b0231ef26fcbe13e"
  instance_type = "t3.micro"

  subnet_id     = aws_subnet.pri-sub-was[1].id

  vpc_security_group_ids = [ aws_security_group.sg-was.id ]

  tags = {
    Name = "was-instance-2"
  }
}


