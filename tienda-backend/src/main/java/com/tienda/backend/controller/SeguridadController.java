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
    private com.tienda.backend.model.EmailService emailService;

    @Autowired
    private ConfiguracionRepository configRepo;

    // Función auxiliar para obtener siempre la configuración de la BD (fila 1)
    // Función auxiliar BLINDADA para obtener siempre la configuración de la BD
    private Configuracion getConfiguracion() {
        return configRepo.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Configuración no encontrada"));
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

        // <-- NUEVA LÍNEA: Guardamos la contraseña desde el inicio -->
        config.setPasswordCorreo(datos.get("passwordCorreo"));

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

        // 2. Enviamos el correo usando el SERVICIO NUEVO
        new Thread(() -> {
            String mensajeTexto = "Hola,\n\n" +
                    "El PIN de acceso al sistema ha sido modificado exitosamente.\n\n" +
                    "Nuevo PIN: " + pinNuevo + "\n" +
                    "Fecha del cambio: " + LocalDateTime.now() + "\n\n" +
                    "Si no fuiste tú, contacta a soporte técnico.";

            emailService.enviarAlerta(mensajeTexto);
        }).start();

        return ResponseEntity.ok(java.util.Collections.singletonMap("mensaje", "PIN actualizado con éxito. Revisa tu correo."));
    }


    @PostMapping("/actualizar-correo")
    public ResponseEntity<?> actualizarCorreo(@RequestBody Map<String, String> datos) {
        Configuracion config = getConfiguracion();
        String nuevoCorreo = datos.get("correo");
        String nuevaPassword = datos.get("password"); // <-- Capturamos la clave de 16 dígitos

        if (nuevoCorreo == null || !nuevoCorreo.contains("@")) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", "Formato de correo inválido."));
        }

        config.setCorreoAlertas(nuevoCorreo);

        // Si el usuario escribió algo en el campo de contraseña, lo guardamos
        if (nuevaPassword != null && !nuevaPassword.trim().isEmpty()) {
            config.setPasswordCorreo(nuevaPassword);
        }

        configRepo.save(config); // <-- Esto es lo que quita el [null] de pgAdmin

        return ResponseEntity.ok(java.util.Collections.singletonMap("mensaje", "Configuración de alertas actualizada exitosamente."));
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