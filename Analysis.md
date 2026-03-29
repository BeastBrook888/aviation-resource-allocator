# Algorithm Comparison Analysis: Aviation Resource Allocation

This project compares two different algorithms for assigning 
ground support resources (fuel trucks) to 
active requests (flights) at
San Francisco International Airport (SFO).

## 1. Greedy Algorithm

This operates on local optimization. It goes in the order the flights are listed when it comes to processing 
and assigns what it sees at that exact moment as the closest available fuel truck.

* **Strengths:** Computational cost is low, speed is fast, effective when requests come in one-by-one and dispatcher wants to make assignments immediately after receiving each request.
* **Weaknesses:** Does NOT consider global state of fleet, not optimizing distance of every flight to every fuel truck so later assignments may have very long distances.
* **Time Complexity:** O(N^2)

## 2. Hungarian / Kuhn-Munkres Algorithm

This is a combinatorial optimization method that uses a bipartite graph to make assignments. The full distance matrix is evaluated simultaneously to find the "optimal" combination based on the minimum total distance between each flight and truck.

* **Strengths:** Mathematically guarantees the globally optimal solution, minimizing total distance and fuel usage for a fixed set of flights and trucks.
* **Weaknesses:** Computational cost is more expensive and only works when all tasks and resources are known.
* **Time Complexity:** O(N^3)

## Conclusion

In a simulated environment, the **Hungarian Algorithm** provides the best solution to minimize total distance, but in real-world aviation operations, the best choice depends on the specific operational pipeline:

The Hungarian algorithm wins when operational efficiency (ex. fuel cost and total time) is most important, as well as when all requests are already known. Meanwhile, the Greedy algorithm wins when requests come in one-by-one and fuel trucks need to be dispatched immediately without waiting for all requests to form a batch.