from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return "Hola, Flask está funcionando :)"

@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "pong"})

if __name__ == "__main__":
    app.run(debug=True)
