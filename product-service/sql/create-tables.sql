create extension if not exists "uuid-ossp";

create table if not exists products (
	id uuid primary key default uuid_generate_v4(),
	title varchar not null,
	description varchar,
	price integer
);

create table if not exists stocks (
	product_id uuid not null,
	count integer not null,
	foreign key ("product_id") references "products" ("id")
);
