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
    logo_url character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    country character varying(255) NOT NULL,
    description text,
    vin_required boolean DEFAULT false NOT NULL,
    is_popular boolean DEFAULT false NOT NULL
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
-- Name: car_model_spare_part; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.car_model_spare_part (
    id bigint NOT NULL,
    car_model_id bigint NOT NULL,
    spare_part_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: car_model_spare_part_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.car_model_spare_part_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: car_model_spare_part_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.car_model_spare_part_id_seq OWNED BY public.car_model_spare_part.id;


--
-- Name: car_models; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.car_models (
    id bigint NOT NULL,
    brand_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    year_from integer,
    year_to integer,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    description text,
    image_url character varying(255),
    is_popular boolean DEFAULT false NOT NULL,
    car_brand_id bigint
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
    spare_part_id bigint,
    quantity integer DEFAULT 1 NOT NULL,
    price numeric(10,2) NOT NULL,
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
-- Name: cross_references; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cross_references (
    id bigint NOT NULL,
    original_number character varying(255) NOT NULL,
    cross_number character varying(255) NOT NULL,
    manufacturer character varying(255) NOT NULL,
    brand character varying(255) NOT NULL,
    name character varying(255),
    type character varying(255),
    description text,
    is_verified boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: cross_references_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cross_references_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cross_references_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cross_references_id_seq OWNED BY public.cross_references.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: filter_attributes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.filter_attributes (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    unit character varying(255),
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
    "position" integer DEFAULT 0 NOT NULL,
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
-- Name: job_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


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
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    spare_part_id bigint,
    part_number character varying(255),
    part_name character varying(255)
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
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id bigint NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    total numeric(10,2),
    customer_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    address text NOT NULL,
    user_id bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    order_number character varying(255) NOT NULL,
    total_price numeric(10,2),
    payment_method character varying(255) DEFAULT 'cash'::character varying NOT NULL,
    shipping_address character varying(255),
    shipping_city character varying(255),
    shipping_zip character varying(255),
    shipping_phone character varying(255),
    shipping_name character varying(255),
    notes text,
    payment_status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    notes_json json,
    status_history json,
    status_updated_at timestamp(0) without time zone,
    status_updated_by bigint,
    payment_id bigint,
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('processing'::character varying)::text, ('completed'::character varying)::text, ('cancelled'::character varying)::text])))
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
-- Name: part_category_part; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.part_category_part (
    id bigint NOT NULL,
    spare_part_id bigint NOT NULL,
    part_category_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: part_category_part_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.part_category_part_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: part_category_part_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.part_category_part_id_seq OWNED BY public.part_category_part.id;


--
-- Name: part_scheme_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.part_scheme_items (
    id bigint NOT NULL,
    part_scheme_id bigint NOT NULL,
    spare_part_id bigint NOT NULL,
    position_x integer,
    position_y integer,
    number character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: part_scheme_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.part_scheme_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: part_scheme_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.part_scheme_items_id_seq OWNED BY public.part_scheme_items.id;


--
-- Name: part_schemes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.part_schemes (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    image character varying(255) NOT NULL,
    car_model_id bigint NOT NULL,
    part_category_id bigint NOT NULL,
    hotspots json,
    description text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: part_schemes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.part_schemes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: part_schemes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.part_schemes_id_seq OWNED BY public.part_schemes.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_methods (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    icon character varying(255),
    settings json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: payment_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_methods_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_methods_id_seq OWNED BY public.payment_methods.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    user_id bigint,
    payment_method_id bigint NOT NULL,
    transaction_id character varying(255),
    amount numeric(10,2) NOT NULL,
    currency character varying(255) DEFAULT 'RUB'::character varying NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    notes text,
    payment_data json,
    payment_date timestamp(0) without time zone,
    refund_date timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT payments_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[])))
);


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: permanent_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permanent_users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    markup_percent double precision DEFAULT '0'::double precision NOT NULL,
    remember_token character varying(100),
    email_verified_at timestamp(0) without time zone,
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
    start_year integer,
    end_year integer,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
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
-- Name: spare_part_vehicle_style; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spare_part_vehicle_style (
    id bigint NOT NULL,
    spare_part_id bigint NOT NULL,
    vehicle_style_id bigint NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: spare_part_vehicle_style_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.spare_part_vehicle_style_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: spare_part_vehicle_style_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.spare_part_vehicle_style_id_seq OWNED BY public.spare_part_vehicle_style.id;


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
    category character varying(255) NOT NULL,
    image_url character varying(255),
    is_available boolean DEFAULT true NOT NULL,
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
-- Name: user_cars; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_cars (
    id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: user_cars_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_cars_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_cars_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_cars_id_seq OWNED BY public.user_cars.id;


--
-- Name: user_suggestions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_suggestions (
    id bigint NOT NULL,
    user_id bigint,
    suggestion_type character varying(255) NOT NULL,
    spare_part_id bigint,
    analog_spare_part_id bigint,
    car_model_id bigint,
    comment text,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    admin_comment text,
    approved_by bigint,
    approved_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
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
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    is_admin boolean DEFAULT false NOT NULL,
    markup_percent double precision DEFAULT '0'::double precision NOT NULL,
    role character varying(255) DEFAULT 'user'::character varying NOT NULL
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
-- Name: vehicle_makes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicle_makes (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    logo_url character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: vehicle_makes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vehicle_makes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vehicle_makes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vehicle_makes_id_seq OWNED BY public.vehicle_makes.id;


--
-- Name: vehicle_models; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicle_models (
    id bigint NOT NULL,
    make_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    image_url character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: vehicle_models_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vehicle_models_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vehicle_models_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vehicle_models_id_seq OWNED BY public.vehicle_models.id;


--
-- Name: vehicle_styles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicle_styles (
    id bigint NOT NULL,
    model_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    year integer NOT NULL,
    body_style character varying(255),
    engine_type character varying(255),
    transmission character varying(255),
    description text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: vehicle_styles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vehicle_styles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vehicle_styles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vehicle_styles_id_seq OWNED BY public.vehicle_styles.id;


--
-- Name: vin_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vin_requests (
    id bigint NOT NULL,
    vin_code character varying(17) NOT NULL,
    user_id bigint,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(255),
    parts_description text NOT NULL,
    status character varying(255) DEFAULT 'new'::character varying NOT NULL,
    admin_notes text,
    processed_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT vin_requests_status_check CHECK (((status)::text = ANY (ARRAY[('new'::character varying)::text, ('processing'::character varying)::text, ('completed'::character varying)::text, ('cancelled'::character varying)::text])))
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
-- Name: vin_searches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vin_searches (
    id bigint NOT NULL,
    vin character varying(17) NOT NULL,
    user_id bigint,
    vehicle_info json,
    make character varying(255),
    model character varying(255),
    year integer,
    engine character varying(255),
    transmission character varying(255),
    body_type character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: vin_searches_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vin_searches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vin_searches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vin_searches_id_seq OWNED BY public.vin_searches.id;


--
-- Name: car_brands id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_brands ALTER COLUMN id SET DEFAULT nextval('public.car_brands_id_seq'::regclass);


--
-- Name: car_model_spare_part id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_model_spare_part ALTER COLUMN id SET DEFAULT nextval('public.car_model_spare_part_id_seq'::regclass);


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
-- Name: cross_references id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cross_references ALTER COLUMN id SET DEFAULT nextval('public.cross_references_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


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
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: part_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_categories ALTER COLUMN id SET DEFAULT nextval('public.part_categories_id_seq'::regclass);


--
-- Name: part_category_part id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_category_part ALTER COLUMN id SET DEFAULT nextval('public.part_category_part_id_seq'::regclass);


--
-- Name: part_scheme_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_scheme_items ALTER COLUMN id SET DEFAULT nextval('public.part_scheme_items_id_seq'::regclass);


--
-- Name: part_schemes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_schemes ALTER COLUMN id SET DEFAULT nextval('public.part_schemes_id_seq'::regclass);


--
-- Name: payment_methods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods ALTER COLUMN id SET DEFAULT nextval('public.payment_methods_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


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
-- Name: spare_part_vehicle_style id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_part_vehicle_style ALTER COLUMN id SET DEFAULT nextval('public.spare_part_vehicle_style_id_seq'::regclass);


--
-- Name: spare_parts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_parts ALTER COLUMN id SET DEFAULT nextval('public.spare_parts_id_seq'::regclass);


--
-- Name: user_cars id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_cars ALTER COLUMN id SET DEFAULT nextval('public.user_cars_id_seq'::regclass);


--
-- Name: user_suggestions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_suggestions ALTER COLUMN id SET DEFAULT nextval('public.user_suggestions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehicle_makes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_makes ALTER COLUMN id SET DEFAULT nextval('public.vehicle_makes_id_seq'::regclass);


--
-- Name: vehicle_models id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_models ALTER COLUMN id SET DEFAULT nextval('public.vehicle_models_id_seq'::regclass);


--
-- Name: vehicle_styles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_styles ALTER COLUMN id SET DEFAULT nextval('public.vehicle_styles_id_seq'::regclass);


--
-- Name: vin_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vin_requests ALTER COLUMN id SET DEFAULT nextval('public.vin_requests_id_seq'::regclass);


--
-- Name: vin_searches id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vin_searches ALTER COLUMN id SET DEFAULT nextval('public.vin_searches_id_seq'::regclass);


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
-- Name: car_model_spare_part car_model_spare_part_car_model_id_spare_part_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_model_spare_part
    ADD CONSTRAINT car_model_spare_part_car_model_id_spare_part_id_unique UNIQUE (car_model_id, spare_part_id);


--
-- Name: car_model_spare_part car_model_spare_part_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_model_spare_part
    ADD CONSTRAINT car_model_spare_part_pkey PRIMARY KEY (id);


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
-- Name: cross_references cross_references_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cross_references
    ADD CONSTRAINT cross_references_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: filter_attributes filter_attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filter_attributes
    ADD CONSTRAINT filter_attributes_pkey PRIMARY KEY (id);


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
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


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
-- Name: part_category_part part_category_part_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_category_part
    ADD CONSTRAINT part_category_part_pkey PRIMARY KEY (id);


--
-- Name: part_scheme_items part_scheme_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_scheme_items
    ADD CONSTRAINT part_scheme_items_pkey PRIMARY KEY (id);


--
-- Name: part_schemes part_schemes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_schemes
    ADD CONSTRAINT part_schemes_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: payment_methods payment_methods_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_code_unique UNIQUE (code);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


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
-- Name: spare_part_vehicle_style spare_part_vehicle_style_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_part_vehicle_style
    ADD CONSTRAINT spare_part_vehicle_style_pkey PRIMARY KEY (id);


--
-- Name: spare_part_vehicle_style spare_part_vehicle_style_spare_part_id_vehicle_style_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_part_vehicle_style
    ADD CONSTRAINT spare_part_vehicle_style_spare_part_id_vehicle_style_id_unique UNIQUE (spare_part_id, vehicle_style_id);


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
-- Name: spare_part_compatibilities unique_compatibility; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_part_compatibilities
    ADD CONSTRAINT unique_compatibility UNIQUE (spare_part_id, car_model_id, start_year, end_year);


--
-- Name: user_cars user_cars_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_cars
    ADD CONSTRAINT user_cars_pkey PRIMARY KEY (id);


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
-- Name: vehicle_makes vehicle_makes_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_makes
    ADD CONSTRAINT vehicle_makes_name_unique UNIQUE (name);


--
-- Name: vehicle_makes vehicle_makes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_makes
    ADD CONSTRAINT vehicle_makes_pkey PRIMARY KEY (id);


--
-- Name: vehicle_makes vehicle_makes_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_makes
    ADD CONSTRAINT vehicle_makes_slug_unique UNIQUE (slug);


--
-- Name: vehicle_models vehicle_models_make_id_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_models
    ADD CONSTRAINT vehicle_models_make_id_name_unique UNIQUE (make_id, name);


--
-- Name: vehicle_models vehicle_models_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_models
    ADD CONSTRAINT vehicle_models_pkey PRIMARY KEY (id);


--
-- Name: vehicle_styles vehicle_styles_model_id_name_year_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_styles
    ADD CONSTRAINT vehicle_styles_model_id_name_year_unique UNIQUE (model_id, name, year);


--
-- Name: vehicle_styles vehicle_styles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_styles
    ADD CONSTRAINT vehicle_styles_pkey PRIMARY KEY (id);


--
-- Name: vin_requests vin_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vin_requests
    ADD CONSTRAINT vin_requests_pkey PRIMARY KEY (id);


--
-- Name: vin_searches vin_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vin_searches
    ADD CONSTRAINT vin_searches_pkey PRIMARY KEY (id);


--
-- Name: carts_session_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX carts_session_id_index ON public.carts USING btree (session_id);


--
-- Name: cross_references_brand_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cross_references_brand_index ON public.cross_references USING btree (brand);


--
-- Name: cross_references_cross_number_brand_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cross_references_cross_number_brand_index ON public.cross_references USING btree (cross_number, brand);


--
-- Name: cross_references_cross_number_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cross_references_cross_number_index ON public.cross_references USING btree (cross_number);


--
-- Name: cross_references_manufacturer_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cross_references_manufacturer_index ON public.cross_references USING btree (manufacturer);


--
-- Name: cross_references_original_number_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cross_references_original_number_index ON public.cross_references USING btree (original_number);


--
-- Name: cross_references_original_number_manufacturer_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cross_references_original_number_manufacturer_index ON public.cross_references USING btree (original_number, manufacturer);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


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
-- Name: car_model_spare_part car_model_spare_part_car_model_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_model_spare_part
    ADD CONSTRAINT car_model_spare_part_car_model_id_foreign FOREIGN KEY (car_model_id) REFERENCES public.car_models(id) ON DELETE CASCADE;


--
-- Name: car_model_spare_part car_model_spare_part_spare_part_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_model_spare_part
    ADD CONSTRAINT car_model_spare_part_spare_part_id_foreign FOREIGN KEY (spare_part_id) REFERENCES public.spare_parts(id) ON DELETE CASCADE;


--
-- Name: car_models car_models_brand_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_models
    ADD CONSTRAINT car_models_brand_id_foreign FOREIGN KEY (brand_id) REFERENCES public.car_brands(id) ON DELETE CASCADE;


--
-- Name: car_models car_models_car_brand_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_models
    ADD CONSTRAINT car_models_car_brand_id_foreign FOREIGN KEY (car_brand_id) REFERENCES public.car_brands(id) ON DELETE CASCADE;


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
-- Name: orders orders_payment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_payment_id_foreign FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE SET NULL;


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
    ADD CONSTRAINT part_categories_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.part_categories(id) ON DELETE CASCADE;


--
-- Name: part_category_part part_category_part_part_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_category_part
    ADD CONSTRAINT part_category_part_part_category_id_foreign FOREIGN KEY (part_category_id) REFERENCES public.part_categories(id) ON DELETE CASCADE;


--
-- Name: part_category_part part_category_part_spare_part_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_category_part
    ADD CONSTRAINT part_category_part_spare_part_id_foreign FOREIGN KEY (spare_part_id) REFERENCES public.spare_parts(id) ON DELETE CASCADE;


--
-- Name: part_scheme_items part_scheme_items_part_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_scheme_items
    ADD CONSTRAINT part_scheme_items_part_scheme_id_foreign FOREIGN KEY (part_scheme_id) REFERENCES public.part_schemes(id) ON DELETE CASCADE;


--
-- Name: part_scheme_items part_scheme_items_spare_part_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_scheme_items
    ADD CONSTRAINT part_scheme_items_spare_part_id_foreign FOREIGN KEY (spare_part_id) REFERENCES public.spare_parts(id) ON DELETE CASCADE;


--
-- Name: part_schemes part_schemes_car_model_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_schemes
    ADD CONSTRAINT part_schemes_car_model_id_foreign FOREIGN KEY (car_model_id) REFERENCES public.car_models(id) ON DELETE CASCADE;


--
-- Name: part_schemes part_schemes_part_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.part_schemes
    ADD CONSTRAINT part_schemes_part_category_id_foreign FOREIGN KEY (part_category_id) REFERENCES public.part_categories(id) ON DELETE CASCADE;


--
-- Name: payments payments_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: payments payments_payment_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_payment_method_id_foreign FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON DELETE CASCADE;


--
-- Name: payments payments_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


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
-- Name: spare_part_vehicle_style spare_part_vehicle_style_spare_part_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_part_vehicle_style
    ADD CONSTRAINT spare_part_vehicle_style_spare_part_id_foreign FOREIGN KEY (spare_part_id) REFERENCES public.spare_parts(id) ON DELETE CASCADE;


--
-- Name: spare_part_vehicle_style spare_part_vehicle_style_vehicle_style_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_part_vehicle_style
    ADD CONSTRAINT spare_part_vehicle_style_vehicle_style_id_foreign FOREIGN KEY (vehicle_style_id) REFERENCES public.vehicle_styles(id) ON DELETE CASCADE;


--
-- Name: user_suggestions user_suggestions_analog_spare_part_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_suggestions
    ADD CONSTRAINT user_suggestions_analog_spare_part_id_foreign FOREIGN KEY (analog_spare_part_id) REFERENCES public.spare_parts(id) ON DELETE CASCADE;


--
-- Name: user_suggestions user_suggestions_approved_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_suggestions
    ADD CONSTRAINT user_suggestions_approved_by_foreign FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_suggestions user_suggestions_car_model_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_suggestions
    ADD CONSTRAINT user_suggestions_car_model_id_foreign FOREIGN KEY (car_model_id) REFERENCES public.car_models(id) ON DELETE CASCADE;


--
-- Name: user_suggestions user_suggestions_spare_part_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_suggestions
    ADD CONSTRAINT user_suggestions_spare_part_id_foreign FOREIGN KEY (spare_part_id) REFERENCES public.spare_parts(id) ON DELETE CASCADE;


--
-- Name: user_suggestions user_suggestions_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_suggestions
    ADD CONSTRAINT user_suggestions_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vehicle_models vehicle_models_make_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_models
    ADD CONSTRAINT vehicle_models_make_id_foreign FOREIGN KEY (make_id) REFERENCES public.vehicle_makes(id) ON DELETE CASCADE;


--
-- Name: vehicle_styles vehicle_styles_model_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_styles
    ADD CONSTRAINT vehicle_styles_model_id_foreign FOREIGN KEY (model_id) REFERENCES public.vehicle_models(id) ON DELETE CASCADE;


--
-- Name: vin_requests vin_requests_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vin_requests
    ADD CONSTRAINT vin_requests_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vin_searches vin_searches_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vin_searches
    ADD CONSTRAINT vin_searches_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


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
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2024_03_27_000000_create_part_categories_table	1
5	2024_03_27_000001_create_filter_attributes_table	1
6	2024_03_27_000002_create_car_brands_and_models_tables	1
7	2024_03_27_000002_create_filter_values_table	1
8	2024_03_27_000003_create_filter_category_table	1
9	2024_03_27_000003_create_parts_table	1
10	2024_03_27_000004_add_part_categories_relations	1
11	2024_03_27_000005_create_vin_searches_table	1
12	2024_03_27_000007_create_part_schemes_table	1
13	2024_03_27_000009_add_foreign_keys	1
14	2024_03_27_000010_add_missing_fields_to_car_brands	1
15	2024_03_27_000011_add_missing_fields_to_car_models	1
16	2024_03_27_000012_create_spare_parts_table	1
17	2024_05_15_000000_import_spare_parts_from_csv	1
18	2024_05_17_000000_create_permanent_users_table	1
19	2024_05_19_000000_add_is_admin_and_markup_percent_to_users_table	1
20	2024_05_21_000000_add_year_fields_to_car_models_table	1
21	2024_05_21_000000_sync_permanent_users	1
22	2024_05_22_000000_import_cars_from_csv	1
23	2024_05_23_000000_set_popular_car_brands	1
24	2024_05_23_000002_set_car_brands_countries	1
25	2024_05_23_000003_set_popular_car_models	1
26	2025_03_24_182651_create_orders_table	1
27	2025_03_24_182738_create_order_items_table	1
28	2025_03_24_202639_add_has_vin_to_car_brands_table	1
29	2025_03_27_203245_add_car_brand_id_to_car_models	1
30	2025_03_27_222149_create_user_cars_table	1
31	2025_03_31_200300_add_is_popular_to_car_brands_table	1
32	2025_03_31_201613_create_vin_requests_table	1
33	2025_04_24_170029_create_carts_table	1
34	2025_04_24_170039_fix_cart_items_table	1
35	2025_04_24_170048_fix_orders_table	1
36	2025_04_24_170056_fix_order_items_table	1
37	2025_04_24_174949_add_index_to_part_number_column_on_spare_parts_table	1
38	2025_05_22_214350_add_is_popular_to_car_brands_table	1
39	2025_05_22_233833_add_fields_to_orders_table	2
40	2025_05_25_222543_update_order_items_part_id_nullable	3
41	2025_05_25_223110_fix_spare_part_id_in_order_items	4
42	2025_05_25_223602_make_total_field_nullable_in_orders_table	5
43	2025_05_25_224115_make_total_price_field_nullable_in_orders_table	6
44	2023_05_25_233129_add_part_id_to_cart_items_table	7
45	2025_05_25_233129_add_part_id_to_cart_items_table	7
46	2024_06_01_000000_rename_part_id_to_spare_part_id_in_order_items	8
47	2024_06_01_000001_drop_parts_table	9
48	2024_06_02_000000_fix_order_items_part_id_field	10
49	2024_06_02_000001_fix_cart_items_part_id_field	11
50	2024_06_02_000002_update_part_category_part_table	12
51	2024_06_02_000003_update_part_scheme_items_table	13
52	2024_06_02_000004_update_filter_values_table	13
53	2024_06_03_000001_create_cross_references_table	14
54	2024_06_03_000002_create_vehicle_tables	15
55	2025_05_26_030139_add_status_history_to_orders_table	16
56	2024_06_05_000000_create_payment_methods_table	17
57	2024_06_05_000001_create_payments_table	17
58	2025_05_27_000000_create_user_suggestions_table	18
59	2025_05_27_000001_create_spare_part_analogs_table	18
60	2025_05_27_000002_create_spare_part_compatibilities_table	18
61	2025_05_27_000003_add_role_to_users_table	18
62	2025_05_27_212803_add_index_to_manufacturer_on_spare_parts_table	19
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 62, true);


--
-- PostgreSQL database dump complete
--

