require('dotenv').config();const{Pool}=require('pg'),{steps,isNum}=require('../spec');
const cols=g=>steps(g).flat().map(f=>`${f.k} ${isNum(f)?'INTEGER':'TEXT'}${f.c?'':' NOT NULL'}`).join(',\n  ');
const sql=`
CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY,phone TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,
 gender TEXT NOT NULL CHECK(gender IN('groom','bride')),status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN('pending','verified')),
 created_at TIMESTAMPTZ DEFAULT now(),verified_at TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS groom_profiles(user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  ${cols('groom')});
CREATE TABLE IF NOT EXISTS bride_profiles(user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  ${cols('bride')});
CREATE TABLE IF NOT EXISTS verification_codes(code TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 expires_at TIMESTAMPTZ NOT NULL,used BOOLEAN DEFAULT false,created_at TIMESTAMPTZ DEFAULT now());
ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;
CREATE TABLE IF NOT EXISTS admins(id SERIAL PRIMARY KEY,username TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS favorites(user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,profile_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
 created_at TIMESTAMPTZ DEFAULT now(),PRIMARY KEY(user_id,profile_id));
CREATE TABLE IF NOT EXISTS intro_requests(id SERIAL PRIMARY KEY,from_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,to_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 status TEXT NOT NULL DEFAULT 'new' CHECK(status IN('new','contacted','closed')),note TEXT,created_at TIMESTAMPTZ DEFAULT now(),UNIQUE(from_id,to_id));`;
if(process.argv[2]==='--print'){console.log(sql);process.exit()}
require('./pool')().query(sql).then(()=>{console.log('tables ready');process.exit()}).catch(e=>{console.error(e.message);process.exit(1)});
