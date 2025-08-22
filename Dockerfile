# Imagem base
FROM node:18

# Diretório dentro do container
WORKDIR /app

# Copiar dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

RUN pnmp install

# Copiar o restante do projeto
COPY . .

# Construir (se for frontend) ou apenas rodar
# RUN npm run build

# Expor a porta (exemplo: 3000)
EXPOSE 3000

# Comando de inicialização
CMD ["pnpm", "run", "dev"]
