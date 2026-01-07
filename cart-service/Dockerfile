FROM php:8.2-cli

RUN apt-get update && apt-get install -y zip unzip git

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

# Install dependencies
RUN composer install

EXPOSE 8000

# Langsung jalankan index.php
CMD ["php", "-S", "0.0.0.0:8000", "index.php"]