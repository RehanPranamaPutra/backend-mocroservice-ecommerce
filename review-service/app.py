from flask import Flask, jsonify, request

app = Flask(__name__)

#dummy data for reviews
reviews = [
    {"id": 1, "product_id": 101, "review": "Great product!", "rating": 5},
    {"id": 2, "product_id": 102, "review": "Not bad", "rating": 3},
    {"id": 3, "product_id": 101, "review": "Could be better", "rating": 2},
]

# @app.route('/reviews', methods=['GET'])
# def home():
#     return jsonify({"message": "Welcome to the Review Service!"})

#Get / reviews --> semua review
@app.route('/reviews', methods=['GET'])
def get_reviews():
    return jsonify(reviews)

#Get / reviews/<product_id> --> review by product_id
@app.route('/reviews/<int:review_id>', methods=['GET'])
def get_reviews_by_product(review_id):
    review = next((r for r in reviews if r["id"] == review_id), None)
    if review is None:
        return jsonify({"message": "Review not found"}), 404
    return jsonify(review)

#Get review product by id
@app.route('/review/product/<int:product_id>', methods=['GET'])
def get_review_product_by_id(product_id):
    filtered_reviews = [r for r in reviews if r["product_id"] == product_id]
    return jsonify(filtered_reviews)

#tambah review baru
@app.route('/reviews', methods=['POST'])
def create_review():
    data = request.get_json() or {}

    required_fields = ["product_id", "review", "rating"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({"message": f"Missing fields: {', '.join(missing)}"}), 400

    new_id = len(reviews) + 1
    new_review = {
        "id": new_id,
        "product_id": data["product_id"],
        "review": data["review"],
        "rating": data["rating"]
    }
    reviews.append(new_review)
    return jsonify(new_review), 201

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)