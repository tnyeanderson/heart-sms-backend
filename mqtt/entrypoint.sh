#!/bin/sh

# If we are in dev, don't use SSL
if [ "$DEV_NO_SSL" = "true" ]; then
    mv /etc/mosquitto/conf.d/ssl.conf /etc/mosquitto/conf.d/ssl.conf.bak
else
    mv /etc/mosquitto/conf.d/ssl.conf.bak /etc/mosquitto/conf.d/ssl.conf
fi

# Default values
AUTH_HOST='heart-sms-backend'
AUTH_PORT=5000
AUTH_TLS=false

if [ -n "$HEART_API_URL" ]; then
    AUTH_HOST="$(echo $HEART_API_URL | cut -d: -f1)"

    # Port may or may not be included
    MAYBE_PORT="$(echo $HEART_API_URL | cut -d: -f2)"
    AUTH_PORT="${MAYBE_PORT:-AUTH_PORT}"
fi

if [ "$HEART_USE_SSL" = 'true' ]; then
    AUTH_PORT=443
    AUTH_TLS='true'
fi

# This generates the current configuration as a JS file at <web>/config/web-config.js
cat << EOF > "/etc/mosquitto/conf.d/go-auth.conf"
auth_plugin /mosquitto/go-auth.so

#auth_opt_log_level debug
auth_opt_backends http
auth_opt_check_prefix false

# IP is the docker host
auth_opt_http_host $AUTH_HOST
auth_opt_http_port $AUTH_PORT
auth_opt_http_with_tls $AUTH_TLS
auth_opt_http_getuser_uri /api/v1/mqtt/login
auth_opt_http_aclcheck_uri /api/v1/mqtt/acl
auth_opt_http_response_mode json

# Cache
auth_opt_cache true
auth_opt_cache_reset true
auth_opt_auth_cache_seconds 60
auth_opt_acl_cache_seconds 60

EOF


# From https://github.com/iegomez/mosquitto-go-auth/blob/master/Dockerfile
/usr/sbin/mosquitto -c /etc/mosquitto/mosquitto.conf