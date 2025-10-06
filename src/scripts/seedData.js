const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const moment = require('moment');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/users.mongo');
const Tree = require('../models/tree.model');
const CareRecord = require('../models/careRecord.model');
const GrowthMeasurement = require('../models/growthMeasurement.model');
const CareReminder = require('../models/careReminder.model');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Tree.deleteMany({});
    await CareRecord.deleteMany({});
    await GrowthMeasurement.deleteMany({});
    await CareReminder.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.insertMany([
      {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        password: hashedPassword
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        email: 'jane@example.com',
        phoneNumber: '+1234567891',
        password: hashedPassword
      }
    ]);
    console.log('Created sample users');

    const johnId = users[0]._id;
    const janeId = users[1]._id;

    // Create sample trees
    const trees = await Tree.insertMany([
      {
        userId: johnId,
        name: 'Oak Tree #1',
        species: 'Quercus robur',
        location: 'Backyard Garden',
        plantDate: moment().subtract(6, 'months').toDate(),
        height: 2.5,
        diameter: 0.15,
        healthStatus: 'excellent',
        lastWatered: moment().subtract(3, 'days').toDate(),
        lastFertilized: moment().subtract(2, 'weeks').toDate(),
        notes: 'Growing well in partial shade',
        carbonAbsorbed: 12.5
      },
      {
        userId: johnId,
        name: 'Maple Tree #1',
        species: 'Acer saccharum',
        location: 'Front Yard',
        plantDate: moment().subtract(4, 'months').toDate(),
        height: 1.8,
        diameter: 0.12,
        healthStatus: 'good',
        lastWatered: moment().subtract(5, 'days').toDate(),
        lastFertilized: moment().subtract(3, 'weeks').toDate(),
        notes: 'Needs more sunlight',
        carbonAbsorbed: 8.2
      },
      {
        userId: johnId,
        name: 'Pine Tree #1',
        species: 'Pinus strobus',
        location: 'Side Garden',
        plantDate: moment().subtract(8, 'months').toDate(),
        height: 3.2,
        diameter: 0.18,
        healthStatus: 'excellent',
        lastWatered: moment().subtract(2, 'days').toDate(),
        lastFertilized: moment().subtract(1, 'month').toDate(),
        notes: 'Thriving in current location',
        carbonAbsorbed: 18.7
      },
      {
        userId: janeId,
        name: 'Birch Tree #1',
        species: 'Betula pendula',
        location: 'Community Garden',
        plantDate: moment().subtract(3, 'months').toDate(),
        height: 1.2,
        diameter: 0.08,
        healthStatus: 'good',
        lastWatered: moment().subtract(1, 'day').toDate(),
        lastFertilized: moment().subtract(2, 'weeks').toDate(),
        notes: 'Recently transplanted',
        carbonAbsorbed: 4.1
      },
      {
        userId: janeId,
        name: 'Ash Tree #1',
        species: 'Fraxinus excelsior',
        location: 'Park Corner',
        plantDate: moment().subtract(5, 'months').toDate(),
        height: 2.1,
        diameter: 0.13,
        healthStatus: 'fair',
        lastWatered: moment().subtract(6, 'days').toDate(),
        lastFertilized: moment().subtract(1, 'month').toDate(),
        notes: 'Recovering from storm damage',
        carbonAbsorbed: 9.8
      }
    ]);
    console.log('Created sample trees');

    // Create sample care records
    const careRecords = [];
    const actions = ['watering', 'fertilizing', 'pruning', 'pest_control'];
    
    for (let i = 0; i < 30; i++) {
      const tree = trees[Math.floor(Math.random() * trees.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const date = moment().subtract(Math.floor(Math.random() * 90), 'days').toDate();
      
      careRecords.push({
        treeId: tree._id,
        userId: tree.userId,
        date: date,
        action: action,
        notes: `Sample ${action} activity for ${tree.name}`,
        healthRating: Math.floor(Math.random() * 3) + 3, // 3-5
        duration: Math.floor(Math.random() * 60) + 10, // 10-70 minutes
        weather: {
          temperature: Math.floor(Math.random() * 30) + 5, // 5-35°C
          humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
          conditions: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)]
        }
      });
    }
    
    await CareRecord.insertMany(careRecords);
    console.log('Created sample care records');

    // Create sample growth measurements
    const growthMeasurements = [];
    
    for (const tree of trees) {
      const monthsSincePlanting = moment().diff(moment(tree.plantDate), 'months');
      const initialHeight = tree.height * 0.6; // Start smaller
      const initialDiameter = tree.diameter * 0.8;
      
      for (let month = 1; month <= Math.min(monthsSincePlanting, 6); month++) {
        const measurementDate = moment(tree.plantDate).add(month, 'months').toDate();
        const heightGrowth = (tree.height - initialHeight) * (month / monthsSincePlanting);
        const diameterGrowth = (tree.diameter - initialDiameter) * (month / monthsSincePlanting);
        
        growthMeasurements.push({
          treeId: tree._id,
          userId: tree.userId,
          date: measurementDate,
          height: initialHeight + heightGrowth,
          diameter: initialDiameter + diameterGrowth,
          canopySpread: (initialHeight + heightGrowth) * 0.7,
          notes: `Monthly measurement - month ${month}`,
          measuredBy: 'user',
          measurementMethod: 'tape',
          accuracy: 95,
          weather: {
            temperature: Math.floor(Math.random() * 25) + 10,
            humidity: Math.floor(Math.random() * 30) + 50,
            conditions: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)]
          }
        });
      }
    }
    
    await GrowthMeasurement.insertMany(growthMeasurements);
    console.log('Created sample growth measurements');

    // Create sample care reminders
    const careReminders = [];
    
    for (const tree of trees) {
      // Watering reminder (weekly)
      careReminders.push({
        treeId: tree._id,
        userId: tree.userId,
        type: 'watering',
        dueDate: moment().add(3, 'days').toDate(),
        priority: 'high',
        notes: 'Weekly watering reminder',
        frequency: 'weekly',
        isRecurring: true
      });
      
      // Health check reminder (monthly)
      careReminders.push({
        treeId: tree._id,
        userId: tree.userId,
        type: 'health_check',
        dueDate: moment().add(2, 'weeks').toDate(),
        priority: 'medium',
        notes: 'Monthly health check',
        frequency: 'monthly',
        isRecurring: true
      });
      
      // Fertilizing reminder (seasonal)
      if (Math.random() > 0.5) {
        careReminders.push({
          treeId: tree._id,
          userId: tree.userId,
          type: 'fertilizing',
          dueDate: moment().add(1, 'month').toDate(),
          priority: 'medium',
          notes: 'Seasonal fertilizing',
          frequency: 'seasonal',
          isRecurring: true
        });
      }
    }
    
    await CareReminder.insertMany(careReminders);
    console.log('Created sample care reminders');

    console.log('✅ Sample data seeded successfully!');
    console.log(`📊 Created:`);
    console.log(`   - ${users.length} users`);
    console.log(`   - ${trees.length} trees`);
    console.log(`   - ${careRecords.length} care records`);
    console.log(`   - ${growthMeasurements.length} growth measurements`);
    console.log(`   - ${careReminders.length} care reminders`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
if (require.main === module) {
  seedData();
}

module.exports = seedData;
