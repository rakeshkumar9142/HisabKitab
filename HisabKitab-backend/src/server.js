require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const cors = require("cors");
app.use(cors({
  origin: "*"
}));

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

