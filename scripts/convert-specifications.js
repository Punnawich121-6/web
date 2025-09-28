const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

async function convertSpecifications() {
  try {
    console.log('Starting conversion of specifications from JSON to String...');

    // Find all equipment with non-null specifications
    const equipment = await prisma.equipment.findMany({
      where: {
        specifications: {
          not: null
        }
      }
    });

    console.log(`Found ${equipment.length} equipment items with specifications`);

    for (const item of equipment) {
      try {
        let newSpecifications = item.specifications;

        // If it's already a string, keep as is
        if (typeof item.specifications === 'string') {
          console.log(`Equipment ${item.name} already has string specifications`);
          continue;
        }

        // If it's an object/JSON, convert to string
        if (typeof item.specifications === 'object') {
          newSpecifications = JSON.stringify(item.specifications);
          console.log(`Converting ${item.name} specifications from JSON to string`);
        }

        // Update the equipment
        await prisma.equipment.update({
          where: { id: item.id },
          data: {
            specifications: newSpecifications
          }
        });

        console.log(`✓ Updated equipment: ${item.name}`);
      } catch (error) {
        console.error(`Error updating equipment ${item.name}:`, error);
      }
    }

    console.log('Conversion completed!');
  } catch (error) {
    console.error('Error during conversion:', error);
  } finally {
    await prisma.$disconnect();
  }
}

convertSpecifications();