FROM node:alpine
# RUN npm install -g yarn
WORKDIR /app
COPY package.json yarn.lock  ./
RUN npm install
COPY . .
EXPOSE 5000
EXPOSE 35729
ENTRYPOINT [ "yarn" ]
CMD [ "dev" ]
