/**
 * The app has no human auth system yet, so it runs single-tenant against a
 * seeded demo organization. When auth lands, replace reads of DEMO_ORG_ID
 * with the signed-in user's organization.
 */
export const DEMO_ORG_ID = "org_demo";
