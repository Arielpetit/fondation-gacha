import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE SCHEMA IF NOT EXISTS "foundation";

   CREATE TYPE "foundation"."_locales" AS ENUM('fr', 'en');
  CREATE TYPE "foundation"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "foundation"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "foundation"."enum__posts_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "foundation"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "foundation"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "foundation"."enum__pages_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "foundation"."enum_activities_motif" AS ENUM('dots', 'zigzag', 'diamonds', 'checker', 'moon', 'spider', 'ladder');
  CREATE TYPE "foundation"."enum_activities_status" AS ENUM('draft', 'published');
  CREATE TYPE "foundation"."enum__activities_v_version_motif" AS ENUM('dots', 'zigzag', 'diamonds', 'checker', 'moon', 'spider', 'ladder');
  CREATE TYPE "foundation"."enum__activities_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "foundation"."enum__activities_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "foundation"."enum_themes_tone" AS ENUM('terracotta', 'indigo', 'forest');
  CREATE TYPE "foundation"."enum_team_group" AS ENUM('board', 'staff', 'volunteer');
  CREATE TYPE "foundation"."enum_partners_kind" AS ENUM('institutional', 'cultural', 'academic', 'association', 'sponsor');
  CREATE TYPE "foundation"."enum_subscribers_locale" AS ENUM('fr', 'en');
  CREATE TYPE "foundation"."enum_users_roles" AS ENUM('admin', 'editor');
  CREATE TYPE "foundation"."enum_forms_confirmation_type" AS ENUM('message', 'redirect');
  CREATE TYPE "foundation"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TABLE "foundation"."posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cover_id" integer,
  	"event_start" timestamp(3) with time zone,
  	"event_end" timestamp(3) with time zone,
  	"slug" varchar,
  	"published_at" timestamp(3) with time zone,
  	"featured" boolean,
  	"legacy_wp_id" numeric,
  	"legacy_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "foundation"."enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "foundation"."posts_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"content" jsonb,
  	"event_label" varchar,
  	"place" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "foundation"."posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"themes_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "foundation"."_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_cover_id" integer,
  	"version_event_start" timestamp(3) with time zone,
  	"version_event_end" timestamp(3) with time zone,
  	"version_slug" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_featured" boolean,
  	"version_legacy_wp_id" numeric,
  	"version_legacy_url" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "foundation"."enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "foundation"."enum__posts_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "foundation"."_posts_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_content" jsonb,
  	"version_event_label" varchar,
  	"version_place" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "foundation"."_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"themes_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "foundation"."pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"path" varchar,
  	"slug" varchar,
  	"hero_image_id" integer,
  	"legacy_wp_id" numeric,
  	"legacy_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "foundation"."enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "foundation"."pages_locales" (
  	"title" varchar,
  	"hero_eyebrow" varchar,
  	"hero_intro" varchar,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "foundation"."_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_path" varchar,
  	"version_slug" varchar,
  	"version_hero_image_id" integer,
  	"version_legacy_wp_id" numeric,
  	"version_legacy_url" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "foundation"."enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "foundation"."enum__pages_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "foundation"."_pages_v_locales" (
  	"version_title" varchar,
  	"version_hero_eyebrow" varchar,
  	"version_hero_intro" varchar,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "foundation"."activities_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "foundation"."activities_highlights_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."activities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cover_id" integer,
  	"slug" varchar,
  	"order" numeric DEFAULT 0,
  	"motif" "foundation"."enum_activities_motif" DEFAULT 'dots',
  	"legacy_wp_id" numeric,
  	"legacy_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "foundation"."enum_activities_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "foundation"."activities_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "foundation"."_activities_v_version_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "foundation"."_activities_v_version_highlights_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "foundation"."_activities_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_cover_id" integer,
  	"version_slug" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_motif" "foundation"."enum__activities_v_version_motif" DEFAULT 'dots',
  	"version_legacy_wp_id" numeric,
  	"version_legacy_url" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "foundation"."enum__activities_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "foundation"."enum__activities_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "foundation"."_activities_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "foundation"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credit" varchar,
  	"legacy_url" varchar,
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_wide_url" varchar,
  	"sizes_wide_width" numeric,
  	"sizes_wide_height" numeric,
  	"sizes_wide_mime_type" varchar,
  	"sizes_wide_filesize" numeric,
  	"sizes_wide_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "foundation"."media_locales" (
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "foundation"."themes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"tone" "foundation"."enum_themes_tone" DEFAULT 'terracotta',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "foundation"."themes_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "foundation"."tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"wp_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "foundation"."team" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"group" "foundation"."enum_team_group" DEFAULT 'staff' NOT NULL,
  	"photo_id" integer,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "foundation"."team_locales" (
  	"role" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "foundation"."residents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"year" numeric NOT NULL,
  	"photo_id" integer,
  	"post_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "foundation"."residents_locales" (
  	"discipline" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "foundation"."partners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"kind" "foundation"."enum_partners_kind" DEFAULT 'institutional',
  	"logo_id" integer,
  	"url" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "foundation"."partners_locales" (
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "foundation"."rooms_price_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"price" numeric
  );
  
  CREATE TABLE "foundation"."rooms_price_variants_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."rooms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"capacity" numeric NOT NULL,
  	"price" numeric NOT NULL,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "foundation"."rooms_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "foundation"."rooms_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "foundation"."press" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"outlet" varchar,
  	"date" timestamp(3) with time zone,
  	"url" varchar,
  	"file_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "foundation"."reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" numeric NOT NULL,
  	"file_id" integer,
  	"url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "foundation"."reports_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "foundation"."subscribers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"locale" "foundation"."enum_subscribers_locale" DEFAULT 'fr',
  	"mailchimp" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "foundation"."users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "foundation"."enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "foundation"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "foundation"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "foundation"."forms_blocks_checkbox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"default_value" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "foundation"."forms_blocks_checkbox_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."forms_blocks_email" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "foundation"."forms_blocks_email_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."forms_blocks_message" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "foundation"."forms_blocks_message_locales" (
  	"message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."forms_blocks_number" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"default_value" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "foundation"."forms_blocks_number_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."forms_blocks_select_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."forms_blocks_select_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."forms_blocks_select" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"placeholder" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "foundation"."forms_blocks_select_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."forms_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "foundation"."forms_blocks_text_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."forms_blocks_textarea" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "foundation"."forms_blocks_textarea_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."forms_blocks_date" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"default_value" timestamp(3) with time zone,
  	"block_name" varchar
  );
  
  CREATE TABLE "foundation"."forms_blocks_date_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."forms_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email_to" varchar,
  	"cc" varchar,
  	"bcc" varchar,
  	"reply_to" varchar,
  	"email_from" varchar
  );
  
  CREATE TABLE "foundation"."forms_emails_locales" (
  	"subject" varchar DEFAULT 'You''ve received a new message.' NOT NULL,
  	"message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"confirmation_type" "foundation"."enum_forms_confirmation_type" DEFAULT 'message',
  	"redirect_url" varchar,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "foundation"."forms_locales" (
  	"submit_button_label" varchar,
  	"confirmation_message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "foundation"."form_submissions_submission_data" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."form_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "foundation"."redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "foundation"."enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "foundation"."redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"pages_id" integer,
  	"activities_id" integer
  );
  
  CREATE TABLE "foundation"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "foundation"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "foundation"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"pages_id" integer,
  	"activities_id" integer,
  	"media_id" integer,
  	"themes_id" integer,
  	"tags_id" integer,
  	"team_id" integer,
  	"residents_id" integer,
  	"partners_id" integer,
  	"rooms_id" integer,
  	"press_id" integer,
  	"reports_id" integer,
  	"subscribers_id" integer,
  	"users_id" integer,
  	"forms_id" integer,
  	"form_submissions_id" integer,
  	"redirects_id" integer
  );
  
  CREATE TABLE "foundation"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "foundation"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "foundation"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "foundation"."settings_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"person" varchar,
  	"phones" varchar,
  	"email" varchar
  );
  
  CREATE TABLE "foundation"."settings_contacts_locales" (
  	"service" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."settings_visit_prices" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"price" numeric NOT NULL
  );
  
  CREATE TABLE "foundation"."settings_visit_prices_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."settings_restaurant_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "foundation"."settings_restaurant_hours_locales" (
  	"label" varchar NOT NULL,
  	"hours" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."settings_membership_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"price" numeric NOT NULL,
  	"highlighted" boolean
  );
  
  CREATE TABLE "foundation"."settings_membership_tiers_locales" (
  	"name" varchar NOT NULL,
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."settings_membership_perks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "foundation"."settings_membership_perks_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"social_facebook" varchar,
  	"social_instagram" varchar,
  	"social_youtube" varchar,
  	"social_newsletter" varchar,
  	"bank_holder" varchar,
  	"bank_iban" varchar,
  	"bank_bic" varchar,
  	"paypal_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "foundation"."settings_locales" (
  	"address" varchar,
  	"hours" varchar,
  	"visit_notes" varchar,
  	"donation_intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "foundation"."navigation_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."navigation_items_children_locales" (
  	"label" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."navigation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL,
  	"in_footer" boolean DEFAULT true,
  	"feature_image_id" integer,
  	"feature_href" varchar
  );
  
  CREATE TABLE "foundation"."navigation_items_locales" (
  	"label" varchar NOT NULL,
  	"feature_title" varchar,
  	"feature_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "foundation"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "foundation"."navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "foundation"."posts" ADD CONSTRAINT "posts_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "foundation"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."posts_locales" ADD CONSTRAINT "posts_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "foundation"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "foundation"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."posts_rels" ADD CONSTRAINT "posts_rels_themes_fk" FOREIGN KEY ("themes_id") REFERENCES "foundation"."themes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."posts_rels" ADD CONSTRAINT "posts_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "foundation"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "foundation"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."_posts_v" ADD CONSTRAINT "_posts_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "foundation"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "foundation"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "foundation"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_themes_fk" FOREIGN KEY ("themes_id") REFERENCES "foundation"."themes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "foundation"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."pages" ADD CONSTRAINT "pages_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "foundation"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."pages_locales" ADD CONSTRAINT "pages_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "foundation"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "foundation"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."_pages_v" ADD CONSTRAINT "_pages_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "foundation"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "foundation"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."activities_highlights" ADD CONSTRAINT "activities_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."activities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."activities_highlights_locales" ADD CONSTRAINT "activities_highlights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."activities_highlights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."activities" ADD CONSTRAINT "activities_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "foundation"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."activities_locales" ADD CONSTRAINT "activities_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "foundation"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."activities_locales" ADD CONSTRAINT "activities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."activities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."_activities_v_version_highlights" ADD CONSTRAINT "_activities_v_version_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."_activities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."_activities_v_version_highlights_locales" ADD CONSTRAINT "_activities_v_version_highlights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."_activities_v_version_highlights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."_activities_v" ADD CONSTRAINT "_activities_v_parent_id_activities_id_fk" FOREIGN KEY ("parent_id") REFERENCES "foundation"."activities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."_activities_v" ADD CONSTRAINT "_activities_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "foundation"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."_activities_v_locales" ADD CONSTRAINT "_activities_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "foundation"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."_activities_v_locales" ADD CONSTRAINT "_activities_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."_activities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."themes_locales" ADD CONSTRAINT "themes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."themes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."team" ADD CONSTRAINT "team_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "foundation"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."team_locales" ADD CONSTRAINT "team_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."residents" ADD CONSTRAINT "residents_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "foundation"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."residents" ADD CONSTRAINT "residents_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "foundation"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."residents_locales" ADD CONSTRAINT "residents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."residents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."partners" ADD CONSTRAINT "partners_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "foundation"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."partners_locales" ADD CONSTRAINT "partners_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."rooms_price_variants" ADD CONSTRAINT "rooms_price_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."rooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."rooms_price_variants_locales" ADD CONSTRAINT "rooms_price_variants_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."rooms_price_variants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."rooms_locales" ADD CONSTRAINT "rooms_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."rooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."rooms_rels" ADD CONSTRAINT "rooms_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "foundation"."rooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."rooms_rels" ADD CONSTRAINT "rooms_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "foundation"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."press" ADD CONSTRAINT "press_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "foundation"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."reports" ADD CONSTRAINT "reports_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "foundation"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."reports_locales" ADD CONSTRAINT "reports_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "foundation"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_blocks_checkbox" ADD CONSTRAINT "forms_blocks_checkbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_blocks_checkbox_locales" ADD CONSTRAINT "forms_blocks_checkbox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms_blocks_checkbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_blocks_email" ADD CONSTRAINT "forms_blocks_email_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_blocks_email_locales" ADD CONSTRAINT "forms_blocks_email_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms_blocks_email"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_blocks_message" ADD CONSTRAINT "forms_blocks_message_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_blocks_message_locales" ADD CONSTRAINT "forms_blocks_message_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms_blocks_message"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_blocks_number" ADD CONSTRAINT "forms_blocks_number_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_blocks_number_locales" ADD CONSTRAINT "forms_blocks_number_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms_blocks_number"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_blocks_select_options" ADD CONSTRAINT "forms_blocks_select_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms_blocks_select"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_blocks_select_options_locales" ADD CONSTRAINT "forms_blocks_select_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms_blocks_select_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_blocks_select" ADD CONSTRAINT "forms_blocks_select_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_blocks_select_locales" ADD CONSTRAINT "forms_blocks_select_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms_blocks_select"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_blocks_text" ADD CONSTRAINT "forms_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_blocks_text_locales" ADD CONSTRAINT "forms_blocks_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_blocks_textarea" ADD CONSTRAINT "forms_blocks_textarea_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_blocks_textarea_locales" ADD CONSTRAINT "forms_blocks_textarea_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms_blocks_textarea"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_blocks_date" ADD CONSTRAINT "forms_blocks_date_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_blocks_date_locales" ADD CONSTRAINT "forms_blocks_date_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms_blocks_date"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_emails" ADD CONSTRAINT "forms_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_emails_locales" ADD CONSTRAINT "forms_emails_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms_emails"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."forms_locales" ADD CONSTRAINT "forms_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."form_submissions_submission_data" ADD CONSTRAINT "form_submissions_submission_data_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "foundation"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "foundation"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."redirects_rels" ADD CONSTRAINT "redirects_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "foundation"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "foundation"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."redirects_rels" ADD CONSTRAINT "redirects_rels_activities_fk" FOREIGN KEY ("activities_id") REFERENCES "foundation"."activities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "foundation"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "foundation"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "foundation"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_activities_fk" FOREIGN KEY ("activities_id") REFERENCES "foundation"."activities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "foundation"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_themes_fk" FOREIGN KEY ("themes_id") REFERENCES "foundation"."themes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "foundation"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "foundation"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_residents_fk" FOREIGN KEY ("residents_id") REFERENCES "foundation"."residents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "foundation"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rooms_fk" FOREIGN KEY ("rooms_id") REFERENCES "foundation"."rooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_press_fk" FOREIGN KEY ("press_id") REFERENCES "foundation"."press"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reports_fk" FOREIGN KEY ("reports_id") REFERENCES "foundation"."reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subscribers_fk" FOREIGN KEY ("subscribers_id") REFERENCES "foundation"."subscribers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "foundation"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forms_fk" FOREIGN KEY ("forms_id") REFERENCES "foundation"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "foundation"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "foundation"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "foundation"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "foundation"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."settings_contacts" ADD CONSTRAINT "settings_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."settings_contacts_locales" ADD CONSTRAINT "settings_contacts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."settings_contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."settings_visit_prices" ADD CONSTRAINT "settings_visit_prices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."settings_visit_prices_locales" ADD CONSTRAINT "settings_visit_prices_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."settings_visit_prices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."settings_restaurant_hours" ADD CONSTRAINT "settings_restaurant_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."settings_restaurant_hours_locales" ADD CONSTRAINT "settings_restaurant_hours_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."settings_restaurant_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."settings_membership_tiers" ADD CONSTRAINT "settings_membership_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."settings_membership_tiers_locales" ADD CONSTRAINT "settings_membership_tiers_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."settings_membership_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."settings_membership_perks" ADD CONSTRAINT "settings_membership_perks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."settings_membership_perks_locales" ADD CONSTRAINT "settings_membership_perks_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."settings_membership_perks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."settings_locales" ADD CONSTRAINT "settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."navigation_items_children" ADD CONSTRAINT "navigation_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."navigation_items_children_locales" ADD CONSTRAINT "navigation_items_children_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."navigation_items_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."navigation_items" ADD CONSTRAINT "navigation_items_feature_image_id_media_id_fk" FOREIGN KEY ("feature_image_id") REFERENCES "foundation"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "foundation"."navigation_items" ADD CONSTRAINT "navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "foundation"."navigation_items_locales" ADD CONSTRAINT "navigation_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "foundation"."navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_cover_idx" ON "foundation"."posts" USING btree ("cover_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "foundation"."posts" USING btree ("slug");
  CREATE INDEX "posts_published_at_idx" ON "foundation"."posts" USING btree ("published_at");
  CREATE INDEX "posts_legacy_legacy_wp_id_idx" ON "foundation"."posts" USING btree ("legacy_wp_id");
  CREATE INDEX "posts_updated_at_idx" ON "foundation"."posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "foundation"."posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "foundation"."posts" USING btree ("_status");
  CREATE INDEX "posts_meta_meta_image_idx" ON "foundation"."posts_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "foundation"."posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_locales_parent_id_idx" ON "foundation"."posts_locales" USING btree ("_parent_id");
  CREATE INDEX "posts_rels_order_idx" ON "foundation"."posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "foundation"."posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "foundation"."posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_themes_id_idx" ON "foundation"."posts_rels" USING btree ("themes_id");
  CREATE INDEX "posts_rels_tags_id_idx" ON "foundation"."posts_rels" USING btree ("tags_id");
  CREATE INDEX "_posts_v_parent_idx" ON "foundation"."_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_cover_idx" ON "foundation"."_posts_v" USING btree ("version_cover_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "foundation"."_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_published_at_idx" ON "foundation"."_posts_v" USING btree ("version_published_at");
  CREATE INDEX "_posts_v_version_legacy_version_legacy_wp_id_idx" ON "foundation"."_posts_v" USING btree ("version_legacy_wp_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "foundation"."_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "foundation"."_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "foundation"."_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "foundation"."_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "foundation"."_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_snapshot_idx" ON "foundation"."_posts_v" USING btree ("snapshot");
  CREATE INDEX "_posts_v_published_locale_idx" ON "foundation"."_posts_v" USING btree ("published_locale");
  CREATE INDEX "_posts_v_latest_idx" ON "foundation"."_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "foundation"."_posts_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "foundation"."_posts_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_posts_v_locales_locale_parent_id_unique" ON "foundation"."_posts_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_locales_parent_id_idx" ON "foundation"."_posts_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_rels_order_idx" ON "foundation"."_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "foundation"."_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "foundation"."_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_themes_id_idx" ON "foundation"."_posts_v_rels" USING btree ("themes_id");
  CREATE INDEX "_posts_v_rels_tags_id_idx" ON "foundation"."_posts_v_rels" USING btree ("tags_id");
  CREATE UNIQUE INDEX "pages_path_idx" ON "foundation"."pages" USING btree ("path");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "foundation"."pages" USING btree ("slug");
  CREATE INDEX "pages_hero_hero_image_idx" ON "foundation"."pages" USING btree ("hero_image_id");
  CREATE INDEX "pages_legacy_legacy_wp_id_idx" ON "foundation"."pages" USING btree ("legacy_wp_id");
  CREATE INDEX "pages_updated_at_idx" ON "foundation"."pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "foundation"."pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "foundation"."pages" USING btree ("_status");
  CREATE INDEX "pages_meta_meta_image_idx" ON "foundation"."pages_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "foundation"."pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_locales_parent_id_idx" ON "foundation"."pages_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "foundation"."_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_path_idx" ON "foundation"."_pages_v" USING btree ("version_path");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "foundation"."_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_hero_version_hero_image_idx" ON "foundation"."_pages_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_pages_v_version_legacy_version_legacy_wp_id_idx" ON "foundation"."_pages_v" USING btree ("version_legacy_wp_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "foundation"."_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "foundation"."_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "foundation"."_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "foundation"."_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "foundation"."_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "foundation"."_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "foundation"."_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "foundation"."_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "foundation"."_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "foundation"."_pages_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "foundation"."_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_locales_parent_id_idx" ON "foundation"."_pages_v_locales" USING btree ("_parent_id");
  CREATE INDEX "activities_highlights_order_idx" ON "foundation"."activities_highlights" USING btree ("_order");
  CREATE INDEX "activities_highlights_parent_id_idx" ON "foundation"."activities_highlights" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "activities_highlights_locales_locale_parent_id_unique" ON "foundation"."activities_highlights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "activities_highlights_locales_parent_id_idx" ON "foundation"."activities_highlights_locales" USING btree ("_parent_id");
  CREATE INDEX "activities_cover_idx" ON "foundation"."activities" USING btree ("cover_id");
  CREATE UNIQUE INDEX "activities_slug_idx" ON "foundation"."activities" USING btree ("slug");
  CREATE INDEX "activities_legacy_legacy_wp_id_idx" ON "foundation"."activities" USING btree ("legacy_wp_id");
  CREATE INDEX "activities_updated_at_idx" ON "foundation"."activities" USING btree ("updated_at");
  CREATE INDEX "activities_created_at_idx" ON "foundation"."activities" USING btree ("created_at");
  CREATE INDEX "activities__status_idx" ON "foundation"."activities" USING btree ("_status");
  CREATE INDEX "activities_meta_meta_image_idx" ON "foundation"."activities_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "activities_locales_locale_parent_id_unique" ON "foundation"."activities_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "activities_locales_parent_id_idx" ON "foundation"."activities_locales" USING btree ("_parent_id");
  CREATE INDEX "_activities_v_version_highlights_order_idx" ON "foundation"."_activities_v_version_highlights" USING btree ("_order");
  CREATE INDEX "_activities_v_version_highlights_parent_id_idx" ON "foundation"."_activities_v_version_highlights" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_activities_v_version_highlights_locales_locale_parent_id_un" ON "foundation"."_activities_v_version_highlights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_activities_v_version_highlights_locales_parent_id_idx" ON "foundation"."_activities_v_version_highlights_locales" USING btree ("_parent_id");
  CREATE INDEX "_activities_v_parent_idx" ON "foundation"."_activities_v" USING btree ("parent_id");
  CREATE INDEX "_activities_v_version_version_cover_idx" ON "foundation"."_activities_v" USING btree ("version_cover_id");
  CREATE INDEX "_activities_v_version_version_slug_idx" ON "foundation"."_activities_v" USING btree ("version_slug");
  CREATE INDEX "_activities_v_version_legacy_version_legacy_wp_id_idx" ON "foundation"."_activities_v" USING btree ("version_legacy_wp_id");
  CREATE INDEX "_activities_v_version_version_updated_at_idx" ON "foundation"."_activities_v" USING btree ("version_updated_at");
  CREATE INDEX "_activities_v_version_version_created_at_idx" ON "foundation"."_activities_v" USING btree ("version_created_at");
  CREATE INDEX "_activities_v_version_version__status_idx" ON "foundation"."_activities_v" USING btree ("version__status");
  CREATE INDEX "_activities_v_created_at_idx" ON "foundation"."_activities_v" USING btree ("created_at");
  CREATE INDEX "_activities_v_updated_at_idx" ON "foundation"."_activities_v" USING btree ("updated_at");
  CREATE INDEX "_activities_v_snapshot_idx" ON "foundation"."_activities_v" USING btree ("snapshot");
  CREATE INDEX "_activities_v_published_locale_idx" ON "foundation"."_activities_v" USING btree ("published_locale");
  CREATE INDEX "_activities_v_latest_idx" ON "foundation"."_activities_v" USING btree ("latest");
  CREATE INDEX "_activities_v_version_meta_version_meta_image_idx" ON "foundation"."_activities_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_activities_v_locales_locale_parent_id_unique" ON "foundation"."_activities_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_activities_v_locales_parent_id_idx" ON "foundation"."_activities_v_locales" USING btree ("_parent_id");
  CREATE INDEX "media_legacy_url_idx" ON "foundation"."media" USING btree ("legacy_url");
  CREATE INDEX "media_updated_at_idx" ON "foundation"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "foundation"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "foundation"."media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "foundation"."media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "foundation"."media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_wide_sizes_wide_filename_idx" ON "foundation"."media" USING btree ("sizes_wide_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "foundation"."media" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "foundation"."media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "foundation"."media_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "themes_slug_idx" ON "foundation"."themes" USING btree ("slug");
  CREATE INDEX "themes_updated_at_idx" ON "foundation"."themes" USING btree ("updated_at");
  CREATE INDEX "themes_created_at_idx" ON "foundation"."themes" USING btree ("created_at");
  CREATE UNIQUE INDEX "themes_locales_locale_parent_id_unique" ON "foundation"."themes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "themes_locales_parent_id_idx" ON "foundation"."themes_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "foundation"."tags" USING btree ("slug");
  CREATE INDEX "tags_wp_id_idx" ON "foundation"."tags" USING btree ("wp_id");
  CREATE INDEX "tags_updated_at_idx" ON "foundation"."tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "foundation"."tags" USING btree ("created_at");
  CREATE INDEX "team_photo_idx" ON "foundation"."team" USING btree ("photo_id");
  CREATE INDEX "team_updated_at_idx" ON "foundation"."team" USING btree ("updated_at");
  CREATE INDEX "team_created_at_idx" ON "foundation"."team" USING btree ("created_at");
  CREATE UNIQUE INDEX "team_locales_locale_parent_id_unique" ON "foundation"."team_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "team_locales_parent_id_idx" ON "foundation"."team_locales" USING btree ("_parent_id");
  CREATE INDEX "residents_photo_idx" ON "foundation"."residents" USING btree ("photo_id");
  CREATE INDEX "residents_post_idx" ON "foundation"."residents" USING btree ("post_id");
  CREATE INDEX "residents_updated_at_idx" ON "foundation"."residents" USING btree ("updated_at");
  CREATE INDEX "residents_created_at_idx" ON "foundation"."residents" USING btree ("created_at");
  CREATE UNIQUE INDEX "residents_locales_locale_parent_id_unique" ON "foundation"."residents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "residents_locales_parent_id_idx" ON "foundation"."residents_locales" USING btree ("_parent_id");
  CREATE INDEX "partners_logo_idx" ON "foundation"."partners" USING btree ("logo_id");
  CREATE INDEX "partners_updated_at_idx" ON "foundation"."partners" USING btree ("updated_at");
  CREATE INDEX "partners_created_at_idx" ON "foundation"."partners" USING btree ("created_at");
  CREATE UNIQUE INDEX "partners_locales_locale_parent_id_unique" ON "foundation"."partners_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "partners_locales_parent_id_idx" ON "foundation"."partners_locales" USING btree ("_parent_id");
  CREATE INDEX "rooms_price_variants_order_idx" ON "foundation"."rooms_price_variants" USING btree ("_order");
  CREATE INDEX "rooms_price_variants_parent_id_idx" ON "foundation"."rooms_price_variants" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "rooms_price_variants_locales_locale_parent_id_unique" ON "foundation"."rooms_price_variants_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "rooms_price_variants_locales_parent_id_idx" ON "foundation"."rooms_price_variants_locales" USING btree ("_parent_id");
  CREATE INDEX "rooms_updated_at_idx" ON "foundation"."rooms" USING btree ("updated_at");
  CREATE INDEX "rooms_created_at_idx" ON "foundation"."rooms" USING btree ("created_at");
  CREATE UNIQUE INDEX "rooms_locales_locale_parent_id_unique" ON "foundation"."rooms_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "rooms_locales_parent_id_idx" ON "foundation"."rooms_locales" USING btree ("_parent_id");
  CREATE INDEX "rooms_rels_order_idx" ON "foundation"."rooms_rels" USING btree ("order");
  CREATE INDEX "rooms_rels_parent_idx" ON "foundation"."rooms_rels" USING btree ("parent_id");
  CREATE INDEX "rooms_rels_path_idx" ON "foundation"."rooms_rels" USING btree ("path");
  CREATE INDEX "rooms_rels_media_id_idx" ON "foundation"."rooms_rels" USING btree ("media_id");
  CREATE INDEX "press_file_idx" ON "foundation"."press" USING btree ("file_id");
  CREATE INDEX "press_updated_at_idx" ON "foundation"."press" USING btree ("updated_at");
  CREATE INDEX "press_created_at_idx" ON "foundation"."press" USING btree ("created_at");
  CREATE INDEX "reports_file_idx" ON "foundation"."reports" USING btree ("file_id");
  CREATE INDEX "reports_updated_at_idx" ON "foundation"."reports" USING btree ("updated_at");
  CREATE INDEX "reports_created_at_idx" ON "foundation"."reports" USING btree ("created_at");
  CREATE UNIQUE INDEX "reports_locales_locale_parent_id_unique" ON "foundation"."reports_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "reports_locales_parent_id_idx" ON "foundation"."reports_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "subscribers_email_idx" ON "foundation"."subscribers" USING btree ("email");
  CREATE INDEX "subscribers_updated_at_idx" ON "foundation"."subscribers" USING btree ("updated_at");
  CREATE INDEX "subscribers_created_at_idx" ON "foundation"."subscribers" USING btree ("created_at");
  CREATE INDEX "users_roles_order_idx" ON "foundation"."users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "foundation"."users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "foundation"."users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "foundation"."users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "foundation"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "foundation"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "foundation"."users" USING btree ("email");
  CREATE INDEX "forms_blocks_checkbox_order_idx" ON "foundation"."forms_blocks_checkbox" USING btree ("_order");
  CREATE INDEX "forms_blocks_checkbox_parent_id_idx" ON "foundation"."forms_blocks_checkbox" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_checkbox_path_idx" ON "foundation"."forms_blocks_checkbox" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_checkbox_locales_locale_parent_id_unique" ON "foundation"."forms_blocks_checkbox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_checkbox_locales_parent_id_idx" ON "foundation"."forms_blocks_checkbox_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_email_order_idx" ON "foundation"."forms_blocks_email" USING btree ("_order");
  CREATE INDEX "forms_blocks_email_parent_id_idx" ON "foundation"."forms_blocks_email" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_email_path_idx" ON "foundation"."forms_blocks_email" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_email_locales_locale_parent_id_unique" ON "foundation"."forms_blocks_email_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_email_locales_parent_id_idx" ON "foundation"."forms_blocks_email_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_message_order_idx" ON "foundation"."forms_blocks_message" USING btree ("_order");
  CREATE INDEX "forms_blocks_message_parent_id_idx" ON "foundation"."forms_blocks_message" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_message_path_idx" ON "foundation"."forms_blocks_message" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_message_locales_locale_parent_id_unique" ON "foundation"."forms_blocks_message_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_message_locales_parent_id_idx" ON "foundation"."forms_blocks_message_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_number_order_idx" ON "foundation"."forms_blocks_number" USING btree ("_order");
  CREATE INDEX "forms_blocks_number_parent_id_idx" ON "foundation"."forms_blocks_number" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_number_path_idx" ON "foundation"."forms_blocks_number" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_number_locales_locale_parent_id_unique" ON "foundation"."forms_blocks_number_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_number_locales_parent_id_idx" ON "foundation"."forms_blocks_number_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_options_order_idx" ON "foundation"."forms_blocks_select_options" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_options_parent_id_idx" ON "foundation"."forms_blocks_select_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_select_options_locales_locale_parent_id_unique" ON "foundation"."forms_blocks_select_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_select_options_locales_parent_id_idx" ON "foundation"."forms_blocks_select_options_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_order_idx" ON "foundation"."forms_blocks_select" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_parent_id_idx" ON "foundation"."forms_blocks_select" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_path_idx" ON "foundation"."forms_blocks_select" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_select_locales_locale_parent_id_unique" ON "foundation"."forms_blocks_select_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_select_locales_parent_id_idx" ON "foundation"."forms_blocks_select_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_text_order_idx" ON "foundation"."forms_blocks_text" USING btree ("_order");
  CREATE INDEX "forms_blocks_text_parent_id_idx" ON "foundation"."forms_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_text_path_idx" ON "foundation"."forms_blocks_text" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_text_locales_locale_parent_id_unique" ON "foundation"."forms_blocks_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_text_locales_parent_id_idx" ON "foundation"."forms_blocks_text_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_textarea_order_idx" ON "foundation"."forms_blocks_textarea" USING btree ("_order");
  CREATE INDEX "forms_blocks_textarea_parent_id_idx" ON "foundation"."forms_blocks_textarea" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_textarea_path_idx" ON "foundation"."forms_blocks_textarea" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_textarea_locales_locale_parent_id_unique" ON "foundation"."forms_blocks_textarea_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_textarea_locales_parent_id_idx" ON "foundation"."forms_blocks_textarea_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_date_order_idx" ON "foundation"."forms_blocks_date" USING btree ("_order");
  CREATE INDEX "forms_blocks_date_parent_id_idx" ON "foundation"."forms_blocks_date" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_date_path_idx" ON "foundation"."forms_blocks_date" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_date_locales_locale_parent_id_unique" ON "foundation"."forms_blocks_date_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_date_locales_parent_id_idx" ON "foundation"."forms_blocks_date_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_emails_order_idx" ON "foundation"."forms_emails" USING btree ("_order");
  CREATE INDEX "forms_emails_parent_id_idx" ON "foundation"."forms_emails" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_emails_locales_locale_parent_id_unique" ON "foundation"."forms_emails_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_emails_locales_parent_id_idx" ON "foundation"."forms_emails_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_slug_idx" ON "foundation"."forms" USING btree ("slug");
  CREATE INDEX "forms_updated_at_idx" ON "foundation"."forms" USING btree ("updated_at");
  CREATE INDEX "forms_created_at_idx" ON "foundation"."forms" USING btree ("created_at");
  CREATE UNIQUE INDEX "forms_locales_locale_parent_id_unique" ON "foundation"."forms_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_locales_parent_id_idx" ON "foundation"."forms_locales" USING btree ("_parent_id");
  CREATE INDEX "form_submissions_submission_data_order_idx" ON "foundation"."form_submissions_submission_data" USING btree ("_order");
  CREATE INDEX "form_submissions_submission_data_parent_id_idx" ON "foundation"."form_submissions_submission_data" USING btree ("_parent_id");
  CREATE INDEX "form_submissions_form_idx" ON "foundation"."form_submissions" USING btree ("form_id");
  CREATE INDEX "form_submissions_updated_at_idx" ON "foundation"."form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "foundation"."form_submissions" USING btree ("created_at");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "foundation"."redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "foundation"."redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "foundation"."redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "foundation"."redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "foundation"."redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "foundation"."redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_posts_id_idx" ON "foundation"."redirects_rels" USING btree ("posts_id");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "foundation"."redirects_rels" USING btree ("pages_id");
  CREATE INDEX "redirects_rels_activities_id_idx" ON "foundation"."redirects_rels" USING btree ("activities_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "foundation"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "foundation"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "foundation"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "foundation"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "foundation"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "foundation"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "foundation"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "foundation"."payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "foundation"."payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_activities_id_idx" ON "foundation"."payload_locked_documents_rels" USING btree ("activities_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "foundation"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_themes_id_idx" ON "foundation"."payload_locked_documents_rels" USING btree ("themes_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "foundation"."payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_team_id_idx" ON "foundation"."payload_locked_documents_rels" USING btree ("team_id");
  CREATE INDEX "payload_locked_documents_rels_residents_id_idx" ON "foundation"."payload_locked_documents_rels" USING btree ("residents_id");
  CREATE INDEX "payload_locked_documents_rels_partners_id_idx" ON "foundation"."payload_locked_documents_rels" USING btree ("partners_id");
  CREATE INDEX "payload_locked_documents_rels_rooms_id_idx" ON "foundation"."payload_locked_documents_rels" USING btree ("rooms_id");
  CREATE INDEX "payload_locked_documents_rels_press_id_idx" ON "foundation"."payload_locked_documents_rels" USING btree ("press_id");
  CREATE INDEX "payload_locked_documents_rels_reports_id_idx" ON "foundation"."payload_locked_documents_rels" USING btree ("reports_id");
  CREATE INDEX "payload_locked_documents_rels_subscribers_id_idx" ON "foundation"."payload_locked_documents_rels" USING btree ("subscribers_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "foundation"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_forms_id_idx" ON "foundation"."payload_locked_documents_rels" USING btree ("forms_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "foundation"."payload_locked_documents_rels" USING btree ("form_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "foundation"."payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_preferences_key_idx" ON "foundation"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "foundation"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "foundation"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "foundation"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "foundation"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "foundation"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "foundation"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "foundation"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "foundation"."payload_migrations" USING btree ("created_at");
  CREATE INDEX "settings_contacts_order_idx" ON "foundation"."settings_contacts" USING btree ("_order");
  CREATE INDEX "settings_contacts_parent_id_idx" ON "foundation"."settings_contacts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "settings_contacts_locales_locale_parent_id_unique" ON "foundation"."settings_contacts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "settings_contacts_locales_parent_id_idx" ON "foundation"."settings_contacts_locales" USING btree ("_parent_id");
  CREATE INDEX "settings_visit_prices_order_idx" ON "foundation"."settings_visit_prices" USING btree ("_order");
  CREATE INDEX "settings_visit_prices_parent_id_idx" ON "foundation"."settings_visit_prices" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "settings_visit_prices_locales_locale_parent_id_unique" ON "foundation"."settings_visit_prices_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "settings_visit_prices_locales_parent_id_idx" ON "foundation"."settings_visit_prices_locales" USING btree ("_parent_id");
  CREATE INDEX "settings_restaurant_hours_order_idx" ON "foundation"."settings_restaurant_hours" USING btree ("_order");
  CREATE INDEX "settings_restaurant_hours_parent_id_idx" ON "foundation"."settings_restaurant_hours" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "settings_restaurant_hours_locales_locale_parent_id_unique" ON "foundation"."settings_restaurant_hours_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "settings_restaurant_hours_locales_parent_id_idx" ON "foundation"."settings_restaurant_hours_locales" USING btree ("_parent_id");
  CREATE INDEX "settings_membership_tiers_order_idx" ON "foundation"."settings_membership_tiers" USING btree ("_order");
  CREATE INDEX "settings_membership_tiers_parent_id_idx" ON "foundation"."settings_membership_tiers" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "settings_membership_tiers_locales_locale_parent_id_unique" ON "foundation"."settings_membership_tiers_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "settings_membership_tiers_locales_parent_id_idx" ON "foundation"."settings_membership_tiers_locales" USING btree ("_parent_id");
  CREATE INDEX "settings_membership_perks_order_idx" ON "foundation"."settings_membership_perks" USING btree ("_order");
  CREATE INDEX "settings_membership_perks_parent_id_idx" ON "foundation"."settings_membership_perks" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "settings_membership_perks_locales_locale_parent_id_unique" ON "foundation"."settings_membership_perks_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "settings_membership_perks_locales_parent_id_idx" ON "foundation"."settings_membership_perks_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "settings_locales_locale_parent_id_unique" ON "foundation"."settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "settings_locales_parent_id_idx" ON "foundation"."settings_locales" USING btree ("_parent_id");
  CREATE INDEX "navigation_items_children_order_idx" ON "foundation"."navigation_items_children" USING btree ("_order");
  CREATE INDEX "navigation_items_children_parent_id_idx" ON "foundation"."navigation_items_children" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_items_children_locales_locale_parent_id_unique" ON "foundation"."navigation_items_children_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_items_children_locales_parent_id_idx" ON "foundation"."navigation_items_children_locales" USING btree ("_parent_id");
  CREATE INDEX "navigation_items_order_idx" ON "foundation"."navigation_items" USING btree ("_order");
  CREATE INDEX "navigation_items_parent_id_idx" ON "foundation"."navigation_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_items_feature_feature_image_idx" ON "foundation"."navigation_items" USING btree ("feature_image_id");
  CREATE UNIQUE INDEX "navigation_items_locales_locale_parent_id_unique" ON "foundation"."navigation_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_items_locales_parent_id_idx" ON "foundation"."navigation_items_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "foundation"."posts" CASCADE;
  DROP TABLE "foundation"."posts_locales" CASCADE;
  DROP TABLE "foundation"."posts_rels" CASCADE;
  DROP TABLE "foundation"."_posts_v" CASCADE;
  DROP TABLE "foundation"."_posts_v_locales" CASCADE;
  DROP TABLE "foundation"."_posts_v_rels" CASCADE;
  DROP TABLE "foundation"."pages" CASCADE;
  DROP TABLE "foundation"."pages_locales" CASCADE;
  DROP TABLE "foundation"."_pages_v" CASCADE;
  DROP TABLE "foundation"."_pages_v_locales" CASCADE;
  DROP TABLE "foundation"."activities_highlights" CASCADE;
  DROP TABLE "foundation"."activities_highlights_locales" CASCADE;
  DROP TABLE "foundation"."activities" CASCADE;
  DROP TABLE "foundation"."activities_locales" CASCADE;
  DROP TABLE "foundation"."_activities_v_version_highlights" CASCADE;
  DROP TABLE "foundation"."_activities_v_version_highlights_locales" CASCADE;
  DROP TABLE "foundation"."_activities_v" CASCADE;
  DROP TABLE "foundation"."_activities_v_locales" CASCADE;
  DROP TABLE "foundation"."media" CASCADE;
  DROP TABLE "foundation"."media_locales" CASCADE;
  DROP TABLE "foundation"."themes" CASCADE;
  DROP TABLE "foundation"."themes_locales" CASCADE;
  DROP TABLE "foundation"."tags" CASCADE;
  DROP TABLE "foundation"."team" CASCADE;
  DROP TABLE "foundation"."team_locales" CASCADE;
  DROP TABLE "foundation"."residents" CASCADE;
  DROP TABLE "foundation"."residents_locales" CASCADE;
  DROP TABLE "foundation"."partners" CASCADE;
  DROP TABLE "foundation"."partners_locales" CASCADE;
  DROP TABLE "foundation"."rooms_price_variants" CASCADE;
  DROP TABLE "foundation"."rooms_price_variants_locales" CASCADE;
  DROP TABLE "foundation"."rooms" CASCADE;
  DROP TABLE "foundation"."rooms_locales" CASCADE;
  DROP TABLE "foundation"."rooms_rels" CASCADE;
  DROP TABLE "foundation"."press" CASCADE;
  DROP TABLE "foundation"."reports" CASCADE;
  DROP TABLE "foundation"."reports_locales" CASCADE;
  DROP TABLE "foundation"."subscribers" CASCADE;
  DROP TABLE "foundation"."users_roles" CASCADE;
  DROP TABLE "foundation"."users_sessions" CASCADE;
  DROP TABLE "foundation"."users" CASCADE;
  DROP TABLE "foundation"."forms_blocks_checkbox" CASCADE;
  DROP TABLE "foundation"."forms_blocks_checkbox_locales" CASCADE;
  DROP TABLE "foundation"."forms_blocks_email" CASCADE;
  DROP TABLE "foundation"."forms_blocks_email_locales" CASCADE;
  DROP TABLE "foundation"."forms_blocks_message" CASCADE;
  DROP TABLE "foundation"."forms_blocks_message_locales" CASCADE;
  DROP TABLE "foundation"."forms_blocks_number" CASCADE;
  DROP TABLE "foundation"."forms_blocks_number_locales" CASCADE;
  DROP TABLE "foundation"."forms_blocks_select_options" CASCADE;
  DROP TABLE "foundation"."forms_blocks_select_options_locales" CASCADE;
  DROP TABLE "foundation"."forms_blocks_select" CASCADE;
  DROP TABLE "foundation"."forms_blocks_select_locales" CASCADE;
  DROP TABLE "foundation"."forms_blocks_text" CASCADE;
  DROP TABLE "foundation"."forms_blocks_text_locales" CASCADE;
  DROP TABLE "foundation"."forms_blocks_textarea" CASCADE;
  DROP TABLE "foundation"."forms_blocks_textarea_locales" CASCADE;
  DROP TABLE "foundation"."forms_blocks_date" CASCADE;
  DROP TABLE "foundation"."forms_blocks_date_locales" CASCADE;
  DROP TABLE "foundation"."forms_emails" CASCADE;
  DROP TABLE "foundation"."forms_emails_locales" CASCADE;
  DROP TABLE "foundation"."forms" CASCADE;
  DROP TABLE "foundation"."forms_locales" CASCADE;
  DROP TABLE "foundation"."form_submissions_submission_data" CASCADE;
  DROP TABLE "foundation"."form_submissions" CASCADE;
  DROP TABLE "foundation"."redirects" CASCADE;
  DROP TABLE "foundation"."redirects_rels" CASCADE;
  DROP TABLE "foundation"."payload_kv" CASCADE;
  DROP TABLE "foundation"."payload_locked_documents" CASCADE;
  DROP TABLE "foundation"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "foundation"."payload_preferences" CASCADE;
  DROP TABLE "foundation"."payload_preferences_rels" CASCADE;
  DROP TABLE "foundation"."payload_migrations" CASCADE;
  DROP TABLE "foundation"."settings_contacts" CASCADE;
  DROP TABLE "foundation"."settings_contacts_locales" CASCADE;
  DROP TABLE "foundation"."settings_visit_prices" CASCADE;
  DROP TABLE "foundation"."settings_visit_prices_locales" CASCADE;
  DROP TABLE "foundation"."settings_restaurant_hours" CASCADE;
  DROP TABLE "foundation"."settings_restaurant_hours_locales" CASCADE;
  DROP TABLE "foundation"."settings_membership_tiers" CASCADE;
  DROP TABLE "foundation"."settings_membership_tiers_locales" CASCADE;
  DROP TABLE "foundation"."settings_membership_perks" CASCADE;
  DROP TABLE "foundation"."settings_membership_perks_locales" CASCADE;
  DROP TABLE "foundation"."settings" CASCADE;
  DROP TABLE "foundation"."settings_locales" CASCADE;
  DROP TABLE "foundation"."navigation_items_children" CASCADE;
  DROP TABLE "foundation"."navigation_items_children_locales" CASCADE;
  DROP TABLE "foundation"."navigation_items" CASCADE;
  DROP TABLE "foundation"."navigation_items_locales" CASCADE;
  DROP TABLE "foundation"."navigation" CASCADE;
  DROP TYPE "foundation"."_locales";
  DROP TYPE "foundation"."enum_posts_status";
  DROP TYPE "foundation"."enum__posts_v_version_status";
  DROP TYPE "foundation"."enum__posts_v_published_locale";
  DROP TYPE "foundation"."enum_pages_status";
  DROP TYPE "foundation"."enum__pages_v_version_status";
  DROP TYPE "foundation"."enum__pages_v_published_locale";
  DROP TYPE "foundation"."enum_activities_motif";
  DROP TYPE "foundation"."enum_activities_status";
  DROP TYPE "foundation"."enum__activities_v_version_motif";
  DROP TYPE "foundation"."enum__activities_v_version_status";
  DROP TYPE "foundation"."enum__activities_v_published_locale";
  DROP TYPE "foundation"."enum_themes_tone";
  DROP TYPE "foundation"."enum_team_group";
  DROP TYPE "foundation"."enum_partners_kind";
  DROP TYPE "foundation"."enum_subscribers_locale";
  DROP TYPE "foundation"."enum_users_roles";
  DROP TYPE "foundation"."enum_forms_confirmation_type";
  DROP TYPE "foundation"."enum_redirects_to_type";`)
}
