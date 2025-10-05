<?php
require_once __DIR__ . '/../libs/database.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$date = $_GET['date'] ?? null;
if (!$date) {
    http_response_code(400);
    echo json_encode(['error' => 'date required']);
    exit;
}

$stmt = $pdo->prepare(
    'SELECT time_slot,
            ROUND(100 * SUM(checked) / COUNT(*), 0) AS ocupacao
     FROM bookings
     WHERE data = ?
     GROUP BY time_slot
     ORDER BY time_slot'
);
$stmt->execute([$date]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));