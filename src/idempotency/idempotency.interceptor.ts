import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
	constructor(private prisma: PrismaService) {}

	async intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Promise<Observable<any>> {
		const req = context.switchToHttp().getRequest();
		const res = context.switchToHttp().getResponse();

		// skip reads
		if (req.method === "GET") return next.handle();

		const key = req.headers["idempotency-key"] as string | undefined;
		if (!key) return next.handle();

		const organizationId: string | undefined = req.user?.organizationId;
		if (!organizationId) return next.handle();

		const existing = await this.prisma.idempotencyRecord.findFirst({
			where: { key, organizationId, expiresAt: { gt: new Date() } },
		});

		if (existing) {
			// replay cached response, skip the handler entirely
			res.status(existing.statusCode).json(existing.responseBody);
			return new Observable((subscriber) => subscriber.complete());
		}

		return next.handle().pipe(
			tap((body) => {
				if (res.statusCode >= 200 && res.statusCode < 300) {
					// don't block the response
					this.prisma.idempotencyRecord
						.create({
							data: {
								key,
								organizationId,
								responseBody: body,
								statusCode: res.statusCode,
								expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
							},
						})
						.catch(() => {
							// non-critical, DB-level unique constraint is the hard safety net
						});
				}
			}),
		);
	}
}
