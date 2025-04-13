const { DataSource } = require("typeorm")
const dotenv = require("dotenv")

const config = {
  database_type: "postgres",
  database_url: process.env.DATABASE_URL,
}

dotenv.config()

const seed = async () => {
  // Create connection
  const dataSource = new DataSource({
    type: "postgres",
    url: config.database_url,
    logging: false,
  })

  await dataSource.initialize()

  console.log("Database connection established")
  
  // Create a region for the Netherlands
  const regionRepository = dataSource.getRepository("region")
  
  const nlRegion = await regionRepository.findOne({
    where: { name: "Netherlands" }
  })
  
  if (!nlRegion) {
    await regionRepository.save({
      name: "Netherlands",
      currency_code: "eur",
      tax_rate: 21,
      countries: ["nl"],
      created_at: new Date(),
      updated_at: new Date()
    })
    console.log("Created Netherlands region")
  }
  
  await dataSource.destroy()
  console.log("Seeding completed successfully")
}

module.exports = seed
