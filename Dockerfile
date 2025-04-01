FROM node:20-alpine AS base

EXPOSE 3000

# Set the working directory
WORKDIR /app

# ENV NODE_ENV=production

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./


FROM base as builder

ARG NEXT_PUBLIC_REACT_APP_API_BASE_URL
ENV NEXT_PUBLIC_REACT_APP_API_BASE_URL=$NEXT_PUBLIC_REACT_APP_API_BASE_URL

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Copy the rest of the application code
COPY . .

# Build the application
# RUN pnpm build
RUN pnpm build

# Production image
FROM base AS production

# Set the working directory
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
# ATENTION TO THIS LINE
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static


# Command to run the application
# CMD ["npm", "start"]
# "next start" does not work with "output: standalone" configuration. Use "node .next/standalone/server.js" instead. 
# CMD node .next/standalone/server.js
CMD ["node", "server.js"]