ALTER TABLE favorites
    ADD CONSTRAINT user_recipe_favorite UNIQUE (user_id, recipe_id);