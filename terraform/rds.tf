# 서브넷 그룹 생성
resource "aws_db_subnet_group" "main" {
  name       = "main-db-subnet-group"
  subnet_ids = [
    aws_subnet.pri-sub-db[0].id,
    aws_subnet.pri-sub-db[1].id
  ]

  tags = {
    Name = "main-db-subnet-group"
  }
}

# Multi-AZ RDS생성
resource "aws_db_instance" "rds" {
  allocated_storage      = 10
  db_name                = "mydb"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.micro"
  username               = "admin"
  password               = "admin1234"
  skip_final_snapshot    = true
  
  multi_az               = true

  db_subnet_group_name   = aws_db_subnet_group.main.id

  vpc_security_group_ids = [ aws_security_group.sg-db.id ]

  tags = {
    Name = "rds-iac"
  }
}
