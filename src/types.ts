import { EntityManager, IDatabaseDriver, Connection } from '@mikro-orm/core';
import { Request, Response } from 'express';

export type OrmContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;

    req: Request & { session: Request['session'] & { userId?: number } };

    res: Response;
};
