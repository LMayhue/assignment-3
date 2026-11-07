import {pool} from './db/connection.js';
import {findUserById, removeUserById} from './models/users.js';


const deleteUser = async (userId) => {
    const input = process.argv[2];

    if (!input) {
        console.log("Usage: node delete-user.js <userId>");
        return;
    };
    const userId = Number(input);

    const user = await findUserById(userId);
    if (!user) {
        console.log(`No user found with id ${userId}.`);
        return;
    };

    const result = await removeUserById(userId);
    if (result === 1) {
        console.log(`User with id ${userId} (${user.username}) has been deleted.`);
    } else {
        console.log(`Failed to delete user with id ${userId}.`);
    }
};

try {
    await deleteUser();
} catch (error) {
    console.error("Something went wrong while deleting the user:");
    console.error(error);
} finally {
    await pool.end();
}