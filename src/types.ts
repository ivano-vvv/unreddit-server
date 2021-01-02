import { EntityManager, IDatabaseDriver, Connection } from '@mikro-orm/core';

export type OrmContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
};
