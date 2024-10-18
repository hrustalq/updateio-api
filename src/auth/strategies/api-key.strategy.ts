import { HeaderAPIKeyStrategy } from "passport-headerapikey";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { UsersService } from "../../users/users.service"

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, 'api-key') {
  constructor(private usersService: UsersService) {
    super({ header: "apiKey", prefix: "" }, true, (apikey: string, done: boolean, _req: Request) => {
      console.log({ apiKey })
    
      const checkKey = this.usersService.findByApiKey(apikey);

      if (!checkKey) {
        return done(false);
      }
      return done(true);
    });
  }
}