package com.tienda.backend.repository;

import com.tienda.backend.model.Deudor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeudorRepository extends JpaRepository<Deudor, Long> {
}