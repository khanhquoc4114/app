import asyncio, websockets, json

async def test_ws():
    uri = "ws://localhost:8000/chat?token=eyJhbGciOiJIUzI1NiIs..."
    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps({
            "receiver_id": 2,
            "content": "hello!"
        }))
        response = await websocket.recv()
        print("Received:", response)

asyncio.run(test_ws())