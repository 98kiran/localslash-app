-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.deal_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL,
  customer_id uuid,
  event_type text NOT NULL CHECK (event_type = ANY (ARRAY['view'::text, 'click'::text, 'redeem'::text])),
  created_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text,
  CONSTRAINT deal_analytics_pkey PRIMARY KEY (id),
  CONSTRAINT deal_analytics_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id),
  CONSTRAINT deal_analytics_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES auth.users(id)
);
CREATE TABLE public.deal_redemptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  store_id uuid NOT NULL,
  redemption_code text NOT NULL UNIQUE,
  redeemed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'active'::text,
  CONSTRAINT deal_redemptions_pkey PRIMARY KEY (id),
  CONSTRAINT deal_redemptions_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id),
  CONSTRAINT deal_redemptions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES auth.users(id),
  CONSTRAINT deal_redemptions_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.deals (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  store_id uuid NOT NULL,
  title character varying NOT NULL,
  description text NOT NULL,
  original_price numeric,
  discount_price numeric DEFAULT 0,
  discount_percentage integer,
  deal_type character varying NOT NULL CHECK (deal_type::text = ANY (ARRAY['percentage'::character varying, 'fixed_amount'::character varying, 'bogo'::character varying, 'other'::character varying]::text[])),
  category character varying,
  image_url text,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  terms_conditions text,
  max_redemptions integer,
  current_redemptions integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  view_count integer DEFAULT 0,
  CONSTRAINT deals_pkey PRIMARY KEY (id),
  CONSTRAINT deals_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
  CONSTRAINT fk_deals_store FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.favorites (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  store_id uuid,
  deal_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT favorites_pkey PRIMARY KEY (id),
  CONSTRAINT favorites_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id),
  CONSTRAINT favorites_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
  CONSTRAINT favorites_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES auth.users(id)
);
CREATE TABLE public.stores (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name character varying NOT NULL,
  description text,
  address character varying NOT NULL,
  place_id character varying,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  phone character varying,
  email character varying,
  website character varying,
  logo_url text,
  cover_image_url text,
  opening_hours jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT stores_pkey PRIMARY KEY (id),
  CONSTRAINT stores_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT fk_stores_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  user_type character varying NOT NULL CHECK (user_type::text = ANY (ARRAY['customer'::character varying, 'store_owner'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);