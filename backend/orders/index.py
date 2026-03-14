"""
Функции для управления заказами такси межгород.
GET / — список заказов
POST / — создать новый заказ
PATCH /{id}/status — изменить статус заказа

"""
import json
import os
import random
import string
from datetime import date, time
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p16163871_taxi_preorder_projec")

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

DRIVERS = [
    {"name": "Алексей К.", "rating": 4.9, "car": "Toyota Camry • A 345 МО"},
    {"name": "Дмитрий Р.", "rating": 4.7, "car": "Kia K5 • В 112 СС"},
    {"name": "Сергей М.", "rating": 5.0, "car": "Skoda Octavia • К 789 ОМ"},
    {"name": "Андрей Т.", "rating": 4.8, "car": "Hyundai Sonata • Е 234 НН"},
    {"name": "Иван Л.", "rating": 4.6, "car": "Volkswagen Passat • М 567 РР"},
]

PRICES = {
    ("Москва", "Санкт-Петербург"): 7500,
    ("Санкт-Петербург", "Москва"): 7500,
    ("Москва", "Нижний Новгород"): 4200,
    ("Нижний Новгород", "Москва"): 4200,
    ("Москва", "Казань"): 8000,
    ("Казань", "Москва"): 8000,
    ("Москва", "Краснодар"): 12500,
    ("Краснодар", "Москва"): 12500,
    ("Москва", "Тверь"): 2400,
    ("Тверь", "Москва"): 2400,
    ("Москва", "Ярославль"): 4800,
    ("Ярославль", "Москва"): 4800,
    ("Екатеринбург", "Челябинск"): 2200,
    ("Челябинск", "Екатеринбург"): 2200,
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def generate_order_number():
    digits = "".join(random.choices(string.digits, k=4))
    return f"МГ-{digits}"


def serialize_order(row):
    return {
        "id": row[0],
        "order_number": row[1],
        "city_from": row[2],
        "city_to": row[3],
        "trip_date": str(row[4]),
        "trip_time": str(row[5])[:5],
        "passengers": row[6],
        "comment": row[7] or "",
        "price": row[8],
        "status": row[9],
        "driver_name": row[10] or "",
        "driver_rating": float(row[11]) if row[11] else 0,
        "driver_car": row[12] or "",
        "passenger_name": row[13] or "",
        "passenger_phone": row[14] or "",
        "created_at": str(row[15]),
    }


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")

    conn = get_conn()
    cur = conn.cursor()

    try:
        if method == "GET":
            cur.execute(
                f"SELECT id, order_number, city_from, city_to, trip_date, trip_time, passengers, comment, price, status, driver_name, driver_rating, driver_car, passenger_name, passenger_phone, created_at FROM {SCHEMA}.orders ORDER BY created_at DESC"
            )
            rows = cur.fetchall()
            orders = [serialize_order(r) for r in rows]
            return {
                "statusCode": 200,
                "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
                "body": json.dumps({"orders": orders}, ensure_ascii=False),
            }

        elif method == "POST":
            body = json.loads(event.get("body") or "{}")
            city_from = body.get("city_from", "")
            city_to = body.get("city_to", "")
            trip_date = body.get("trip_date", "")
            trip_time = body.get("trip_time", "")
            passengers = int(body.get("passengers", 1))
            comment = body.get("comment", "")
            passenger_name = body.get("passenger_name", "")
            passenger_phone = body.get("passenger_phone", "")

            price = PRICES.get((city_from, city_to), 3500)
            driver = random.choice(DRIVERS)
            order_number = generate_order_number()

            cur.execute(
                f"""INSERT INTO {SCHEMA}.orders
                (order_number, city_from, city_to, trip_date, trip_time, passengers, comment, price, status, driver_name, driver_rating, driver_car, passenger_name, passenger_phone)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'upcoming', %s, %s, %s, %s, %s)
                RETURNING id, order_number, city_from, city_to, trip_date, trip_time, passengers, comment, price, status, driver_name, driver_rating, driver_car, passenger_name, passenger_phone, created_at""",
                (order_number, city_from, city_to, trip_date, trip_time, passengers, comment, price, driver["name"], driver["rating"], driver["car"], passenger_name, passenger_phone),
            )
            row = cur.fetchone()
            conn.commit()

            return {
                "statusCode": 201,
                "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
                "body": json.dumps({"order": serialize_order(row)}, ensure_ascii=False),
            }

        elif method == "PATCH":
            parts = path.strip("/").split("/")
            order_id = int(parts[1]) if len(parts) >= 2 else None
            body = json.loads(event.get("body") or "{}")
            new_status = body.get("status", "done")

            cur.execute(
                f"UPDATE {SCHEMA}.orders SET status = %s WHERE id = %s RETURNING id",
                (new_status, order_id),
            )
            conn.commit()
            return {
                "statusCode": 200,
                "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
                "body": json.dumps({"ok": True}),
            }

    finally:
        cur.close()
        conn.close()

    return {"statusCode": 405, "headers": CORS_HEADERS, "body": "Method not allowed"}