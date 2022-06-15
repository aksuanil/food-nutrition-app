export const searchAutocompleteFood = async (client, query, results) => {
    let result;
    result = await client
        .db("NutritionApp")
        .collection("BasicFoodDetails")
        .aggregate([
            {
                $search: {
                    index: 'searchFood',
                    text: {
                        query: `'{"foodName": {$eq: "${query}"}}'`,
                        path: {
                            wildcard: '*'
                        }
                    }
                }
            },
            {
                $project: {
                    foodName: 1,
                },
            },
            {
                $limit: 10,
            },
        ])
        .toArray();
}


