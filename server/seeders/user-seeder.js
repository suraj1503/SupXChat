import { faker } from '@faker-js/faker';
import {User} from '../models/user-model.js'

const createUser = async(numUsers)=>{
    try {
        const usersPromise = [];

        for(let i=0;i<numUsers;i++){
            const tempUser = User.create({
                name:faker.person.fullName(),
                username:faker.internet.userName(),
                bio:faker.lorem.sentence(10),
                password:"password",
                avatar:{
                    url: faker.image.avatar(),
                    public_id:faker.system.fileName(),
                }
            })  
            // console.log(i);
            usersPromise.push(tempUser);
            console.log("User created",numUsers);
        }
        
        await Promise.all(usersPromise);
        process.exit(1);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

export {createUser};