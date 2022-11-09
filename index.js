let app = require("./app");
const port = process.env.PORT || 8000;

// server listening 
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});