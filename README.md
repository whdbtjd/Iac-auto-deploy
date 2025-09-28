# 🚀 Iac를 활용한 배포 자동화 시스템

<br><br>

## 1. 팀 이름: DevOpser

본 프로젝트의 성격이 개발보단 데브옵스에 가까워, 팀 이름을 DevOpser로 선정하였습니다.

<br><br><br>

## 2. 📋 작품 개요

<img width="1023" height="194" alt="리드미용 워크플로우 drawio" src="https://github.com/user-attachments/assets/dfadfe90-20dc-4707-8940-e8f34e196f5f" />

<br>

* Terraform과 Ansible을 활용한 자동화된 CI/CD 파이프라인 구축
* 레포지토리 포크 후 GitHub Secrets에 환경변수와 AWS 자격증명만 등록하면 즉시 테스트 가능
* 코드 푸시만으로 인프라 생성부터 애플리케이션 배포까지 수행 가능
* 프론트엔드와 백엔드를 동시에 지원하는 풀스택 배포 환경 제공

<br>

### 💡 시스템 사용 가이드

#### 필수 환경변수 설정
프로젝트 사용을 위해 GitHub Secrets에 다음 환경변수를 반드시 설정해야 합니다:

```
AWS_ACCESS_KEY_ID: AWS 액세스 키 ID
AWS_SECRET_ACCESS_KEY: AWS 시크릿 액세스 키
DB_USERNAME: RDS MySQL 사용자명
DB_PASSWORD: RDS MySQL 비밀번호
```

#### 자동 배포 방식
* **백엔드 자동 배포**: `backend/` 디렉토리 내 Spring Boot 코드를 수정 후 푸시하면 JAR 빌드 및 EC2 배포 자동 실행
* **프론트엔드 자동 배포**: `frontend/` 디렉토리 내 React/Vue 코드를 수정 후 푸시하면 빌드 후 S3 + CloudFront 자동 배포
* **인프라 변경**: `terraform/` 또는 `ansible/` 디렉토리 수정 시 해당 인프라 구성요소만 선택적 재배포
* **조건부 배포**: GitHub Actions가 변경된 디렉토리를 자동 감지하여 필요한 부분만 배포로 시간과 비용 최적화

**추가 환경변수가 필요한 경우** 하단의 **📌 추가 환경변수 설정 가이드** 참조

<br>

<details>
<summary><h3><b>📌 추가 환경변수 설정 가이드</b></h3></summary>

<br>

### 📝 개요

기본 제공되는 환경변수(`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `DB_USERNAME`, `DB_PASSWORD`) 외에 추가적인 환경변수가 필요한 경우 다음 단계를 따라 설정할 수 있습니다.

<br>

### 🔧 설정 단계

#### 1단계: GitHub Secrets 등록

```
Repository → Settings → Secrets and variables → Actions → New repository secret
```

**예시:**
* Name: `MY_API_KEY`
* Secret: `your-api-key-value`

<br>

#### 2단계: GitHub Actions 워크플로우 수정

`.github/workflows/deploy.yml` 파일의 **deploy-backend** job에서 Ansible 실행 부분에 환경변수를 추가합니다.

```yaml
- name: Deploy configuration via Ansible
  working-directory: ./ansible
  run: |
    ansible-playbook -i inventory.ini playbooks/db-config.yaml \
      -e "rds_endpoint=${{ needs.deploy-infrastructure.outputs.db-endpoint }}" \
      -e "db_username=${{ secrets.DB_USERNAME }}" \
      -e "db_password=${{ secrets.DB_PASSWORD }}" \
      -e "my_api_key=${{ secrets.MY_API_KEY }}" \          # 추가
      -e "custom_endpoint=${{ secrets.CUSTOM_ENDPOINT }}" \ # 추가
      -v
```

<br>

#### 3단계: Ansible 템플릿 수정

`ansible/templates/application.yaml.j2` 파일에 새로운 환경변수를 추가합니다.

```yaml
custom:
  api-key: {{ my_api_key | default('') }}
  endpoint: {{ custom_endpoint | default('') }}

external:
  services:
    payment-api: {{ my_api_key | default('') }}
    notification-url: {{ custom_endpoint | default('') }}
```

</details>

<br><br><br>

## 3. 🏗️ 작품 구성

<br>

* **Frontend**: React/Vue 기반 정적 웹사이트 (S3 + CloudFront 자동 배포)

* **Backend**: Spring Boot 기반 API 서버 (EC2 + ALB + RDS 자동 구축)

<br>

* **Terraform**
  * 파일 구성:
    * `provider.tf`: AWS 프로바이더 설정 (ap-northeast-2 리전)
    * `backend.tf`: Terraform State 파일 S3 원격 저장소 구성
    * `variable.tf`: 데이터베이스 사용자명/패스워드 등 입력 변수 정의
    * `network.tf`: VPC, 서브넷(Public/Private-WAS/Private-DB), IGW, NAT Gateway, 라우팅 테이블
    * `security-group.tf`: ALB/WAS/DB용 보안 그룹 및 인바운드/아웃바운드 규칙
    * `ec2.tf`: Multi-AZ EC2 인스턴스, User Data를 통한 SSM Agent 및 Java 설치
    * `alb.tf`: Application Load Balancer, 타겟 그룹, 리스너, EC2 연결
    * `rds.tf`: MySQL RDS 인스턴스(Multi-AZ), DB 서브넷 그룹
    * `s3.tf`: 웹 호스팅용 S3 버킷, SSM 로그용 S3 버킷, 정적 웹사이트 설정
    * `cloudfront.tf`: CloudFront Distribution, Origin Access Control, API/정적파일 라우팅
    * `waf.tf`: CloudFront용 WAF 웹 ACL 및 Rate Limiting 규칙
    * `iam.tf`: EC2용 SSM 접속 IAM 역할 및 인스턴스 프로파일
    * `vpc-endpoints.tf`: SSM/EC2Messages용 VPC 엔드포인트 (Private 서브넷 접속용)
    * `output.tf`: ALB DNS, CloudFront URL, RDS 엔드포인트 등 배포 결과 출력

<br>

* **Ansible**
  * 플레이북 구성:
    * `setup-service.yaml`: 서버 초기 설정, MySQL 클라이언트 설치, systemd 서비스 등록
    * `db-config.yaml`: RDS 연결 설정, application.yml 템플릿 배포
    * `jar-deploy.yaml`: Spring Boot JAR 파일 배포 및 서비스 재시작
    * `health-check.yaml`: 애플리케이션 헬스 체크 및 상태 확인
  * 연결 방식: AWS SSM Session Manager를 통한 에이전트리스 서버 접속
  * 템플릿: `application.yaml.j2` - Jinja2 기반 Spring Boot 설정 파일 동적 생성

<br>

* **CI/CD Pipeline (GitHub Actions)**
  * 변경사항 감지: `paths-filter`를 통한 프론트엔드/백엔드/인프라 변경 분석
  * 조건부 배포:
    * Frontend 변경 시 → S3 + CloudFront만 대상으로 배포
    * Backend 변경 시 → EC2 + ALB + RDS 인프라만 배포
    * Infrastructure 변경 시 → 전체 인프라 재구성
  * 작업 단계:
    1. `detect-changes`: 코드 변경사항 분석
    2. `deploy-infrastructure`: Terraform을 통한 AWS 리소스 프로비저닝
    3. `setup-servers`: Ansible을 통한 서버 환경 구성
    4. `deploy-backend`: JAR 빌드 및 배포
    5. `deploy-frontend`: React/Vue 빌드 및 S3 동기화
    6. `deployment-complete`: 배포 결과 요약 및 서비스 URL 출력

<br>

* **Security**
  * AWS SSM Session Manager 기반 안전한 서버 접속 (SSH 키 관리 불필요)
  * CloudFront 기반 HTTPS 통신 적용 및 Origin Access Control 구성
  * WAF를 통한 Rate Limiting 및 접근 제어 정책 적용

<br><br><br>

## 4. 🛠️ 이용 기술

<br>

* **CI/CD**: GitHub Actions
* **Infrastructure as Code**: Terraform, Ansible
* **Cloud Service**: AWS (VPC, EC2, RDS, ALB, S3, CloudFront, SSM)
* **Security**: AWS (IAM Roles, Security Groups, VPC Endpoints)
* **Architecture Tool**: diagrams.net
* **Dev Tools**: Spring Boot, React/Vue

<br><br><br>

## 5. 🏛️ 아키텍처

<br>

### 전체 아키텍처

<img width="1931" height="941" alt="전체 아키텍처" src="https://github.com/user-attachments/assets/9cf14b51-849e-4d41-a725-e4d2156a59fb" />

<br><br>

### 프론트엔드 세부 아키텍처

<img width="1205" height="381" alt="프론트 아키 drawio (1)" src="https://github.com/user-attachments/assets/643b977e-d6d6-4298-b7b7-8be7f726c7e7" />

<br><br><br>

## 6. ⭐ 개발하는 작품의 특징

<br>

* **조건부 배포**: 프론트/백엔드 코드 변경에 따라 서로 다른 배포 파이프라인 동작

* **코드 기반 인프라 관리**: 모든 인프라 설정을 코드로 관리하여 일관성 보장

* **모듈화 설계**: Terraform과 Ansible을 독립적으로 구성 및 실행

* **아키텍처**: 3-Tier 구조(Web – WAS – DB) 적용으로 확장성과 유지보수성 확보

* **네트워크**: VPC 기반 프라이빗 서브넷 구성으로 보안성 강화

* **보안**: SSM Session Manager로 SSH 키 관리 불필요, CloudFront HTTPS 및 Origin 설정 적용

* **인프라 관리**: Terraform State를 통한 인프라 변경사항 추적 및 이력 관리

<br><br><br>

## 7. 📊 대시보드 구성

<br>

애플리케이션 배포 상태와 인프라 리소스 정보를 실시간으로 확인할 수 있는 모니터링 웹사이트를 시연용으로 구현하였습니다. Terraform outputs을 기반으로 AWS 리소스 상태를 시각화하여 배포가 정상적으로 완료되었는지 비교 검증할 수 있습니다.

<br>

| 메인 대시보드 | 상세 리소스 정보 |
|:---:|:---:|
| <img width="890" height="483" alt="메인 대시보드" src="https://github.com/user-attachments/assets/5d848ea0-718a-40ed-aa83-9e5b1d2016df" /> | <img width="640" height="282" alt="상세 리소스 정보" src="https://github.com/user-attachments/assets/47c2eef1-6c76-424a-a7e6-5c63fd3bc76e" /> |
| **인프라 전체 현황 한눈에 보기**<br>• EC2, RDS, ALB, S3, CloudFront 상태<br>• 배포 성공/실패 현황<br>• 서비스 URL 접근 링크 | **개별 리소스 세부 정보**<br>• 각 리소스의 상세 설정값<br>• 네트워크 구성 정보<br>• 보안 그룹 및 엔드포인트 현황 |

<br><br><br>

## 8. 💻 개발 방법

<br>

### 오픈 소스 및 라이브러리 활용

* **Terraform**: AWS 인프라 리소스 자동 프로비저닝
* **Ansible**: 서버 초기 설정 및 애플리케이션 배포 자동화
* **Spring Boot / React·Vue**: 백엔드 및 프론트엔드 개발 프레임워크
* **GitHub Actions**: CI/CD 파이프라인 자동화
* **AWS 관리 서비스**(IAM, Security Groups, VPC Endpoints, SSM 등): 보안 및 운영 관리

<br>

### 자체 개발 부분

* **조건부 파이프라인 로직 설계** (프론트/백 코드 변경에 따른 분기)
* **포크 기반 배포 템플릿 구현** (Secrets 등록 후 즉시 테스트 가능)
* **Terraform과 Ansible의 모듈화 설계** 및 독립 실행 구조
* **HTTPS 통신, SSM 기반 접속** 등 보안 로직 적용

<br><br><br>

## 9. 📅 개발 일정

<br>

### 1~2주차 (8월 말 ~ 9월 초): 기반 인프라 구축

* Terraform 기본 모듈 개발 (VPC, 서브넷, 보안그룹)
* AWS 기본 리소스 프로비저닝 (EC2, RDS, ALB)
* Terraform State 관리 및 Backend 구성

<br>

### 3주차 (9월 초): 고도화 인프라 및 보안

* S3, CloudFront, WAF 설정
* IAM 역할 및 VPC 엔드포인트 구성
* SSM Session Manager 연동 및 테스트

<br>

### 4주차 (9월 중순): Ansible 자동화 및 CI/CD 파이프라인

* Ansible 플레이북 개발 (서버 설정, 애플리케이션 배포)
* SSM 기반 서버 접속 및 배포 로직 구현
* GitHub Actions 워크플로우 설계
* 조건부 배포 로직 구현 (프론트/백엔드 변경 감지)

<br>

### 5주차 (9월 중순 ~ 9월 말): 모니터링용 웹 개발

* Spring Boot 백엔드 API 개발 (비즈니스 로직 + 헬스체크)
* React/Vue 프론트엔드 개발
* Terraform outputs 기반 리소스 상태 대시보드 개발

<br>

### 6주차 (9월 말): 통합 테스트 및 마무리

* 전체 파이프라인 통합 테스트 (배포 + 모니터링)
* 포크 기반 배포 템플릿 완성 및 검증
* README 및 기술 문서 작성
* 아키텍처 다이어그램 완성 및 최종 점검

<br><br><br>

## 10. 👨‍💻 참여 인력

<br>

**조유성** – DevOps Engineer & Full-Stack Developer

* 인프라 설계/구축, CI/CD 파이프라인 개발
* 백엔드/프론트엔드 애플리케이션 개발
* AWS 보안 및 네트워크 아키텍처 설계
