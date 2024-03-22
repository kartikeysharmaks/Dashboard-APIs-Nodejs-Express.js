const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://kartikeysharmaks:kartikeysharmaks@cluster0.ni6kt3x.mongodb.net",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// MongoDB Model
const dataset = mongoose.model("dataset", {
  age: Number,
  gender: String,
  timeSpent: Number,
  platform: String,
  interests: String,
  location: String,
  demographics: String,
  profession: String,
  income: Number,
  indebt: String,
  isHomeOwner: String,
  ownsCar: String,
});

app.get("/api/getalldata", async (req, res) => {
  try {
    const colleges = await dataset.find();
    res.json(colleges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/platforms", async (req, res) => {
  try {
    const data = await dataset.find({}, "platform location gender");
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Server Error");
  }
});

app.post("/api/data", async (req, res) => {
  const { pageIndex, pageSize, filters } = req.body;
  const filterCriteria = {};
  for (const key in filters) {
    if (filters[key]) {
      filterCriteria[key] = filters[key];
    }
  }

  try {
    const totalDocs = await dataset.countDocuments(filterCriteria);
    const totalPages = Math.ceil(totalDocs / pageSize);
    const data = await dataset
      .find(filterCriteria)
      .skip(pageIndex * pageSize)
      .limit(pageSize);

    res.json({ data, totalPages });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/averageTimeSpent", async (req, res) => {
  try {
    const data = await dataset.aggregate([
      {
        $group: { _id: "$platform", averageTimeSpent: { $avg: "$timeSpent" } },
      },
    ]);
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Server Error");
  }
});

app.get("/api/genderDistribution", async (req, res) => {
  try {
    const data = await dataset.aggregate([
      {
        $group: { _id: "$gender", count: { $sum: 1 } },
      },
    ]);
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Server Error");
  }
});

app.get("/api/ageDistribution", async (req, res) => {
  try {
    const data = await dataset.aggregate([
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [0, 20, 40, 60, 100],
          default: "Other",
          output: { count: { $sum: 1 } },
        },
      },
    ]);
    res.json(data);
  } catch (error) {
    console.error("Error fetching age distribution data:", error);
    res.status(500).send("Server Error");
  }
});

app.get("/api/interestDistribution", async (req, res) => {
  try {
    const data = await dataset.aggregate([
      { $group: { _id: "$interests", count: { $sum: 1 } } },
    ]);
    res.json(data);
  } catch (error) {
    console.error("Error fetching interest distribution data:", error);
    res.status(500).send("Server Error");
  }
});

app.get("/api/platformDistribution", async (req, res) => {
  
  try {
    const data = await dataset.aggregate([
      { $group: { _id: { platform: "$platform" }, count: { $sum: 1 } } },
    ]);
    res.json(data);
  } catch (error) {
    console.error("Error fetching gender and platform data:", error);
    res.status(500).send("Server Error");
  }
});

app.get("/api/locationDistribution", async (req, res) => {
  try {
    const data = await dataset.aggregate([
      { $group: { _id: "$location", count: { $sum: 1 } } },
    ]);
    res.json(data);
  } catch (error) {
    console.error("Error fetching location distribution data:", error);
    res.status(500).send("Server Error");
  }
});

app.get("/api/demographicsDistribution", async (req, res) => {
  try {
    const data = await dataset.aggregate([
      { $group: { _id: "$demographics", count: { $sum: 1 } } },
    ]);
    res.json(data);
  } catch (error) {
    console.error("Error fetching demographics distribution data:", error);
    res.status(500).send("Server Error");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
