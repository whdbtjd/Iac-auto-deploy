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

# ALB 리스너 생성
resource "aws_lb_listener" "alb-listner" {
  load_balancer_arn = aws_lb.alb.arn
  port       = "80"
  protocol   = "HTTP"

  default_action{
    type              = "forward"
    target_group_arn  = aws_lb_target_group.alb-tg.arn
  }
}

# EC2 인스턴스들을 ALB 타겟 그룹에 연결
resource "aws_lb_target_group_attachment" "ec2-1" {
  target_group_arn = aws_lb_target_group.alb-tg.arn
  target_id        = aws_instance.ec2-1.id
  port             = 8080
}

resource "aws_lb_target_group_attachment" "ec2-2" {
  target_group_arn = aws_lb_target_group.alb-tg.arn
  target_id        = aws_instance.ec2-2.id
  port             = 8080
}
