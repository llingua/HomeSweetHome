#!/usr/bin/with-contenv bashio

LOG_LEVEL=$(bashio::config 'log_level' 'info')

export HASS_PORT=$(bashio::core.port)
export EXPOSED_PORT=$(bashio::addon.port "8092/tcp")
export LOG_LEVEL="${LOG_LEVEL}"
export NEXT_ASSET_PREFIX="${HASSIO_INGRESS_URL:-}"

bashio::log.info "🏡 HomeSweetHome Dashboard starting..."
bashio::log.info "Port: 8092"
bashio::log.info "Data prefix: homesweethome"
bashio::log.info "Log Level: ${LOG_LEVEL}"

node server.js
