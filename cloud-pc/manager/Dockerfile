FROM node:22-alpine
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY manager.mjs ./manager.mjs
COPY index.html ./index.html
USER node
EXPOSE 3000
CMD ["node","manager.mjs"]
