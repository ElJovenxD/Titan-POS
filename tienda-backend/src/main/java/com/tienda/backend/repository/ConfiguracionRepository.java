package com.tienda.backend.repository;

import com.tienda.backend.model.Configuracion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConfiguracionRepository extends JpaRepository<Configuracion, Long> {
}