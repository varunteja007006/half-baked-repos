import { authRouter } from "./router/auth";
import { companyRouter } from "./router/company-router";
import { metaRouter } from "./router/meta-router";
import { organizationMemberRouter } from "./router/organization-member-router";
import { organizationRouter } from "./router/organization-router";
import { roleRouter } from "./router/role-router";
import { userRouter } from "./router/user-router";
import { vehicleRouter } from "./router/vehicle-router";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  company: companyRouter,
  meta: metaRouter,
  organization: organizationRouter,
  organizationMember: organizationMemberRouter,
  role: roleRouter,
  user: userRouter,
  vehicle: vehicleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
