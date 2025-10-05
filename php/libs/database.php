<?php
$host = '127.0.0.1';
$port = 3306;
$db   = 'reservas_qr';
$user = 'root';
$pass = 'root';

try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4",
        $user,
        $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    // ---- expose só por 30 s ----
    http_response_code(500);
    exit(json_encode(['error' => 'DB down', 'details' => $e->getMessage()]));
}