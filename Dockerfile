FROM node:18 AS build

WORKDIR /app

COPY package.json ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .

RUN pnpm run build

FROM node:18

WORKDIR /app

COPY --from=build /app /app

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
