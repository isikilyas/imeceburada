import { Module } from "@nestjs/common";
import { SiteRequestsService } from "./site-requests.service";
import { SiteRequestsController } from "./site-requests.controller";

@Module({
  controllers: [SiteRequestsController],
  providers: [SiteRequestsService],
})
export class SiteRequestsModule {}
