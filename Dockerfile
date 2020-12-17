FROM node:11

#앱 디렉토리 생성
WORKDIR /usr/src/app

#앱 의존성 설치. - 가능한 경우 (npm5이상) package.json 과 package-lock.json을
# 모두 복사하기 위해 와일드 카드 사용.
COPY package*.json ./

RUN npm install

# 앱의 소스코드를 추가 (전체카피)
COPY . .

EXPOSE 3000

CMD [ "node", "index.js" ]

