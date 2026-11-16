FROM nginxinc/nginx-unprivileged:stable-alpine

USER 0
RUN apk upgrade --no-cache
USER 101

COPY src/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD ["wget", "-qO", "/dev/null", "http://127.0.0.1:8080/"]