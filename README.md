# Descripción

Programa para descargar y filtrar eventos de Github alojados en GHArchive. Estos son almacenados por día en una carpeta especifica.
https://data.gharchive.org

## Pre-Requisitos

- Debe tener Instalado node 14
- Debe crear un archivo .env a partir del archivo .env.example segun se indica

## Instalación

`$ npm install`

## Ejecución

Primero debe configurar sus variables de entorno en el archivo .env

`$ npm run build`

`$ npm run start:prod`

Espere mientras los archivos son descargados.

## Limitantes

Tenga en cuenta que al descargar datos de 5 días, este proceso puede llegar a consumir como máximo 7 GB de memoria RAM dependiendo del tamaño de datos de la descarga.
