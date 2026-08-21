import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { JobsModule } from "./jobs/jobs.module";
import { ApplicationsModule } from "./applications/applications.module";
import { WageIndexModule } from "./wage-index/wage-index.module";
import { MaterialIndexModule } from "./material-index/material-index.module";
import { EquipmentModule } from "./equipment/equipment.module";
import { SiteRequestsModule } from "./site-requests/site-requests.module";
import { IyzicoModule } from "./iyzico/iyzico.module";
import { PhoneVerificationModule } from "./phone-verification/phone-verification.module";
import { MembershipModule } from "./membership/membership.module";
import { CandidatesModule } from "./candidates/candidates.module";
import { MaterialListingsModule } from "./material-listings/material-listings.module";
import { SubcontractorsModule } from "./subcontractors/subcontractors.module";
import { FavoritesModule } from "./favorites/favorites.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ name: "default", ttl: 60_000, limit: 100 }]),
    PrismaModule,
    IyzicoModule,
    AuthModule,
    UsersModule,
    JobsModule,
    ApplicationsModule,
    WageIndexModule,
    MaterialIndexModule,
    EquipmentModule,
    SiteRequestsModule,
    PhoneVerificationModule,
    MembershipModule,
    CandidatesModule,
    MaterialListingsModule,
    SubcontractorsModule,
    FavoritesModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}