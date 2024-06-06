# Sử dụng Node.js image từ Docker Hub
FROM node:14

# Tạo thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json vào thư mục làm việc
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn vào thư mục làm việc
COPY . .

# Expose cổng mà ứng dụng sẽ chạy
EXPOSE 3000

# Lệnh để chạy ứng dụng
CMD ["npm", "start"]