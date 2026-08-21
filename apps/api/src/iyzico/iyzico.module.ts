import { Global, Module } from "@nestjs/common";
import { IyzicoService } from "./iyzico.service";

@Global()
@Module({
  providers: [IyzicoService],
  exports: [IyzicoService],
})
export class IyzicoModule {}