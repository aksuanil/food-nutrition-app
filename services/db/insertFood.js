export default async function insertFood(client, foodObj) {
    const result = await client.db("NutritionApp").collection("BasicFoodDetails").insertOne(foodObj);
    console.log("New food inserted successfully " + result.insertedId);
};