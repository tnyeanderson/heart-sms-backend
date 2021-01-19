# production stage
FROM iegomez/mosquitto-go-auth

# Copy configuration
COPY ./mosquitto /etc/mosquitto

# Copy entrypoint
COPY ./entrypoint.sh /root/entrypoint.sh
RUN chmod +x /root/entrypoint.sh

EXPOSE 8883 5050

ENTRYPOINT ["/root/entrypoint.sh"]
