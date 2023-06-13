-- Escribe tus querys acá

-- Se requiere el correo de todos los clientes 
-- que hayan comprado más de un informe 
-- a la vez mediante la pasarela de pago 'transbank'.

-- CONSIDERANDO TABLA INTERMEDIA
SELECT C.CORREO
FROM PAGOS P
JOIN INFORMES I ON P.ID_INFORME = I.ID_INFORME
JOIN INFORMES_X_CLIENTE IXC ON IXC.ID_INFORME = I.ID_INFORME
JOIN CLIENTES C ON IXC.ID_CLIENTE = C.ID_CLIENTE
-- mejor por id
WHERE PP.NOMBRE LIKE 'transbank' 
GROUP BY C.CORREO
HAVING COUNT(*) >= 2;
--
-- SELECT C.CORREO 
-- FROM PAGOS P
-- JOIN INFORMES I ON P.ID_INFORME = I.ID
-- JOIN CLIENTES C ON P.I.ID_CLIENTE = C.ID
-- JOIN PASARELA_PAGO PP ON P.ID_PASARELA_PAGO = PP.ID
-- WHERE PP.NOMBRE LIKE 'transbank' 


--Devuelve todos los informes comprados que han sido entregados 
--al cliente juan_daniel@gmail.com **sin utilizar JOIN**

-- ids informes comprados
CREATE TEMPORARY TABLE temp_ids (ID_INFORME INT);

-- OBTENGO ID DE CLIENTE CON DETERMINADO EMAIL
DECLARE @specificID INT;

SELECT @specificID = C.ID
FROM CLIENTES C
WHERE C.CORREO LIKE 'juan_daniel@gmail.com';

INSERT INTO temp_ids (ID_INFORME)
SELECT P.ID_INFORME, P.ID_CLIENTE
FROM PAGOS P
WHERE P.ID_CLIENTE = @specificID;

-- consulto los informes comprados del cliente juan_daniel@gmail.com
SELECT *
FROM INFORMES
WHERE ID_INFORME IN (SELECT ID_INFORME AS 'ID' FROM temp_ids);
