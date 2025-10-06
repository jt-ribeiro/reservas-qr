<?php
require_once __DIR__ . '/../libs/database.php';
require_once __DIR__ . '/../libs/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/../libs/PHPMailer/src/SMTP.php';
require_once __DIR__ . '/../libs/PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
// pré-voo (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

error_log('RAW INPUT: ' . file_get_contents('php://input'));
error_log('DECODED: ' . print_r($input, true));

// validação super básica
if (empty($input['nome']) || empty($input['email']) || empty($input['data']) || empty($input['time_slot']) || empty($input['pessoas'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Campos obrigatórios']);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'INSERT INTO bookings (nome, email, telefone, data, time_slot, pessoas)
         VALUES (:nome, :email, :telefone, :data, :time_slot, :pessoas)'
    );
    $stmt->execute([
        ':nome'      => $input['nome'],
        ':email'     => $input['email'],
        ':telefone'  => $input['telefone'] ?? null,
        ':data'      => $input['data'],
        ':time_slot' => $input['time_slot'],
        ':pessoas'   => (int)$input['pessoas']
    ]);
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    if ($e->getCode() === 1644 || str_contains($e->getMessage(), 'Slot já ocupado')) {
        http_response_code(409);
        echo json_encode(['error' => 'Slot já ocupado']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'DB error', 'details' => $e->getMessage()]);
    }
    exit;
}