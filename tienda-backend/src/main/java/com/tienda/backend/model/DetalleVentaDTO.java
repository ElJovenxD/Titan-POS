package com.tienda.backend.model;

import lombok.Data;

@Data
public class DetalleVentaDTO {
    private Long productoId;
    private Integer cantidad;
    // No necesitamos el precio aquí, tu VentaController es seguro y
    // lo saca directamente de la base de datos.
}