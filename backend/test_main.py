from fastapi.testclient import TestClient
from main import app, num_flights

client = TestClient(app)

def test_algorithm_comparison():
    greedy = client.get("/api/allocate/greedy")
    hungarian = client.get("/api/allocate/hungarian")

    assert greedy.status_code == 200
    assert hungarian.status_code == 200

    greedy_data = greedy.json()
    hungarian_data = hungarian.json()

    #Check if Hungarian is always <= Greedy total distance
    assert hungarian_data["total_distance"] <= greedy_data["total_distance"]
    assert len(greedy_data["assignments"]) == num_flights
    assert len(hungarian_data["assignments"]) == num_flights