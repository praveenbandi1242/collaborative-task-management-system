FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_URL
RUN echo "Building frontend with API URL: ${VITE_API_URL}"
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

EXPOSE 10000

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "10000"]