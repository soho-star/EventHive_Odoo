let mysql = require('mysql2');

let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "eventhive"
});

con.connect(function(err) {
  if (err) {
    console.error("❌ Connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL!");

  // Check users table structure
  con.query("DESCRIBE users", function (err, result) {
    if (err) {
      console.error("❌ Error describing users table:", err);
    } else {
      console.log("👥 Users table structure:");
      console.table(result);
    }

    // Drop and recreate the database to fix any issues
    console.log("\n🔄 Recreating database...");
    con.query("DROP DATABASE IF EXISTS eventhive", function (err, result) {
      if (err) {
        console.error("❌ Error dropping database:", err);
        con.end();
        return;
      }
      console.log("✅ Database dropped");

      con.query("CREATE DATABASE eventhive", function (err, result) {
        if (err) {
          console.error("❌ Error creating database:", err);
          con.end();
          return;
        }
        console.log("✅ Database created");
        console.log("🎉 Database reset complete! Run setup_database.js again.");
        con.end();
      });
    });
  });
});
