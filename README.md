# reservas-qr
Sistema de reservas com check-in QR – base funcional.

## Quick start
docker-compose up  
cd next && npm install && npm run dev  
open http://localhost:3000

## Stack
- Next 15 (App Router, Tailwind)
- PHP 8 (native REST)
- MySQL 8 (trigger anti-overlap)
- SSE real-time dashboard
- jsQR camera check-in

## Screenshots
![Form](prints/form.png)
![Dashboard](prints/dashboard.png)
![Check-in](prints/checkin.png)

## Tests
npm test (Vitest)
phpunit tests/backend (PHPUnit)