# EC2 2대 생성
resource "aws_instance" "ec2-1" {

  ami = "ami-0ea4d4b8dc1e46212"  # Amazon Linux 2 최신
  instance_type = "t3.micro"

  subnet_id     = aws_subnet.pri-sub-was[0].id

  vpc_security_group_ids = [ aws_security_group.sg-was.id ]

  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  # SSM Agent 설치 및 Java 설치
  # User Data 변경: dnf → yum
  user_data_base64 = base64encode(<<-EOF
  #!/bin/bash
  yum update -y
  yum install -y amazon-ssm-agent
  systemctl enable amazon-ssm-agent
  systemctl start amazon-ssm-agent
  yum install -y java-17-amazon-corretto

  # ec2-user 홈 디렉토리 생성
  mkdir -p /home/ec2-user
  chown ec2-user:ec2-user /home/ec2-user
  chmod 755 /home/ec2-user

  # Ansible 임시 디렉토리도 미리 생성
  mkdir -p /home/ec2-user/.ansible
  chown ec2-user:ec2-user /home/ec2-user/.ansible
  chmod 755 /home/ec2-user/.ansible
  EOF
  )

  tags = {
    Name = "was-instance-1"
    Version = "v2" 
    
  }
}

# EC2 2대 생성
resource "aws_instance" "ec2-2" {

  ami = "ami-0ea4d4b8dc1e46212"  # Amazon Linux 2 최신
  instance_type = "t3.micro"

  subnet_id     = aws_subnet.pri-sub-was[1].id

  vpc_security_group_ids = [ aws_security_group.sg-was.id ]

  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  # SSM Agent 설치 및 Java 설치
  # User Data 변경: dnf → yum
  user_data_base64 = base64encode(<<-EOF
  #!/bin/bash
  yum update -y
  yum install -y amazon-ssm-agent
  systemctl enable amazon-ssm-agent
  systemctl start amazon-ssm-agent
  yum install -y java-17-amazon-corretto

  # ec2-user 홈 디렉토리 생성
  mkdir -p /home/ec2-user
  chown ec2-user:ec2-user /home/ec2-user
  chmod 755 /home/ec2-user

  # Ansible 임시 디렉토리도 미리 생성
  mkdir -p /home/ec2-user/.ansible
  chown ec2-user:ec2-user /home/ec2-user/.ansible
  chmod 755 /home/ec2-user/.ansible
  EOF
  )

  tags = {
    Name = "was-instance-2"
    Version = "v2" 
  }
}


