ALTER TABLE ratings
    ADD CONSTRAINT user_recipe_rating UNIQUE (user_id, recipe_id);


ALTER TABLE favorites
    ADD CONSTRAINT user_recipe_favorite UNIQUE (user_id, recipe_id);