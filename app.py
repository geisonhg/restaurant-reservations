from flask import Flask, request, jsonify

app = Flask(__name__)

# Data
reservations = []
current_id = 1

# Create a booking
@app.route("/reservations", methods=["POST"])
def create_reservation():
    global current_id
    new_reservation = {
        "id": current_id,
        "name": request.json["name"],
        "date": request.json["date"],
        "time": request.json["time"],
        "table": request.json["table"],
    }
    reservations.append(new_reservation)
    current_id += 1
    return jsonify(new_reservation)

# Get all bookings
@app.route("/reservations", methods=["GET"])
def get_reservations():
    return jsonify(reservations)

# Delete a booking
@app.route("/reservations/<int:reservation_id>", methods=["DELETE"])
def delete_reservation(reservation_id):
    global reservations
    reservations = [r for r in reservations if r["id"] != reservation_id]
    return jsonify({"message": "Reservation deleted"})

if __name__ == "__main__":
    app.run(debug=True)
