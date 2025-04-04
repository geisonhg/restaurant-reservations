from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# In-memory data store
reservations = []
current_id = 1

@app.route("/reservations", methods=["POST"])
def create_reservation():
    global current_id
    data = request.get_json()
    name = data["name"]
    date_ = data["date"]
    time_ = data["time"]
    table_ = data["table"]

    new_dt = datetime.strptime(f"{date_} {time_}", "%Y-%m-%d %H:%M")

    for r in reservations:
        if r["table"] == table_ and r["date"] == date_:
            existing_dt = datetime.strptime(f"{r['date']} {r['time']}", "%Y-%m-%d %H:%M")
            if abs((existing_dt - new_dt).total_seconds() / 60) <= 90:
                return jsonify({
                    "error": "This table is reserved within 1 hour and 30 minutes of the requested time."
                }), 400

    new_reservation = {
        "id": current_id,
        "name": name,
        "date": date_,
        "time": time_,
        "table": table_
    }
    reservations.append(new_reservation)
    current_id += 1
    return jsonify(new_reservation), 201

@app.route("/reservations", methods=["GET"])
def get_reservations():
    return jsonify(reservations)

@app.route("/reservations/<int:reservation_id>", methods=["DELETE"])
def delete_reservation(reservation_id):
    global reservations
    reservations = [r for r in reservations if r["id"] != reservation_id]
    return jsonify({"message": "Reservation deleted"})

# ✅ Serve frontend files
@app.route("/")
def serve_index():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory(".", path)

# ✅ Required for Render to run on the correct port
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
