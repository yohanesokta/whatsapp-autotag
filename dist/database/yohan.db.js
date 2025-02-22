"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data_user = void 0;
let database = {
//   : enum("openai,googleai,undifined")
};
const data_user = (usernumber) => {
    return database[usernumber] || undefined;
};
exports.data_user = data_user;
