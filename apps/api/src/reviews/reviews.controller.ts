import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user";

@Controller()
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post("applications/:applicationId/reviews")
  createReview(
    @CurrentUser() user: RequestUser,
    @Param("applicationId") applicationId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(user, applicationId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("applications/:applicationId/reviews")
  listReviewsForApplication(@CurrentUser() user: RequestUser, @Param("applicationId") applicationId: string) {
    return this.reviewsService.listReviewsForApplication(user, applicationId);
  }

  /** Herkese açık — profil/ilan kartlarında güvenilirlik puanı olarak gösterilir. */
  @Get("users/:userId/reviews/summary")
  getUserReviewSummary(@Param("userId") userId: string) {
    return this.reviewsService.getUserReviewSummary(userId);
  }
}
