## to initialize project

```
npm init -y
```

## dependencies

```
npm install express cors dotenv
```

## development dependencies

```
npm install -D typescript @types/node @types/express @types/cors ts-node nodemon
```

## prisma

```
npm install prisma @prisma/client
```

```
npm install -D prisma
```

## initialize typescript

```
npx tsc --init
```

## update tsconfig file with this

```
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*", "**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

## initialize prisma

```
npx prisma init
```

## to keep the project code aware with prisma tables
```
npx prisma generate
```

## swagger

```
npm install swagger-jsdoc swagger-ui-express
```

```
npm install -D @types/swagger-jsdoc @types/swagger-ui-express
```

## ⚠️ dont' do this <to run initial migration>
```
npx prisma migrate dev --name init
```

## redis

### make sure you have docker in your system installed
```
docker run -d --name redis -p 6379:6379 redis
```

```
docker exec -it redis redis-cli
```

### test it by writing ping and response will say pong