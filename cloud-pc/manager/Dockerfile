FROM node:22-alpine
ENV NODE_ENV=production PORT=3000
WORKDIR /app
RUN mkdir -p /sites && printf '# no managed PC routes yet\n' > /sites/00-empty.caddy
COPY manager.mjs ./manager.mjs
COPY index.html ./index.html
EXPOSE 3000
CMD ["node","manager.mjs"]
