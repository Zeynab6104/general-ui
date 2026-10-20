# Step 1: Build React App
FROM node:20-alpine AS build
WORKDIR /app

# کپی فایل‌های مدیریت وابستگی
COPY package*.json ./
RUN npm ci

# کپی کل سورس‌کد (شامل index.html، vite.config.js و پوشه src)
COPY . .

# اجرای دستور بیلد Vite
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# 👈 این خط را اضافه کنید:
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]