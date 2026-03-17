package com.tienda.backend.controller;

import com.tienda.backend.model.Deudor;
import com.tienda.backend.repository.DeudorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deudores")
@CrossOrigin(origins = "*")
public class DeudorController {

    @Autowired
    private DeudorRepository deudorRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate; // IMPORTANTE: Para manejar la tabla de historial

    /**
     * Obtiene la lista de todos los deudores
     */
    @GetMapping
    public List<Deudor> obtenerTodos() {
        return deudorRepository.findAll();
    }

    /**
     * Registra un nuevo cliente en el libro de deudas
     */
    @PostMapping
    public Deudor crearDeudor(@RequestBody Deudor deudor) {
        deudor.setUltimaActividad(LocalDateTime.now());
        if (deudor.getTotalDeuda() == null) deudor.setTotalDeuda(0.0);
        return deudorRepository.save(deudor);
    }

    /**
     * Registra un movimiento (Abono o Compra) y lo guarda en el historial
     */
    @PostMapping("/{id}/movimiento")
    public Deudor registrarMovimiento(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Deudor deudor = deudorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        Double monto = Double.parseDouble(payload.get("monto").toString());
        String tipo = payload.get("tipo").toString(); // "ABONO" o "COMPRA"

        // 1. Actualizar el saldo en la cuenta del cliente
        if ("ABONO".equalsIgnoreCase(tipo)) {
            deudor.setTotalDeuda(deudor.getTotalDeuda() - monto);
        } else {
            deudor.setTotalDeuda(deudor.getTotalDeuda() + monto);
        }

        deudor.setUltimaActividad(LocalDateTime.now());
        Deudor actualizado = deudorRepository.save(deudor);

        // 2. Guardar el registro en la tabla de historial (abonos_deuda)
        // Asegúrate de que los nombres de las columnas coincidan con tu SQL
        String sql = "INSERT INTO abonos_deuda (deudor_id, monto, tipo, fecha) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, id, monto, tipo.toUpperCase(), LocalDateTime.now());

        return actualizado;
    }

    /**
     * Obtiene el historial detallado de movimientos de un cliente
     */
    @GetMapping("/{id}/historial")
    public List<Map<String, Object>> obtenerHistorial(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int offset // <-- Nuevo parámetro
    ) {
        // Traemos de 10 en 10
        String sql = "SELECT monto, fecha, tipo FROM abonos_deuda " +
                "WHERE deudor_id = ? " +
                "ORDER BY fecha DESC " +
                "LIMIT 15 OFFSET ?";

        return jdbcTemplate.queryForList(sql, id, offset);
    }

    /**
     * Elimina a un cliente (por si se liquidó la cuenta o error de dedo)
     */
    @DeleteMapping("/{id}")
    public void eliminarDeudor(@PathVariable Long id) {
        deudorRepository.deleteById(id);
    }
}