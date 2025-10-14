const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const EducationalContent = require('../models/educationalContent.model');
const Quiz = require('../models/quiz.model');

const seedEducationalData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await EducationalContent.deleteMany({});
    await Quiz.deleteMany({});
    console.log('Cleared existing educational data');

    // Sample educational content
    const educationalContent = [
      {
        contentId: 'what-is-reforestation',
        sectionId: 'basics',
        title: 'What is Reforestation?',
        content: `Reforestation is the process of replanting trees in areas where forests have been depleted, damaged, or destroyed. It involves establishing forest cover in previously forested areas that have been cleared due to deforestation, natural disasters, or other factors.

Key aspects of reforestation include:
• Restoring degraded forest ecosystems
• Planting native tree species suited to local conditions
• Creating sustainable forest management practices
• Involving local communities in conservation efforts

Reforestation differs from afforestation, which involves planting trees in areas that were not previously forested. Both practices are crucial for environmental restoration and climate change mitigation.

Benefits of Reforestation:
• Carbon sequestration to combat climate change
• Soil erosion prevention and watershed protection
• Habitat restoration for wildlife species
• Economic opportunities through sustainable forestry
• Improved air and water quality for communities`,
        order: 1
      },
      {
        contentId: 'importance-trees',
        sectionId: 'basics',
        title: 'Importance of Trees & Forests',
        content: `Trees and forests are fundamental to life on Earth, providing countless benefits to both the environment and human society.

Environmental Importance:
• Oxygen production through photosynthesis
• Carbon dioxide absorption and storage
• Air purification and pollution reduction
• Water cycle regulation and soil conservation
• Biodiversity habitat provision

Human Benefits:
• Timber and non-timber forest products
• Recreation and tourism opportunities
• Mental health and well-being benefits
• Natural cooling and temperature regulation
• Protection from natural disasters like floods and landslides

Ecosystem Services:
• Climate regulation at local and global scales
• Pollination services for agricultural crops
• Natural pest control through predator habitats
• Soil formation and nutrient cycling
• Cultural and spiritual significance for communities`,
        order: 2
      },
      {
        contentId: 'local-vs-native',
        sectionId: 'species-planting',
        title: 'Local vs. Non-native Species',
        content: `Choosing the right tree species is crucial for successful reforestation projects.

Native Species Advantages:
• Adapted to local climate and soil conditions
• Support local wildlife and ecosystem functions
• Require less maintenance and water
• Lower risk of becoming invasive
• Preserve genetic diversity and local ecosystems

Local Species Selection:
• Research historical vegetation of the area
• Consider climate change adaptation potential
• Evaluate growth rates and survival rates
• Assess wildlife habitat value
• Factor in human use and economic value

Non-native Species Considerations:
• May grow faster in certain conditions
• Can provide specific economic benefits
• Risk of becoming invasive and displacing natives
• May not support local wildlife effectively
• Could alter soil chemistry and ecosystem processes

Best Practices:
• Prioritize native species whenever possible
• Use local seed sources for genetic adaptation
• Mix species for ecosystem resilience
• Monitor long-term ecological impacts
• Involve local communities in species selection`,
        order: 1
      }
    ];

    await EducationalContent.insertMany(educationalContent);
    console.log('Created educational content');

    // Sample quizzes
    const quizzes = [
      {
        quizId: 'reforestation-basics-quiz',
        title: 'Reforestation Basics Quiz',
        category: 'basics',
        difficulty: 'easy',
        points: 10,
        questions: [
          {
            questionId: 'q1',
            question: 'What is reforestation?',
            options: [
              'Cutting down trees',
              'Replanting trees in depleted areas',
              'Building new forests in cities',
              'Moving forests to new locations'
            ],
            correctAnswer: 1,
            explanation: 'Reforestation is the process of replanting trees in areas where forests have been depleted or destroyed.'
          },
          {
            questionId: 'q2',
            question: 'Which of the following is a benefit of reforestation?',
            options: [
              'Increased air pollution',
              'Soil erosion',
              'Carbon sequestration',
              'Habitat destruction'
            ],
            correctAnswer: 2,
            explanation: 'Carbon sequestration is a major benefit of reforestation, helping to combat climate change by absorbing CO2 from the atmosphere.'
          },
          {
            questionId: 'q3',
            question: 'What is the difference between reforestation and afforestation?',
            options: [
              'There is no difference',
              'Reforestation replants in previously forested areas, afforestation plants in new areas',
              'Afforestation is only done in cities',
              'Reforestation uses only native species'
            ],
            correctAnswer: 1,
            explanation: 'Reforestation involves replanting in previously forested areas, while afforestation involves planting trees in areas that were not previously forested.'
          },
          {
            questionId: 'q4',
            question: 'Why are trees important for oxygen production?',
            options: [
              'They store oxygen in their roots',
              'They produce oxygen through photosynthesis',
              'They convert carbon into oxygen',
              'They absorb oxygen from the soil'
            ],
            correctAnswer: 1,
            explanation: 'Trees produce oxygen through the process of photosynthesis, where they use sunlight, water, and carbon dioxide to create energy and release oxygen.'
          },
          {
            questionId: 'q5',
            question: 'What role do forests play in the water cycle?',
            options: [
              'They have no role in the water cycle',
              'They only consume water',
              'They regulate the water cycle and protect watersheds',
              'They dry out the surrounding areas'
            ],
            correctAnswer: 2,
            explanation: 'Forests play a crucial role in regulating the water cycle through evapotranspiration, groundwater recharge, and watershed protection.'
          }
        ]
      },
      {
        quizId: 'tree-species-quiz',
        title: 'Tree Species Selection Quiz',
        category: 'species-planting',
        difficulty: 'medium',
        points: 15,
        questions: [
          {
            questionId: 'q1',
            question: 'Why should native species be prioritized in reforestation?',
            options: [
              'They are cheaper',
              'They are adapted to local conditions and support local wildlife',
              'They grow faster than other species',
              'They require more maintenance'
            ],
            correctAnswer: 1,
            explanation: 'Native species are adapted to local climate and soil conditions, support local wildlife better, and require less maintenance.'
          },
          {
            questionId: 'q2',
            question: 'What is a risk of planting non-native species?',
            options: [
              'They always grow too slowly',
              'They become invasive and displace native plants',
              'They produce too much oxygen',
              'They are always expensive'
            ],
            correctAnswer: 1,
            explanation: 'Non-native species can become invasive, displacing native plants and disrupting local ecosystems.'
          },
          {
            questionId: 'q3',
            question: 'What should be considered when selecting tree species?',
            options: [
              'Only the cost',
              'Climate, soil, wildlife value, and community needs',
              'Just the growth rate',
              'Only the appearance'
            ],
            correctAnswer: 1,
            explanation: 'Multiple factors should be considered including climate adaptation, soil conditions, wildlife habitat value, and community needs.'
          },
          {
            questionId: 'q4',
            question: 'Why is species diversity important in reforestation?',
            options: [
              'It makes forests look prettier',
              'It increases ecosystem resilience and supports more wildlife',
              'It makes maintenance easier',
              'It reduces costs'
            ],
            correctAnswer: 1,
            explanation: 'Species diversity increases ecosystem resilience, supports more wildlife, and helps forests adapt to changing conditions.'
          }
        ]
      },
      {
        quizId: 'climate-change-quiz',
        title: 'Climate Change & Forests Quiz',
        category: 'environmental-awareness',
        difficulty: 'hard',
        points: 20,
        questions: [
          {
            questionId: 'q1',
            question: 'How much CO2 can a mature tree absorb per year on average?',
            options: [
              '5-10 kg',
              '20-30 kg',
              '50-100 kg',
              '200-300 kg'
            ],
            correctAnswer: 1,
            explanation: 'A mature tree can absorb approximately 20-30 kg of CO2 per year, though this varies by species and growing conditions.'
          },
          {
            questionId: 'q2',
            question: 'What happens to carbon stored in forests when they are cut down?',
            options: [
              'It stays in the soil forever',
              'It is released back into the atmosphere',
              'It turns into oxygen',
              'It disappears completely'
            ],
            correctAnswer: 1,
            explanation: 'When forests are cut down and burned or decompose, the carbon stored in trees is released back into the atmosphere as CO2.'
          },
          {
            questionId: 'q3',
            question: 'How do forests help moderate local temperatures?',
            options: [
              'They reflect all sunlight',
              'Through evapotranspiration and shade',
              'They have no effect on temperature',
              'They only warm the area'
            ],
            correctAnswer: 1,
            explanation: 'Forests moderate temperatures through evapotranspiration, which has a cooling effect, and by providing shade.'
          }
        ]
      }
    ];

    await Quiz.insertMany(quizzes);
    console.log('Created quizzes');

    console.log('✅ Educational data seeded successfully!');
    console.log(`📚 Created:`);
    console.log(`   - ${educationalContent.length} educational content items`);
    console.log(`   - ${quizzes.length} quizzes`);

  } catch (error) {
    console.error('❌ Error seeding educational data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

if (require.main === module) {
  seedEducationalData();
}

module.exports = seedEducationalData;