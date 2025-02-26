import pgPromise from 'pg-promise'

const pgp = pgPromise()
const db = pgp({
  host: 'localhost',
  port: 5432,
  database: 'agencia',
  user: 'postgres',
  password: 'mysecretpassword',
  max:2
})  

export default db
