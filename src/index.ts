import { MikroORM } from '@mikro-orm/core';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { buildSchema } from 'type-graphql';
import { __prod__ } from './constants';
import microConfig from './mikro-orm.config';
import { PostsResolver } from './resolvers/posts';
import { UserResolver } from './resolvers/users';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { OrmContext } from './types';

const main = async () => {
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();

    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    app.use(
        session({
            name: 'qid',
            store: new RedisStore({ client: redisClient, disableTouch: true }),
            cookie: {
                httpOnly: true,
                maxAge: 1000 * 86400 * 365 * 10, // 10 years
                sameSite: 'lax',
                secure: __prod__,
            },
            saveUninitialized: false,
            secret: 'keyboard cat',
            resave: false,
        }),
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [PostsResolver, UserResolver],
            validate: false,
        }),
        context: ({ req, res }): OrmContext => ({ em: orm.em, req, res }),
    });

    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log('server started on localhost:4000');
    });
};

main().catch((err) => {
    console.error(err);
});
