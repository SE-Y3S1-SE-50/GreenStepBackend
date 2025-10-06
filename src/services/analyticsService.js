const Tree = require('../models/tree.model');
const CareRecord = require('../models/careRecord.model');
const GrowthMeasurement = require('../models/growthMeasurement.model');
const CareReminder = require('../models/careReminder.model');
const moment = require('moment');

class AnalyticsService {
  
  // Dashboard Statistics
  async getDashboardStats(userId) {
    try {
      const trees = await Tree.find({ userId, isActive: true });
      const careRecords = await CareRecord.find({ userId });
      const reminders = await CareReminder.find({ userId });
      
      const totalTrees = trees.length;
      const totalCarbonAbsorbed = trees.reduce((sum, tree) => sum + tree.carbonAbsorbed, 0);
      
      const averageHealth = totalTrees > 0 ? 
        trees.reduce((sum, tree) => {
          const healthScore = tree.healthStatus === 'excellent' ? 4 : 
                             tree.healthStatus === 'good' ? 3 :
                             tree.healthStatus === 'fair' ? 2 : 1;
          return sum + healthScore;
        }, 0) / totalTrees : 0;

      const totalCareRecords = careRecords.length;
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const treesPlantedThisMonth = trees.filter(tree => {
        const plantDate = new Date(tree.plantDate);
        return plantDate.getMonth() === currentMonth && plantDate.getFullYear() === currentYear;
      }).length;

      // Community stats (mock data - in real app, this would aggregate all users)
      const communityTotalTrees = totalTrees * 15;
      const communityTotalCarbon = totalCarbonAbsorbed * 15;

      const overdueReminders = await CareReminder.getOverdueReminders(userId);
      const upcomingReminders = await CareReminder.getUpcomingReminders(userId, 7);

      return {
        totalTrees,
        totalCarbonAbsorbed: Math.round(totalCarbonAbsorbed * 10) / 10,
        averageHealth: Math.round(averageHealth * 10) / 10,
        totalCareRecords,
        treesPlantedThisMonth,
        communityTotalTrees,
        communityTotalCarbon: Math.round(communityTotalCarbon * 10) / 10,
        overdueReminders: overdueReminders.length,
        upcomingReminders: upcomingReminders.length
      };
    } catch (error) {
      throw new Error(`Error getting dashboard stats: ${error.message}`);
    }
  }

  // Growth Trend Data
  async getGrowthTrendData(userId, months = 6) {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      
      const measurements = await GrowthMeasurement.find({
        userId,
        date: { $gte: startDate }
      }).populate('treeId', 'name species').sort({ date: 1 });

      // Group by month
      const monthlyData = {};
      const labels = [];
      
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().substring(0, 7); // YYYY-MM format
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        labels.push(monthLabel);
        monthlyData[monthKey] = { height: 0, diameter: 0, count: 0 };
      }

      // Aggregate measurements by month
      measurements.forEach(measurement => {
        const monthKey = measurement.date.toISOString().substring(0, 7);
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].height += measurement.height;
          monthlyData[monthKey].diameter += measurement.diameter;
          monthlyData[monthKey].count += 1;
        }
      });

      // Calculate averages
      const heightData = labels.map(label => {
        const monthKey = label.split(' ')[1] + '-' + String(new Date(label + ' 1').getMonth() + 1).padStart(2, '0');
        const data = monthlyData[monthKey];
        return data && data.count > 0 ? Math.round((data.height / data.count) * 100) / 100 : 0;
      });

      const diameterData = labels.map(label => {
        const monthKey = label.split(' ')[1] + '-' + String(new Date(label + ' 1').getMonth() + 1).padStart(2, '0');
        const data = monthlyData[monthKey];
        return data && data.count > 0 ? Math.round((data.diameter / data.count) * 1000) / 1000 : 0;
      });

      return {
        labels,
        datasets: [
          {
            label: 'Height (m)',
            data: heightData,
            color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`
          },
          {
            label: 'Diameter (m)',
            data: diameterData,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error getting growth trend data: ${error.message}`);
    }
  }

  // Carbon Absorption Data
  async getCarbonAbsorptionData(userId) {
    try {
      const trees = await Tree.find({ userId, isActive: true }).select('name species carbonAbsorbed');
      
      const speciesData = {};
      trees.forEach(tree => {
        const commonName = this.getCommonName(tree.species);
        if (!speciesData[commonName]) {
          speciesData[commonName] = 0;
        }
        speciesData[commonName] += tree.carbonAbsorbed;
      });

      return {
        labels: Object.keys(speciesData),
        datasets: [{
          data: Object.values(speciesData).map(val => Math.round(val * 10) / 10)
        }]
      };
    } catch (error) {
      throw new Error(`Error getting carbon absorption data: ${error.message}`);
    }
  }

  // Health Distribution
  async getHealthDistributionData(userId) {
    try {
      const trees = await Tree.find({ userId, isActive: true });
      
      const healthCounts = {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0
      };

      trees.forEach(tree => {
        healthCounts[tree.healthStatus]++;
      });

      return {
        labels: ['Excellent', 'Good', 'Fair', 'Poor'],
        datasets: [{
          data: [
            healthCounts.excellent,
            healthCounts.good,
            healthCounts.fair,
            healthCounts.poor
          ]
        }]
      };
    } catch (error) {
      throw new Error(`Error getting health distribution data: ${error.message}`);
    }
  }

  // Monthly Progress Data
  async getMonthlyProgressData(userId, months = 6) {
    try {
      const labels = [];
      const treeData = [];
      const careData = [];
      
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        labels.push(monthLabel);
        
        // Count trees planted this month
        const treesPlanted = await Tree.countDocuments({
          userId,
          plantDate: { $gte: startOfMonth, $lte: endOfMonth }
        });
        
        // Count care records this month
        const careRecords = await CareRecord.countDocuments({
          userId,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        });
        
        treeData.push(treesPlanted);
        careData.push(careRecords);
      }

      return {
        labels,
        datasets: [
          {
            label: 'Trees Planted',
            data: treeData,
            color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`
          },
          {
            label: 'Care Activities',
            data: careData,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error getting monthly progress data: ${error.message}`);
    }
  }

  // Species Distribution
  async getSpeciesDistributionData(userId) {
    try {
      const trees = await Tree.find({ userId, isActive: true });
      
      const speciesCount = {};
      trees.forEach(tree => {
        const commonName = this.getCommonName(tree.species);
        speciesCount[commonName] = (speciesCount[commonName] || 0) + 1;
      });

      return {
        labels: Object.keys(speciesCount),
        datasets: [{
          data: Object.values(speciesCount)
        }]
      };
    } catch (error) {
      throw new Error(`Error getting species distribution data: ${error.message}`);
    }
  }

  // Care Activity Analysis
  async getCareActivityData(userId, months = 6) {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      
      const careRecords = await CareRecord.find({
        userId,
        date: { $gte: startDate }
      });

      const actionCounts = {
        watering: 0,
        fertilizing: 0,
        pruning: 0,
        pest_control: 0,
        other: 0
      };

      careRecords.forEach(record => {
        actionCounts[record.action]++;
      });

      return {
        labels: ['Watering', 'Fertilizing', 'Pruning', 'Pest Control', 'Other'],
        datasets: [{
          data: [
            actionCounts.watering,
            actionCounts.fertilizing,
            actionCounts.pruning,
            actionCounts.pest_control,
            actionCounts.other
          ]
        }]
      };
    } catch (error) {
      throw new Error(`Error getting care activity data: ${error.message}`);
    }
  }

  // Tree Performance Analysis
  async getTreePerformanceAnalysis(userId) {
    try {
      const trees = await Tree.find({ userId, isActive: true }).populate('userId', 'firstName lastName');
      
      const performanceData = await Promise.all(
        trees.map(async (tree) => {
          const careRecords = await CareRecord.find({ treeId: tree._id });
          const growthMeasurements = await GrowthMeasurement.find({ treeId: tree._id }).sort({ date: 1 });
          
          const avgHealthRating = careRecords.length > 0 
            ? careRecords.reduce((sum, record) => sum + record.healthRating, 0) / careRecords.length
            : 0;

          const growthStats = growthMeasurements.length > 1 
            ? await GrowthMeasurement.getGrowthStats(tree._id)
            : null;

          const ageInDays = tree.ageInDays;
          const carbonPerDay = ageInDays > 0 ? tree.carbonAbsorbed / ageInDays : 0;

          return {
            treeId: tree._id,
            name: tree.name,
            species: tree.species,
            ageInDays,
            healthStatus: tree.healthStatus,
            carbonAbsorbed: tree.carbonAbsorbed,
            carbonPerDay: Math.round(carbonPerDay * 1000) / 1000,
            careRecordsCount: careRecords.length,
            avgHealthRating: Math.round(avgHealthRating * 10) / 10,
            growthStats,
            lastCareDate: careRecords.length > 0 ? careRecords[careRecords.length - 1].date : null
          };
        })
      );

      // Sort by performance (carbon per day)
      performanceData.sort((a, b) => b.carbonPerDay - a.carbonPerDay);

      return performanceData;
    } catch (error) {
      throw new Error(`Error getting tree performance analysis: ${error.message}`);
    }
  }

  // Community Analytics (aggregated data)
  async getCommunityAnalytics() {
    try {
      // This would typically aggregate data from all users
      // For now, we'll return mock community data
      const totalUsers = await require('../models/users.mongo').countDocuments();
      const totalTrees = await Tree.countDocuments({ isActive: true });
      const totalCarbonAbsorbed = await Tree.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$carbonAbsorbed' } } }
      ]);

      const speciesDistribution = await Tree.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$species', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      return {
        totalUsers,
        totalTrees,
        totalCarbonAbsorbed: totalCarbonAbsorbed.length > 0 ? Math.round(totalCarbonAbsorbed[0].total * 10) / 10 : 0,
        speciesDistribution: speciesDistribution.map(item => ({
          species: this.getCommonName(item._id),
          count: item.count
        }))
      };
    } catch (error) {
      throw new Error(`Error getting community analytics: ${error.message}`);
    }
  }

  // Helper method to get common names from scientific names
  getCommonName(scientificName) {
    const commonNames = {
      'Quercus robur': 'Oak',
      'Acer saccharum': 'Maple',
      'Pinus strobus': 'Pine',
      'Betula pendula': 'Birch',
      'Fraxinus excelsior': 'Ash',
      'Picea abies': 'Spruce',
      'Tilia cordata': 'Lime',
      'Carpinus betulus': 'Hornbeam',
      'Fagus sylvatica': 'Beech',
      'Populus tremula': 'Aspen'
    };
    
    return commonNames[scientificName] || scientificName;
  }

  // Generate comprehensive analytics report
  async generateAnalyticsReport(userId, period = '6months') {
    try {
      const months = period === '1year' ? 12 : period === '3months' ? 3 : 6;
      
      const [
        dashboardStats,
        growthTrend,
        carbonAbsorption,
        healthDistribution,
        monthlyProgress,
        speciesDistribution,
        careActivity,
        treePerformance,
        communityAnalytics
      ] = await Promise.all([
        this.getDashboardStats(userId),
        this.getGrowthTrendData(userId, months),
        this.getCarbonAbsorptionData(userId),
        this.getHealthDistributionData(userId),
        this.getMonthlyProgressData(userId, months),
        this.getSpeciesDistributionData(userId),
        this.getCareActivityData(userId, months),
        this.getTreePerformanceAnalysis(userId),
        this.getCommunityAnalytics()
      ]);

      return {
        period,
        generatedAt: new Date(),
        dashboard: dashboardStats,
        charts: {
          growthTrend,
          carbonAbsorption,
          healthDistribution,
          monthlyProgress,
          speciesDistribution,
          careActivity
        },
        performance: treePerformance,
        community: communityAnalytics
      };
    } catch (error) {
      throw new Error(`Error generating analytics report: ${error.message}`);
    }
  }
}

module.exports = new AnalyticsService();
