let database:any = {
    //   : enum("openai,googleai,undifined")
}

export const data_user = (usernumber : string) => {
    return database[usernumber] || undefined
}