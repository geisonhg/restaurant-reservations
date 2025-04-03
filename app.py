from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# In-memory data store
reservations = []
current_id = 1

@app.route("/reservations", methods=["POST"])
def create_reservation():
    """
    Creates a new reservation if it doesn't conflict with an existing one
    within 1 hour and 30 minutes for the same table and date.
    """
    global current_id
    data = request.get_json()
    name = data["name"]
    date_ = data["date"]
    time_ = data["time"]
    table_ = data["table"]

    # Convert date and time strings to a datetime object
    new_dt = datetime.strptime(f"{date_} {time_}", "%Y-%m-%d %H:%M")

    # Check existing reservations for the same table and date
    for r in reservations:
        if r["table"] == table_ and r["date"] == date_:
            existing_dt = datetime.strptime(f"{r['date']} {r['time']}", "%Y-%m-%d %H:%M")
            difference_minutes = abs((existing_dt - new_dt).total_seconds() / 60)

            # If the difference is less than or equal to 90 minutes, reject the request
            if difference_minutes <= 90:
                return jsonify({
                    "error": "This table is reserved within 1 hour and 30 minutes of the requested time."
                }), 400

    # If there's no conflict, create the new reservation
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
    """
    Returns all existing reservations.
    """
    return jsonify(reservations)

@app.route("/reservations/<int:reservation_id>", methods=["DELETE"])
def delete_reservation(reservation_id):
    """
    Deletes a reservation by its ID.
    """
    global reservations
    reservations = [r for r in reservations if r["id"] != reservation_id]
    return jsonify({"message": "Reservation deleted"})

@app.route("/")
def serve_index():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def serve_static_files(path):
    return send_from_directory(".", path)

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)



if __name__ == "__main__":
    app.run(debug=True)

    
