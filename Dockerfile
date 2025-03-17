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

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Command to run the application
CMD ["npm", "start"]
# "next start" does not work with "output: standalone" configuration. Use "node .next/standalone/server.js" instead. 
#$ CMD ["node" ".next/standalone/server.js"]