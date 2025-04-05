from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from joblib import load

app = Flask(__name__)
CORS(app)

# Load the model
model = load("solar_model.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    try:
        features = [
            float(data["Latitude"]),
            float(data["Longitude"]),
            float(data["Month_sin"]),
            float(data["Month_cos"]),
            float(data["ALLSKY_KT"]),
            float(data["ALLSKY_SFC_LW_DWN"])
        ]
        prediction = model.predict([features])[0]
        return jsonify({"prediction": prediction})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)
