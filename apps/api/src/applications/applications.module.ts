import { Module } from "@nestjs/common";
import { ApplicationsService } from "./applications.service";
import { ApplicationsController } from "./applications.controller";
import { UsersModule } from "../users/users.module";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [UsersModule, EmailModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
