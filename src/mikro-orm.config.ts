import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import { Post } from './entities/Post';
import path from 'path';
import { User } from './entities/User';

const microConfig = {
    migrations: {
        path: path.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    entities: [Post, User],
    dbName: 'unreddit',
    debug: !__prod__,
    type: 'postgresql',
} as Parameters<typeof MikroORM.init>[0];

export default microConfig;
