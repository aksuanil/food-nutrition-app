import fetch from 'node-fetch';
import express from 'express';
import translate from 'translate-google';
import bodyParser from 'body-parser';
import insertFoodData from './services/db/insertFood.js';
import { searchAutocompleteFood } from './services/db/searchFood.js';
import { MongoClient, ServerApiVersion } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 5000;
let client;

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
app.get('/createMeal', (req, res) => {
    res.render('pages/createMeal', {})
})

app.get('/createMeal/searchFood', async (req, res) => {
    let foodResultArray = [];
    await searchAutocompleteFood(client, req.query.search, foodResultArray);
    res.render('pages/createMeal/searchFood', { data: foodResultArray });
});

async function connectMongo() {
    const uri = "mongodb+srv://aksuanil25:aksuanil25@cluster0.qcf7o.mongodb.net/retryWrites=true&w=majority";
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    try {
        await client.connect();
        // await findFoodByName(client, "Potato");
        // await client.db("NutritionApp").collection("BasicFoodDetails").deleteMany({})
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log(error);
    }
    // finally {
    //     console.log('Connected to MongoDB');
    //     await client.close();
    // }
}
connectMongo().catch(console.error);

app.post('/', urlencodedParser, async (req, res) => {
    foodArray = [];
    const search = await req.body.fname;
    await getFoodDataByName(search);
    res.render('pages/index', {
        foods: foodArray
    })
    console.log(foodArray[0]);
})

app.post('/add', urlencodedParser, async (req, res) => {
    foodArray = [];
    const search = await req.body.postFood;
    const obj = JSON.parse(search);
    //Mongo Insert
    await insertFoodData(client, obj);
})

class Food {
    constructor(foodName, foodNameTurkish, foodCategory,
        protein,
        fat,
        carbohydrate,
        energy,
        vitaminA,
        vitaminE,
        vitaminD,
        vitaminC,
        vitaminB6,
        vitaminB12,
        vitaminK,
        vitaminB1,
        vitaminB2,
        vitaminB3,
        calcium,
        iron,
        magnesium,
        phosphorus,
        potassium,
        sodium,
        zinc,
        copper,
        selenium,
        water,
        sugar,
        caffeine,
        alcohol,
        caroteneAlpha,
        caroteneBeta,
        folicAcid,
        cholesterol,
        choline,
        lycopene,
        measureArr) {
        this.foodName = foodName,
            this.foodNameTurkish = foodNameTurkish,
            this.foodCategory = foodCategory,

            this.nutrients = {
                protein: protein,
                carbohydrate: carbohydrate,
                fat: fat,
                energy: energy,
            };
        this.vitamins = {
            vitaminA: vitaminA,
            vitaminB1: vitaminB1,
            vitaminB2: vitaminB2,
            vitaminB3: vitaminB3,
            vitaminB6: vitaminB6,
            vitaminB12: vitaminB12,
            vitaminC: vitaminC,
            vitaminD: vitaminD,
            vitaminE: vitaminE,
            vitaminK: vitaminK,
        };
        this.minerals = {
            calcium: calcium,
            iron: iron,
            magnesium: magnesium,
            phosphorus: phosphorus,
            potassium: potassium,
            sodium: sodium,
            zinc: zinc,
            copper: copper,
            selenium: selenium,
        };
        this.misc = {
            water: water,
            sugar: sugar,
            caffeine: caffeine,
            alcohol: alcohol,
            caroteneAlpha: caroteneAlpha,
            caroteneBeta: caroteneBeta,
            folicAcid: folicAcid,
            cholesterol: cholesterol,
            choline: choline,
            lycopene: lycopene,
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
        let foodCategory = item.foodCategory;
        let protein;
        let fat;
        let carbohydrate;
        let energy;
        let vitaminA;
        let vitaminE;
        let vitaminD;
        let vitaminC;
        let vitaminB6;
        let vitaminB12;
        let vitaminK;
        let vitaminB1;
        let vitaminB2;
        let vitaminB3;
        let calcium;
        let iron;
        let magnesium;
        let phosphorus;
        let potassium;
        let sodium;
        let zinc;
        let copper;
        let selenium;
        let water;
        let sugar;
        let caffeine;
        let alcohol;
        let caroteneAlpha;
        let caroteneBeta;
        let folicAcid;
        let cholesterol;
        let choline;
        let lycopene;
        let measure;
        let gramWeight;

        item.foodNutrients.map((item) => {
            if (item.nutrientId == 1003) // protein
                protein = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1004) // fat 
                fat = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1005) // Carbohydrate
                carbohydrate = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1008) // Energy
                energy = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1106) // A
                vitaminA = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1109) // E 
                vitaminE = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1114) // D
                vitaminD = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1162) // C
                vitaminC = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1175) // B6
                vitaminB6 = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1178) // B12
                vitaminB12 = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1185) // K
                vitaminK = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1165) // B1
                vitaminB1 = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1166) // B2
                vitaminB2 = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1167) // B3
                vitaminB3 = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1087) // Calcium
                calcium = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1089) // Iron
                iron = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1090) // magnesium
                magnesium = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1091) // phosphorus
                phosphorus = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1092) // potassium
                potassium = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1093) // sodium
                sodium = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1095) // zinc
                zinc = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1098) // copper
                copper = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1103) // selenium
                selenium = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1051) // water
                water = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 2000) // sugar
                sugar = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1057) // caffeine
                caffeine = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1018) // alcohol
                alcohol = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1108) // caroteneAlpha
                caroteneAlpha = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1107) // caroteneBeta
                caroteneBeta = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1186) // folicAcid
                folicAcid = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1253) // cholesterol
                cholesterol = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1180) // choline
                choline = { "value": item.value, "unitName": item.unitName }
            else if (item.nutrientId == 1122) // lycopene
                lycopene = { "value": item.value, "unitName": item.unitName }
        })
        let measureArr = [];
        item.foodMeasures.slice(0, 5).map((item) => {
            measure = item.disseminationText;
            gramWeight = item.gramWeight;
            measureArr.push({ measure: measure, gramWeight: gramWeight });
        });

        new Food(foodName, foodNameTurkish, foodCategory,
            protein,
            fat,
            carbohydrate,
            energy,
            vitaminA,
            vitaminE,
            vitaminD,
            vitaminC,
            vitaminB6,
            vitaminB12,
            vitaminK,
            vitaminB1,
            vitaminB2,
            vitaminB3,
            calcium,
            iron,
            magnesium,
            phosphorus,
            potassium,
            sodium,
            zinc,
            copper,
            selenium,
            water,
            sugar,
            caffeine,
            alcohol,
            caroteneAlpha,
            caroteneBeta,
            folicAcid,
            cholesterol,
            choline,
            lycopene,
            measureArr);
    }))

}




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