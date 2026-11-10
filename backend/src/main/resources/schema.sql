CREATE TABLE IF NOT EXISTS bookings (
 id VARCHAR(40) PRIMARY KEY,
 movie_id VARCHAR(30) NOT NULL,
 show_date DATE NOT NULL,
 show_time VARCHAR(5) NOT NULL,
 cinema VARCHAR(20) NOT NULL,
 guest_name VARCHAR(100) NOT NULL,
 email VARCHAR(200) NOT NULL,
 total INT NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS reserved_seats (
 movie_id VARCHAR(30) NOT NULL,
 show_date DATE NOT NULL,
 show_time VARCHAR(5) NOT NULL,
 cinema VARCHAR(20) NOT NULL,
 seat VARCHAR(3) NOT NULL,
 booking_id VARCHAR(40) NOT NULL,
 PRIMARY KEY (movie_id, show_date, show_time, cinema, seat),
 FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Links each persisted reservation to the authenticated account or guest session
-- that created it, without changing existing booking rows.
CREATE TABLE IF NOT EXISTS booking_owners (
 booking_id VARCHAR(40) PRIMARY KEY,
 owner_key VARCHAR(80) NOT NULL,
 FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
 INDEX idx_booking_owners_owner_key (owner_key)
);
