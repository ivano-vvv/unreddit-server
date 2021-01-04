import 'reflect-metadata';
import { User } from '../entities/User';
import { Resolver, Ctx, Arg, Mutation, InputType, Field, ObjectType, Query } from 'type-graphql';
import { OrmContext } from '../types';
import argon2 from 'argon2';

@InputType()
class SigningInput {
    @Field()
    username: string;

    @Field()
    password: string;
}

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[] | null;

    @Field(() => User, { nullable: true })
    user?: User | null;
}

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    async me(@Ctx() { em, req }: OrmContext) {
        if (!req.session.userId) {
            return null;
        }

        const user = await em.findOne(User, { id: req.session.userId });
        return user;
    }

    @Mutation(() => UserResponse)
    async signUp(@Arg('signUpData') data: SigningInput, @Ctx() { em, req }: OrmContext): Promise<UserResponse> {
        const { username, password } = data;

        const errors: UserResponse['errors'] = [];

        if (username.length <= 3) {
            errors.push({
                field: 'username',
                message: 'length must be greater than 3',
            });
        }

        if (password.length <= 6) {
            errors.push({
                field: 'password',
                message: 'length must be greater than 6',
            });
        }

        if (errors.length !== 0) {
            return { errors };
        }

        const existedUser = em.findOne(User, { username });

        if (existedUser) {
            errors.push({
                field: 'username',
                message: 'the username has already been taken',
            });

            return { errors };
        }

        const hashedPassword = await argon2.hash(password);
        const user = em.create(User, {
            username,
            password: hashedPassword,
        });

        await em.persistAndFlush(user);

        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => UserResponse)
    async signIn(@Arg('signInData') data: SigningInput, @Ctx() { em, req }: OrmContext): Promise<UserResponse> {
        const { username, password } = data;

        const user = await em.findOne(User, { username });

        if (!user) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: "the user hasn't been found",
                    },
                ],
            };
        }

        const isValid = await argon2.verify(user.password, password);

        if (!isValid) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'the password is not correct',
                    },
                ],
            };
        }

        req.session.userId = user.id;

        return { user };
    }
}
