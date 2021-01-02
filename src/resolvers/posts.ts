import 'reflect-metadata';
import { Post } from '../entities/Post';
import { Resolver, Query, Ctx, Arg, Mutation } from 'type-graphql';
import { OrmContext } from '../types';

@Resolver()
export class PostsResolver {
    @Query(() => [Post])
    posts(@Ctx() { em }: OrmContext): Promise<Array<Post>> {
        return em.find(Post, {});
    }

    @Query(() => Post, { nullable: true })
    post(@Arg('id') id: number, @Ctx() { em }: OrmContext): Promise<Post | null> {
        return em.findOne(Post, { id });
    }

    @Mutation(() => Post)
    async createPost(@Arg('title') title: string, @Ctx() { em }: OrmContext): Promise<Post> {
        const post = em.create(Post, { title });

        await em.persistAndFlush(post);

        return post;
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg('id') id: number,
        @Arg('title', () => String, { nullable: true }) title: string,
        @Ctx() { em }: OrmContext,
    ): Promise<Post | null> {
        const post = await em.findOne(Post, { id });

        if (!post) {
            return null;
        }

        if (title) {
            post.title = title;
        }

        await em.persistAndFlush(post);

        return post;
    }

    @Mutation(() => Boolean)
    async deletePost(@Arg('id') id: number, @Ctx() { em }: OrmContext): Promise<boolean> {
        try {
            await em.nativeDelete(Post, { id });
        } catch {
            return false;
        }

        return true;
    }
}
