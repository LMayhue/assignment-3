//Create the database connection

//Perform and database items
    //Create a user
        //new User has username, email, password

    //Search for a user and their recipes

    //create a new recipe (requires login)
        //new recipe has title, ingredients, instructions, userId
        //Optionally has description, prepTime, cookTime, servings.

    //edit a recipe (requires auth)

    //delete a recipe (requires auth)

    //add a recipe to a users favorites (requires login)
        //adds to the favorites database
        //requires recipeId, userId

    //show all recipes

    //show a single recipe
        //get all the details for the recipe based on recipeId

    //get a users favorites
        //get all the favorites that are tied to a usersId

    //add a rating for a recipe
        //only allow one rating per recipe per user
        //requires recipeId, userId, rating (1-5)

