-- Escribe tus querys acá

-- Se requiere el correo de todos los clientes 
-- que hayan comprado más de un informe 
-- a la vez mediante la pasarela de pago 'transbank'.
SELECT C.CORREO 
FROM PAGOS P
JOIN INFORMES I ON P.ID_INFORME = I.ID_INFORME
JOIN CLIENTES C ON I.ID_CLIENTE = C.ID_CLIENTE
JOIN PASARELAS_PAGO PP ON P.ID_PASARELA_PAGO = PP.ID_PASARELA_PAGO
WHERE PP.NOMBRE LIKE 'transbank'
GROUP BY C.CORREO
HAVING COUNT(*) >= 2;

--Devuelve todos los informes comprados que han sido entregados 
--al cliente juan_daniel@gmail.com **sin utilizar JOIN**

CREATE TEMPORARY TABLE temp_informes_ids (ID_INFORME INT);
DECLARE @specificID INT;

SELECT @specificID = C.ID
FROM CLIENTES C
WHERE C.CORREO LIKE 'juan_daniel@gmail.com';

INSERT INTO temp_informes_ids (ID_INFORME)
SELECT P.ID_INFORME
FROM PAGOS P
WHERE P.ID_CLIENTE = @specificID;

-- consulto los informes comprados del cliente juan_daniel@gmail.com
SELECT I.ID_INFORME, I.FECHA_EMISION, I.ID_CLIENTE, I.ID_VEHICULO, I.PRECIO
FROM INFORMES I
WHERE I.ID_INFORME IN (SELECT ID_INFORME FROM temp_informes_ids);

-- se podria acceder al historial de motivos del vehiculo incluidos hasta ese momento en el informe
-- tabla: HISTORIAL_MOTIVOS_VEHICULO_X_INFORME
