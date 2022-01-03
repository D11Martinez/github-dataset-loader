# Descripción

Programa para descargar y filtrar eventos de Github alojados en GHArchive. Estos son almacenados por día en una carpeta especifica.
https://data.gharchive.org

## Pre-Requisitos

- Debe tener Instalado node 14
- Debe crear un archivo .env a partir del archivo .env.example segun se indica
- Haber generado un token de acceso de una cuenta de github. https://github.com/settings/tokens

## Instalación

`$ npm install`

## Ejecución

Primero debe configurar sus variables de entorno en el archivo .env

`$ npm run build`

`$ npm run start:prod`

Espere mientras los archivos son descargados.

## Limitantes

Debido a que es necesario extraer los datos de los commits de cada PullRequest alojado en GHArchive, la API de Github presenta la limitante de 5000 request por hora para usuarios con sesión iniciada, por tanto cada request se ejecuta cada 0.72 segundos.
Además, la descarga se hace ingresando especificamente los archivos separados por coma en las variables de entorno. Esto para reducir la cantidad de data a procesar por la solución de ingeniería de datos.

## Comentarios

Al ejecutar la descarga de datos de archivos especificos, se visualiza en la terminal cuanodo un commit no existe por alguna razón en la API de GitHub
