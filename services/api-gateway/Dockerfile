FROM envoyproxy/envoy:v1.32-latest

COPY envoy.yaml /etc/envoy/envoy.yaml

EXPOSE 8080
EXPOSE 9901

CMD ["envoy", "-c", "/etc/envoy/envoy.yaml", "--service-cluster", "logify-api-gateway"]
