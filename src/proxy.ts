import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Media routes enforce authorization themselves so Blob requests are not
// rejected twice by Clerk's middleware and the route-level requireUser().
const isProtected = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtected(request)) await auth.protect();
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|webp|ico|ttf|woff2?)).*)", "/(api|trpc)(.*)"],
};
