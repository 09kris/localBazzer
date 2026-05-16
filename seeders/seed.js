const { City, Category } = require('../models');

const seedData = async () => {
  try {
    const cities = [
      { name: 'Mumbai' }, { name: 'Delhi' }, { name: 'Ahmedabad' },
      { name: 'Surat' }, { name: 'Bangalore' }, { name: 'Chennai' },
      { name: 'Pune' }, { name: 'Hyderabad' }, { name: 'Jaipur' }, { name: 'Kolkata' }
    ];

    const categories = [
      { name: 'Grocery', icon: 'shopping_basket' },
      { name: 'Clothing', icon: 'checkroom' },
      { name: 'Electronics', icon: 'devices' },
      { name: 'Food & Restaurant', icon: 'restaurant' },
      { name: 'Pharmacy', icon: 'local_pharmacy' },
      { name: 'Books & Stationery', icon: 'menu_book' },
      { name: 'Hardware', icon: 'handyman' },
      { name: 'Bakery & Sweets', icon: 'cake' }
    ];

    for (const city of cities) {
      await City.findOrCreate({ where: { name: city.name }, defaults: city });
    }

    for (const category of categories) {
      await Category.findOrCreate({ where: { name: category.name }, defaults: category });
    }

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
  }
};

module.exports = seedData;
