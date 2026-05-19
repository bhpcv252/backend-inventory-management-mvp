import { UserRole } from "@prisma/client";

export interface JwtPayload {
	userId: string;
	organizationId: string;
	role: UserRole;
}
