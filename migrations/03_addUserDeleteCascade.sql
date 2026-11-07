--Allow deleting users and cascading that delete to any
--associated sessions, recipes, and favorites.

--Deleting users will only occur from the command line

-- sessions.user_id
ALTER TABLE sessions
    DROP CONSTRAINT sessions_user_id_fkey;
ALTER TABLE sessions
    ADD CONSTRAINT sessions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- recipes.user_id
ALTER TABLE recipes
    DROP CONSTRAINT recipes_user_id_fkey;
ALTER TABLE recipes
    ADD CONSTRAINT recipes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- favorites.user_id
ALTER TABLE favorites
    DROP CONSTRAINT favorites_user_id_fkey;
ALTER TABLE favorites
    ADD CONSTRAINT favorites_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;