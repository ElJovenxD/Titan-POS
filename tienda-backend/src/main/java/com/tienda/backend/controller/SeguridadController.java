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

    // --- NUEVO: ASISTENTE DE CONFIGURACIÓN INICIAL ---
    @GetMapping("/estado")
    public boolean verificarEstado() {
        // Si hay más de 0 filas en la tabla, significa que ya se configuró
        return configRepo.count() > 0;
    }

    @PostMapping("/inicial")
    public ResponseEntity<?> configuracionInicial(@RequestBody Map<String, String> datos) {
        if (configRepo.count() > 0) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", "El sistema ya está configurado."));
        }

        Configuracion config = new Configuracion();
        config.setNombreTienda(datos.get("nombreTienda"));
        config.setPinActual(datos.get("pinActual"));
        config.setCorreoAlertas(datos.get("correoAlertas"));
        config.setIconoTienda("🏪"); // Valores por defecto
        config.setTema("oscuro");
        config.setColorPrincipal("success");

        configRepo.save(config);
        return ResponseEntity.ok(java.util.Collections.singletonMap("mensaje", "¡Sistema configurado con éxito!"));
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

        // 1. Guardamos el nuevo PIN
        config.setPinActual(pinNuevo);
        configRepo.save(config);

        new Thread(() -> {
            enviarCorreoAlerta(pinNuevo, config.getCorreoAlertas());
        }).start();

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
        // Validación extra: Si no hay correo, no intentamos enviar para evitar errores
        if (correoDestino == null || correoDestino.isEmpty()) {
            System.out.println("No hay correo configurado para enviar la alerta.");
            return;
        }

        try {
            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setTo(correoDestino);
            mensaje.setSubject("🚨 ALERTA: Cambio de PIN en " + getConfiguracion().getNombreTienda());
            mensaje.setText("Hola,\n\n" +
                    "El PIN de acceso al sistema ha sido modificado exitosamente.\n\n" +
                    "Nuevo PIN: " + nuevoPin + "\n" +
                    "Fecha del cambio: " + LocalDateTime.now() + "\n\n" +
                    "Si no fuiste tú, contacta a soporte técnico.");

            mailSender.send(mensaje);
        } catch (Exception e) {
            System.err.println("Error al enviar correo: " + e.getMessage());
        }
    }

    // --- OBTENER TODA LA CONFIGURACIÓN ---
    @GetMapping("/obtener")
    public ResponseEntity<?> obtenerConfiguracion() {
        Configuracion config = getConfiguracion();
        return ResponseEntity.ok(Map.of(
                "nombreTienda", config.getNombreTienda() != null ? config.getNombreTienda() : "Los Chilangos",
                "correoAlertas", config.getCorreoAlertas(),
                "iconoTienda", config.getIconoTienda() != null ? config.getIconoTienda() : "🏪",
                "tema", config.getTema() != null ? config.getTema() : "oscuro",
                "colorPrincipal", config.getColorPrincipal() != null ? config.getColorPrincipal() : "success"
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

    // --- NUEVO: ACTUALIZAR APARIENCIA ---
    @PostMapping("/actualizar-apariencia")
    public ResponseEntity<?> actualizarApariencia(@RequestBody Map<String, String> datos) {
        System.out.println("¡SÍ LLEGÓ A JAVA! Color pedido: " + datos.get("colorPrincipal"));

        Configuracion config = getConfiguracion();
        config.setTema(datos.get("tema"));
        config.setColorPrincipal(datos.get("colorPrincipal"));
        configRepo.save(config);

        return ResponseEntity.ok(java.util.Collections.singletonMap("mensaje", "Apariencia actualizada correctamente."));
    }
}