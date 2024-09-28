const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Workout = require("../models/workoutModel");

// Initial data
const initialWorkouts = [
  { title: "test workout 1", reps: 11, load: 101 },
  { title: "test workout 2", reps: 12, load: 102 },
];

// Utility functions
const workoutsInDb = async () => {
  const workouts = await Workout.find({});
  return workouts.map((workout) => workout.toJSON());
};

// Setup and Teardown
beforeEach(async () => {
  await Workout.deleteMany({});
  for (const workout of initialWorkouts) {
    let workoutObject = new Workout(workout);
    await workoutObject.save();
  }
});

afterAll(() => {
  mongoose.connection.close();
});

// Tests
describe("Workout API Tests", () => {
  describe("Initial Workouts", () => {
    test("all workouts are returned", async () => {
      const response = await api.get("/api/workouts");
      expect(response.body).toHaveLength(initialWorkouts.length);
    });

    test("a specific workout is within the returned workouts", async () => {
      const response = await api.get("/api/workouts");
      const contents = response.body.map((r) => r.title);
      expect(contents).toContain("test workout 2");
    });

    test("workouts are returned as json", async () => {
      await api
        .get("/api/workouts")
        .expect(200)
        .expect("Content-Type", /application\/json/);
    });
  });

  describe("Adding Workouts", () => {
    test("new workout added successfully", async () => {
      const newWorkout = { title: "test workout x", reps: 19, load: 109 };
      await api.post("/api/workouts").send(newWorkout).expect(201);
    });

    test("a valid workout can be added", async () => {
      const newWorkout = { title: "Situps", reps: 25, load: 10 };
      await api
        .post("/api/workouts")
        .send(newWorkout)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const response = await api.get("/api/workouts");
      const contents = response.body.map((r) => r.title);

      expect(response.body).toHaveLength(initialWorkouts.length + 1);
      expect(contents).toContain("Situps");
    });

    test("workout without title is not added", async () => {
      const newWorkout = { reps: 23 };
      await api.post("/api/workouts").send(newWorkout).expect(400);

      const response = await api.get("/api/workouts");
      expect(response.body).toHaveLength(initialWorkouts.length);
    });
  });

  describe("Deleting Workouts", () => {
    test("succeeds with status code 204 if id is valid", async () => {
      const workoutsAtStart = await workoutsInDb();
      const workoutToDelete = workoutsAtStart[0];

      await api.delete(`/api/workouts/${workoutToDelete.id}`).expect(204);

      const workoutsAtEnd = await workoutsInDb();
      expect(workoutsAtEnd).toHaveLength(initialWorkouts.length - 1);

      const contents = workoutsAtEnd.map((r) => r.title);
      expect(contents).not.toContain(workoutToDelete.title);
    });
  });
});