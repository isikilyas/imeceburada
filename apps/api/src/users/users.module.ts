import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { TaxonomyModule } from "../taxonomy/taxonomy.module";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [TaxonomyModule, EmailModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
