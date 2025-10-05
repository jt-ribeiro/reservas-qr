CREATE TABLE settings (
  id                TINYINT PRIMARY KEY DEFAULT 1,
  restaurant_name   VARCHAR(100) NOT NULL DEFAULT 'Meu Restaurant',
  max_capacity      TINYINT      NOT NULL DEFAULT 20,
  opening_time      TIME         NOT NULL DEFAULT '12:00:00',
  closing_time      TIME         NOT NULL DEFAULT '22:00:00',
  slot_duration     TINYINT      NOT NULL DEFAULT 30,   -- minutos
  CHECK (id = 1),
  CHECK (max_capacity BETWEEN 1 AND 99),
  CHECK (closing_time > opening_time),
  CHECK (slot_duration IN (15,30,60))
);

INSERT INTO settings (id, restaurant_name, max_capacity, opening_time, closing_time, slot_duration)
VALUES (1, 'Demo Restaurant', 20, '12:00', '22:00', 30);