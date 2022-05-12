const express = require('express');
const translate = require('translate-google')

const app = express();
const PORT = process.env.PORT || 5000;
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

let foodArray = [];

app.listen(PORT, console.log(
    `Server started on port ${PORT}`));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('pages/index', {
        foods: foodArray
    })
})

app.post('/', urlencodedParser, async (req, res) => {
    foodArray = [];
    const search = await req.body.fname;
    await getFoodDataByName(search);
    res.render('pages/index', {
        foods: foodArray
    })
})

class Food {
    constructor(foodName, foodNameTurkish, proteinNutrientName, proteinValue, proteinUnitName, fatNutrientName, fatValue, fatUnitName, carbohydrateNutrientName, carbohydrateValue, carbohydrateUnitName, energyNutrientName, energyValue, energyUnitName, measureArr) {
        this.foodInfo = {
            foodName : foodName,
            foodNameTurkish : foodNameTurkish,
        };

        this.foodNutrients = {
            proteinNutrientName : proteinNutrientName,
            proteinValue : proteinValue,
            proteinUnitName : proteinUnitName,
            fatNutrientName : fatNutrientName,
            fatValue : fatValue,
            fatUnitName : fatUnitName,
            carbohydrateNutrientName : carbohydrateNutrientName,
            carbohydrateValue : carbohydrateValue,
            carbohydrateUnitName : carbohydrateUnitName,
            energyNutrientName : energyNutrientName,
            energyValue : energyValue,
            energyUnitName : energyUnitName,
        };

        this.foodMeasures = measureArr;
        
        foodArray.push(this);
    }
};

function translateTurkish(foodName) {
    return translate(foodName, { to: 'tr' })
}

async function getFoodDataByName(search) {
    const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=TRhDyoQ0vVrhRDZcaTMNUqWW8m684m0M5mt2hf7c&query=${search}&dataType=Survey%20%28FNDDS%29`)
    const result = await response.json();
    return Promise.all(result.foods.slice(0, 10).map(async (item) => {
        let foodName = item.description
        let foodNameTurkish = await translate(foodName, { to: 'tr' });

        let proteinNutrientName;
        let proteinValue;
        let proteinUnitName;
        let fatNutrientName;
        let fatValue;
        let fatUnitName;
        let carbohydrateNutrientName;
        let carbohydrateValue;
        let carbohydrateUnitName;
        let energyNutrientName;
        let energyValue;
        let energyUnitName;
        let disseminationText;
        let gramWeight;

        item.foodNutrients.slice(0, 10).map((item) => {
            if (item.nutrientId == 1003) // protein
            {
                proteinNutrientName = item.nutrientName;
                proteinValue = item.value;
                proteinUnitName = item.unitName;
            }
            else if (item.nutrientId == 1004) // fat 
            {
                fatNutrientName = item.nutrientName;
                fatValue = item.value;
                fatUnitName = item.unitName;
            }
            else if (item.nutrientId == 1005) // Carbohydrate
            {
                carbohydrateNutrientName = item.nutrientName;
                carbohydrateValue = item.value;
                carbohydrateUnitName = item.unitName;
            }
            else if (item.nutrientId == 1008) // Energy
            {
                energyNutrientName = item.nutrientName;
                energyValue = item.value;
                energyUnitName = item.unitName;
            }
        })
        let measureArr = [];
        item.foodMeasures.slice(0, 5).map((measure) => {
            disseminationText = measure.disseminationText;
            gramWeight = measure.gramWeight;
            measureArr.push( {disseminationText : disseminationText, gramWeight : gramWeight });
        });

        new Food(foodName, foodNameTurkish, proteinNutrientName, proteinValue, proteinUnitName, fatNutrientName, fatValue, fatUnitName, carbohydrateNutrientName, carbohydrateValue, carbohydrateUnitName, energyNutrientName, energyValue, energyUnitName, measureArr);
    }))

}

// const { MongoClient, ServerApiVersion } = require('mongodb');

// async function main() {
//     const uri = "mongodb+srv://aksuanil25:anilaksu25@cluster0.qcf7o.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
//     const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
//     try {
//         await client.connect();
//         await findFoodByName(client, "Potato");
//         // await client.db("NutritionApp").collection("BasicFoodDetails").deleteMany({})
//     } catch (error) {
//         console.log(error);
//     }
//     finally {
//         await client.close();
//     }
// }

// main().catch(console.error);

// async function listDatabases(client) {
//     const dbList = await client.db().admin().listDatabases();
//     console.log("Databases:");
//     dbList.databases.forEach(db => {
//         console.log(`${db.name}`);
//     });
// }

// async function createFood(client, newFood) {
//     const result = await client.db("NutritionApp").collection("BasicFoodDetails").insertOne(newFood);
//     console.log(result.insertedId)
// }

// async function findFoodByName(client, nameOfFood) {
//     const cursor = await client.db("NutritionApp").collection("BasicFoodDetails").find({ name: nameOfFood }).sort({ Nutrition: -1 })
//     const results = await cursor.toArray();
//     console.log(results);
// }