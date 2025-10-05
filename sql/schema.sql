CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL,
  telefone VARCHAR(20),
  data DATE NOT NULL,
  time_slot TIME NOT NULL,
  pessoas TINYINT NOT NULL,
  checked TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DELIMITER $$
CREATE TRIGGER trg_no_overlap
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
  DECLARE v_max INT;
  DECLARE v_count INT;

  SELECT max_capacity INTO v_max FROM settings WHERE id = 1;

  SELECT COALESCE(SUM(pessoas),0) INTO v_count
  FROM bookings
  WHERE data = NEW.data
    AND time_slot = NEW.time_slot
    AND checked = 0;

  IF (v_count + NEW.pessoas) > v_max THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Slot lotado';
  END IF;
END$$
DELIMITER ;