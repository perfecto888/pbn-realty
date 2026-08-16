CREATE TABLE "closed_deals" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"acquisition_date" timestamp,
	"acquisition_price" numeric(15, 2),
	"tenants" jsonb,
	"estimated_monthly_expenses" numeric(15, 2),
	"monthly_net_cash_flow" numeric(15, 2),
	"investor_allocation" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "investors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"invested_total" numeric(15, 2),
	"preferred_return_rate" numeric(5, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "investors_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"address" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(50) NOT NULL,
	"zip" varchar(20) NOT NULL,
	"lat" numeric(10, 8),
	"lon" numeric(11, 8),
	"price" numeric(15, 2),
	"square_feet" integer,
	"year_built" integer,
	"property_type" varchar(100),
	"current_noi" numeric(15, 2),
	"current_cap_rate" numeric(5, 2),
	"asking_cap_rate" numeric(5, 2),
	"tenant_info" jsonb,
	"days_on_market" integer,
	"list_date" timestamp,
	"source" varchar(100),
	"source_url" text,
	"broker_contact" jsonb,
	"score_deal_quality" numeric(3, 1),
	"score_market" numeric(3, 1),
	"score_tenant_demand" numeric(3, 1),
	"score_entitlement" numeric(3, 1),
	"composite_score" numeric(5, 2),
	"estimated_irr" numeric(5, 2),
	"acquisition_strategy" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"property_id" integer NOT NULL,
	"rank" integer NOT NULL,
	"composite_score" numeric(5, 2),
	"irr_estimate" numeric(5, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saved_properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"status" varchar(50) NOT NULL,
	"user_estimated_irr" numeric(5, 2),
	"notes" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "closed_deals" ADD CONSTRAINT "closed_deals_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_properties" ADD CONSTRAINT "saved_properties_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_closed_deals_property_id" ON "closed_deals" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "idx_properties_address" ON "properties" USING btree ("address");--> statement-breakpoint
CREATE INDEX "idx_properties_city_state" ON "properties" USING btree ("city","state");--> statement-breakpoint
CREATE INDEX "idx_properties_composite_score" ON "properties" USING btree ("composite_score");--> statement-breakpoint
CREATE INDEX "idx_recommendations_date" ON "recommendations" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_recommendations_property_id" ON "recommendations" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "idx_saved_properties_property_id" ON "saved_properties" USING btree ("property_id");