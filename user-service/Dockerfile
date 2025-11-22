#gunakan image node js versi 18
FROM node:18-alpine

#set working directory di dalam container
WORKDIR /app

#copy file package.json ke dalam container
COPY package*.json ./

#install dependencies
RUN npm install

#copy semua file ke dalam container
COPY  . .

#expose port 3000
EXPOSE 4000

#jalankan aplikasi
CMD ["npm", "start"]