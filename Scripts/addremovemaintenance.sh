#!/bin/bash
# IMPORTANTE: Es necesario tener jq instalado, si el el script no funionara

API_URL="https://vnk09715.live.dynatrace.com/api/v2"
API_TOKEN="${DT_API_TOKEN}"
TAG="disableProblems"
LOGFILE="dynatrace_tag_Maintenance.log"

log_msg() {
  local level="$1"
  local msg="$2"
  local timestamp
  timestamp=$(date +"%Y-%m-%d %H:%M:%S,%3N")
  echo "$timestamp [$level] $msg" | tee -a "$LOGFILE"
}

buscar_hosts_por_prefix() {
  local prefix="$1"
  curl -skX GET "$API_URL/entities?entitySelector=type(\"HOST\"),entityName.startsWith(\"$prefix\")" \
    -H "Authorization: Api-Token $API_TOKEN" \
    -H "accept: application/json"
}

add_tag_to_host() {
  local entity_id="$1"
  local host_name="$2"
  local payload="{\"tags\":[{\"key\":\"$TAG\"}]}"
  local response http_body http_code
  response=$(curl -skX POST "$API_URL/tags?entitySelector=entityId(\"$entity_id\")" \
    -H "Authorization: Api-Token $API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    -w "%{http_code}")
  http_code="${response: -3}"
  http_body="${response:0:${#response}-3}"
  if [ "$http_code" -eq 204 ] || [ "$http_code" -eq 200 ]; then
    log_msg "INFO" "Etiqueta '$TAG' annadida a '$host_name' (ID: $entity_id). respuesta HTTP: $http_code. Respuesta: $http_body"
  else
    log_msg "ERROR" "Fallo al annadir etiqueta a '$host_name' (ID: $entity_id). respuesta HTTP: $http_code. Respuesta: $http_body"
  fi
}

remove_tag_from_host() {
  local entity_id="$1"
  local host_name="$2"
  local response http_body http_code
  response=$(curl -skX DELETE "$API_URL/tags?entitySelector=entityId(\"$entity_id\")&key=$TAG" \
    -H "Authorization: Api-Token $API_TOKEN" \
    -w "%{http_code}")
  http_code="${response: -3}"
  http_body="${response:0:${#response}-3}"
  if [ "$http_code" -eq 204 ] || [ "$http_code" -eq 200 ]; then
    log_msg "INFO" "Etiqueta '$TAG' eliminada de '$host_name' (ID: $entity_id). respuesta HTTP: $http_code. Respuesta: $http_body"
  else
    log_msg "ERROR" "Fallo al eliminar etiqueta de '$host_name' (ID: $entity_id). respuesta HTTP: $http_code. Respuesta: $http_body"
  fi
}


procesar_prefix() {
  local prefix="$1"
  local action="$2"
  prefix=$(echo "$prefix" | xargs)

  local entity_response
  entity_response=$(buscar_hosts_por_prefix "$prefix")

  if [ -z "$entity_response" ]; then
    log_msg "ERROR" "La API no devolvió ninguna respuesta para prefix '$prefix'."
    return
  fi

  if echo "$entity_response" | grep -q "error"; then
    log_msg "ERROR" "La API devolvió un error para prefix '$prefix': $entity_response"
    return
  fi

  if ! echo "$entity_response" | jq . &>/dev/null; then
    log_msg "ERROR" "Respuesta inválida al buscar hosts con prefix '$prefix'. Respuesta: $entity_response"
    return
  fi

  local host_count
  host_count=$(echo "$entity_response" | jq '.entities | length')
  if ! [[ "$host_count" =~ ^[0-9]+$ ]]; then
    log_msg "ERROR" "No se pudo determinar la cantidad de hosts para prefix '$prefix'. Respuesta: $entity_response"
    return
  fi

  if [ "$host_count" -eq 0 ]; then
    log_msg "WARN" "Ningun host encontrado con prefix '$prefix'"
    return
  fi

  for i in $(seq 0 $((host_count-1))); do
    local entity_id
    local host_name
    entity_id=$(echo "$entity_response" | jq -r ".entities[$i].entityId")
    host_name=$(echo "$entity_response" | jq -r ".entities[$i].displayName")
    if [ "$action" == "add" ]; then
      add_tag_to_host "$entity_id" "$host_name"
    elif [ "$action" == "remove" ]; then
      remove_tag_from_host "$entity_id" "$host_name"
    else
      log_msg "ERROR" "No reconocida: $action"
      exit 2
    fi
  done
}

main() {
  if [ "$#" -ne 2 ]; then
    echo "Uso: $0 <fichero_prefix_host> <add|remove>"
    exit 1
  fi
  local file="$1"
  local action="$2"
  log_msg "INFO" "**************Inicio de proceso**************"
  while IFS= read -r prefix; do
    prefix=$(echo "$prefix" | tr -d '\r\n' | xargs)
    [ -z "$prefix" ] && continue
    procesar_prefix "$prefix" "$action"
  done < "$file"
  log_msg "INFO" "###############Fin de proceso###############"
}

main "$@"

