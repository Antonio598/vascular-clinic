# ══════════════════════════════════════════════════════════════
#  Vascular Clinic — sitio estático servido con nginx
#  EasyPanel detecta este Dockerfile en la raíz y lo usa para
#  construir la imagen. No hay nada que compilar: solo copiamos.
# ══════════════════════════════════════════════════════════════

FROM nginx:alpine

# Configuración propia (gzip, caché y cabeceras de seguridad)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cada COPY es su propia capa: tocar solo el CSS no reconstruye el resto
# (index.html, privacidad.html y terminos.html)
COPY *.html     /usr/share/nginx/html/
COPY robots.txt sitemap.xml /usr/share/nginx/html/
COPY css/       /usr/share/nginx/html/css/
COPY js/        /usr/share/nginx/html/js/
COPY assets/    /usr/share/nginx/html/assets/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
