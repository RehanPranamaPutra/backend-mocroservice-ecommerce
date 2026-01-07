<?php
require 'vendor/autoload.php';

$router = new \Bramus\Router\Router();

// Koneksi Redis (cart-db adalah nama service di docker-compose)
$redis = new Predis\Client([
    'scheme' => 'tcp',
    'host'   => 'cart-db', 
    'port'   => 6379,
]);

// Helper untuk kirim JSON
function responseJson($data, $status = 200) {
    header('Content-Type: application/json');
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// 1. Route Test
$router->get('/test', function() {
    responseJson(['message' => 'Cart Service Simple is Running']);
});

// 2. Add to Cart (POST) - Ambil user_id dari body
$router->post('/carts', function() use ($redis) {
    $body = json_decode(file_get_contents('php://input'), true);
    $userId = $body['user_id'] ?? null;
    $productId = $body['product_id'] ?? null;
    $qty = $body['quantity'] ?? 1;

    if (!$userId || !$productId) {
        responseJson(['message' => 'Data tidak lengkap'], 400);
    }

    $redis->hset("cart:$userId", $productId, $qty);
    responseJson(['message' => "Produk $productId berhasil ditambah untuk user $userId"]);
});

// 3. Get Cart (GET) - Pakai user_id di URL
$router->get('/carts/(\d+)', function($userId) use ($redis) {
    $cartData = $redis->hgetall("cart:$userId");
    $items = [];
    $total = 0;
    $client = new \GuzzleHttp\Client();

    foreach ($cartData as $productId => $qty) {
        try {
            // Manggil Product Service (Node.js) internal Docker
            $res = $client->request('GET', "http://product-services:3000/products/$productId");
            $product = json_decode($res->getBody(), true)['data'];
            
            $items[] = [
                'name' => $product['name'],
                'price' => $product['price'],
                'quantity' => (int)$qty,
                'subtotal' => $product['price'] * $qty
            ];
            $total += ($product['price'] * $qty);
        } catch (\Exception $e) {
            continue; // Lewati jika produk tidak ketemu
        }
    }

    responseJson(['user_id' => $userId, 'items' => $items, 'total' => $total]);
});

$router->run();