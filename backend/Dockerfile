# Node.js 18 이미지 사용
FROM node:18

# 컨테이너 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# npm 패키지 설치
RUN npm install


RUN npx prisma generate
RUN npx prisma migrate deploy


# 전체 소스 복사
COPY . .

# 컨테이너에서 열 포트
EXPOSE 3000

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
CMD ["/app/entrypoint.sh"]