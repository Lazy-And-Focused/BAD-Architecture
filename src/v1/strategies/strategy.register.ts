import type { AuthTypes } from '@1/types';
import type { VerifyCallback } from 'passport-oauth2';
import type { Profile } from 'passport';

import { PassportStrategy } from '@nestjs/passport';

import { getPassportEnv } from 'f@/env';

type PassportData = { path: string; scopes: string[] }

const defaultPassports: Record<AuthTypes, PassportData> = {
  google: {
    path: "passport-google-oauth20",
    scopes: [],
  },
};

export class AuthStrategyRegister {
  public static readonly strategies: Map<AuthTypes, unknown>;
  public readonly strategies: Map<AuthTypes, unknown>;

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
      });

/* 
      ! FOR TESTING

      const a = new (PassportStrategy(GoogleStrategy, "google"))({
        clientID: client.id,
        clientSecret: client.secret,
        callbackURL: client.callback,
        scope: scopes
      });
 */

      ServiceStrategy.validate = async <Done extends (...data: unknown[]) => void = VerifyCallback>(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: Done,
      ) => {
        try {
          return done(null, null);
        } catch (error) {
          return done(error, null);
        }
      };

      this.strategies.set(passport as AuthTypes, ServiceStrategy);
      AuthStrategyRegister.strategies.set(passport as AuthTypes, ServiceStrategy);
    };
    
    return this;
  }
}