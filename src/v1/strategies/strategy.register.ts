import type { AuthTypes } from '@1/types';
import type { VerifyCallback } from 'passport-oauth2';
import type { Profile } from 'passport';
import type OAuth2 from "passport-oauth2";

import { PassportStrategy } from '@nestjs/passport';

import { getPassportEnv } from 'f@/env';

type Strategies = Map<AuthTypes, OAuth2Strategy>;
type PassportData = {
  path: string;
  scopes: string[];
}

interface PassportStrategyMixin<TValidationResult = unknown> {
  validate(...args: unknown[]): TValidationResult | Promise<TValidationResult>;
}

export type OAuth2Strategy = OAuth2 & PassportStrategyMixin;

const defaultPassports: Record<AuthTypes, PassportData> = {
  google: {
    path: "passport-google-oauth20",
    scopes: ["profile", "email"],
  },
};

export class AuthStrategyRegister {
  public static readonly strategies: Strategies = new Map();
  public readonly strategies: Strategies = new Map();

  public static getStrategy(strategy: string) {
    const output = this.strategies.get(strategy as AuthTypes);
    
    if (!output) {
      return null;
    }

    return output;
  }

  public execute() {
    for (const passport in defaultPassports) {
      const { path, scopes } = defaultPassports[passport];
      const client = getPassportEnv(passport.toUpperCase() as Uppercase<AuthTypes>);
      
      const { Strategy } = require(path);
      
      const ServiceStrategyClass = PassportStrategy(Strategy, passport);
      const ServiceStrategy = new ServiceStrategyClass({
        clientID: client.id,
        clientSecret: client.secret,
        callbackURL: client.callback,
        scope: scopes
      }, async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
      ) => {
        try {
          return done(null, false);
        } catch (error) {
          return done(error, false);
        }
      }) as OAuth2Strategy;

      this.strategies.set(passport as AuthTypes, ServiceStrategy);
      AuthStrategyRegister.strategies.set(passport as AuthTypes, ServiceStrategy);
    };
    
    return this;
  }
}

export default AuthStrategyRegister;
