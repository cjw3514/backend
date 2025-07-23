1. env 설정
2. npm install
3. docker exec -it backend sh 
npx prisma migrate deploy // 이미 존재하는 미그레이션 파일 적용
npx prisma migrate dev --name init // 새로운 미그레이션 파일을 생성해 적용

1. db에 sql문으로 직접 레코드 다루기
2. docker exec -it postgres sh
3. psql -U teamF -d teamFdb
그 다음 sql 문 실행 (모든 테이블 보기: /dt)