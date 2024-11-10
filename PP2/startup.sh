npm i
npx prisma generate
npx prisma migrate dev --name init
node scripts/createAdmin.js