from fastapi import FastAPI
from pydantic import BaseModel
from database import reviews_collection
from bson import ObjectId

app = FastAPI()

class Review(BaseModel):
    product_id: int
    user_id: int      # Tambahkan ini agar tahu siapa yang review
    user_name: str    # Simpan nama user di sini (Denormalisasi)
    review: str
    rating: int

@app.post("/reviews")
def create_review(review: Review):
    review_dict = review.dict()

    result = reviews_collection.insert_one(review_dict)

    # ⬇️ WAJIB convert ObjectId
    review_dict["_id"] = str(result.inserted_id)

    return {
        "success": True,
        "message": "Review created successfully",
        "data": review_dict
    }

@app.get("/reviews")
def get_reviews():
    reviews = list(reviews_collection.find())

    for r in reviews:
        r["_id"] = str(r["_id"])

    return {
        "success": True,
        "data": reviews
    }

@app.get("/reviews/{product_id}")
def get_reviews_by_product(product_id: int):
    reviews = list(reviews_collection.find({"product_id": product_id}))

    for r in reviews:
        r["_id"] = str(r["_id"])

    return {
        "success": True,
        "data": reviews
    }

# Tambahkan ini di FastAPI (review-service/main.py)
@app.put("/reviews/{review_id}")
def update_review(review_id: str, review: Review):
    reviews_collection.update_one(
        {"_id": ObjectId(review_id)},
        {"$set": review.dict()}
    )
    return {"success": True, "message": "Review updated"}

@app.delete("/reviews/{review_id}")
def delete_review(review_id: str):
    reviews_collection.delete_one({"_id": ObjectId(review_id)})
    return {"success": True, "message": "Review deleted"}