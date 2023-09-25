# --- BASE NODE ---
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN apk update && \
    apk add --no-cache yarn && \
    yarn install --ignore-scripts && \
    apk del yarn

# --- BUILD ---
FROM base AS build
COPY . .
RUN yarn build

# --- RELEASE ---
FROM node:18-alpine AS release
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# --- RUNTIME ---
CMD [ "yarn", "start"]