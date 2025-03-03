from flask import Flask, request, jsonify

app = Flask(__name__)

# Lista de reservas (simulación de base de datos)
reservations = []

# Ruta para crear una reserva
@app.route("/reservations", methods=["POST"])
def create_reservation():
    data = request.get_json()
    new_reservation = {
        "id": len(reservations) + 1,
        "name": data["name"],
        "date": data["date"],
        "time": data["time"],
        "guests": data["guests"]
    }
    reservations.append(new_reservation)
    return jsonify(new_reservation), 201

# Ruta para ver todas las reservas
@app.route("/reservations", methods=["GET"])
def get_reservations():
    return jsonify(reservations)

# Ruta para eliminar una reserva
@app.route("/reservations/<int:reservation_id>", methods=["DELETE"])
def delete_reservation(reservation_id):
    global reservations
    reservations = [r for r in reservations if r["id"] != reservation_id]
    return jsonify({"message": "Reservation deleted"})

if __name__ == "__main__":
    app.run(debug=True)

    

