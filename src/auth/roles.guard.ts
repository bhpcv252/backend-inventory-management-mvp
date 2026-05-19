import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@prisma/client";
import { JwtPayload } from "../common/types/jwt-payload.type";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.get<UserRole[]>(
			"roles",
			context.getHandler(),
		);
		if (!requiredRoles || requiredRoles.length === 0) return true;
		const { user }: { user: JwtPayload } = context.switchToHttp().getRequest();
		return requiredRoles.includes(user.role);
	}
}
