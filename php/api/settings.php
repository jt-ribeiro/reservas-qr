<?php
require_once __DIR__ . '/../libs/database.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query('SELECT * FROM settings WHERE id = 1');
    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    exit;
}

if ($method === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true);

    $name   = $input['restaurant_name'] ?? null;
    $max    = $input['max_capacity']    ?? null;
    $open   = $input['opening_time']    ?? null;
    $close  = $input['closing_time']    ?? null;
    $dur    = $input['slot_duration']   ?? null;

    if (!$name || !$max || !$open || !$close || !$dur) {
        http_response_code(400);
        echo json_encode(['error' => 'Campos obrigatórios']);
        exit;
    }

    try {
        $stmt = $pdo->prepare(
            'UPDATE settings
             SET restaurant_name = ?, max_capacity = ?, opening_time = ?, closing_time = ?, slot_duration = ?
             WHERE id = 1'
        );
        $stmt->execute([$name, $max, $open, $close, $dur]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'DB error']);
    }
    exit;
}