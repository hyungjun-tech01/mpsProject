# mpsProject
MPS

## Getting Started
node version : 22.12.0   
npm install -g pnpm@latest-10  

패키지 에 포함된 모든 모듈 설치   
pnpm install  

First, run the development server:

```bash
pnpm run dev
```
## https 적용  
PowerShell 을 관리자 권한으로 실행하여 Chocolatey를 설치 

```bash
# Get-ExecutionPolicy 실행
$ Get-ExecutionPolicy

# Restricted라면 AllSigned나 Bypass로 설정
# ExcutionPolicy를 AllSigned로 설정
$ Set-ExecutionPolicy AllSigned

# ExcutionPolicy를 Bypass로 설정
$ Set-ExecutionPolicy Bypass -Scope Process

# 설치!
$ Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 확인
$ choco
```
mkcert 설치, PowerShell에서 실행   
```bash
윈도우
choco install mkcert
```

인증서 생성, 폴더를 하나 만들고 실행, mkcert locahost를 하면 인증서 파일이 생성됨.         
```bash
$ mkcert -install
$ mkcert localhost
```
localhost-key.pem, localhost.pem 파일들을 실제 개발하는 폴더의 루트 경로로 옮김   



