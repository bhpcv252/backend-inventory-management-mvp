import {
	ConflictException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtPayload } from "../common/types/jwt-payload.type";

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
	) {}

	async signup(dto: SignupDto) {
		const existing = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});
		if (existing) throw new ConflictException("Email already in use");

		const passwordHash = await bcrypt.hash(dto.password, 10);

		const { org, user } = await this.prisma.$transaction(async (tx) => {
			const org = await tx.organization.create({
				data: { name: dto.organizationName },
			});
			const user = await tx.user.create({
				data: { email: dto.email, passwordHash, organizationId: org.id },
			});
			return { org, user };
		});

		const payload: JwtPayload = {
			userId: user.id,
			organizationId: org.id,
			role: user.role,
		};
		return { accessToken: this.jwt.sign(payload) };
	}

	async login(dto: LoginDto) {
		const user = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});
		// Deliberate: same error for "not found" and "wrong password" to avoid user enumeration
		if (!user) throw new UnauthorizedException("Invalid credentials");

		const valid = await bcrypt.compare(dto.password, user.passwordHash);
		if (!valid) throw new UnauthorizedException("Invalid credentials");

		const payload: JwtPayload = {
			userId: user.id,
			organizationId: user.organizationId,
			role: user.role,
		};
		return { accessToken: this.jwt.sign(payload) };
	}
}
