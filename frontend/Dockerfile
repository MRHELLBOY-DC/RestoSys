FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock ./
# Use regular yarn install in development images to avoid frozen-lockfile failures
# during iterative development (lockfile may be updated on the host). For CI/production
# prefer --frozen-lockfile.
RUN yarn install

COPY . .

EXPOSE 5173

CMD ["yarn", "dev", "--host", "0.0.0.0"]
