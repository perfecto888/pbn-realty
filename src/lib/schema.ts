import {
  pgTable,
  serial,
  varchar,
  numeric,
  integer,
  jsonb,
  timestamp,
  index,
  text,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Properties table
export const properties = pgTable(
  'properties',
  {
    id: serial('id').primaryKey(),
    address: varchar('address', { length: 255 }).notNull(),
    city: varchar('city', { length: 100 }).notNull(),
    state: varchar('state', { length: 50 }).notNull(),
    zip: varchar('zip', { length: 20 }).notNull(),
    lat: numeric('lat', { precision: 10, scale: 8 }),
    lon: numeric('lon', { precision: 11, scale: 8 }),
    price: numeric('price', { precision: 15, scale: 2 }),
    squareFeet: integer('square_feet'),
    yearBuilt: integer('year_built'),
    propertyType: varchar('property_type', { length: 100 }),
    currentNoi: numeric('current_noi', { precision: 15, scale: 2 }),
    currentCapRate: numeric('current_cap_rate', { precision: 5, scale: 2 }),
    askingCapRate: numeric('asking_cap_rate', { precision: 5, scale: 2 }),
    tenantInfo: jsonb('tenant_info'),
    daysOnMarket: integer('days_on_market'),
    listDate: timestamp('list_date'),
    source: varchar('source', { length: 100 }),
    sourceUrl: text('source_url'),
    brokerContact: jsonb('broker_contact'),
    // Score fields (out of 100, precision 3, scale 1)
    scoreDealQuality: numeric('score_deal_quality', { precision: 3, scale: 1 }),
    scoreMarket: numeric('score_market', { precision: 3, scale: 1 }),
    scoreTenanDemand: numeric('score_tenant_demand', { precision: 3, scale: 1 }),
    scoreEntitlement: numeric('score_entitlement', { precision: 3, scale: 1 }),
    compositeScore: numeric('composite_score', { precision: 5, scale: 2 }),
    estimatedIrr: numeric('estimated_irr', { precision: 5, scale: 2 }),
    acquisitionStrategy: text('acquisition_strategy'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    addressIdx: index('idx_properties_address').on(table.address),
    cityStateIdx: index('idx_properties_city_state').on(table.city, table.state),
    compositeScoreIdx: index('idx_properties_composite_score').on(
      table.compositeScore
    ),
  })
);

// Saved Properties table
export const savedProperties = pgTable(
  'saved_properties',
  {
    id: serial('id').primaryKey(),
    propertyId: integer('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    status: varchar('status', {
      length: 50,
      enum: ['prospect', 'reviewing', 'offer', 'contract', 'closed', 'pass'],
    }).notNull(),
    userEstimatedIrr: numeric('user_estimated_irr', { precision: 5, scale: 2 }),
    notes: jsonb('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    propertyIdIdx: index('idx_saved_properties_property_id').on(table.propertyId),
  })
);

// Closed Deals table
export const closedDeals = pgTable(
  'closed_deals',
  {
    id: serial('id').primaryKey(),
    propertyId: integer('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    acquisitionDate: timestamp('acquisition_date'),
    acquisitionPrice: numeric('acquisition_price', { precision: 15, scale: 2 }),
    tenants: jsonb('tenants'),
    estimatedMonthlyExpenses: numeric('estimated_monthly_expenses', {
      precision: 15,
      scale: 2,
    }),
    monthlyNetCashFlow: numeric('monthly_net_cash_flow', {
      precision: 15,
      scale: 2,
    }),
    investorAllocation: jsonb('investor_allocation'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    propertyIdIdx: index('idx_closed_deals_property_id').on(table.propertyId),
  })
);

// Investors table
export const investors = pgTable('investors', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  investedTotal: numeric('invested_total', { precision: 15, scale: 2 }),
  preferredReturnRate: numeric('preferred_return_rate', {
    precision: 5,
    scale: 2,
  }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Recommendations table
export const recommendations = pgTable(
  'recommendations',
  {
    id: serial('id').primaryKey(),
    date: timestamp('date').notNull(),
    propertyId: integer('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    rank: integer('rank').notNull(),
    compositeScore: numeric('composite_score', { precision: 5, scale: 2 }),
    irrEstimate: numeric('irr_estimate', { precision: 5, scale: 2 }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    dateIdx: index('idx_recommendations_date').on(table.date),
    propertyIdIdx: index('idx_recommendations_property_id').on(
      table.propertyId
    ),
  })
);

// Relations
export const propertiesRelations = relations(properties, ({ many }) => ({
  savedProperties: many(savedProperties),
  closedDeals: many(closedDeals),
  recommendations: many(recommendations),
}));

export const savedPropertiesRelations = relations(savedProperties, ({ one }) => ({
  property: one(properties, {
    fields: [savedProperties.propertyId],
    references: [properties.id],
  }),
}));

export const closedDealsRelations = relations(closedDeals, ({ one }) => ({
  property: one(properties, {
    fields: [closedDeals.propertyId],
    references: [properties.id],
  }),
}));

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  property: one(properties, {
    fields: [recommendations.propertyId],
    references: [properties.id],
  }),
}));
