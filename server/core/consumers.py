import asyncio
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from pymongo import MongoClient
from django.conf import settings
from datetime import datetime

# Lazy MongoDB gettersserver/core/consumers.py
def get_code_collection():
    client = MongoClient(settings.MONGO_URI)
    db = client["collab"]
    return db["rooms"]

def get_drawing_collection():
    client = MongoClient(settings.MONGO_URI)
    db = client["collab"]
    return db["drawings"]

# ------------------ Code Editor Consumer ------------------
class EditorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["roomId"]
        self.room_group_name = f"editor_{self.room_id}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Send existing code from MongoDB
        collection = get_code_collection()
        doc = collection.find_one({"roomId": self.room_id})
        if doc:
            await self.send(text_data=json.dumps({
                "type": "code_update",
                "payload": doc.get("code", "")
            }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data["type"] == "code_update":
            code = data["payload"]

            # Broadcast to other users (except sender)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "broadcast_code",
                    "payload": code,
                    "sender_channel_name": self.channel_name,
                }
            )

            # Save updated code to MongoDB
            collection = get_code_collection()
            collection.update_one(
                {"roomId": self.room_id},
                {"$set": {"code": code}},
                upsert=True
            )

    async def broadcast_code(self, event):
        # Don't send back to the sender
        if self.channel_name == event.get("sender_channel_name"):
            return
        await self.send(text_data=json.dumps({
            "type": "code_update",
            "payload": event["payload"]
        }))


# ------------------ Draw Consumer ------------------
# ------------------ Draw Consumer ------------------
class DrawConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["roomId"]
        self.room_group_name = f"draw_{self.room_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        # Send existing drawing data
        collection = get_drawing_collection()
        doc = collection.find_one({"roomId": self.room_id})
        if doc and "drawing" in doc:
            await self.send(text_data=json.dumps({
                "type": "draw_sync",
                "payload": doc["drawing"]
            }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        if data["type"] == "draw_update":
            drawing_data = data["payload"]

            # Broadcast to others in the room (excluding sender)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "broadcast_drawing",
                    "payload": drawing_data,
                    "sender_channel_name": self.channel_name,
                }
            )

            # Save drawing to MongoDB
            collection = get_drawing_collection()
            collection.update_one(
                {"roomId": self.room_id},
                {"$set": {"drawing": drawing_data}},
                upsert=True
            )

    async def broadcast_drawing(self, event):
        if self.channel_name == event.get("sender_channel_name"):
            return
        await self.send(text_data=json.dumps({
            "type": "draw_update",
            "payload": event["payload"]
        }))
