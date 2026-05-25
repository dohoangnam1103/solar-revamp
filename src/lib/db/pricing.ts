import { db } from './index'
import { pricingPackages } from './schema'
import { eq, and, asc } from 'drizzle-orm'

export async function getPricingPackages(page: string) {
  return db
    .select()
    .from(pricingPackages)
    .where(and(eq(pricingPackages.page, page), eq(pricingPackages.active, true)))
    .orderBy(asc(pricingPackages.sortOrder))
}
