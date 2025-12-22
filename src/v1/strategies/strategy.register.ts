import type { AuthTypes } from '@1/types';
import type { VerifyCallback } from 'passport-oauth2';
import type { Profile } from 'passport';

import { PassportStrategy } from '@nestjs/passport';
import OAuth2 = require("passport-oauth2");

import { getPassportEnv } from 'f@/env';

type PassportData = {
  path: string;
  scopes: string[];
  strategyName: string;
}

interface PassportStrategyMixin<TValidationResult = unknown> {
  validate(...args: any[]): TValidationResult | Promise<TValidationResult>;
}

const defaultPassports: Record<AuthTypes, PassportData> = {
  google: {
    path: "passport-google-oauth20",
    scopes: [],
    strategyName: "Strategy"
  },
};

export class AuthStrategyRegister {
  public static readonly strategies: Map<AuthTypes, unknown> = new Map();
  public readonly strategies: Map<AuthTypes, unknown> = new Map();

  public static getStrategy(strategy: string) {
    const output = this.strategies.get(strategy as AuthTypes);
    
    if (!output) {
      return null;
    }

    return output;
  }

  public execute() {
    for (const passport in defaultPassports) {
      const { path, scopes, strategyName } = defaultPassports[passport];
      const client = getPassportEnv(passport.toUpperCase() as Uppercase<AuthTypes>);
      
      const { [strategyName]: Strategy } = require(path);
      
      const ServiceStrategyClass = PassportStrategy(Strategy, passport);
      const ServiceStrategy = new ServiceStrategyClass({
        clientID: client.id,
        clientSecret: client.secret,
        callbackURL: client.callback,
        scope: scopes
      }) as (OAuth2 & PassportStrategyMixin);

/* 
      ! FOR TESTING

      const a = new (PassportStrategy(GoogleStrategy, "google"))({
        clientID: client.id,
        clientSecret: client.secret,
        callbackURL: client.callback,
        scope: scopes
      });
      */

      ServiceStrategy.validate = async (
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
      };

      this.strategies.set(passport as AuthTypes, ServiceStrategy);
      AuthStrategyRegister.strategies.set(passport as AuthTypes, ServiceStrategy);
    };
    
    return this;
  }
}

export default AuthStrategyRegister;
