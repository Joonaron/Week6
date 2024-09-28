const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);

const User = require("../models/userModel");
const Workout = require("../models/workoutModel");
const workouts = require("./data/workouts.js");

let token = null;

// Helper function to signup a user and get a token
const signupUserAndGetToken = async () => {
  await User.deleteMany({});
  const response = await api
    .post("/api/user/signup")
    .send({ email: "mattiv@matti.fi", password: "R3g5T7#gh" });
  return response.body.token;
};

// Helper function to add initial workouts
const addInitialWorkouts = async (token) => {
  await Workout.deleteMany({});
  await api
    .post("/api/workouts")
    .set("Authorization", `bearer ${token}`)
    .send(workouts[0])
    .send(workouts[1]);
};

beforeAll(async () => {
  token = await signupUserAndGetToken();
});

describe("Workout API tests", () => {
  describe("Initial state with some workouts", () => {
    beforeEach(async () => {
      await addInitialWorkouts(token);
    });

    test("should return workouts as JSON", async () => {
      await api
        .get("/api/workouts")
        .set("Authorization", `bearer ${token}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);
    });

    test("should add a new workout successfully", async () => {
      const newWorkout = {
        title: "testworkout",
        reps: 10,
        load: 100,
      };
      await api
        .post("/api/workouts")
        .set("Authorization", `bearer ${token}`)
        .send(newWorkout)
        .expect(201);
    });

    test("should delete a workout successfully", async () => {
      const newWorkout = {
        title: "testworkout",
        reps: 10,
        load: 100,
      };
      const response = await api
        .post("/api/workouts")
        .set("Authorization", `bearer ${token}`)
        .send(newWorkout);
      
      const workoutId = response.body._id;

      await api
        .delete(`/api/workouts/${workoutId}`)
        .set("Authorization", `bearer ${token}`)
        .expect(204);

      await api
        .get(`/api/workouts/${workoutId}`)
        .set("Authorization", `bearer ${token}`)
        .expect(404);
    });

    test("should update a workout successfully", async () => {
      const newWorkout = {
        title: "testworkout",
        reps: 10,
        load: 100,
      };
      const response = await api
        .post("/api/workouts")
        .set("Authorization", `bearer ${token}`)
        .send(newWorkout);
      
      const workoutId = response.body._id;
      const updatedWorkout = {
        title: "updatedworkout",
        reps: 15,
        load: 120,
      };

      await api
        .put(`/api/workouts/${workoutId}`)
        .set("Authorization", `bearer ${token}`)
        .send(updatedWorkout)
        .expect(200);

      const updatedResponse = await api
        .get(`/api/workouts/${workoutId}`)
        .set("Authorization", `bearer ${token}`)
        .expect(200);

      expect(updatedResponse.body.title).toBe(updatedWorkout.title);
      expect(updatedResponse.body.reps).toBe(updatedWorkout.reps);
      expect(updatedResponse.body.load).toBe(updatedWorkout.load);
    });

    test("should read a single workout successfully", async () => {
      const newWorkout = {
        title: "testworkout",
        reps: 10,
        load: 100,
      };
      const response = await api
        .post("/api/workouts")
        .set("Authorization", `bearer ${token}`)
        .send(newWorkout);
      
      const workoutId = response.body._id;

      const singleWorkoutResponse = await api
        .get(`/api/workouts/${workoutId}`)
        .set("Authorization", `bearer ${token}`)
        .expect(200);

      expect(singleWorkoutResponse.body.title).toBe(newWorkout.title);
      expect(singleWorkoutResponse.body.reps).toBe(newWorkout.reps);
      expect(singleWorkoutResponse.body.load).toBe(newWorkout.load);
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});