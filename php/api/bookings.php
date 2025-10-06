<?php
require_once __DIR__ . '/../libs/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$date = $_GET['date'] ?? date('Y-m-d');
$stmt = $pdo->prepare(
    'SELECT id, nome, email, telefone, data, time_slot, pessoas, checked
     FROM bookings
     WHERE data = ?
     ORDER BY time_slot, id'
);
$stmt->execute([$date]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));