package com.tienda.backend.repository;

import com.tienda.backend.model.VentaDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VentaDetalleRepository extends JpaRepository<VentaDetalle, Long> {
    List<VentaDetalle> findByVentaId(Long ventaId); // Esto servirá para el Modal
}