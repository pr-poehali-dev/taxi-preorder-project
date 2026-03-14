
CREATE TABLE t_p16163871_taxi_preorder_projec.orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  city_from VARCHAR(100) NOT NULL,
  city_to VARCHAR(100) NOT NULL,
  trip_date DATE NOT NULL,
  trip_time TIME NOT NULL,
  passengers INTEGER NOT NULL DEFAULT 1,
  comment TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming',
  driver_name VARCHAR(100),
  driver_rating NUMERIC(2,1),
  driver_car VARCHAR(150),
  passenger_name VARCHAR(100),
  passenger_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p16163871_taxi_preorder_projec.reviews (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES t_p16163871_taxi_preorder_projec.orders(id),
  passenger_name VARCHAR(100) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
