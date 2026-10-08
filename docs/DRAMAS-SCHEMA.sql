-- Global Dramas Admin PostgreSQL 17 业务结构
-- 28张表与中文字段注释；依赖现有系统账号sys_users，不含任何业务数据。
-- 已运行项目无需导入，启动插件会自动迁移。

CREATE OR REPLACE FUNCTION public.gd_delete_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
 DECLARE present boolean; i integer;
 BEGIN
 IF TG_NARGS>0 THEN
 FOR i IN 0..TG_NARGS-1 BY 2 LOOP
 EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE %I = $1)',TG_ARGV[i],TG_ARGV[i+1]) INTO present USING OLD.id;
 IF present THEN RAISE EXCEPTION '记录仍被业务数据引用，不可删除' USING ERRCODE='23503'; END IF;
 END LOOP;
 END IF;
 RETURN OLD;
 END $function$
;
CREATE OR REPLACE FUNCTION public.gd_reference_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
 DECLARE n bigint; present boolean; i integer;
 BEGIN
 FOR i IN 0..TG_NARGS-1 BY 2 LOOP
 n := (to_jsonb(NEW)->>TG_ARGV[i])::bigint;
 IF n IS NOT NULL AND n <> 0 THEN
 EXECUTE format('SELECT true FROM public.%I WHERE id = $1 FOR KEY SHARE',TG_ARGV[i+1]) INTO present USING n;
 IF present IS DISTINCT FROM TRUE THEN RAISE EXCEPTION '关联记录不存在: %',TG_ARGV[i] USING ERRCODE='23503'; END IF;
 END IF;
 END LOOP;
 RETURN NEW;
 END $function$
;

--
-- PostgreSQL database dump
--

\restrict ekEv5h9aqpQ2iHcCiV6MLpnLdpHTCXuNCkEGMmnLfdMYV8ajbSmMQF2ZblrUrYk

-- Dumped from database version 17.11 (Debian 17.11-1.pgdg12+2)
-- Dumped by pg_dump version 17.11 (Debian 17.11-1.pgdg12+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: gd_ads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_ads (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    episode_id bigint DEFAULT 0 NOT NULL,
    network text,
    placement text,
    failure_category text,
    provider_reference text,
    completed_at timestamp with time zone
);


--
-- Name: TABLE gd_ads; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_ads IS '广告尝试';


--
-- Name: COLUMN gd_ads.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_ads.id IS '主键ID';


--
-- Name: COLUMN gd_ads.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_ads.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_ads.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_ads.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_ads.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_ads.status IS '业务状态';


--
-- Name: COLUMN gd_ads.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_ads.created_at IS '创建时间';


--
-- Name: COLUMN gd_ads.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_ads.updated_at IS '更新时间';


--
-- Name: COLUMN gd_ads.episode_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_ads.episode_id IS '目标单集ID';


--
-- Name: COLUMN gd_ads.network; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_ads.network IS '广告平台';


--
-- Name: COLUMN gd_ads.placement; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_ads.placement IS '广告位';


--
-- Name: COLUMN gd_ads.failure_category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_ads.failure_category IS '失败分类';


--
-- Name: COLUMN gd_ads.provider_reference; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_ads.provider_reference IS '验证回执';


--
-- Name: COLUMN gd_ads.completed_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_ads.completed_at IS '完成时间';


--
-- Name: gd_ads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_ads_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_ads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_ads_id_seq OWNED BY public.gd_ads.id;


--
-- Name: gd_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_alerts (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    category text,
    severity text,
    subject text,
    detail text,
    recovery_note text,
    resolved_at timestamp with time zone
);


--
-- Name: TABLE gd_alerts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_alerts IS '异常告警';


--
-- Name: COLUMN gd_alerts.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_alerts.id IS '主键ID';


--
-- Name: COLUMN gd_alerts.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_alerts.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_alerts.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_alerts.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_alerts.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_alerts.status IS '业务状态';


--
-- Name: COLUMN gd_alerts.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_alerts.created_at IS '创建时间';


--
-- Name: COLUMN gd_alerts.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_alerts.updated_at IS '更新时间';


--
-- Name: COLUMN gd_alerts.category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_alerts.category IS '异常类型';


--
-- Name: COLUMN gd_alerts.severity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_alerts.severity IS '严重程度';


--
-- Name: COLUMN gd_alerts.subject; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_alerts.subject IS '告警标题';


--
-- Name: COLUMN gd_alerts.detail; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_alerts.detail IS '告警内容';


--
-- Name: COLUMN gd_alerts.recovery_note; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_alerts.recovery_note IS '恢复说明';


--
-- Name: COLUMN gd_alerts.resolved_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_alerts.resolved_at IS '恢复时间';


--
-- Name: gd_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_alerts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_alerts_id_seq OWNED BY public.gd_alerts.id;


--
-- Name: gd_approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_approvals (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    resource text,
    target_id bigint DEFAULT 0 NOT NULL,
    action text,
    reason text,
    reviewer_id bigint DEFAULT 0 NOT NULL,
    decision_note text,
    evidence text
);


--
-- Name: TABLE gd_approvals; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_approvals IS '敏感操作审批';


--
-- Name: COLUMN gd_approvals.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_approvals.id IS '主键ID';


--
-- Name: COLUMN gd_approvals.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_approvals.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_approvals.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_approvals.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_approvals.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_approvals.status IS '业务状态';


--
-- Name: COLUMN gd_approvals.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_approvals.created_at IS '创建时间';


--
-- Name: COLUMN gd_approvals.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_approvals.updated_at IS '更新时间';


--
-- Name: COLUMN gd_approvals.resource; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_approvals.resource IS '操作资源';


--
-- Name: COLUMN gd_approvals.target_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_approvals.target_id IS '目标记录ID';


--
-- Name: COLUMN gd_approvals.action; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_approvals.action IS '审批操作';


--
-- Name: COLUMN gd_approvals.reason; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_approvals.reason IS '申请说明';


--
-- Name: COLUMN gd_approvals.reviewer_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_approvals.reviewer_id IS '审批人ID';


--
-- Name: COLUMN gd_approvals.decision_note; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_approvals.decision_note IS '审批意见';


--
-- Name: COLUMN gd_approvals.evidence; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_approvals.evidence IS '外部流水或凭据';


--
-- Name: gd_approvals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_approvals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_approvals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_approvals_id_seq OWNED BY public.gd_approvals.id;


--
-- Name: gd_audits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_audits (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    resource text,
    target_id bigint DEFAULT 0 NOT NULL,
    action text,
    detail text
);


--
-- Name: TABLE gd_audits; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_audits IS '操作审计';


--
-- Name: COLUMN gd_audits.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_audits.id IS '主键ID';


--
-- Name: COLUMN gd_audits.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_audits.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_audits.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_audits.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_audits.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_audits.status IS '业务状态';


--
-- Name: COLUMN gd_audits.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_audits.created_at IS '创建时间';


--
-- Name: COLUMN gd_audits.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_audits.updated_at IS '更新时间';


--
-- Name: COLUMN gd_audits.resource; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_audits.resource IS '操作资源';


--
-- Name: COLUMN gd_audits.target_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_audits.target_id IS '记录ID';


--
-- Name: COLUMN gd_audits.action; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_audits.action IS '操作名称';


--
-- Name: COLUMN gd_audits.detail; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_audits.detail IS '变更内容';


--
-- Name: gd_audits_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_audits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_audits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_audits_id_seq OWNED BY public.gd_audits.id;


--
-- Name: gd_bills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_bills (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    external_id text,
    platform text,
    drama_id bigint DEFAULT 0 NOT NULL,
    period text,
    currency text,
    gross_minor bigint DEFAULT 0 NOT NULL,
    fee_minor bigint DEFAULT 0 NOT NULL,
    net_minor bigint DEFAULT 0 NOT NULL,
    source text,
    difference_minor bigint DEFAULT 0 NOT NULL,
    resolution text
);


--
-- Name: TABLE gd_bills; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_bills IS '财务账单';


--
-- Name: COLUMN gd_bills.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_bills.id IS '主键ID';


--
-- Name: COLUMN gd_bills.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_bills.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_bills.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_bills.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_bills.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_bills.status IS '业务状态';


--
-- Name: COLUMN gd_bills.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_bills.created_at IS '创建时间';


--
-- Name: COLUMN gd_bills.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_bills.updated_at IS '更新时间';


--
-- Name: COLUMN gd_bills.external_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_bills.external_id IS '账单行编号';


--
-- Name: COLUMN gd_bills.platform; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_bills.platform IS '账单平台';


--
-- Name: COLUMN gd_bills.drama_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_bills.drama_id IS '剧集ID';


--
-- Name: COLUMN gd_bills.period; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_bills.period IS '账期';


--
-- Name: COLUMN gd_bills.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_bills.currency IS '币种';


--
-- Name: COLUMN gd_bills.gross_minor; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_bills.gross_minor IS '总收入（最小货币单位）';


--
-- Name: COLUMN gd_bills.fee_minor; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_bills.fee_minor IS '费用（最小货币单位）';


--
-- Name: COLUMN gd_bills.net_minor; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_bills.net_minor IS '净收入（最小货币单位）';


--
-- Name: COLUMN gd_bills.source; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_bills.source IS '获取来源';


--
-- Name: COLUMN gd_bills.difference_minor; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_bills.difference_minor IS '差异金额（最小货币单位）';


--
-- Name: COLUMN gd_bills.resolution; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_bills.resolution IS '差异处理说明';


--
-- Name: gd_bills_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_bills_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_bills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_bills_id_seq OWNED BY public.gd_bills.id;


--
-- Name: gd_compensations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_compensations (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    target_user_id bigint DEFAULT 0 NOT NULL,
    episode_id bigint DEFAULT 0 NOT NULL,
    ad_id bigint DEFAULT 0 NOT NULL,
    reason text
);


--
-- Name: TABLE gd_compensations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_compensations IS '客服补偿';


--
-- Name: COLUMN gd_compensations.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_compensations.id IS '主键ID';


--
-- Name: COLUMN gd_compensations.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_compensations.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_compensations.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_compensations.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_compensations.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_compensations.status IS '业务状态';


--
-- Name: COLUMN gd_compensations.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_compensations.created_at IS '创建时间';


--
-- Name: COLUMN gd_compensations.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_compensations.updated_at IS '更新时间';


--
-- Name: COLUMN gd_compensations.target_user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_compensations.target_user_id IS '补偿用户ID';


--
-- Name: COLUMN gd_compensations.episode_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_compensations.episode_id IS '补偿单集ID';


--
-- Name: COLUMN gd_compensations.ad_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_compensations.ad_id IS '关联广告尝试ID';


--
-- Name: COLUMN gd_compensations.reason; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_compensations.reason IS '补偿原因';


--
-- Name: gd_compensations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_compensations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_compensations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_compensations_id_seq OWNED BY public.gd_compensations.id;


--
-- Name: gd_dramas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_dramas (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    title text,
    synopsis text,
    cover_url text,
    genre text,
    language text,
    region text,
    total_episodes bigint DEFAULT 0 NOT NULL,
    organization_id bigint DEFAULT 0 NOT NULL,
    license_start timestamp with time zone,
    license_end timestamp with time zone,
    copyright_proof text,
    review_note text
);


--
-- Name: TABLE gd_dramas; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_dramas IS '剧集';


--
-- Name: COLUMN gd_dramas.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_dramas.id IS '主键ID';


--
-- Name: COLUMN gd_dramas.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_dramas.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_dramas.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_dramas.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_dramas.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_dramas.status IS '业务状态';


--
-- Name: COLUMN gd_dramas.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_dramas.created_at IS '创建时间';


--
-- Name: COLUMN gd_dramas.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_dramas.updated_at IS '更新时间';


--
-- Name: COLUMN gd_dramas.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_dramas.title IS '剧名';


--
-- Name: COLUMN gd_dramas.synopsis; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_dramas.synopsis IS '剧情简介';


--
-- Name: COLUMN gd_dramas.cover_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_dramas.cover_url IS '封面地址';


--
-- Name: COLUMN gd_dramas.genre; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_dramas.genre IS '题材';


--
-- Name: COLUMN gd_dramas.language; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_dramas.language IS '语言';


--
-- Name: COLUMN gd_dramas.region; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_dramas.region IS '地区';


--
-- Name: COLUMN gd_dramas.total_episodes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_dramas.total_episodes IS '计划集数';


--
-- Name: COLUMN gd_dramas.organization_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_dramas.organization_id IS '机构ID';


--
-- Name: COLUMN gd_dramas.license_start; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_dramas.license_start IS '授权开始';


--
-- Name: COLUMN gd_dramas.license_end; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_dramas.license_end IS '授权截止';


--
-- Name: COLUMN gd_dramas.copyright_proof; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_dramas.copyright_proof IS '版权证明地址';


--
-- Name: COLUMN gd_dramas.review_note; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_dramas.review_note IS '审核反馈';


--
-- Name: gd_dramas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_dramas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_dramas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_dramas_id_seq OWNED BY public.gd_dramas.id;


--
-- Name: gd_entitlements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_entitlements (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    episode_id bigint DEFAULT 0 NOT NULL,
    source text,
    reference text,
    expires_at timestamp with time zone
);


--
-- Name: TABLE gd_entitlements; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_entitlements IS '单集权益';


--
-- Name: COLUMN gd_entitlements.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_entitlements.id IS '主键ID';


--
-- Name: COLUMN gd_entitlements.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_entitlements.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_entitlements.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_entitlements.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_entitlements.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_entitlements.status IS '业务状态';


--
-- Name: COLUMN gd_entitlements.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_entitlements.created_at IS '创建时间';


--
-- Name: COLUMN gd_entitlements.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_entitlements.updated_at IS '更新时间';


--
-- Name: COLUMN gd_entitlements.episode_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_entitlements.episode_id IS '单集ID';


--
-- Name: COLUMN gd_entitlements.source; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_entitlements.source IS '权益来源';


--
-- Name: COLUMN gd_entitlements.reference; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_entitlements.reference IS '来源记录ID';


--
-- Name: COLUMN gd_entitlements.expires_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_entitlements.expires_at IS '到期时间';


--
-- Name: gd_entitlements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_entitlements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_entitlements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_entitlements_id_seq OWNED BY public.gd_entitlements.id;


--
-- Name: gd_episodes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_episodes (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    drama_id bigint DEFAULT 0 NOT NULL,
    number bigint DEFAULT 0 NOT NULL,
    title text,
    video_url text,
    duration_seconds bigint DEFAULT 0 NOT NULL,
    price_minor bigint DEFAULT 0 NOT NULL,
    currency text,
    processing_progress bigint DEFAULT 0 NOT NULL,
    processing_error text
);


--
-- Name: TABLE gd_episodes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_episodes IS '单集';


--
-- Name: COLUMN gd_episodes.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_episodes.id IS '主键ID';


--
-- Name: COLUMN gd_episodes.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_episodes.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_episodes.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_episodes.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_episodes.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_episodes.status IS '业务状态';


--
-- Name: COLUMN gd_episodes.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_episodes.created_at IS '创建时间';


--
-- Name: COLUMN gd_episodes.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_episodes.updated_at IS '更新时间';


--
-- Name: COLUMN gd_episodes.drama_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_episodes.drama_id IS '剧集ID';


--
-- Name: COLUMN gd_episodes.number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_episodes.number IS '集数';


--
-- Name: COLUMN gd_episodes.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_episodes.title IS '单集名称';


--
-- Name: COLUMN gd_episodes.video_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_episodes.video_url IS '视频地址';


--
-- Name: COLUMN gd_episodes.duration_seconds; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_episodes.duration_seconds IS '时长（秒）';


--
-- Name: COLUMN gd_episodes.price_minor; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_episodes.price_minor IS '单集价格（最小货币单位）';


--
-- Name: COLUMN gd_episodes.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_episodes.currency IS '币种';


--
-- Name: COLUMN gd_episodes.processing_progress; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_episodes.processing_progress IS '处理进度（%）';


--
-- Name: COLUMN gd_episodes.processing_error; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_episodes.processing_error IS '处理反馈';


--
-- Name: gd_episodes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_episodes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_episodes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_episodes_id_seq OWNED BY public.gd_episodes.id;


--
-- Name: gd_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_events (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    drama_id bigint DEFAULT 0 NOT NULL,
    episode_id bigint DEFAULT 0 NOT NULL,
    event text,
    source text,
    session_id text,
    startup_ms bigint DEFAULT 0 NOT NULL,
    buffer_ms bigint DEFAULT 0 NOT NULL,
    error_code text
);


--
-- Name: TABLE gd_events; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_events IS '行为与播放质量';


--
-- Name: COLUMN gd_events.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_events.id IS '主键ID';


--
-- Name: COLUMN gd_events.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_events.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_events.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_events.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_events.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_events.status IS '业务状态';


--
-- Name: COLUMN gd_events.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_events.created_at IS '创建时间';


--
-- Name: COLUMN gd_events.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_events.updated_at IS '更新时间';


--
-- Name: COLUMN gd_events.drama_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_events.drama_id IS '剧集ID';


--
-- Name: COLUMN gd_events.episode_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_events.episode_id IS '单集ID';


--
-- Name: COLUMN gd_events.event; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_events.event IS '事件类型';


--
-- Name: COLUMN gd_events.source; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_events.source IS '流量来源';


--
-- Name: COLUMN gd_events.session_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_events.session_id IS '播放会话';


--
-- Name: COLUMN gd_events.startup_ms; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_events.startup_ms IS '首帧时间（毫秒）';


--
-- Name: COLUMN gd_events.buffer_ms; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_events.buffer_ms IS '卡顿时间（毫秒）';


--
-- Name: COLUMN gd_events.error_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_events.error_code IS '播放错误码';


--
-- Name: gd_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_events_id_seq OWNED BY public.gd_events.id;


--
-- Name: gd_favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_favorites (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    drama_id bigint DEFAULT 0 NOT NULL
);


--
-- Name: TABLE gd_favorites; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_favorites IS '我的收藏';


--
-- Name: COLUMN gd_favorites.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_favorites.id IS '主键ID';


--
-- Name: COLUMN gd_favorites.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_favorites.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_favorites.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_favorites.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_favorites.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_favorites.status IS '业务状态';


--
-- Name: COLUMN gd_favorites.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_favorites.created_at IS '创建时间';


--
-- Name: COLUMN gd_favorites.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_favorites.updated_at IS '更新时间';


--
-- Name: COLUMN gd_favorites.drama_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_favorites.drama_id IS '剧集ID';


--
-- Name: gd_favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_favorites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_favorites_id_seq OWNED BY public.gd_favorites.id;


--
-- Name: gd_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_feedback (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    category text,
    subject text,
    message text,
    order_id bigint DEFAULT 0 NOT NULL,
    reply text
);


--
-- Name: TABLE gd_feedback; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_feedback IS '用户反馈';


--
-- Name: COLUMN gd_feedback.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_feedback.id IS '主键ID';


--
-- Name: COLUMN gd_feedback.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_feedback.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_feedback.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_feedback.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_feedback.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_feedback.status IS '业务状态';


--
-- Name: COLUMN gd_feedback.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_feedback.created_at IS '创建时间';


--
-- Name: COLUMN gd_feedback.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_feedback.updated_at IS '更新时间';


--
-- Name: COLUMN gd_feedback.category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_feedback.category IS '反馈类型';


--
-- Name: COLUMN gd_feedback.subject; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_feedback.subject IS '反馈主题';


--
-- Name: COLUMN gd_feedback.message; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_feedback.message IS '反馈内容';


--
-- Name: COLUMN gd_feedback.order_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_feedback.order_id IS '关联订单ID';


--
-- Name: COLUMN gd_feedback.reply; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_feedback.reply IS '客服回复';


--
-- Name: gd_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_feedback_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_feedback_id_seq OWNED BY public.gd_feedback.id;


--
-- Name: gd_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_history (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    episode_id bigint DEFAULT 0 NOT NULL,
    position_seconds bigint DEFAULT 0 NOT NULL,
    watched_seconds bigint DEFAULT 0 NOT NULL,
    source text
);


--
-- Name: TABLE gd_history; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_history IS '观看历史';


--
-- Name: COLUMN gd_history.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_history.id IS '主键ID';


--
-- Name: COLUMN gd_history.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_history.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_history.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_history.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_history.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_history.status IS '业务状态';


--
-- Name: COLUMN gd_history.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_history.created_at IS '创建时间';


--
-- Name: COLUMN gd_history.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_history.updated_at IS '更新时间';


--
-- Name: COLUMN gd_history.episode_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_history.episode_id IS '单集ID';


--
-- Name: COLUMN gd_history.position_seconds; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_history.position_seconds IS '播放位置（秒）';


--
-- Name: COLUMN gd_history.watched_seconds; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_history.watched_seconds IS '累计观看（秒）';


--
-- Name: COLUMN gd_history.source; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_history.source IS '流量来源';


--
-- Name: gd_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_history_id_seq OWNED BY public.gd_history.id;


--
-- Name: gd_licenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_licenses (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    drama_id bigint DEFAULT 0 NOT NULL,
    licensor text,
    territories text,
    starts_at timestamp with time zone,
    expires_at timestamp with time zone,
    document_url text,
    remind_days bigint DEFAULT 0 NOT NULL
);


--
-- Name: TABLE gd_licenses; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_licenses IS '授权合同';


--
-- Name: COLUMN gd_licenses.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_licenses.id IS '主键ID';


--
-- Name: COLUMN gd_licenses.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_licenses.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_licenses.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_licenses.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_licenses.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_licenses.status IS '业务状态';


--
-- Name: COLUMN gd_licenses.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_licenses.created_at IS '创建时间';


--
-- Name: COLUMN gd_licenses.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_licenses.updated_at IS '更新时间';


--
-- Name: COLUMN gd_licenses.drama_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_licenses.drama_id IS '剧集ID';


--
-- Name: COLUMN gd_licenses.licensor; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_licenses.licensor IS '授权方';


--
-- Name: COLUMN gd_licenses.territories; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_licenses.territories IS '授权地区';


--
-- Name: COLUMN gd_licenses.starts_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_licenses.starts_at IS '起始时间';


--
-- Name: COLUMN gd_licenses.expires_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_licenses.expires_at IS '到期时间';


--
-- Name: COLUMN gd_licenses.document_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_licenses.document_url IS '合同地址';


--
-- Name: COLUMN gd_licenses.remind_days; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_licenses.remind_days IS '提前提醒天数';


--
-- Name: gd_licenses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_licenses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_licenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_licenses_id_seq OWNED BY public.gd_licenses.id;


--
-- Name: gd_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_orders (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    kind text,
    episode_id bigint DEFAULT 0 NOT NULL,
    plan_id bigint DEFAULT 0 NOT NULL,
    currency text,
    amount_minor bigint DEFAULT 0 NOT NULL,
    provider text,
    provider_reference text,
    fulfillment text,
    issue_id bigint DEFAULT 0 NOT NULL
);


--
-- Name: TABLE gd_orders; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_orders IS '订单';


--
-- Name: COLUMN gd_orders.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_orders.id IS '主键ID';


--
-- Name: COLUMN gd_orders.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_orders.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_orders.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_orders.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_orders.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_orders.status IS '业务状态';


--
-- Name: COLUMN gd_orders.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_orders.created_at IS '创建时间';


--
-- Name: COLUMN gd_orders.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_orders.updated_at IS '更新时间';


--
-- Name: COLUMN gd_orders.kind; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_orders.kind IS '订单类型';


--
-- Name: COLUMN gd_orders.episode_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_orders.episode_id IS '单集ID';


--
-- Name: COLUMN gd_orders.plan_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_orders.plan_id IS '套餐ID';


--
-- Name: COLUMN gd_orders.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_orders.currency IS '币种';


--
-- Name: COLUMN gd_orders.amount_minor; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_orders.amount_minor IS '订单金额（最小货币单位）';


--
-- Name: COLUMN gd_orders.provider; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_orders.provider IS '支付平台';


--
-- Name: COLUMN gd_orders.provider_reference; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_orders.provider_reference IS '支付流水';


--
-- Name: COLUMN gd_orders.fulfillment; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_orders.fulfillment IS '履约状态';


--
-- Name: COLUMN gd_orders.issue_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_orders.issue_id IS '问题反馈ID';


--
-- Name: gd_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_orders_id_seq OWNED BY public.gd_orders.id;


--
-- Name: gd_organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_organizations (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    account_id bigint DEFAULT 0 NOT NULL,
    name text,
    kind text,
    contact text,
    email text,
    registration_number text,
    proof_url text
);


--
-- Name: TABLE gd_organizations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_organizations IS '版权方与制片机构';


--
-- Name: COLUMN gd_organizations.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_organizations.id IS '主键ID';


--
-- Name: COLUMN gd_organizations.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_organizations.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_organizations.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_organizations.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_organizations.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_organizations.status IS '业务状态';


--
-- Name: COLUMN gd_organizations.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_organizations.created_at IS '创建时间';


--
-- Name: COLUMN gd_organizations.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_organizations.updated_at IS '更新时间';


--
-- Name: COLUMN gd_organizations.account_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_organizations.account_id IS '所属制片方账号ID';


--
-- Name: COLUMN gd_organizations.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_organizations.name IS '机构名称';


--
-- Name: COLUMN gd_organizations.kind; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_organizations.kind IS '机构类型';


--
-- Name: COLUMN gd_organizations.contact; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_organizations.contact IS '联系人';


--
-- Name: COLUMN gd_organizations.email; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_organizations.email IS '联系邮箱';


--
-- Name: COLUMN gd_organizations.registration_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_organizations.registration_number IS '登记编号';


--
-- Name: COLUMN gd_organizations.proof_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_organizations.proof_url IS '资质地址';


--
-- Name: gd_organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_organizations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_organizations_id_seq OWNED BY public.gd_organizations.id;


--
-- Name: gd_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_plans (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name text,
    platform text,
    platform_product_id text,
    benefits text,
    price_minor bigint DEFAULT 0 NOT NULL,
    currency text,
    duration_days bigint DEFAULT 0 NOT NULL
);


--
-- Name: TABLE gd_plans; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_plans IS '会员套餐';


--
-- Name: COLUMN gd_plans.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_plans.id IS '主键ID';


--
-- Name: COLUMN gd_plans.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_plans.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_plans.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_plans.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_plans.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_plans.status IS '业务状态';


--
-- Name: COLUMN gd_plans.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_plans.created_at IS '创建时间';


--
-- Name: COLUMN gd_plans.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_plans.updated_at IS '更新时间';


--
-- Name: COLUMN gd_plans.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_plans.name IS '套餐名称';


--
-- Name: COLUMN gd_plans.platform; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_plans.platform IS '平台';


--
-- Name: COLUMN gd_plans.platform_product_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_plans.platform_product_id IS '平台商品ID';


--
-- Name: COLUMN gd_plans.benefits; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_plans.benefits IS '权益说明';


--
-- Name: COLUMN gd_plans.price_minor; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_plans.price_minor IS '价格（最小货币单位）';


--
-- Name: COLUMN gd_plans.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_plans.currency IS '币种';


--
-- Name: COLUMN gd_plans.duration_days; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_plans.duration_days IS '有效天数';


--
-- Name: gd_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_plans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_plans_id_seq OWNED BY public.gd_plans.id;


--
-- Name: gd_policies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_policies (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name text,
    drama_id bigint DEFAULT 0 NOT NULL,
    free_episodes bigint DEFAULT 0 NOT NULL,
    ads_enabled boolean DEFAULT false NOT NULL,
    member_free boolean DEFAULT false NOT NULL,
    effective_at timestamp with time zone,
    expires_at timestamp with time zone
);


--
-- Name: TABLE gd_policies; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_policies IS '访问策略';


--
-- Name: COLUMN gd_policies.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_policies.id IS '主键ID';


--
-- Name: COLUMN gd_policies.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_policies.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_policies.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_policies.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_policies.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_policies.status IS '业务状态';


--
-- Name: COLUMN gd_policies.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_policies.created_at IS '创建时间';


--
-- Name: COLUMN gd_policies.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_policies.updated_at IS '更新时间';


--
-- Name: COLUMN gd_policies.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_policies.name IS '策略名称';


--
-- Name: COLUMN gd_policies.drama_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_policies.drama_id IS '覆盖剧集ID（0为全局）';


--
-- Name: COLUMN gd_policies.free_episodes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_policies.free_episodes IS '免费集数（-1全部免费）';


--
-- Name: COLUMN gd_policies.ads_enabled; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_policies.ads_enabled IS '广告开关';


--
-- Name: COLUMN gd_policies.member_free; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_policies.member_free IS '会员覆盖';


--
-- Name: COLUMN gd_policies.effective_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_policies.effective_at IS '生效时间';


--
-- Name: COLUMN gd_policies.expires_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_policies.expires_at IS '失效时间';


--
-- Name: gd_policies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_policies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_policies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_policies_id_seq OWNED BY public.gd_policies.id;


--
-- Name: gd_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_profiles (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    account_id bigint DEFAULT 0 NOT NULL,
    organization_id bigint DEFAULT 0 NOT NULL,
    source text,
    notes text
);


--
-- Name: TABLE gd_profiles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_profiles IS '用户业务档案';


--
-- Name: COLUMN gd_profiles.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_profiles.id IS '主键ID';


--
-- Name: COLUMN gd_profiles.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_profiles.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_profiles.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_profiles.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_profiles.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_profiles.status IS '业务状态';


--
-- Name: COLUMN gd_profiles.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_profiles.created_at IS '创建时间';


--
-- Name: COLUMN gd_profiles.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_profiles.updated_at IS '更新时间';


--
-- Name: COLUMN gd_profiles.account_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_profiles.account_id IS '系统账号ID';


--
-- Name: COLUMN gd_profiles.organization_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_profiles.organization_id IS '机构ID';


--
-- Name: COLUMN gd_profiles.source; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_profiles.source IS '注册来源';


--
-- Name: COLUMN gd_profiles.notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_profiles.notes IS '备注';


--
-- Name: gd_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_profiles_id_seq OWNED BY public.gd_profiles.id;


--
-- Name: gd_recoveries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_recoveries (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    order_id bigint DEFAULT 0 NOT NULL,
    provider_reference text,
    result text,
    evidence_url text
);


--
-- Name: TABLE gd_recoveries; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_recoveries IS '查询与恢复记录';


--
-- Name: COLUMN gd_recoveries.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_recoveries.id IS '主键ID';


--
-- Name: COLUMN gd_recoveries.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_recoveries.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_recoveries.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_recoveries.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_recoveries.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_recoveries.status IS '业务状态';


--
-- Name: COLUMN gd_recoveries.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_recoveries.created_at IS '创建时间';


--
-- Name: COLUMN gd_recoveries.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_recoveries.updated_at IS '更新时间';


--
-- Name: COLUMN gd_recoveries.order_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_recoveries.order_id IS '订单ID';


--
-- Name: COLUMN gd_recoveries.provider_reference; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_recoveries.provider_reference IS '平台查询编号';


--
-- Name: COLUMN gd_recoveries.result; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_recoveries.result IS '查询或恢复结果';


--
-- Name: COLUMN gd_recoveries.evidence_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_recoveries.evidence_url IS '凭据地址';


--
-- Name: gd_recoveries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_recoveries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_recoveries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_recoveries_id_seq OWNED BY public.gd_recoveries.id;


--
-- Name: gd_refunds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_refunds (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    order_id bigint DEFAULT 0 NOT NULL,
    reason text,
    amount_minor bigint DEFAULT 0 NOT NULL,
    provider_reference text
);


--
-- Name: TABLE gd_refunds; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_refunds IS '退款请求';


--
-- Name: COLUMN gd_refunds.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_refunds.id IS '主键ID';


--
-- Name: COLUMN gd_refunds.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_refunds.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_refunds.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_refunds.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_refunds.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_refunds.status IS '业务状态';


--
-- Name: COLUMN gd_refunds.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_refunds.created_at IS '创建时间';


--
-- Name: COLUMN gd_refunds.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_refunds.updated_at IS '更新时间';


--
-- Name: COLUMN gd_refunds.order_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_refunds.order_id IS '订单ID';


--
-- Name: COLUMN gd_refunds.reason; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_refunds.reason IS '退款原因';


--
-- Name: COLUMN gd_refunds.amount_minor; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_refunds.amount_minor IS '退款金额（最小货币单位）';


--
-- Name: COLUMN gd_refunds.provider_reference; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_refunds.provider_reference IS '平台退款流水';


--
-- Name: gd_refunds_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_refunds_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_refunds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_refunds_id_seq OWNED BY public.gd_refunds.id;


--
-- Name: gd_restores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_restores (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    alert_id bigint DEFAULT 0 NOT NULL,
    operation text,
    result text,
    evidence text
);


--
-- Name: TABLE gd_restores; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_restores IS '异常恢复记录';


--
-- Name: COLUMN gd_restores.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_restores.id IS '主键ID';


--
-- Name: COLUMN gd_restores.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_restores.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_restores.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_restores.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_restores.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_restores.status IS '业务状态';


--
-- Name: COLUMN gd_restores.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_restores.created_at IS '创建时间';


--
-- Name: COLUMN gd_restores.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_restores.updated_at IS '更新时间';


--
-- Name: COLUMN gd_restores.alert_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_restores.alert_id IS '告警ID';


--
-- Name: COLUMN gd_restores.operation; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_restores.operation IS '恢复操作';


--
-- Name: COLUMN gd_restores.result; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_restores.result IS '恢复结果';


--
-- Name: COLUMN gd_restores.evidence; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_restores.evidence IS '恢复凭据';


--
-- Name: gd_restores_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_restores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_restores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_restores_id_seq OWNED BY public.gd_restores.id;


--
-- Name: gd_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_reviews (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    drama_id bigint DEFAULT 0 NOT NULL,
    decision text,
    note text,
    reviewer_id bigint DEFAULT 0 NOT NULL
);


--
-- Name: TABLE gd_reviews; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_reviews IS '审核记录';


--
-- Name: COLUMN gd_reviews.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_reviews.id IS '主键ID';


--
-- Name: COLUMN gd_reviews.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_reviews.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_reviews.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_reviews.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_reviews.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_reviews.status IS '业务状态';


--
-- Name: COLUMN gd_reviews.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_reviews.created_at IS '创建时间';


--
-- Name: COLUMN gd_reviews.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_reviews.updated_at IS '更新时间';


--
-- Name: COLUMN gd_reviews.drama_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_reviews.drama_id IS '剧集ID';


--
-- Name: COLUMN gd_reviews.decision; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_reviews.decision IS '审核结论';


--
-- Name: COLUMN gd_reviews.note; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_reviews.note IS '审核反馈';


--
-- Name: COLUMN gd_reviews.reviewer_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_reviews.reviewer_id IS '审核人ID';


--
-- Name: gd_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_reviews_id_seq OWNED BY public.gd_reviews.id;


--
-- Name: gd_settlements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_settlements (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    organization_id bigint DEFAULT 0 NOT NULL,
    period text,
    currency text,
    amount_minor bigint DEFAULT 0 NOT NULL,
    bank_reference text,
    received_at timestamp with time zone,
    note text
);


--
-- Name: TABLE gd_settlements; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_settlements IS '结算记录';


--
-- Name: COLUMN gd_settlements.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_settlements.id IS '主键ID';


--
-- Name: COLUMN gd_settlements.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_settlements.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_settlements.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_settlements.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_settlements.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_settlements.status IS '业务状态';


--
-- Name: COLUMN gd_settlements.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_settlements.created_at IS '创建时间';


--
-- Name: COLUMN gd_settlements.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_settlements.updated_at IS '更新时间';


--
-- Name: COLUMN gd_settlements.organization_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_settlements.organization_id IS '机构ID';


--
-- Name: COLUMN gd_settlements.period; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_settlements.period IS '结算账期';


--
-- Name: COLUMN gd_settlements.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_settlements.currency IS '币种';


--
-- Name: COLUMN gd_settlements.amount_minor; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_settlements.amount_minor IS '结算金额（最小货币单位）';


--
-- Name: COLUMN gd_settlements.bank_reference; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_settlements.bank_reference IS '到账流水';


--
-- Name: COLUMN gd_settlements.received_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_settlements.received_at IS '到账时间';


--
-- Name: COLUMN gd_settlements.note; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_settlements.note IS '结算说明';


--
-- Name: gd_settlements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_settlements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_settlements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_settlements_id_seq OWNED BY public.gd_settlements.id;


--
-- Name: gd_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_subscriptions (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    plan_id bigint DEFAULT 0 NOT NULL,
    platform text,
    provider_subscription_id text,
    starts_at timestamp with time zone,
    expires_at timestamp with time zone,
    sync_result text
);


--
-- Name: TABLE gd_subscriptions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_subscriptions IS '会员订阅';


--
-- Name: COLUMN gd_subscriptions.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_subscriptions.id IS '主键ID';


--
-- Name: COLUMN gd_subscriptions.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_subscriptions.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_subscriptions.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_subscriptions.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_subscriptions.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_subscriptions.status IS '业务状态';


--
-- Name: COLUMN gd_subscriptions.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_subscriptions.created_at IS '创建时间';


--
-- Name: COLUMN gd_subscriptions.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_subscriptions.updated_at IS '更新时间';


--
-- Name: COLUMN gd_subscriptions.plan_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_subscriptions.plan_id IS '套餐ID';


--
-- Name: COLUMN gd_subscriptions.platform; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_subscriptions.platform IS '会员来源';


--
-- Name: COLUMN gd_subscriptions.provider_subscription_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_subscriptions.provider_subscription_id IS '平台订阅号';


--
-- Name: COLUMN gd_subscriptions.starts_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_subscriptions.starts_at IS '开始时间';


--
-- Name: COLUMN gd_subscriptions.expires_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_subscriptions.expires_at IS '到期时间';


--
-- Name: COLUMN gd_subscriptions.sync_result; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_subscriptions.sync_result IS '同步结果';


--
-- Name: gd_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_subscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_subscriptions_id_seq OWNED BY public.gd_subscriptions.id;


--
-- Name: gd_syncs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_syncs (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    subscription_id bigint DEFAULT 0 NOT NULL,
    platform text,
    provider_reference text,
    result text,
    checked_at timestamp with time zone
);


--
-- Name: TABLE gd_syncs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_syncs IS '平台同步记录';


--
-- Name: COLUMN gd_syncs.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_syncs.id IS '主键ID';


--
-- Name: COLUMN gd_syncs.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_syncs.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_syncs.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_syncs.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_syncs.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_syncs.status IS '业务状态';


--
-- Name: COLUMN gd_syncs.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_syncs.created_at IS '创建时间';


--
-- Name: COLUMN gd_syncs.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_syncs.updated_at IS '更新时间';


--
-- Name: COLUMN gd_syncs.subscription_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_syncs.subscription_id IS '订阅ID';


--
-- Name: COLUMN gd_syncs.platform; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_syncs.platform IS '平台';


--
-- Name: COLUMN gd_syncs.provider_reference; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_syncs.provider_reference IS '平台查询编号';


--
-- Name: COLUMN gd_syncs.result; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_syncs.result IS '同步结果';


--
-- Name: COLUMN gd_syncs.checked_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_syncs.checked_at IS '同步时间';


--
-- Name: gd_syncs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_syncs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_syncs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_syncs_id_seq OWNED BY public.gd_syncs.id;


--
-- Name: gd_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_versions (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    drama_id bigint DEFAULT 0 NOT NULL,
    version text,
    change_note text,
    snapshot text
);


--
-- Name: TABLE gd_versions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_versions IS '内容版本';


--
-- Name: COLUMN gd_versions.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_versions.id IS '主键ID';


--
-- Name: COLUMN gd_versions.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_versions.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_versions.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_versions.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_versions.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_versions.status IS '业务状态';


--
-- Name: COLUMN gd_versions.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_versions.created_at IS '创建时间';


--
-- Name: COLUMN gd_versions.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_versions.updated_at IS '更新时间';


--
-- Name: COLUMN gd_versions.drama_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_versions.drama_id IS '剧集ID';


--
-- Name: COLUMN gd_versions.version; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_versions.version IS '版本号';


--
-- Name: COLUMN gd_versions.change_note; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_versions.change_note IS '变更说明';


--
-- Name: COLUMN gd_versions.snapshot; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_versions.snapshot IS '内容快照（JSON）';


--
-- Name: gd_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_versions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_versions_id_seq OWNED BY public.gd_versions.id;


--
-- Name: gd_wallet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gd_wallet (
    id bigint NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    user_id bigint DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    amount_minor bigint DEFAULT 0 NOT NULL,
    currency text,
    direction text,
    reference text,
    description text
);


--
-- Name: TABLE gd_wallet; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.gd_wallet IS '钱包流水';


--
-- Name: COLUMN gd_wallet.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_wallet.id IS '主键ID';


--
-- Name: COLUMN gd_wallet.owner_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_wallet.owner_id IS '内容所属账号ID';


--
-- Name: COLUMN gd_wallet.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_wallet.user_id IS '业务所属用户ID';


--
-- Name: COLUMN gd_wallet.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_wallet.status IS '业务状态';


--
-- Name: COLUMN gd_wallet.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_wallet.created_at IS '创建时间';


--
-- Name: COLUMN gd_wallet.updated_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_wallet.updated_at IS '更新时间';


--
-- Name: COLUMN gd_wallet.amount_minor; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_wallet.amount_minor IS '金额（最小货币单位）';


--
-- Name: COLUMN gd_wallet.currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_wallet.currency IS '币种';


--
-- Name: COLUMN gd_wallet.direction; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_wallet.direction IS '收支方向';


--
-- Name: COLUMN gd_wallet.reference; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_wallet.reference IS '关联编号';


--
-- Name: COLUMN gd_wallet.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gd_wallet.description IS '说明';


--
-- Name: gd_wallet_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gd_wallet_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gd_wallet_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gd_wallet_id_seq OWNED BY public.gd_wallet.id;


--
-- Name: gd_ads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_ads ALTER COLUMN id SET DEFAULT nextval('public.gd_ads_id_seq'::regclass);


--
-- Name: gd_alerts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_alerts ALTER COLUMN id SET DEFAULT nextval('public.gd_alerts_id_seq'::regclass);


--
-- Name: gd_approvals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_approvals ALTER COLUMN id SET DEFAULT nextval('public.gd_approvals_id_seq'::regclass);


--
-- Name: gd_audits id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_audits ALTER COLUMN id SET DEFAULT nextval('public.gd_audits_id_seq'::regclass);


--
-- Name: gd_bills id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_bills ALTER COLUMN id SET DEFAULT nextval('public.gd_bills_id_seq'::regclass);


--
-- Name: gd_compensations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_compensations ALTER COLUMN id SET DEFAULT nextval('public.gd_compensations_id_seq'::regclass);


--
-- Name: gd_dramas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_dramas ALTER COLUMN id SET DEFAULT nextval('public.gd_dramas_id_seq'::regclass);


--
-- Name: gd_entitlements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_entitlements ALTER COLUMN id SET DEFAULT nextval('public.gd_entitlements_id_seq'::regclass);


--
-- Name: gd_episodes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_episodes ALTER COLUMN id SET DEFAULT nextval('public.gd_episodes_id_seq'::regclass);


--
-- Name: gd_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_events ALTER COLUMN id SET DEFAULT nextval('public.gd_events_id_seq'::regclass);


--
-- Name: gd_favorites id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_favorites ALTER COLUMN id SET DEFAULT nextval('public.gd_favorites_id_seq'::regclass);


--
-- Name: gd_feedback id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_feedback ALTER COLUMN id SET DEFAULT nextval('public.gd_feedback_id_seq'::regclass);


--
-- Name: gd_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_history ALTER COLUMN id SET DEFAULT nextval('public.gd_history_id_seq'::regclass);


--
-- Name: gd_licenses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_licenses ALTER COLUMN id SET DEFAULT nextval('public.gd_licenses_id_seq'::regclass);


--
-- Name: gd_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_orders ALTER COLUMN id SET DEFAULT nextval('public.gd_orders_id_seq'::regclass);


--
-- Name: gd_organizations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_organizations ALTER COLUMN id SET DEFAULT nextval('public.gd_organizations_id_seq'::regclass);


--
-- Name: gd_plans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_plans ALTER COLUMN id SET DEFAULT nextval('public.gd_plans_id_seq'::regclass);


--
-- Name: gd_policies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_policies ALTER COLUMN id SET DEFAULT nextval('public.gd_policies_id_seq'::regclass);


--
-- Name: gd_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_profiles ALTER COLUMN id SET DEFAULT nextval('public.gd_profiles_id_seq'::regclass);


--
-- Name: gd_recoveries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_recoveries ALTER COLUMN id SET DEFAULT nextval('public.gd_recoveries_id_seq'::regclass);


--
-- Name: gd_refunds id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_refunds ALTER COLUMN id SET DEFAULT nextval('public.gd_refunds_id_seq'::regclass);


--
-- Name: gd_restores id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_restores ALTER COLUMN id SET DEFAULT nextval('public.gd_restores_id_seq'::regclass);


--
-- Name: gd_reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_reviews ALTER COLUMN id SET DEFAULT nextval('public.gd_reviews_id_seq'::regclass);


--
-- Name: gd_settlements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_settlements ALTER COLUMN id SET DEFAULT nextval('public.gd_settlements_id_seq'::regclass);


--
-- Name: gd_subscriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.gd_subscriptions_id_seq'::regclass);


--
-- Name: gd_syncs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_syncs ALTER COLUMN id SET DEFAULT nextval('public.gd_syncs_id_seq'::regclass);


--
-- Name: gd_versions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_versions ALTER COLUMN id SET DEFAULT nextval('public.gd_versions_id_seq'::regclass);


--
-- Name: gd_wallet id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_wallet ALTER COLUMN id SET DEFAULT nextval('public.gd_wallet_id_seq'::regclass);


--
-- Name: gd_ads gd_ads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_ads
    ADD CONSTRAINT gd_ads_pkey PRIMARY KEY (id);


--
-- Name: gd_alerts gd_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_alerts
    ADD CONSTRAINT gd_alerts_pkey PRIMARY KEY (id);


--
-- Name: gd_approvals gd_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_approvals
    ADD CONSTRAINT gd_approvals_pkey PRIMARY KEY (id);


--
-- Name: gd_audits gd_audits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_audits
    ADD CONSTRAINT gd_audits_pkey PRIMARY KEY (id);


--
-- Name: gd_bills gd_bills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_bills
    ADD CONSTRAINT gd_bills_pkey PRIMARY KEY (id);


--
-- Name: gd_compensations gd_compensations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_compensations
    ADD CONSTRAINT gd_compensations_pkey PRIMARY KEY (id);


--
-- Name: gd_dramas gd_dramas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_dramas
    ADD CONSTRAINT gd_dramas_pkey PRIMARY KEY (id);


--
-- Name: gd_entitlements gd_entitlements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_entitlements
    ADD CONSTRAINT gd_entitlements_pkey PRIMARY KEY (id);


--
-- Name: gd_episodes gd_episodes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_episodes
    ADD CONSTRAINT gd_episodes_pkey PRIMARY KEY (id);


--
-- Name: gd_events gd_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_events
    ADD CONSTRAINT gd_events_pkey PRIMARY KEY (id);


--
-- Name: gd_favorites gd_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_favorites
    ADD CONSTRAINT gd_favorites_pkey PRIMARY KEY (id);


--
-- Name: gd_feedback gd_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_feedback
    ADD CONSTRAINT gd_feedback_pkey PRIMARY KEY (id);


--
-- Name: gd_history gd_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_history
    ADD CONSTRAINT gd_history_pkey PRIMARY KEY (id);


--
-- Name: gd_licenses gd_licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_licenses
    ADD CONSTRAINT gd_licenses_pkey PRIMARY KEY (id);


--
-- Name: gd_orders gd_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_orders
    ADD CONSTRAINT gd_orders_pkey PRIMARY KEY (id);


--
-- Name: gd_organizations gd_organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_organizations
    ADD CONSTRAINT gd_organizations_pkey PRIMARY KEY (id);


--
-- Name: gd_plans gd_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_plans
    ADD CONSTRAINT gd_plans_pkey PRIMARY KEY (id);


--
-- Name: gd_policies gd_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_policies
    ADD CONSTRAINT gd_policies_pkey PRIMARY KEY (id);


--
-- Name: gd_profiles gd_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_profiles
    ADD CONSTRAINT gd_profiles_pkey PRIMARY KEY (id);


--
-- Name: gd_recoveries gd_recoveries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_recoveries
    ADD CONSTRAINT gd_recoveries_pkey PRIMARY KEY (id);


--
-- Name: gd_refunds gd_refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_refunds
    ADD CONSTRAINT gd_refunds_pkey PRIMARY KEY (id);


--
-- Name: gd_restores gd_restores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_restores
    ADD CONSTRAINT gd_restores_pkey PRIMARY KEY (id);


--
-- Name: gd_reviews gd_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_reviews
    ADD CONSTRAINT gd_reviews_pkey PRIMARY KEY (id);


--
-- Name: gd_settlements gd_settlements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_settlements
    ADD CONSTRAINT gd_settlements_pkey PRIMARY KEY (id);


--
-- Name: gd_subscriptions gd_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_subscriptions
    ADD CONSTRAINT gd_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: gd_syncs gd_syncs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_syncs
    ADD CONSTRAINT gd_syncs_pkey PRIMARY KEY (id);


--
-- Name: gd_versions gd_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_versions
    ADD CONSTRAINT gd_versions_pkey PRIMARY KEY (id);


--
-- Name: gd_wallet gd_wallet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gd_wallet
    ADD CONSTRAINT gd_wallet_pkey PRIMARY KEY (id);


--
-- Name: gd_bill_platform_external; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX gd_bill_platform_external ON public.gd_bills USING btree (platform, external_id);


--
-- Name: gd_entitlement_reference; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX gd_entitlement_reference ON public.gd_entitlements USING btree (user_id, episode_id, source, reference);


--
-- Name: gd_episode_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX gd_episode_number ON public.gd_episodes USING btree (drama_id, number);


--
-- Name: gd_favorite_user_drama; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX gd_favorite_user_drama ON public.gd_favorites USING btree (user_id, drama_id);


--
-- Name: gd_history_user_episode; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX gd_history_user_episode ON public.gd_history USING btree (user_id, episode_id);


--
-- Name: gd_payment_reference; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX gd_payment_reference ON public.gd_orders USING btree (provider, provider_reference) WHERE (provider_reference <> ''::text);


--
-- Name: gd_pending_approval; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX gd_pending_approval ON public.gd_approvals USING btree (resource, target_id) WHERE ((status)::text = 'pending'::text);


--
-- Name: gd_plan_product; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX gd_plan_product ON public.gd_plans USING btree (platform, platform_product_id);


--
-- Name: gd_profile_account; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX gd_profile_account ON public.gd_profiles USING btree (account_id);


--
-- Name: gd_refund_order; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX gd_refund_order ON public.gd_refunds USING btree (order_id) WHERE ((status)::text <> 'rejected'::text);


--
-- Name: idx_gd_ads_episode_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_ads_episode_id ON public.gd_ads USING btree (episode_id);


--
-- Name: idx_gd_ads_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_ads_owner_id ON public.gd_ads USING btree (owner_id);


--
-- Name: idx_gd_ads_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_ads_status ON public.gd_ads USING btree (status);


--
-- Name: idx_gd_ads_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_ads_user_id ON public.gd_ads USING btree (user_id);


--
-- Name: idx_gd_alerts_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_alerts_owner_id ON public.gd_alerts USING btree (owner_id);


--
-- Name: idx_gd_alerts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_alerts_status ON public.gd_alerts USING btree (status);


--
-- Name: idx_gd_alerts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_alerts_user_id ON public.gd_alerts USING btree (user_id);


--
-- Name: idx_gd_approvals_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_approvals_owner_id ON public.gd_approvals USING btree (owner_id);


--
-- Name: idx_gd_approvals_reviewer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_approvals_reviewer_id ON public.gd_approvals USING btree (reviewer_id);


--
-- Name: idx_gd_approvals_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_approvals_status ON public.gd_approvals USING btree (status);


--
-- Name: idx_gd_approvals_target_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_approvals_target_id ON public.gd_approvals USING btree (target_id);


--
-- Name: idx_gd_approvals_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_approvals_user_id ON public.gd_approvals USING btree (user_id);


--
-- Name: idx_gd_audits_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_audits_owner_id ON public.gd_audits USING btree (owner_id);


--
-- Name: idx_gd_audits_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_audits_status ON public.gd_audits USING btree (status);


--
-- Name: idx_gd_audits_target_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_audits_target_id ON public.gd_audits USING btree (target_id);


--
-- Name: idx_gd_audits_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_audits_user_id ON public.gd_audits USING btree (user_id);


--
-- Name: idx_gd_bills_drama_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_bills_drama_id ON public.gd_bills USING btree (drama_id);


--
-- Name: idx_gd_bills_external_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_bills_external_id ON public.gd_bills USING btree (external_id);


--
-- Name: idx_gd_bills_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_bills_owner_id ON public.gd_bills USING btree (owner_id);


--
-- Name: idx_gd_bills_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_bills_status ON public.gd_bills USING btree (status);


--
-- Name: idx_gd_bills_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_bills_user_id ON public.gd_bills USING btree (user_id);


--
-- Name: idx_gd_compensations_ad_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_compensations_ad_id ON public.gd_compensations USING btree (ad_id);


--
-- Name: idx_gd_compensations_episode_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_compensations_episode_id ON public.gd_compensations USING btree (episode_id);


--
-- Name: idx_gd_compensations_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_compensations_owner_id ON public.gd_compensations USING btree (owner_id);


--
-- Name: idx_gd_compensations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_compensations_status ON public.gd_compensations USING btree (status);


--
-- Name: idx_gd_compensations_target_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_compensations_target_user_id ON public.gd_compensations USING btree (target_user_id);


--
-- Name: idx_gd_compensations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_compensations_user_id ON public.gd_compensations USING btree (user_id);


--
-- Name: idx_gd_dramas_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_dramas_organization_id ON public.gd_dramas USING btree (organization_id);


--
-- Name: idx_gd_dramas_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_dramas_owner_id ON public.gd_dramas USING btree (owner_id);


--
-- Name: idx_gd_dramas_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_dramas_status ON public.gd_dramas USING btree (status);


--
-- Name: idx_gd_dramas_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_dramas_user_id ON public.gd_dramas USING btree (user_id);


--
-- Name: idx_gd_entitlements_episode_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_entitlements_episode_id ON public.gd_entitlements USING btree (episode_id);


--
-- Name: idx_gd_entitlements_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_entitlements_owner_id ON public.gd_entitlements USING btree (owner_id);


--
-- Name: idx_gd_entitlements_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_entitlements_status ON public.gd_entitlements USING btree (status);


--
-- Name: idx_gd_entitlements_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_entitlements_user_id ON public.gd_entitlements USING btree (user_id);


--
-- Name: idx_gd_episodes_drama_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_episodes_drama_id ON public.gd_episodes USING btree (drama_id);


--
-- Name: idx_gd_episodes_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_episodes_owner_id ON public.gd_episodes USING btree (owner_id);


--
-- Name: idx_gd_episodes_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_episodes_status ON public.gd_episodes USING btree (status);


--
-- Name: idx_gd_episodes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_episodes_user_id ON public.gd_episodes USING btree (user_id);


--
-- Name: idx_gd_events_drama_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_events_drama_id ON public.gd_events USING btree (drama_id);


--
-- Name: idx_gd_events_episode_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_events_episode_id ON public.gd_events USING btree (episode_id);


--
-- Name: idx_gd_events_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_events_owner_id ON public.gd_events USING btree (owner_id);


--
-- Name: idx_gd_events_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_events_session_id ON public.gd_events USING btree (session_id);


--
-- Name: idx_gd_events_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_events_status ON public.gd_events USING btree (status);


--
-- Name: idx_gd_events_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_events_user_id ON public.gd_events USING btree (user_id);


--
-- Name: idx_gd_favorites_drama_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_favorites_drama_id ON public.gd_favorites USING btree (drama_id);


--
-- Name: idx_gd_favorites_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_favorites_owner_id ON public.gd_favorites USING btree (owner_id);


--
-- Name: idx_gd_favorites_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_favorites_status ON public.gd_favorites USING btree (status);


--
-- Name: idx_gd_favorites_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_favorites_user_id ON public.gd_favorites USING btree (user_id);


--
-- Name: idx_gd_feedback_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_feedback_order_id ON public.gd_feedback USING btree (order_id);


--
-- Name: idx_gd_feedback_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_feedback_owner_id ON public.gd_feedback USING btree (owner_id);


--
-- Name: idx_gd_feedback_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_feedback_status ON public.gd_feedback USING btree (status);


--
-- Name: idx_gd_feedback_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_feedback_user_id ON public.gd_feedback USING btree (user_id);


--
-- Name: idx_gd_history_episode_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_history_episode_id ON public.gd_history USING btree (episode_id);


--
-- Name: idx_gd_history_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_history_owner_id ON public.gd_history USING btree (owner_id);


--
-- Name: idx_gd_history_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_history_status ON public.gd_history USING btree (status);


--
-- Name: idx_gd_history_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_history_user_id ON public.gd_history USING btree (user_id);


--
-- Name: idx_gd_licenses_drama_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_licenses_drama_id ON public.gd_licenses USING btree (drama_id);


--
-- Name: idx_gd_licenses_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_licenses_owner_id ON public.gd_licenses USING btree (owner_id);


--
-- Name: idx_gd_licenses_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_licenses_status ON public.gd_licenses USING btree (status);


--
-- Name: idx_gd_licenses_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_licenses_user_id ON public.gd_licenses USING btree (user_id);


--
-- Name: idx_gd_orders_episode_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_orders_episode_id ON public.gd_orders USING btree (episode_id);


--
-- Name: idx_gd_orders_issue_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_orders_issue_id ON public.gd_orders USING btree (issue_id);


--
-- Name: idx_gd_orders_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_orders_owner_id ON public.gd_orders USING btree (owner_id);


--
-- Name: idx_gd_orders_plan_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_orders_plan_id ON public.gd_orders USING btree (plan_id);


--
-- Name: idx_gd_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_orders_status ON public.gd_orders USING btree (status);


--
-- Name: idx_gd_orders_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_orders_user_id ON public.gd_orders USING btree (user_id);


--
-- Name: idx_gd_organizations_account_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_organizations_account_id ON public.gd_organizations USING btree (account_id);


--
-- Name: idx_gd_organizations_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_organizations_owner_id ON public.gd_organizations USING btree (owner_id);


--
-- Name: idx_gd_organizations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_organizations_status ON public.gd_organizations USING btree (status);


--
-- Name: idx_gd_organizations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_organizations_user_id ON public.gd_organizations USING btree (user_id);


--
-- Name: idx_gd_plans_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_plans_owner_id ON public.gd_plans USING btree (owner_id);


--
-- Name: idx_gd_plans_platform_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_plans_platform_product_id ON public.gd_plans USING btree (platform_product_id);


--
-- Name: idx_gd_plans_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_plans_status ON public.gd_plans USING btree (status);


--
-- Name: idx_gd_plans_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_plans_user_id ON public.gd_plans USING btree (user_id);


--
-- Name: idx_gd_policies_drama_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_policies_drama_id ON public.gd_policies USING btree (drama_id);


--
-- Name: idx_gd_policies_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_policies_owner_id ON public.gd_policies USING btree (owner_id);


--
-- Name: idx_gd_policies_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_policies_status ON public.gd_policies USING btree (status);


--
-- Name: idx_gd_policies_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_policies_user_id ON public.gd_policies USING btree (user_id);


--
-- Name: idx_gd_profiles_account_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_profiles_account_id ON public.gd_profiles USING btree (account_id);


--
-- Name: idx_gd_profiles_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_profiles_organization_id ON public.gd_profiles USING btree (organization_id);


--
-- Name: idx_gd_profiles_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_profiles_owner_id ON public.gd_profiles USING btree (owner_id);


--
-- Name: idx_gd_profiles_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_profiles_status ON public.gd_profiles USING btree (status);


--
-- Name: idx_gd_profiles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_profiles_user_id ON public.gd_profiles USING btree (user_id);


--
-- Name: idx_gd_recoveries_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_recoveries_order_id ON public.gd_recoveries USING btree (order_id);


--
-- Name: idx_gd_recoveries_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_recoveries_owner_id ON public.gd_recoveries USING btree (owner_id);


--
-- Name: idx_gd_recoveries_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_recoveries_status ON public.gd_recoveries USING btree (status);


--
-- Name: idx_gd_recoveries_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_recoveries_user_id ON public.gd_recoveries USING btree (user_id);


--
-- Name: idx_gd_refunds_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_refunds_order_id ON public.gd_refunds USING btree (order_id);


--
-- Name: idx_gd_refunds_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_refunds_owner_id ON public.gd_refunds USING btree (owner_id);


--
-- Name: idx_gd_refunds_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_refunds_status ON public.gd_refunds USING btree (status);


--
-- Name: idx_gd_refunds_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_refunds_user_id ON public.gd_refunds USING btree (user_id);


--
-- Name: idx_gd_restores_alert_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_restores_alert_id ON public.gd_restores USING btree (alert_id);


--
-- Name: idx_gd_restores_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_restores_owner_id ON public.gd_restores USING btree (owner_id);


--
-- Name: idx_gd_restores_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_restores_status ON public.gd_restores USING btree (status);


--
-- Name: idx_gd_restores_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_restores_user_id ON public.gd_restores USING btree (user_id);


--
-- Name: idx_gd_reviews_drama_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_reviews_drama_id ON public.gd_reviews USING btree (drama_id);


--
-- Name: idx_gd_reviews_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_reviews_owner_id ON public.gd_reviews USING btree (owner_id);


--
-- Name: idx_gd_reviews_reviewer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_reviews_reviewer_id ON public.gd_reviews USING btree (reviewer_id);


--
-- Name: idx_gd_reviews_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_reviews_status ON public.gd_reviews USING btree (status);


--
-- Name: idx_gd_reviews_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_reviews_user_id ON public.gd_reviews USING btree (user_id);


--
-- Name: idx_gd_settlements_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_settlements_organization_id ON public.gd_settlements USING btree (organization_id);


--
-- Name: idx_gd_settlements_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_settlements_owner_id ON public.gd_settlements USING btree (owner_id);


--
-- Name: idx_gd_settlements_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_settlements_status ON public.gd_settlements USING btree (status);


--
-- Name: idx_gd_settlements_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_settlements_user_id ON public.gd_settlements USING btree (user_id);


--
-- Name: idx_gd_subscriptions_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_subscriptions_owner_id ON public.gd_subscriptions USING btree (owner_id);


--
-- Name: idx_gd_subscriptions_plan_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_subscriptions_plan_id ON public.gd_subscriptions USING btree (plan_id);


--
-- Name: idx_gd_subscriptions_provider_subscription_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_subscriptions_provider_subscription_id ON public.gd_subscriptions USING btree (provider_subscription_id);


--
-- Name: idx_gd_subscriptions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_subscriptions_status ON public.gd_subscriptions USING btree (status);


--
-- Name: idx_gd_subscriptions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_subscriptions_user_id ON public.gd_subscriptions USING btree (user_id);


--
-- Name: idx_gd_syncs_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_syncs_owner_id ON public.gd_syncs USING btree (owner_id);


--
-- Name: idx_gd_syncs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_syncs_status ON public.gd_syncs USING btree (status);


--
-- Name: idx_gd_syncs_subscription_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_syncs_subscription_id ON public.gd_syncs USING btree (subscription_id);


--
-- Name: idx_gd_syncs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_syncs_user_id ON public.gd_syncs USING btree (user_id);


--
-- Name: idx_gd_versions_drama_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_versions_drama_id ON public.gd_versions USING btree (drama_id);


--
-- Name: idx_gd_versions_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_versions_owner_id ON public.gd_versions USING btree (owner_id);


--
-- Name: idx_gd_versions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_versions_status ON public.gd_versions USING btree (status);


--
-- Name: idx_gd_versions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_versions_user_id ON public.gd_versions USING btree (user_id);


--
-- Name: idx_gd_wallet_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_wallet_owner_id ON public.gd_wallet USING btree (owner_id);


--
-- Name: idx_gd_wallet_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_wallet_status ON public.gd_wallet USING btree (status);


--
-- Name: idx_gd_wallet_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gd_wallet_user_id ON public.gd_wallet USING btree (user_id);


--
-- Name: gd_ads gd_referenced_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER gd_referenced_delete BEFORE DELETE ON public.gd_ads FOR EACH ROW EXECUTE FUNCTION public.gd_delete_guard('gd_compensations', 'ad_id');


--
-- Name: gd_alerts gd_referenced_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER gd_referenced_delete BEFORE DELETE ON public.gd_alerts FOR EACH ROW EXECUTE FUNCTION public.gd_delete_guard('gd_restores', 'alert_id');


--
-- Name: gd_dramas gd_referenced_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER gd_referenced_delete BEFORE DELETE ON public.gd_dramas FOR EACH ROW EXECUTE FUNCTION public.gd_delete_guard('gd_reviews', 'drama_id', 'gd_licenses', 'drama_id', 'gd_policies', 'drama_id', 'gd_versions', 'drama_id', 'gd_favorites', 'drama_id', 'gd_bills', 'drama_id', 'gd_episodes', 'drama_id');


--
-- Name: gd_episodes gd_referenced_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER gd_referenced_delete BEFORE DELETE ON public.gd_episodes FOR EACH ROW EXECUTE FUNCTION public.gd_delete_guard('gd_orders', 'episode_id', 'gd_entitlements', 'episode_id', 'gd_compensations', 'episode_id', 'gd_ads', 'episode_id', 'gd_history', 'episode_id');


--
-- Name: gd_feedback gd_referenced_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER gd_referenced_delete BEFORE DELETE ON public.gd_feedback FOR EACH ROW EXECUTE FUNCTION public.gd_delete_guard('gd_orders', 'issue_id');


--
-- Name: gd_orders gd_referenced_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER gd_referenced_delete BEFORE DELETE ON public.gd_orders FOR EACH ROW EXECUTE FUNCTION public.gd_delete_guard('gd_refunds', 'order_id', 'gd_feedback', 'order_id', 'gd_recoveries', 'order_id');


--
-- Name: gd_organizations gd_referenced_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER gd_referenced_delete BEFORE DELETE ON public.gd_organizations FOR EACH ROW EXECUTE FUNCTION public.gd_delete_guard('gd_profiles', 'organization_id', 'gd_dramas', 'organization_id', 'gd_settlements', 'organization_id');


--
-- Name: gd_plans gd_referenced_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER gd_referenced_delete BEFORE DELETE ON public.gd_plans FOR EACH ROW EXECUTE FUNCTION public.gd_delete_guard('gd_orders', 'plan_id', 'gd_subscriptions', 'plan_id');


--
-- Name: gd_subscriptions gd_referenced_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER gd_referenced_delete BEFORE DELETE ON public.gd_subscriptions FOR EACH ROW EXECUTE FUNCTION public.gd_delete_guard('gd_syncs', 'subscription_id');


--
-- Name: gd_ads gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_ads DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'episode_id', 'gd_episodes');


--
-- Name: gd_alerts gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_alerts DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users');


--
-- Name: gd_approvals gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_approvals DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'reviewer_id', 'sys_users');


--
-- Name: gd_audits gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_audits DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users');


--
-- Name: gd_bills gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_bills DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'drama_id', 'gd_dramas');


--
-- Name: gd_compensations gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_compensations DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'target_user_id', 'sys_users', 'episode_id', 'gd_episodes', 'ad_id', 'gd_ads');


--
-- Name: gd_dramas gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_dramas DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'organization_id', 'gd_organizations');


--
-- Name: gd_entitlements gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_entitlements DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'episode_id', 'gd_episodes');


--
-- Name: gd_episodes gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_episodes DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'drama_id', 'gd_dramas');


--
-- Name: gd_events gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_events DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users');


--
-- Name: gd_favorites gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_favorites DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'drama_id', 'gd_dramas');


--
-- Name: gd_feedback gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_feedback DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'order_id', 'gd_orders');


--
-- Name: gd_history gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_history DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'episode_id', 'gd_episodes');


--
-- Name: gd_licenses gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_licenses DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'drama_id', 'gd_dramas');


--
-- Name: gd_orders gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_orders DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'episode_id', 'gd_episodes', 'plan_id', 'gd_plans', 'issue_id', 'gd_feedback');


--
-- Name: gd_organizations gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_organizations DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'account_id', 'sys_users');


--
-- Name: gd_plans gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_plans DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users');


--
-- Name: gd_policies gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_policies DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'drama_id', 'gd_dramas');


--
-- Name: gd_profiles gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_profiles DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'account_id', 'sys_users', 'organization_id', 'gd_organizations');


--
-- Name: gd_recoveries gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_recoveries DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'order_id', 'gd_orders');


--
-- Name: gd_refunds gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_refunds DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'order_id', 'gd_orders');


--
-- Name: gd_restores gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_restores DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'alert_id', 'gd_alerts');


--
-- Name: gd_reviews gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_reviews DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'drama_id', 'gd_dramas', 'reviewer_id', 'sys_users');


--
-- Name: gd_settlements gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_settlements DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'organization_id', 'gd_organizations');


--
-- Name: gd_subscriptions gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_subscriptions DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'plan_id', 'gd_plans');


--
-- Name: gd_syncs gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_syncs DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'subscription_id', 'gd_subscriptions');


--
-- Name: gd_versions gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_versions DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users', 'drama_id', 'gd_dramas');


--
-- Name: gd_wallet gd_references; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER gd_references AFTER INSERT OR UPDATE ON public.gd_wallet DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.gd_reference_guard('owner_id', 'sys_users', 'user_id', 'sys_users');


--
-- PostgreSQL database dump complete
--

\unrestrict ekEv5h9aqpQ2iHcCiV6MLpnLdpHTCXuNCkEGMmnLfdMYV8ajbSmMQF2ZblrUrYk

