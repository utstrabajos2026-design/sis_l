#!/bin/sh
# wait-for-db.sh - Espera a que MySQL esté listo

host="$1"
port="${2:-3306}"
shift 2
cmd="$@"

until nc -z "$host" "$port"; do
  >&2 echo "MySQL no está listo en $host:$port - esperando..."
  sleep 1
done

>&2 echo "MySQL está listo - iniciando aplicación..."
exec $cmd
