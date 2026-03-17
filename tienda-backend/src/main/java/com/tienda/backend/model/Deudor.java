package com.tienda.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "deudores")
@Data
public class Deudor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_cliente")
    private String nombreCliente;

    @Column(name = "total_deuda")
    private Double totalDeuda;

    @Column(name = "ultima_actividad")
    private LocalDateTime ultimaActividad;

    private String telefono;

    public Deudor() {
        this.totalDeuda = 0.0;
        this.ultimaActividad = LocalDateTime.now();
    }
}