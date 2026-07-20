#!/usr/bin/env bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE ROLE ketflix WITH LOGIN PASSWORD '$POSTGRES_PASSWORD';
	CREATE DATABASE ketflix;
	GRANT ALL PRIVILEGES ON DATABASE ketflix TO ketflix;
EOSQL
