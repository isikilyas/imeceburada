import { Module } from "@nestjs/common";
import { MaterialIndexService } from "./material-index.service";
import { MaterialIndexController } from "./material-index.controller";

@Module({
  controllers: [MaterialIndexController],
  providers: [MaterialIndexService],
})
export class MaterialIndexModule {}
