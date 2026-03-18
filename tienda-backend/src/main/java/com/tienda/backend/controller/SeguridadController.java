package com.tienda.backend.controller;

import com.tienda.backend.model.Configuracion;
import com.tienda.backend.repository.ConfiguracionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/seguridad")
@CrossOrigin(origins = "*")
public class SeguridadController {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private ConfiguracionRepository configRepo;

    // Función auxiliar para obtener siempre la configuración de la BD (fila 1)
    private Configuracion getConfiguracion() {
        return configRepo.findById(1L).orElseThrow(() -> new RuntimeException("Configuración no encontrada"));
    }

    @PostMapping("/verificar")
    public boolean verificarPin(@RequestBody Map<String, String> payload) {
        Configuracion config = getConfiguracion();
        return config.getPinActual().equals(payload.get("pin"));
    }

    @PostMapping("/cambiar-pin")
    public ResponseEntity<?> cambiarPin(@RequestBody Map<String, String> datos) {
        Configuracion config = getConfiguracion();
        String pinActualIngresado = datos.get("pinActual");
        String pinNuevo = datos.get("pinNuevo");

        if (!config.getPinActual().equals(pinActualIngresado)) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", "El PIN actual es incorrecto."));
        }
        if (pinNuevo == null || pinNuevo.length() != 4) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", "El nuevo PIN debe tener 4 dígitos."));
        }

        // Actualizamos y GUARDAMOS en la Base de Datos
        config.setPinActual(pinNuevo);
        configRepo.save(config);

        enviarCorreoAlerta(pinNuevo, config.getCorreoAlertas());

        return ResponseEntity.ok(java.util.Collections.singletonMap("mensaje", "PIN actualizado con éxito. Revisa tu correo."));
    }

    @PostMapping("/actualizar-correo")
    public ResponseEntity<?> actualizarCorreo(@RequestBody Map<String, String> datos) {
        Configuracion config = getConfiguracion();
        String nuevoCorreo = datos.get("correo");

        if (nuevoCorreo == null || !nuevoCorreo.contains("@")) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", "Formato de correo inválido."));
        }

        // Actualizamos y GUARDAMOS en la Base de Datos
        config.setCorreoAlertas(nuevoCorreo);
        configRepo.save(config);

        return ResponseEntity.ok(java.util.Collections.singletonMap("mensaje", "Correo de alertas actualizado a: " + nuevoCorreo));
    }

    private void enviarCorreoAlerta(String nuevoPin, String correoDestino) {
        try {
            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setTo(correoDestino);
            mensaje.setSubject("🚨 ALERTA: Cambio de PIN en Los Chilangos");
            mensaje.setText("Hola,\n\n" +
                    "El PIN de acceso al sistema de Punto de Venta ha sido modificado el " + LocalDateTime.now() + ".\n\n" +
                    "El nuevo PIN de seguridad es: " + nuevoPin + "\n\n" +
                    "Si tú no hiciste este cambio, revisa el sistema inmediatamente.");

            mailSender.send(mensaje);
        } catch (Exception e) {
            System.out.println("No se pudo enviar el correo de alerta: " + e.getMessage());
        }
    }

    // --- OBTENER TODA LA CONFIGURACIÓN ---
    @GetMapping("/obtener")
    public ResponseEntity<?> obtenerConfiguracion() {
        Configuracion config = getConfiguracion();
        return ResponseEntity.ok(Map.of(
                "nombreTienda", config.getNombreTienda() != null ? config.getNombreTienda() : "Los Chilangos",
                "correoAlertas", config.getCorreoAlertas(),
                "iconoTienda", config.getIconoTienda() != null ? config.getIconoTienda() : "🏪"
        ));
    }

    // --- ACTUALIZAR DATOS DEL NEGOCIO ---
    @PostMapping("/actualizar-negocio")
    public ResponseEntity<?> actualizarNegocio(@RequestBody Map<String, String> datos) {
        Configuracion config = getConfiguracion();
        String nuevoNombre = datos.get("nombreTienda");
        String nuevoIcono = datos.get("iconoTienda"); // <-- Atrapamos el ícono

        if (nuevoNombre == null || nuevoNombre.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", "El nombre no puede estar vacío."));
        }

        config.setNombreTienda(nuevoNombre);
        config.setIconoTienda(nuevoIcono != null ? nuevoIcono : "🏪"); // <-- Lo guardamos
        configRepo.save(config);

        return ResponseEntity.ok(java.util.Collections.singletonMap("mensaje", "Datos del negocio actualizados."));
    }
}