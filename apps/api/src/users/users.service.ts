import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { unlink } from "fs/promises";
import { join } from "path";
import { PrismaService } from "../prisma/prisma.service";
import { RequestUser } from "../auth/types/request-user";
import { UpdateCandidateProfileDto } from "./dto/update-candidate-profile.dto";
import { UpdateCompanyProfileDto } from "./dto/update-company-profile.dto";
import { UpdateSubcontractorProfileDto } from "./dto/update-subcontractor-profile.dto";
import { UpdateSupplierProfileDto } from "./dto/update-supplier-profile.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMyProfile(user: RequestUser) {
    if (user.role === "CANDIDATE") {
      const profile = await this.prisma.candidateProfile.findUnique({ where: { userId: user.id } });
      if (!profile) throw new NotFoundException("Aday profili bulunamadı");
      return { role: "CANDIDATE", ...profile };
    }
    if (user.role === "COMPANY") {
      const profile = await this.prisma.companyProfile.findUnique({ where: { userId: user.id } });
      if (!profile) throw new NotFoundException("Şirket profili bulunamadı");
      return { role: "COMPANY", ...profile };
    }
    if (user.role === "SUBCONTRACTOR") {
      const profile = await this.prisma.subcontractorProfile.findUnique({ where: { userId: user.id } });
      if (!profile) throw new NotFoundException("Taşeron profili bulunamadı");
      return { role: "SUBCONTRACTOR", ...profile };
    }
    if (user.role === "SUPPLIER") {
      const profile = await this.prisma.supplierProfile.findUnique({ where: { userId: user.id } });
      if (!profile) throw new NotFoundException("Yapı Tedarik profili bulunamadı");
      return { role: "SUPPLIER", ...profile };
    }
    throw new BadRequestException("Bu rol için profil bulunmuyor");
  }

  async updateCandidateProfile(user: RequestUser, dto: UpdateCandidateProfileDto) {
    if (user.role !== "CANDIDATE") throw new BadRequestException("Sadece adaylar profil güncelleyebilir");
    return this.prisma.candidateProfile.update({ where: { userId: user.id }, data: dto });
  }

  async updateCompanyProfile(user: RequestUser, dto: UpdateCompanyProfileDto) {
    if (user.role !== "COMPANY") throw new BadRequestException("Sadece şirketler profil güncelleyebilir");
    return this.prisma.companyProfile.update({ where: { userId: user.id }, data: dto });
  }

  async updateSubcontractorProfile(user: RequestUser, dto: UpdateSubcontractorProfileDto) {
    if (user.role !== "SUBCONTRACTOR") throw new BadRequestException("Sadece taşeron firmalar profil güncelleyebilir");
    return this.prisma.subcontractorProfile.update({ where: { userId: user.id }, data: dto });
  }

  async updateSupplierProfile(user: RequestUser, dto: UpdateSupplierProfileDto) {
    if (user.role !== "SUPPLIER") throw new BadRequestException("Sadece yapı tedarik firmaları profil güncelleyebilir");
    return this.prisma.supplierProfile.update({ where: { userId: user.id }, data: dto });
  }

  async setCandidatePhoto(user: RequestUser, filename: string) {
    if (user.role !== "CANDIDATE") throw new BadRequestException("Sadece adaylar fotoğraf yükleyebilir");
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId: user.id } });
    if (!profile) throw new NotFoundException("Aday profili bulunamadı");

    if (profile.photoUrl) {
      await unlink(join(process.cwd(), profile.photoUrl)).catch(() => undefined);
    }

    const photoUrl = `/uploads/candidates/${filename}`;
    return this.prisma.candidateProfile.update({ where: { userId: user.id }, data: { photoUrl } });
  }

  async removeCandidatePhoto(user: RequestUser) {
    if (user.role !== "CANDIDATE") throw new BadRequestException("Sadece adaylar fotoğraf kaldırabilir");
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId: user.id } });
    if (!profile) throw new NotFoundException("Aday profili bulunamadı");

    if (profile.photoUrl) {
      await unlink(join(process.cwd(), profile.photoUrl)).catch(() => undefined);
    }
    return this.prisma.candidateProfile.update({ where: { userId: user.id }, data: { photoUrl: null } });
  }

  async getCompanyProfileIdForUser(userId: string): Promise<string> {
    const profile = await this.prisma.companyProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException("Şirket profili bulunamadı");
    return profile.id;
  }

  async getCandidateProfileIdForUser(userId: string): Promise<string> {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException("Aday profili bulunamadı");
    return profile.id;
  }
}
