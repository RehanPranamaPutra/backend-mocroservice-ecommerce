from pymongo import MongoClient
import os
import time

MONGO_USER = os.getenv("MONGO_INITDB_ROOT_USERNAME")
MONGO_PASS = os.getenv("MONGO_INITDB_ROOT_PASSWORD")
MONGO_DB   = os.getenv("MONGO_DB_NAME", "reviewdb")

MONGO_URI = f"mongodb://{MONGO_USER}:{MONGO_PASS}@mongo-db:27017/?authSource=admin"

def connect_with_retry():
    retries = 10
    while retries:
        try:
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            client.admin.command("ping")
            print("✅ Connected to MongoDB")
            return client
        except Exception as e:
            print(f"⏳ MongoDB not ready yet: {e}")
            retries -= 1
            time.sleep(5)

    raise Exception("❌ Could not connect to MongoDB after several attempts")

client = connect_with_retry()
db = client[MONGO_DB]
reviews_collection = db["reviews"]
