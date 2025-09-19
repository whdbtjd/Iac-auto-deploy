# EC2 2대 생성
resource "aws_instance" "ec2-1" {

  ami           = "ami-0b0231ef26fcbe13e"
  instance_type = "t3.micro"

  subnet_id     = aws_subnet.pri-sub-was[0].id

  vpc_security_group_ids = [ aws_security_group.sg-was.id ]

  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

    # SSM Agent 설치 및 Java 설치
  user_data = base64encode(<<-EOF
    #!/bin/bash
    yum update -y
    yum install -y amazon-ssm-agent
    systemctl enable amazon-ssm-agent
    systemctl start amazon-ssm-agent
    yum install -y java-17-amazon-corretto
    EOF
  )

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

  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  # SSM Agent 설치 및 Java 설치
  user_data = base64encode(<<-EOF
    #!/bin/bash
    yum update -y
    yum install -y amazon-ssm-agent
    systemctl enable amazon-ssm-agent
    systemctl start amazon-ssm-agent
    yum install -y java-17-amazon-corretto
    EOF
  )

  tags = {
    Name = "was-instance-2"
  }
}


