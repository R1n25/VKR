--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6
-- Dumped by pg_dump version 16.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'WIN1251';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: redistribute_accessories(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.redistribute_accessories() RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    accessories_count INTEGER;
    excess_count INTEGER;
    third INTEGER;
BEGIN
    -- Получаем количество запчастей в категории "Аксессуары"
    SELECT COUNT(*) INTO accessories_count FROM spare_parts WHERE category_id = 15;
    
    -- Рассчитываем избыток запчастей, которые нужно распределить
    IF accessories_count > 1000 THEN
        excess_count := accessories_count - 1000;
        third := excess_count / 3;
        
        -- Распределяем первую треть в двигатель
        WITH to_move AS (
            SELECT id FROM spare_parts 
            WHERE category_id = 15
            ORDER BY RANDOM()
            LIMIT third
        )
        UPDATE spare_parts 
        SET category_id = 1
        WHERE id IN (SELECT id FROM to_move);
        
        -- Распределяем вторую треть в электрику
        WITH to_move AS (
            SELECT id FROM spare_parts 
            WHERE category_id = 15
            ORDER BY RANDOM()
            LIMIT third
        )
        UPDATE spare_parts 
        SET category_id = 6
        WHERE id IN (SELECT id FROM to_move);
        
        -- Распределяем третью треть в подвеску
        WITH to_move AS (
            SELECT id FROM spare_parts 
            WHERE category_id = 15
            ORDER BY RANDOM()
            LIMIT third
        )
        UPDATE spare_parts 
        SET category_id = 4
        WHERE id IN (SELECT id FROM to_move);
    END IF;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


--
-- Name: car_brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.car_brands (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    country character varying(255),
    description text,
    logo_url character varying(255),
    vin_required boolean DEFAULT false NOT NULL,
    is_popular boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: car_brands_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.car_brands_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: car_brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.car_brands_id_seq OWNED BY public.car_brands.id;


--
-- Name: car_engine_spare_part; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.car_engine_spare_part (
    id bigint NOT NULL,
    car_engine_id bigint NOT NULL,
    spare_part_id bigint NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: car_engine_spare_part_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.car_engine_spare_part_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: car_engine_spare_part_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.car_engine_spare_part_id_seq OWNED BY public.car_engine_spare_part.id;


--
-- Name: car_engines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.car_engines (
    id bigint NOT NULL,
    model_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    volume character varying(255),
    power integer,
    year_start integer,
    year_end integer,
    description text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: car_engines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.car_engines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: car_engines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.car_engines_id_seq OWNED BY public.car_engines.id;


--
-- Name: car_models; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.car_models (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    brand_id bigint NOT NULL,
    year_start integer,
    year_end integer,
    body_type character varying(255),
    engine_type character varying(255),
    engine_volume character varying(255),
    drive_type character varying(255),
    is_popular boolean DEFAULT false NOT NULL,
    image_url character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: car_models_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.car_models_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: car_models_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.car_models_id_seq OWNED BY public.car_models.id;


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id bigint NOT NULL,
    cart_id bigint NOT NULL,
    spare_part_id bigint NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price numeric(10,2),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cart_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cart_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;


--
-- Name: carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carts (
    id bigint NOT NULL,
    user_id bigint,
    session_id character varying(255),
    total_price numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: carts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.carts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: carts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.carts_id_seq OWNED BY public.carts.id;


--
-- Name: filter_attributes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.filter_attributes (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) DEFAULT 'text'::character varying NOT NULL,
    options json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: filter_attributes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.filter_attributes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: filter_attributes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.filter_attributes_id_seq OWNED BY public.filter_attributes.id;


--
-- Name: filter_category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.filter_category (
    id bigint NOT NULL,
    filter_attribute_id bigint NOT NULL,
    part_category_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: filter_category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.filter_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: filter_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.filter_category_id_seq OWNED BY public.filter_category.id;


--
-- Name: filter_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.filter_values (
    id bigint NOT NULL,
    spare_part_id bigint NOT NULL,
    filter_attribute_id bigint NOT NULL,
    value character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: filter_values_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.filter_values_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: filter_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.filter_values_id_seq OWNED BY public.filter_values.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    spare_part_id bigint,
    name character varying(255) NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: order_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_notes (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    user_id bigint,
    content text NOT NULL,
    type character varying(255) DEFAULT 'general'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: order_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_notes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_notes_id_seq OWNED BY public.order_notes.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id bigint NOT NULL,
    user_id bigint,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    total_price numeric(10,2),
    customer_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(255),
    address text,
    billing_address text,
    status_history json,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    order_number character varying(255) NOT NULL,
    total numeric(10,2),
    notes_json json,
    status_updated_at timestamp(0) without time zone,
    status_updated_by bigint
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: part_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.part_categories (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    parent_id bigint,
    image_url character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: part_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.part_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: part_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.part_categories_id_seq OWNED BY public.part_categories.id;


--
-- Name: permanent_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permanent_users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    markup_percent numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    email_verified_at timestamp(0) without time zone,
    remember_token character varying(255),
    phone character varying(255),
    company character varying(255),
    discount_percent numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: permanent_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.permanent_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: permanent_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.permanent_users_id_seq OWNED BY public.permanent_users.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


--
-- Name: spare_part_analogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spare_part_analogs (
    id bigint NOT NULL,
    spare_part_id bigint NOT NULL,
    analog_spare_part_id bigint NOT NULL,
    is_direct boolean DEFAULT true NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: spare_part_analogs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.spare_part_analogs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: spare_part_analogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.spare_part_analogs_id_seq OWNED BY public.spare_part_analogs.id;


--
-- Name: spare_part_compatibilities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spare_part_compatibilities (
    id bigint NOT NULL,
    spare_part_id bigint NOT NULL,
    car_model_id bigint NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    car_engine_id bigint,
    is_verified boolean DEFAULT false NOT NULL
);


--
-- Name: spare_part_compatibilities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.spare_part_compatibilities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: spare_part_compatibilities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.spare_part_compatibilities_id_seq OWNED BY public.spare_part_compatibilities.id;


--
-- Name: spare_parts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spare_parts (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    part_number character varying(255) NOT NULL,
    price numeric(10,2) NOT NULL,
    stock_quantity integer DEFAULT 0 NOT NULL,
    manufacturer character varying(255) NOT NULL,
    category_id bigint,
    image_url character varying(255),
    is_available boolean DEFAULT true NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: spare_parts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.spare_parts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: spare_parts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.spare_parts_id_seq OWNED BY public.spare_parts.id;


--
-- Name: user_suggestions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_suggestions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    spare_part_id bigint,
    suggestion_type character varying(255) NOT NULL,
    comment text,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    admin_comment text,
    data json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    analog_spare_part_id bigint,
    car_model_id bigint,
    approved_by bigint,
    approved_at timestamp(0) without time zone
);


--
-- Name: user_suggestions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_suggestions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_suggestions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_suggestions_id_seq OWNED BY public.user_suggestions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    role character varying(255) DEFAULT 'user'::character varying NOT NULL,
    markup_percent numeric(8,2) DEFAULT '10'::numeric NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vin_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vin_requests (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    vin character varying(255) NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    result json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    name character varying(255),
    email character varying(255),
    phone character varying(255),
    parts_description text,
    admin_notes text,
    processed_at timestamp(0) without time zone
);


--
-- Name: vin_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vin_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vin_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vin_requests_id_seq OWNED BY public.vin_requests.id;


--
-- Name: car_brands id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_brands ALTER COLUMN id SET DEFAULT nextval('public.car_brands_id_seq'::regclass);


--
-- Name: car_engine_spare_part id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_engine_spare_part ALTER COLUMN id SET DEFAULT nextval('public.car_engine_spare_part_id_seq'::regclass);


--
-- Name: car_engines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_engines ALTER COLUMN id SET DEFAULT nextval('public.car_engines_id_seq'::regclass);


--
-- Name: car_models id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_models ALTER COLUMN id SET DEFAULT nextval('public.car_models_id_seq'::regclass);


--
-- Name: cart_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);


--
-- Name: carts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts ALTER COLUMN id SET DEFAULT nextval('public.carts_id_seq'::regclass);


--
-- Name: filter_attributes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filter_attributes ALTER COLUMN id SET DEFAULT nextval('public.filter_attributes_id_seq'::regclass);


--
-- Name: filter_category id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filter_category ALTER COLUMN id SET DEFAULT nextval('public.filter_category_id_seq'::regclass);


--
-- Name: filter_values id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filter_values ALTER COLUMN id SET DEFAULT nextval('public.filter_values_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: order_notes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_notes ALTER COLUMN id SET DEFAULT nextval('public.order_notes_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: part_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_categories ALTER COLUMN id SET DEFAULT nextval('public.part_categories_id_seq'::regclass);


--
-- Name: permanent_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permanent_users ALTER COLUMN id SET DEFAULT nextval('public.permanent_users_id_seq'::regclass);


--
-- Name: spare_part_analogs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_part_analogs ALTER COLUMN id SET DEFAULT nextval('public.spare_part_analogs_id_seq'::regclass);


--
-- Name: spare_part_compatibilities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_part_compatibilities ALTER COLUMN id SET DEFAULT nextval('public.spare_part_compatibilities_id_seq'::regclass);


--
-- Name: spare_parts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_parts ALTER COLUMN id SET DEFAULT nextval('public.spare_parts_id_seq'::regclass);


--
-- Name: user_suggestions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_suggestions ALTER COLUMN id SET DEFAULT nextval('public.user_suggestions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vin_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vin_requests ALTER COLUMN id SET DEFAULT nextval('public.vin_requests_id_seq'::regclass);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: car_brands car_brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_brands
    ADD CONSTRAINT car_brands_pkey PRIMARY KEY (id);


--
-- Name: car_brands car_brands_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_brands
    ADD CONSTRAINT car_brands_slug_unique UNIQUE (slug);


--
-- Name: car_engine_spare_part car_engine_spare_part_car_engine_id_spare_part_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_engine_spare_part
    ADD CONSTRAINT car_engine_spare_part_car_engine_id_spare_part_id_unique UNIQUE (car_engine_id, spare_part_id);


--
-- Name: car_engine_spare_part car_engine_spare_part_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_engine_spare_part
    ADD CONSTRAINT car_engine_spare_part_pkey PRIMARY KEY (id);


--
-- Name: car_engines car_engines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_engines
    ADD CONSTRAINT car_engines_pkey PRIMARY KEY (id);


--
-- Name: car_engines car_engines_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_engines
    ADD CONSTRAINT car_engines_slug_unique UNIQUE (slug);


--
-- Name: car_models car_models_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_models
    ADD CONSTRAINT car_models_pkey PRIMARY KEY (id);


--
-- Name: car_models car_models_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_models
    ADD CONSTRAINT car_models_slug_unique UNIQUE (slug);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: spare_part_compatibilities compatibility_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_part_compatibilities
    ADD CONSTRAINT compatibility_unique UNIQUE (spare_part_id, car_model_id, car_engine_id);


--
-- Name: filter_attributes filter_attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filter_attributes
    ADD CONSTRAINT filter_attributes_pkey PRIMARY KEY (id);


--
-- Name: filter_category filter_category_filter_attribute_id_part_category_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filter_category
    ADD CONSTRAINT filter_category_filter_attribute_id_part_category_id_unique UNIQUE (filter_attribute_id, part_category_id);


--
-- Name: filter_category filter_category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filter_category
    ADD CONSTRAINT filter_category_pkey PRIMARY KEY (id);


--
-- Name: filter_values filter_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filter_values
    ADD CONSTRAINT filter_values_pkey PRIMARY KEY (id);


--
-- Name: filter_values filter_values_spare_part_id_filter_attribute_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filter_values
    ADD CONSTRAINT filter_values_spare_part_id_filter_attribute_id_unique UNIQUE (spare_part_id, filter_attribute_id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_notes order_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_notes
    ADD CONSTRAINT order_notes_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: part_categories part_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_categories
    ADD CONSTRAINT part_categories_pkey PRIMARY KEY (id);


--
-- Name: part_categories part_categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_categories
    ADD CONSTRAINT part_categories_slug_unique UNIQUE (slug);


--
-- Name: permanent_users permanent_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permanent_users
    ADD CONSTRAINT permanent_users_email_unique UNIQUE (email);


--
-- Name: permanent_users permanent_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permanent_users
    ADD CONSTRAINT permanent_users_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: spare_part_analogs spare_part_analogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_part_analogs
    ADD CONSTRAINT spare_part_analogs_pkey PRIMARY KEY (id);


--
-- Name: spare_part_analogs spare_part_analogs_spare_part_id_analog_spare_part_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_part_analogs
    ADD CONSTRAINT spare_part_analogs_spare_part_id_analog_spare_part_id_unique UNIQUE (spare_part_id, analog_spare_part_id);


--
-- Name: spare_part_compatibilities spare_part_compatibilities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_part_compatibilities
    ADD CONSTRAINT spare_part_compatibilities_pkey PRIMARY KEY (id);


--
-- Name: spare_parts spare_parts_part_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_parts
    ADD CONSTRAINT spare_parts_part_number_unique UNIQUE (part_number);


--
-- Name: spare_parts spare_parts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_parts
    ADD CONSTRAINT spare_parts_pkey PRIMARY KEY (id);


--
-- Name: spare_parts spare_parts_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_parts
    ADD CONSTRAINT spare_parts_slug_unique UNIQUE (slug);


--
-- Name: user_suggestions user_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_suggestions
    ADD CONSTRAINT user_suggestions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vin_requests vin_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vin_requests
    ADD CONSTRAINT vin_requests_pkey PRIMARY KEY (id);


--
-- Name: cart_items_cart_id_spare_part_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cart_items_cart_id_spare_part_id_index ON public.cart_items USING btree (cart_id, spare_part_id);


--
-- Name: carts_session_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX carts_session_id_index ON public.carts USING btree (session_id);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: spare_parts_manufacturer_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX spare_parts_manufacturer_index ON public.spare_parts USING btree (manufacturer);


--
-- Name: spare_parts_part_number_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX spare_parts_part_number_index ON public.spare_parts USING btree (part_number);


--
-- Name: car_engine_spare_part car_engine_spare_part_car_engine_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_engine_spare_part
    ADD CONSTRAINT car_engine_spare_part_car_engine_id_foreign FOREIGN KEY (car_engine_id) REFERENCES public.car_engines(id) ON DELETE CASCADE;


--
-- Name: car_engine_spare_part car_engine_spare_part_spare_part_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_engine_spare_part
    ADD CONSTRAINT car_engine_spare_part_spare_part_id_foreign FOREIGN KEY (spare_part_id) REFERENCES public.spare_parts(id) ON DELETE CASCADE;


--
-- Name: car_engines car_engines_model_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_engines
    ADD CONSTRAINT car_engines_model_id_foreign FOREIGN KEY (model_id) REFERENCES public.car_models(id) ON DELETE CASCADE;


--
-- Name: car_models car_models_brand_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_models
    ADD CONSTRAINT car_models_brand_id_foreign FOREIGN KEY (brand_id) REFERENCES public.car_brands(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_cart_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_foreign FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_spare_part_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_spare_part_id_foreign FOREIGN KEY (spare_part_id) REFERENCES public.spare_parts(id) ON DELETE CASCADE;


--
-- Name: carts carts_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: filter_category filter_category_filter_attribute_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filter_category
    ADD CONSTRAINT filter_category_filter_attribute_id_foreign FOREIGN KEY (filter_attribute_id) REFERENCES public.filter_attributes(id) ON DELETE CASCADE;


--
-- Name: filter_category filter_category_part_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filter_category
    ADD CONSTRAINT filter_category_part_category_id_foreign FOREIGN KEY (part_category_id) REFERENCES public.part_categories(id) ON DELETE CASCADE;


--
-- Name: filter_values filter_values_filter_attribute_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filter_values
    ADD CONSTRAINT filter_values_filter_attribute_id_foreign FOREIGN KEY (filter_attribute_id) REFERENCES public.filter_attributes(id) ON DELETE CASCADE;


--
-- Name: filter_values filter_values_spare_part_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filter_values
    ADD CONSTRAINT filter_values_spare_part_id_foreign FOREIGN KEY (spare_part_id) REFERENCES public.spare_parts(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_spare_part_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_spare_part_id_foreign FOREIGN KEY (spare_part_id) REFERENCES public.spare_parts(id) ON DELETE SET NULL;


--
-- Name: order_notes order_notes_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_notes
    ADD CONSTRAINT order_notes_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_notes order_notes_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_notes
    ADD CONSTRAINT order_notes_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: orders orders_status_updated_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_status_updated_by_foreign FOREIGN KEY (status_updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: orders orders_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: part_categories part_categories_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_categories
    ADD CONSTRAINT part_categories_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.part_categories(id) ON DELETE SET NULL;


--
-- Name: spare_part_analogs spare_part_analogs_analog_spare_part_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_part_analogs
    ADD CONSTRAINT spare_part_analogs_analog_spare_part_id_foreign FOREIGN KEY (analog_spare_part_id) REFERENCES public.spare_parts(id) ON DELETE CASCADE;


--
-- Name: spare_part_analogs spare_part_analogs_spare_part_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_part_analogs
    ADD CONSTRAINT spare_part_analogs_spare_part_id_foreign FOREIGN KEY (spare_part_id) REFERENCES public.spare_parts(id) ON DELETE CASCADE;


--
-- Name: spare_part_compatibilities spare_part_compatibilities_car_engine_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_part_compatibilities
    ADD CONSTRAINT spare_part_compatibilities_car_engine_id_foreign FOREIGN KEY (car_engine_id) REFERENCES public.car_engines(id) ON DELETE SET NULL;


--
-- Name: spare_part_compatibilities spare_part_compatibilities_car_model_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_part_compatibilities
    ADD CONSTRAINT spare_part_compatibilities_car_model_id_foreign FOREIGN KEY (car_model_id) REFERENCES public.car_models(id) ON DELETE CASCADE;


--
-- Name: spare_part_compatibilities spare_part_compatibilities_spare_part_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_part_compatibilities
    ADD CONSTRAINT spare_part_compatibilities_spare_part_id_foreign FOREIGN KEY (spare_part_id) REFERENCES public.spare_parts(id) ON DELETE CASCADE;


--
-- Name: spare_parts spare_parts_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_parts
    ADD CONSTRAINT spare_parts_category_id_foreign FOREIGN KEY (category_id) REFERENCES public.part_categories(id) ON DELETE SET NULL;


--
-- Name: user_suggestions user_suggestions_spare_part_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_suggestions
    ADD CONSTRAINT user_suggestions_spare_part_id_foreign FOREIGN KEY (spare_part_id) REFERENCES public.spare_parts(id) ON DELETE SET NULL;


--
-- Name: user_suggestions user_suggestions_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_suggestions
    ADD CONSTRAINT user_suggestions_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: vin_requests vin_requests_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vin_requests
    ADD CONSTRAINT vin_requests_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6
-- Dumped by pg_dump version 16.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'WIN1251';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	2014_10_12_000000_create_users_table	1
2	2023_01_01_000001_create_car_brands_table	1
3	2023_01_01_000002_create_car_models_table	1
4	2023_01_01_000003_create_part_categories_table	1
5	2023_01_01_000004_create_spare_parts_table	1
6	2023_01_01_000005_create_carts_table	1
7	2023_01_01_000006_create_cart_items_table	1
8	2023_01_01_000007_create_orders_table	1
9	2023_01_01_000008_create_order_items_table	1
10	2023_01_01_000009_create_spare_part_compatibilities_table	1
11	2023_01_01_000010_create_spare_part_analogs_table	1
12	2023_01_01_000011_create_filter_attributes_table	1
13	2023_01_01_000012_create_filter_values_table	1
14	2023_01_01_000013_create_user_suggestions_table	1
15	2023_01_01_000014_create_payment_methods_table	1
16	2023_01_01_000015_create_payments_table	1
17	2023_01_01_000016_create_balance_transactions_table	1
18	2023_01_01_000017_create_vin_requests_table	1
19	2023_01_01_000018_create_user_cars_table	1
20	2023_01_01_000019_create_vin_searches_table	1
21	2023_01_01_000020_create_part_schemes_table	1
22	2023_01_01_000021_create_permanent_users_table	1
23	2023_01_01_000022_create_sessions_table	1
24	2025_06_06_073246_create_cache_table	2
25	2023_06_25_000001_add_order_number_to_orders_table	3
26	2023_06_25_000002_rename_email_fields_in_orders_table	4
27	2023_06_25_000003_add_total_to_orders_table	5
28	2023_06_25_000004_add_notes_json_to_orders_table	6
29	2023_06_25_000005_update_order_items_table	7
30	2023_06_25_000006_add_status_updated_fields_to_orders_table	8
31	2023_06_25_000007_create_order_notes_table	9
32	2025_06_06_120239_rename_type_to_suggestion_type_in_user_suggestions_table	10
33	2025_06_06_120500_add_missing_columns_to_user_suggestions_table	11
34	2025_06_06_120600_rename_content_to_comment_in_user_suggestions_table	12
35	2025_06_06_120700_modify_comment_column_in_user_suggestions_table	13
36	2025_06_08_000001_create_car_engines_table	14
37	2025_06_10_000001_create_car_engine_spare_part_table	15
38	2025_06_09_023650_add_car_engine_id_to_spare_part_compatibilities	16
39	2025_06_09_060544_add_car_engine_id_and_is_verified_to_spare_part_compatibilities_table	17
40	2025_06_09_074925_add_fields_to_vin_requests_table	18
41	2025_06_09_084438_remove_payment_functionality	19
42	2023_07_30_000001_drop_vin_searches_table	20
43	2023_07_30_000002_drop_part_scheme_items_table	21
44	2023_07_30_000003_drop_part_schemes_table	22
45	2023_07_30_000004_drop_user_cars_table	23
46	2023_07_30_000005_drop_car_model_spare_part_table	24
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 46, true);


--
-- PostgreSQL database dump complete
--

