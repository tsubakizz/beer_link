CREATE TABLE "beer_styles" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"bitterness" integer,
	"sweetness" integer,
	"body" integer,
	"aroma" integer,
	"sourness" integer,
	"history" text,
	"origin" text,
	"abv_min" numeric(4, 2),
	"abv_max" numeric(4, 2),
	"ibu_min" integer,
	"ibu_max" integer,
	"srm_min" integer,
	"srm_max" integer,
	"serving_temp_min" integer,
	"serving_temp_max" integer,
	"status" text DEFAULT 'approved' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "beer_styles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "beers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"brewery_id" integer NOT NULL,
	"style_id" integer NOT NULL,
	"abv" numeric(4, 2),
	"ibu" integer,
	"image_url" text,
	"status" text DEFAULT 'approved' NOT NULL,
	"submitted_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "breweries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"prefecture_id" integer,
	"address" text,
	"website_url" text,
	"image_url" text,
	"status" text DEFAULT 'approved' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beer_favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"beer_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_beer" UNIQUE("user_id","beer_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"bio" text,
	"profile_image_url" text,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "prefectures" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "prefectures_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"beer_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"bitterness" integer,
	"sweetness" integer,
	"body" integer,
	"aroma" integer,
	"sourness" integer,
	"comment" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beer_style_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"submitted_by" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"admin_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "beers" ADD CONSTRAINT "beers_brewery_id_breweries_id_fk" FOREIGN KEY ("brewery_id") REFERENCES "public"."breweries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beers" ADD CONSTRAINT "beers_style_id_beer_styles_id_fk" FOREIGN KEY ("style_id") REFERENCES "public"."beer_styles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beers" ADD CONSTRAINT "beers_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breweries" ADD CONSTRAINT "breweries_prefecture_id_prefectures_id_fk" FOREIGN KEY ("prefecture_id") REFERENCES "public"."prefectures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beer_favorites" ADD CONSTRAINT "beer_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beer_favorites" ADD CONSTRAINT "beer_favorites_beer_id_beers_id_fk" FOREIGN KEY ("beer_id") REFERENCES "public"."beers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_beer_id_beers_id_fk" FOREIGN KEY ("beer_id") REFERENCES "public"."beers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beer_style_requests" ADD CONSTRAINT "beer_style_requests_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;