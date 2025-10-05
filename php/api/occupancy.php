<?php
require_once __DIR__ . '/../libs/database.php';

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Access-Control-Allow-Origin: *');

while (true) {
    $stmt = $pdo->query(
        "SELECT ROUND(100 * SUM(checked) / COUNT(*), 0) AS ocupacao FROM bookings"
    );
    $ocup = (int) $stmt->fetchColumn();

    echo "data: " . json_encode(['ocupacao' => $ocup]) . "\n\n";
    ob_flush();
    flush();
    sleep(2);
}