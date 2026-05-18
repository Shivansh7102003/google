FROM nginx:alpine

# Copy site files
COPY . /usr/share/nginx/html

# Override default nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
