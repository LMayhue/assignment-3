import {pool} from './db/connection.js';
import {findUserById, removeUserById} from './models/users.js';
import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output} from 'node:process';

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

    //Ask for confirmation before deleting anything
    const rl = readline.createInterface({input, output});
    const answer = await rl.question(`Delete ${user.username} and all of their recipes? (y/n) `);
    rl.close();

    //Anything other than "y" or "yes" cancels
    const confirmed = ['y', 'yes'].includes(answer.trim().toLowerCase());
    if (!confirmed) {
        console.log('Cancelled. Nothing was deleted.');
        return;
    }

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