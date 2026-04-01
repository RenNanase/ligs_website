require("dotenv/config")
const { PrismaClient } = require("@prisma/client")

console.log("Testing PrismaClient initialization...")
console.log("DATABASE_URL:", process.env.DATABASE_URL)

try {
  const prisma = new PrismaClient()
  console.log("✓ PrismaClient created successfully")
  
  // Test connection
  prisma.$connect()
    .then(() => {
      console.log("✓ Database connection successful")
      process.exit(0)
    })
    .catch(err => {
      console.error("✗ Database connection failed:", err.message)
      process.exit(1)
    })
} catch (error) {
  console.error("✗ PrismaClient creation failed:", error.message)
  process.exit(1)
}
