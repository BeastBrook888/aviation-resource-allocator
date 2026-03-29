from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from scipy.spatial import distance_matrix
from scipy.optimize import linear_sum_assignment
import random, time

app = FastAPI()

#React communication w/FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

#Mock Data Generation with SFO Airport
def make_mock_data(num_items):
    data = []
    for ind in range(num_items):
        lat = 37.621 + random.uniform(-0.01, 0.01)
        lon = -122.379 + random.uniform(-0.01, 0.01)
        data.append([lat, lon])

    return np.array(data)

#5 trucks (resources) and 5 flights (requests)
num_trucks = 5
num_flights = 5
trucks = make_mock_data(num_items = num_trucks)
flights = make_mock_data(num_items = num_flights)

@app.post("/api/data/generate")
def regenerate_data():
    global trucks, flights

    trucks = make_mock_data(num_items = num_trucks)
    flights = make_mock_data(num_items = num_flights)

    return {'status': 'success', 'message': 'New random locations generated!'}

@app.get('/api/data')
def get_raw_data():
    #to display flights and trucks on map instantly
    return {
        "trucks": [{"id": i, "loc": loc.tolist()} for i, loc in enumerate(trucks)],
        "flights": [{"id": i, "loc": loc.tolist()} for i, loc in enumerate(flights)]
    }

'''
Algorithms
'''
@app.get("/api/allocate/greedy")

def greedy():
    #track how long the algorithm ran
    start_time = time.perf_counter()

    dist_matrix = distance_matrix(x = flights, y = trucks)
    assignments = []
    total_dist = 0
    available_trucks = set(range(len(trucks)))

    #for finding the max
    all_distances = []

    for flight_ind in range(len(flights)):
        best_truck = None
        min_dist = float('inf')
        for truck_ind in available_trucks:
            if(dist_matrix[flight_ind][truck_ind] < min_dist):
                min_dist = dist_matrix[flight_ind][truck_ind]
                best_truck = truck_ind

        if best_truck is not None:
            assignments.append({
                #to make the flight ids NOT zero-indexed
                "flight_id" : flight_ind + 1,
                "truck_id" : best_truck + 1,
                "flight_loc" : flights[flight_ind].tolist(),
                "truck_loc" : trucks[best_truck].tolist()
            })

            total_dist += min_dist
            all_distances.append(min_dist)
            available_trucks.remove(best_truck)
    
    #track how long the algorithm ran
    end_time = time.perf_counter()

    return {
        "algorithm" : "Greedy",
        "total_distance" : round(total_dist, 4),
        "avg_distance" : round(total_dist / len(assignments), 4) if assignments else 0,
        "max_distance" : round(max(all_distances), 4) if all_distances else 0,
        "execution_time_ms" : round((end_time - start_time) * 1000, 4),
        "assignments" : assignments
    }

@app.get("/api/allocate/hungarian")

def hungarian():
    #track how long the algorithm ran
    start_time = time.perf_counter()

    dist_matrix = distance_matrix(x = flights, y = trucks)
    flight_inds, truck_inds = linear_sum_assignment(cost_matrix = dist_matrix)
    total_dist = dist_matrix[flight_inds, truck_inds].sum()

    all_distances = dist_matrix[flight_inds, truck_inds]
    assignments = []

    for f, t in zip(flight_inds, truck_inds):
        assignments.append({
            #to make the flight ids NOT zero-indexed, add 1
            "flight_id" : int(f) + 1,
            "truck_id" : int(t) + 1,
            "flight_loc" : flights[f].tolist(),
            "truck_loc" : trucks[t].tolist()
        })
    
    #track how long the algorithm ran
    end_time = time.perf_counter()

    return {
        "algorithm" : "Hungarian",
        "total_distance" : round(total_dist, 4),
        "avg_distance": round(total_dist / len(assignments), 4) if assignments else 0,
        "max_distance": round(all_distances.max(), 4) if assignments else 0,
        "execution_time_ms": round((end_time - start_time) * 1000, 4),
        "assignments" : assignments
    }
