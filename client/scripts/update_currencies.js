const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'currencies.json');
let currencies = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const indiaIndex = currencies.findIndex(c => c.countryCode === 'IN');
if (indiaIndex > -1) {
    const india = currencies.splice(indiaIndex, 1)[0];
    currencies.unshift(india);
    fs.writeFileSync(filePath, JSON.stringify(currencies, null, 4));
    console.log("Moved India to the top of currencies.json");
} else {
    console.log("India not found in currencies.json");
}
