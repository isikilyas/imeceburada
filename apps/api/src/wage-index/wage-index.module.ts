import { Module } from "@nestjs/common";
import { WageIndexService } from "./wage-index.service";
import { WageIndexController } from "./wage-index.controller";

@Module({
  controllers: [WageIndexController],
  providers: [WageIndexService],
})
export class WageIndexModule {}
